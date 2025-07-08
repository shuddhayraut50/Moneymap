export const reitsData = {
    low: [
        { name: "Brookfield India Real Estate Trust", price: 290 },
        { name: "Embassy Office Parks REIT", price: 378 }
    ],
    medium: [
        { name: "Mindspace Business Parks REIT", price: 381 },
        { name: "K Raheja Corp", price: 800 }
    ],
    high: [
        { name: "Phoenix Mills", price: 450 },
        { name: "Indiabulls Real Estate", price: 500 }
    ]
};
export async function syncReitPrices() {
    try {
        const response = await fetch('http://localhost:3001/get-value-reits');
        const data = await response.json();
        // Update prices in reitsData
        Object.keys(reitsData).forEach(risk => {
            reitsData[risk].forEach(reit => {
                if (data[reit.name]) {
                    reit.price = data[reit.name].updated;
                }
            });
        });
    } catch (error) {
        console.error('Failed to sync REIT prices:', error);
    }
}

// Sync every 1 minute
setInterval(syncReitPrices, 60000);
// Initial sync
syncReitPrices();