
import { useState, useEffect } from "react";
import { getCurrentMonth, getMonthlyAnalytics, setCurrentMonth } from "@/lib/supabaseStore";
import IncomeForm from "@/components/IncomeForm";
import CategoryList from "@/components/CategoryList";
import BudgetHeader from "@/components/BudgetHeader";

export default function BudgetTracker() {
  const [currentMonth, setCurrentMonthState] = useState(getCurrentMonth());
  const [analytics, setAnalytics] = useState({
    income: 0,
    actualIncome: 0,
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0,
    categories: [],
    needsAllocation: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const analyticsData = await getMonthlyAnalytics(currentMonth);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentMonth]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    setCurrentMonthState(month);
  };

  const handleDataUpdate = async () => {
    try {
      const analyticsData = await getMonthlyAnalytics(currentMonth);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BudgetHeader 
        currentMonth={currentMonth}
        setCurrentMonth={handleMonthChange}
        analytics={analytics}
      />
      
      <div className="space-y-6">
        <IncomeForm 
          currentMonth={currentMonth}
          income={analytics.income}
          onIncomeChange={handleDataUpdate}
        />
        
        <CategoryList 
          currentMonth={currentMonth}
          categories={analytics.categories}
          onUpdate={handleDataUpdate}
        />
      </div>
    </div>
  );
}
