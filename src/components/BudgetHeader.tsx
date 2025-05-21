
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatMonthYear, getMonthOptions } from "@/lib/utils";
import { getCurrentMonth, getMonthlyAnalytics, setCurrentMonth } from "@/lib/store";
import { useState } from "react";

interface BudgetHeaderProps {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  analytics: ReturnType<typeof getMonthlyAnalytics>;
}

export default function BudgetHeader({ currentMonth, setCurrentMonth, analytics }: BudgetHeaderProps) {
  const monthOptions = getMonthOptions();
  const { toast } = useToast();
  const [isChangingMonth, setIsChangingMonth] = useState(false);

  const handleMonthChange = (month: string) => {
    setIsChangingMonth(true);
    setCurrentMonth(month);
    
    toast({
      title: "Month Changed",
      description: `Viewing budget for ${formatMonthYear(month)}`,
    });
    
    setTimeout(() => {
      setIsChangingMonth(false);
    }, 500);
  };

  return (
    <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
      <div className="container max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Budget Overview</h1>
            <p className="text-muted-foreground">
              Track your monthly budget and spending
            </p>
          </div>
          
          <Select
            value={currentMonth}
            onValueChange={handleMonthChange}
            disabled={isChangingMonth}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded bg-secondary">
            <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
            <p className="text-2xl font-bold">{formatCurrency(analytics.income)}</p>
          </div>
          
          <div className="p-4 rounded bg-secondary">
            <h3 className="text-sm font-medium text-muted-foreground">Budgeted</h3>
            <p className="text-2xl font-bold">{formatCurrency(analytics.totalBudgeted)}</p>
          </div>
          
          <div className="p-4 rounded bg-secondary">
            <h3 className="text-sm font-medium text-muted-foreground">Spent</h3>
            <p className="text-2xl font-bold">{formatCurrency(analytics.totalSpent)}</p>
          </div>
          
          <div className="p-4 rounded bg-secondary">
            <h3 className="text-sm font-medium text-muted-foreground">Remaining</h3>
            <p className={`text-2xl font-bold ${analytics.remaining >= 0 ? 'text-budget-under' : 'text-budget-over'}`}>
              {formatCurrency(analytics.remaining)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
