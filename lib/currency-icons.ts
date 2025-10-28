import { Wallet } from 'lucide-react';
import React from 'react';
import { useCurrencies } from '@/contexts/CurrencyContext';

interface CurrencyIconProps {
    symbol: string;
    className?: string;
}

export const CurrencyIcon: React.FC<CurrencyIconProps> = ({ symbol, className = "h-6 w-6" }) => {
    const { getCurrencyBySymbol } = useCurrencies();
    const currency = getCurrencyBySymbol(symbol);

    if (currency?.icon_url) {
        return React.createElement('img', { 
            src: currency.icon_url, 
            alt: currency.name, 
            className: `${className} object-contain rounded-full` 
        });
    }
    
    return React.createElement(Wallet, { className });
};
