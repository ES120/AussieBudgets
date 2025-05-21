
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBudget, saveBudget } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface IncomeFormProps {
  currentMonth: string;
  income: number;
  onIncomeChange: () => void;
}

export default function IncomeForm({ currentMonth, income, onIncomeChange }: IncomeFormProps) {
  const [newIncome, setNewIncome] = useState(income.toString());
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    const parsedIncome = parseFloat(newIncome) || 0;
    const budget = getBudget(currentMonth);
    
    budget.income = parsedIncome;
    saveBudget(budget);
    
    setIsEditing(false);
    onIncomeChange();
    
    toast({
      title: "Income Updated",
      description: `Monthly income set to ${formatCurrency(parsedIncome)}`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Monthly Income</CardTitle>
        <CardDescription>Set your monthly income target</CardDescription>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newIncome}
              onChange={(e) => setNewIncome(e.target.value)}
              className="w-full"
            />
            <Button onClick={handleSave} size="sm">Save</Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatCurrency(income)}</span>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
