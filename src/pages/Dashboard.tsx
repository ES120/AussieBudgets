
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { getCurrentMonth, getMonthlyAnalytics } from "@/lib/store";
import BudgetSummary from "@/components/BudgetSummary";
import { CategoryBarChart, BudgetPieChart } from "@/components/BudgetCharts";
import BudgetHeader from "@/components/BudgetHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const { data: monthlyBudget, isLoading } = useQuery({
    queryKey: ['monthly-budget', currentMonth],
    queryFn: () => supabaseService.getMonthlyBudget(currentMonth),
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions', currentMonth],
    queryFn: () => supabaseService.getTransactions(currentMonth),
  });

  const analytics = getMonthlyAnalytics(currentMonth);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BudgetHeader 
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        analytics={analytics}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <BudgetSummary 
          categories={analytics.categories}
          totalBudgeted={analytics.totalBudgeted}
          totalSpent={analytics.totalSpent}
        />
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Budget by Category</CardTitle>
              <CardDescription>Compare budgeted vs actual spending</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <CategoryBarChart categories={analytics.categories} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
