
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryType, SubcategoryType } from "@/lib/types";
import { CategoryBarChart, BudgetPieChart } from "./BudgetCharts";

interface BudgetSummaryProps {
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
  totalBudgeted: number;
  totalSpent: number;
}

export default function BudgetSummary({ categories, totalBudgeted, totalSpent }: BudgetSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Budget by Category</CardTitle>
          <CardDescription>Compare budgeted vs actual spending</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            <CategoryBarChart categories={categories} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Budget Allocation</CardTitle>
          <CardDescription>How your budget is distributed</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            <BudgetPieChart categories={categories} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
