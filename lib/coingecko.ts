export const currencyToCoinGeckoId: { [key: string]: string } = {
  // Crypto
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  LTC: 'litecoin',
  USDT: 'tether',
  USDC: 'usd-coin',
  XMR: 'monero',
  THETA: 'theta-token',
  
  // Fiat (for vs_currencies)
  USD: 'usd',
  INR: 'inr',
  EUR: 'eur',
};

export const getCoinGeckoIdsForSymbols = (symbols: string[]): string[] => {
    return symbols
        .map(s => currencyToCoinGeckoId[s.toUpperCase()])
        .filter(id => id && !['usd', 'inr', 'eur'].includes(id));
};

export const getFiatSymbols = (symbols: string[]): string[] => {
    return symbols.filter(s => ['USD', 'INR', 'EUR'].includes(s.toUpperCase()));
}
