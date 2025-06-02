import { supabase } from "@/integrations/supabase/client";
import { CategoryType, SubcategoryType, TransactionType, MonthlyBudget } from "@/lib/types";

export const supabaseService = {
  async createCategory(name: string, budgeted: number): Promise<CategoryType> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ user_id: user.id, name }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return { ...data, subcategories: [], budgeted: 0 } as CategoryType;
  },

  async updateCategory(category: CategoryType): Promise<CategoryType> {
    const { data, error } = await supabase
      .from('categories')
      .update({ name: category.name, milestone_id: category.milestone_id })
      .eq('id', category.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return { ...data, subcategories: category.subcategories, budgeted: category.budgeted } as CategoryType;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  async createSubcategory(categoryId: string, name: string, budgeted: number): Promise<SubcategoryType> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('Creating subcategory with data:', { categoryId, name, budgeted, userId: user.id });

    const { data, error } = await supabase
      .from('subcategories')
      .insert([{ 
        user_id: user.id, 
        category_id: categoryId, 
        name: name,
        budgeted: budgeted 
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }

    console.log('Subcategory created successfully:', data);

    return {
      id: data.id,
      name: data.name,
      budgeted: data.budgeted || 0,
      categoryId: data.category_id
    } as SubcategoryType;
  },

  async updateSubcategory(subcategory: SubcategoryType): Promise<SubcategoryType> {
    console.log('Updating subcategory:', subcategory);

    const { data, error } = await supabase
      .from('subcategories')
      .update({ 
        name: subcategory.name, 
        category_id: subcategory.categoryId,
        budgeted: subcategory.budgeted 
      })
      .eq('id', subcategory.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }

    console.log('Subcategory updated successfully:', data);

    return {
      id: data.id,
      name: data.name,
      budgeted: data.budgeted || 0,
      categoryId: data.category_id
    } as SubcategoryType;
  },

  async deleteSubcategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  },

  async getMonthlyBudget(month: string): Promise<MonthlyBudget> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('Getting budget for month:', month, 'user:', user.id);

    // Get categories with their monthly budgets and subcategories
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        monthly_category_budgets!inner(budgeted),
        subcategories(
          *,
          monthly_subcategory_budgets!inner(budgeted)
        )
      `)
      .eq('user_id', user.id)
      .eq('monthly_category_budgets.month', month)
      .eq('subcategories.monthly_subcategory_budgets.month', month);

    if (error) {
      console.error('Error getting categories with budgets:', error);
      
      // If no monthly budgets exist, get categories without budgets
      const { data: categoriesWithoutBudgets, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories(*)
        `)
        .eq('user_id', user.id);

      if (categoriesError) {
        console.error('Error getting categories without budgets:', categoriesError);
        throw categoriesError;
      }

      console.log('Found categories:', categoriesWithoutBudgets);
      
      const formattedCategories = (categoriesWithoutBudgets || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        budgeted: 0,
        milestone_id: cat.milestone_id,
        subcategories: (cat.subcategories || []).map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          budgeted: 0,
          categoryId: sub.category_id
        }))
      }));

      // Get income for this month using monthly_budgets table
      const { data: incomeData } = await supabase
        .from('monthly_budgets')
        .select('income')
        .eq('user_id', user.id)
        .eq('month', month)
        .single();

      return {
        month,
        income: incomeData?.income || 0,
        categories: formattedCategories
      };
    }

    console.log('Found categories:', categories);
    
    const formattedCategories = (categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      budgeted: cat.monthly_category_budgets?.[0]?.budgeted || 0,
      milestone_id: cat.milestone_id,
      subcategories: (cat.subcategories || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        budgeted: sub.monthly_subcategory_budgets?.[0]?.budgeted || 0,
        categoryId: sub.category_id
      }))
    }));

    // Get income for this month using monthly_budgets table
    const { data: incomeData } = await supabase
      .from('monthly_budgets')
      .select('income')
      .eq('user_id', user.id)
      .eq('month', month)
      .single();

    return {
      month,
      income: incomeData?.income || 0,
      categories: formattedCategories
    };
  },

  async saveMonthlyBudget(budget: MonthlyBudget): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upsert monthly income using monthly_budgets table
    const { error: incomeError } = await supabase
      .from('monthly_budgets')
      .upsert([{ user_id: user.id, month: budget.month, income: budget.income }], { onConflict: 'user_id, month' });

    if (incomeError) {
      console.error('Error saving monthly income:', incomeError);
      throw incomeError;
    }

    // Loop through categories and their subcategories
    for (const category of budget.categories) {
      // Upsert category
      const { error: categoryError } = await supabase
        .from('categories')
        .upsert({ id: category.id, name: category.name, user_id: user.id, milestone_id: category.milestone_id }, { onConflict: 'id' });

      if (categoryError) {
        console.error('Error saving category:', categoryError);
        throw categoryError;
      }

      for (const subcategory of category.subcategories) {
        // Upsert subcategory
        const { error: subcategoryError } = await supabase
          .from('subcategories')
          .upsert({ id: subcategory.id, name: subcategory.name, category_id: category.id, user_id: user.id }, { onConflict: 'id' });

        if (subcategoryError) {
          console.error('Error saving subcategory:', subcategoryError);
          throw subcategoryError;
        }
      }
    }
  },

  async getTransactions(month: string): Promise<TransactionType[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .like('date', `${month}%`)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error getting transactions:', error);
      return [];
    }

    return (data || []).map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type as "income" | "expense",
      subcategoryId: transaction.subcategory_id,
      description: transaction.description || ""
    })) as TransactionType[];
  },

  async saveTransaction(transaction: TransactionType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const transactionToSave = { 
      ...transaction, 
      user_id: user.id,
      subcategory_id: transaction.subcategoryId,
      subcategoryId: undefined
    };

    const { data, error } = await supabase
      .from('transactions')
      .upsert(transactionToSave, { onConflict: 'id' });

    if (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  async updateCategoryMonthlyBudget(categoryId: string, month: string, budgeted: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upsert the monthly category budget
    const { error } = await supabase
      .from('monthly_category_budgets')
      .upsert(
        [{ category_id: categoryId, month: month, budgeted: budgeted, user_id: user.id }],
        { onConflict: 'category_id, month' }
      );

    if (error) {
      console.error('Error updating category monthly budget:', error);
      throw error;
    }
  },

  async updateSubcategoryMonthlyBudget(subcategoryId: string, month: string, budgeted: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upsert the monthly subcategory budget
    const { error } = await supabase
      .from('monthly_subcategory_budgets')
      .upsert(
        [{ subcategory_id: subcategoryId, month: month, budgeted: budgeted, user_id: user.id }],
        { onConflict: 'subcategory_id, month' }
      );

    if (error) {
      console.error('Error updating subcategory monthly budget:', error);
      throw error;
    }
  }
};
