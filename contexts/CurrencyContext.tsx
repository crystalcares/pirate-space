import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Tables } from '@/lib/database.types';
import { toast } from 'sonner';

export type Currency = Tables<'currencies'>;

interface CurrencyContextType {
  currencies: Currency[];
  getCurrencyBySymbol: (symbol: string) => Currency | undefined;
  loading: boolean;
  refetch: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCurrencies = async (signal?: AbortSignal) => {
    setLoading(true);
    const query = supabase.from('currencies').select('*').order('name');
    if (signal) {
      query.abortSignal(signal);
    }
    
    const { data, error } = await query;

    if (error) {
      if (error.code !== '20') { // '20' is AbortError
        toast.error('Failed to load currencies.');
        console.error('Failed to load currencies configuration.', error);
      }
      setCurrencies([]);
    } else if (data) {
      setCurrencies(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCurrencies(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const getCurrencyBySymbol = (symbol: string): Currency | undefined => {
    return currencies.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
  };

  const value = {
    currencies,
    getCurrencyBySymbol,
    loading,
    refetch: () => fetchCurrencies(),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencies = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrencies must be used within a CurrencyProvider');
  }
  return context;
};
