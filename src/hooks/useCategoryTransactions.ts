
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';

export const useCategoryTransactions = (categoryId: string) => {
  const [hasTransactions, setHasTransactions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTransactions = async () => {
      try {
        setLoading(true);
        const hasLinkedTransactions = await supabaseService.categoryHasTransactions(categoryId);
        setHasTransactions(hasLinkedTransactions);
      } catch (error) {
        console.error('Error checking category transactions:', error);
        setHasTransactions(false);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      checkTransactions();
    }
  }, [categoryId]);

  return { hasTransactions, loading };
};
