
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CategoryType, SubcategoryType, TransactionType } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function formatMonthYear(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getMonthOptions(): { label: string, value: string }[] {
  const options = [];
  const today = new Date();
  
  // Add current month and previous 11 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    options.push({
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: month
    });
  }
  
  return options;
}

export function getBudgetStatusColor(status: "under" | "warning" | "over" | "neutral"): string {
  switch (status) {
    case "under": return "text-budget-under";
    case "warning": return "text-budget-warning";
    case "over": return "text-budget-over";
    default: return "text-budget-neutral";
  }
}

export function getProgressBarColor(status: "under" | "warning" | "over" | "neutral"): string {
  switch (status) {
    case "under": return "bg-budget-under";
    case "warning": return "bg-budget-warning";
    case "over": return "bg-budget-over";
    default: return "bg-budget-neutral";
  }
}

export function calculateCategoryTotals(category: CategoryType, transactions: TransactionType[]) {
  const subcategoriesWithTotals = category.subcategories.map(subcategory => {
    const spent = transactions
      .filter(t => t.type === "expense" && t.subcategoryId === subcategory.id)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = subcategory.budgeted - spent;
    const percentUsed = subcategory.budgeted > 0 ? (spent / subcategory.budgeted) * 100 : 0;
    
    let status: "under" | "warning" | "over" | "neutral" = "neutral";
    if (subcategory.budgeted === 0) {
      status = "neutral";
    } else if (percentUsed > 100) {
      status = "over";
    } else if (percentUsed >= 80) {
      status = "warning";
    } else {
      status = "under";
    }
    
    return {
      ...subcategory,
      spent,
      remaining,
      status
    };
  });

  const totalBudgeted = subcategoriesWithTotals.reduce((sum, s) => sum + s.budgeted, 0);
  const totalSpent = subcategoriesWithTotals.reduce((sum, s) => sum + s.spent, 0);

  return {
    ...category,
    subcategories: subcategoriesWithTotals,
    totalBudgeted,
    totalSpent,
    remaining: totalBudgeted - totalSpent
  };
}
