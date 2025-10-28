const blockcypherToken = import.meta.env.VITE_BLOCKCYPHER_TOKEN;

const SYMBOL_TO_NETWORK: { [key: string]: string } = {
    BTC: 'btc/main',
    LTC: 'ltc/main',
    ETH: 'eth/main',
    USDT: 'eth/main', 
};

const SYMBOL_TO_DIVISOR: { [key: string]: number } = {
    BTC: 1e8,
    LTC: 1e8,
    ETH: 1e18,
    USDT: 1e6, // Assuming USDT is ERC20 with 6 decimals
};

interface DepositInfo {
    status: 'not_found' | 'found' | 'confirmed';
    confirmations: number;
    receivedAmount: number;
}

export async function checkDeposit(address: string, currency: string, expectedAmount: number): Promise<DepositInfo> {
    const network = SYMBOL_TO_NETWORK[currency.toUpperCase()];
    const divisor = SYMBOL_TO_DIVISOR[currency.toUpperCase()];

    if (!network || !divisor) {
        console.warn(`Unsupported currency for deposit check: ${currency}`);
        return { status: 'not_found', confirmations: 0, receivedAmount: 0 };
    }

    const apiUrl = `https://api.blockcypher.com/v1/${network}/addrs/${address}/full${blockcypherToken && blockcypherToken !== 'YOUR_API_KEY' ? `?token=${blockcypherToken}` : ''}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            if (response.status === 404) {
                 return { status: 'not_found', confirmations: 0, receivedAmount: 0 };
            }
            throw new Error(`BlockCypher API error: ${response.statusText}`);
        }
        const data = await response.json();

        const allTxs = [...(data.unconfirmed_txs || []), ...(data.txs || [])];

        for (const tx of allTxs) {
            for (const output of tx.outputs) {
                if (output.addresses && output.addresses.includes(address)) {
                    const received = output.value / divisor;
                    // Check if received amount is at least 99.9% of expected amount
                    if (received >= expectedAmount * 0.999) {
                         return {
                            status: tx.confirmations >= 3 ? 'confirmed' : 'found',
                            confirmations: tx.confirmations,
                            receivedAmount: received,
                        };
                    }
                }
            }
        }

        return { status: 'not_found', confirmations: 0, receivedAmount: 0 };

    } catch (error) {
        console.error("Error checking deposit with BlockCypher:", error);
        return { status: 'not_found', confirmations: 0, receivedAmount: 0 };
    }
}
