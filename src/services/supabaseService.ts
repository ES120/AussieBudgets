import { supabase } from "@/integrations/supabase/client";
import { CategoryType, SubcategoryType, TransactionType, MonthlyBudget } from "@/lib/types";

export const supabaseService = {
  // Monthly Budget operations
  async getMonthlyBudget(month: string): Promise<MonthlyBudget> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Getting budget for month:', month, 'user:', user.id);

    const { data: budget, error } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('month', month)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error getting budget:', error);
      throw error;
    }

    if (!budget) {
      console.log('No budget found, creating new one');
      // Create a new budget for this month
      const { data: newBudget, error: createError } = await supabase
        .from('monthly_budgets')
        .insert({ 
          month, 
          income: 0,
          user_id: user.id
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating new budget:', createError);
        throw createError;
      }
      
      console.log('Created new budget:', newBudget);
    }

    // Get all categories for this user
    const { data: allCategories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        *,
        subcategories (*)
      `)
      .eq('user_id', user.id)
      .order('created_at');

    if (categoriesError) {
      console.error('Error getting categories:', categoriesError);
      throw categoriesError;
    }

    // Get monthly category budgets
    const { data: monthlyCategoryBudgets, error: categoryBudgetError } = await supabase
      .from('monthly_category_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month);

    if (categoryBudgetError) {
      console.error('Error getting monthly category budgets:', categoryBudgetError);
    }

    // Get monthly subcategory budgets
    const { data: monthlySubcategoryBudgets, error: subBudgetError } = await supabase
      .from('monthly_subcategory_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month);

    if (subBudgetError) {
      console.error('Error getting monthly subcategory budgets:', subBudgetError);
    }

    // Create maps for quick lookup
    const categoryBudgetMap = new Map(
      (monthlyCategoryBudgets || []).map(budget => [budget.category_id, budget.budgeted])
    );

    const subcategoryBudgetMap = new Map(
      (monthlySubcategoryBudgets || []).map(budget => [budget.subcategory_id, budget.budgeted])
    );

    console.log('Found categories:', allCategories);

    // Transform the data to match our types
    const transformedCategories: CategoryType[] = (allCategories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      budgeted: Number(categoryBudgetMap.get(cat.id) || 0),
      subcategories: cat.subcategories.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        budgeted: Number(subcategoryBudgetMap.get(sub.id) || 0),
        categoryId: sub.category_id
      }))
    }));

    return {
      month: budget?.month || month,
      income: Number(budget?.income || 0),
      categories: transformedCategories
    };
  },

  async saveMonthlyBudget(budget: MonthlyBudget): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Saving budget:', budget, 'for user:', user.id);

    // Use upsert with proper conflict resolution
    const { error } = await supabase
      .from('monthly_budgets')
      .upsert({
        month: budget.month,
        income: budget.income,
        user_id: user.id
      }, {
        onConflict: 'user_id,month'
      });

    if (error) {
      console.error('Error saving budget:', error);
      throw error;
    }

    console.log('Budget saved successfully');
  },

  // Category operations
  async createCategory(name: string, budgeted: number = 0): Promise<CategoryType> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({ 
        name,
        budgeted: 0, // Keep global budgeted at 0 since we're using monthly budgets
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { 
      id: data.id, 
      name: data.name,
      budgeted: budgeted, // Use the provided budgeted amount for the current month
      subcategories: [] 
    };
  },

  async updateCategory(category: CategoryType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('categories')
      .update({ 
        name: category.name
        // Don't update budgeted here since it's now month-specific
      })
      .eq('id', category.id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async updateCategoryMonthlyBudget(categoryId: string, month: string, budgeted: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('monthly_category_budgets')
      .upsert({
        user_id: user.id,
        category_id: categoryId,
        month: month,
        budgeted: budgeted
      }, {
        onConflict: 'category_id,month'
      });

    if (error) throw error;
  },

  async categoryHasTransactions(categoryId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First check for direct transactions on subcategories of this category
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', categoryId)
      .eq('user_id', user.id);

    if (subError) throw subError;

    if (subcategories && subcategories.length > 0) {
      const subcategoryIds = subcategories.map(sub => sub.id);
      
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id')
        .in('subcategory_id', subcategoryIds)
        .eq('user_id', user.id)
        .limit(1);

      if (transError) throw transError;
      
      return (transactions && transactions.length > 0);
    }

    return false;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, get all subcategories for this category
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', categoryId)
      .eq('user_id', user.id);

    if (subError) throw subError;

    // If there are subcategories, delete their transactions first
    if (subcategories && subcategories.length > 0) {
      const subcategoryIds = subcategories.map(sub => sub.id);
      
      // Delete all transactions linked to these subcategories
      const { error: transError } = await supabase
        .from('transactions')
        .delete()
        .in('subcategory_id', subcategoryIds)
        .eq('user_id', user.id);

      if (transError) throw transError;
    }

    // Delete monthly subcategory budgets
    if (subcategories && subcategories.length > 0) {
      const subcategoryIds = subcategories.map(sub => sub.id);
      
      const { error: monthlySubError } = await supabase
        .from('monthly_subcategory_budgets')
        .delete()
        .in('subcategory_id', subcategoryIds)
        .eq('user_id', user.id);

      if (monthlySubError) throw monthlySubError;
    }

    // Delete monthly category budgets
    const { error: monthlyCatError } = await supabase
      .from('monthly_category_budgets')
      .delete()
      .eq('category_id', categoryId)
      .eq('user_id', user.id);

    if (monthlyCatError) throw monthlyCatError;

    // Finally, delete the category (which will cascade delete subcategories due to foreign key)
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Subcategory operations
  async createSubcategory(categoryId: string, name: string, budgeted: number): Promise<SubcategoryType> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('subcategories')
      .insert({
        category_id: categoryId,
        name,
        budgeted: 0, // Keep global budgeted at 0 since we're using monthly budgets
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { 
      id: data.id,
      name: data.name,
      budgeted: budgeted, // Use the provided budgeted amount for the current month
      categoryId: data.category_id
    };
  },

  async updateSubcategory(subcategory: SubcategoryType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('subcategories')
      .update({
        name: subcategory.name
        // Don't update budgeted here since it's now month-specific
      })
      .eq('id', subcategory.id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async updateSubcategoryMonthlyBudget(subcategoryId: string, month: string, budgeted: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('monthly_subcategory_budgets')
      .upsert({
        user_id: user.id,
        subcategory_id: subcategoryId,
        month: month,
        budgeted: budgeted
      }, {
        onConflict: 'subcategory_id,month'
      });

    if (error) throw error;
  },

  async deleteSubcategory(subcategoryId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', subcategoryId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Transaction operations
  async getTransactions(month: string): Promise<TransactionType[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Calculate the correct start and end dates for the month
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0); // Last day of the month

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('Getting transactions for month:', month, 'user:', user.id, 'date range:', startDateStr, 'to', endDateStr);

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
    
    console.log('Found transactions:', data);
    
    // Transform the data to match our types
    return (data || []).map(transaction => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      date: transaction.date,
      type: transaction.type as "income" | "expense",
      subcategoryId: transaction.subcategory_id,
      description: transaction.description || ""
    }));
  },

  async saveTransaction(transaction: TransactionType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Saving transaction:', transaction, 'for user:', user.id);

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
        .eq('id', transaction.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }
    } else {
      // Create new transaction - let database generate the ID
      const { error } = await supabase
        .from('transactions')
        .insert({
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type,
          subcategory_id: transaction.subcategoryId,
          description: transaction.description,
          user_id: user.id
        });

      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }
    }

    console.log('Transaction saved successfully');
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};
