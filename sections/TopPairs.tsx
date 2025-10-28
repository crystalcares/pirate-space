import { ArrowRight } from "lucide-react";
import { CurrencyIcon } from "@/lib/currency-icons";
import { Link } from "react-router-dom";

const cryptoToCryptoPairs = [
    { from: 'ETH', to: 'SOL' },
    { from: 'SOL', to: 'ETH' },
    { from: 'ETH', to: 'BTC' },
    { from: 'BTC', to: 'SOL' },
    { from: 'XMR', to: 'BTC' },
    { from: 'BTC', to: 'ETH' },
    { from: 'BTC', to: 'THETA' },
];

const fiatToCryptoPairs = [
    { from: 'USDC', to: 'EUR' },
    { from: 'ETH', to: 'EUR' },
    { from: 'BTC', to: 'USD' },
    { from: 'SOL', to: 'EUR' },
    { from: 'LTC', to: 'EUR' },
    { from: 'USDT', to: 'USD' },
    { from: 'USDT', to: 'USD' },
];

const PairItem = ({ from, to }: { from: string, to: string }) => (
    <Link to="/exchange" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
        <div className="flex items-center gap-3">
            <CurrencyIcon symbol={from} className="h-6 w-6" />
            <span className="font-semibold">{from}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <CurrencyIcon symbol={to} className="h-6 w-6" />
            <span className="font-semibold">{to}</span>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
    </Link>
);

const TopPairs = () => {
    return (
        <section className="py-12">
            <h2 className="text-3xl font-bold text-center mb-8">Top pairs on Pirate.Exchange</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Crypto-to-crypto</h3>
                    <div className="space-y-2">
                        {cryptoToCryptoPairs.map((pair, index) => (
                            <PairItem key={`c2c-${index}`} from={pair.from} to={pair.to} />
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-4">Fiat-to-crypto</h3>
                    <div className="space-y-2">
                        {fiatToCryptoPairs.map((pair, index) => (
                            <PairItem key={`f2c-${index}`} from={pair.from} to={pair.to} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TopPairs;
