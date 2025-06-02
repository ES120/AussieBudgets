
import { useState } from "react";
import { CategoryType, SubcategoryType } from "@/lib/types";
import { Accordion } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CategoryDialog from "./CategoryDialog";
import CategoryItem from "./CategoryItem";

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
  const [editCategory, setEditCategory] = useState<CategoryType | null>(null);

  const handleEditCategory = (category: CategoryType) => {
    setEditCategory(category);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Budget Categories</h2>
        <CategoryDialog 
          currentMonth={currentMonth}
          editCategory={editCategory}
          setEditCategory={setEditCategory}
          onUpdate={onUpdate}
        />
      </div>
      
      {categories.length === 0 ? (
        <Alert>
          <AlertDescription>
            You don't have any budget categories yet. Add a category to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              currentMonth={currentMonth}
              category={category}
              onEdit={handleEditCategory}
              onUpdate={onUpdate}
            />
          ))}
        </Accordion>
      )}
    </div>
  );
}
