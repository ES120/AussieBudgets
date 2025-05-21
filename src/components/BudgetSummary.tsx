
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart, ChartConfiguration } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { CategoryType, SubcategoryType } from "@/lib/types";

interface BudgetSummaryProps {
  categories: Array<CategoryType & { 
    totalBudgeted: number; 
    totalSpent: number;
    remaining: number;
    subcategories: Array<SubcategoryType & { 
      spent: number; 
      remaining: number;
      status: "under" | "warning" | "over" | "neutral";
    }>;
  }>;
  totalBudgeted: number;
  totalSpent: number;
}

export default function BudgetSummary({ categories, totalBudgeted, totalSpent }: BudgetSummaryProps) {
  // For the category spending chart
  const categoryChartConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: categories.map(category => category.name),
      datasets: [
        {
          label: 'Budgeted',
          data: categories.map(category => category.totalBudgeted),
          backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Spent',
          data: categories.map(category => category.totalSpent),
          backgroundColor: 'rgba(239, 68, 68, 0.5)', // Red
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value;
            }
          }
        }
      }
    }
  };
  
  // For the budget allocation pie chart
  const pieChartData = categories.map(category => ({
    name: category.name,
    value: category.totalBudgeted
  }));
  
  const pieChartConfig: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: pieChartData.map(item => item.name),
      datasets: [
        {
          data: pieChartData.map(item => item.value),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',  // Blue
            'rgba(16, 185, 129, 0.7)',  // Green
            'rgba(245, 158, 11, 0.7)',  // Amber
            'rgba(239, 68, 68, 0.7)',   // Red
            'rgba(139, 92, 246, 0.7)',  // Purple
            'rgba(236, 72, 153, 0.7)',  // Pink
            'rgba(6, 182, 212, 0.7)',   // Cyan
            'rgba(132, 204, 22, 0.7)',  // Lime
          ],
          borderWidth: 1,
          borderColor: '#fff'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${formatCurrency(value as number)}`;
            }
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Budget by Category</CardTitle>
          <CardDescription>Compare budgeted vs actual spending</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            <Chart config={categoryChartConfig} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Budget Allocation</CardTitle>
          <CardDescription>How your budget is distributed</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            <Chart config={pieChartConfig} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
