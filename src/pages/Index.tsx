
import { useState, useEffect } from "react";
import BudgetHeader from "@/components/BudgetHeader";
import { getCurrentMonth, getMonthlyAnalytics, getTransactions, setCurrentMonth } from "@/lib/supabaseStore";
import IncomeForm from "@/components/IncomeForm";
import CategoryList from "@/components/CategoryList";
import TransactionList from "@/components/TransactionList";
import BudgetSummary from "@/components/BudgetSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Index() {
  const [currentMonth, setCurrentMonthState] = useState(getCurrentMonth());
  const [analytics, setAnalytics] = useState({
    income: 0,
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0,
    categories: []
  });
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("budget");
  const [loading, setLoading] = useState(true);

  // Update data when month changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [analyticsData, transactionsData] = await Promise.all([
          getMonthlyAnalytics(currentMonth),
          getTransactions(currentMonth)
        ]);
        setAnalytics(analyticsData);
        setTransactions(transactionsData);
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
      const [analyticsData, transactionsData] = await Promise.all([
        getMonthlyAnalytics(currentMonth),
        getTransactions(currentMonth)
      ]);
      setAnalytics(analyticsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading your budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BudgetHeader 
        currentMonth={currentMonth}
        setCurrentMonth={handleMonthChange}
        analytics={analytics}
      />
      
      <div className="container max-w-5xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="budget" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="budget" className="space-y-6 animate-fade-in">
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
          </TabsContent>
          
          <TabsContent value="transactions" className="animate-fade-in">
            <TransactionList 
              currentMonth={currentMonth}
              transactions={transactions}
              onUpdate={handleDataUpdate}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="animate-fade-in">
            <BudgetSummary 
              categories={analytics.categories}
              totalBudgeted={analytics.totalBudgeted}
              totalSpent={analytics.totalSpent}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
