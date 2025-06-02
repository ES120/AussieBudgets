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
export default function BudgetSummary({
  categories,
  totalBudgeted,
  totalSpent
}: BudgetSummaryProps) {
  return;
}