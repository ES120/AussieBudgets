
export type MilestoneType = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type MilestoneWithMetrics = MilestoneType & {
  progress_percentage: number;
  days_remaining: number;
  monthly_savings_needed: number;
  days_elapsed: number;
  total_days: number;
}
