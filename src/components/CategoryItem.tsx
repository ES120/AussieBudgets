
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CategoryType, SubcategoryType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { supabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import SubcategoryItem from "./SubcategoryItem";
import CategoryDeleteDialog from "./CategoryDeleteDialog";

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
        description: "Category and all its related data have been removed."
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
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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

      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoryName={category.name}
        categoryId={category.id}
        onConfirmDelete={handleDeleteCategory}
      />
    </AccordionItem>
  );
}
