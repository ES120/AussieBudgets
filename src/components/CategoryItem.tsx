
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Trash2 } from "lucide-react";
import { CategoryType, SubcategoryType } from "@/lib/types";
import { supabaseService } from "@/services/supabaseService";
import { formatCurrency, getProgressBarColor } from "@/lib/utils";
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

export default function CategoryItem({ currentMonth, category, onEdit, onUpdate }: CategoryItemProps) {
  const { toast } = useToast();

  const handleDeleteCategory = async () => {
    if (!confirm("Are you sure you want to delete this category? This will also delete all subcategories.")) {
      return;
    }
    
    try {
      await supabaseService.deleteCategory(category.id);
      onUpdate();
      
      toast({
        title: "Category Deleted",
        description: "Category and all subcategories have been removed."
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const percentUsed = category.totalBudgeted > 0 
    ? Math.min((category.totalSpent / category.totalBudgeted) * 100, 100)
    : 0;

  const isOverBudget = category.remaining < 0;
  const displayAmount = Math.abs(category.remaining);
  const displayText = isOverBudget ? "overspent" : "remaining";

  return (
    <AccordionItem value={category.id} className="border rounded-lg">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex justify-between items-center w-full">
          <div className="text-left">
            <h3 className="font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(category.totalSpent)} of {formatCurrency(category.totalBudgeted)} 
              {category.totalBudgeted > 0 && ` (${Math.round(percentUsed)}%)`}
            </p>
          </div>
          
          <div className="flex items-center gap-2 mr-2">
            <div className="text-right">
              <p className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-700'}`}>
                {formatCurrency(displayAmount)} {displayText}
              </p>
            </div>
            
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onEdit(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDeleteCategory}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 pb-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverBudget ? 'bg-red-500' : 
                percentUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>
        </div>
        
        <SubcategoryItem 
          currentMonth={currentMonth}
          categoryId={category.id}
          categoryBudget={category.totalBudgeted}
          subcategories={category.subcategories}
          onUpdate={onUpdate}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
