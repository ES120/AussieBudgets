
import { supabase } from "@/integrations/supabase/client";
import { MilestoneType, MilestoneWithMetrics } from "@/lib/milestoneTypes";

export const milestoneService = {
  async getMilestones(): Promise<MilestoneWithMetrics[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting milestones:', error);
      throw error;
    }

    // Calculate metrics for each milestone
    return (data || []).map(milestone => {
      const startDate = new Date(milestone.start_date);
      const targetDate = new Date(milestone.target_date);
      const currentDate = new Date();
      
      const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      const progressPercentage = Math.min(100, (Number(milestone.current_amount) / Number(milestone.target_amount)) * 100);
      const remainingAmount = Number(milestone.target_amount) - Number(milestone.current_amount);
      const monthsRemaining = daysRemaining / 30.44; // Average days per month
      const monthlySavingsNeeded = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;

      return {
        ...milestone,
        progress_percentage: progressPercentage,
        days_remaining: daysRemaining,
        monthly_savings_needed: monthlySavingsNeeded,
        days_elapsed: Math.max(0, daysElapsed),
        total_days: totalDays
      };
    });
  },

  async createMilestone(milestone: Omit<MilestoneType, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('milestones')
      .insert({
        ...milestone,
        user_id: user.id
      });

    if (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  },

  async updateMilestone(id: string, updates: Partial<MilestoneType>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('milestones')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  },

  async deleteMilestone(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  }
};
