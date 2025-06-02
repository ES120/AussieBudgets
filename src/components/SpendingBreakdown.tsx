
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CategoryType, SubcategoryType } from "@/lib/types";

type ExtendedSubcategory = SubcategoryType & {
  spent: number;
  remaining: number;
  status: "under" | "warning" | "over" | "neutral";
  categoryName: string;
  categoryColor: string;
};

interface SpendingBreakdownProps {
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
}

export default function SpendingBreakdown({ categories }: SpendingBreakdownProps) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f', '#ff1493', '#1e90ff', '#ffa500'];

  const allSubcategories: ExtendedSubcategory[] = categories.flatMap((category, categoryIndex) =>
    category.subcategories.map((subcategory) => ({
      ...subcategory,
      spent: subcategory.spent || 0,
      remaining: subcategory.remaining || 0,
      status: subcategory.status || "neutral",
      categoryName: category.name,
      categoryColor: colors[categoryIndex % colors.length]
    }))
  );

  const chartData = allSubcategories
    .filter(sub => sub.spent > 0)
    .map(sub => ({
      name: `${sub.categoryName} - ${sub.name}`,
      value: sub.spent,
      color: sub.categoryColor,
      status: sub.status
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No spending data available for this month
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
