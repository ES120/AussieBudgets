
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MilestoneWithMetrics } from "@/lib/milestoneTypes";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface DashboardMilestonesProps {
  milestones: MilestoneWithMetrics[];
}

export default function DashboardMilestones({ milestones }: DashboardMilestonesProps) {
  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No milestones created yet
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show top 3 milestones by progress percentage
  const topMilestones = milestones
    .sort((a, b) => b.progress_percentage - a.progress_percentage)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topMilestones.map((milestone) => (
          <div key={milestone.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{milestone.name}</h4>
              <span className="text-sm font-medium">
                {milestone.progress_percentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={milestone.progress_percentage} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(milestone.current_amount)} saved</span>
              <span>Goal: {formatCurrency(milestone.target_amount)}</span>
            </div>
          </div>
        ))}
        {milestones.length > 3 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Showing top 3 milestones
          </p>
        )}
      </CardContent>
    </Card>
  );
}
