import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';

type ExchangePair = Tables<'exchange_pairs'>;

export const useExchangeConfig = () => {
  const [loading, setLoading] = useState(true);
  const [exchangePairs, setExchangePairs] = useState<ExchangePair[]>([]);

  useEffect(() => {
    const fetchPairs = async () => {
      setLoading(true);
      const { data: pairsData, error: pairsError } = await supabase
        .from('exchange_pairs')
        .select('*');
      
      if (pairsError) {
        toast.error('Could not load exchange pairs.');
      } else if (pairsData) {
        setExchangePairs(pairsData);
      }
      
      setLoading(false);
    };
    fetchPairs();
  }, []);

  return { loading, exchangePairs };
};
