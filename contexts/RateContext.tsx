import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useCurrencies } from './CurrencyContext';
import { currencyToCoinGeckoId, getCoinGeckoIdsForSymbols, getFiatSymbols } from '@/lib/coingecko';

interface Rates {
  [coinId: string]: {
    [fiatSymbol: string]: number;
  };
}

interface RateContextType {
  rates: Rates;
  loading: boolean; // For initial load
  isRefetching: boolean; // For background updates
  lastUpdated: Date | null;
  getConversionRate: (from: string, to: string) => number;
}

const RateContext = createContext<RateContextType | undefined>(undefined);

export const RateProvider = ({ children }: { children: ReactNode }) => {
  const [rates, setRates] = useState<Rates>({});
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { currencies, loading: currenciesLoading } = useCurrencies();

  const fetchRates = useCallback(async (isInitial = false) => {
    if (currencies.length === 0) {
        if (isInitial) setLoading(false);
        return;
    }
    
    if (!isInitial) {
        setIsRefetching(true);
    }

    const symbols = currencies.map(c => c.symbol);
    const coinGeckoIds = getCoinGeckoIdsForSymbols(symbols);
    const fiatSymbols = getFiatSymbols(symbols);

    if (coinGeckoIds.length === 0 || fiatSymbols.length === 0) {
      if (isInitial) setLoading(false);
      setIsRefetching(false);
      return;
    }

    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=${fiatSymbols.join(',').toLowerCase()}`);
      if (!response.ok) throw new Error('Failed to fetch rates from CoinGecko');
      const data = await response.json();
      setRates(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch live rates:", error);
    } finally {
      if (isInitial) setLoading(false);
      setIsRefetching(false);
    }
  }, [currencies]);

  useEffect(() => {
    if (!currenciesLoading) {
        fetchRates(true); // Initial fetch
        const interval = setInterval(() => fetchRates(false), 60000); // Subsequent fetches every minute
        return () => clearInterval(interval);
    }
  }, [currenciesLoading, fetchRates]);

  const getConversionRate = useCallback((from: string, to: string): number => {
    const fromId = currencyToCoinGeckoId[from.toUpperCase()];
    const toId = currencyToCoinGeckoId[to.toUpperCase()];
    const fromIsFiat = !fromId || ['usd', 'inr', 'eur'].includes(fromId);
    const toIsFiat = !toId || ['usd', 'inr', 'eur'].includes(toId);

    if (loading || Object.keys(rates).length === 0) return 0;
    
    // Case 1: Crypto to Crypto
    if (!fromIsFiat && !toIsFiat) {
        const fromRate = rates[fromId]?.usd;
        const toRate = rates[toId]?.usd;
        if (fromRate && toRate) {
            return fromRate / toRate;
        }
    }
    // Case 2: Crypto to Fiat
    else if (!fromIsFiat && toIsFiat) {
        const fiatSymbol = to.toLowerCase();
        if (rates[fromId]?.[fiatSymbol]) {
            return rates[fromId][fiatSymbol];
        }
    }
    // Case 3: Fiat to Crypto
    else if (fromIsFiat && !toIsFiat) {
        const fiatSymbol = from.toLowerCase();
        if (rates[toId]?.[fiatSymbol]) {
            return 1 / rates[toId][fiatSymbol];
        }
    }
    
    return 0;
  }, [rates, loading]);

  const value = { rates, loading, isRefetching, lastUpdated, getConversionRate };

  return <RateContext.Provider value={value}>{children}</RateContext.Provider>;
};

export const useRates = () => {
  const context = useContext(RateContext);
  if (context === undefined) {
    throw new Error('useRates must be used within a RateProvider');
  }
  return context;
};
