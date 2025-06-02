
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCategoryTransactions } from "@/hooks/useCategoryTransactions";

interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  categoryId: string;
  onConfirmDelete: () => void;
}

export default function CategoryDeleteDialog({
  open,
  onOpenChange,
  categoryName,
  categoryId,
  onConfirmDelete
}: CategoryDeleteDialogProps) {
  const { hasTransactions, loading } = useCategoryTransactions(categoryId);

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
                This will permanently delete the "{categoryName}" category and <strong>all related expenses</strong>. 
                This action cannot be undone.
              </>
            ) : (
              <>
                This action cannot be undone. This will permanently delete the "{categoryName}" category and all its subcategories.
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
            {hasTransactions ? "Delete Category & Expenses" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
