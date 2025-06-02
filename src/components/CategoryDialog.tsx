import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { CategoryType } from "@/lib/types";
import { supabaseService } from "@/services/supabaseService";
import { updateCategoryMonthlyBudget } from "@/lib/supabaseStore";
import { useToast } from "@/hooks/use-toast";

interface CategoryDialogProps {
  currentMonth: string;
  editCategory: CategoryType | null;
  setEditCategory: (category: CategoryType | null) => void;
  onUpdate: () => void;
}

const CATEGORY_EXAMPLES = ["Wants", "Needs", "Bills", "Savings", "Transportation", "Food", "Housing"];

export default function CategoryDialog({
  currentMonth,
  editCategory,
  setEditCategory,
  onUpdate
}: CategoryDialogProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Open dialog when editCategory is set
  useEffect(() => {
    if (editCategory) {
      console.log('Opening edit dialog for category:', editCategory);
      setCategoryDialogOpen(true);
    }
  }, [editCategory]);

  // Set a random example category name when dialog opens for new category
  useEffect(() => {
    if (categoryDialogOpen && !editCategory && !newCategoryName) {
      const randomExample = CATEGORY_EXAMPLES[Math.floor(Math.random() * CATEGORY_EXAMPLES.length)];
      setNewCategoryName(randomExample);
    }
  }, [categoryDialogOpen, editCategory, newCategoryName]);

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
      const category = await supabaseService.createCategory(newCategoryName.trim(), parseFloat(newCategoryBudget) || 0);
      
      // Set the monthly budget for this category
      if (parseFloat(newCategoryBudget) > 0) {
        await updateCategoryMonthlyBudget(category.id, currentMonth, parseFloat(newCategoryBudget));
      }
      
      setNewCategoryName("");
      setNewCategoryBudget("");
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
      
      // Update the monthly budget for this category
      await updateCategoryMonthlyBudget(editCategory.id, currentMonth, editCategory.budgeted);
      
      setEditCategory(null);
      setCategoryDialogOpen(false);
      onUpdate();
      toast({
        title: "Category Updated",
        description: `Category has been updated successfully.`
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

  const resetDialogState = () => {
    setEditCategory(null);
    setNewCategoryName("");
    setNewCategoryBudget("");
  };

  return (
    <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
      setCategoryDialogOpen(open);
      if (!open) resetDialogState();
    }}>
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
            {editCategory 
              ? "Update the details of this category." 
              : "Create a new budget category to organize your subcategories."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input 
              id="categoryName" 
              value={editCategory ? editCategory.name : newCategoryName} 
              onChange={(e) => editCategory ? setEditCategory({
                ...editCategory,
                name: e.target.value
              }) : setNewCategoryName(e.target.value)} 
              className="mt-2" 
              placeholder="e.g., Wants, Needs, Bills" 
              disabled={saving} 
            />
          </div>
          
          <div>
            <Label htmlFor="categoryBudget">Category Budget for {currentMonth}</Label>
            <Input 
              id="categoryBudget" 
              type="number" 
              min="0" 
              step="0.01" 
              value={editCategory 
                ? editCategory.budgeted.toString() 
                : newCategoryBudget
              } 
              onChange={(e) => editCategory ? setEditCategory({
                ...editCategory,
                budgeted: parseFloat(e.target.value) || 0
              }) : setNewCategoryBudget(e.target.value)} 
              className="mt-2" 
              placeholder="0.00" 
              disabled={saving} 
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setCategoryDialogOpen(false);
            resetDialogState();
          }} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={editCategory ? handleUpdateCategory : handleAddCategory} disabled={saving}>
            {saving ? "Saving..." : (editCategory ? "Save Changes" : "Add Category")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
