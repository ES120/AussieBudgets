import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentMonth, getMonthlyAnalytics } from "@/lib/supabaseStore";
export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [analytics, setAnalytics] = useState({
    income: 0,
    actualIncome: 0,
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0,
    categories: [],
    needsAllocation: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const analyticsData = await getMonthlyAnalytics(currentMonth);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentMonth]);
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>;
  }
  return <div className="space-y-6 py-0 my-0">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your financial status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      
    </div>;
}