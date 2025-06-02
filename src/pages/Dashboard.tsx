
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { getCurrentMonth, getMonthlyAnalytics } from "@/lib/store";
import BudgetSummary from "@/components/BudgetSummary";
import BudgetCharts from "@/components/BudgetCharts";
import BudgetHeader from "@/components/BudgetHeader";

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

  const analytics = getMonthlyAnalytics(monthlyBudget, transactions || []);

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
        <BudgetSummary analytics={analytics} />
        <BudgetCharts analytics={analytics} />
      </div>
    </div>
  );
}
