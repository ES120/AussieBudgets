
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Milestones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Milestones</h1>
        <p className="text-muted-foreground">Track your financial goals and achievements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Milestone tracking functionality will be available here soon. Set and track your financial goals, 
            savings targets, and achievement milestones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
