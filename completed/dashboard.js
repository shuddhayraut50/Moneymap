// Modern Dashboard with Database Integration
class Dashboard {
    constructor() {
        this.portfolioData = null;
        this.charts = {};
        this.currentUser = null;
        this.selectedPerformancePeriod = '1m'; // Track selected period
        this.init();
    }

    async init() {
        try {
            // Check authentication
            this.currentUser = auth.getCurrentUsername();
            if (!this.currentUser || this.currentUser === 'unknown') {
                this.showNoDataState();
                return;
            }

            // Load portfolio data from database
            await this.loadPortfolioData();

            // Initialize dashboard
            this.initializeDashboard();

        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.showError('Failed to load portfolio data');
        }
    }

    async loadPortfolioData() {
        try {
            const response = await fetch(`http://localhost:3001/api/portfolio-items-combined?username=${encodeURIComponent(this.currentUser)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.portfolioData = data.portfolioItems || [];

            if (this.portfolioData.length === 0) {
                this.showNoDataState();
                return;
            }

        } catch (error) {
            console.error('Error loading portfolio data:', error);
            throw error;
        }
    }

    initializeDashboard() {
        if (!this.portfolioData || this.portfolioData.length === 0) {
            this.showNoDataState();
            return;
        }

        // Calculate portfolio metrics
        const metrics = this.calculatePortfolioMetrics();

        // Update overview cards
        this.updateOverviewCards(metrics);

        // Initialize charts
        this.initializeCharts();

        // Update asset breakdown
        this.updateAssetBreakdown();

        // Update recent transactions
        this.updateRecentTransactions();

        // Add event listeners
        this.addEventListeners();
    }

    calculatePortfolioMetrics() {
        let totalInvestment = 0;
        let currentValue = 0;
        let totalProfit = 0;
        let totalReturn = 0;

        // Calculate totals from portfolio items
        this.portfolioData.forEach(item => {
            // Calculate investment amount: purchase price × quantity
            const investment = (item.purchasePrice || 0) * (item.quantity || 0);
            const current = item.currentValue || 0;
            
            totalInvestment += investment;
            currentValue += current;
        });

        totalProfit = currentValue - totalInvestment;
        totalReturn = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

        return {
            totalInvestment,
            currentValue,
            totalProfit,
            totalReturn
        };
    }

    updateOverviewCards(metrics) {
        // Animate number counting
        this.animateNumber('totalInvestment', metrics.totalInvestment, '₹');
        this.animateNumber('currentValue', metrics.currentValue, '₹');
        this.animateNumber('totalProfit', metrics.totalProfit, '₹');
        this.animateNumber('totalReturn', metrics.totalReturn, '', '%');

        // Update change indicators
        this.updateChangeIndicators(metrics);
    }

    animateNumber(elementId, targetValue, prefix = '', suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (targetValue - startValue) * easeOutQuart;

            element.textContent = `${prefix}${currentValue.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateChangeIndicators(metrics) {
        // Update change indicators for each card
        const changes = document.querySelectorAll('.card-change');
        changes.forEach((change, index) => {
            let changeValue = 0;
            let changeClass = 'neutral';

            switch (index) {
                case 0: // Total Investment
                    changeValue = 0; // Investment amount doesn't change
                    break;
                case 1: // Current Value
                    // % change from investment to current value
                    changeValue = metrics.totalInvestment > 0 ? ((metrics.currentValue - metrics.totalInvestment) / metrics.totalInvestment) * 100 : 0;
                    changeClass = changeValue > 0 ? 'positive' : (changeValue < 0 ? 'negative' : 'neutral');
                    break;
                case 2: // Total Profit
                    // % profit relative to investment
                    changeValue = metrics.totalInvestment > 0 ? (metrics.totalProfit / metrics.totalInvestment) * 100 : 0;
                    changeClass = changeValue > 0 ? 'positive' : (changeValue < 0 ? 'negative' : 'neutral');
                    break;
                case 3: // Total Return
                    // Show total return %
                    changeValue = metrics.totalReturn;
                    changeClass = changeValue > 0 ? 'positive' : (changeValue < 0 ? 'negative' : 'neutral');
                    break;
            }

            change.textContent = `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`;
            change.className = `card-change ${changeClass}`;
        });
    }

    initializeCharts() {
        // Initialize allocation chart
        this.initializeAllocationChart();

        // Initialize performance chart
        this.initializePerformanceChart();
    }

    initializeAllocationChart() {
        const ctx = document.getElementById('allocationChart');
        if (!ctx) return;

        // Group portfolio items by type
        const allocationData = this.groupByAssetType();

        const chartData = {
            labels: Object.keys(allocationData),
            datasets: [{
                data: Object.values(allocationData).map(group => 
                    group.reduce((sum, item) => sum + (item.currentValue || 0), 0)
                ),
                backgroundColor: [
                    '#3B82F6', // Blue
                    '#8B5CF6', // Purple
                    '#10B981', // Green
                    '#F59E0B', // Yellow
                    '#EF4444', // Red
                    '#06B6D4'  // Cyan
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        // Determine chart type from active button
        let chartType = 'doughnut';
        const activeBtn = document.querySelector('.chart-btn[data-type].active');
        if (activeBtn && activeBtn.dataset.type === 'bar') {
            chartType = 'bar';
        }

        // Destroy previous chart if exists
        if (this.charts.allocation) {
            this.charts.allocation.destroy();
        }

        this.charts.allocation = new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: chartType === 'bar' ? 'top' : 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                },
                scales: chartType === 'bar' ? {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#6B7280' }
                    },
                    y: {
                        grid: { color: 'rgba(107, 114, 128, 0.1)' },
                        ticks: {
                            color: '#6B7280',
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                } : undefined
            }
        });
    }

    
    
    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        // Generate performance data for the selected period
        const performanceData = this.generatePerformanceData(this.selectedPerformancePeriod);

        const chartData = {
            labels: performanceData.labels,
            datasets: [{
                label: 'Portfolio Value',
                data: performanceData.values,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        };

        // Destroy previous chart if exists
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Value: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(107, 114, 128, 0.1)'
                        },
                        ticks: {
                            color: '#6B7280',
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    generatePerformanceData(period = '1m') {
        // Generate sample performance data for the selected period
        let labels = [];
        let values = [];
        const today = new Date();
        let points = 0;

        // Helper to format date as dd-MMM-yyyy
        function formatDateDDMMMYYYY(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = date.toLocaleString('en-IN', { month: 'short' });
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }

        switch (period) {
            case '1m':
                points = 30; // 30 days
                for (let i = points - 1; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    labels.push(formatDateDDMMMYYYY(date));
                }
                break;
            case '3m':
                points = 12; // 12 weeks
                for (let i = points - 1; i >= 0; i--) {
                    const date = new Date(today);
                    // Set to the Monday of the week (week starts on Monday in India)
                    date.setDate(today.getDate() - i * 7);
                    // Adjust to Monday
                    const dayOfWeek = date.getDay();
                    const diffToMonday = (dayOfWeek + 6) % 7; // 0=Sunday, 1=Monday, ...
                    date.setDate(date.getDate() - diffToMonday);
                    labels.push(formatDateDDMMMYYYY(date));
                }
                break;
            case '6m':
                points = 6; // 6 months
                for (let i = points - 1; i >= 0; i--) {
                    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    labels.push(formatDateDDMMMYYYY(date));
                }
                break;
            case '1y':
            default:
                points = 12; // 12 months
                for (let i = points - 1; i >= 0; i--) {
                    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    labels.push(formatDateDDMMMYYYY(date));
                }
                break;
        }

        // Generate realistic portfolio value progression
        const baseValue = 100000; // Starting value
        const growthRate = 0.02; // 2% growth per point
        const volatility = 0.05; // 5% volatility
        for (let i = 0; i < points; i++) {
            const randomFactor = 1 + (Math.random() - 0.5) * volatility;
            const value = baseValue * Math.pow(1 + growthRate, i) * randomFactor;
            values.push(Math.round(value));
        }

        return { labels, values };
    }

    // Mapping for asset type display names
    getAssetDisplayName(type) {
        const map = {
            'stocks': 'Stocks',
            'mutualfunds': 'Mutual Funds',
            'mutualfund': 'Mutual Funds',
            'fd': 'Fixed Deposits',
            'fixeddeposits': 'Fixed Deposits',
            'crypto': 'Crypto',
            'etfs': 'ETFs',
            'etf': 'ETFs',
            'goldetfs': 'Gold ETFs',
            'reits': 'REITs',
            'unknown': 'Other'
        };
        return map[type.toLowerCase().replace(/\s/g, '')] || type.charAt(0).toUpperCase() + type.slice(1);
    }

    getAssetIcon(type) {
        const icons = {
            'stocks': 'trending_up',
            'mutualfunds': 'account_balance',
            'mutualfund': 'account_balance',
            'goldetfs': 'monetization_on',
            'fd': 'savings',
            'fixeddeposits': 'savings',
            'crypto': 'currency_bitcoin',
            'etfs': 'pie_chart',
            'etf': 'pie_chart',
            'reits': 'apartment'
        };
        return icons[type.toLowerCase().replace(/\s/g, '')] || 'account_balance';
    }

    getAssetColor(type) {
        const colors = {
            'stocks': '#3B82F6',
            'mutualfunds': '#8B5CF6',
            'mutualfund': '#8B5CF6',
            'goldetfs': '#F59E0B',
            'fd': '#10B981',
            'fixeddeposits': '#10B981',
            'crypto': '#EF4444',
            'etfs': '#06B6D4',
            'etf': '#06B6D4',
            'reits': '#8B5A2B'
        };
        return colors[type.toLowerCase().replace(/\s/g, '')] || '#6B7280';
    }

    // Group by normalized asset type
    groupByAssetType() {
        const grouped = {};
        this.portfolioData.forEach(item => {
            let type = (item.type || 'Unknown').toLowerCase().replace(/\s/g, '');
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(item);
        });
        return grouped;
    }

    updateAssetBreakdown() {
        const container = document.getElementById('assetBreakdown');
        if (!container) return;

        const groupedData = this.groupByAssetType();
        let html = '';

        Object.entries(groupedData).forEach(([type, items]) => {
            // Calculate total investment as sum of purchasePrice * quantity
            const totalInvestment = items.reduce((sum, item) => sum + ((item.purchasePrice || 0) * (item.quantity || 0)), 0);
            const totalValue = items.reduce((sum, item) => sum + (item.currentValue || 0), 0);
            const profit = totalValue - totalInvestment;
            const profitPercentage = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

            const icon = this.getAssetIcon(type);
            const color = this.getAssetColor(type);
            const displayName = this.getAssetDisplayName(type);

            // Determine class and sign for percentage
            let changeClass = 'neutral';
            let sign = '';
            if (profitPercentage > 0) {
                changeClass = 'positive';
                sign = '+';
            } else if (profitPercentage < 0) {
                changeClass = 'negative';
                sign = '';
            }

            html += `
                <div class="asset-item animate__animated animate__fadeInUp">
                    <div class="asset-info">
                        <div class="asset-icon" style="background: ${color}">
                            <span class="material-icons">${icon}</span>
                        </div>
                        <div class="asset-details">
                            <h4>${displayName}</h4>
                            <p>${items.length} ${items.length === 1 ? 'asset' : 'assets'}</p>
                        </div>
                    </div>
                    <div class="asset-value">
                        <div class="amount">₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div class="change ${changeClass}">
                            ${sign}${profitPercentage.toFixed(2)}%
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    async fetchRecentTransactions() {
        const username = localStorage.getItem('currentUser') || 'guest';
        try {
            const res = await fetch(`http://localhost:3001/api/recent-transactions?username=${encodeURIComponent(username)}`);
            if (!res.ok) throw new Error('Failed to fetch recent transactions');
            const data = await res.json();
            // Normalize to expected format for dashboard
            return (data.transactions || []).map(tx => ({
                type: tx.type === 'Deposit' ? 'Buy' : (tx.type === 'Withdrawal' ? 'Sell' : tx.type),
                asset: tx.description || tx.name || 'N/A',
                amount: tx.amount,
                date: tx.date
            }));
        } catch (e) {
            console.error('Could not load recent transactions:', e);
            return [];
        }
    }

    async updateRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) return;

        // Fetch recent transactions from backend
        const recentTransactions = await this.fetchRecentTransactions();

        if (recentTransactions.length === 0) {
            container.innerHTML = '<p style="color: #6B7280; text-align: center;">No recent transactions</p>';
            return;
        }

        let html = '';
        recentTransactions.forEach(transaction => {
            html += `
                <div class="transaction-item animate__animated animate__fadeInUp">
                    <div class="transaction-info">
                        <h4>${transaction.type} ${transaction.asset}</h4>
                        <p>${this.formatDateDDMMMYYYY(transaction.date)}</p>
                    </div>
                    <div class="transaction-amount ${transaction.type.toLowerCase()}">
                        ${transaction.type === 'Buy' ? '+' : '-'}₹${transaction.amount.toLocaleString('en-IN')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    addEventListeners() {
        // Chart type toggle
        const chartButtons = document.querySelectorAll('.chart-btn[data-type]');
        chartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                chartButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChartType(e.target.dataset.type);
            });
        });

        // Performance period toggle
        const periodButtons = document.querySelectorAll('.chart-btn[data-period]');
        periodButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                periodButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.updatePerformancePeriod(e.target.dataset.period);
            });
        });
    }

    updateChartType(type) {
        if (this.charts.allocation) {
            this.charts.allocation.destroy();
        }
        
        const ctx = document.getElementById('allocationChart');
        if (ctx) {
            this.initializeAllocationChart();
        }
    }

    updatePerformancePeriod(period) {
        // Update selected period and refresh chart
        this.selectedPerformancePeriod = period;
        this.initializePerformanceChart();
    }

    showNoDataState() {
        const mainContainer = document.querySelector('.main-container');
        const noDataState = document.getElementById('no-data-state');
        
        if (mainContainer && noDataState) {
            mainContainer.style.display = 'none';
            noDataState.classList.remove('hidden');
        }
    }

    showError(message) {
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #EF4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Helper to format date as dd-MMM-yyyy (move to class for reuse)
    formatDateDDMMMYYYY(date) {
        if (typeof date === 'string') date = new Date(date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-IN', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
}

// Page Transition System
class PageTransition {
    constructor() {
        this.overlay = document.getElementById('page-transition');
        this.isTransitioning = false;
    }

    show() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.overlay.classList.add('active');
        
        // Add enhanced exit animation to current page
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.animation = 'fadeOutDown 1s ease-out forwards';
        }

        // Add exit animation to navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.animation = 'fadeOutDown 1s ease-out forwards';
        }
    }

    hide() {
        this.overlay.classList.remove('active');
        this.isTransitioning = false;
    }

    async navigateTo(url) {
        this.show();
        
        // Wait for the full 4-second animation cycle
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Navigate to new page
        window.location.href = url;
    }
}

// Global page transition instance
const pageTransition = new PageTransition();

// Navigation function with transition
function navigateWithTransition(url, event = null) {
    if (event) {
        event.preventDefault();
    }
    
    // Update transition content based on destination
    const transitionContent = document.querySelector('.transition-content h3');
    const subtitleContent = document.querySelector('.transition-content .subtitle');
    
    if (transitionContent && subtitleContent) {
        if (url.includes('home')) {
            transitionContent.textContent = 'Going to Home...';
            subtitleContent.textContent = 'Loading your personalized dashboard';
        } else if (url.includes('about')) {
            transitionContent.textContent = 'Loading About...';
            subtitleContent.textContent = 'Discover our story and mission';
        } else if (url.includes('learning')) {
            transitionContent.textContent = 'Loading Learning Center...';
            subtitleContent.textContent = 'Access educational resources';
        } else if (url.includes('contact')) {
            transitionContent.textContent = 'Loading Contact...';
            subtitleContent.textContent = 'Get in touch with our team';
        } else if (url.includes('investment')) {
            transitionContent.textContent = 'Loading Investment Portal...';
            subtitleContent.textContent = 'Start your investment journey';
        } else if (url.includes('login')) {
            transitionContent.textContent = 'Loading Login...';
            subtitleContent.textContent = 'Secure authentication portal';
        } else if (url.includes('dashboard')) {
            transitionContent.textContent = 'Loading Dashboard...';
            subtitleContent.textContent = 'Analyzing your portfolio data';
        } else {
            transitionContent.textContent = 'Loading...';
            subtitleContent.textContent = 'Preparing your experience';
        }
    }
    
    pageTransition.navigateTo(url);
}

// Handle logout
function handleLogout() {
    if (auth.logout()) {
        navigateWithTransition('../user/login.html');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    auth.checkAuth();
    
    // Update auth UI
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (auth.isAuthenticated) {
        if (userInfo) userInfo.classList.remove('hidden');
        if (usernameDisplay) usernameDisplay.textContent = auth.getCurrentUsername();
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        if (userInfo) userInfo.classList.add('hidden');
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }

    // Initialize dashboard
    new Dashboard();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOutDown {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
        }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* Smooth page transitions */
    body {
        transition: opacity 0.3s ease-out;
    }

    body.transitioning {
        opacity: 0;
    }
`;
document.head.appendChild(style);    