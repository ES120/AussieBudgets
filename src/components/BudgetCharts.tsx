
import React from "react";
import { Bar, Pie } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CategoryType, SubcategoryType } from "@/lib/types";
import { ResponsiveContainer, BarChart, PieChart, Cell, Legend, Tooltip, XAxis, YAxis } from "recharts";

interface BudgetChartsProps {
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

export const COLORS = [
  'rgba(59, 130, 246, 0.7)',  // Blue
  'rgba(16, 185, 129, 0.7)',  // Green
  'rgba(245, 158, 11, 0.7)',  // Amber
  'rgba(239, 68, 68, 0.7)',   // Red
  'rgba(139, 92, 246, 0.7)',  // Purple
  'rgba(236, 72, 153, 0.7)',  // Pink
  'rgba(6, 182, 212, 0.7)',   // Cyan
  'rgba(132, 204, 22, 0.7)',  // Lime
];

export function CategoryBarChart({ categories }: BudgetChartsProps) {
  const data = categories.map(category => ({
    name: category.name,
    Budgeted: category.totalBudgeted,
    Spent: category.totalSpent,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis 
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          formatter={(value) => [`${formatCurrency(value as number)}`, undefined]}
        />
        <Legend />
        <Bar dataKey="Budgeted" fill="rgba(59, 130, 246, 0.7)" />
        <Bar dataKey="Spent" fill="rgba(239, 68, 68, 0.7)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BudgetPieChart({ categories }: BudgetChartsProps) {
  const data = categories.map(category => ({
    name: category.name,
    value: category.totalBudgeted
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [formatCurrency(value as number), undefined]} />
        <Legend layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
}
