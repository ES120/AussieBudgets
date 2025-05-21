
import { useState, useEffect } from "react";
import BudgetHeader from "@/components/BudgetHeader";
import { getCurrentMonth, getMonthlyAnalytics, getTransactions, setCurrentMonth } from "@/lib/store";
import IncomeForm from "@/components/IncomeForm";
import CategoryList from "@/components/CategoryList";
import TransactionList from "@/components/TransactionList";
import BudgetSummary from "@/components/BudgetSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Index() {
  const [currentMonth, setCurrentMonthState] = useState(getCurrentMonth());
  const [analytics, setAnalytics] = useState(getMonthlyAnalytics(currentMonth));
  const [transactions, setTransactions] = useState(getTransactions(currentMonth));
  const [activeTab, setActiveTab] = useState("budget");

  // Update data when month changes
  useEffect(() => {
    setAnalytics(getMonthlyAnalytics(currentMonth));
    setTransactions(getTransactions(currentMonth));
  }, [currentMonth]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    setCurrentMonthState(month);
  };

  const handleDataUpdate = () => {
    setAnalytics(getMonthlyAnalytics(currentMonth));
    setTransactions(getTransactions(currentMonth));
  };

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
