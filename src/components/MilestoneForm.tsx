
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MilestoneType } from "@/lib/milestoneTypes";

interface MilestoneFormProps {
  onSubmit: (milestone: Omit<MilestoneType, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Partial<MilestoneType>;
  isEditing?: boolean;
  onCancel?: () => void;
}

export default function MilestoneForm({ onSubmit, initialData, isEditing = false, onCancel }: MilestoneFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    target_amount: initialData?.target_amount || 0,
    current_amount: initialData?.current_amount || 0,
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    target_date: initialData?.target_date || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target_amount || !formData.target_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (new Date(formData.target_date) <= new Date(formData.start_date)) {
      toast({
        title: "Error", 
        description: "Target date must be after start date",
        variant: "destructive"
      });
      return;
    }

    if (formData.target_amount <= 0) {
      toast({
        title: "Error",
        description: "Target amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: isEditing ? "Milestone updated successfully" : "Milestone created successfully"
      });
      
      if (!isEditing) {
        setFormData({
          name: '',
          target_amount: 0,
          current_amount: 0,
          start_date: new Date().toISOString().split('T')[0],
          target_date: ''
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save milestone",
        variant: "destructive"
      });
      console.error('Error saving milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Milestone' : 'Create New Milestone'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Milestone Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Emergency Fund, Vacation Fund"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount">Target Amount ($) *</Label>
              <Input
                id="target_amount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.target_amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, target_amount: Number(e.target.value) }))}
                placeholder="10000"
                required
              />
            </div>

            <div>
              <Label htmlFor="current_amount">Current Amount ($)</Label>
              <Input
                id="current_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.current_amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, current_amount: Number(e.target.value) }))}
                placeholder="2500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="target_date">Target Date *</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Milestone' : 'Create Milestone')}
            </Button>
            {isEditing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
