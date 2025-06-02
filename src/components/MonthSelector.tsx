
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export default function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const [year, setYear] = useState(parseInt(currentMonth.split('-')[0]));
  const [month, setMonth] = useState(parseInt(currentMonth.split('-')[1]));

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const updateMonth = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    const monthString = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
    onMonthChange(monthString);
  };

  const goToPreviousMonth = () => {
    if (month === 1) {
      updateMonth(year - 1, 12);
    } else {
      updateMonth(year, month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      updateMonth(year + 1, 1);
    } else {
      updateMonth(year, month + 1);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    updateMonth(now.getFullYear(), now.getMonth() + 1);
  };

  return (
    <div className="flex items-center gap-4 bg-white border rounded-lg p-3">
      <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <Select 
          value={month.toString()} 
          onValueChange={(value) => updateMonth(year, parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={year.toString()} 
          onValueChange={(value) => updateMonth(parseInt(value), month)}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button variant="outline" size="icon" onClick={goToNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
        Today
      </Button>
    </div>
  );
}
