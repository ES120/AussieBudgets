
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import { supabaseService } from "@/services/supabaseService";
import { getBudget } from "@/lib/supabaseStore";
import { TransactionType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface TransactionListProps {
  currentMonth: string;
  transactions: TransactionType[];
  onUpdate: () => void;
}

export default function TransactionList({ currentMonth, transactions, onUpdate }: TransactionListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<TransactionType | null>(null);
  const [transactionData, setTransactionData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    type: "expense" as "income" | "expense",
    subcategoryId: "" as string | null,
    description: ""
  });
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load subcategories when dialog opens
  const loadSubcategories = async () => {
    try {
      const budget = await getBudget(currentMonth);
      const subcategories = budget.categories.flatMap(category => 
        category.subcategories.map(subcategory => ({
          ...subcategory,
          categoryName: category.name
        }))
      );
      setAllSubcategories(subcategories);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!transactionData.amount || parseFloat(transactionData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!transactionData.date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }
    
    if (transactionData.type === "expense" && !transactionData.subcategoryId) {
      toast({
        title: "Error",
        description: "Please select a subcategory for the expense",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const newTransaction: TransactionType = {
        id: generateId(),
        amount: parseFloat(transactionData.amount),
        date: transactionData.date,
        type: transactionData.type,
        subcategoryId: transactionData.type === "income" ? null : transactionData.subcategoryId,
        description: transactionData.description.trim()
      };
      
      await supabaseService.saveTransaction(newTransaction);
      
      setTransactionData({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        type: "expense",
        subcategoryId: null,
        description: ""
      });
      
      setDialogOpen(false);
      onUpdate();
      
      toast({
        title: "Transaction Added",
        description: `${transactionData.type === "income" ? "Income" : "Expense"} of ${formatCurrency(parseFloat(transactionData.amount))} has been recorded.`
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editTransaction) return;
    
    if (parseFloat(editTransaction.amount.toString()) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (editTransaction.type === "expense" && !editTransaction.subcategoryId) {
      toast({
        title: "Error",
        description: "Please select a subcategory for the expense",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const updatedTransaction: TransactionType = {
        ...editTransaction,
        amount: parseFloat(editTransaction.amount.toString()),
        subcategoryId: editTransaction.type === "income" ? null : editTransaction.subcategoryId,
        description: editTransaction.description.trim()
      };
      
      await supabaseService.saveTransaction(updatedTransaction);
      
      setEditTransaction(null);
      setDialogOpen(false);
      onUpdate();
      
      toast({
        title: "Transaction Updated",
        description: "Changes have been saved successfully."
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await supabaseService.deleteTransaction(id);
      onUpdate();
      
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been removed from your records."
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const resetDialogState = () => {
    setEditTransaction(null);
    setTransactionData({
      amount: "",
      date: new Date().toISOString().split('T')[0],
      type: "expense",
      subcategoryId: null,
      description: ""
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Transactions</CardTitle>
          <CardDescription>Manage your income and expenses</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialogState();
          else loadSubcategories();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
              <DialogDescription>
                {editTransaction 
                  ? "Update the details of this transaction." 
                  : "Record a new income or expense transaction."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select
                  value={editTransaction ? editTransaction.type : transactionData.type}
                  onValueChange={(value: "income" | "expense") => 
                    editTransaction 
                      ? setEditTransaction({...editTransaction, type: value, subcategoryId: value === "income" ? null : editTransaction.subcategoryId})
                      : setTransactionData({...transactionData, type: value, subcategoryId: value === "income" ? null : transactionData.subcategoryId})
                  }
                >
                  <SelectTrigger id="transactionType" className="mt-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="transactionAmount">Amount</Label>
                <Input
                  id="transactionAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editTransaction ? editTransaction.amount : transactionData.amount}
                  onChange={(e) => 
                    editTransaction 
                      ? setEditTransaction({...editTransaction, amount: parseFloat(e.target.value) || 0})
                      : setTransactionData({...transactionData, amount: e.target.value})
                  }
                  className="mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="transactionDate">Date</Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={editTransaction ? editTransaction.date : transactionData.date}
                  onChange={(e) => 
                    editTransaction 
                      ? setEditTransaction({...editTransaction, date: e.target.value})
                      : setTransactionData({...transactionData, date: e.target.value})
                  }
                  className="mt-2"
                />
              </div>
              
              {(editTransaction ? editTransaction.type : transactionData.type) === "expense" && (
                <div>
                  <Label htmlFor="transactionSubcategory">Subcategory</Label>
                  <Select
                    value={editTransaction ? editTransaction.subcategoryId || "" : transactionData.subcategoryId || ""}
                    onValueChange={(value) => 
                      editTransaction 
                        ? setEditTransaction({...editTransaction, subcategoryId: value})
                        : setTransactionData({...transactionData, subcategoryId: value})
                    }
                  >
                    <SelectTrigger id="transactionSubcategory" className="mt-2">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.categoryName}: {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="transactionDescription">Description (optional)</Label>
                <Input
                  id="transactionDescription"
                  value={editTransaction ? editTransaction.description : transactionData.description}
                  onChange={(e) => 
                    editTransaction 
                      ? setEditTransaction({...editTransaction, description: e.target.value})
                      : setTransactionData({...transactionData, description: e.target.value})
                  }
                  className="mt-2"
                  placeholder="Enter description"
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
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={editTransaction ? handleUpdateTransaction : handleAddTransaction} disabled={saving}>
                {saving ? "Saving..." : (editTransaction ? "Save Changes" : "Add Transaction")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <Alert>
            <AlertDescription>
              No transactions yet. Add your first transaction by clicking the button above.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.map((transaction) => {
              const subcategory = allSubcategories.find(s => s.id === transaction.subcategoryId);
              
              return (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${transaction.type === 'income' ? 'bg-budget-under' : 'bg-budget-neutral'}`}></div>
                      <p className="font-medium">
                        {transaction.description || (transaction.type === 'income' ? 'Income' : subcategory ? subcategory.name : 'Expense')}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-2">
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.type === 'expense' && subcategory && (
                        <>
                          <span>•</span>
                          <span>{subcategory.categoryName}: {subcategory.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${transaction.type === 'income' ? 'text-budget-under' : ''}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditTransaction(transaction);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this transaction?")) {
                            handleDeleteTransaction(transaction.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
