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
export default function BudgetHeader({
  currentMonth,
  setCurrentMonth,
  analytics
}: BudgetHeaderProps) {
  const monthOptions = getMonthOptions();
  const {
    toast
  } = useToast();
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  const handleMonthChange = (month: string) => {
    setIsChangingMonth(true);
    setCurrentMonth(month);
    toast({
      title: "Month Changed",
      description: `Viewing budget for ${formatMonthYear(month)}`
    });
    setTimeout(() => {
      setIsChangingMonth(false);
    }, 500);
  };
  return <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-bold text-3xl">Budget Overview</h1>
        <p className="text-muted-foreground">Manage your monthly budget</p>
      </div>
      <Select value={currentMonth} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map(option => <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>)}
        </SelectContent>
      </Select>
    </div>;
}