
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSubcategoryTransactions } from "@/hooks/useSubcategoryTransactions";

interface SubcategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategoryName: string;
  subcategoryId: string;
  onConfirmDelete: () => void;
}

export default function SubcategoryDeleteDialog({
  open,
  onOpenChange,
  subcategoryName,
  subcategoryId,
  onConfirmDelete
}: SubcategoryDeleteDialogProps) {
  const { hasTransactions, loading } = useSubcategoryTransactions(subcategoryId);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {loading ? (
              "Checking for linked expenses..."
            ) : hasTransactions ? (
              <>
                This will permanently delete the "{subcategoryName}" subcategory and <strong>all related expenses</strong>. 
                This action cannot be undone.
              </>
            ) : (
              <>
                This action cannot be undone. This will permanently delete the "{subcategoryName}" subcategory.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDelete} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
          >
            {hasTransactions ? "Delete Subcategory & Expenses" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
