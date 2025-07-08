function updateRemainingAllocation() {    // Updates the remaining allocation percentage
    let totalPercentage = 0;
    let hasInvalidInput = false;

    document.querySelectorAll(".allocation-input").forEach(input => {
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            hasInvalidInput = true;
        } else {
            totalPercentage += value;
        }
    });

    // Handle invalid input case
    if (hasInvalidInput) {
        let remainingDisplay = document.getElementById("remaining-allocation");
        remainingDisplay.innerText = "Invalid input";
        remainingDisplay.style.color = "red";
        remainingDisplay.style.fontSize = "20px";
        remainingDisplay.style.fontWeight = "bold";
        return false;
    }

    const roundedTotal = Math.round(totalPercentage * 100) / 100;
    let remaining = 100 - roundedTotal;
    let remainingDisplay = document.getElementById("remaining-allocation");

    // Round remaining to 2 decimal places
    remaining = Math.round(remaining * 100) / 100;

    if (remaining < 0) {
        remainingDisplay.innerText = `Exceeded by ${Math.abs(remaining).toFixed(2)}%`;
        remainingDisplay.style.color = "red"; // Red for exceeding 100%
    } else if (Math.abs(remaining) < 0.01) { // Check if very close to 0
        remainingDisplay.innerText = "100% Allocated";
        remainingDisplay.style.color = "green"; // Green for exactly 100%
        remaining = 0; // Set to exactly 0 if very close
    } else {
        remainingDisplay.innerText = `Remaining: ${remaining.toFixed(2)}%`;
        remainingDisplay.style.color = "black"; // Black for below 100%
    }

    // Increase the font size for better visibility
    remainingDisplay.style.fontSize = "20px";
    remainingDisplay.style.fontWeight = "bold";

    return remaining === 0; // Return true if allocation is exactly 100%
}



function updateChart() {
    // Updates the chart with new allocation data
    let updatedData = {};
    document.querySelectorAll(".allocation-input").forEach(input => {
        let type = input.getAttribute("data-type");
        updatedData[type] = parseFloat(input.value) || 0;
    });

    drawChart(updatedData);
}

function drawChart(allocation) {
    // Draws the investment allocation chart using Chart.js
    let ctx = document.getElementById("investmentChart").getContext("2d");

    if (!investmentChart) {
        investmentChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: Object.keys(allocation),
                datasets: [{
                    data: Object.values(allocation),
                    backgroundColor: ["#7F00FF", "#FFD700", "#00A36C", "#FF4500", "#FF6347", "#FF1493", "#FF69B4", "#FF8C00", "#ADD8E6", "#800080"],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" }
                }
            }
        });
    } else {
        investmentChart.data.labels = Object.keys(allocation);
        investmentChart.data.datasets[0].data = Object.values(allocation);
        investmentChart.update();
    }
}



function displayInvestmentOptions() {
    console.log("Displaying investment options based on duration:", investment_duration);

    // Define the locking periods for specific investment options
    const lockingPeriods = {
        SGB: 8,  // Locking period for SGB is 8 years
        PPF: 15, // Locking period for PPF is 15 years
        NSC: 5   // Locking period for NSC is 5 years
    };

    // Get the available options container
    const availableOptions = document.getElementById("available-options");
    availableOptions.innerHTML = ""; // Clear existing options

    let optionsAdded = false; // Track if any options are added

    // Add options dynamically based on the user's investment duration
    if (investment_duration >= lockingPeriods.SGB) {
        const sgbButton = document.createElement("button");
        sgbButton.className = "option-btn";
        sgbButton.textContent = "SGB";
        sgbButton.onclick = () => addOptionToTable("SGB");
        availableOptions.appendChild(sgbButton);
        optionsAdded = true;
    }

    if (investment_duration >= lockingPeriods.PPF) {
        const ppfButton = document.createElement("button");
        ppfButton.className = "option-btn";
        ppfButton.textContent = "PPF";
        ppfButton.onclick = () => addOptionToTable("PPF");
        availableOptions.appendChild(ppfButton);
        optionsAdded = true;
    }

    if (investment_duration >= lockingPeriods.NSC) {
        const nscButton = document.createElement("button");
        nscButton.className = "option-btn";
        nscButton.textContent = "NSC";
        nscButton.onclick = () => addOptionToTable("NSC");
        availableOptions.appendChild(nscButton);
        optionsAdded = true;
    }

    // Always show options without locking periods
    const reitsButton = document.createElement("button");
    reitsButton.className = "option-btn";
    reitsButton.textContent = "REITS";
    reitsButton.onclick = () => addOptionToTable("REITS");
    availableOptions.appendChild(reitsButton);
    optionsAdded = true;

    const cryptoButton = document.createElement("button");
    cryptoButton.className = "option-btn";
    cryptoButton.textContent = "Crypto";
    cryptoButton.onclick = () => addOptionToTable("Crypto");
    availableOptions.appendChild(cryptoButton);
    optionsAdded = true;

    // Hide the "Investment Options" section if no options are available
    const investmentOptionsSection = document.getElementById("investment-options");
    if (optionsAdded) {
        investmentOptionsSection.style.display = "block";
    } else {
        investmentOptionsSection.style.display = "none";
    }
}

// Variable to store the number of rows in the allocation table
let allocatedOptionsCount = -1;

// Function to update the allocated options count
function updateAllocatedOptionsCount() {
    // Count the number of rows in the allocation table (excluding header)
    const table = document.getElementById("allocation-table");
    if (table) {
        const rows = table.getElementsByTagName("tr");
        // Subtract 1 for the header row
        allocatedOptionsCount = rows.length - 1;
    } else {
        allocatedOptionsCount = -1;
    }
    window.allocatedOptionsCount = allocatedOptionsCount; // <-- Make globally accessible
    console.log("allocatedOptionsCount:", allocatedOptionsCount);
}

// Patch addOptionToTable to update count after adding a row
// This function is called from investment.js, so we patch globally
window.updateAllocatedOptionsCount = updateAllocatedOptionsCount;



// --- Default values for testing (remove or comment out to disable) ---
document.addEventListener('DOMContentLoaded', function () {
    // Use a setTimeout to ensure the elements are fully loaded
    setTimeout(function() {
        // Set Investment Type: One-Time
        const investTypeBtn = document.querySelector('.select-btn[data-type="investment"]');
        if (investTypeBtn) investTypeBtn.click();

        // Set Risk Appetite: Low
        const riskBtn = Array.from(document.querySelectorAll('.select-btn[data-type="risk"]'))
            .find(btn => btn.textContent.trim() === 'Low');
        if (riskBtn) riskBtn.click();

        // Set Investment Duration: 1 Year
        const durationBtn = Array.from(document.querySelectorAll('.select-btn[data-type="duration"]'))
            .find(btn => btn.textContent.trim() === '1 Year');
     

        // Set Emergency Fund: Yes (if you have such a button, otherwise skip)
        const efBtn = document.querySelector('.select-btn[data-type="emergency"]');
        if (efBtn) efBtn.click();

        // Set Investment Amount: 30000
        const amountInput = document.getElementById('investmentAmount');
        if (amountInput) amountInput.value = 90000;

        // Set Inflation Rate (optional, default is 6)
        const inflationInput = document.getElementById('inflationRate');
        if (inflationInput) inflationInput.value = 6;
    }, 100); // Adjust the timeout value (in milliseconds) as needed
});
window.showManualAllocation = function() {
    try {
      // Force update of allocatedOptionsCount before manual selection
      if (window.updateAllocatedOptionsCount) window.updateAllocatedOptionsCount();
      manualSelection();
      document.getElementById('manualAllocationSection').style.display = 'block';
      document.getElementById('autoAllocationSection').style.display = 'none';
    } catch (error) {
      console.error('Error in manual selection:', error);
    }
  };



