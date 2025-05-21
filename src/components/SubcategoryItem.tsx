
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getBudget, saveBudget } from "@/lib/store";
import { formatCurrency, generateId, getProgressBarColor } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { SubcategoryType } from "@/lib/types";

interface SubcategoryItemProps {
  currentMonth: string;
  categoryId: string;
  subcategories: Array<SubcategoryType & { 
    spent: number; 
    remaining: number;
    status: "under" | "warning" | "over" | "neutral";
  }>;
  onUpdate: () => void;
}

export default function SubcategoryItem({ currentMonth, categoryId, subcategories, onUpdate }: SubcategoryItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSubcategory, setEditSubcategory] = useState<SubcategoryType | null>(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryAmount, setSubcategoryAmount] = useState("");
  const { toast } = useToast();

  const handleAddSubcategory = () => {
    if (!subcategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subcategory name",
        variant: "destructive",
      });
      return;
    }
    
    const budget = getBudget(currentMonth);
    const categoryIndex = budget.categories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex >= 0) {
      const newSubcategory: SubcategoryType = {
        id: generateId(),
        name: subcategoryName.trim(),
        budgeted: parseFloat(subcategoryAmount) || 0,
        categoryId: categoryId
      };
      
      budget.categories[categoryIndex].subcategories.push(newSubcategory);
      saveBudget(budget);
      
      setSubcategoryName("");
      setSubcategoryAmount("");
      setDialogOpen(false);
      onUpdate();
      
      toast({
        title: "Subcategory Added",
        description: `${newSubcategory.name} has been added to your budget.`
      });
    }
  };

  const handleUpdateSubcategory = () => {
    if (!editSubcategory || !editSubcategory.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subcategory name",
        variant: "destructive",
      });
      return;
    }
    
    const budget = getBudget(currentMonth);
    const categoryIndex = budget.categories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex >= 0) {
      const subcategoryIndex = budget.categories[categoryIndex].subcategories.findIndex(
        s => s.id === editSubcategory.id
      );
      
      if (subcategoryIndex >= 0) {
        budget.categories[categoryIndex].subcategories[subcategoryIndex] = {
          ...editSubcategory,
          name: editSubcategory.name.trim(),
          budgeted: parseFloat(editSubcategory.budgeted.toString()) || 0
        };
        
        saveBudget(budget);
        
        setEditSubcategory(null);
        setDialogOpen(false);
        onUpdate();
        
        toast({
          title: "Subcategory Updated",
          description: "Changes have been saved successfully."
        });
      }
    }
  };

  const handleDeleteSubcategory = (subcategoryId: string) => {
    const budget = getBudget(currentMonth);
    const categoryIndex = budget.categories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex >= 0) {
      budget.categories[categoryIndex].subcategories = 
        budget.categories[categoryIndex].subcategories.filter(s => s.id !== subcategoryId);
        
      saveBudget(budget);
      onUpdate();
      
      toast({
        title: "Subcategory Deleted",
        description: "Subcategory has been removed from your budget."
      });
    }
  };

  const resetDialogState = () => {
    setEditSubcategory(null);
    setSubcategoryName("");
    setSubcategoryAmount("");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Subcategories</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialogState();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editSubcategory ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
              <DialogDescription>
                {editSubcategory 
                  ? "Update the details of this subcategory." 
                  : "Create a new subcategory within this budget category."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="subcategoryName">Subcategory Name</Label>
                <Input
                  id="subcategoryName"
                  value={editSubcategory ? editSubcategory.name : subcategoryName}
                  onChange={(e) => 
                    editSubcategory 
                      ? setEditSubcategory({...editSubcategory, name: e.target.value})
                      : setSubcategoryName(e.target.value)
                  }
                  className="mt-2"
                  placeholder="e.g., Groceries, Rent, Utilities"
                />
              </div>
              
              <div>
                <Label htmlFor="subcategoryAmount">Budget Amount</Label>
                <Input
                  id="subcategoryAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editSubcategory 
                    ? editSubcategory.budgeted.toString() 
                    : subcategoryAmount
                  }
                  onChange={(e) => 
                    editSubcategory 
                      ? setEditSubcategory({...editSubcategory, budgeted: parseFloat(e.target.value) || 0})
                      : setSubcategoryAmount(e.target.value)
                  }
                  className="mt-2"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDialogOpen(false);
                  resetDialogState();
                }}
              >
                Cancel
              </Button>
              <Button onClick={editSubcategory ? handleUpdateSubcategory : handleAddSubcategory}>
                {editSubcategory ? "Save Changes" : "Add Subcategory"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {subcategories.length === 0 ? (
        <Alert>
          <AlertDescription>
            No subcategories yet. Add one to start budgeting.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {subcategories.map((subcategory) => {
            const percentUsed = subcategory.budgeted > 0 
              ? Math.min((subcategory.spent / subcategory.budgeted) * 100, 100)
              : 0;
              
            return (
              <div key={subcategory.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{subcategory.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(subcategory.spent)} of {formatCurrency(subcategory.budgeted)} 
                      {subcategory.budgeted > 0 && ` (${Math.round(percentUsed)}%)`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditSubcategory(subcategory);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this subcategory?")) {
                          handleDeleteSubcategory(subcategory.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressBarColor(subcategory.status)}`}
                      style={{ width: `${percentUsed}%` }}
                    ></div>
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    subcategory.status === "over" ? "text-budget-over" :
                    subcategory.status === "warning" ? "text-budget-warning" :
                    subcategory.status === "under" ? "text-budget-under" : "text-budget-neutral"
                  }`}>
                    {formatCurrency(subcategory.remaining)} remaining
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
