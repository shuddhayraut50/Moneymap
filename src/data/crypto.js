export const cryptoData = {
    low: [
        { name: "Bitcoin (BTC)", price: 6662300.45 },
        { name: "Ethereum (ETH)", price: 126802.03 }
    ],
    medium: [
        { name: "Bitcoin (BTC)", price: 6662300.45 },
        { name: "Ethereum (ETH)", price: 126802.03 },
        { name: "Binance Coin (BNB)", price: 47694.35 }
    ],
    high: [
        { name: "Bitcoin (BTC)", price: 6662300.45 },
        { name: "Ethereum (ETH)", price: 126802.03 },
        { name: "Binance Coin (BNB)", price: 47694.35 },
        { name: "Solana (SOL)", price: 9149.64 },
        { name: "Dogecoin (DOGE)", price: 12.56 }
    ]
};

// Function to update crypto prices from server
export async function syncCryptoPrices() {
    try {
        const response = await fetch('http://localhost:3001/get-value-crypto');
        const data = await response.json();
        // Update prices in cryptoData
        Object.keys(cryptoData).forEach(risk => {
            cryptoData[risk].forEach(crypto => {
                if (data[crypto.name]) {
                    crypto.price = data[crypto.name].updated;
                }
            });
        });
    } catch (error) {
        console.error('Failed to sync crypto prices:', error);
    }
}

// Sync every 1 minute
setInterval(syncCryptoPrices, 60000);
// Initial sync
syncCryptoPrices();