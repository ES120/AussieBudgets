
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { milestoneService } from "@/services/milestoneService";
import { MilestoneWithMetrics } from "@/lib/milestoneTypes";
import MilestoneForm from "@/components/MilestoneForm";
import MilestoneCard from "@/components/MilestoneCard";
import { useToast } from "@/hooks/use-toast";

export default function Milestones() {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<MilestoneWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneWithMetrics | null>(null);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const data = await milestoneService.getMilestones();
      setMilestones(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load milestones",
        variant: "destructive"
      });
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (milestoneData: any) => {
    await milestoneService.createMilestone(milestoneData);
    await loadMilestones();
    setShowCreateModal(false);
  };

  const handleUpdateMilestone = async (milestoneData: any) => {
    if (editingMilestone) {
      await milestoneService.updateMilestone(editingMilestone.id, milestoneData);
      await loadMilestones();
      setEditingMilestone(null);
      setShowEditModal(false);
    }
  };

  const handleUpdateAmount = async (id: string, newAmount: number) => {
    await milestoneService.updateMilestone(id, { current_amount: newAmount });
    await loadMilestones();
  };

  const handleDeleteMilestone = async (id: string) => {
    await milestoneService.deleteMilestone(id);
    await loadMilestones();
  };

  const handleEdit = (milestone: MilestoneWithMetrics) => {
    setEditingMilestone(milestone);
    setShowEditModal(true);
  };

  const handleCancelEdit = () => {
    setEditingMilestone(null);
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Milestones</h1>
          <p className="text-muted-foreground">Track your financial goals and achievements</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Milestone</DialogTitle>
            </DialogHeader>
            <MilestoneForm
              onSubmit={handleCreateMilestone}
              onCancel={() => setShowCreateModal(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <MilestoneForm
              onSubmit={handleUpdateMilestone}
              initialData={editingMilestone}
              isEditing={true}
              onCancel={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Milestones Overview */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{milestones.length}</div>
                <div className="text-sm text-muted-foreground">Total Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {milestones.filter(m => m.progress_percentage >= 100).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${milestones.reduce((sum, m) => sum + m.current_amount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No milestones created yet.</p>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Milestone
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Milestone</DialogTitle>
                </DialogHeader>
                <MilestoneForm
                  onSubmit={handleCreateMilestone}
                  onCancel={() => setShowCreateModal(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onEdit={handleEdit}
              onDelete={handleDeleteMilestone}
              onUpdateAmount={handleUpdateAmount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
