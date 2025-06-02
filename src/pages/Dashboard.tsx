
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentMonth, getMonthlyAnalytics, setCurrentMonth } from "@/lib/supabaseStore";
import { milestoneService } from "@/services/milestoneService";
import { formatMonthYear, getMonthOptions } from "@/lib/utils";
import { MilestoneWithMetrics } from "@/lib/milestoneTypes";
import SpendingBreakdown from "@/components/SpendingBreakdown";
import BudgetSummary from "@/components/BudgetSummary";
import DashboardMilestones from "@/components/DashboardMilestones";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonthState] = useState(getCurrentMonth());
  const [analytics, setAnalytics] = useState({
    income: 0,
    actualIncome: 0,
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0,
    categories: [],
    needsAllocation: 0
  });
  const [milestones, setMilestones] = useState<MilestoneWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const monthOptions = getMonthOptions();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [analyticsData, milestonesData] = await Promise.all([
          getMonthlyAnalytics(currentMonth),
          milestoneService.getMilestones()
        ]);
        setAnalytics(analyticsData);
        setMilestones(milestonesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentMonth, toast]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    setCurrentMonthState(month);
    toast({
      title: "Month Changed",
      description: `Viewing data for ${formatMonthYear(month)}`
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>;
  }

  return <div className="space-y-6 py-0 my-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial status</p>
        </div>
        <Select value={currentMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.income.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Your planned monthly income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalBudgeted.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Amount allocated to categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Your actual expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.remaining.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to allocate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <SpendingBreakdown categories={analytics.categories} />
        <BudgetSummary categories={analytics.categories} totalBudgeted={analytics.totalBudgeted} totalSpent={analytics.totalSpent} />
        <DashboardMilestones milestones={milestones} />
      </div>
    </div>;
}
