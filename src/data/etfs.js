export const etfData = {
    low: [
        { name: "Nippon Gold ETF", price: 74.92 },
        { name: "HDFC Gold ETF", price: 77.16 },
        { name: "SBI Gold ETF", price: 77.02 }
    ],
    medium: [
        { name: "ICICI Prudential Nifty Next 50 ETF", price: 300.00 },
        { name: "Motilal Oswal NASDAQ 100 ETF", price: 1500.00 }
    ],
    high: [
        { name: "Invesco India Nifty ETF", price: 200.00 },
        { name: "Nippon India Nifty 50 ETF", price: 250.00 }
    ]
};

export async function syncEtfPrices() {
    try {
        const response = await fetch('http://localhost:3001/get-value-etfs');
        const data = await response.json();
        // Update prices in etfData
        Object.keys(etfData).forEach(risk => {
            etfData[risk].forEach(etf => {
                if (data[etf.name]) {
                    etf.price = data[etf.name].updated;
                }
            });
        });
    } catch (error) {
        console.error('Failed to sync ETF prices:', error);
    }
}

// Sync every 1 minute
setInterval(syncEtfPrices, 60000);
// Initial sync
syncEtfPrices();