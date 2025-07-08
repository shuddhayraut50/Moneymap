import { stocksData } from "./data/stocks.js";
import { mutualFundData } from "./data/mutualFunds.js";
import { etfData } from "./data/etfs.js";
import { reitsData } from "./data/reits.js";
import { cryptoData } from "./data/crypto.js";
import { fdData, getFDInterestRate } from "./data/fd.js";

// Global variables for tracking allocations
let currentETFSetCost = 0;
let countOfAllocation = 0;
let stocksAllocationAmount = 0;
let mutualFundsAllocationAmount = 0;
let goldETFsAllocationAmount = 0;
let reitsAllocationAmount = 0;
let cryptoAllocationAmount = 0;
let fdAllocationAmount = 0;
let sgbAllocationAmount = 0;
let ppfAllocationAmount = 0;
let nscAllocationAmount = 0;
let allocationsdone  = 0;


function updateAllocationCount() {
  countOfAllocation = 0;

  // Count stocks if allocated
  if (stocksAllocationAmount > 0) countOfAllocation++;

  // Count Mutual Funds if allocated
  if (mutualFundsAllocationAmount > 0) countOfAllocation++;

  // Count Gold ETFs if allocated
  if (goldETFsAllocationAmount > 0) countOfAllocation++;

  // Count REITs if allocated
  if (reitsAllocationAmount > 0) countOfAllocation++;

  // Count Crypto if allocated
  if (cryptoAllocationAmount > 0) countOfAllocation++;

  // Count FD if allocated
  if (fdAllocationAmount > 0) countOfAllocation++;

  // Count SGB if allocated
  if (sgbAllocationAmount > 0) countOfAllocation++;

  // Count PPF if allocated
  if (ppfAllocationAmount > 0) countOfAllocation++;

  // Count NSC if allocated
  if (nscAllocationAmount > 0) countOfAllocation++;
  console.log(`Total number of investment options with allocation: ${countOfAllocation}`);
  // Return the updated count
  return countOfAllocation;
}

function createSearchBar(containerId, optionClass) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "search-input";
  searchInput.placeholder = "Search...";

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll(`.${optionClass}`).forEach((div) => {
      const name = div.querySelector("label").textContent.toLowerCase();
      div.classList.toggle("hidden", !name.includes(searchTerm));
    });
  });

  searchContainer.appendChild(searchInput);
  container.insertBefore(searchContainer, container.firstChild);
  return searchInput;
}

function manualSelection() {
  allocationsdone = 0;
  if (typeof updateManualProgress === 'function') updateManualProgress();
  const allocation = getCurrentAllocation();
  displayAllocation(allocation);
  
  countOfAllocation = updateAllocationCount();
  showPopup(
    "Manual Selection mode enabled. Adjust allocations manually.",
    3000
  );
  let purchaseSummaries = "";
  let stocksRemainingAmount = 0;
  let mutualFundsRemainingAmount = 0;
  let goldETFsRemainingAmount = 0;
  let reitsRemainingAmount = 0;
  let sgbRemainingAmount = 0;
  let ppfRemainingAmount = 0;
  let nscRemainingAmount = 0;
  let cryptoRemainingAmount = 0;

 

  function displayAllSummaries() {
    const summaryDiv = document.getElementById("purchaseSummary") || 
      Object.assign(document.createElement("div"), { id: "purchaseSummary" });
    if (!summaryDiv.parentElement) document.body.appendChild(summaryDiv);
    summaryDiv.innerHTML = purchaseSummaries;
    document.getElementById("popup").style.display = "block";
  }

 

  if (StocksAllocationAmount > 0) {
  const { low: lowRiskStocks, medium: mediumRiskStocks, high: highRiskStocks } = stocksData;

  let manualRemainingAmount = StocksAllocationAmount;
  let selectedStockList = [];
  const prevQty = [];
  let currentSetCost = 0;

  const modalOverlay = document.getElementById("modalOverlay");
  const modalMessage = document.getElementById("modalMessage");
  document.getElementById("modalOkBtn").onclick = () => {
    modalOverlay.style.display = "none";
  };
  const showModal = (msg) => {
    modalMessage.textContent = msg;
    modalOverlay.style.display = "flex";
  };

  function selectStockList() {
    switch (risk_level) {
      case "low":
        selectedStockList = [...lowRiskStocks];
        break;
      case "medium":
        selectedStockList = [...mediumRiskStocks];
        break;
      default:
        selectedStockList = [...highRiskStocks];
    }
    calculateBulkCosts();
    updateStockAffordability();
  }

  // Bulk cost calculation
  function calculateBulkCosts() {
    currentSetCost = selectedStockList.reduce((sum, s) => sum + s.price, 0);
    updateButtonStates();
  }

  // Dynamic bulk purchase buttons
  function updateButtonStates() {
    const bulkButtons = document.querySelector(".bulk-buttons");
    bulkButtons.innerHTML = "";

    const multipliers = [
      { value: 1, label: "+1 Each" },
      { value: 10, label: "+10 Each" },
      { value: 100, label: "+100 Each" },
    ];

    multipliers.forEach(({ value, label }) => {
      const cost = currentSetCost * value;
      if (manualRemainingAmount >= cost) {
        const btn = document.createElement("button");
        btn.className = "all-one-btn";
        btn.textContent = `${label} (₹${cost.toLocaleString("en-IN")})`;
        btn.onclick = () => addMultipleOfEach(value);
        bulkButtons.appendChild(btn);
      }
    });

    if (!bulkButtons.children.length) {
      bulkButtons.innerHTML = `<p style="color:#6c757d; margin:0;">
        ${
          manualRemainingAmount > 0
            ? "No bulk options available - try individual stocks below ↓"
            : "No funds remaining for bulk purchases"
        }
      </p>`;
    }
  }

  // Affordability markers
  function updateStockAffordability() {
    document.querySelectorAll(".stock-option").forEach((div, idx) => {
      const stock = selectedStockList[idx];
      if (!stock) return;

      const canAfford = manualRemainingAmount >= stock.price;
      div.classList.toggle("affordable", canAfford);

      let indicator = div.querySelector(".afford-indicator");
      if (!indicator) {
        indicator = document.createElement("div");
        indicator.className = "afford-indicator";
        indicator.style.cssText = `
          width: 8px; height: 8px; border-radius: 50%;
          background: #28a745; margin-left: 10px; display: none;
        `;
        div.querySelector("label").appendChild(indicator);
      }
      indicator.style.display = canAfford ? "inline-block" : "none";
    });
  }

  // Manual input section render
  function renderManualUI() {
    const container = document.getElementById("stockSelectors");
    container.innerHTML = "";

    createSearchBar("stockSelectors", "stock-option");

    selectedStockList.forEach((stock, idx) => {
      prevQty[idx] = 0;

      const wrapper = document.createElement("div");
      wrapper.className = "stock-option";

      const label = document.createElement("label");
      label.htmlFor = `units-${idx}`;
      label.textContent = `${stock.name} (₹${stock.price.toLocaleString("en-IN")}/unit)`;

      const input = document.createElement("input");
      input.type = "number";
      input.id = `units-${idx}`;
      input.min = 0;
      input.step = 1;
      input.value = 0;

      input.addEventListener("wheel", (e) => {
        e.preventDefault();
        const val = parseInt(input.value) || 0;
        input.value = Math.max(0, val - Math.sign(e.deltaY));
        handleManualInput(idx, input);
      });

      input.addEventListener("focus", () => {
        prevQty[idx] = parseInt(input.value) || 0;
      });
      input.addEventListener("input", () => handleManualInput(idx, input));

      wrapper.append(label, input);
      container.appendChild(wrapper);
    });

    document.getElementById("manualOptions").style.display = "block";
    updateManualRemaining();
    updateStockAffordability();
  }

  function handleManualInput(idx, inputEl) {
    const newQty = Math.max(0, parseInt(inputEl.value) || 0);
    const oldQty = prevQty[idx];
    const delta = (newQty - oldQty) * selectedStockList[idx].price;
    const potentialRemaining = manualRemainingAmount - delta;

    if (potentialRemaining >= 0) {
      manualRemainingAmount = potentialRemaining;
      prevQty[idx] = newQty;
    } else {
      inputEl.value = oldQty;
      showModal("Insufficient funds for this quantity.");
      return;
    }

    updateManualRemaining();
  }

  function updateManualRemaining() {
    const el = document.getElementById("manualRemaining");

    const invested = selectedStockList.reduce((sum, stock, idx) => {
      const qty = parseInt(document.querySelector(`#units-${idx}`)?.value) || 0;
      return sum + qty * stock.price;
    }, 0);

    manualRemainingAmount = Math.max(0, StocksAllocationAmount - invested);
    el.textContent = `Remaining: ₹${manualRemainingAmount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
    el.classList.toggle("negative", manualRemainingAmount === 0);

    updateButtonStates();
    updateStockAffordability();
  }

  // Bulk add units
  function addMultipleOfEach(multiplier) {
    const cost = currentSetCost * multiplier;
    if (cost > manualRemainingAmount) {
      showModal(`Need ₹${cost.toLocaleString("en-IN")} but only ₹${manualRemainingAmount.toLocaleString("en-IN")} remaining`);
      return;
    }

    selectedStockList.forEach((_, idx) => {
      const input = document.getElementById(`units-${idx}`);
      const currentQty = parseInt(input.value) || 0;
      input.value = currentQty + multiplier;
      prevQty[idx] = currentQty + multiplier;
    });

    manualRemainingAmount -= cost;
    updateManualRemaining();
  }

  // Finalization flow
  document.getElementById("doneBtn").onclick = () => {
    const selected = [];
    let invested = 0;

    selectedStockList.forEach((stock, idx) => {
      const qty = parseInt(document.getElementById(`units-${idx}`)?.value) || 0;
      if (qty > 0) {
        const total = qty * stock.price;
        invested += total;
        selected.push({ name: stock.name, price: stock.price, quantity: qty, total });
      }
    });

    document.querySelectorAll(".stock-option input").forEach((el) => (el.disabled = true));
    document.getElementById("manualOptions").style.display = "none";

    renderPortfolio("📋 Selected Stocks", selected, invested, StocksAllocationAmount - invested);
  };

  function enableManualEditing() {
    document.querySelectorAll(".stock-option input").forEach((el) => (el.disabled = false));
    document.getElementById("result_box").style.display = "none";
    document.getElementById("manualOptions").style.display = "block";
  }

  function finalizeManualSelection() {
    const result = {};
    let invested = 0;
    allocationsdone = allocationsdone + 1;
    console.log(`Allocations done stock: ${allocationsdone}`);
    updateManualProgress();
    

    selectedStockList.forEach((stock, idx) => {
      const qty = parseInt(document.getElementById(`units-${idx}`)?.value) || 0;
      if (qty > 0) {
        invested += qty * stock.price;
        result[stock.name] = qty;
      }
    });

    document.getElementById("editQuantitiesBtn").disabled = true;
    document.getElementById("confirmManualAllocationBtn").disabled = true;

    showModal("Your manual allocation has been finalized. No further changes can be made.");

    // storePortfolioInIndexedDB(result, invested, StocksAllocationAmount - invested); // Optional

    // Create a portfolio object to store in localStorage
    const portfolioData = {
      stocks: selected,
      totalInvestment: invested,
      remainingBalance: StocksAllocationAmount - invested,
      date: new Date().toISOString()
    };

    // Store in localStorage
    localStorage.setItem('stockPortfolio', JSON.stringify(portfolioData));

    // Log detailed portfolio info to the console
    console.log("Stock Portfolio:");
    selectedStockList.forEach(stock => {
      console.log(
        `Name: ${stock.name}, Qty: ${stock.quantity}, Price: ₹${stock.price}, Total: ₹${stock.total}`
      );
    });
    console.log(`Total Investment: ₹${invested}`);
    console.log(`Remaining Balance: ₹${StocksAllocationAmount - invested}`);
  }

  function renderPortfolio(title, data, invested, remaining) {
    document.getElementById("result_box").style.display = "block";
    document.getElementById("portfolioTitle").textContent = title;

    const grid = document.getElementById("portfolioGrid");
    grid.innerHTML = data
      .map(
        (stock) => `
        <div class="portfolio-item">
          <div class="stock-info">
            <div class="stock-name">${stock.name}</div>
            <div class="stock-price">
              ${stock.quantity} unit(s) × ₹${stock.price.toLocaleString("en-IN")} = ₹${stock.total.toLocaleString("en-IN")}
            </div>
          </div>
        </div>`
      )
      .join("");

    document.getElementById("portfolioTotals").innerHTML = `
      Total Investment: ₹${invested.toLocaleString("en-IN")}<br>
      Remaining Balance: ₹${remaining.toLocaleString("en-IN")}
    `;

    document.getElementById("editQuantitiesBtn").onclick = enableManualEditing;
    document.getElementById("confirmManualAllocationBtn").onclick = finalizeManualSelection;

    // Create stock portfolio object and store in localStorage
    const stockPortfolio = {
      stocks: data.map(stock => ({
        name: stock.name,
        quantity: stock.quantity,
        price: stock.price,
        total: stock.total
      })),
      totalInvestment: invested,
      remainingBalance: remaining,
      date: new Date().toISOString()
    };
    localStorage.setItem('stockPortfolio', JSON.stringify(stockPortfolio));

    // Log detailed portfolio info to the console
    console.log("Stock Portfolio:");
    data.forEach(stock => {
      console.log(
        `Name: ${stock.name}, Qty: ${stock.quantity}, Price: ₹${stock.price}, Total: ₹${stock.total}`
      );
    });
    console.log(`Total Investment: ₹${invested}`);
    console.log(`Remaining Balance: ₹${remaining}`);
  }


  

  // INIT
  selectStockList();
  renderManualUI();
  
  
} else {
  document.querySelector(".calculator_container").style.display = "block";
  stocksRemainingAmount = StocksAllocationAmount;
}


  if (MutualFundsAllocationAmount > 0) {
    // Risk-based mutual fund data
    const { low: lowRiskMFs, medium: mediumRiskMFs, high: highRiskMFs } = mutualFundData;

    let manualMFRemainingAmount = MutualFundsAllocationAmount;
    let selectedMFList = [];
    const prevMFQty = [];
    let currentMFSetCost = 0;
    let mfResultLocked = false;

    // Utility functions
    const showMFModal = (msg) => {
      document.getElementById("modalMessage").textContent = msg;
      document.getElementById("modalOverlay").style.display = "flex";
    };

    // Select MFs based on risk level
    function selectMFList() {
      selectedMFList = mutualFundData[risk_level.toLowerCase()] || [];
      if (!selectedMFList.length) {
        showMFModal("No mutual funds available for selected risk level");
        return;
      }
      calculateMFBulkCosts();
      updateMFAffordability();
    }

    // Calculate costs for bulk purchases
    function calculateMFBulkCosts() {
      currentMFSetCost = selectedMFList.reduce((sum, mf) => sum + mf.nav, 0);
      updateMFButtonStates();
    }

    // Update bulk purchase button states
    function updateMFButtonStates() {
      const bulkButtons = document.querySelector(".mf-bulk-buttons");
      bulkButtons.innerHTML = "";

      if (mfResultLocked) {
        bulkButtons.innerHTML = '<p style="color:#6c757d; margin:0;">Selection is finalized</p>';
        return;
      }

      const multipliers = [
        { value: 1, label: "+1 Each" },
        { value: 10, label: "+10 Each" },
        { value: 100, label: "+100 Each" }
      ];

      multipliers.forEach(({ value, label }) => {
        const cost = currentMFSetCost * value;
        if (manualMFRemainingAmount >= cost) {
          const button = document.createElement("button");
          button.className = "all-one-btn";
          button.innerHTML = `${label} (₹${cost.toLocaleString("en-IN")})`;
          button.onclick = () => addMultipleOfEachMF(value);
          bulkButtons.appendChild(button);
        }
      });

      if (bulkButtons.children.length === 0) {
        const message = manualMFRemainingAmount > 0
          ? "Individual selection available below ↓"
          : "No remaining funds for investment";
        bulkButtons.innerHTML = `<p style="color:#6c757d; margin:0;">${message}</p>`;
      }
    }

    // Update visual affordability indicators
    function updateMFAffordability() {
      document.querySelectorAll(".mf-option").forEach((mfDiv, index) => {
        const mf = selectedMFList[index];
        if (!mf) return;

        const canAfford = manualMFRemainingAmount >= mf.nav;
        mfDiv.classList.toggle("affordable", canAfford);
        
        const input = mfDiv.querySelector("input");
        input.disabled = mfResultLocked;

        const indicator = mfDiv.querySelector(".afford-indicator") || 
                        createAffordabilityIndicator(mfDiv);
        indicator.style.display = canAfford && !mfResultLocked ? "inline-block" : "none";
      });
    }

    // Create affordability indicator element
    function createAffordabilityIndicator(mfDiv) {
      const indicator = document.createElement("div");
      indicator.className = "afford-indicator";
      indicator.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #28a745;
        margin-left: 10px;
        display: none;
      `;
      mfDiv.querySelector("label").appendChild(indicator);
      return indicator;
    }

    // Render the MF selection UI
    function renderManualMFUI() {
      const container = document.getElementById("mfSelectors");
      container.innerHTML = "";

      // Add search functionality
      createSearchBar("mfSelectors", "mf-option");

      // Render MF options
      selectedMFList.forEach((mf, idx) => {
        const div = document.createElement("div");
        div.className = "mf-option";

        const label = document.createElement("label");
        label.htmlFor = `mf-units-${idx}`;
        label.textContent = `${mf.name} (₹${mf.nav.toLocaleString("en-IN")}/unit)`;

        const input = document.createElement("input");
        input.type = "number";
        input.id = `mf-units-${idx}`;
        input.min = 0;
        input.step = 1;
        input.value = prevMFQty[idx] || 0;

        // Add scroll wheel support
        input.addEventListener("wheel", (event) => {
          event.preventDefault();
          if (mfResultLocked) return;
          
          const delta = Math.sign(event.deltaY);
          const currentValue = parseInt(input.value) || 0;
          const newValue = Math.max(0, currentValue - delta);
          input.value = newValue;
          handleManualMFInput(idx, input);
        });

        // Handle input changes
        input.addEventListener("focus", () => {
          prevMFQty[idx] = parseInt(input.value) || 0;
        });
        
        input.addEventListener("input", (event) => {
          const value = event.target.value;
          if (value === "" || isNaN(value)) {
            input.value = "0";
          }
          handleManualMFInput(idx, input);
        });

        div.append(label, input);
        container.appendChild(div);
      });

      updateManualMFRemaining();
      document.getElementById("manualMFOptions").style.display = "block";
      updateMFButtonStates();
      updateMFAffordability();
    }

    // Handle manual input for MF quantities
    function handleManualMFInput(idx, inputEl) {
      if (mfResultLocked) return;

      let newQty = Math.max(0, parseInt(inputEl.value) || 0);
      if (isNaN(newQty)) newQty = 0;
      const oldQty = prevMFQty[idx] || 0;
      inputEl.value = newQty.toString();

      const mf = selectedMFList[idx];
      const deltaCost = (newQty - oldQty) * mf.nav;
      const potentialRemaining = manualMFRemainingAmount - deltaCost;

      if (potentialRemaining >= 0) {
        manualMFRemainingAmount = potentialRemaining;
        prevMFQty[idx] = newQty;
      } else {
        inputEl.value = oldQty;
        showMFModal(`Insufficient funds. You need ₹${(Math.abs(potentialRemaining)).toLocaleString("en-IN")} more.`);
        return;
      }

      updateManualMFRemaining();
      updateMFButtonStates();
      updateMFAffordability();
    }

    // Add multiple units of each MF
    function addMultipleOfEachMF(multiplier) {
      if (mfResultLocked) return;

      const requiredAmount = currentMFSetCost * multiplier;
      if (requiredAmount > manualMFRemainingAmount) {
        showMFModal(
          `Insufficient funds for bulk purchase. Need ₹${requiredAmount.toLocaleString("en-IN")}`
        );
        return;
      }

      selectedMFList.forEach((_, idx) => {
        const input = document.getElementById(`mf-units-${idx}`);
        const currentQty = parseInt(input.value) || 0;
        input.value = currentQty + multiplier;
        prevMFQty[idx] = currentQty + multiplier;
      });

      manualMFRemainingAmount -= requiredAmount;
      updateManualMFRemaining();
      updateMFButtonStates();
      updateMFAffordability();
    }

    // Update remaining amount display
    function updateManualMFRemaining() {
      const remainingElement = document.getElementById("manualMFRemaining");
      if (!remainingElement) return;

      const totalInvested = selectedMFList.reduce((total, mf, idx) => {
        const qty = parseInt(document.querySelector(`#mf-units-${idx}`).value) || 0;
        return total + qty * mf.nav;
      }, 0);

      manualMFRemainingAmount = Math.max(0, MutualFundsAllocationAmount - totalInvested);
      
      const formattedAmount = manualMFRemainingAmount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
      });

      remainingElement.textContent = `Remaining: ${formattedAmount}`;
      remainingElement.classList.toggle("warning", manualMFRemainingAmount === 0);
      
      updateMFButtonStates();
      updateMFAffordability();
    }

    // Done button handler
    document.getElementById("mfDoneBtn").onclick = () => {
      if (mfResultLocked) return;

      const selectedMFs = [];
      let totalInvestment = 0;

      selectedMFList.forEach((mf, idx) => {
        const qty = parseInt(document.querySelector(`#mf-units-${idx}`).value) || 0;
        if (qty > 0) {
          const total = qty * mf.nav;
          totalInvestment += total;
          selectedMFs.push({
            name: mf.name,
            nav: mf.nav,
            quantity: qty,
            total
          });
        }
      });

      const remainingBalance = MutualFundsAllocationAmount - totalInvestment;

      document.getElementById("manualMFOptions").style.display = "none";

      renderMFPortfolio(
        "📋 Selected Mutual Funds",
        selectedMFs,
        totalInvestment,
        remainingBalance
      );

      document.getElementById("editMFQuantitiesBtn").onclick = enableManualMFEditing;
      document.getElementById("confirmManualMFAllocationBtn").onclick = finalizeManualMFSelection;
    };

    // Enable editing of MF selections
    function enableManualMFEditing() {
      if (mfResultLocked) return;

      document.querySelectorAll(".mf-option input").forEach(input => {
        input.disabled = false;
      });
      
      document.getElementById("mf_result_box").style.display = "none";
      document.getElementById("manualMFOptions").style.display = "block";
      
      updateMFButtonStates();
      updateMFAffordability();
    }

    // Finalize MF selection
    function finalizeManualMFSelection() {
      const selectedMFs = {};
      let totalInvestment = 0;
      allocationsdone = allocationsdone + 1;
      console.log(`Allocations done mf: ${allocationsdone}`);
      updateManualProgress();
      

      selectedMFList.forEach((mf, idx) => {
        const qty = parseInt(document.querySelector(`#mf-units-${idx}`).value) || 0;
        if (qty > 0) {
          totalInvestment += qty * mf.nav;
          selectedMFs[mf.name] = qty;
        }
      });

      mfResultLocked = true;
      document.getElementById("editMFQuantitiesBtn").disabled = true;
      document.getElementById("confirmManualMFAllocationBtn").disabled = true;
      
      updateMFButtonStates();
      updateMFAffordability();

      showMFModal("Mutual Fund allocation has been finalized. No further changes can be made.");
    }

    // Render MF portfolio summary
    function renderMFPortfolio(title, data, invested, remaining) {
      const resultBox = document.getElementById("mf_result_box");
      resultBox.style.display = "block";
      document.getElementById("mfPortfolioTitle").textContent = title;

      const grid = document.getElementById("mfPortfolioGrid");
      grid.innerHTML = data
      .map(
        (mf) => `
        <div class="portfolio-item">
          <div class="fund-info">
          <div class="fund-name">${mf.name}</div>
          <div class="fund-details">
            ${mf.quantity} unit(s) × ₹${mf.nav.toLocaleString("en-IN")} = ₹${mf.total.toLocaleString("en-IN")}
          </div>
          </div>
        </div>
        `
      )
      .join("");

      document.getElementById("mfPortfolioTotals").innerHTML = `
      Total Investment: ₹${invested.toLocaleString("en-IN")}<br>
      Remaining Balance: ₹${remaining.toLocaleString("en-IN")}
      `;

      document.getElementById("editMFQuantitiesBtn").onclick = enableManualMFEditing;
      document.getElementById("confirmManualMFAllocationBtn").onclick = finalizeManualMFSelection;

      // Create mutual funds portfolio object and store in localStorage
      const mutualFundsPortfolio = {
        funds: data.map(mf => ({
          name: mf.name,
          quantity: mf.quantity,
          nav: mf.nav,
          total: mf.total
        })),
        totalInvestment: invested,
        remainingBalance: remaining,
        date: new Date().toISOString()
      };
      localStorage.setItem('mutualFundsPortfolio', JSON.stringify(mutualFundsPortfolio));

      // Log detailed mutual fund portfolio info to the console
      console.log("Mutual Funds Portfolio:");
      data.forEach(mf => {
      console.log(
        `Name: ${mf.name}, Qty: ${mf.quantity}, NAV: ₹${mf.nav}, Total: ₹${mf.total}`
      );
      });
      console.log(`Total Investment: ₹${invested}`);
      console.log(`Remaining Balance: ₹${remaining}`);
    }

    // INIT
    selectMFList();
    renderManualMFUI();
    } else {mutualFundsRemainingAmount = stocksRemainingAmount;
      console.log(
        `Mutual Funds Remaining Amount else block: ${mutualFundsRemainingAmount}`
      );
    }
    
    
    

    // --- Gold ETF Block ---
    if (GoldETFsAllocationAmount > 0) {
      const GOLD_ETF_ALLOCATION_AMOUNT = GoldETFsAllocationAmount + mutualFundsRemainingAmount;

      let manualETFRemainingAmount = GOLD_ETF_ALLOCATION_AMOUNT;
      let selectedETFList = [];
      const prevETFQty = [];
      let etfResultLocked = false;

      // Utility functions
      const showETFModal = (msg) => {
        document.getElementById("modalMessage").textContent = msg;
        document.getElementById("modalOverlay").style.display = "flex";
      };

      // Select ETFs based on risk level
      function selectETFList() {
        selectedETFList = etfData[risk_level.toLowerCase()] || [];
        if (!selectedETFList.length) {
          showETFModal("No ETFs available for selected risk level");
          return;
        }
        calculateETFBulkCosts();
        updateETFAffordability();
      }

      // Calculate costs for bulk purchases
      function calculateETFBulkCosts() {
        currentETFSetCost = selectedETFList.reduce((sum, etf) => sum + etf.price, 0);
        updateETFButtonStates();
      }

      // Update bulk purchase button states
      function updateETFButtonStates() {
        const bulkButtons = document.querySelector(".etf-bulk-buttons");
        if (!bulkButtons) return;
        
        bulkButtons.innerHTML = "";

        if (etfResultLocked) {
          bulkButtons.innerHTML = '<p style="color:#6c757d; margin:0;">Selection is finalized</p>';
          return;
        }

        const multipliers = [
          { value: 1, label: "+1 Each" },
          { value: 10, label: "+10 Each" },
          { value: 100, label: "+100 Each" }
        ];

        multipliers.forEach(({ value, label }) => {
          const cost = currentETFSetCost * value;
          if (manualETFRemainingAmount >= cost) {
            const button = document.createElement("button");
            button.className = "all-one-btn";
            button.innerHTML = `${label} (₹${cost.toLocaleString("en-IN")})`;
            button.onclick = () => addMultipleOfEachETF(value);
            bulkButtons.appendChild(button);
          }
        });

        if (bulkButtons.children.length === 0) {
          const message = manualETFRemainingAmount > 0
            ? "Individual selection available below ↓"
            : "No remaining funds for investment";
          bulkButtons.innerHTML = `<p style="color:#6c757d; margin:0;">${message}</p>`;
        }
      }

      // Update visual affordability indicators
      function updateETFAffordability() {
        document.querySelectorAll(".etf-option").forEach((etfDiv, index) => {
          const etf = selectedETFList[index];
          if (!etf) return;

          const canAfford = manualETFRemainingAmount >= etf.price;
          etfDiv.classList.toggle("affordable", canAfford);
          
          const input = etfDiv.querySelector("input");
          input.disabled = etfResultLocked;

          const indicator = etfDiv.querySelector(".afford-indicator") || 
                          createAffordabilityIndicator(etfDiv);
          indicator.style.display = canAfford && !etfResultLocked ? "inline-block" : "none";
        });
      }

      // Create affordability indicator element
      function createAffordabilityIndicator(etfDiv) {
        const indicator = document.createElement("div");
        indicator.className = "afford-indicator";
        indicator.style.cssText = `
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #28a745;
          margin-left: 10px;
          display: none;
        `;
        etfDiv.querySelector("label").appendChild(indicator);
        return indicator;
      }

      // Render the ETF selection UI
      function renderManualETFUI() {
        const container = document.getElementById("etfSelectors");
        container.innerHTML = "";

        // Add search functionality
        createSearchBar("etfSelectors", "etf-option");

        // Render ETF options
        selectedETFList.forEach((etf, idx) => {
          const div = document.createElement("div");
          div.className = "etf-option";

          const label = document.createElement("label");
          label.htmlFor = `etf-units-${idx}`;
          label.textContent = `${etf.name} (₹${etf.price.toLocaleString("en-IN")}/unit)`;

          const input = document.createElement("input");
          input.type = "number";
          input.id = `etf-units-${idx}`;
          input.min = 0;
          input.step = 1;
          input.value = prevETFQty[idx] || 0;

          // Add scroll wheel support
          input.addEventListener("wheel", (event) => {
            event.preventDefault();
            if (etfResultLocked) return;
            
            const delta = Math.sign(event.deltaY);
            const currentValue = parseInt(input.value) || 0;
            const newValue = Math.max(0, currentValue - delta);
            input.value = newValue;
            handleManualETFInput(idx, input);
          });

          // Handle input changes
          input.addEventListener("focus", () => {
            prevETFQty[idx] = parseInt(input.value) || 0;
          });
          
          input.addEventListener("input", (event) => {
            const value = event.target.value;
            if (value === "" || isNaN(value)) {
              input.value = "0";
            }
            handleManualETFInput(idx, input);
          });

          div.append(label, input);
          container.appendChild(div);
        });

        updateManualETFRemaining();
        document.getElementById("manualETFOptions").style.display = "block";
        updateETFButtonStates();
        updateETFAffordability();
      }

      // Handle manual input for ETF quantities
      function handleManualETFInput(idx, inputEl) {
        if (etfResultLocked) return;

        let newQty = Math.max(0, parseInt(inputEl.value) || 0);
        if (isNaN(newQty)) newQty = 0;
        const oldQty = prevETFQty[idx] || 0;
        inputEl.value = newQty.toString();

        const etf = selectedETFList[idx];
        const deltaCost = (newQty - oldQty) * etf.price;
        const potentialRemaining = manualETFRemainingAmount - deltaCost;

        if (potentialRemaining >= 0) {
          manualETFRemainingAmount = potentialRemaining;
          prevETFQty[idx] = newQty;
        } else {
          inputEl.value = oldQty;
          showETFModal(`Insufficient funds. You need ₹${(Math.abs(potentialRemaining)).toLocaleString("en-IN")} more.`);
          return;
        }

        updateManualETFRemaining();
        updateETFButtonStates();
        updateETFAffordability();
      }

      // Add multiple units of each ETF
      function addMultipleOfEachETF(multiplier) {
        if (etfResultLocked) return;

        const requiredAmount = currentETFSetCost * multiplier;
        if (requiredAmount > manualETFRemainingAmount) {
          showETFModal(
            `Insufficient funds for bulk purchase. Need ₹${requiredAmount.toLocaleString("en-IN")}`
          );
          return;
        }

        selectedETFList.forEach((_, idx) => {
          const input = document.getElementById(`etf-units-${idx}`);
          const currentQty = parseInt(input.value) || 0;
          input.value = currentQty + multiplier;
          prevETFQty[idx] = currentQty + multiplier;
        });

        manualETFRemainingAmount -= requiredAmount;
        updateManualETFRemaining();
        updateETFButtonStates();
        updateETFAffordability();
      }

      // Update remaining amount display
      function updateManualETFRemaining() {
        const remainingElement = document.getElementById("manualETFRemaining");
        if (!remainingElement) return;

        const totalInvested = selectedETFList.reduce((total, etf, idx) => {
          const qty = parseInt(document.querySelector(`#etf-units-${idx}`).value) || 0;
          return total + qty * etf.price;
        }, 0);

        manualETFRemainingAmount = Math.max(0, GOLD_ETF_ALLOCATION_AMOUNT - totalInvested);
        
        const formattedAmount = manualETFRemainingAmount.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2
        });

        remainingElement.textContent = `Remaining: ${formattedAmount}`;
        remainingElement.classList.toggle("warning", manualETFRemainingAmount === 0);
        
        updateETFButtonStates();
        updateETFAffordability();
      }

      // Done button handler
      document.getElementById("etfDoneBtn").onclick = () => {
        if (etfResultLocked) return;

        const selectedETFs = [];
        let totalInvestment = 0;

        selectedETFList.forEach((etf, idx) => {
          const qty = parseInt(document.querySelector(`#etf-units-${idx}`).value) || 0;
          if (qty > 0) {
            const total = qty * etf.price;
            totalInvestment += total;
            selectedETFs.push({
              name: etf.name,
              price: etf.price,
              quantity: qty,
              total
            });
          }
        });

        const remainingBalance = GOLD_ETF_ALLOCATION_AMOUNT - totalInvestment;

        document.getElementById("manualETFOptions").style.display = "none";

        renderETFPortfolio(
          "📋 Selected ETFs",
          selectedETFs,
          totalInvestment,
          remainingBalance
        );

        document.getElementById("editETFQuantitiesBtn").onclick = enableManualETFEditing;
        document.getElementById("confirmManualETFAllocationBtn").onclick = finalizeManualETFSelection;
      };

      // Enable editing of ETF selections
      function enableManualETFEditing() {
        if (etfResultLocked) return;

        document.querySelectorAll(".etf-option input").forEach(input => {
          input.disabled = false;
        });
        
        document.getElementById("etf_result_box").style.display = "none";
        document.getElementById("manualETFOptions").style.display = "block";
        
        updateETFButtonStates();
        updateETFAffordability();
      }

      // Finalize ETF selection
      function finalizeManualETFSelection() {
      const selectedETFs = {};
      let totalInvestment = 0;
      allocationsdone = allocationsdone + 1;
      console.log(`Allocations done etf: ${allocationsdone}`);
      updateManualProgress();
      

      selectedETFList.forEach((etf, idx) => {
        const qty = parseInt(document.querySelector(`#etf-units-${idx}`).value) || 0;
        if (qty > 0) {
          totalInvestment += qty * etf.price;
          selectedETFs[etf.name] = qty;
        }
      });

      etfResultLocked = true;
      document.getElementById("editETFQuantitiesBtn").disabled = true;
      document.getElementById("confirmManualETFAllocationBtn").disabled = true;
      
      updateETFButtonStates();
      updateETFAffordability();

      showETFModal("ETF allocation has been finalized. No further changes can be made.");
    }

    // Render ETF portfolio summary
    function renderETFPortfolio(title, portfolio, totalInvestment, remainingBalance) {
      const resultBox = document.getElementById("etf_result_box");
      resultBox.style.display = "block";

      document.getElementById("etfPortfolioTitle").textContent = title;

      const grid = document.getElementById("etfPortfolioGrid");
      grid.innerHTML = portfolio
        .map(etf => `
          <div class="portfolio-item">
            <div class="fund-info">
              <div class="fund-name">${etf.name}</div>
              <div class="fund-details">
                ${etf.quantity} unit(s) × ₹${etf.price.toLocaleString("en-IN")} = 
                ₹${etf.total.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        `)
        .join("");

      document.getElementById("etfPortfolioTotals").innerHTML = `
          <div class="portfolio-summary">
            <div class="summary-item">Total Investment: ₹${totalInvestment.toLocaleString("en-IN")}</div>
            <div class="summary-item ${remainingBalance > 0 ? 'warning' : ''}">
              Remaining Balance: ₹${remainingBalance.toLocaleString("en-IN")}
            </div>
          </div>
        `;

      // Create ETF portfolio object and store in localStorage
      const etfPortfolio = {
        etfs: selectedETFList.map((etf, idx) => ({
          name: etf.name,
          units: prevETFQty[idx] || 0,
          price: etf.price,
          total: (prevETFQty[idx] || 0) * etf.price
        })),
        totalInvestment: totalInvestment,
        remainingBalance: remainingBalance,
        date: new Date().toISOString()
      };
      localStorage.setItem('etfPortfolio', JSON.stringify(etfPortfolio));

      // Log portfolio details to the console
      console.log("Gold ETF Portfolio:");
      selectedETFList.forEach((etf, idx) => {
        const units = prevETFQty[idx] || 0;
        const total = units * etf.price;
        console.log(`- ${etf.name}: ${units} unit(s), Total: ₹${total.toLocaleString("en-IN")}`);
      });
      console.log(`Total Investment: ₹${totalInvestment.toLocaleString("en-IN")}`);
      console.log(`Remaining Balance: ₹${remainingBalance.toLocaleString("en-IN")}`);
    }

    // Initialize ETF selection
    selectETFList();
    renderManualETFUI();
  } else {
    goldETFsRemainingAmount = mutualFundsRemainingAmount;
    console.log(
      `Gold ETFs Remaining Amount else block: ${goldETFsRemainingAmount}`
    );
  }

  // --- REIT Block ---
  reitsallocationamount = reitsallocationamount + goldETFsRemainingAmount;
  console.log(`gold reaming `, goldETFsRemainingAmount);
  if (reitsallocationamount > 0) {
    const REIT_ALLOCATION_AMOUNT =
      reitsallocationamount + goldETFsRemainingAmount;

    // Use risk-level based REIT selection
    let reits;
    if (risk_level === "low") reits = reitsData.low;
    else if (risk_level === "medium") reits = reitsData.medium;
    else reits = reitsData.high;

    let manualREITRemainingAmount = REIT_ALLOCATION_AMOUNT;
    let selectedREITs = [];
    let reitResultLocked = false;
    const prevREITQty = [0, 0, 0];

    function showREITModal(msg) {
      document.getElementById("modalMessage").textContent = msg;
      document.getElementById("modalOverlay").style.display = "flex";
      document.getElementById("modalOkBtn").onclick = function () {
        document.getElementById("modalOverlay").style.display = "none";
      };
    }

    function updateREITButtonStates() {
      const bulkButtons = document.getElementById("reitBulkButtons");
      if (!bulkButtons) return;
      bulkButtons.innerHTML = "";

      const multipliers = [
        { value: 1, label: "+1 Each" },
        { value: 10, label: "+10 Each" },
        { value: 100, label: "+100 Each" },
      ];

      multipliers.forEach((multiplier) => {
        const cost = reits.reduce(
          (sum, reit) => sum + reit.price * multiplier.value,
          0
        );
        if (manualREITRemainingAmount >= cost) {
          const button = document.createElement("button");
          button.className = "bulk-btn";
          button.innerHTML = `${multiplier.label} (₹${cost.toLocaleString(
            "en-IN",
            { maximumFractionDigits: 2 }
          )})`;
          button.onclick = () => addMultipleOfEachREIT(multiplier.value, cost);
          bulkButtons.appendChild(button);
        }
      });

      if (bulkButtons.children.length === 0) {
        const message =
          manualREITRemainingAmount > 0
            ? "No bulk options available - try individual REITs below ↓"
            : "No funds remaining for bulk purchases";
        bulkButtons.innerHTML = `<p style="color:#6c757d; margin:0;">${message}</p>`;
      }
    }

    function updateREITAffordability() {
      reits.forEach((reit, idx) => {
        const input = document.getElementById(`reit-units-${idx}`);
        const optionDiv = input?.parentElement;
        if (optionDiv) {
          optionDiv.classList.toggle(
            "affordable",
            manualREITRemainingAmount >= reit.price
          );
        }
      });
    }

    function renderManualREITUI() {
      document.getElementById("reitOptions").style.display = "block";
      document.getElementById("reitOptions").style.pointerEvents = "";
      const resultBox = document.getElementById("reit_result_box");
      if (resultBox) resultBox.style.display = "none";

      const container = document.getElementById("reitSelectors");
      if (!container) return;
      container.innerHTML = "";

      // Add search functionality
      createSearchBar("reitSelectors", "reit-option");

      reits.forEach((reit, idx) => {
        prevREITQty[idx] = 0;
        const div = document.createElement("div");
        div.className = "reit-option";

        const label = document.createElement("label");
        label.htmlFor = `reit-units-${idx}`;
        label.textContent = `${reit.name} (₹${reit.price.toLocaleString(
          "en-IN",
          { maximumFractionDigits: 2 }
        )}/unit)`;

        const input = document.createElement("input");
        input.type = "number";
        input.id = `reit-units-${idx}`;
        input.min = 0;
        input.step = 1;
        input.value = 0;

        input.addEventListener("wheel", (event) => {
          event.preventDefault();
          const delta = Math.sign(event.deltaY);
          const currentValue = parseInt(input.value) || 0;
          input.value = Math.max(0, currentValue - delta);
          handleManualREITInput(idx, input);
        });

        input.addEventListener("focus", () => {
          prevREITQty[idx] = parseInt(input.value) || 0;
        });
        input.addEventListener("input", () =>
          handleManualREITInput(idx, input)
        );

        div.append(label, input);
        container.appendChild(div);
      });

      // Bulk buttons
      let bulkButtons = document.getElementById("reitBulkButtons");
      if (!bulkButtons) {
        bulkButtons = document.createElement("div");
        bulkButtons.id = "reitBulkButtons";
        bulkButtons.className = "bulk-buttons";
        container.appendChild(bulkButtons);
      } else {
        container.appendChild(bulkButtons);
      }

      // Remaining allocation display
      let remainingDiv = document.getElementById("reitRemainingCash");
      if (!remainingDiv) {
        remainingDiv = document.createElement("div");
        remainingDiv.id = "reitRemainingCash";
        remainingDiv.style.margin = "10px 0";
        container.appendChild(remainingDiv);
      } else {
        container.appendChild(remainingDiv);
      }

      // Done button
      let doneBtn = document.getElementById("reitDoneBtn");
      if (!doneBtn) {
        doneBtn = document.createElement("button");
        doneBtn.id = "reitDoneBtn";
        doneBtn.textContent = "Done";
        doneBtn.style.marginTop = "10px";
        container.appendChild(doneBtn);
      } else {
        container.appendChild(doneBtn);
      }

      doneBtn.onclick = handleREITManualDone;

      updateManualREITRemaining();
      updateREITButtonStates();
      updateREITAffordability();
    }

    function handleManualREITInput(idx, inputEl) {
      if (reitResultLocked) return;
      let newQty = parseInt(inputEl.value) || 0;
      const oldQty = prevREITQty[idx];

      if (newQty < 0) {
        newQty = 0;
        inputEl.value = 0;
      }

      const reitPrice = reits[idx].price;
      const deltaCost = (newQty - oldQty) * reitPrice;
      const potentialRemaining = manualREITRemainingAmount - deltaCost;

      if (potentialRemaining >= 0) {
        manualREITRemainingAmount = potentialRemaining;
        prevREITQty[idx] = newQty;
      } else {
        inputEl.value = oldQty;
        showREITModal("Insufficient funds for this quantity.");
        return;
      }

      updateManualREITRemaining();
      updateREITButtonStates();
      updateREITAffordability();
    }

    function addMultipleOfEachREIT(multiplier, cost) {
      if (reitResultLocked) return;
      if (cost > manualREITRemainingAmount) {
        showREITModal(
          `Need ₹${cost.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })} but only ₹${manualREITRemainingAmount.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })} remaining`
        );
        return;
      }

      reits.forEach((_, idx) => {
        const inp = document.getElementById(`reit-units-${idx}`);
        const cur = parseInt(inp.value) || 0;
        inp.value = cur + multiplier;
        prevREITQty[idx] = cur + multiplier;
      });

      manualREITRemainingAmount -= cost;
      updateManualREITRemaining();
      updateREITButtonStates();
      updateREITAffordability();
    }

    function updateManualREITRemaining() {
      const el = document.getElementById("reitRemainingCash");
      if (!el) return;
      const totalInvested = reits.reduce((total, reit, idx) => {
        const qty =
          parseInt(document.querySelector(`#reit-units-${idx}`).value) || 0;
        return total + qty * reit.price;
      }, 0);
      manualREITRemainingAmount = REIT_ALLOCATION_AMOUNT - totalInvested;
      manualREITRemainingAmount = Math.max(0, manualREITRemainingAmount);
      const formattedAmount = manualREITRemainingAmount.toLocaleString(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }
      );
      el.textContent = `Remaining: ${formattedAmount}`;
      el.classList.toggle("negative", manualREITRemainingAmount === 0);
      updateREITButtonStates();
      updateREITAffordability();
    }

    function showREITResultBox(
      title,
      portfolioData,
      totalInvestment,
      remainingBalance
    ) {
      document.getElementById("reitOptions").style.display = "none";
      const resultBox = document.getElementById("reit_result_box");
      if (resultBox) resultBox.style.display = "block";

      document.getElementById("reitPortfolioTitle").textContent = title;

      const grid = document.getElementById("reitPortfolioGrid");
      grid.innerHTML = portfolioData
        .map(
          (reit) => `
          <div class="portfolio-item">
              <div class="stock-info">
                  <div class="stock-name">${reit.name}</div>
                  <div class="stock-price">${
                    reit.quantity
                  } unit(s) = ₹${reit.total.toLocaleString("en-IN")}</div>
              </div>
          </div>
      `
        )
        .join("");

      document.getElementById("reitPortfolioTotals").innerHTML = `
          Total Investment: ₹${totalInvestment.toLocaleString("en-IN")}<br>
          Remaining Balance: ₹${remainingBalance.toLocaleString("en-IN")}
      `;

      setTimeout(() => {
        const editBtn = document.getElementById("editREITQuantitiesBtn");
        const okBtn = document.getElementById("confirmManualREITAllocationBtn");
        if (editBtn) {
          editBtn.onclick = function () {
            if (reitResultLocked) return;
            document.getElementById("reitOptions").style.display = "block";
            document.getElementById("reitOptions").style.pointerEvents = "";
            document.getElementById("reit_result_box").style.display = "none";
          };
        }
        if (okBtn) {
          okBtn.onclick = function () {
            reitResultLocked = true;
            editBtn.disabled = true;
            okBtn.disabled = true;
            showREITModal(
              "Your manual REIT allocation has been finalized. No further changes can be made."
            );
          };
        }
      }, 0);
    }

    function handleREITManualDone() {
      if (reitResultLocked) return;
      selectedREITs = [];
      let totalInvestment = 0;

      reits.forEach((reit, idx) => {
        const qty =
          parseInt(document.querySelector(`#reit-units-${idx}`).value) || 0;
        if (qty > 0) {
          const reitTotal = qty * reit.price;
          totalInvestment += reitTotal;
          selectedREITs.push({
            name: reit.name,
            price: reit.price,
            quantity: qty,
            total: reitTotal,
          });
        }
      });

      const remainingBalance = REIT_ALLOCATION_AMOUNT - totalInvestment;

      // Disable inputs
      document.querySelectorAll(".reit-option input").forEach((input) => {
        input.disabled = true;
      });

      showREITResultBox(
        "📋 Selected REITs",
        selectedREITs,
        totalInvestment,
        remainingBalance
      );
    }

    // Initial Render
    renderManualREITUI();
  } else {
    reitsallocationamount = 0;
    reitsRemainingAmount = reitsallocationamount + goldETFsRemainingAmount;

    // console.log(`gold etf Remaining Amount else block: ${goldEtfRemainingAmount}`);
    // console.log(`reitsallocationamount Amount else block: ${reitsallocationamount}`);
    // console.log(`REIT Remaining Amount else block: ${reitsRemainingAmount}`);
    // Do NOT show REIT summary, just pass gold ETFs remaining
  }

  // --- SGB Block ---
  if (sgballocationamount > 0) {
    let SGB_ALLOCATION_AMOUNT = sgballocationamount + reitsRemainingAmount;
    let sgbPricePerGram = 8596;
    let MAX_GRAMS_ALLOWED = 4000;

    let gramsPurchased = Math.floor(SGB_ALLOCATION_AMOUNT / sgbPricePerGram);
    if (gramsPurchased > MAX_GRAMS_ALLOWED) {
      gramsPurchased = MAX_GRAMS_ALLOWED;
    }

    let totalCost = gramsPurchased * sgbPricePerGram;
    sgbRemainingAmount = SGB_ALLOCATION_AMOUNT - totalCost;

    purchaseSummaries += `
      <h4>SGB</h4>
      <p>Grams: ${gramsPurchased}, Total Cost: ₹${totalCost.toFixed(2)}</p>
      <p><strong>SGB Remaining: ₹${sgbRemainingAmount.toFixed(2)}</strong></p>
      <hr>
    `;
  } else {
    sgbRemainingAmount = reitsRemainingAmount;
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
        let compounded =
          PPF_ALLOCATION_AMOUNT * Math.pow(1 + ppfInterestRate, yearsRemaining);
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
      let summary = `<p>Total Investment: ₹${investment.toFixed(
        2
      )}, Estimated Maturity Amount: ₹${maturity.toFixed(2)}</p>`;
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
        let compounded =
          NSC_ALLOCATION_AMOUNT * Math.pow(1 + nscInterestRate, yearsRemaining);
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
      let summary = `<p>Total Investment: ₹${investment.toFixed(
        2
      )}, Estimated Maturity Amount: ₹${maturity.toFixed(2)}</p>`;
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
    let CRYPTO_ALLOCATION_AMOUNT = cryptoallocationamount + nscRemainingAmount;

    // Use imported cryptoData for risk-based selection
    let selectedCryptoList = [];
    let cryptoResultLocked = false;
    let cryptoInvestAmounts = [];

    function showCryptoModal(msg) {
      document.getElementById("modalMessage").textContent = msg;
      document.getElementById("modalOverlay").style.display = "flex";
      document.getElementById("modalOkBtn").onclick = function () {
        document.getElementById("modalOverlay").style.display = "none";
      };
    }

    function selectCryptoList() {
      if (risk_level === "low") selectedCryptoList = cryptoData.low.slice();
      else if (risk_level === "medium")
        selectedCryptoList = cryptoData.medium.slice();
      else selectedCryptoList = cryptoData.high.slice();
      cryptoInvestAmounts = selectedCryptoList.map(() => 0);
    }

    function renderManualCryptoUI() {
      document.getElementById("cryptoOptions").style.display = "block";
      document.getElementById("cryptoOptions").style.pointerEvents = "";
      const resultBox = document.getElementById("crypto_result_box");
      if (resultBox) resultBox.style.display = "none";

      const container = document.getElementById("cryptoSelectors");
      if (!container) return;
      container.innerHTML = "";

      // Show crypto options and input for amount to invest in each
      selectedCryptoList.forEach((crypto, idx) => {
        const div = document.createElement("div");
        div.className = "crypto-option";
        div.innerHTML = `
                <label>${crypto.name} (₹${crypto.price.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}/unit)</label>
                <input type="number" min="0" step="1" id="crypto-amount-${idx}" value="0" style="margin-left:10px;width:120px;">
                <span id="crypto-units-${idx}" style="margin-left:10px;color:#888;"></span>
            `;
        container.appendChild(div);

        // Input event
        div.querySelector("input").addEventListener("input", () => {
          cryptoInvestAmounts[idx] =
            parseFloat(div.querySelector("input").value) || 0;
          updateCryptoUnitsAndRemaining();
        });
      });

      // Remaining allocation display
      const remainingDiv = document.createElement("div");
      remainingDiv.id = "cryptoManualRemaining";
      remainingDiv.style.margin = "10px 0";
      container.appendChild(remainingDiv);

      // Done button
      let doneBtn = document.getElementById("cryptoManualDoneBtn");
      if (!doneBtn) {
        doneBtn = document.createElement("button");
        doneBtn.id = "cryptoManualDoneBtn";
        doneBtn.textContent = "Done";
        doneBtn.style.marginTop = "10px";
        container.appendChild(doneBtn);
      } else {
        container.appendChild(doneBtn);
      }

      doneBtn.onclick = handleCryptoManualDone;

      updateCryptoUnitsAndRemaining();
    }

    function updateCryptoUnitsAndRemaining() {
      let totalInvest = cryptoInvestAmounts.reduce((a, b) => a + b, 0);
      let remaining = CRYPTO_ALLOCATION_AMOUNT - totalInvest;

      // Prevent negative remaining and reset last input if needed
      if (remaining < 0) {
        // Find the last changed input and reset it
        for (let idx = cryptoInvestAmounts.length - 1; idx >= 0; idx--) {
          const input = document.getElementById(`crypto-amount-${idx}`);
          if (input && parseFloat(input.value) > 0) {
            // Reduce input value by the overflow amount
            const overflow = Math.abs(remaining);
            const maxAllowed = cryptoInvestAmounts[idx] - overflow;
            input.value = Math.max(0, maxAllowed);
            cryptoInvestAmounts[idx] = parseFloat(input.value) || 0;
            showCryptoModal("Insufficient balance for this investment.");
            // Recalculate totals after correction
            totalInvest = cryptoInvestAmounts.reduce((a, b) => a + b, 0);
            remaining = CRYPTO_ALLOCATION_AMOUNT - totalInvest;
            break;
          }
        }
      }

      // Update units display
      selectedCryptoList.forEach((crypto, idx) => {
        const units =
          crypto.price > 0 ? cryptoInvestAmounts[idx] / crypto.price : 0;
        document.getElementById(`crypto-units-${idx}`).textContent =
          cryptoInvestAmounts[idx] > 0 ? `= ${units.toFixed(6)} unit(s)` : "";
      });

      // Update remaining display
      const remDiv = document.getElementById("cryptoManualRemaining");
      if (remDiv) {
        remDiv.textContent = `Remaining: ₹${remaining.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}`;
        remDiv.style.color = remaining < 0 ? "red" : "";
      }
    }

    function handleCryptoManualDone() {
      if (cryptoResultLocked) return;
      let totalInvest = cryptoInvestAmounts.reduce((a, b) => a + b, 0);
      if (totalInvest > CRYPTO_ALLOCATION_AMOUNT) {
        showCryptoModal("Total investment exceeds your allocation.");
        return;
      }
      let portfolio = [];
      selectedCryptoList.forEach((crypto, idx) => {
        if (cryptoInvestAmounts[idx] > 0) {
          portfolio.push({
            name: crypto.name,
            price: crypto.price,
            invested: cryptoInvestAmounts[idx],
            units: cryptoInvestAmounts[idx] / crypto.price,
          });
        }
      });
      const remainingBalance = CRYPTO_ALLOCATION_AMOUNT - totalInvest;
      showCryptoResultBox(
        "📋 Selected Cryptos",
        portfolio,
        totalInvest,
        remainingBalance
      );
    }

    function showCryptoResultBox(
      title,
      portfolioData,
      totalInvestment,
      remainingBalance
    ) {
      document.getElementById("cryptoOptions").style.display = "none";
      const resultBox = document.getElementById("crypto_result_box");
      if (resultBox) resultBox.style.display = "block";

      document.getElementById("cryptoPortfolioTitle").textContent = title;

      const grid = document.getElementById("cryptoPortfolioGrid");
      grid.innerHTML = portfolioData
        .map(
          (crypto) => `
            <div class="portfolio-item">
                <div class="stock-info">
                    <div class="stock-name">${crypto.name}</div>
                    <div class="stock-price">${crypto.units.toFixed(
                      6
                    )} unit(s) = ₹${crypto.invested.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}</div>
                </div>
            </div>
        `
        )
        .join("");

      document.getElementById("cryptoPortfolioTotals").innerHTML = `
            Total Investment: ₹${totalInvestment.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}<br>
            Remaining Balance: ₹${remainingBalance.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
        `;

      setTimeout(() => {
        const editBtn = document.getElementById("editCryptoQuantitiesBtn");
        const okBtn = document.getElementById(
          "confirmManualCryptoAllocationBtn"
        );
        if (editBtn) {
          editBtn.onclick = function () {
            if (cryptoResultLocked) return;
            document.getElementById("cryptoOptions").style.display = "block";
            document.getElementById("cryptoOptions").style.pointerEvents = "";
            document.getElementById("crypto_result_box").style.display = "none";
          };
        }
        if (okBtn) {
          okBtn.onclick = function () {
            cryptoResultLocked = true;
            editBtn.disabled = true;
            okBtn.disabled = true;
            showCryptoModal(
              "Your manual crypto allocation has been finalized. No further changes can be made."
            );
          };
        }
      }, 0);
    }

    // Initial render
    selectCryptoList();
    renderManualCryptoUI();
  } else {
    cryptoallocationamount = 0;
    cryptoRemainingAmount = cryptoallocationamount + nscRemainingAmount;
  }

  let fdTotalAllocation = FDAllocationAmount + cryptoRemainingAmount;

  if (FDAllocationAmount > 0) {
    let FD_ALLOCATION_AMOUNT = FDAllocationAmount + cryptoRemainingAmount;

    // Use fdData from fd.js, grouped by risk level
    let banks = [];
    if (risk_level === "low") banks = fdData.low.slice();
    else if (risk_level === "medium") banks = fdData.medium.slice();
    else banks = fdData.high.slice();

    // Use getFDInterestRate from fd.js
    let duration =
      typeof investment_duration === "number" && investment_duration > 0
        ? investment_duration
        : 1;

    let manualFDRemainingAmount = FD_ALLOCATION_AMOUNT;
    let fdResultLocked = false;
    let fdInvestments = banks.map(() => 0);

    function showFDModal(msg) {
      document.getElementById("modalMessage").textContent = msg;
      document.getElementById("modalOverlay").style.display = "flex";
      document.getElementById("modalOkBtn").onclick = function () {
        document.getElementById("modalOverlay").style.display = "none";
      };
    }

    function renderManualFDUI() {
      const fdDiv = document.getElementById("fdOptions");
      if (!fdDiv) return;
      fdDiv.style.display = "block";
      fdDiv.innerHTML = "";

      // Small finance bank warning
      const note = document.createElement("div");
      note.style.color = "#b8860b";
      note.style.marginBottom = "10px";
      note.innerHTML = `<b>Note:</b> For Small Finance Banks, we recommend investing no more than ₹4,50,000 per bank.`;
      fdDiv.appendChild(note);

      // Show selected duration
      const durationDiv = document.createElement("div");
      durationDiv.style.marginBottom = "10px";
      durationDiv.innerHTML = `<b>FD Duration:</b> ${duration} year${
        duration > 1 ? "s" : ""
      }`;
      fdDiv.appendChild(durationDiv);

      banks.forEach((bank, idx) => {
        const container = document.createElement("div");
        container.className = "fd-bank-option";
        container.style.marginBottom = "12px";

        // Bank name
        const label = document.createElement("label");
        label.textContent = bank.name;
        label.style.fontWeight = "bold";
        container.appendChild(label);

        // Amount input
        const amtInput = document.createElement("input");
        amtInput.type = "number";
        amtInput.min = 0;
        amtInput.max = FD_ALLOCATION_AMOUNT;
        amtInput.value = fdInvestments[idx];
        amtInput.placeholder = "Amount (₹)";
        amtInput.style.marginLeft = "10px";
        amtInput.style.width = "120px";

        // Interest rate display
        const rate =
          typeof getFDInterestRate === "function"
            ? getFDInterestRate(bank, duration)
            : bank.rates[duration] || bank.rates[3];
        const rateSpan = document.createElement("span");
        rateSpan.style.marginLeft = "10px";
        rateSpan.style.color = "#007bff";
        rateSpan.textContent = `Interest: ${rate}%`;

        // Maturity display
        const maturitySpan = document.createElement("span");
        maturitySpan.style.marginLeft = "10px";
        maturitySpan.style.color = "#28a745";

        // Warning for SFB
        const warnSpan = document.createElement("span");
        warnSpan.style.marginLeft = "10px";
        warnSpan.style.color = "red";

        function updateFDRow() {
          if (fdResultLocked) return;
          let amount = parseFloat(amtInput.value) || 0;
          if (amount < 0) {
            amount = 0;
            amtInput.value = 0;
          }
          const oldAmount = fdInvestments[idx];
          const delta = amount - oldAmount;
          const potentialRemaining = manualFDRemainingAmount - delta;
          if (potentialRemaining >= 0) {
            manualFDRemainingAmount = potentialRemaining;
            fdInvestments[idx] = amount;
          } else {
            amtInput.value = oldAmount;
            showFDModal("Insufficient FD allocation balance.");
            return;
          }
          // Compound annually
          const maturity = amount * Math.pow(1 + rate / 100, duration);
          maturitySpan.textContent =
            amount > 0
              ? `Maturity: ₹${maturity.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}`
              : "";
          // SFB warning
          if (bank.isSmallFinance && amount > 450000) {
            warnSpan.textContent = "⚠️ Above ₹4.5 lakh!";
          } else {
            warnSpan.textContent = "";
          }
          updateManualFDRemaining();
        }
        amtInput.addEventListener("input", updateFDRow);
        container.appendChild(amtInput);
        container.appendChild(rateSpan);
        container.appendChild(maturitySpan);
        container.appendChild(warnSpan);
        fdDiv.appendChild(container);
        // Initial update
        updateFDRow();
      });

      // Remaining allocation display
      const remDiv = document.createElement("div");
      remDiv.id = "fdManualRemaining";
      remDiv.style.margin = "10px 0";
      fdDiv.appendChild(remDiv);

      // Done button
      let doneBtn = document.getElementById("fdManualDoneBtn");
      if (!doneBtn) {
        doneBtn = document.createElement("button");
        doneBtn.id = "fdManualDoneBtn";
        doneBtn.textContent = "Done";
        doneBtn.style.marginTop = "10px";
        fdDiv.appendChild(doneBtn);

    
      } else {
        fdDiv.appendChild(doneBtn);
      }
      doneBtn.onclick = handleFDManualDone;
      updateManualFDRemaining();
    }

    function updateManualFDRemaining() {
      const el = document.getElementById("fdManualRemaining");
      if (!el) return; // Prevent error if element is not found
      const totalInvested = fdInvestments.reduce(
        (sum, amt) => sum + (amt || 0),
        0
      );
      manualFDRemainingAmount = FD_ALLOCATION_AMOUNT - totalInvested;
      manualFDRemainingAmount = Math.max(0, manualFDRemainingAmount);
      const formattedAmount = manualFDRemainingAmount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      el.textContent = `Remaining: ${formattedAmount}`;
      el.classList.toggle("negative", manualFDRemainingAmount === 0);
    }

    function handleFDManualDone() {
      if (fdResultLocked) return;
      let totalInvest = fdInvestments.reduce((sum, amt) => sum + (amt || 0), 0);
      if (totalInvest > FD_ALLOCATION_AMOUNT) {
        showFDModal("Total FD investment exceeds your allocation.");
        return;
      }
      // Prepare portfolio data
      let portfolio = [];
      banks.forEach((bank, idx) => {
        const amount = fdInvestments[idx];
        if (amount > 0) {
          const rate =
            typeof getFDInterestRate === "function"
              ? getFDInterestRate(bank, duration)
              : bank.rates[duration] || bank.rates[3];
          const maturity = amount * Math.pow(1 + rate / 100, duration);
          portfolio.push({
            name: bank.name,
            amount: amount,
            interestRate: rate,
            durationYears: duration,
            estimatedMaturity: amount * Math.pow(1 + (rate / 100), duration)
          });
        }
      });
      const remainingBalance = FD_ALLOCATION_AMOUNT - totalInvest;
      // Disable inputs
      document.querySelectorAll(".fd-bank-option input").forEach((input) => {
        input.disabled = true;
      });
      fdResultLocked = true;
      
      // Create and store FD portfolio in localStorage
      const fdPortfolio = {
        deposits: portfolio.map(fd => ({
          bank: fd.name,
          amount: fd.amount,
          interestRate: fd.rate,
          durationYears: fd.duration,
          estimatedMaturity: fd.maturity
        })),
        totalInvestment: totalInvest,
        remainingBalance: remainingBalance,
        date: new Date().toISOString()
        
      };
      localStorage.setItem('fdPortfolio', JSON.stringify(fdPortfolio));

      // Log FD portfolio to console
      console.log("\nFixed Deposit Portfolio:");
      portfolio.forEach(fd => {
        console.log(
          `Bank: ${fd.name}\n` +
          `Amount: ₹${fd.amount !== undefined ? fd.amount.toLocaleString("en-IN") : "N/A"}\n` +
          `Interest Rate: ${fd.rate}%\n` +
          `Duration: ${fd.duration} year(s)\n` +
          `Estimated Maturity: ₹${fd.maturity !== undefined ? fd.maturity.toLocaleString("en-IN") : "N/A"}\n`
        );
      });
      console.log(`Total FD Investment: ₹${totalInvest.toLocaleString("en-IN")}`);
      console.log(`Remaining Balance: ₹${remainingBalance.toLocaleString("en-IN")}`);
      allocationsdone = allocationsdone + 1;
      console.log(`Allocations Done: ${allocationsdone}`);
      updateManualProgress();
      

      // Hide the FD options
      document.getElementById("fdOptions").style.display = "none";
      // Show the result box
      renderFDPortfolio(
        "📋 Selected Fixed Deposits",
        portfolio,
        totalInvest,
        remainingBalance
      );
      setTimeout(() => {
        const editBtn = document.getElementById("editFDQuantitiesBtn");
        const okBtn = document.getElementById("confirmManualFDAllocationBtn");
        if (editBtn) {
          editBtn.onclick = function () {
            if (fdResultLocked) return;
            document.getElementById("fdOptions").style.display = "block";
            document.getElementById("fdOptions").style.pointerEvents = "";
            document.getElementById("fd_result_box").style.display = "none";
          };
        }
        if (okBtn) {
          okBtn.onclick = function () {
            fdResultLocked = true;
            editBtn.disabled = true;
            okBtn.disabled = true;
            showFDModal(
              "Your manual FD allocation has been finalized. No further changes can be made."
            );
          };
        }
      }, 0);
    }

    function enableManualFDEditing() {
      document.querySelectorAll(".fd-bank-option input").forEach((input) => {
        input.disabled = false;
      });
      document.getElementById("fd_result_box").style.display = "none";
      document.getElementById("fdOptions").style.display = "block";
    }

    function finalizeManualFDSelection() {
      if (fdResultLocked) return;

      const selectedFDs = [];
      let totalInvestment = 0;

      banks.forEach((bank, idx) => {
        const amount = fdInvestments[idx];
        if (amount > 0) {
          const rate = getFDInterestRate(bank, duration);
          selectedFDs.push({
            bank: bank.name,
            amount: amount,
            interestRate: rate,
            durationYears: duration,
            estimatedMaturity: amount * Math.pow(1 + (rate / 100), duration)
          });
          totalInvestment += amount;
        }
      });

      // Store FD portfolio in localStorage
      const fdPortfolio = {
        deposits: selectedFDs,
        totalInvestment: totalInvestment,
        remainingBalance: FD_ALLOCATION_AMOUNT - totalInvestment,
        date: new Date().toISOString()
      };
      localStorage.setItem('fdPortfolio', JSON.stringify(fdPortfolio));

      fdResultLocked = true;
      document.getElementById("editFDBtn").disabled = true;
      document.getElementById("confirmFDBtn").disabled = true;
      
      updateFDButtonStates();
      showFDModal("FD allocation has been finalized. No further changes can be made.");

      // Log FD portfolio to console
      console.log("\nFixed Deposit Portfolio:");
      selectedFDs.forEach(fd => {
        console.log(
          `Bank: ${fd.bank}\n` +
          `Amount: ₹${fd.amount !== undefined ? fd.amount.toLocaleString("en-IN") : "N/A"}\n` +
          `Interest Rate: ${fd.interestRate}%\n` +
          `Duration: ${fd.durationYears} year(s)\n` +
          `Estimated Maturity: ₹${fd.estimatedMaturity !== undefined ? fd.estimatedMaturity.toLocaleString("en-IN") : "N/A"}\n`
        );
      });
      console.log(`Total FD Investment: ₹${totalInvestment.toLocaleString("en-IN")}`);
      console.log(`Remaining Balance: ₹${(FD_ALLOCATION_AMOUNT - totalInvestment).toLocaleString("en-IN")}`);
    }

    function renderFDPortfolio(
      title,
      portfolioData,
      totalInvestment,
      remainingBalance
    ) {
      const resultBox = document.getElementById("fd_result_box");
      if (resultBox) resultBox.style.display = "block";
      document.getElementById("fdPortfolioTitle").textContent = title;
      const grid = document.getElementById("fdPortfolioGrid");
      grid.innerHTML = portfolioData
        .map(
          (fd) => `
      <div class="portfolio-item">
        <div class="stock-info">
          <div class="stock-name">${fd.name}</div>
          <div class="stock-price">₹${fd.amount !== undefined ? fd.amount.toLocaleString("en-IN") : "N/A"} for ${fd.duration} year(s) @ ${
            fd.rate
          }%<br>Maturity: ₹${fd.maturity !== undefined ? fd.maturity.toLocaleString("en-IN") : "N/A"}</div>
        </div>
      </div>
    `
        )
        .join("");
      document.getElementById("fdPortfolioTotals").innerHTML = `
      Total Investment: ₹${totalInvestment.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}<br>
      Remaining Balance: ₹${remainingBalance.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}
    `;
      document.getElementById("editFDQuantitiesBtn").onclick =
        enableManualFDEditing;
      document.getElementById("confirmManualFDAllocationBtn").onclick =
        finalizeManualFDSelection;
    }

    // Initial render
    renderManualFDUI();
  }

  if (purchaseSummaries) {
    displayAllSummaries();
  }
  // --- End: Stock Auto-Selection Logic ---
}
// Ensure the button is created and appended to the DOM if not present
let manualDoneBtn = document.getElementById("manualSelectionDoneBtn");
if (!manualDoneBtn) {
  manualDoneBtn = document.createElement("button");
  manualDoneBtn.id = "manualSelectionDoneBtn";
  manualDoneBtn.textContent = "Done";
  // Try to append to a logical container, fallback to body
  const container = document.getElementById("manualOptions") || document.body;
  container.appendChild(manualDoneBtn);
}
Object.assign(manualDoneBtn.style, {
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "10px 24px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "background 0.2s"
});
manualDoneBtn.onmouseenter = () => manualDoneBtn.style.background = "#0056b3";
manualDoneBtn.onmouseleave = () => manualDoneBtn.style.background = "#007bff";
manualDoneBtn.addEventListener("click", () => {
  const total = window.allocatedOptionsCount !== undefined ? window.allocatedOptionsCount : 0;
  if (allocationsdone < total || total === 0) {
    showPopup("Please complete all selections before finishing.", 3000);
    return;
  }
  showPopup("Manual selection completed!", 3000);

  try {
    // Extract portfolios from localStorage
    const stockPortfolio = JSON.parse(localStorage.getItem('stockPortfolio') || '{}');
    const mutualFundsPortfolio = JSON.parse(localStorage.getItem('mutualFundsPortfolio') || '{}');
    const etfPortfolio = JSON.parse(localStorage.getItem('etfPortfolio') || '{}');
    const fdPortfolio = JSON.parse(localStorage.getItem('fdPortfolio') || '{}');
    // Add more as needed (reitsPortfolio, cryptoPortfolio, etc.)

    // Get global investment info
    const investment_amount = window.investment_amount || 0;
    const investment_duration = window.investment_duration || 1;
    const risk_level = window.risk_level || 'Low';
    const hasEmergencyFund = typeof window.hasEmergencyFund !== 'undefined' ? window.hasEmergencyFund : false;
    const investmentType = window.investmentType || 'One-Time';
    const expectedInflation = window.inflationRate || 6;
            const username = localStorage.getItem('currentUser') || 'unknown';
    const planId = `${username}_${Date.now()}`;

    // Allocation amounts (from global vars)
    const allocationsArr = [
      { type: 'stocks', amount: window.StocksAllocationAmount || 0, remaining: stockPortfolio.remainingBalance || 0 },
      { type: 'mutualFunds', amount: window.MutualFundsAllocationAmount || 0, remaining: mutualFundsPortfolio.remainingBalance || 0 },
      { type: 'goldETFs', amount: window.GoldETFsAllocationAmount || 0, remaining: etfPortfolio.remainingBalance || 0 },
      { type: 'fd', amount: window.FDAllocationAmount || 0, remaining: fdPortfolio.remainingBalance || 0 },
      // Add more as needed (reits, sgb, ppf, nsc, crypto, etc.)
    ];

    // Purchases extraction (match auto selection format)
    const purchases = {
      stocks: (stockPortfolio.stocks || []).map(s => ({
        name: s.name,
        units: s.quantity,
        price: s.price,
        total: s.total
      })),
      mutualFunds: (mutualFundsPortfolio.funds || []).map(mf => ({
        name: mf.name,
        units: mf.quantity,
        nav: mf.nav,
        total: mf.total
      })),
      goldETFs: (etfPortfolio.etfs || []).map(etf => ({
        name: etf.name,
        units: etf.units,
        price: etf.price,
        total: etf.total
      })),
      fd: (fdPortfolio.deposits || []).map(fd => ({
        name: fd.bank,
        amount: fd.amount,
        rate: fd.interestRate,
        duration: fd.durationYears,
        maturity: fd.estimatedMaturity
      })),
      // Add more as needed (reits, sgb, ppf, nsc, crypto, etc.)
    };

    const allocationData = {
      username,
      planId,
      timestamp: new Date().toISOString(),
      investmentType,
      totalInvestment: investment_amount,
      duration: investment_duration,
      riskLevel: risk_level,
      hasEmergencyFund,
      expectedInflation,
      allocations: allocationsArr,
      purchases
    };

    localStorage.setItem('SelectionData', JSON.stringify(allocationData));
    showPopup("Investment plan saved successfully!", 3000);
  } catch (err) {
    showPopup("Error saving manual selection data!", 3000);
    console.error('Manual selection save error:', err);
  }
});

// Progress bar functionality
function setCircleProgress(percent) {
  const manualProgressBar = document.getElementById('manualProgressBar');
  const len = 213.628; // Circle circumference (2 * Math.PI * 34)
  manualProgressBar.style.strokeDashoffset = (len - len * percent / 100);
}

function updateManualProgress() {
  const manualProgressText = document.getElementById('manualProgressText');
  const total = window.allocatedOptionsCount !== undefined ? window.allocatedOptionsCount : 0;
  manualProgressText.textContent = `${allocationsdone}/${total}`;
  const percent = total > 0 ? (allocationsdone / total) * 100 : 0;
  setCircleProgress(percent);
}

// Initialize progress bar when the page loads
document.addEventListener('DOMContentLoaded', () => {
  updateManualProgress();
});
// Export the manualSelection function to the global scope
if (typeof window !== 'undefined') {
    window.manualSelection = manualSelection;
}
export { manualSelection };


