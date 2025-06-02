
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { MilestoneWithMetrics } from "@/lib/milestoneTypes";
import { useToast } from "@/hooks/use-toast";

interface MilestoneCardProps {
  milestone: MilestoneWithMetrics;
  onEdit: (milestone: MilestoneWithMetrics) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateAmount: (id: string, newAmount: number) => Promise<void>;
}

export default function MilestoneCard({ milestone, onEdit, onDelete, onUpdateAmount }: MilestoneCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAmount, setNewAmount] = useState(milestone.current_amount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const handleUpdateAmount = async () => {
    if (newAmount < 0) {
      toast({
        title: "Error",
        description: "Amount cannot be negative",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateAmount(milestone.id, newAmount);
      toast({
        title: "Success",
        description: "Milestone amount updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update amount",
        variant: "destructive"
      });
      console.error('Error updating amount:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await onDelete(milestone.id);
        toast({
          title: "Success",
          description: "Milestone deleted"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete milestone",
          variant: "destructive"
        });
        console.error('Error deleting milestone:', error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{milestone.name}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(milestone)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{milestone.progress_percentage.toFixed(1)}%</span>
          </div>
          <Progress 
            value={milestone.progress_percentage} 
            className="h-3"
          />
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Current Amount</div>
            <div className="font-semibold text-green-600">
              {formatCurrency(milestone.current_amount)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Target Amount</div>
            <div className="font-semibold">
              {formatCurrency(milestone.target_amount)}
            </div>
          </div>
        </div>

        {/* Update Current Amount */}
        <div className="flex gap-2 items-center">
          <input
            type="number"
            step="0.01"
            min="0"
            value={newAmount}
            onChange={(e) => setNewAmount(Number(e.target.value))}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            placeholder="Update current amount"
          />
          <Button 
            size="sm" 
            onClick={handleUpdateAmount}
            disabled={isUpdating || newAmount === milestone.current_amount}
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Monthly savings needed:</span>
            <span className="font-semibold text-blue-600">
              {formatCurrency(milestone.monthly_savings_needed)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">Days remaining:</span>
            <span className="font-semibold">
              {milestone.days_remaining} days
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Timeline:</span>
            <span className="font-semibold">
              {formatDate(milestone.start_date)} → {formatDate(milestone.target_date)}
            </span>
          </div>
        </div>

        {/* Status Messages */}
        {milestone.progress_percentage >= 100 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
            🎉 Congratulations! You've reached your milestone!
          </div>
        )}
        
        {milestone.days_remaining <= 30 && milestone.progress_percentage < 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            ⚠️ Only {milestone.days_remaining} days left to reach your goal!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
