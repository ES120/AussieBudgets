
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { getCurrentMonth, getMonthlyAnalytics } from "@/lib/store";
import TransactionList from "@/components/TransactionList";
import BudgetHeader from "@/components/BudgetHeader";

export default function Transactions() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const { data: monthlyBudget, isLoading } = useQuery({
    queryKey: ['monthly-budget', currentMonth],
    queryFn: () => supabaseService.getMonthlyBudget(currentMonth),
  });

  const { data: transactions, refetch } = useQuery({
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
      
      <TransactionList 
        transactions={transactions || []} 
        currentMonth={currentMonth}
        onUpdate={() => refetch()}
      />
    </div>
  );
}
