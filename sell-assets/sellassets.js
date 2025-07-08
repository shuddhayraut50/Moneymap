// Portfolio data and state management
let portfolioData = null;
let portfolioValue = 0;
let amountToSell = 0;
let recommendations = [];
let selectedStrategy = 'tax-efficient';

// Asset type selling constraints with improved edescriptions and validations
const ASSET_CONSTRAINTS = {    Cryptocurrency: { 
        fractional: true, 
        minUnits: 0.00000001, // Set minimum to 1 Satoshi/Wei equivalent
        description: "Can be sold in any fractional amount (min 0.00000001)",
        validateSale: (amount, item) => {
            const units = amount / item.currentPrice;
            return {
                valid: units >= 0.00000001 && amount <= item.currentValue,
                units: units,
                message: amount > item.currentValue ? "Amount exceeds available value" : 
                        units < 0.00000001 ? "Amount too small for cryptocurrency" : null
            };
        }
    },
    'Fixed Deposits': { 
        wholeOnly: true,
        description: "Must be broken completely (all or nothing)",
        validateSale: (amount, item) => ({
            valid: amount >= item.currentValue,
            units: amount >= item.currentValue ? item.quantity : 0,
            message: amount < item.currentValue ? "FDs can only be fully broken" : null
        })
    },
    Stocks: { 
        wholeUnits: true, 
        minUnits: 1,
        description: "Must sell in whole units (minimum 1 share)",
        validateSale: (amount, item) => {
            const units = Math.floor(amount / item.currentPrice);
            return {
                valid: units >= 1 && units <= item.quantity,
                units: units,
                message: units < 1 ? "Must sell at least 1 share" : 
                         units > item.quantity ? "Not enough shares available" : null
            };
        }
    },
    'Mutual Funds': { 
        wholeUnits: true, 
        minUnits: 1,
        description: "Must sell in whole units (minimum 1 unit)",
        validateSale: (amount, item) => {
            const units = Math.floor(amount / item.currentPrice);
            return {
                valid: units >= 1 && units <= item.quantity,
                units: units,
                message: units < 1 ? "Must sell at least 1 unit" : 
                         units > item.quantity ? "Not enough units available" : null
            };
        }
    },
    ETF: { 
        wholeUnits: true, 
        minUnits: 1,
        description: "Must sell in whole units (minimum 1 unit)",
        validateSale: (amount, item) => {
            const units = Math.floor(amount / item.currentPrice);
            return {
                valid: units >= 1 && units <= item.quantity,
                units: units,
                message: units < 1 ? "Must sell at least 1 unit" : 
                         units > item.quantity ? "Not enough units available" : null
            };
        }
    },
    'Real Estate': { 
        wholeUnits: true, 
        minUnits: 1,
        description: "Must sell in whole units (minimum 1 unit)",
        validateSale: (amount, item) => {
            const units = Math.floor(amount / item.currentPrice);
            return {
                valid: units >= 1 && units <= item.quantity,
                units: units,
                message: units < 1 ? "Must sell at least 1 unit" : 
                         units > item.quantity ? "Not enough units available" : null
            };
        }
    }
};

// Add aliases for type name variations from the backend (e.g., "ETFs", "Crypto")
ASSET_CONSTRAINTS.ETFs = ASSET_CONSTRAINTS.ETF;
ASSET_CONSTRAINTS.Crypto = ASSET_CONSTRAINTS.Cryptocurrency;

// Number formatting utilities
const formatters = {
    currency: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }),
    number: new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }),
    percent: new Intl.NumberFormat('en-IN', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }),    units: (value, type) => {
        if (type === 'Cryptocurrency') {
            // Use Math.max to ensure we don't go below minimum unit size
            return Math.max(Number(value.toFixed(8)), 0.00000001);
        }
        return Math.floor(value);
    }
};

// Input validation and parsing
function parseAmount(value) {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[₹,]/g, '').trim();
    const amount = Number(cleaned);
    
    if (isNaN(amount)) {
        throw new Error("Please enter a valid number");
    }
    if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
    }
    if (amount > portfolioValue) {
        throw new Error("Amount cannot exceed portfolio value");
    }
    
    return amount;
}

// Update UI elements with proper loading states
function updateInputField(value, isLoading = false) {
    const input = document.getElementById('amountToSell');
    input.value = formatters.currency.format(value).replace('₹', '');
    input.disabled = isLoading;
}

function updateSlider(value, isLoading = false) {
    const slider = document.getElementById('portfolioSlider');
    const percentage = (value / portfolioValue) * 100;
    slider.value = percentage;
    slider.disabled = isLoading;
    
    document.querySelector('.slider-value').textContent = 
        formatters.percent.format(percentage / 100);
}

function showLoading() {
    const tbody = document.getElementById('recommendationsBody');
    tbody.innerHTML = `
        <tr class="loading-row">
            <td colspan="6">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading recommendations...
                </div>
            </td>
        </tr>
    `;
}

// Portfolio data validation
function validatePortfolioData(data) {
    if (!data) {
        throw new Error("Portfolio data is missing");
    }
    
    if (!Array.isArray(data.portfolioItems)) {
        throw new Error("Invalid portfolio structure: missing items array");
    }
    
    // Validate each portfolio item
    data.portfolioItems.forEach((item, index) => {
        if (!item.name || !item.type || !item.quantity || !item.currentPrice || !item.currentValue) {
            throw new Error(`Invalid item data at index ${index}`);
        }
        
        // Validate asset type
        if (!ASSET_CONSTRAINTS[item.type]) {
            throw new Error(`Unknown asset type: ${item.type} for ${item.name}`);
        }
        
        // Validate numeric values
        if (typeof item.quantity !== 'number' || item.quantity < 0) {
            throw new Error(`Invalid quantity for ${item.name}`);
        }
        
        if (typeof item.currentPrice !== 'number' || item.currentPrice < 0) {
            throw new Error(`Invalid current price for ${item.name}`);
        }
        
        if (typeof item.currentValue !== 'number' || item.currentValue < 0) {
            throw new Error(`Invalid current value for ${item.name}`);
        }
        
        // Validate value calculation
        const calculatedValue = item.quantity * item.currentPrice;
        const valueDiff = Math.abs(calculatedValue - item.currentValue);
        if (valueDiff > 0.01) {
            console.warn(`Value mismatch for ${item.name}: calculated=${calculatedValue}, actual=${item.currentValue}`);
        }
    });
    
    // Validate portfolio metadata if present
    if (data.portfolioMetadata) {
        const { lastUpdated, currency } = data.portfolioMetadata;
        
        if (lastUpdated) {
            const updateDate = new Date(lastUpdated);
            const now = new Date();
            const daysSinceUpdate = (now - updateDate) / (1000 * 60 * 60 * 24);
            
            if (daysSinceUpdate > 7) {
                console.warn(`Portfolio data might be outdated. Last updated: ${lastUpdated}`);
            }
        }
        
        if (currency && currency !== 'INR') {
            throw new Error(`Unsupported currency: ${currency}. Only INR is supported.`);
        }
    }
    
    return true;
}

// Fetch and load portfolio data with improved error handling
async function fetchPortfolioData() {
    showLoading();
    try {
        // Get current username from auth/localStorage
        const username = getCurrentUsername();
        if (!username) {
            throw new Error('User not authenticated. Please log in.');
        }
        // Fetch from backend API endpoint with username
        const response = await fetch(`http://localhost:3001/api/portfolio-items-combined?username=${encodeURIComponent(username)}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Defensively handle both direct array and object-wrapped responses
        const portfolioDataToValidate = Array.isArray(data) ? { portfolioItems: data } : data;

        // The API returns { portfolioItems: [...] }
        validatePortfolioData(portfolioDataToValidate);
        portfolioData = portfolioDataToValidate;

        // Calculate total portfolio value
        portfolioValue = portfolioData.portfolioItems.reduce((total, item) => 
            total + item.currentValue, 0);

        // Initialize with a sensible default
        amountToSell = Math.min(portfolioValue * 0.1, 100000);

        updateUI(false);
        generateRecommendations();
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        const errorMessage = error.response?.status === 404 
            ? 'Portfolio data not found. Please check your connection and try again.'
            : `Error loading portfolio data: ${error.message}`;
        document.querySelector('.info-message').innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${errorMessage}</span>
        `;
        document.querySelector('.info-message').style.color = '#e11d48';
        document.querySelector('.info-message').style.background = '#fef2f2';
        // Clear and update UI elements
        portfolioValue = 0;
        amountToSell = 0;
        recommendations = [];
        updateUI(false);
    }
}

// Utility to get current username from localStorage
function getCurrentUsername() {
    return localStorage.getItem('currentUser') || null;
}

// Redirect to login if not authenticated
function ensureAuthenticated() {
    const username = getCurrentUsername();
    if (!username) {
        window.location.href = '../user/login.html'; // Adjust path as needed
    }
}

// Call ensureAuthenticated on page load
ensureAuthenticated();

// Validate recommendations against business rules
function validateRecommendations() {
    if (!recommendations || recommendations.length === 0) {
        return { valid: false, message: "No recommendations generated" };
    }

    const totalAmount = recommendations.reduce((sum, rec) => sum + rec.amount, 0);
    const validationResults = [];
    let isValid = true;

    // Check total amount
    if (totalAmount === 0) {
        return { valid: false, message: "Total sell amount cannot be zero" };
    }

    // Validate each recommendation
    recommendations.forEach(rec => {
        const item = portfolioData.portfolioItems.find(i => i.name === rec.investment);
        if (!item) {
            validationResults.push(`Investment ${rec.investment} not found in portfolio`);
            isValid = false;
            return;
        }

        // Validate against asset constraints
        const constraint = ASSET_CONSTRAINTS[rec.type];
        if (!constraint) {
            validationResults.push(`Unknown asset type: ${rec.type}`);
            isValid = false;
            return;
        }        // Validate units with special handling for cryptocurrencies
        if (rec.type === 'Cryptocurrency' && rec.units < 0.00000001) {
            validationResults.push(`Amount too small for ${rec.investment}. Minimum is 0.00000001`);
            isValid = false;
            return;
        } else if (rec.type !== 'Cryptocurrency' && rec.units <= 0) {
            validationResults.push(`Invalid units (${rec.units}) for ${rec.investment}`);
            isValid = false;
            return;
        }

        // Asset-specific validations
        if (constraint.wholeUnits && !Number.isInteger(rec.units)) {
            validationResults.push(`${rec.type} must be sold in whole units: ${rec.investment}`);
            isValid = false;
        }

        if (constraint.wholeOnly && rec.units !== item.quantity && rec.units !== 0) {
            validationResults.push(`${rec.type} must be sold completely: ${rec.investment}`);
            isValid = false;
        }

        if (rec.units > item.quantity) {
            validationResults.push(`Cannot sell more than available units for ${rec.investment}`);
            isValid = false;
        }

        // Validate amounts
        const calculatedAmount = rec.units * item.currentPrice;
        const amountDiff = Math.abs(calculatedAmount - rec.amount);
        if (amountDiff > 0.01) {
            validationResults.push(`Amount calculation mismatch for ${rec.investment}`);
            isValid = false;
        }
    });

    // Update UI with validation results
    const infoMessage = document.querySelector('.info-message');
    if (!isValid) {
        infoMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Validation Errors:<br>${validationResults.join('<br>')}</span>
        `;
        infoMessage.style.color = '#e11d48';
        infoMessage.style.background = '#fef2f2';
    }

    return {
        valid: isValid,
        message: isValid ? "Recommendations validated successfully" : validationResults.join(", ")
    };
}

// Generate recommendations with improved validation
async function generateRecommendations() {
    if (!portfolioData || !portfolioData.portfolioItems || amountToSell <= 0) {
        recommendations = [];
        updateUI();
        return;
    }

    showLoading(); // Show loading spinner

    try {
        const response = await fetch('http://localhost:3001/api/generate-recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                portfolioItems: portfolioData.portfolioItems,
                amountToSell: amountToSell,
                strategy: selectedStrategy,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate recommendations from server.');
        }

        const data = await response.json();
        recommendations = data.recommendations || [];
        
        updateUI();
        
    } catch (error) {
        console.error('Error generating recommendations:', error);
        handleError(error);
        recommendations = []; // Clear recommendations on error
        updateUI(); // Update UI to show error state
    }
}

// Update UI with improved formatting and error handling
function updateUI(showLoadingState = false) {
    try {
        // Update form controls
        document.getElementById('portfolioValue').textContent = 
            formatters.currency.format(portfolioValue);
        updateInputField(amountToSell, showLoadingState);
        updateSlider(amountToSell, showLoadingState);
        
        // Update recommendations table
        const tbody = document.getElementById('recommendationsBody');
        tbody.innerHTML = '';
        
        if (showLoadingState) {
            showLoading();
            return;
        }
        
        if (recommendations.length === 0) {
            let message = 'No recommendations available. Adjust your selling criteria and try again.';
            if (portfolioValue === 0) {
                message = `
                    <div class="empty-portfolio">
                        <i class="fas fa-leaf"></i>
                        <p>Your portfolio is empty.</p>
                        <a href="../src/investment.html" class="action-button" style="text-decoration: none; padding: 10px 15px; border-radius: 5px; color: white;">Add Investments</a>
                    </div>
                `;
            }
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        ${message}
                    </td>
                </tr>
            `;
            document.getElementById('totalRow').style.display = 'none';
            // Disable form controls if portfolio is empty
            const isEmpty = portfolioValue === 0;
            document.querySelector('.action-button').disabled = isEmpty;
            document.getElementById('resetButton').disabled = isEmpty;
            document.getElementById('amountToSell').disabled = isEmpty;
            document.getElementById('portfolioSlider').disabled = isEmpty;
            return;
        }
        
        // Add recommendations
        recommendations.forEach(rec => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rec.investment}</td>
                <td>${rec.type}</td>
                <td>${formatters.currency.format(rec.amount)}</td>
                <td>${formatters.number.format(rec.units)}</td>
                <td>${formatters.percent.format(rec.percent / 100)}</td>
                <td><i class="fas fa-check text-success"></i></td>
            `;
            tbody.appendChild(tr);
        });
        
        // Update totals
        const totalAmount = recommendations.reduce((sum, rec) => sum + rec.amount, 0);
        const totalPercentage = (totalAmount / portfolioValue) * 100;
        
        document.getElementById('totalRow').style.display = 'table-row';
        document.getElementById('totalAmount').textContent = formatters.currency.format(totalAmount);
        document.getElementById('totalPercentage').textContent = formatters.percent.format(totalPercentage / 100);
        
        // Update action button state
        const actionButton = document.querySelector('.action-button');
        actionButton.disabled = recommendations.length === 0 || totalAmount === 0;
        
        // Update info message
        updateInfoMessage(totalAmount);
        
    } catch (error) {
        console.error('Error updating UI:', error);
        handleError(error);
    }
}

// Update info message based on recommendation status
function updateInfoMessage(totalAmount) {
    const infoMessage = document.querySelector('.info-message');
    
    if (totalAmount < amountToSell) {
        const shortfall = amountToSell - totalAmount;
        infoMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Can only sell ${formatters.currency.format(totalAmount)} due to asset constraints. 
            Shortfall: ${formatters.currency.format(shortfall)}</span>
        `;
        infoMessage.style.color = '#e11d48';
        infoMessage.style.background = '#fef2f2';
    } else {
        infoMessage.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>Recommendations optimized based on your selected strategy and asset constraints</span>
        `;
        infoMessage.style.color = '#0369a1';
        infoMessage.style.background = '#e0f2fe';
    }
}

// Error handling
function handleError(error) {
    const infoMessage = document.querySelector('.info-message');
    infoMessage.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${error.message}</span>
    `;
    infoMessage.style.color = '#e11d48';
    infoMessage.style.background = '#fef2f2';
    
    // Clear recommendations if there's an error
    const tbody = document.getElementById('recommendationsBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-danger">
                <i class="fas fa-exclamation-circle"></i> 
                Error: ${error.message}
            </td>
        </tr>
    `;
}

// Custom popup functions
function createPopup() {
    if (!document.querySelector('.custom-popup')) {
        const popupHtml = `
            <div class="popup-overlay"></div>
            <div class="custom-popup">
                <div class="popup-header">
                    <h3 class="popup-title"></h3>
                    <button class="popup-close" aria-label="Close popup">×</button>
                </div>
                <div class="popup-content"></div>
                <div class="popup-buttons">
                    <button class="popup-button cancel">Cancel</button>
                    <button class="popup-button confirm">Confirm</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHtml);

        // Add event listeners
        const popup = document.querySelector('.custom-popup');
        const overlay = document.querySelector('.popup-overlay');
        
        popup.querySelector('.popup-close').addEventListener('click', hidePopup);
        popup.querySelector('.cancel').addEventListener('click', hidePopup);
        overlay.addEventListener('click', hidePopup);
    }
}

function showPopup(title, content, { showCancel = true, type = 'default', onConfirm = null } = {}) {
    createPopup();
    const popup = document.querySelector('.custom-popup');
    const overlay = document.querySelector('.popup-overlay');
    
    // Reset classes and add type class
    popup.className = 'custom-popup popup-' + type;
    
    popup.querySelector('.popup-title').textContent = title;
    popup.querySelector('.popup-content').innerHTML = content;
    
    const cancelBtn = popup.querySelector('.cancel');
    cancelBtn.style.display = showCancel ? 'block' : 'none';
    
    const confirmBtn = popup.querySelector('.confirm');
    confirmBtn.onclick = () => {
        hidePopup();
        if (onConfirm) onConfirm();
    };
    
    // Show with animation
    popup.style.display = 'block';
    overlay.style.display = 'block';
    
    // Trigger animations
    requestAnimationFrame(() => {
        overlay.classList.add('show');
        popup.classList.add('show');
    });
}

function hidePopup() {
    const popup = document.querySelector('.custom-popup');
    const overlay = document.querySelector('.popup-overlay');
    
    if (popup && overlay) {
        // Remove show classes to trigger hide animations
        popup.classList.remove('show');
        overlay.classList.remove('show');
        
        // Wait for animations to complete before hiding
        setTimeout(() => {
            popup.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    }
}

async function handleSellTransaction(sellRecommendations) {
    const username = getCurrentUsername();
    if (!username) {
        throw new Error('User not authenticated. Please log in.');
    }

    try {
        const response = await fetch('http://localhost:3001/api/sell-assets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                itemsToSell: sellRecommendations.map(rec => ({
                    name: rec.investment,
                    type: rec.type,
                    units: rec.units,
                    amount: rec.amount
                }))
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to execute sell transaction:', error);
        // Re-throw the error to be caught by the popup handler
        throw error;
    }
}

document.querySelector('.action-button').addEventListener('click', function() {
    try {
        if (recommendations.length === 0) {
            showPopup('Error', 'Please adjust your selling criteria to generate recommendations first.', { 
                type: 'error', 
                showCancel: false 
            });
            return;
        }
        
        const totalAmount = recommendations.reduce((sum, rec) => sum + rec.amount, 0);
        let totalInvestedRemoved = 0;
        let totalRealizedPL = 0;
        // Build detailed sell list with invested and P/L
        const sellDetails = recommendations.map(rec => {
            const item = portfolioData.portfolioItems.find(i => i.name === rec.investment);
            const investedRemoved = rec.units * (item ? item.purchasePrice : 0);
            const realizedPL = rec.amount - investedRemoved;
            totalInvestedRemoved += investedRemoved;
            totalRealizedPL += realizedPL;
            return `
                <li>
                    <div><b>${rec.investment}</b>: ${formatters.number.format(rec.units)} units</div>
                    <div>Sell: <b>${formatters.currency.format(rec.amount)}</b></div>
                    <div>Invested: <b>${formatters.currency.format(investedRemoved)}</b></div>
                    <div>${realizedPL >= 0 ? 'Profit' : 'Loss'}: <b style="color:${realizedPL >= 0 ? '#16a34a' : '#e11d48'}">${formatters.currency.format(realizedPL)}</b></div>
                </li>
            `;
        }).join('');
        // Tooltip/help text
        const helpText = `<div style="margin-top:10px;font-size:0.97em;color:#64748b;background:#f1f5f9;padding:8px 12px;border-radius:6px;">
            <i class="fas fa-info-circle"></i> <b>Note:</b> The drop in your portfolio value and invested amount may be larger than the sell amount if you sell assets at a loss. This is because the original investment removed is higher than the current value received.
        </div>`;
        // Summary
        const summary = `
            <div style="margin-top:12px;padding:8px 0 0 0;border-top:1px solid #e5e7eb;">
                <div><b>Total Sell Amount (current value):</b> ${formatters.currency.format(totalAmount)}</div>
                <div><b>Total Invested Removed:</b> ${formatters.currency.format(totalInvestedRemoved)}</div>
                <div><b>Total Realized ${totalRealizedPL >= 0 ? 'Profit' : 'Loss'}:</b> <span style="color:${totalRealizedPL >= 0 ? '#16a34a' : '#e11d48'}">${formatters.currency.format(totalRealizedPL)}</span></div>
            </div>
        `;
        const message = `
            <div class="sell-confirmation">
                <p><strong>Total Amount:</strong> ${formatters.currency.format(totalAmount)}</p>
                <p><strong>Portfolio Impact:</strong> ${formatters.percent.format(totalAmount / portfolioValue)}</p>
                <div class="sell-list">
                    <p><strong>Assets to be sold:</strong></p>
                    <ul style="padding-left:0;">${sellDetails}</ul>
                </div>
                ${summary}
                ${helpText}
            </div>
        `;
        
        showPopup('Review Sell Order', message, {
            onConfirm: async () => {
                try {
                    await handleSellTransaction(recommendations);
                    // Fetch the latest full portfolio document after sale
                    const username = getCurrentUsername();
                    if (username) {
                        try {
                            const resp = await fetch(`http://localhost:3001/api/portfolio?username=${encodeURIComponent(username)}`);
                            if (resp.ok) {
                                const fullPortfolio = await resp.json();
                                // Optionally, update portfolioData with the new full portfolio
                                portfolioData.fullPortfolio = fullPortfolio;
                            }
                        } catch (e) {
                            console.warn('Could not fetch full portfolio after sale:', e);
                        }
                    }
                    showPopup('Success', 'Sale completed successfully!', {
                        type: 'success',
                        showCancel: false,
                        onConfirm: async () => {
                            // Refresh the portfolio data immediately
                            await fetchPortfolioData();
                            // Reset the form
                            amountToSell = portfolioValue * 0.1;
                            document.getElementById('tax-efficient').checked = true;
                            selectedStrategy = 'tax-efficient';
                            updateUI();
                            generateRecommendations();
                        }
                    });
                } catch (error) {
                    showPopup('Error', 'Failed to complete the sale: ' + error.message, {
                        type: 'error',
                        showCancel: false
                    });
                }
            }
        });
    } catch (error) {
        showPopup('Error', error.message, { 
            type: 'error', 
            showCancel: false 
        });
    }
});

const amountInput = document.getElementById('amountToSell');
const debounceTimeout = { id: null };

amountInput.addEventListener('input', function() {
    clearTimeout(debounceTimeout.id);
    debounceTimeout.id = setTimeout(() => {
        try {
            const newAmount = parseAmount(this.value);
            amountToSell = newAmount;
            generateRecommendations();
        } catch (error) {
            handleError(error);
        }
    }, 300);
});

document.getElementById('portfolioSlider').addEventListener('input', function() {
    try {
        const percentValue = Number(this.value);
        if (percentValue < 0 || percentValue > 100) {
            throw new Error("Percentage must be between 0 and 100");
        }
        amountToSell = (percentValue / 100) * portfolioValue;
        updateInputField(amountToSell);
        generateRecommendations();
    } catch (error) {
        handleError(error);
    }
});

document.querySelector('.selling-strategy').addEventListener('change', function(e) {
    if (e.target.type === 'radio') {
        selectedStrategy = e.target.value;
        generateRecommendations();
    }
});

// Reset button click animation
document.getElementById('resetButton').addEventListener('click', function() {
    const button = this;
    const icon = button.querySelector('.fas');
    
    // Add clicked class for full rotation
    button.classList.add('clicked');
    
    // Remove clicked class after animation completes
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 300);
    
    // Original reset functionality
    amountToSell = portfolioValue * 0.1;
    document.getElementById('tax-efficient').checked = true;
    selectedStrategy = 'tax-efficient';
    generateRecommendations();
});

// === User Login Detection and Logout ===
function updateUserHeader() {
    const userInfo = document.getElementById('current-user-info');
    const loginLogoutBtn = document.getElementById('login-logout-btn');
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        userInfo.textContent = `Welcome, ${currentUser}!`;
        loginLogoutBtn.textContent = 'Logout';
        loginLogoutBtn.onclick = function() {
            localStorage.removeItem('currentUser');
            window.location.href = '../user/login.html';
        };
    } else {
        userInfo.textContent = '';
        loginLogoutBtn.textContent = 'Login';
        loginLogoutBtn.onclick = function() {
            window.location.href = '../user/login.html';
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateUserHeader();
});

// Initialize the application
fetchPortfolioData();
