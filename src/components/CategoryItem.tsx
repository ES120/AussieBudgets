
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CategoryType, SubcategoryType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { supabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import SubcategoryItem from "./SubcategoryItem";

interface CategoryItemProps {
  currentMonth: string;
  category: CategoryType & {
    totalBudgeted: number;
    totalSpent: number;
    remaining: number;
    subcategories: Array<SubcategoryType & {
      spent: number;
      remaining: number;
      status: "under" | "warning" | "over" | "neutral";
    }>;
  };
  onEdit: (category: CategoryType) => void;
  onUpdate: () => void;
}

export default function CategoryItem({
  currentMonth,
  category,
  onEdit,
  onUpdate
}: CategoryItemProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteCategory = async () => {
    try {
      await supabaseService.deleteCategory(category.id);
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
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Edit button clicked for category:', category);
    onEdit(category);
  };

  const isOverBudget = category.remaining < 0;
  const displayAmount = Math.abs(category.remaining);
  const displayText = isOverBudget ? "overspent" : "remaining";

  return (
    <AccordionItem value={category.id} className="border rounded-lg overflow-hidden bg-white">
      <AccordionTrigger className="px-4 py-3 hover:no-underline bg-white">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">{category.name}</span>
            {category.milestone_id && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Milestone Goal
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Budget: {formatCurrency(category.budgeted)}
              </div>
              <div className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-700'}`}>
                {formatCurrency(displayAmount)} {displayText}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
              </Button>
              
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the "{category.name}" category and all its subcategories.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 py-2 bg-white">
        <div className="space-y-3">
          <SubcategoryItem 
            currentMonth={currentMonth} 
            categoryId={category.id} 
            subcategories={category.subcategories} 
            onUpdate={onUpdate} 
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
