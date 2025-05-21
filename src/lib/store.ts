
import { useToast } from "@/hooks/use-toast";
import { CategoryType, MonthlyBudget, SubcategoryType, TransactionType } from "./types";

// LocalStorage keys
const BUDGETS_KEY = 'budget-app-budgets';
const TRANSACTIONS_KEY = 'budget-app-transactions';
const CURRENT_MONTH_KEY = 'budget-app-current-month';

// Helper functions
export const getCurrentMonth = (): string => {
  const storedMonth = localStorage.getItem(CURRENT_MONTH_KEY);
  
  if (storedMonth) {
    return storedMonth;
  }
  
  const now = new Date();
  const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  localStorage.setItem(CURRENT_MONTH_KEY, month);
  return month;
};

export const setCurrentMonth = (month: string): void => {
  localStorage.setItem(CURRENT_MONTH_KEY, month);
};

// Budget Management
export const getBudget = (month: string = getCurrentMonth()): MonthlyBudget => {
  const budgetsJson = localStorage.getItem(BUDGETS_KEY);
  const budgets: Record<string, MonthlyBudget> = budgetsJson ? JSON.parse(budgetsJson) : {};
  
  if (budgets[month]) {
    return budgets[month];
  }
  
  // Create a new budget for this month
  const newBudget: MonthlyBudget = {
    month,
    income: 0,
    categories: [],
  };
  
  budgets[month] = newBudget;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  return newBudget;
};

export const saveBudget = (budget: MonthlyBudget): void => {
  const budgetsJson = localStorage.getItem(BUDGETS_KEY);
  const budgets: Record<string, MonthlyBudget> = budgetsJson ? JSON.parse(budgetsJson) : {};
  
  budgets[budget.month] = budget;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const getAllBudgets = (): Record<string, MonthlyBudget> => {
  const budgetsJson = localStorage.getItem(BUDGETS_KEY);
  return budgetsJson ? JSON.parse(budgetsJson) : {};
};

// Transaction Management
export const getTransactions = (month: string = getCurrentMonth()): TransactionType[] => {
  const transactionsJson = localStorage.getItem(TRANSACTIONS_KEY);
  const allTransactions: Record<string, TransactionType[]> = transactionsJson ? JSON.parse(transactionsJson) : {};
  
  return allTransactions[month] || [];
};

export const saveTransaction = (transaction: TransactionType): void => {
  const month = transaction.date.substring(0, 7); // Extract YYYY-MM from date
  const transactionsJson = localStorage.getItem(TRANSACTIONS_KEY);
  const allTransactions: Record<string, TransactionType[]> = transactionsJson ? JSON.parse(transactionsJson) : {};
  
  if (!allTransactions[month]) {
    allTransactions[month] = [];
  }
  
  // Check if it's an edit (has existing ID)
  const existingIndex = allTransactions[month].findIndex(t => t.id === transaction.id);
  
  if (existingIndex >= 0) {
    allTransactions[month][existingIndex] = transaction;
  } else {
    allTransactions[month].push(transaction);
  }
  
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
};

export const deleteTransaction = (id: string, month: string = getCurrentMonth()): void => {
  const transactionsJson = localStorage.getItem(TRANSACTIONS_KEY);
  const allTransactions: Record<string, TransactionType[]> = transactionsJson ? JSON.parse(transactionsJson) : {};
  
  if (allTransactions[month]) {
    allTransactions[month] = allTransactions[month].filter(t => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
  }
};

// Analytics
export const getMonthlyAnalytics = (month: string = getCurrentMonth()) => {
  const budget = getBudget(month);
  const transactions = getTransactions(month);
  
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate totals by subcategory
  const subcategoryTotals: Record<string, number> = {};
  
  transactions
    .filter(t => t.type === "expense" && t.subcategoryId)
    .forEach(t => {
      if (t.subcategoryId) {
        if (!subcategoryTotals[t.subcategoryId]) {
          subcategoryTotals[t.subcategoryId] = 0;
        }
        subcategoryTotals[t.subcategoryId] += t.amount;
      }
    });
  
  // Calculate subcategory status
  const subcategoryStatuses: Record<string, {
    budgeted: number;
    spent: number;
    remaining: number;
    status: "under" | "warning" | "over" | "neutral";
  }> = {};
  
  budget.categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      const spent = subcategoryTotals[subcategory.id] || 0;
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
      
      subcategoryStatuses[subcategory.id] = {
        budgeted: subcategory.budgeted,
        spent,
        remaining,
        status
      };
    });
  });
  
  // Calculate category totals
  const categoryAnalytics = budget.categories.map(category => {
    const subcategories = category.subcategories.map(subcategory => {
      return {
        ...subcategory,
        ...subcategoryStatuses[subcategory.id]
      };
    });
    
    const totalBudgeted = subcategories.reduce((sum, s) => sum + s.budgeted, 0);
    const totalSpent = subcategories.reduce((sum, s) => sum + s.spent, 0);
    
    return {
      ...category,
      subcategories,
      totalBudgeted,
      totalSpent,
      remaining: totalBudgeted - totalSpent
    };
  });
  
  const totalBudgeted = categoryAnalytics.reduce((sum, c) => sum + c.totalBudgeted, 0);
  
  return {
    income: budget.income,
    actualIncome: totalIncome,
    totalBudgeted,
    totalSpent: totalExpense,
    remaining: budget.income - totalBudgeted,
    categories: categoryAnalytics,
    needsAllocation: budget.income - totalBudgeted
  };
};
