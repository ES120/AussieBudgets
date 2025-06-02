
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { CategoryType, SubcategoryType } from "@/lib/types";

interface SpendingBreakdownProps {
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
}

type ExtendedSubcategory = SubcategoryType & { 
  spent: number; 
  remaining: number;
  status: "under" | "warning" | "over" | "neutral";
  categoryName: string;
  categoryColor: string;
};

export default function SpendingBreakdown({ categories }: SpendingBreakdownProps) {
  // Flatten all subcategories with their spending data
  const allSubcategories: ExtendedSubcategory[] = categories.flatMap(category => 
    category.subcategories.map(subcategory => ({
      ...subcategory,
      categoryName: category.name,
      categoryColor: getStatusColor(subcategory.status)
    }))
  );

  // Sort subcategories by amount spent (descending)
  const sortedSubcategories = allSubcategories
    .filter(sub => sub.spent > 0 || sub.budgeted > 0)
    .sort((a, b) => b.spent - a.spent);

  function getStatusColor(status: "under" | "warning" | "over" | "neutral") {
    switch (status) {
      case "over":
        return "bg-red-600";
      case "warning":
        return "bg-budget-warning";
      case "under":
        return "bg-green-700";
      default:
        return "bg-budget-neutral";
    }
  }

  function getProgressPercentage(spent: number, budgeted: number) {
    if (budgeted === 0) return 0;
    return Math.min((spent / budgeted) * 100, 100);
  }

  function getProgressBarColor(status: "under" | "warning" | "over" | "neutral") {
    switch (status) {
      case "over":
        return "bg-red-600";
      case "warning":
        return "bg-budget-warning";
      case "under":
        return "bg-green-700";
      default:
        return "bg-budget-neutral";
    }
  }

  if (sortedSubcategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No spending data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Spending Breakdown by Subcategory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedSubcategories.map((subcategory) => (
          <div key={subcategory.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${subcategory.categoryColor}`} />
                <div>
                  <p className="font-medium text-sm">{subcategory.name}</p>
                  <p className="text-xs text-muted-foreground">{subcategory.categoryName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{formatCurrency(subcategory.spent)}</p>
                <p className="text-xs text-muted-foreground">
                  of {formatCurrency(subcategory.budgeted)}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getProgressBarColor(subcategory.status)}`}
                style={{ width: `${Math.min(getProgressPercentage(subcategory.spent, subcategory.budgeted), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {getProgressPercentage(subcategory.spent, subcategory.budgeted).toFixed(1)}% used
              </span>
              <span className={subcategory.remaining >= 0 ? 'text-green-700' : 'text-red-600'}>
                {formatCurrency(subcategory.remaining)} remaining
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
