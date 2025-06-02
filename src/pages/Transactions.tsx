
import { useState, useEffect } from "react";
import { getCurrentMonth, getTransactions, setCurrentMonth } from "@/lib/supabaseStore";
import TransactionList from "@/components/TransactionList";
import MonthSelector from "@/components/MonthSelector";

export default function Transactions() {
  const [currentMonth, setCurrentMonthState] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const transactionsData = await getTransactions(currentMonth);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentMonth]);

  const handleDataUpdate = async () => {
    try {
      const transactionsData = await getTransactions(currentMonth);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error updating transactions:', error);
    }
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonthState(month);
    setCurrentMonth(month); // Update the global current month
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
      <div>
        <h1 className="text-3xl font-bold">Expenses / Transactions</h1>
        <p className="text-muted-foreground">Record and manage your transaction history</p>
      </div>

      <MonthSelector 
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
      />

      <TransactionList 
        currentMonth={currentMonth}
        transactions={transactions}
        onUpdate={handleDataUpdate}
      />
    </div>
  );
}
