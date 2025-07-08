// =================== Variable Declarations ===================

// --- Allocation Percentages ---
let Stocks_Allocation_presentage = 0;
let Mutual_Funds_Allocation_presentage = 0;
let GoldETFs_Allocation_presentage = 0;
let FDAllocationpresentage = 0;
let REITS_Allocation_presentage = 0;
let SGB_Allocation_presentage = 0;
let PPF_Allocation_presentage = 0;
let NSC_Allocation_presentage = 0;
let Crypto_Allocation_presentage = 0;

// --- Allocation Percentages (Short Names) ---
let stocks_percentage = 0;
let mutualFunds_percentage = 0;
let goldETFs_percentage = 0;
let fd_percentage = 0;
let reits_percentage = 0;
let sgb_percentage = 0;
let ppf_percentage = 0;
let nsc_percentage = 0;
let crypto_percentage = 0;

// --- User Inputs ---
let investmentType = "";
let hasEmergencyFund = false;
let investment_amount = 0;
let investment_duration = 0;
let risk_level = 0;

// --- Allocation Amounts ---
let StocksAllocationAmount = 0;
let MutualFundsAllocationAmount = 0;
let GoldETFsAllocationAmount = 0;
let FDAllocationAmount = 0;
let reitsallocationamount = 0;
let sgballocationamount = 0;
let ppfallocationamount = 0;
let nscallocationamount = 0;
let cryptoallocationamount = 0;

// --- Returns and Losses ---
// Stocks
let stock_lowest_loss = 0;
let stock_average_return = 0;
let stock_highest_return = 0;
let stock_profit = 0;
let stock_tax = 0;
let stock_profit_after_tax = 0;

// Mutual Funds
let mf_lowest_loss = 0;
let mf_average_return = 0;
let mf_highest_return = 0;
let mf_profit = 0;
let mf_tax = 0;
let mf_profit_after_tax = 0;

// Gold ETFs
let etf_average_return = 0;
let etf_highest_return = 0;
let etf_lowest_loss = 0;
let etf_profit = 0;
let etf_tax = 0;
let etf_profit_after_tax = 0;

// FD
let fd_return = 0;
let increased_fd_return = 0;
let fd_profit = 0;
let fd_tax = 0;
let fd_profit_after_tax = 0;

// REITs
let reits_average_return = 0;
let reits_highest_return = 0;
let reits_profit = 0;
let reits_tax = 0;
let reits_profit_after_tax = 0;

// SGB
let sgb_average_return = 0;
let sgb_highest_return = 0;
let sgb_lowest_loss = 0;
let sgb_purchased_grams = 0;
let sgb_total_cost = 0;
let sgb_annual_interest = 0;
let sgb_total_interest = 0;
let sgb_maturity_amount = 0;
let sgb_total_return = 0;
let sgb_profit = 0;
let sgb_tax = 0;
let sgb_profit_after_tax = 0;

// PPF
let ppf_return = 0;
let ppf_lowest_loss = 0;
let ppf_highest_return = 0;
let ppf_total_interest_earned = 0;
let ppf_total_principal = 0;
let ppf_maturity_amount = 0;
let ppf_profit = 0;
let ppf_tax = 0;
let ppf_profit_after_tax = 0;

// NSC
let nsc_return = 0;
let nsc_lowest_loss = 0;
let nsc_highest_return = 0;
let nsc_maturity_amount = 0;
let nsc_investment = 0;
let nsc_total_interest = 0;
let nsc_profit = 0;
let nsc_tax = 0;
let nsc_profit_after_tax = 0;

// Crypto
let crypto_average_return = 0;
let crypto_highest_return = 0;
let crypto_lowest_loss = 0;
let crypto_profit = 0;
let crypto_tax = 0;
let crypto_profit_after_tax = 0;

// --- Total Returns, Profits, and Taxes ---
let Total_Return_on_Lowest_Return = 0;
let TotalReturnonAverageReturn = 0;
let TotalReturnonHighestReturn = 0;

let Profit_on_Lowest_Return = 0;
let ProfitonAverageReturn = 0;
let ProfitonHighestReturn = 0;

let long_term_taxable_amount_on_Lowest_Return = 0;
let long_term_taxable_amount_on_Average_Return = 0;
let long_term_taxable_amount_on_Highest_Return = 0;

let FD_taxable_amount = 0;
let fd_tax_amount = 0;

let long_term_tax_amount_on_lowest_return = 0;
let long_term_tax_amount_on_average_return = 0;
let long_term_tax_amount_on_highest_return = 0;

let tax_amount_on_lowest_return = 0;
let tax_amount_on_average_return = 0;
let tax_amount_on_highest_return = 0;

let Final_Amount_on_Lowest_Return = 0;
let Final_Amount_on_Average_Return = 0;
let Final_Amount_on_Highest_Return = 0;

// --- Miscellaneous ---
let inflationRate = 6;
let investmentChart;

// --- SGB Parameters ---
const SGB_ISSUE_PRICE = 6263;
let SGB_currect_price = 7263;
const SGB_EXPECTED_APPRECIATION = 0.07;
const SGB_HOLDING_YEARS = 8;
const SGB_INTEREST_RATE = 0.025;
const SGB_TAX_RATE_ON_INTEREST = 0.30;

// =================== End Variable Declarations ===================


// Input Logic
function clearSelection(type) {
    // Clears the selection for a specific type of buttons (e.g., investment type, risk level)
    let buttons = document.querySelectorAll(`.select-btn[data-type="${type}"]`);
    buttons.forEach(button => button.classList.remove("selected"));
}

function setInvestmentType(element, value) {
    // Sets the investment type (One-Time or Monthly)
    clearSelection("investment");
    element.classList.add("selected");
    investmentType = value;
    console.log("Investment Type:", investmentType);
}

function setRiskLevel(element, value) {
    // Sets the risk level (Low, Medium, or High)
    clearSelection("risk");
    element.classList.add("selected");
    risk_level = value;
    console.log("Risk Level:", risk_level);
}

function setInvestmentDuration(element, value) {
    // Sets the investment duration (1, 2, or 3 years, or custom)
    clearSelection("duration");
    element.classList.add("selected");
    investment_duration = value || 1; // Default to 1 if value is undefined or null
    document.getElementById("customDuration").style.display = "none";
    console.log("Investment Duration:", investment_duration);

    // Update the investment options based on the selected duration
    displayInvestmentOptions();
}

function setCustomDuration(element) {
    // Allows the user to input a custom investment duration
    clearSelection("duration");
    element.classList.add("selected");
    let customDurationInput = document.getElementById("customDuration");
    customDurationInput.style.display = "inline";
    customDurationInput.addEventListener("input", function () {
        investment_duration = parseInt(customDurationInput.value) || 0;
        console.log("Custom Investment Duration:", investment_duration);

        // Update the investment options based on the custom duration
        displayInvestmentOptions();
    });
}

function setEmergencyFund(element, value) {
    // Clears the selection for emergency fund buttons
    clearSelection("emergency");
    element.classList.add("selected");
    hasEmergencyFund = value;
    console.log("Emergency Fund:", hasEmergencyFund);
}

// Update the displayed amounts dynamically after user input
function updateDisplayedAmounts() {
    const upiAmountElement = document.getElementById('upiAmount');
    const cardAmountElement = document.getElementById('cardAmount');

    if (upiAmountElement && cardAmountElement) {
        upiAmountElement.textContent = investment_amount || 0; // Use the updated investment_amount
        cardAmountElement.textContent = investment_amount || 0; // Use the updated investment_amount
    }
}



// Call the function to process these values and update the UI
// submitUserInput(); // <-- Disable this line so submit only happens on button click

// Add a reusable popup function
function showPopup(message, duration = 3000) {
    const overlay = document.getElementById('popupOverlay');
    const messageEl = document.querySelector('#popupOverlay .popup-message');
    if (!overlay || !messageEl) {
        console.error('Popup elements not found!');
        return;
    }

    messageEl.textContent = message;

    // Clear any existing timeout
    if (overlay._hideTimeout) {
        clearTimeout(overlay._hideTimeout);
    }

    // Show the popup
    overlay.classList.add('show');

    // Hide the popup after the specified duration
    overlay._hideTimeout = setTimeout(() => {
        overlay.classList.remove('show');
    }, duration);
}

// Add a reusable popup function for input-related messages
function showPopupInput(message, duration = 3000) {
    const popupInput = document.getElementById('popup_input');
    if (!popupInput) {
        console.error('Popup Input element not found!');
        return;
    }

    popupInput.textContent = message;

    // Clear any existing timeout
    if (popupInput._hideTimeout) {
        clearTimeout(popupInput._hideTimeout);
    }

    // Show the popup
    popupInput.classList.remove('hide');
    popupInput.classList.add('show');

    // Hide the popup after the specified duration
    popupInput._hideTimeout = setTimeout(() => {
        popupInput.classList.remove('show');
        popupInput.classList.add('hide');
    }, duration);
}

// Function to validate user inputs in sequence
function validateInputsAndSubmit() {
    // Check if Investment Type is selected
    if (!investmentType) {
        showPopupInput("Please select an Investment Type.", 3000);
        return false; // Stop further execution
    }

    // Check if Risk Appetite is selected
    if (!risk_level) {
        showPopupInput("Please select a Risk Appetite.", 3000);
        return false; // Stop further execution
    }

    // Check if Investment Duration is selected
    if (!investment_duration) {
        showPopupInput("Please select an Investment Duration.", 3000);
        return false; // Stop further execution
    }

    // Check if Emergency Fund is selected
    if (typeof hasEmergencyFund === "undefined") {
        showPopupInput("Please select if you have an Emergency Fund.", 3000);
        return false; // Stop further execution
    }

    // Check if Investment Amount is valid
    let investmentAmount = document.getElementById("investmentAmount").value;
    investment_amount = parseFloat(investmentAmount);

    if (isNaN(investment_amount) || investment_amount <= 0) {
        showPopupInput("Please enter a valid Investment Amount.", 3000);
        return false; // Stop further execution
    }

    // If all validations pass, proceed to submit immediately
    submitUserInput();
}

// Formulas
function calculateCompoundReturn(principal, rate, duration) {
    // Formula: Compound Interest = P * (1 + r)^t
    return parseFloat((principal * Math.pow(1 + rate, duration)).toFixed(2));
}

function calculateLoss(amount, lossRate) {
    // Formula: Loss = Amount * Loss Rate
    return parseFloat((amount * lossRate).toFixed(2));
}

function calculateFdReturn(principal, duration) {
    // Calculates FD return based on duration and quarterly compounding
    let rate;
    if (duration >= 1 && duration < 2) {
        rate = 7.10; // Rate for 1-2 years
    } else if (duration >= 2 && duration < 3) {
        rate = 7.30; // Rate for 2-3 years
    } else if (duration >= 3 && duration < 5) {
        rate = 7.15; // Rate for 3-5 years
    } else if (duration >= 5 && duration <= 10) {
        rate = 6.75; // Rate for 5-10 years
    } else {
        rate = 6; // Invalid duration
    }

    // Quarterly Compounded Interest Formula: FV = P * (1 + r/4)^(4*t)
    let t = duration; // Duration in years
    let fv = principal * Math.pow(1 + rate / 400, 4 * t);
    let interest = fv - principal;

    return parseFloat(interest.toFixed(2)); // Return interest with 2 decimal places
}



// Logic
function getDefaultAllocation() {
    // Determines default allocation percentages based on risk level and emergency fund
    let allocation = { Stocks: 0, MutualFunds: 0, GoldETFs: 0, FD: 0 };

    if (risk_level === "Low" && hasEmergencyFund) {
        allocation.Stocks = 30;
        allocation.MutualFunds = 30;
        allocation.GoldETFs = 25;
        allocation.FD = 15;
    } else if (risk_level === "Low") {
        allocation.Stocks = 30;
        allocation.MutualFunds = 30;
        allocation.GoldETFs = 10;
        allocation.FD = 30;
    } else if (risk_level === "Medium" && hasEmergencyFund) {
        allocation.Stocks = 45;
        allocation.MutualFunds = 35;
        allocation.GoldETFs = 10;
        allocation.FD = 10;
    } else if (risk_level === "Medium") {
        allocation.Stocks = 35;
        allocation.MutualFunds = 30;
        allocation.GoldETFs = 15;
        allocation.FD = 20;
    } else if (risk_level === "High" && hasEmergencyFund) {
        allocation.Stocks = 60;
        allocation.MutualFunds = 30;
        allocation.GoldETFs = 10;
        allocation.FD = 0;
    } else if (risk_level === "High") {
        allocation.Stocks = 50;
        allocation.MutualFunds = 30;
        allocation.GoldETFs = 10;
        allocation.FD = 10;
    }
    return allocation;
}

function updateCells(className, value) {
    // Updates table cells with a specific class name to display a value
    let cells = document.getElementsByClassName(className);
    for (let cell of cells) {
        cell.textContent = parseFloat(value).toFixed(2); // Ensure 2 decimal places
    }
}


function displayAllocation(allocation) {
    // Displays the allocation table with editable percentages
    let tableHTML = `
                <table border="1">
                    <tr>
                        <th>Investment Name</th>
                        <th>Allocation (%)</th>
                        <th>Amount (₹)</th>
                        <th>Remove</th>
                    </tr>`;

    Object.keys(allocation).forEach((key) => {
        tableHTML += `
                    <tr>
                        <td>${key}</td>
                        <td><input type="number" class="allocation-input" data-type="${key}" value="${allocation[key]}" min="0" max="100" onchange="updateAmounts()"></td>
                        <td id="${key}-amount">₹${(investment_amount * allocation[key] / 100).toFixed(2)}</td>
                        <td><button class="remove-btn" data-type="${key}" onclick="removeAllocation('${key}')">Remove</button></td>
                    </tr>`;
    });

    tableHTML += `</table>
                <p><strong>Remaining Allocation: <span id="remaining-allocation" class="remaining-good">0%</span></strong></p>`;

    document.getElementById("allocation-table").innerHTML = tableHTML;

    // Call updateAllocatedOptionsCount after updating the table
    if (window.updateAllocatedOptionsCount) {
        window.updateAllocatedOptionsCount();
    }

    // Add the "Investment Options" section below the table
    if (!document.getElementById("investment-options")) {
        const optionsSection = document.createElement("div");
        optionsSection.id = "investment-options";
        optionsSection.innerHTML = `
                    <h3>Investment Options</h3>
                    <div id="available-options">
                        <button class="option-btn" onclick="addOptionToTable('REITS')">REITS</button>
                    </div>`;
        document.getElementById("allocation-table").parentElement.appendChild(optionsSection);
    }

    updateRemainingAllocation();
    drawChart(allocation);
}

function removeAllocation(type) {
    // Removes the allocation for a specific investment type
    const input = document.querySelector(`.allocation-input[data-type="${type}"]`);
    if (input) {
        input.value = 0; // Set allocation percentage to 0
        updateAmounts(); // Update the table and chart
    }

    // Optionally, remove the row from the table
    const row = input.closest("tr");
    if (row) {
        row.remove();
    }

    // Add the removed option to the "Investment Options" section
    const availableOptions = document.getElementById("available-options");
    const existingButton = Array.from(availableOptions.children).find(btn => btn.textContent === type);

    if (!existingButton) {
        const optionButton = document.createElement("button");
        optionButton.className = "option-btn";
        optionButton.textContent = type;
        optionButton.onclick = () => addOptionToTable(type);
        availableOptions.appendChild(optionButton);
    }
    console.log(`Removed allocation for ${type}`);
    // Update the allocated options count after removing a row
    if (window.updateAllocatedOptionsCount) {
        window.updateAllocatedOptionsCount();
    }
}

function addOptionToTable(type) {
    // Adds the selected option back to the table with default allocation
    const allocation = getCurrentAllocation(); // Get the current allocation state
    if (!allocation[type]) {
        allocation[type] = 0; // Default allocation percentage for the added option
    }

    // Remove the option from the "Investment Options" section
    const availableOptions = document.getElementById("available-options");
    const optionButton = Array.from(availableOptions.children).find(btn => btn.textContent === type);
    if (optionButton) {
        availableOptions.removeChild(optionButton);
    }

    // Redisplay the allocation table with the updated allocation
    displayAllocation(allocation);
    console.log(`Added ${type} back to the table.`);
}

function getCurrentAllocation() {
    // Retrieves the current allocation state from the table
    const allocation = {};
    const inputs = document.querySelectorAll(".allocation-input");
    inputs.forEach(input => {
        const type = input.getAttribute("data-type");
        const value = parseFloat(input.value) || 0;
        allocation[type] = value;
    });
    return allocation;
}

// Function to handle user input and calculate allocations
function submitUserInput() {
    // Get default allocation and calculate amounts
    let allocation = getDefaultAllocation();
    StocksAllocationAmount = (investment_amount * allocation.Stocks) / 100;
    MutualFundsAllocationAmount = (investment_amount * allocation.MutualFunds) / 100;
    GoldETFsAllocationAmount = (investment_amount * allocation.GoldETFs) / 100;
    FDAllocationAmount = (investment_amount * allocation.FD) / 100;
    reitsallocationamount = (investment_amount * allocation.REITS) / 100;
    sgballocationamount = (investment_amount * allocation.SGB) / 100;
    ppfallocationamount = (investment_amount * allocation.PPF) / 100;
    nscallocationamount = (investment_amount * allocation.NSC) / 100;
    cryptoallocationamount = (investment_amount * allocation.Crypto) / 100;



    // Update the global storedAmount variable
    storedAmount = investment_amount;

    // Display allocation and update report table
    displayAllocation(allocation);
    updateReportTable();
    

    // Update the displayed amounts for UPI and card
    updateDisplayedAmounts();

    // Show the investment allocation section
    const allocationSection = document.getElementById("investmentAllocationSection");
    if (allocationSection) {
        allocationSection.style.display = "block";
    }
    const reportSection = document.getElementById("reportTableSection");
    if (reportSection) {
        reportSection.style.display = "block";
    }
    const investNowButton = document.getElementById("investNowButton");
    if (investNowButton) {
        investNowButton.style.display = "block";
    }

    // Fix: Update investment cards immediately after submit
    updateInvestmentCards();
}



function updateAmounts() {
    // Updates allocation amounts and percentages dynamically
    let totalPercentage = 0;
    let inputs = document.querySelectorAll(".allocation-input");

    inputs.forEach(input => {
        let value = parseFloat(input.value) || 0;
        totalPercentage += value;
    });

    let updatedAllocation = {};
    inputs.forEach(input => {
        let type = input.getAttribute("data-type");
        let percentage = parseFloat(input.value) || 0;
        let amount = (investment_amount * percentage / 100).toFixed(2);

        document.getElementById(`${type}-amount`).innerText = `₹${amount}`;
        updatedAllocation[type] = percentage;

        if (type === "Stocks") {
            Stocks_Allocation_presentage = percentage;
            StocksAllocationAmount = parseFloat(amount);
        } else if (type === "MutualFunds") {
            Mutual_Funds_Allocation_presentage = percentage;
            MutualFundsAllocationAmount = parseFloat(amount);
        } else if (type === "GoldETFs") {
            GoldETFs_Allocation_presentage = percentage;
            GoldETFsAllocationAmount = parseFloat(amount);
        } else if (type === "FD") {
            FDAllocationpresentage = percentage;
            FDAllocationAmount = parseFloat(amount);
        } else if (type === "REITS") {
            REITS_Allocation_presentage = percentage;
            reitsallocationamount = parseFloat(amount);
        } else if (type === "SGB") {
            SGB_Allocation_presentage = percentage;
            sgballocationamount = parseFloat(amount);
        } else if (type === "PPF") {
            PPF_Allocation_presentage = percentage;
            ppfallocationamount = parseFloat(amount);
        } else if (type === "NSC") {
            NSC_Allocation_presentage = percentage;
            nscallocationamount = parseFloat(amount);
        } else if (type === "Crypto") {
            Crypto_Allocation_presentage = percentage;
            cryptoallocationamount = parseFloat(amount);
        }
    });

    // Update percentage variables
    stocks_percentage = Stocks_Allocation_presentage;
    mutualFunds_percentage = Mutual_Funds_Allocation_presentage;
    goldETFs_percentage = GoldETFs_Allocation_presentage;
    fd_percentage = FDAllocationpresentage;
    reits_percentage = REITS_Allocation_presentage;
    sgb_percentage = SGB_Allocation_presentage;
    ppf_percentage = PPF_Allocation_presentage;
    nsc_percentage = NSC_Allocation_presentage;
    crypto_percentage = Crypto_Allocation_presentage;


    // Log updated values
    console.log("Updated Allocation:", updatedAllocation);

    updateRemainingAllocation();
    updateChart();
   

    // Call updateReportTable to refresh the report table
    updateReportTable();
    // Call this function whenever allocations change
updateInvestmentCards();
}



// Function to update the report table with calculated values
function updateReportTable() {
    // Updates the report table with calculated values
    // Update the "Amount Allocated" column for each investment type
 
     updateOverallSummary();

    // Update the "Invested Amount" row

    // Calculate stock losses and returns
    if (risk_level === "Low") {
        stock_average_return = calculateCompoundReturn(StocksAllocationAmount, 0.09, investment_duration);
        stock_highest_return = calculateCompoundReturn(StocksAllocationAmount, 0.12, investment_duration);
        stock_lowest_loss = calculateLoss(StocksAllocationAmount, 0.01);
        stock_lowest_loss = StocksAllocationAmount - stock_lowest_loss // 1% loss

    } else if (risk_level === "Medium") {
        stock_average_return = calculateCompoundReturn(StocksAllocationAmount, 0.12, investment_duration);
        stock_highest_return = calculateCompoundReturn(StocksAllocationAmount, 0.15, investment_duration);
        stock_lowest_loss = calculateLoss(StocksAllocationAmount, 0.05);
        stock_lowest_loss = StocksAllocationAmount - stock_lowest_loss // 1% loss
        // 5% loss
    } else if (risk_level === "High") {
        stock_average_return = calculateCompoundReturn(StocksAllocationAmount, 0.14, investment_duration);
        stock_highest_return = calculateCompoundReturn(StocksAllocationAmount, 0.18, investment_duration);
        stock_lowest_loss = calculateLoss(StocksAllocationAmount, 0.1596);
        stock_lowest_loss = StocksAllocationAmount - stock_lowest_loss // 1% loss
        // 15.96% loss
    }

    // Calculate mutual fund losses and returns
    if (risk_level === "Low") {
        mf_average_return = calculateCompoundReturn(MutualFundsAllocationAmount, 0.06, investment_duration);
        mf_highest_return = calculateCompoundReturn(MutualFundsAllocationAmount, 0.10, investment_duration);
        mf_lowest_loss = calculateLoss(MutualFundsAllocationAmount, 0.01);
        mf_lowest_loss = MutualFundsAllocationAmount - mf_lowest_loss; // 1% loss

        // 1% loss
    } else if (risk_level === "Medium") {
        mf_average_return = calculateCompoundReturn(MutualFundsAllocationAmount, 0.10, investment_duration);
        mf_highest_return = calculateCompoundReturn(MutualFundsAllocationAmount, 0.13, investment_duration);
        mf_lowest_loss = calculateLoss(MutualFundsAllocationAmount, 0.05);
        mf_lowest_loss = MutualFundsAllocationAmount - mf_lowest_loss;
        // 5% loss
    } else if (risk_level === "High") {
        mf_average_return = calculateCompoundReturn(MutualFundsAllocationAmount, 0.15, investment_duration);
        mf_highest_return = calculateCompoundReturn(MutualFundsAllocationAmount, 0.18, investment_duration);
        mf_lowest_loss = calculateLoss(MutualFundsAllocationAmount, 0.15); // 15% loss
        mf_lowest_loss = MutualFundsAllocationAmount - mf_lowest_loss; // 15% loss
    }

    // Calculate ETF returns
    etf_average_return = calculateCompoundReturn(GoldETFsAllocationAmount, 0.07, investment_duration);
    etf_highest_return = calculateCompoundReturn(GoldETFsAllocationAmount, 0.10, investment_duration);
    etf_lowest_loss = GoldETFsAllocationAmount - calculateLoss(GoldETFsAllocationAmount, 0.05); // 5% loss



    // Calculate FD returns
    fd_return = calculateFdReturn(FDAllocationAmount, investment_duration);
    increased_fd_return = fd_return + FDAllocationAmount;

    // Add this line to define fd_highest_return
    fd_highest_return = increased_fd_return;



    // Calculate REITs returns
    reits_average_return = calculateCompoundReturn(reitsallocationamount, 0.08, investment_duration);
    reits_highest_return = calculateCompoundReturn(reitsallocationamount, 0.12, investment_duration);
    reits_lowest_loss = calculateLoss(reitsallocationamount, 0.05);

    // calculate SGB returns
    // SGB Calculation Logic

    // --- SGB Parameters ---
    // You can adjust these as needed or make them user inputs
    const SGB_ISSUE_PRICE = 6263;
    let SGB_currect_price = 7263;
    const SGB_EXPECTED_APPRECIATION = 0.07;
    const SGB_HOLDING_YEARS = 8;
    const SGB_INTEREST_RATE = 0.025;
    const SGB_TAX_RATE_ON_INTEREST = 0.30;

    let purchasedGrams = sgballocationamount > 0 ? sgballocationamount / SGB_ISSUE_PRICE : 0;

    // Interest (paid semi-annually but calculated simply)
    let sgb_half_Yearly_Interest = SGB_ISSUE_PRICE * SGB_INTEREST_RATE * purchasedGrams;
    let sgb_yearly_Interest = sgb_half_Yearly_Interest * 2;
    let totalInterest = sgb_yearly_Interest * SGB_HOLDING_YEARS;



    // Final price after 8 years (capital only)
    let finalGoldPrice = SGB_ISSUE_PRICE * Math.pow(1 + SGB_EXPECTED_APPRECIATION, SGB_HOLDING_YEARS);
    let totalCapitalReturn = finalGoldPrice * purchasedGrams;
    let totalMaturityValue = totalCapitalReturn + totalInterest;

    // Optional UI update



    // crypto calculation
    if (cryptoallocationamount > 0) {
        // Crypto return assumptions (example: high volatility)
        // You can adjust these rates as per your research or user input
        let crypto_lowest_loss_rate = 0.30;   // 30% loss
        let crypto_average_return_rate = 0.15; // 15% average return
        let crypto_highest_return_rate = 0.40; // 40% high return

        // Calculate lowest loss (amount after loss)
        crypto_lowest_loss = cryptoallocationamount - calculateLoss(cryptoallocationamount, crypto_lowest_loss_rate);

        // Calculate average and highest returns (compounded)
        crypto_average_return = calculateCompoundReturn(cryptoallocationamount, crypto_average_return_rate, investment_duration);
        crypto_highest_return = calculateCompoundReturn(cryptoallocationamount, crypto_highest_return_rate, investment_duration);

    }

    // Crypto Calculation Logic


    // PPF Calculation Logic
    // 15-year lock-in | 🪙 7.1% Annual Compound Interest
    // 📅 Interest is compounded yearly.
    // 💡 Min ₹500/year, Max ₹1.5 lakh/year.

    // PPF Calculation Logic
    // 15-year lock-in | 🪙 7.1% Annual Compound Interest
    // 📅 Interest is compounded yearly.
    // 💡 Min ₹500/year, Max ₹1.5 lakh/year.
    if (ppfallocationamount > 0) {
        const PPF_INTEREST_RATE = 0.071; // 7.1% annual interest
        const PPF_LOCKIN_YEARS = 15;

        let ppf_investment_years = Math.max(investment_duration, 1); // User input or minimum 1 year
        let ppf_yearly_investment = Math.max(500, Math.min(ppfallocationamount, 150000)); // Valid yearly amount

        let ppf_total_balance = 0;

        // Contribute and compound for up to 15 years
        let ppf_contribution_years = Math.min(ppf_investment_years, PPF_LOCKIN_YEARS);
        for (let year = 1; year <= ppf_contribution_years; year++) {
            ppf_total_balance = (ppf_total_balance + ppf_yearly_investment) * (1 + PPF_INTEREST_RATE);
        }

        // After 15 years: compound only the existing balance (no new contributions)
        let ppf_extra_years = Math.max(ppf_investment_years - PPF_LOCKIN_YEARS, 0);
        for (let year = 1; year <= ppf_extra_years; year++) {
            ppf_total_balance *= (1 + PPF_INTEREST_RATE);
        }

        ppf_total_principal = ppf_yearly_investment * ppf_contribution_years;
        ppf_maturity_amount = ppf_total_balance;
        let ppf_total_interest_earned = ppf_maturity_amount - ppf_total_principal;


    }
    // NSC Calculation Logic
    // --- NSC Parameters ---
    // 5-year lock-in | 🪙 7.7% Annual Compound Interest
    // 📅 Interest is compounded yearly.
    // 💡 Min ₹1,000, multiples of ₹100.

    if (nscallocationamount > 0) {
        // Declaration
        const NSC_INTEREST_RATE = 0.077; // 7.7% annual interest
        const NSC_LOCKIN_YEARS = 5;

        // Logic
        // Ensure valid yearly investment (₹1,000 minimum, multiples of ₹100)
        nsc_investment = Math.max(1000, Math.floor(nscallocationamount / 100) * 100);

        // NSC compounds annually for 5 years without additional contributions
        nsc_maturity_amount = nsc_investment;
        for (let year = 1; year <= NSC_LOCKIN_YEARS; year++) {
            nsc_maturity_amount *= (1 + NSC_INTEREST_RATE);
        }

        let nsc_total_interest = nsc_maturity_amount - nsc_investment;


    }


    // Calculate profits for different investments
    stock_profit = stock_highest_return - StocksAllocationAmount;
    mf_profit = mf_highest_return - MutualFundsAllocationAmount;
    etf_profit = etf_highest_return - GoldETFsAllocationAmount;
    reits_profit = reits_highest_return - reitsallocationamount;
    crypto_profit = crypto_highest_return - cryptoallocationamount;
    fd_profit = increased_fd_return - FDAllocationAmount;
    ppf_profit = ppf_maturity_amount - ppf_total_principal;
    nsc_profit = nsc_maturity_amount - nsc_investment;
    sgb_profit = totalMaturityValue - sgballocationamount;

    // Constants
    const LTCG_EXEMPT_LIMIT = 125000;
    const LTCG_TAX_RATE = 0.125;
    const FD_THRESHOLD = 40000;
    const FD_TDS_RATE = 0.10;
    const SLAB_TAX_RATE = 0.20;

    // Calculate taxes
    stock_tax = calculateLTCGTax(stock_profit);
    mf_tax = calculateLTCGTax(mf_profit);
    etf_tax = calculateLTCGTax(etf_profit);
    reits_tax = calculateLTCGTax(reits_profit);
    crypto_tax = calculateLTCGTax(crypto_profit);
    fd_tax = calculateFDTax(fd_profit);
    ppf_tax = 0; // PPF is tax-exempt
    nsc_tax = calculateInterestTax(nsc_profit);
    sgb_tax = calculateInterestTax(sgb_yearly_Interest);

    // Calculate after-tax profits
    stock_profit_after_tax = stock_profit - stock_tax;
    mf_profit_after_tax = mf_profit - mf_tax;
    etf_profit_after_tax = etf_profit - etf_tax;
    reits_profit_after_tax = reits_profit - reits_tax;
    crypto_profit_after_tax = crypto_profit - crypto_tax;
    fd_profit_after_tax = fd_profit - fd_tax;
    ppf_profit_after_tax = ppf_profit - ppf_tax;
    nsc_profit_after_tax = nsc_profit - nsc_tax;
    sgb_profit_after_tax = sgb_profit - sgb_tax;

    // Helper functions for tax calculation
    function calculateLTCGTax(amount) {
        if (amount <= LTCG_EXEMPT_LIMIT) return 0;
        return (amount - LTCG_EXEMPT_LIMIT) * LTCG_TAX_RATE;
    }

    function calculateFDTax(amount) {
        return amount > FD_THRESHOLD ? (amount - FD_THRESHOLD) * FD_TDS_RATE : 0;
    }

    function calculateInterestTax(amount) {
        return amount * SLAB_TAX_RATE;
    }

    // Calculate Lowest Loss Investment Value
    let lowwest_loss_invested_amount = MutualFundsAllocationAmount + StocksAllocationAmount;

    //calculate Total Return for Lowest Loss
    let Total_Return_on_Lowest_Loss = stock_lowest_loss + mf_lowest_loss

    // Calculate Total Return for Lowest Return

    // Calculate Profit for Lowest Return

    // Calculate Total Return for Average Return
    TotalReturnonAverageReturn = stock_average_return + mf_average_return + etf_average_return + increased_fd_return;

    // Calculate Profit for Average Return
    ProfitonAverageReturn = TotalReturnonAverageReturn - investment_amount;

    // Calculate Total Return for Highest Return
    TotalReturnonHighestReturn = stock_highest_return + mf_highest_return + etf_highest_return + increased_fd_return;

    // Calculate Profit for Highest Return
    ProfitonHighestReturn = TotalReturnonHighestReturn - investment_amount;


    long_term_taxable_amount_on_Average_Return = (stock_average_return + mf_average_return + etf_average_return) - (MutualFundsAllocationAmount + StocksAllocationAmount + GoldETFsAllocationAmount);

    long_term_taxable_amount_on_Highest_Return = (stock_highest_return + mf_highest_return + etf_highest_return) - (MutualFundsAllocationAmount + StocksAllocationAmount + GoldETFsAllocationAmount);

    // Calculate FDtaxableamount
    FD_taxable_amount = fd_return;

    // Fixed Deposit (FD) Tax Calculation
    if (FD_taxable_amount > 40000) {
        fd_tax_amount = FD_taxable_amount * 0.10; // 10% TDS
    } else {
        fd_tax_amount = 0; // No tax if below threshold
    }



    if (long_term_taxable_amount_on_Average_Return > 125000) { // Adjusted threshold to ₹1,00,000
        long_term_tax_amount_on_average_return = (long_term_taxable_amount_on_Average_Return - 125000) * 0.125; // 12.5% tax
    } else {
        long_term_tax_amount_on_average_return = 0; // No tax if below threshold
    }

    if (long_term_taxable_amount_on_Highest_Return > 125000) { // Adjusted threshold to ₹1,00,000
        long_term_tax_amount_on_highest_return = (long_term_taxable_amount_on_Highest_Return - 125000) * 0.125; // 12.5% tax
    } else {
        long_term_tax_amount_on_highest_return = 0; // No tax if below threshold
    }


    tax_amount_on_average_return = fd_tax_amount + long_term_tax_amount_on_average_return;

    tax_amount_on_highest_return = fd_tax_amount + long_term_tax_amount_on_highest_return;


    Final_Amount_on_Average_Return = TotalReturnonAverageReturn - tax_amount_on_average_return;

    Final_Amount_on_Highest_Return = TotalReturnonHighestReturn - tax_amount_on_highest_return;

    console.log("Updated Total Returns, Profits, Taxes, and Final Amounts for Lowest, Average, and Highest Returns.");

    
    // Call the summary update
    updateOverallSummary();
}

function showSections() {
    // Show the Investment Allocation and Report Table sections
    document.getElementById("investmentAllocationSection").style.display = "block";
    document.getElementById("reportTableSection").style.display = "block";
    document.getElementById("investNowButton").style.display = "block";

    // Call the function to handle user input and update the tables
    submitUserInput();
}

const reportData = {
    investmentAmount: investment_amount,
    investmentDuration: investment_duration,
    riskLevel: risk_level,
    stocksAllocation: StocksAllocationAmount,
    mutualFundsAllocation: MutualFundsAllocationAmount,
    goldETFsAllocation: GoldETFsAllocationAmount,
    fdAllocation: FDAllocationAmount,
    totalReturnAverage: TotalReturnonAverageReturn,
    totalReturnHighest: TotalReturnonHighestReturn,
    profitAverage: ProfitonAverageReturn,
    profitHighest: ProfitonHighestReturn,
    taxAverage: tax_amount_on_average_return,
    taxHighest: tax_amount_on_highest_return,
    finalAmountAverage: Final_Amount_on_Average_Return,
    finalAmountHighest: Final_Amount_on_Highest_Return
};

// Store the report data in local storage
localStorage.setItem("investmentReport", JSON.stringify(reportData));

// Variable table section removed

function updateInvestmentCards() {
    // Mutual Funds
    if (MutualFundsAllocationAmount > 0) {
        document.getElementById('cardMutualFunds').style.display = '';
        document.getElementById('mfInvested').textContent = `₹${MutualFundsAllocationAmount.toLocaleString()}`;
        document.getElementById('mfExpectedReturn').textContent = `₹${mf_average_return.toLocaleString()}`;
        document.getElementById('mfWorstCase').textContent = `₹${mf_lowest_loss.toLocaleString()}`;
        document.getElementById('mfBestCase').textContent = `₹${mf_highest_return.toLocaleString()}`;
        document.getElementById('mfProfit').textContent = `₹${mf_profit.toLocaleString()}`;
        document.getElementById('mfTax').textContent = `₹${mf_tax.toLocaleString()}`;
        document.getElementById('mfFinal').textContent = `₹${mf_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardMutualFunds').style.display = 'none';
    }
    // Stocks
    if (StocksAllocationAmount > 0) {
        document.getElementById('cardStocks').style.display = '';
        document.getElementById('stocksInvested').textContent = `₹${StocksAllocationAmount.toLocaleString()}`;
        document.getElementById('stocksExpectedReturn').textContent = `₹${stock_average_return.toLocaleString()}`;
        document.getElementById('stocksWorstCase').textContent = `₹${stock_lowest_loss.toLocaleString()}`;
        document.getElementById('stocksBestCase').textContent = `₹${stock_highest_return.toLocaleString()}`;
        document.getElementById('stocksProfit').textContent = `₹${stock_profit.toLocaleString()}`;
        document.getElementById('stocksTax').textContent = `₹${stock_tax.toLocaleString()}`;
        document.getElementById('stocksFinal').textContent = `₹${stock_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardStocks').style.display = 'none';
    }
    // Gold ETFs
    if (GoldETFsAllocationAmount > 0) {
        document.getElementById('cardGoldETFs').style.display = '';        document.getElementById('goldETFInvested').textContent = `₹${GoldETFsAllocationAmount.toLocaleString()}`;
        document.getElementById('goldETFExpectedReturn').textContent = `₹${etf_average_return.toLocaleString()}`;
        document.getElementById('goldETFWorstCase').textContent = `₹${etf_lowest_loss.toLocaleString()}`;
        document.getElementById('goldETFBestCase').textContent = `₹${etf_highest_return.toLocaleString()}`;
        document.getElementById('goldETFProfit').textContent = `₹${etf_profit.toLocaleString()}`;
        document.getElementById('goldETFTax').textContent = `₹${etf_tax.toLocaleString()}`;
        document.getElementById('goldETFFinal').textContent = `₹${etf_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardGoldETFs').style.display = 'none';
    }
    // FD
    if (FDAllocationAmount > 0) {
        document.getElementById('cardFD').style.display = '';
        document.getElementById('fdInvested').textContent = `₹${FDAllocationAmount.toLocaleString()}`;
        document.getElementById('fdExpectedReturn').textContent = `₹${increased_fd_return.toLocaleString()}`;
        document.getElementById('fdBestCase').textContent = `₹${fd_highest_return.toLocaleString()}`;
        document.getElementById('fdProfit').textContent = `₹${fd_profit.toLocaleString()}`;
        document.getElementById('fdTax').textContent = `₹${fd_tax.toLocaleString()}`;
        document.getElementById('fdFinal').textContent = `₹${fd_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardFD').style.display = 'none';
    }
    // REITS
    if (reitsallocationamount > 0) {
        document.getElementById('cardREITS').style.display = '';
        document.getElementById('reitsInvested').textContent = `₹${reitsallocationamount.toLocaleString()}`;
        document.getElementById('reitsExpectedReturn').textContent = `₹${reits_average_return.toLocaleString()}`;
        document.getElementById('reitsWorstCase').textContent = `₹${reits_lowest_loss.toLocaleString()}`;
        document.getElementById('reitsBestCase').textContent = `₹${reits_highest_return.toLocaleString()}`;
        document.getElementById('reitsProfit').textContent = `₹${reits_profit.toLocaleString()}`;
        document.getElementById('reitsTax').textContent = `₹${reits_tax.toLocaleString()}`;
        document.getElementById('reitsFinal').textContent = `₹${reits_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardREITS').style.display = 'none';
    }
    // SGB
    // ...inside updateInvestmentCards(), SGB section...
    if (sgballocationamount > 0) {
        document.getElementById('cardSGB').style.display = '';
        document.getElementById('sgbPricePerGram').textContent = `₹${SGB_ISSUE_PRICE.toLocaleString()}`;
        document.getElementById('sgbInvested').textContent = `₹${sgballocationamount.toLocaleString()}`;
        document.getElementById('sgbGrams').textContent = sgb_purchased_grams.toFixed(3);
        document.getElementById('sgbTotalCost').textContent = `₹${sgb_total_cost.toLocaleString()}`;
        document.getElementById('sgbAnnualInterest').textContent = `₹${sgb_annual_interest.toLocaleString()}`;
        document.getElementById('sgbTotalInterest').textContent = `₹${sgb_total_interest.toLocaleString()}`;
        document.getElementById('sgbMaturityAmount').textContent = `₹${sgb_maturity_amount.toLocaleString()}`;
        document.getElementById('sgbTotalReturn').textContent = `₹${sgb_total_return.toLocaleString()}`;
        document.getElementById('sgbProfit').textContent = `₹${sgb_profit.toLocaleString()}`;
        document.getElementById('sgbTax').textContent = `₹${sgb_tax.toLocaleString()}`;
        document.getElementById('sgbFinal').textContent = `₹${sgb_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardSGB').style.display = 'none';
    }
    // PPF
    // ...inside updateInvestmentCards(), in the PPF section...
    // ...inside updateInvestmentCards(), PPF section...
    if (ppfallocationamount > 0) {
        document.getElementById('cardPPF').style.display = '';
        document.getElementById('ppfInvested').textContent = `₹${ppfallocationamount.toLocaleString()}`;
        document.getElementById('ppfExpectedReturn').textContent = `₹${ppf_return.toLocaleString()}`;
        document.getElementById('ppfWorstCase').textContent = `₹${ppf_lowest_loss.toLocaleString()}`;
        document.getElementById('ppfBestCase').textContent = `₹${ppf_highest_return.toLocaleString()}`;
        document.getElementById('ppfTotalPrincipal').textContent = `₹${ppf_total_principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        document.getElementById('ppfMaturityAmount').textContent = `₹${ppf_maturity_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        document.getElementById('ppfTotalInterestEarned').textContent = `₹${ppf_total_interest_earned.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        document.getElementById('ppfProfit').textContent = `₹${ppf_profit.toLocaleString()}`;
        document.getElementById('ppfTax').textContent = `₹${ppf_tax.toLocaleString()}`;
        document.getElementById('ppfFinal').textContent = `₹${ppf_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardPPF').style.display = 'none';
    }
    // NSC
    // ...inside updateInvestmentCards(), NSC section...
    if (nscallocationamount > 0) {
        document.getElementById('cardNSC').style.display = '';
        document.getElementById('nscInvested').textContent = `₹${nscallocationamount.toLocaleString()}`;
        document.getElementById('nscExpectedReturn').textContent = `₹${nsc_return.toLocaleString()}`;
        document.getElementById('nscWorstCase').textContent = `₹${nsc_lowest_loss.toLocaleString()}`;
        document.getElementById('nscBestCase').textContent = `₹${nsc_highest_return.toLocaleString()}`;
        // New NSC fields
        document.getElementById('nscMaturityAmount').textContent = `₹${nsc_maturity_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        document.getElementById('nscInvestment').textContent = `₹${nsc_investment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        document.getElementById('nscTotalInterest').textContent = `₹${nsc_total_interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        document.getElementById('nscProfit').textContent = `₹${nsc_profit.toLocaleString()}`;
        document.getElementById('nscTax').textContent = `₹${nsc_tax.toLocaleString()}`;
        document.getElementById('nscFinal').textContent = `₹${nsc_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardNSC').style.display = 'none';
    }
    // Crypto
    if (cryptoallocationamount > 0) {
        document.getElementById('cardCrypto').style.display = '';
        document.getElementById('cryptoInvested').textContent = `₹${cryptoallocationamount.toLocaleString()}`;
        document.getElementById('cryptoExpectedReturn').textContent = `₹${crypto_average_return.toLocaleString()}`;
        document.getElementById('cryptoWorstCase').textContent = `₹${crypto_lowest_loss.toLocaleString()}`;
        document.getElementById('cryptoBestCase').textContent = `₹${crypto_highest_return.toLocaleString()}`;
        document.getElementById('cryptoProfit').textContent = `₹${crypto_profit.toLocaleString()}`;
        document.getElementById('cryptoTax').textContent = `₹${crypto_tax.toLocaleString()}`;
        document.getElementById('cryptoFinal').textContent = `₹${crypto_profit_after_tax.toLocaleString()}`;
    } else {
        document.getElementById('cardCrypto').style.display = 'none';
    }
}
// Global variables for profits, taxes, and after-tax profits for each investment type

// Add this at the end of your script or inside a DOMContentLoaded event
const submitBtn = document.getElementById('submitBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', function() {
        updateReportTable();
        updateInvestmentCards();
    });
}

function updateOverallSummary() {
    // Get the summary elements
    const investedEl = document.querySelector('.summary-item span');
    const expectedReturnEl = document.querySelectorAll('.summary-item span')[1];
    const profitEl = document.querySelector('.summary-item .profit');
    const taxEl = document.querySelector('.summary-item .tax');
    const finalEl = document.querySelector('.summary-item .final');

    // Calculate values (use your actual calculated variables)
    const invested = investment_amount || 0;
    const expectedReturn = TotalReturnonAverageReturn || 0;
    const profit = ProfitonAverageReturn || 0;
    const tax = tax_amount_on_average_return || 0;
    const finalAfterTax = Final_Amount_on_Average_Return || 0;

    // Update the DOM
    if (investedEl) investedEl.textContent = `₹${invested.toLocaleString()}`;
    if (expectedReturnEl) expectedReturnEl.textContent = `₹${expectedReturn.toLocaleString()}`;
    if (profitEl) profitEl.textContent = `₹${profit.toLocaleString()}`;
    if (taxEl) taxEl.textContent = `₹${tax.toLocaleString()}`;
    if (finalEl) finalEl.textContent = `₹${finalAfterTax.toLocaleString()}`;
}

// --- New Wallet Balance Logic ---
function showWalletInsufficientPopup(walletBalance, investmentAmount) {
    // Remove any existing popup
    let old = document.getElementById('wallet-insufficient-popup');
    if (old) old.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'wallet-insufficient-popup';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.zIndex = 9999;
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    // Create popup box
    const box = document.createElement('div');
    box.style.background = '#fff';
    box.style.padding = '32px 28px 24px 28px';
    box.style.borderRadius = '12px';
    box.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    box.style.textAlign = 'center';
    box.style.minWidth = '320px';

    // Message
    const msg = document.createElement('div');
    msg.style.fontSize = '1.1em';
    msg.style.marginBottom = '18px';
    msg.innerHTML = `Insufficient wallet balance.<br>You have <b>₹${walletBalance.toLocaleString()}</b>, but you need <b>₹${investmentAmount.toLocaleString()}</b>.`;
    box.appendChild(msg);

    // Add Funds button
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Funds to Wallet';
    addBtn.style.background = '#1890ff';
    addBtn.style.color = '#fff';
    addBtn.style.padding = '10px 28px';
    addBtn.style.border = 'none';
    addBtn.style.borderRadius = '6px';
    addBtn.style.fontSize = '1em';
    addBtn.style.cursor = 'pointer';
    addBtn.style.marginTop = '10px';
    addBtn.onclick = function() {
        window.location.href = '../wallet/wallet.html';
    };
    box.appendChild(addBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.style.background = '#fff';
    closeBtn.style.color = '#1890ff';
    closeBtn.style.padding = '10px 18px';
    closeBtn.style.border = '1.5px solid #1890ff';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.fontSize = '1em';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '16px';
    closeBtn.onclick = function() {
        document.body.removeChild(overlay);
    };
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

async function getWalletBalanceFromDB() {
    const WALLET_API_URL = 'http://localhost:3001/api/wallet';
    let currentWalletBalance = 0;
    
    const username = localStorage.getItem('currentUser');
    if (!username) {
        showPopup("Please log in to check wallet balance.", 3000);
        return 0;
    }

    try {
        const res = await fetch(WALLET_API_URL);
        if (!res.ok) throw new Error('Failed to fetch wallet data');
        const data = await res.json();

        // Only consider this user's transactions
        const transactions = data.filter(entry => entry.username === username);

        // Calculate wallet balance (deposits + returns - withdrawals - investments)
        transactions.forEach(entry => {
            if (entry.type === 'Deposit' || entry.type === 'Return') {
                currentWalletBalance += entry.amount;
            } else if (entry.type === 'Withdrawal' || entry.type === 'Investment') {
                currentWalletBalance -= entry.amount;
            }
        });

        // Prevent negative wallet balance
        if (currentWalletBalance < 0) currentWalletBalance = 0;
        return currentWalletBalance;
    } catch (e) {
        console.error('Could not load wallet data:', e);
        showPopup('Could not load wallet balance.', 3000);
        return 0;
    }
}

// Record investment in wallet
async function recordInvestmentTransaction(amount) {
    const WALLET_API_URL = 'http://localhost:3001/api/wallet';
    
    const username = localStorage.getItem('currentUser');
    if (!username) {
        showPopup("Please log in to record investment transaction.", 3000);
        return false;
    }
    const entry = {
        name: 'Main Wallet',
        balance: 0, // Not used by backend, but required by schema
        amount: amount,
        type: 'Investment',
        description: 'Invested in portfolio',
        date: new Date().toISOString(),
        status: 'Done',
        username: username
    };
    try {
        const res = await fetch(WALLET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        if (!res.ok) throw new Error('Failed to record investment transaction');
        return true;
    } catch (e) {
        showPopup('Could not record investment transaction.', 3000);
        return false;
    }
}

// Save investment allocation/portfolio
async function saveUserInvestment() {
    let selectionData = localStorage.getItem('SelectionData');
    if (!selectionData) {
        showPopup('No investment selection data found.', 3000);
        return false;
    }
    try {
        selectionData = JSON.parse(selectionData);
    } catch (e) {
        showPopup('Invalid selection data format.', 3000);
        return false;
    }
    // Ensure username is set
    const username = localStorage.getItem('currentUser');
    if (!username) {
        showPopup("Please log in to save investment plan.", 3000);
        return false;
    }
    selectionData.username = username;
    // Add a planId if not present
    if (!selectionData.planId) {
        selectionData.planId = `${selectionData.username}_${Date.now()}`;
    }
    try {
        const res = await fetch('http://localhost:3001/api/saveSelection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectionData)
        });
        if (!res.ok) throw new Error('Failed to save investment plan');
        console.log('SaveSelection response:', res.status, await res.text());
        return true;
    } catch (e) {
        showPopup('Failed to save investment plan. Please try again.', 3000);
        return false;
    }
}

// Function to update user info display
function updateUserInfoDisplay() {
    const userInfo = document.getElementById('current-user-info');
    if (userInfo) {
        if (auth.isAuthenticated && auth.user) {
            const username = auth.user.username || auth.user.email || 'User';
            userInfo.textContent = `Welcome, ${username}!`;
            userInfo.style.display = 'block';
        } else {
            userInfo.textContent = '';
            userInfo.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    auth.checkAuth();
    
    // Update user info display
    updateUserInfoDisplay();
    
    // Listen for storage changes (when user logs in/out from other pages)
    window.addEventListener('storage', function(e) {
        if (e.key === 'userData') {
            auth.checkAuth();
            updateUserInfoDisplay();
        }
    });
    
    const investNowButton = document.getElementById('investNowButton');

    if (investNowButton) {
        investNowButton.addEventListener('click', async function() {
            // 0. Check if user is logged in
            const username = localStorage.getItem('currentUser');
            if (!username) {
                showPopup("Please log in to invest.", 2000);
                setTimeout(() => {
                    window.location.href = '../user/login.html';
                }, 2000);
                return;
            }

            // 1. Get current investment amount from input
            const investmentAmount = parseFloat(document.getElementById("investmentAmount").value) || 0;

            // 2. Get current wallet balance from DB
            const walletBalance = await getWalletBalanceFromDB();

            // 3. Disable Invest Now button if balance is zero or less
            investNowButton.disabled = (walletBalance <= 0);

            // 4. Validate
            if (investmentAmount <= 0) {
                showPopup("Please enter a valid investment amount.", 3000);
                return;
            }

            if (investmentAmount > walletBalance) {
                showWalletInsufficientPopup(walletBalance, investmentAmount);
                return;
            }

            // 5. Record investment transaction in wallet
            const success = await recordInvestmentTransaction(investmentAmount);
            if (!success) return;

            // 6. Save investment allocation/portfolio
            const saveSuccess = await saveUserInvestment();
            if (!saveSuccess) return;

            // 7. If both succeed, proceed
            showPopup("Investment successful! Redirecting to payment...", 2000);
            setTimeout(() => {
                window.location.href = 'payment.html';
            }, 2000);
        });
    }
});


document.addEventListener('wheel', function (e) {
    const target = e.target;
    if (target && target.tagName === 'INPUT' && target.type === 'number') {
        // Only trigger if the input is hovered (not just focused)
        const rect = target.getBoundingClientRect();
        const x = e.clientX, y = e.clientY;
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            e.preventDefault();
            let step = parseFloat(target.step) || 1;
            let min = (target.min !== '' ? parseFloat(target.min) : -Infinity);
            let max = (target.max !== '' ? parseFloat(target.max) : Infinity);
            let value = parseFloat(target.value) || 0;
            if (e.deltaY < 0) {
                // Scroll up: increment
                value += step;
            } else {
                // Scroll down: decrement
                value -= step;
            }
            value = Math.min(Math.max(value, min), max);
            target.value = value;
            // Trigger change/input event for listeners
            target.dispatchEvent(new Event('change', { bubbles: true }));
            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
}, { passive: false });
