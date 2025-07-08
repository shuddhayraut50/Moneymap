import { cryptoData } from './data/crypto.js';
import { etfData } from './data/etfs.js';
import { mutualFundData } from './data/mutualFunds.js';
import { reitsData } from './data/reits.js';
import { stocksData } from './data/stocks.js';
import { fdData, getFDInterestRate } from './data/fd.js';

function autoSelection() {
    
    // Automatically allocate investments based on some criteria
    let allocation = getCurrentAllocation();
    displayAllocation(allocation);
    showPopup("Automatic allocation complete.", 3000);

    let purchaseSummaries = "";
    let stockRemaining = 0; // Add this at the top of autoSelection()

    let mutualFundsRemainingAmount = 0;
    let goldEtfsRemainingAmount = 0;
    let reitsRemainingAmount = 0;
    let sgbRemainingAmount = 0;
    let ppfRemainingAmount = 0;
    let nscRemainingAmount = 0;    let cryptoRemainingAmount = 0;
    let fdRemainingAmount = 0;
    let remainingAmount = 0;

    function appendPurchaseSummary(label, purchases, remaining, type) {
        let summary = purchases.map(s => {
            if (type === "stock") {
                return `<p>${s.name} - Unit: ${s.unit}, Price: ₹${s.price.toFixed(2)}, Total: ₹${s.total.toFixed(2)}</p>`;
            } else if (type === "mf") {
                return `<p>${s.name} - Unit: ${s.unit}, NAV: ₹${s.nav.toFixed(2)}, Total: ₹${s.total.toFixed(2)}</p>`;
            }
            return "";
        }).join('');
        purchaseSummaries += `
            <h4>${label}</h4>
            ${summary}
            <p><strong>${label} Remaining: ₹${remaining.toFixed(2)}</strong></p>
            <hr>
        `;
    }

    function displayAllSummaries() {
        // Render the purchase summary in different UI layouts
        const autoSection = document.getElementById("autoAllocationSection");
        if (!autoSection) return;

        // Split summaries into blocks and parse each asset section
        const blocks = purchaseSummaries
            .split('<hr>')
            .filter(Boolean)
            .map(block => {
                const match = block.match(/<h4>(.*?)<\/h4>([\s\S]*)<p><strong>(.*?)<\/strong><\/p>/);
                if (match) {
                    return {
                        asset: match[1],
                        details: match[2].trim(),
                        remaining: match[3]
                    };
                }
                return null;
            })
            .filter(Boolean);

        // Option 1: Vertical Accordion Style with smooth animation
        let formattedSummary = `
            <div class="auto-summary-container" style="max-width:700px;margin:0 auto;background:#faf7ff;padding:24px 18px 18px 18px;border-radius:16px;box-shadow:0 2px 16px rgba(127,0,255,0.08);">
                <h3 style="margin-bottom:24px;font-weight:700;color:#5A189A;text-align:center;">Auto-Selection Purchase Summary</h3>
                ${blocks.map((block, idx) => `
                    <div class="accordion" style="margin-bottom:14px;">
                        <div class="accordion-header" 
                            style="background:linear-gradient(90deg,#7F00FF 60%,#E100FF 100%);color:#fff;padding:14px 18px;font-size:1.08rem;font-weight:600;border-radius:8px 8px 0 0;cursor:pointer;transition:background 0.2s;"
                            data-idx="${idx}">
                            ${block.asset}
                        </div>
                        <div class="accordion-content" style="overflow:hidden;transition:max-height 0.6s cubic-bezier(.86,0,.07,1),padding 0.4s cubic-bezier(.86,0,.07,1),opacity 0.4s;opacity:${idx===0?'1':'0'};background:#fff;padding:0 18px;border:1px solid #f1eaff;border-top:none;border-radius:0 0 8px 8px;max-height:${idx===0?'500px':'0'};padding-top:${idx===0?'16px':'0'};padding-bottom:${idx===0?'10px':'0'};">
                            <div style="margin-bottom:8px;">
                                ${block.details.replace(/<p>/g, '<p style="margin:0 0 6px 0;color:#444;font-size:0.98rem;">')}
                            </div>
                            <div style="color:#5A189A;font-weight:600;font-size:1.01rem;">${block.remaining}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <style>
                .accordion-header.active { background:linear-gradient(90deg,#E100FF 60%,#7F00FF 100%); }
                .accordion-header:hover { filter:brightness(1.08); }
            </style>
        `;

        autoSection.innerHTML = formattedSummary;
        autoSection.style.display = 'block';

        // Add smooth accordion animation
        const headers = autoSection.querySelectorAll('.accordion-header');
        headers.forEach((header, idx) => {
            const content = header.nextElementSibling;
            if (idx === 0) {
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.paddingTop = '16px';
                content.style.paddingBottom = '10px';
                content.style.opacity = '1';
            } else {
                content.style.maxHeight = '0';
                content.style.paddingTop = '0';
                content.style.paddingBottom = '0';
                content.style.opacity = '0';
            }
            header.onclick = function () {
                const isActive = header.classList.contains('active');
                // Close all
                headers.forEach((h, i) => {
                    h.classList.remove('active');
                    const c = h.nextElementSibling;
                    c.style.maxHeight = '0';
                    c.style.paddingTop = '0';
                    c.style.paddingBottom = '0';
                    c.style.opacity = '0';
                });
                // Open this one if not already open
                if (!isActive) {
                    header.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.paddingTop = '16px';
                    content.style.paddingBottom = '10px';
                    content.style.opacity = '1';
                }
            };
        });
    }


    // --- Begin: Stock Auto-Selection Logic ---
    // Declare stockRemaining at a higher scope to be accessible in mutual funds allocation

// --- Utility Functions for Asset Purchase Logic ---
function buyAssets(assets, allocation, priceKey) {
    let totalCost = assets.reduce((sum, a) => sum + a[priceKey], 0);
    let purchases = [];
    let remaining = allocation;

    if (totalCost <= remaining) {
        let rounds = Math.floor(remaining / totalCost);
        purchases = assets.map(a => ({
            ...a,
            unit: rounds,
            total: a[priceKey] * rounds
        }));
        remaining -= totalCost * rounds;
    }

    // Now, for each asset, buy as many as possible with the remaining amount
    let sortedAssets = [...assets].sort((a, b) => b[priceKey] - a[priceKey]);
    for (let asset of sortedAssets) {
        let units = Math.floor(remaining / asset[priceKey]);
        if (units > 0) {
            purchases.push({
                ...asset,
                unit: units,
                total: asset[priceKey] * units
            });
            remaining -= asset[priceKey] * units;
        }
    }

    // Merge purchases by name
    let merged = {};
    for (let item of purchases) {
        if (merged[item.name]) {
            merged[item.name].unit += item.unit;
            merged[item.name].total += item.total;
        } else {
            merged[item.name] = { ...item };
        }
    }
    return { purchases: Object.values(merged), remaining };
}

function validatePurchaseGeneric(allocation, purchases, remaining) {
    let actualSpent = purchases.reduce((sum, item) => sum + item.total, 0);
    let EPSILON = 0.01;
    if (Math.abs(allocation - actualSpent - remaining) > EPSILON) {
        throw new Error('Purchase verification failed');
    }
}

// Example refactor for Stocks (repeat for other asset classes)
if (StocksAllocationAmount > 0) {
    let STOCK_ALLOCATION_AMOUNT = StocksAllocationAmount;
    let SELECTED_RISK = risk_level;

    // Use imported stocksData
    try {
        let stocks = stocksData[SELECTED_RISK.toLowerCase()] || [];
        if (!stocks.length) throw new Error('No stocks available for selected risk level');

        let { purchases, remaining } = buyAssets(stocks, STOCK_ALLOCATION_AMOUNT, "price");
        validatePurchaseGeneric(STOCK_ALLOCATION_AMOUNT, purchases, remaining);
        appendPurchaseSummary("Stocks", purchases, remaining, "stock");
        stockRemaining = remaining;
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
} else {
    stocksRemainingAmount = StocksAllocationAmount;
}


if (MutualFundsAllocationAmount > 0) { // <-- Only check MF allocation
    let MUTUAL_FUND_ALLOCATION_AMOUNT = MutualFundsAllocationAmount + stockRemaining;
    let SELECTED_RISK = risk_level;

    // Use imported mutualFundData
    function getFundsByRisk(riskLevel) {
        if (!mutualFundData[riskLevel]) {
            return [];
        }
        return [...mutualFundData[riskLevel]];
    }

    try {
        let funds = getFundsByRisk(SELECTED_RISK.toLowerCase());
        if (!funds || funds.length === 0) {
            throw new Error('No funds available for selected risk level');
        }

        let totalCost = calculateTotalCost(funds);

        if (totalCost === 0) {
            throw new Error('Fund NAV cannot be zero');
        }

        let purchasedFunds = [];
        let remaining = MUTUAL_FUND_ALLOCATION_AMOUNT;

        if (totalCost <= remaining) {
            let rounds = Math.floor(remaining / totalCost);
            purchasedFunds = buyFullRounds(funds, rounds);
            remaining -= totalCost * rounds;

            // Buy remaining funds and update remaining
            let remainingPurchase = buyRemainingFunds(funds, remaining);
            purchasedFunds = purchasedFunds.concat(remainingPurchase.purchases);
            remaining = remainingPurchase.remaining;
        } else {
            // Buy remaining funds and update remaining
            let remainingPurchase = buyRemainingFunds(funds, remaining);
            purchasedFunds = remainingPurchase.purchases;
            remaining = remainingPurchase.remaining;
        }

        let mergedPurchases = mergeFundPurchases(purchasedFunds);

        validatePurchase(mergedPurchases, remaining);

        showPurchaseSummary(mergedPurchases, remaining);
        remainingAmount = remaining;

    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }

    function calculateTotalCost(funds) {
        return funds.reduce((sum, fund) => sum + fund.nav, 0);
    }

    function buyFullRounds(funds, rounds) {
        return funds.map(fund => ({
            ...fund,
            unit: rounds,
            total: fund.nav * rounds
        }));
    }

    function buyRemainingFunds(funds, remainingAmount) {
        let sortedFunds = [...funds].sort((a, b) => b.nav - a.nav);
        let purchases = [];

        let remaining = remainingAmount;
        for (let fund of sortedFunds) {
            if (remaining >= fund.nav) {
                purchases.push({
                    ...fund,
                    unit: 1,
                    total: fund.nav
                });
                remaining -= fund.nav;
            }
        }
        return { purchases, remaining };
    }

    function mergeFundPurchases(purchases) {
        let merged = {};
        for (let item of purchases) {
            if (merged[item.name]) {
                merged[item.name].unit += item.unit;
                merged[item.name].total += item.total;
            } else {
                merged[item.name] = { ...item };
            }
        }
        return Object.values(merged);
    }

    function validatePurchase(purchases, remaining) {
        let actualSpent = purchases.reduce((sum, item) => sum + item.total, 0);
        if (!isAmountValid(MUTUAL_FUND_ALLOCATION_AMOUNT - actualSpent, remaining)) {
            throw new Error('Purchase verification failed');
        }
    }

    // Use the same isAmountValid as in stock allocation for consistency
    function isAmountValid(a, b) {
        let EPSILON = 0.01;
        return Math.abs(a - b) < EPSILON;
    }

    function showPurchaseSummary(purchases, remaining) {
        appendPurchaseSummary("Mutual Funds", purchases, remaining, "mf");
    }
    mutualFundsRemainingAmount = remainingAmount; // <-- Add this line
} else {
    // Do NOT show MF summary, just pass stock remaining
    MutualFundsAllocationAmount = 0;
    mutualFundsRemainingAmount = MutualFundsAllocationAmount + stockRemaining;
    
}

// --- Gold ETF Block ---
if (GoldETFsAllocationAmount > 0) {
    let GOLD_ETF_ALLOCATION_AMOUNT = GoldETFsAllocationAmount + mutualFundsRemainingAmount;
    
    // Use imported etfData
    let etfs = etfData[risk_level.toLowerCase()] || [];

    let remainingAmount = 0;

    try {
        if (!etfs || etfs.length === 0) {
            throw new Error('No Gold ETFs available');
        }

        let totalCost = calculateTotalCost(etfs);

        if (totalCost === 0) {
            throw new Error('Gold ETF prices cannot be zero');
        }

        let purchasedEtfs = [];
        let remaining = GOLD_ETF_ALLOCATION_AMOUNT;

        if (totalCost <= remaining) {
            let rounds = Math.floor(remaining / totalCost);
            purchasedEtfs = buyFullRounds(etfs, rounds);
            remaining -= totalCost * rounds;

            // Buy remaining funds and update remaining
            let remainingPurchase = buyRemainingEtfs(etfs, remaining);
            purchasedEtfs = purchasedEtfs.concat(remainingPurchase.purchases);
            remaining = remainingPurchase.remaining;
        } else {
            // Buy remaining funds and update remaining
            let remainingPurchase = buyRemainingEtfs(etfs, remaining);
            purchasedEtfs = remainingPurchase.purchases;
            remaining = remainingPurchase.remaining;
        }

        let mergedPurchases = mergeEtfPurchases(purchasedEtfs);

        validatePurchase(mergedPurchases, remaining);

        showPurchaseSummary(mergedPurchases, remaining);
        remainingAmount = remaining;
        goldEtfsRemainingAmount = remainingAmount; // <-- ADD THIS LINE
        

    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }

    function calculateTotalCost(etfs) {
        return etfs.reduce((sum, etf) => sum + etf.price, 0);
    }

    function buyFullRounds(etfs, rounds) {
        return etfs.map(etf => ({
            ...etf,
            unit: rounds,
            total: etf.price * rounds
        }));
    }

    function buyRemainingEtfs(etfs, remainingAmount) {
        let sortedEtfs = [...etfs].sort((a, b) => b.price - a.price);
        let purchases = [];
        let remaining = remainingAmount;

        for (let etf of sortedEtfs) {
            if (remaining >= etf.price) {
                purchases.push({
                    ...etf,
                    unit: 1,
                    total: etf.price
                });
                remaining -= etf.price;
            }
        }
        return { purchases, remaining };
    }

    function mergeEtfPurchases(purchases) {
        let merged = {};
        for (let item of purchases) {
            if (merged[item.name]) {
                merged[item.name].unit += item.unit;
                merged[item.name].total += item.total;
            } else {
                merged[item.name] = { ...item };
            }
        }
        return Object.values(merged);
    }

    function validatePurchase(purchases, remaining) {
        let actualSpent = purchases.reduce((sum, item) => sum + item.total, 0);
        if (!isAmountValid(GOLD_ETF_ALLOCATION_AMOUNT - actualSpent, remaining)) {
            throw new Error('Purchase verification failed');
        }
    }

    function isAmountValid(a, b) {
        return Math.abs(a - b).toFixed(2) === '0.00';
    }

    function showPurchaseSummary(purchases, remaining) {
        appendPurchaseSummary("Gold ETFs", purchases, remaining, "stock");
    }
} else {
    goldEtfsTotalAllocation = 0
    goldEtfsRemainingAmount = goldEtfsTotalAllocation + mutualFundsRemainingAmount;
    console.log(`Gold ETFs Remaining Amount else block: ${goldEtfsRemainingAmount}`);
}

// --- REIT Block ---

if (reitsallocationamount > 0) {
    let REIT_ALLOCATION_AMOUNT = reitsallocationamount + goldEtfsRemainingAmount;
    console.log(`REIT Allocation Amount if block: ${REIT_ALLOCATION_AMOUNT}`);
    
    // Use imported reitsData
    let reits = reitsData[risk_level.toLowerCase()] || [];

    let remainingAmount = 0;

    try {
        if (!reits || reits.length === 0) {
            throw new Error('No REITs available');
        }

        let totalCost = calculateTotalCost(reits);

        if (totalCost === 0) {
            throw new Error('REIT prices cannot be zero');
        }

        let purchasedReits = [];
        let remaining = REIT_ALLOCATION_AMOUNT;

        if (totalCost <= remaining) {
            let rounds = Math.floor(remaining / totalCost);
            purchasedReits = buyFullRounds(reits, rounds);
            remaining -= totalCost * rounds;

            // Buy remaining REITs and update remaining
            let remainingPurchase = buyRemainingReits(reits, remaining);
            purchasedReits = purchasedReits.concat(remainingPurchase.purchases);
            remaining = remainingPurchase.remaining;
        } else {
            // Buy remaining REITs and update remaining
            let remainingPurchase = buyRemainingReits(reits, remaining);
            purchasedReits = remainingPurchase.purchases;
            remaining = remainingPurchase.remaining;
        }

        let mergedPurchases = mergeReitPurchases(purchasedReits);

        validatePurchase(mergedPurchases, remaining);

        showPurchaseSummary(mergedPurchases, remaining);
        remainingAmount = remaining;
        reitsRemainingAmount = remainingAmount; // <-- ADD THIS LINE

    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }

    function calculateTotalCost(reits) {
        return reits.reduce((sum, reit) => sum + reit.price, 0);
    }

    function buyFullRounds(reits, rounds) {
        return reits.map(reit => ({
            ...reit,
            unit: rounds,
            total: reit.price * rounds
        }));
    }

    function buyRemainingReits(reits, remainingAmount) {
        let sortedReits = [...reits].sort((a, b) => b.price - a.price);
        let purchases = [];
        let remaining = remainingAmount;

        for (let reit of sortedReits) {
            if (remaining >= reit.price) {
                purchases.push({
                    ...reit,
                    unit: 1,
                    total: reit.price
                });
                remaining -= reit.price;
            }
        }
        return { purchases, remaining };
    }

    function mergeReitPurchases(purchases) {
        let merged = {};
        for (let item of purchases) {
            if (merged[item.name]) {
                merged[item.name].unit += item.unit;
                merged[item.name].total += item.total;
            } else {
                merged[item.name] = { ...item };
            }
        }
        return Object.values(merged);
    }

    function validatePurchase(purchases, remaining) {
        let actualSpent = purchases.reduce((sum, item) => sum + item.total, 0);
        if (!isAmountValid(REIT_ALLOCATION_AMOUNT - actualSpent, remaining)) {
            throw new Error('Purchase verification failed');
        }
    }

    function isAmountValid(a, b) {
        return Math.abs(a - b).toFixed(2) === '0.00';
    }

    function showPurchaseSummary(purchases, remaining) {
        appendPurchaseSummary("REITs", purchases, remaining, "stock");
    }
} else {
    reitsallocationamount = 0
    reitsRemainingAmount = reitsallocationamount + goldEtfsRemainingAmount;
    
    // console.log(`gold etf Remaining Amount else block: ${goldEtfsRemainingAmount}`);
    // console.log(`reitsallocationamount Amount else block: ${reitsallocationamount}`);
    // console.log(`REIT Remaining Amount else block: ${reitsRemainingAmount}`);
    // Do NOT show REIT summary, just pass gold ETFs remaining
}

// --- SGB Block ---
if (sgballocationamount > 0) {
    let SGB_ALLOCATION_AMOUNT = sgballocationamount + reitsRemainingAmount;
    
    let sgbPricePerGram = 8596;
    
    let purchasedGrams = 0;
    let remainingAmount = 0;
    
    try {
        let gramsPurchased = Math.floor(SGB_ALLOCATION_AMOUNT / sgbPricePerGram);
    
        let MAX_GRAMS_ALLOWED = 4000;
        if (gramsPurchased > MAX_GRAMS_ALLOWED) {
        gramsPurchased = MAX_GRAMS_ALLOWED;
        }
    
        let totalCost = gramsPurchased * sgbPricePerGram;
        remainingAmount = SGB_ALLOCATION_AMOUNT - totalCost;
        purchasedGrams = gramsPurchased;
        sgbRemainingAmount = remainingAmount; // <-- ADD THIS LINE
    
        showPurchaseSummary(gramsPurchased, totalCost, remainingAmount);
    
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
    
    function showPurchaseSummary(grams, totalCost, remaining) {
        let summary = `<p>Grams: ${grams}, Total Cost: ₹${totalCost.toFixed(2)}</p>`;
        purchaseSummaries += `
        <h4>SGB</h4>
        ${summary}
        <p><strong>SGB Remaining: ₹${remaining.toFixed(2)}</strong></p>
        <hr>
        `;
    }
} else {
    sgballocationamount = 0;
    sgbRemainingAmount = sgballocationamount + reitsRemainingAmount;
    console.log(`SGB remiang amount : ${sgbRemainingAmount}`);
    console.log(`reits remainf amount: ${reitsRemainingAmount}`);
    console.log(`REIT Remaining Amount else block: ${sgballocationamount}`);

}

// --- PPF Block ---
if (ppfallocationamount > 0) {
    let PPF_ALLOCATION_AMOUNT = ppfallocationamount + sgbRemainingAmount;
    
    let ppfInterestRate = 0.071;
    
    let investmentAmount = 0;
    let maturityAmount = 0;
    
    try {
        let totalAmount = 0;
        let totalYears = 15;
        
        for (let i = 0; i < totalYears; i++) {
        let yearsRemaining = totalYears - i;
        let compounded = PPF_ALLOCATION_AMOUNT * Math.pow((1 + ppfInterestRate), yearsRemaining);
        totalAmount += compounded;
        }
    
        investmentAmount = PPF_ALLOCATION_AMOUNT * totalYears;
        maturityAmount = totalAmount;
        ppfRemainingAmount = 0; // <-- PPF always uses up all, so set to 0
    
        showPurchaseSummary(investmentAmount, maturityAmount);
    
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
    
    function showPurchaseSummary(investment, maturity) {
        let summary = `<p>Total Investment: ₹${investment.toFixed(2)}, Estimated Maturity Amount: ₹${maturity.toFixed(2)}</p>`;
        purchaseSummaries += `
        <h4>PPF</h4>
        ${summary}
        <p><strong>PPF Remaining: ₹0.00</strong></p>
        <hr>
        `;
    }
} else {
    ppfallocationamount = 0;
    ppfRemainingAmount = ppfallocationamount + sgbRemainingAmount;
}

// --- NSC Block ---
if (nscallocationamount > 0) {
    let NSC_ALLOCATION_AMOUNT = nscallocationamount + ppfRemainingAmount;
            
    let nscInterestRate = 0.077;
    
    let investmentAmount = 0;
    let maturityAmount = 0;
    
    try {
        let totalAmount = 0;
        let totalYears = 5;
        
        for (let i = 0; i < totalYears; i++) {
        let yearsRemaining = totalYears - i;
        let compounded = NSC_ALLOCATION_AMOUNT * Math.pow((1 + nscInterestRate), yearsRemaining);
        totalAmount += compounded;
        }
    
        investmentAmount = NSC_ALLOCATION_AMOUNT * totalYears;
        maturityAmount = totalAmount;
        nscRemainingAmount = 0; // <-- NSC always uses up all, so set to 0
    
        showPurchaseSummary(investmentAmount, maturityAmount);
    
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
    
    function showPurchaseSummary(investment, maturity) {
        let summary = `<p>Total Investment: ₹${investment.toFixed(2)}, Estimated Maturity Amount: ₹${maturity.toFixed(2)}</p>`;
        purchaseSummaries += `
        <h4>NSC</h4>
        ${summary}
        <p><strong>NSC Remaining: ₹0.00</strong></p>
        <hr>
        `;
    }
} else {
    nscallocationamount = 0;
    nscRemainingAmount = nscallocationamount + ppfRemainingAmount;
}

// --- Crypto Block ---
if (cryptoallocationamount > 0) {
    let CRYPTO_ALLOCATION_AMOUNT =  cryptoallocationamount + nscRemainingAmount;

    // Use imported cryptoData directly (do NOT redeclare)
    let remainingAmount = 0;
    
    try {
        let cryptos = getCryptosByRisk(risk_level.toLowerCase());
        if (!cryptos || cryptos.length === 0) {
            throw new Error('No cryptos available for selected risk level');
        }
    
        let totalCost = calculateTotalCost(cryptos);
    
        if (totalCost === 0) {
            throw new Error('Crypto prices cannot be zero');
        }
    
        let purchasedCryptos = [];
        let remaining = CRYPTO_ALLOCATION_AMOUNT;
    
        if (totalCost <= remaining) {
            let rounds = Math.floor(remaining / totalCost);
            purchasedCryptos = buyFullRounds(cryptos, rounds);
            remaining -= totalCost * rounds;
    
            // Buy remaining cryptos and update remaining
            let remainingPurchase = buyRemainingCryptos(cryptos, remaining);
            purchasedCryptos = purchasedCryptos.concat(remainingPurchase.purchases);
            remaining = remainingPurchase.remaining;
        } else {
            // Buy remaining cryptos and update remaining
            let remainingPurchase = buyRemainingCryptos(cryptos, remaining);
            purchasedCryptos = remainingPurchase.purchases;
            remaining = remainingPurchase.remaining;
        }
    
        let mergedPurchases = mergeCryptoPurchases(purchasedCryptos);
    
        validatePurchase(mergedPurchases, remaining);
    
        showPurchaseSummary(mergedPurchases, remaining);
        remainingAmount = remaining;
        cryptoRemainingAmount = remainingAmount; // <-- ADD THIS LINE
    
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
    
    function getCryptosByRisk(riskLevel) {
        if (!cryptoData[riskLevel]) {
            return [];
        }
        return [...cryptoData[riskLevel]];
    }
    
    function calculateTotalCost(cryptos) {
        return cryptos.reduce((sum, crypto) => sum + crypto.price, 0);
    }
    
    function buyFullRounds(cryptos, rounds) {
        return cryptos.map(crypto => ({
            ...crypto,
            unit: rounds,
            total: crypto.price * rounds
        }));
    }
    
    function buyRemainingCryptos(cryptos, remainingAmount) {
        let sortedCryptos = [...cryptos].sort((a, b) => b.price - a.price);
        let purchases = [];
        let remaining = remainingAmount;
    
        for (let crypto of sortedCryptos) {
            if (remaining >= crypto.price) {
                purchases.push({
                    ...crypto,
                    unit: 1,
                    total: crypto.price
                });
                remaining -= crypto.price;
            }
        }
        return { purchases, remaining };
    }
    
    function mergeCryptoPurchases(purchases) {
        let merged = {};
        for (let item of purchases) {
            if (merged[item.name]) {
                merged[item.name].unit += item.unit;
                merged[item.name].total += item.total;
            } else {
                merged[item.name] = { ...item };
            }
        }
        return Object.values(merged);
    }
    
    function validatePurchase(purchases, remaining) {
        let actualSpent = purchases.reduce((sum, item) => sum + item.total, 0);
        if (!isAmountValid(CRYPTO_ALLOCATION_AMOUNT - actualSpent, remaining)) {
            throw new Error('Purchase verification failed');
        }
    }
    
    function isAmountValid(a, b) {
        return Math.abs(a - b).toFixed(2) === '0.00';
    }
    
    function showPurchaseSummary(purchases, remaining) {
        appendPurchaseSummary("Cryptos", purchases, remaining, "stock");
    }
} else {
    cryptoallocationamount = 0;
    cryptoRemainingAmount = cryptoallocationamount + nscRemainingAmount;
}    // --- FD Auto-Selection Block ---
    if (FDAllocationAmount > 0) {
        const FD_ALLOCATION_AMOUNT = FDAllocationAmount + cryptoRemainingAmount;
        const MAX_PER_BANK = 450000; // Maximum investment per bank (4.5 lakhs)
        fdRemainingAmount = FD_ALLOCATION_AMOUNT; // Use the globally declared variable
        
        // Get banks based on risk level
        let banks = [];
        if (risk_level === "low") {
            banks = [...fdData.low, ...fdData.medium, ...fdData.high];
        } else if (risk_level === "medium") {
            banks = [...fdData.medium, ...fdData.high, ...fdData.low];
        } else {
            banks = [...fdData.high, ...fdData.medium, ...fdData.low];
        }

        // Duration in years (default to 1 if not specified)
        let duration = typeof investment_duration === "number" && investment_duration > 0 
            ? investment_duration 
            : 1;

        let selectedFDs = [];
        
        // Loop until the remaining amount is too small to invest
        while (fdRemainingAmount >= 1000) {
            let investedInThisCycle = false;
            // Invest in each bank sequentially
            for (const bank of banks) {
                // If no more money to invest, break the inner loop
                if (fdRemainingAmount < 1000) break;

                // Get interest rate for this duration
                const rate = getFDInterestRate(bank, duration);
                
                // Invest exactly 4.5 lakhs or remaining amount if less
                let investmentAmount = Math.min(fdRemainingAmount, MAX_PER_BANK);
                
                if (investmentAmount > 0) {
                    // Calculate maturity amount
                    const maturityAmount = investmentAmount * Math.pow(1 + rate/100, duration);
                    
                    selectedFDs.push({
                        name: bank.name,
                        amount: investmentAmount,
                        rate: rate,
                        duration: duration,
                        maturity: maturityAmount,
                        isSmallFinance: bank.isSmallFinance
                    });
                    
                    fdRemainingAmount -= investmentAmount;
                    investedInThisCycle = true;
                }
            }
            // If no investment was made in a full cycle, break to prevent infinite loops
            if (!investedInThisCycle) {
                break;
            }
        }

    // Add to purchase summaries
    if (selectedFDs.length > 0) {
        let fdSummary = selectedFDs.map(fd => 
            `<p>${fd.name} - Amount: ₹${fd.amount.toLocaleString("en-IN")}, Rate: ${fd.rate}%, ` +
            `Duration: ${fd.duration} year(s), Maturity: ₹${fd.maturity.toLocaleString("en-IN")}</p>`
        ).join('');

        purchaseSummaries += `
            <h4>Fixed Deposits</h4>
            ${fdSummary}
            <p><strong>FD Remaining: ₹${fdRemainingAmount.toLocaleString("en-IN")}</strong></p>
            <hr>
        `;        // Create FD portfolio object and store in localStorage
        const fdPortfolio = {
            deposits: selectedFDs.map(fd => ({
                bank: fd.name,
                amount: fd.amount,
                interestRate: fd.rate,
                durationYears: fd.duration,
                estimatedMaturity: calculateMaturityAmount(fd.amount, fd.rate, fd.duration)
            })),
            totalInvestment: FD_ALLOCATION_AMOUNT - fdRemainingAmount,
            remainingBalance: fdRemainingAmount,
            date: new Date().toISOString()
        };
        localStorage.setItem('fdPortfolio', JSON.stringify(fdPortfolio));

        // Helper function to calculate maturity amount
        function calculateMaturityAmount(principal, rate, years) {
            return principal * Math.pow(1 + (rate / 100), years);
        }

        // Log FD allocation details to console
        console.log("\nFixed Deposit Portfolio:");
        selectedFDs.forEach(fd => {
            console.log(
                `Bank: ${fd.name}\n` +
                `Amount: ₹${fd.amount.toLocaleString("en-IN")}\n` +
                `Interest Rate: ${fd.rate}%\n` +
                `Duration: ${fd.duration} year(s)\n` +
                `Maturity Amount: ₹${fd.maturity.toLocaleString("en-IN")}\n` +
                `Small Finance Bank: ${fd.isSmallFinance ? "Yes" : "No"}\n`
            );
        });
        console.log(`Total FD Investment: ₹${(FD_ALLOCATION_AMOUNT - fdRemainingAmount).toLocaleString("en-IN")}`);
        console.log(`Remaining Balance: ₹${fdRemainingAmount.toLocaleString("en-IN")}`);
    }
}

    // At the end, after all allocations:
    if (purchaseSummaries) {
        displayAllSummaries();
        
        // Add Done button
        const doneButton = document.createElement('button');
        doneButton.className = 'done-btn';
        doneButton.textContent = 'Done';
        doneButton.style.cssText = `
            background: linear-gradient(90deg, #7F00FF 60%, #E100FF 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            margin-top: 20px;
            cursor: pointer;
            display: block;
            margin-left: auto;
            margin-right: auto;
            transition: transform 0.2s, box-shadow 0.2s;
        `;
        
        doneButton.onmouseover = () => {
            doneButton.style.transform = 'translateY(-2px)';
            doneButton.style.boxShadow = '0 4px 12px rgba(127, 0, 255, 0.3)';
        };
        
        doneButton.onmouseout = () => {
            doneButton.style.transform = 'translateY(0)';
            doneButton.style.boxShadow = 'none';
        };

        doneButton.onclick = () => {
            // --- Build new format for saving ---
            const username = typeof getUsername === 'function' ? getUsername() : 'unknown';
            const planId = `${username}_${Date.now()}`;
            const investmentType = 'One-Time'; // Or get from UI if available
            const expectedInflation = 6; // Or get from UI if available

            // Build allocations array
            const allocationsArr = [
                { type: 'stocks', amount: StocksAllocationAmount, remaining: stockRemaining },
                { type: 'mutualFunds', amount: MutualFundsAllocationAmount, remaining: mutualFundsRemainingAmount },
                { type: 'goldETFs', amount: GoldETFsAllocationAmount, remaining: goldEtfsRemainingAmount },
                { type: 'fd', amount: FDAllocationAmount, remaining: fdRemainingAmount },
                { type: 'crypto', amount: cryptoallocationamount, remaining: cryptoRemainingAmount },
                { type: 'reits', amount: reitsallocationamount, remaining: reitsRemainingAmount },
                { type: 'sgb', amount: sgballocationamount, remaining: sgbRemainingAmount },
                { type: 'ppf', amount: ppfallocationamount, remaining: ppfRemainingAmount },
                { type: 'nsc', amount: nscallocationamount, remaining: nscRemainingAmount }
            ];

            // Helper to extract purchase data from purchaseSummaries
            function extractPurchases(label, type) {
                const regex = new RegExp(`<h4>${label}<\\/h4>([\\s\\S]*?)<p><strong>`, 'i');
                const match = purchaseSummaries.match(regex);
                if (!match) return [];
                const block = match[1];
                const itemRegex = type === 'mf'
                    ? /<p>(.*?) - Unit: (\d+), NAV: ₹([\d.]+), Total: ₹([\d.]+)<\/p>/g
                    : /<p>(.*?) - Unit: (\d+), Price: ₹([\d.]+), Total: ₹([\d.]+)<\/p>/g;
                let items = [];
                let m;
                while ((m = itemRegex.exec(block)) !== null) {
                    if (type === 'mf') {
                        items.push({ name: m[1], units: Number(m[2]), nav: Number(m[3]), total: Number(m[4]) });
                    } else {
                        items.push({ name: m[1], units: Number(m[2]), price: Number(m[3]), total: Number(m[4]) });
                    }
                }
                return items;
            }

            // Extract purchases for each asset type
            const purchases = {
                stocks: extractPurchases('Stocks', 'stock'),
                mutualFunds: extractPurchases('Mutual Funds', 'mf'),
                goldETFs: extractPurchases('Gold ETFs', 'stock'),                // For FD, get bank details and interest rate based on risk level
                fd: (() => {
                    const MAX_PER_BANK = 450000; // 4.5 lakhs per bank
                    let remainingAmount = FDAllocationAmount + cryptoRemainingAmount;
                    let fdInvestments = [];

                    // Get banks in order based on risk level
                    let banks = [];
                    if (risk_level === "low") {
                        banks = [...fdData.low, ...fdData.medium, ...fdData.high];
                    } else if (risk_level === "medium") {
                        banks = [...fdData.medium, ...fdData.high, ...fdData.low];
                    } else {
                        banks = [...fdData.high, ...fdData.medium, ...fdData.low];
                    }

                    // Invest in each bank sequentially
                    for (const bank of banks) {
                        if (remainingAmount < 1000) break; // Minimum FD amount

                        const rate = getFDInterestRate(bank, investment_duration);
                        const investAmount = Math.min(remainingAmount, MAX_PER_BANK);
                        const maturityAmount = investAmount * Math.pow(1 + rate/100, investment_duration);

                        if (investAmount > 0) {
                            fdInvestments.push({
                                name: bank.name,
                                amount: investAmount,
                                rate: rate,
                                duration: investment_duration,
                                maturity: maturityAmount,
                                isSmallFinance: bank.isSmallFinance
                            });
                            remainingAmount -= investAmount;
                        }
                    }

                    // Add remaining amount information
                    fdInvestments.remaining = remainingAmount;
                    
                    return fdInvestments;
                })()
                // Add other asset types if needed
            };

            const allocationData = {
                username,
                planId,
                timestamp: new Date().toISOString(),
                investmentType,
                totalInvestment: investment_amount,
                duration: investment_duration,
                riskLevel: risk_level,
                hasEmergencyFund: hasEmergencyFund,
                expectedInflation,
                allocations: allocationsArr,
                purchases
            };

            localStorage.setItem('SelectionData', JSON.stringify(allocationData));
            showPopup("Auto selection data has been saved successfully!", 3000);
            doneButton.disabled = true;
            doneButton.style.opacity = '0.7';
            doneButton.textContent = 'Saved ✓';
        };

        const autoSection = document.getElementById("autoAllocationSection");
        if (autoSection) {
            autoSection.appendChild(doneButton);
        }
    }
}
window.autoSelection = autoSelection;