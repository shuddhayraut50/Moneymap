// Improved Wallet Logic
// Always use a local server for fetch to work (e.g., VS Code Live Server)

// API base URL for wallet CRUD
const WALLET_API_URL = 'http://localhost:3001/api/wallet';

let walletData = {
    totalWalletBalance: 0,
    investmentCurrentValue: 0,
    walletBalance: 0,
    totalInvestment: 0,
    profitEarned: 0,
    pendingReturns: 0
};
let transactions = [];
let currentTransactionFilter = 'All Types';

// DOM Elements
const totalWalletBalanceElement = document.querySelector('.total-wallet-balance-card .card-amount');
const investmentCurrentValueElement = document.querySelector('.investment-current-value-card .card-amount');
const walletBalanceElement = document.querySelector('.wallet-balance-card .card-amount');
const totalInvestmentElement = document.querySelector('.total-investment-card .card-amount');
const profitEarnedElement = document.querySelector('.profit-earned-card .card-amount');
const profitEarnedCard = document.querySelector('.profit-earned-card'); // Card element for styling
const pendingReturnsElement = document.querySelector('.pending-returns-card .card-amount');
const modalWithdrawableBalance = document.querySelector('#withdrawFundsModal .available-balance-info .amount');
const transactionsList = document.querySelector('.transactions-list');
const addFundsModal = document.getElementById('addFundsModal');
const withdrawFundsModal = document.getElementById('withdrawFundsModal');
const addFundsBtn = document.querySelector('.action-buttons-container .add-funds');
const withdrawFundsBtn = document.querySelector('.action-buttons-container .withdraw-funds');
const closeButtons = document.querySelectorAll('.modal .close');
const cancelButtons = document.querySelectorAll('.modal .cancel-btn');
const addAmountInput = document.getElementById('addAmount');
const withdrawAmountInput = document.getElementById('withdrawAmount');
const submitAddBtn = document.querySelector('.submit-add');
const submitWithdrawBtn = document.querySelector('.submit-withdraw');
const quickAmountBtns = document.querySelectorAll('.quick-amount-btn');
const overviewTab = document.querySelector('.tab-btn:nth-child(1)');
const transactionsTab = document.querySelector('.tab-btn:nth-child(2)');
const walletDashboard = document.querySelector('.wallet-dashboard');
const actionButtonsContainer = document.querySelector('.action-buttons-container');
const paymentMethodsCard = document.querySelector('.payment-methods-card');
const importantNotesCard = document.querySelector('.important-notes-card');
const transactionHistorySection = document.querySelector('.transaction-history');
const searchInput = document.querySelector('.search-input');
const clearSearchBtn = document.querySelector('.clear-search-btn');
const filterDropdown = document.querySelector('.filter-dropdown');
const filterBtn = filterDropdown.querySelector('.filter-btn');
const filterBtnText = filterBtn.querySelector('span');
const dropdownContent = filterDropdown.querySelector('.dropdown-content');
const filterLinks = dropdownContent.querySelectorAll('a');
const exportBtn = document.querySelector('.export-btn');

// Toast Notification (simple implementation)
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || (() => {
        const div = document.createElement('div');
        div.id = 'toastContainer';
        document.body.appendChild(div);
        return div;
    })();

    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return `${amount.toLocaleString('en-IN')}`;
}

// Update balance display
function updateBalances() {
    // Calculate final total wallet balance
    walletData.totalWalletBalance = walletData.walletBalance + walletData.investmentCurrentValue;

    // New logic for Profit Earned as per user request
    walletData.profitEarned = walletData.investmentCurrentValue - walletData.totalInvestment;

    totalWalletBalanceElement.textContent = `₹${formatCurrency(walletData.totalWalletBalance)}`;
    investmentCurrentValueElement.textContent = `₹${formatCurrency(walletData.investmentCurrentValue)}`;
    walletBalanceElement.textContent = `₹${formatCurrency(walletData.walletBalance)}`;
    totalInvestmentElement.textContent = `₹${formatCurrency(walletData.totalInvestment)}`;
    
    // Handle Profit/Loss display and color
    const profit = walletData.profitEarned;
    if (profit >= 0) {
        profitEarnedElement.textContent = `₹${formatCurrency(profit)}`;
        profitEarnedCard.classList.add('profit-positive');
        profitEarnedCard.classList.remove('profit-negative');
    } else {
        // Format negative currency correctly
        profitEarnedElement.textContent = `- ₹${formatCurrency(Math.abs(profit))}`;
        profitEarnedCard.classList.add('profit-negative');
        profitEarnedCard.classList.remove('profit-positive');
    }

    pendingReturnsElement.textContent = `₹${formatCurrency(walletData.pendingReturns)}`;
    modalWithdrawableBalance.textContent = `₹${formatCurrency(walletData.walletBalance)}`;

    // Update submit button text with current input values
    updateModalSubmitButton(addAmountInput, submitAddBtn, 'Add');
    updateModalSubmitButton(withdrawAmountInput, submitWithdrawBtn, 'Withdraw');
}

// Update modal submit button text
function updateModalSubmitButton(inputElement, buttonElement, type) {
    const amount = parseFloat(inputElement.value) || 0;
    buttonElement.textContent = `${type} ₹${formatCurrency(amount)}`;

    // Enable/disable button based on amount being greater than 0
    if (amount > 0) {
        buttonElement.removeAttribute('disabled');
        buttonElement.style.opacity = 1; 
    } else {
        buttonElement.setAttribute('disabled', true);
        buttonElement.style.opacity = 0.6; 
    }
}

// Update transaction list display (now a table)
function updateTransactionList() {
    let filteredTransactions = transactions;

    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.description.toLowerCase().includes(searchTerm) ||
            transaction.type.toLowerCase().includes(searchTerm) ||
            String(transaction.amount).includes(searchTerm)
        );
    }

    // Apply type filter
    if (currentTransactionFilter !== 'All Types') {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.type === currentTransactionFilter
        );
    }

    // Show/hide clear search button
    if (searchTerm) {
        clearSearchBtn.style.display = 'flex';
    } else {
        clearSearchBtn.style.display = 'none';
    }

    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No transactions found matching your criteria.</p>';
        return;
    }

    const tableHeader = `
        <div class="transaction-table-header">
            <div class="header-item">Date</div>
            <div class="header-item">Type</div>
            <div class="header-item">Description</div>
            <div class="header-item amount-column">Amount (₹)</div>
            <div class="header-item">Status</div>
        </div>
    `;

    const tableRows = filteredTransactions.map(transaction => {
        const date = new Date(transaction.date).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: '2-digit' });
        const amountDisplay = transaction.type === 'Withdrawal' ? `-${formatCurrency(transaction.amount)}` : formatCurrency(transaction.amount);
        const amountClass = transaction.type.toLowerCase(); // 'deposit' or 'withdrawal'
        const statusClass = transaction.status.toLowerCase(); // 'done' or 'pending'

        return `
            <div class="transaction-row">
                <div class="row-item transaction-date">${date}</div>
                <div class="row-item transaction-type">${transaction.type}</div>
                <div class="row-item transaction-description">${transaction.description}</div>
                <div class="row-item transaction-amount ${amountClass}">${amountDisplay}</div>
                <div class="row-item transaction-status status ${statusClass}">${transaction.status}</div>
            </div>
        `;
    }).join('');

    transactionsList.innerHTML = `<div class="transaction-table">${tableHeader}${tableRows}</div>`;
}

// Show modal
function showModal(modal) {
    modal.style.display = 'flex'; // Use flex to center content
    modal.scrollTop = 0; // Scroll to top on opening

    // Reset quick select buttons when modal opens
    modal.querySelectorAll('.quick-amount-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Reset payment method selection on modal open for add funds
    if (modal.id === 'addFundsModal') {
        document.getElementById('upiPayment').checked = true; // Default to UPI
        document.querySelectorAll('.method-option').forEach(option => {
            option.classList.remove('selected-method');
        });
        document.querySelector('.method-option input[checked]').closest('.method-option').classList.add('selected-method');
    }
}

// Hide modal
function hideModal(modal) {
    modal.style.display = 'none';
}

// --- New function to fetch portfolio data ---
async function fetchPortfolioData() {
    const username = localStorage.getItem('currentUser') || 'guest';
    if (username === 'guest') {
        walletData.totalInvestment = 0;
        walletData.investmentCurrentValue = 0;
        return;
    }

    try {
        const res = await fetch(`http://localhost:3001/api/portfolio-items?username=${username}`);
        if (!res.ok) {
            if (res.status === 404) { // User exists but has no investments yet
                walletData.totalInvestment = 0;
                walletData.investmentCurrentValue = 0;
                return;
            }
            throw new Error(`Server responded with status: ${res.status}`);
        }
        
        const data = await res.json();
        const portfolioItems = data.portfolioItems || [];

        let totalInvestment = 0;
        let investmentCurrentValue = 0;

        portfolioItems.forEach(item => {
            // For FDs, purchasePrice is the principal amount
            const principal = item.type === "Fixed Deposits" ? item.purchasePrice : (item.purchasePrice * item.quantity);
            totalInvestment += principal;
            investmentCurrentValue += item.currentValue;
        });

        walletData.totalInvestment = totalInvestment;
        walletData.investmentCurrentValue = investmentCurrentValue;

    } catch (e) {
        console.error('Could not load portfolio data:', e);
        showToast('Could not load investment data.', 'error');
        walletData.totalInvestment = 0;
        walletData.investmentCurrentValue = 0;
    }
}

// --- CRUD API Functions ---
async function fetchWalletFromAPI() {
    try {
        const res = await fetch(WALLET_API_URL);
        if (!res.ok) throw new Error('Failed to fetch wallet data');
        const data = await res.json();

        let currentWalletBalance = 0, pending = 0;
        
        transactions = data
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .filter(entry => entry.username === (localStorage.getItem('currentUser') || 'guest'))
            .map(entry => {
                // Calculate balances based on transaction type
                if (entry.type === 'Deposit' || entry.type === 'Return') {
                    currentWalletBalance += entry.amount;
                } else if (entry.type === 'Withdrawal') {
                    currentWalletBalance -= entry.amount;
                }
                
                if (entry.type === 'Pending') pending += entry.amount;
                
                return {
                    id: entry._id,
                    amount: entry.amount,
                    type: entry.type,
                    description: entry.description,
                    date: entry.date,
                    status: entry.status,
                    username: entry.username
                };
            });

        walletData.walletBalance = currentWalletBalance;
        walletData.pendingReturns = pending;

    } catch (e) {
        showToast('Could not load wallet data from server.', 'error');
        walletData.walletBalance = 0;
        walletData.profitEarned = 0;
        walletData.pendingReturns = 0;
        transactions = [];
    }
    // No need to call updateBalances/updateTransactionList here, will be done in loadWalletData
}

async function addWalletEntryAPI(entry) {
    const res = await fetch(WALLET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error('Failed to add wallet entry');
    return await res.json();
}

async function updateWalletEntryAPI(id, update) {
    const res = await fetch(`${WALLET_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update wallet entry');
    return await res.json();
}

async function deleteWalletEntryAPI(id) {
    const res = await fetch(`${WALLET_API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete wallet entry');
    return await res.json();
}

// --- Replace addTransaction to include username ---
async function addTransaction(amount, type, description, status) {
    // Get current user from localStorage
    const username = localStorage.getItem('currentUser') || 'guest';
    // Calculate new balance for the wallet
    let newBalance = walletData.totalWalletBalance;
    if (type === 'Deposit') {
        newBalance += amount;
    } else if (type === 'Withdrawal') {
        newBalance -= amount;
    }
    // Compose entry for backend
    const entry = {
        name: 'Main Wallet',
        balance: newBalance,
        amount,
        type,
        description,
        date: new Date().toISOString(),
        status,
        username // Attach user info
    };
    await addWalletEntryAPI(entry);
    await fetchWalletFromAPI();
}

// Load wallet data from JSON file or localStorage
async function loadWalletData() {
    await fetchWalletFromAPI(); // Fetches transactions and calculates wallet balances
    await fetchPortfolioData(); // Fetches investments and calculates their value
    updateBalances(); // Updates all UI elements with fresh data
    updateTransactionList(); // Update the transaction list view
}

// Tab switching functionality
function showOverview() {
    overviewTab.classList.add('active');
    transactionsTab.classList.remove('active');

    walletDashboard.style.display = 'grid';
    actionButtonsContainer.style.display = 'flex';
    paymentMethodsCard.style.display = 'block';
    importantNotesCard.style.display = 'block';
    transactionHistorySection.style.display = 'none';
}

function showTransactions() {
    transactionsTab.classList.add('active');
    overviewTab.classList.remove('active');

    walletDashboard.style.display = 'none';
    actionButtonsContainer.style.display = 'none';
    paymentMethodsCard.style.display = 'none';
    importantNotesCard.style.display = 'none';
    transactionHistorySection.style.display = 'block';
    updateTransactionList(); // Ensure transaction list is updated when tab is shown
}

// Always fetch and display the latest wallet data from the backend
async function refreshWalletUI() {
    await fetchWalletFromAPI(); // Fetch all transactions and recalculate balances
    updateBalances();           // Update the UI with the new values
    updateTransactionList();    // Update the transaction list view
}

// Handle add funds
async function handleAddFunds() {
    const amount = parseFloat(addAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount greater than 0.', 'error');
        return;
    }
    if (amount < 100) {
        showToast('Minimum add amount is ₹100.', 'error');
        return;
    }
    // Get selected payment method
    let paymentMethod = 'UPI Transfer';
    const upiRadio = document.getElementById('upiPayment');
    const debitRadio = document.getElementById('debitCredit');
    if (debitRadio && debitRadio.checked) {
        paymentMethod = 'Debit/Credit Card';
    } else if (upiRadio && upiRadio.checked) {
        paymentMethod = 'UPI Transfer';
    }
    try {
        await addTransaction(amount, 'Deposit', paymentMethod, 'Done');
        showToast(`Successfully added ₹${formatCurrency(amount)} to your wallet!`, 'success');
        hideModal(addFundsModal);
        addAmountInput.value = '';
        await refreshWalletUI(); // Always refresh after transaction
    } catch (error) {
        showToast('Error adding funds', 'error');
    }
}

// Handle withdraw funds
async function handleWithdrawFunds() {
    const amount = parseFloat(withdrawAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount greater than 0.', 'error');
        return;
    }
    if (amount < 100) {
        showToast('Minimum withdrawal amount is ₹100.', 'error');
        return;
    }
    if (amount > walletData.walletBalance) {
        showToast('Insufficient wallet balance.', 'error');
        return;
    }
    try {
        await addTransaction(amount, 'Withdrawal', 'Sent to bank account', 'Done');
        showToast(`Withdrawal of ₹${formatCurrency(amount)} initiated!`, 'success');
        hideModal(withdrawFundsModal);
        withdrawAmountInput.value = '';
        await refreshWalletUI(); // Always refresh after transaction
    } catch (error) {
        showToast('Error withdrawing funds', 'error');
    }
}

// Payment method selection highlight for Add Funds modal
function setupPaymentMethodSelection() {
    const methodOptions = document.querySelectorAll('.payment-method-selection .method-option');
    methodOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        // Make the whole card clickable
        option.addEventListener('click', () => {
            if (radio) radio.checked = true;
            methodOptions.forEach(opt => opt.classList.remove('selected-method'));
            option.classList.add('selected-method');
        });
        // Also update on radio change (for keyboard accessibility)
        if (radio) {
            radio.addEventListener('change', () => {
                methodOptions.forEach(opt => opt.classList.remove('selected-method'));
                option.classList.add('selected-method');
            });
        }
    });
}

// Event Listeners
addFundsBtn.addEventListener('click', () => showModal(addFundsModal));
withdrawFundsBtn.addEventListener('click', () => showModal(withdrawFundsModal));

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        hideModal(addFundsModal);
        hideModal(withdrawFundsModal);
    });
});

cancelButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        hideModal(button.closest('.modal'));
    });
});

submitAddBtn.addEventListener('click', handleAddFunds);
submitWithdrawBtn.addEventListener('click', handleWithdrawFunds);

quickAmountBtns.forEach(button => {
    button.addEventListener('click', (event) => {
        const amount = button.getAttribute('data-amount');
        const input = button.closest('.modal').querySelector('input[type="number"]');
        input.value = amount;
        updateModalSubmitButton(input, input === addAmountInput ? submitAddBtn : submitWithdrawBtn, input === addAmountInput ? 'Add' : 'Withdraw');
        button.closest('.quick-select').querySelectorAll('.quick-amount-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    });
});

addAmountInput.addEventListener('input', () => {
    updateModalSubmitButton(addAmountInput, submitAddBtn, 'Add');
    addFundsModal.querySelectorAll('.quick-amount-btn').forEach(btn => btn.classList.remove('selected'));
});

withdrawAmountInput.addEventListener('input', () => {
    updateModalSubmitButton(withdrawAmountInput, submitWithdrawBtn, 'Withdraw');
    withdrawFundsModal.querySelectorAll('.quick-amount-btn').forEach(btn => btn.classList.remove('selected'));
});

searchInput.addEventListener('input', updateTransactionList);
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    updateTransactionList();
});

filterBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    filterDropdown.classList.toggle('active');
});

filterLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        filterLinks.forEach(l => l.classList.remove('selected-filter'));
        link.classList.add('selected-filter');
        currentTransactionFilter = link.getAttribute('data-filter');
        filterBtnText.textContent = currentTransactionFilter;
        filterDropdown.classList.remove('active');
        updateTransactionList();
    });
});

exportBtn.addEventListener('click', () => {
    showToast('Export functionality (dummy): This would typically generate a CSV/PDF of transactions.', 'info');
});

// Close dropdown when clicking outside
window.addEventListener('click', (event) => {
    if (!filterDropdown.contains(event.target)) filterDropdown.classList.remove('active');
    if (event.target === addFundsModal) hideModal(addFundsModal);
    if (event.target === withdrawFundsModal) hideModal(withdrawFundsModal);
});

overviewTab.addEventListener('click', showOverview);
transactionsTab.addEventListener('click', showTransactions);

document.addEventListener('DOMContentLoaded', async () => {
    // Show logged-in user in wallet header
    const userInfo = document.getElementById('current-user-info');
    const currentUser = localStorage.getItem('currentUser');
    if (userInfo && currentUser) {
        userInfo.textContent = `Logged in as: ${currentUser}`;
    }
    await loadWalletData();
    updateBalances();
    filterBtnText.textContent = currentTransactionFilter;
    if (document.querySelector(`.dropdown-content a[data-filter="${currentTransactionFilter}"]`)) {
        document.querySelector(`.dropdown-content a[data-filter="${currentTransactionFilter}"]`).classList.add('selected-filter');
    }
    showOverview();
    setupPaymentMethodSelection();
});
