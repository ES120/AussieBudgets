
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { getCurrentMonth, getMonthlyAnalytics } from "@/lib/store";
import BudgetHeader from "@/components/BudgetHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, DollarSign } from "lucide-react";

export default function Milestones() {
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalBudgeted.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Monthly budget target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.remaining.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Amount remaining this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievement</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((analytics.totalSpent / analytics.totalBudgeted) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Budget utilization</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
