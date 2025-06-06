
import { supabaseService } from "@/services/supabaseService";
import { CategoryType, SubcategoryType, TransactionType, MonthlyBudget } from "@/lib/types";
import { calculateCategoryTotals } from "@/lib/utils";

let currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

export const getCurrentMonth = () => currentMonth;

export const setCurrentMonth = (month: string) => {
  currentMonth = month;
};

export const getBudget = async (month: string): Promise<MonthlyBudget> => {
  try {
    return await supabaseService.getMonthlyBudget(month);
  } catch (error) {
    console.error('Error getting budget:', error);
    return { month, income: 0, categories: [] };
  }
};

export const saveBudget = async (budget: MonthlyBudget): Promise<void> => {
  try {
    await supabaseService.saveMonthlyBudget(budget);
  } catch (error) {
    console.error('Error saving budget:', error);
    throw error;
  }
};

export const saveTransaction = async (transaction: TransactionType): Promise<void> => {
  try {
    await supabaseService.saveTransaction(transaction);
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await supabaseService.deleteTransaction(id);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getTransactions = async (month: string): Promise<TransactionType[]> => {
  try {
    return await supabaseService.getTransactions(month);
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const updateCategoryMonthlyBudget = async (categoryId: string, month: string, budgeted: number): Promise<void> => {
  try {
    await supabaseService.updateCategoryMonthlyBudget(categoryId, month, budgeted);
  } catch (error) {
    console.error('Error updating category monthly budget:', error);
    throw error;
  }
};

export const updateSubcategoryMonthlyBudget = async (subcategoryId: string, month: string, budgeted: number): Promise<void> => {
  try {
    await supabaseService.updateSubcategoryMonthlyBudget(subcategoryId, month, budgeted);
  } catch (error) {
    console.error('Error updating subcategory monthly budget:', error);
    throw error;
  }
};

export const getMonthlyAnalytics = async (month: string) => {
  try {
    const budget = await getBudget(month);
    const transactions = await getTransactions(month);
    
    const categoriesWithTotals = budget.categories.map(category => {
      return calculateCategoryTotals(category, transactions);
    });

    const totalBudgeted = categoriesWithTotals.reduce((sum, cat) => sum + cat.totalBudgeted, 0);
    const totalSpent = categoriesWithTotals.reduce((sum, cat) => sum + cat.totalSpent, 0);
    const remaining = budget.income - totalSpent;
    
    // Calculate actual income from transactions
    const actualIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income: budget.income,
      actualIncome,
      totalBudgeted,
      totalSpent,
      remaining,
      categories: categoriesWithTotals,
      needsAllocation: budget.income - totalBudgeted
    };
  } catch (error) {
    console.error('Error getting monthly analytics:', error);
    return {
      income: 0,
      actualIncome: 0,
      totalBudgeted: 0,
      totalSpent: 0,
      remaining: 0,
      categories: [],
      needsAllocation: 0
    };
  }
};
