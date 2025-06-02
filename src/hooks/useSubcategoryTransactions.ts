
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';

export const useSubcategoryTransactions = (subcategoryId: string) => {
  const [hasTransactions, setHasTransactions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTransactions = async () => {
      try {
        setLoading(true);
        const hasLinkedTransactions = await supabaseService.subcategoryHasTransactions(subcategoryId);
        setHasTransactions(hasLinkedTransactions);
      } catch (error) {
        console.error('Error checking subcategory transactions:', error);
        setHasTransactions(false);
      } finally {
        setLoading(false);
      }
    };

    if (subcategoryId) {
      checkTransactions();
    }
  }, [subcategoryId]);

  return { hasTransactions, loading };
};
