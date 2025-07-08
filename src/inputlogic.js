// this logic take care of the input logic user can add the investment options
// and remove them as well
function displayAllocation(allocation) {
    // Displays the allocation table with editable percentages and amounts
    let tableHTML = `
        <table border="1">
            <tr>
                <th>Investment Name</th>
                <th>Allocation (%)</th>
                <th>Amount (₹)</th>
                <th>Remove</th>
            </tr>`;

    Object.keys(allocation).forEach((key) => {
        const percent = parseFloat(allocation[key]).toFixed(2);
        const amount = (investment_amount * percent / 100).toFixed(2);
        tableHTML += `
            <tr>
                <td>${key}</td>
                <td>
                    <input type="number" class="allocation-input" data-type="${key}" value="${percent}" min="0" max="100" step="0.01" 
                        onchange="updatePercentFromInput('${key}')"
                        style="width:90px; font-size: 1.2em; padding: 6px;">
                </td>
                <td>
                    <input type="number" class="allocation-amount-input" data-type="${key}" value="${amount}" min="0" max="${investment_amount}" step="0.01" 
                        onchange="updateAmountFromInput('${key}')"
                        style="width:120px; font-size: 1.2em; padding: 6px;">
                </td>
                <td>
                    <button class="remove-btn" data-type="${key}" onclick="removeAllocation('${key}')">Remove</button>
                </td>
            </tr>`;
    });

    tableHTML += `</table>
        <p><strong>Remaining Allocation: <span id="remaining-allocation" class="remaining-good">0%</span></strong></p>`;

    document.getElementById("allocation-table").innerHTML = tableHTML;

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

    // Add event listeners for amount inputs
    document.querySelectorAll('.allocation-amount-input').forEach(input => {
        input.addEventListener('change', function () {
            const type = input.getAttribute('data-type');
            updateAmountFromInput(type);
        });
        addSmoothStepHandlers(input, 'amount', input.getAttribute('data-type'));
    });

    // Add event listeners for percent inputs
    document.querySelectorAll('.allocation-input').forEach(input => {
        input.addEventListener('change', function () {
            const type = input.getAttribute('data-type');
            updatePercentFromInput(type);
        });
        addSmoothStepHandlers(input, 'percent', input.getAttribute('data-type'));
    });
}


// Function to add smooth step handlers for inputs it displays the smooth step
function updateRemainingAllocation() {
    // Updates the remaining allocation percentage and checks against investment amount
    let totalPercentage = 0;
    let totalAmount = 0;
    const investmentAmountInput = document.getElementById("investmentAmount");
    const investmentAmount = parseFloat(investmentAmountInput ? investmentAmountInput.value : 0) || 0;

    document.querySelectorAll(".allocation-input").forEach(input => {
        let percent = parseFloat(input.value) || 0;
        totalPercentage += percent;
        totalAmount += (investmentAmount * percent / 100);
    });

    let remainingPercent = 100 - totalPercentage;
    let remainingAmount = investmentAmount - totalAmount;
    let remainingDisplay = document.getElementById("remaining-allocation");

    // Round to 2 decimals for display, but use a small epsilon for logic
    const percentEpsilon = 0.01;
    const amountEpsilon = 1; // 1 rupee

    let percentMsg = "";
    let amountMsg = "";

    // Percentage message
    if (remainingPercent < -percentEpsilon) {
        percentMsg = `Exceeded by ${Math.abs(remainingPercent).toFixed(2)}%`;
    } else if (Math.abs(remainingPercent) <= percentEpsilon) {
        percentMsg = "100% Allocated";
        remainingPercent = 0;
    } else {
        percentMsg = `Remaining: ${remainingPercent.toFixed(2)}%`;
    }

    // Amount message
    if (remainingAmount < -amountEpsilon) {
        amountMsg = ` | Exceeded by ₹${Math.abs(remainingAmount).toFixed(2)}`;
    } else if (Math.abs(remainingAmount) <= amountEpsilon) {
        amountMsg = " | 100% Amount Used";
        remainingAmount = 0;
    } else {
        amountMsg = ` | Remaining: ₹${remainingAmount.toFixed(2)}`;
    }

    remainingDisplay.innerText = percentMsg + amountMsg;

    // Color logic: red if either exceeded, green if both exactly allocated, black otherwise
    if (remainingPercent < -percentEpsilon || remainingAmount < -amountEpsilon) {
        remainingDisplay.style.color = "red";
    } else if (Math.abs(remainingPercent) <= percentEpsilon && Math.abs(remainingAmount) <= amountEpsilon) {
        remainingDisplay.style.color = "green";
    } else {
        remainingDisplay.style.color = "black";
    }

    remainingDisplay.style.fontSize = "20px";
    remainingDisplay.style.fontWeight = "bold";
}