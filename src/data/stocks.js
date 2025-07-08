export const stocksData = {
    low: [
        { name: "UltraTech Cement", price: 1211 },
        { name: "Maruti Suzuki India", price: 23.00 }
    ],
    medium: [
        { name: "Pidilite Industries", price: 2892.00 },
        { name: "Adani Green Energy", price: 923.80 }
    ],
    high: [
        { name: "Adani Enterprises Ltd.", price: 2222.00 },
        { name: "HDFC Bank Ltd.", price: 1758.15 }
    ]
};

// Function to update stock prices from server (now expects backend to serve from database)
export async function syncStockPrices() {
    try {
        const response = await fetch('http://localhost:3001/get-value');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Update prices in stocksData
        Object.keys(stocksData).forEach(risk => {
            stocksData[risk].forEach(stock => {
                if (data[stock.name]) {
                    stock.price = data[stock.name].updated;
                }
            });
        });
    } catch (error) {
        console.error('Failed to sync stock prices:', error);
    }
}

// Sync every 1 minute
setInterval(syncStockPrices, 60000);
// Initial sync
syncStockPrices();