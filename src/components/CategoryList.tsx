import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryType, SubcategoryType } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency, generateId } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import SubcategoryItem from "./SubcategoryItem";
interface CategoryListProps {
  currentMonth: string;
  categories: Array<CategoryType & {
    totalBudgeted: number;
    totalSpent: number;
    remaining: number;
    subcategories: Array<SubcategoryType & {
      spent: number;
      remaining: number;
      status: "under" | "warning" | "over" | "neutral";
    }>;
  }>;
  onUpdate: () => void;
}
export default function CategoryList({
  currentMonth,
  categories,
  onUpdate
}: CategoryListProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategory, setEditCategory] = useState<CategoryType | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    toast
  } = useToast();
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      await supabaseService.createCategory(newCategoryName.trim());
      setNewCategoryName("");
      setCategoryDialogOpen(false);
      onUpdate();
      toast({
        title: "Category Added",
        description: `${newCategoryName.trim()} has been added to your budget.`
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const handleUpdateCategory = async () => {
    if (!editCategory || !editCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      await supabaseService.updateCategory(editCategory);
      setEditCategory(null);
      setCategoryDialogOpen(false);
      onUpdate();
      toast({
        title: "Category Updated",
        description: `Category has been renamed successfully.`
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await supabaseService.deleteCategory(categoryId);
      onUpdate();
      toast({
        title: "Category Deleted",
        description: "Category and all its subcategories have been removed."
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Budget Categories</h2>
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {editCategory ? "Update the name of this category." : "Create a new budget category to organize your subcategories."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input id="categoryName" value={editCategory ? editCategory.name : newCategoryName} onChange={e => editCategory ? setEditCategory({
              ...editCategory,
              name: e.target.value
            }) : setNewCategoryName(e.target.value)} className="mt-2" placeholder="e.g., Housing, Transportation, Food" disabled={saving} />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
              setCategoryDialogOpen(false);
              setEditCategory(null);
              setNewCategoryName("");
            }} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={editCategory ? handleUpdateCategory : handleAddCategory} disabled={saving}>
                {saving ? "Saving..." : editCategory ? "Save Changes" : "Add Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {categories.length === 0 ? <Alert>
          <AlertDescription>
            You don't have any budget categories yet. Add a category to get started.
          </AlertDescription>
        </Alert> : <Accordion type="multiple" className="space-y-4">
          {categories.map(category => <AccordionItem key={category.id} value={category.id} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-white/[0.31]">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center">
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(category.totalSpent)} of {formatCurrency(category.totalBudgeted)}
                      </div>
                      
                      <div className={`text-sm font-medium ${category.remaining >= 0 ? 'text-budget-under' : 'text-budget-over'}`}>
                        {formatCurrency(category.remaining)} remaining
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={e => {
                  e.stopPropagation();
                  setEditCategory(category);
                  setCategoryDialogOpen(true);
                }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={e => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this category? All subcategories will be removed.")) {
                    handleDeleteCategory(category.id);
                  }
                }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 py-2">
                <div className="space-y-3">
                  <SubcategoryItem currentMonth={currentMonth} categoryId={category.id} subcategories={category.subcategories} onUpdate={onUpdate} />
                </div>
              </AccordionContent>
            </AccordionItem>)}
        </Accordion>}
    </div>;
}