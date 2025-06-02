
import { useState, useEffect } from "react";
import { getCurrentMonth, getTransactions, setCurrentMonth } from "@/lib/supabaseStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMonthYear, getMonthOptions } from "@/lib/utils";
import TransactionList from "@/components/TransactionList";

export default function Transactions() {
  const [currentMonth, setCurrentMonthState] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthOptions = getMonthOptions();

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses / Transactions</h1>
          <p className="text-muted-foreground">Record and manage your transaction history</p>
        </div>
        <Select value={currentMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TransactionList 
        currentMonth={currentMonth}
        transactions={transactions}
        onUpdate={handleDataUpdate}
      />
    </div>
  );
}
