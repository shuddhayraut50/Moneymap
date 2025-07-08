export const mutualFundData = {
    low: [
        { name: "Kotak Liquid Fund", nav: 40.09 },
        { name: "Nippon India Money Market Fund", nav: 33.51 }
    ],
    medium: [
        { name: "DSP Equity Opportunities Fund", nav: 367.38 },
        { name: "UTI Flexi Cap Fund", nav: 295.22 }
    ],
    high: [
        { name: "Franklin India High Growth", nav: 500 },
        { name: "SBI Consumption Opportunities", nav: 300 }
    ]
};
export async function syncMutualFundNAVs() {
    try {
        const response = await fetch('http://localhost:3001/get-value-mutualfunds');
        const data = await response.json();
        // Update NAVs in mutualFundData
        Object.keys(mutualFundData).forEach(risk => {
            mutualFundData[risk].forEach(fund => {
                if (data[fund.name]) {
                    fund.nav = data[fund.name].updated;
                }
            });
        });
    } catch (error) {
        console.error('Failed to sync mutual fund NAVs:', error);
    }
}

// Sync every 1 minute
setInterval(syncMutualFundNAVs, 60000);
// Initial sync
syncMutualFundNAVs();