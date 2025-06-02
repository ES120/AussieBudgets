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

    // Create or update milestone categories based on active milestones
    await this.createMilestoneCategory();

    // Get categories and subcategories for this user
    const { data: categories, error: categoriesError } = await supabase
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

    console.log('Found categories:', categories);

    // Transform the data to match our types
    const transformedCategories: CategoryType[] = (categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      budgeted: Number(cat.budgeted || 0),
      milestone_id: cat.milestone_id,
      subcategories: cat.subcategories.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        budgeted: Number(sub.budgeted || 0),
        categoryId: sub.category_id
      }))
    }));

    return {
      month: budget?.month || month,
      income: Number(budget?.income || 0),
      categories: transformedCategories
    };
  },

  async createMilestoneCategory(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get active milestones (where target_date hasn't passed)
    const { data: activeMilestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .gte('target_date', new Date().toISOString().split('T')[0]);

    if (milestonesError) {
      console.error('Error getting milestones:', milestonesError);
      return;
    }

    if (!activeMilestones || activeMilestones.length === 0) {
      // No active milestones, remove milestone category if it exists
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('name', 'Milestones')
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error removing milestone category:', deleteError);
      }
      return;
    }

    // Calculate total monthly savings needed for all milestones
    let totalMonthlySavings = 0;
    const milestoneData = activeMilestones.map(milestone => {
      const startDate = new Date(milestone.start_date);
      const targetDate = new Date(milestone.target_date);
      const monthsRemaining = Math.max(1, Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
      const remainingAmount = milestone.target_amount - milestone.current_amount;
      const monthlySavingsNeeded = Math.max(0, remainingAmount / monthsRemaining);
      
      totalMonthlySavings += monthlySavingsNeeded;
      
      return {
        ...milestone,
        monthlySavingsNeeded
      };
    });

    // Check if Milestones category already exists
    const { data: existingCategory, error: existingError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Milestones')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing milestone category:', existingError);
      return;
    }

    let milestonesCategoryId: string;

    if (existingCategory) {
      // Update existing category budget
      milestonesCategoryId = existingCategory.id;
      const { error: updateError } = await supabase
        .from('categories')
        .update({ budgeted: totalMonthlySavings })
        .eq('id', milestonesCategoryId);

      if (updateError) {
        console.error('Error updating milestone category budget:', updateError);
        return;
      }
    } else {
      // Create new Milestones category
      const { data: newCategory, error: createError } = await supabase
        .from('categories')
        .insert({
          name: 'Milestones',
          budgeted: totalMonthlySavings,
          user_id: user.id
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating milestone category:', createError);
        return;
      }

      milestonesCategoryId = newCategory.id;
    }

    // Get existing milestone subcategories
    const { data: existingSubcategories, error: subError } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', milestonesCategoryId);

    if (subError) {
      console.error('Error getting existing subcategories:', subError);
      return;
    }

    const existingSubcategoryIds = new Set(existingSubcategories?.map(sub => sub.name) || []);

    // Create or update subcategories for each milestone
    for (const milestone of milestoneData) {
      const subcategoryName = milestone.name;

      if (existingSubcategoryIds.has(subcategoryName)) {
        // Update existing subcategory
        const existingSub = existingSubcategories?.find(sub => sub.name === subcategoryName);
        if (existingSub) {
          const { error: updateSubError } = await supabase
            .from('subcategories')
            .update({ budgeted: milestone.monthlySavingsNeeded })
            .eq('id', existingSub.id);

          if (updateSubError) {
            console.error('Error updating milestone subcategory:', updateSubError);
          }
        }
      } else {
        // Create new subcategory
        const { error: createSubError } = await supabase
          .from('subcategories')
          .insert({
            category_id: milestonesCategoryId,
            name: subcategoryName,
            budgeted: milestone.monthlySavingsNeeded,
            user_id: user.id
          });

        if (createSubError) {
          console.error('Error creating milestone subcategory:', createSubError);
        }
      }
    }

    // Remove subcategories for milestones that no longer exist
    const activeMilestoneNames = new Set(milestoneData.map(m => m.name));
    const subcategoriesToRemove = existingSubcategories?.filter(sub => 
      !activeMilestoneNames.has(sub.name)
    ) || [];

    for (const subToRemove of subcategoriesToRemove) {
      const { error: deleteSubError } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subToRemove.id);

      if (deleteSubError) {
        console.error('Error removing old milestone subcategory:', deleteSubError);
      }
    }
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
        budgeted,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { 
      id: data.id, 
      name: data.name,
      budgeted: Number(data.budgeted || 0),
      milestone_id: data.milestone_id,
      subcategories: [] 
    };
  },

  async updateCategory(category: CategoryType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('categories')
      .update({ 
        name: category.name,
        budgeted: category.budgeted
      })
      .eq('id', category.id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

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
        budgeted,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { 
      id: data.id,
      name: data.name,
      budgeted: Number(data.budgeted),
      categoryId: data.category_id
    };
  },

  async updateSubcategory(subcategory: SubcategoryType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('subcategories')
      .update({
        name: subcategory.name,
        budgeted: subcategory.budgeted
      })
      .eq('id', subcategory.id)
      .eq('user_id', user.id);

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
