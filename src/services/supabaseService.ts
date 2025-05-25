
import { supabase } from "@/integrations/supabase/client";
import { CategoryType, SubcategoryType, TransactionType, MonthlyBudget } from "@/lib/types";

export const supabaseService = {
  // Monthly Budget operations
  async getMonthlyBudget(month: string): Promise<MonthlyBudget> {
    const { data: budget, error } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('month', month)
      .maybeSingle();

    if (error) throw error;

    if (!budget) {
      // Create a new budget for this month
      const { data: newBudget, error: createError } = await supabase
        .from('monthly_budgets')
        .insert({ month, income: 0 })
        .select()
        .single();

      if (createError) throw createError;
      
      return {
        month,
        income: 0,
        categories: []
      };
    }

    // Get categories and subcategories for this month
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        *,
        subcategories (*)
      `)
      .order('created_at');

    if (categoriesError) throw categoriesError;

    return {
      month: budget.month,
      income: budget.income || 0,
      categories: categories || []
    };
  },

  async saveMonthlyBudget(budget: MonthlyBudget): Promise<void> {
    const { error } = await supabase
      .from('monthly_budgets')
      .upsert({
        month: budget.month,
        income: budget.income
      });

    if (error) throw error;
  },

  // Category operations
  async createCategory(name: string): Promise<CategoryType> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, subcategories: [] })
      .select()
      .single();

    if (error) throw error;
    return { ...data, subcategories: [] };
  },

  async updateCategory(category: CategoryType): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({ name: category.name })
      .eq('id', category.id);

    if (error) throw error;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },

  // Subcategory operations
  async createSubcategory(categoryId: string, name: string, budgeted: number): Promise<SubcategoryType> {
    const { data, error } = await supabase
      .from('subcategories')
      .insert({
        category_id: categoryId,
        name,
        budgeted
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, categoryId: data.category_id };
  },

  async updateSubcategory(subcategory: SubcategoryType): Promise<void> {
    const { error } = await supabase
      .from('subcategories')
      .update({
        name: subcategory.name,
        budgeted: subcategory.budgeted
      })
      .eq('id', subcategory.id);

    if (error) throw error;
  },

  async deleteSubcategory(subcategoryId: string): Promise<void> {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) throw error;
  },

  // Transaction operations
  async getTransactions(month: string): Promise<TransactionType[]> {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async saveTransaction(transaction: TransactionType): Promise<void> {
    if (transaction.id && transaction.id !== '') {
      // Update existing transaction
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type,
          subcategory_id: transaction.subcategoryId,
          description: transaction.description
        })
        .eq('id', transaction.id);

      if (error) throw error;
    } else {
      // Create new transaction
      const { error } = await supabase
        .from('transactions')
        .insert({
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type,
          subcategory_id: transaction.subcategoryId,
          description: transaction.description
        });

      if (error) throw error;
    }
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw error;
  }
};
