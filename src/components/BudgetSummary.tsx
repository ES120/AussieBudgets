
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryType, SubcategoryType } from "@/lib/types";
import { CategoryBarChart, BudgetPieChart } from "./BudgetCharts";
import { formatCurrency } from "@/lib/utils";

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

export default function BudgetSummary({
  categories,
  totalBudgeted,
  totalSpent
}: BudgetSummaryProps) {
  const totalRemaining = totalBudgeted - totalSpent;
  const spendingPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Budget Summary</CardTitle>
        <CardDescription>Overview of your monthly budget performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Budgeted</p>
            <p className="text-lg font-semibold">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="text-lg font-semibold">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-lg font-semibold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        </div>
        
        <div className="pt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Spending Progress</span>
            <span>{spendingPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                spendingPercentage > 100 ? 'bg-red-500' : 
                spendingPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-2">Category Breakdown</h4>
            <div className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <div key={category.id} className="flex justify-between items-center text-sm">
                  <span>{category.name}</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(category.totalSpent)}</span>
                    <span className="text-muted-foreground"> / {formatCurrency(category.totalBudgeted)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
