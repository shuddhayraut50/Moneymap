// Load portfolioData from portfolioData.js
// Make sure to include <script src="portfolioData.js"></script> before this script in your HTML

// Helper function to fetch and load portfolio data
async function loadPortfolioData() {
    try {
        const response = await fetch('../financial-portfolio/portfolioData.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Portfolio data loaded:', data);
        return data;
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return null;
    }
}

// Display helper function with missing data highlight
function displayValue(id, value, prefix = '', suffix = '') {
    const element = document.getElementById(id);
    if (!element) return;
    
    if (value !== undefined && value !== null) {
        element.textContent = `${prefix}${value}${suffix}`;
        element.style.backgroundColor = '';
    } else {
        element.textContent = 'Not Available';
        element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)'; // Light red background
    }
}

// Function to create chart configuration
function createChartConfig(chartTitle, data, labels) {
    const isMobile = window.innerWidth < 768;
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: chartTitle,
                data: data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: isMobile ? 1.5 : 2,
                pointRadius: isMobile ? 3 : 4,
                pointBackgroundColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: isMobile ? 8 : 12,
                        padding: isMobile ? 10 : 20,
                        font: {
                            size: isMobile ? 11 : 14
                        }
                    }
                },
                tooltip: {
                    padding: isMobile ? 8 : 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: !isMobile,
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        font: {
                            size: isMobile ? 10 : 12
                        },
                        maxRotation: isMobile ? 45 : 0
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        font: {
                            size: isMobile ? 10 : 12
                        },
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    };
}

// Helper function to generate date labels
function generateDateLabels(count) {
    const labels = [];
    const today = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
    }
    
    return labels;
}

// Helper function to simulate historical data for an investment
function simulateInvestmentHistory(investment, months = 12) {
    // Simulate monthly values from purchase to current
    const values = [];
    const { purchasePrice, currentPrice, quantity } = investment;
    const startValue = purchasePrice * quantity;
    const endValue = currentPrice * quantity;
    for (let i = 0; i < months; i++) {
        // Linear growth with some random noise
        const t = i / (months - 1);
        const base = startValue + (endValue - startValue) * t;
        const noise = (Math.random() - 0.5) * 0.03 * startValue; // up to ±3% noise
        values.push(Math.max(0, base + noise));
    }
    return values;
}

// Helper to aggregate portfolio history (sum of all investments per month)
function aggregatePortfolioHistory(portfolioItems, months = 12) {
    const allHistories = portfolioItems.map(item => {
        if (item.historicalData && Array.isArray(item.historicalData)) {
            return item.historicalData;
        } else {
            return simulateInvestmentHistory(item, months);
        }
    });
    // Sum values for each month
    const result = [];
    for (let i = 0; i < months; i++) {
        let sum = 0;
        for (const arr of allHistories) {
            sum += arr[i] || 0;
        }
        result.push(sum);
    }
    return result;
}

// Function to handle window resize
function handleResize() {
    if (window.overviewChart) {
        window.overviewChart.destroy();
        const overviewCtx = document.getElementById('overviewChart').getContext('2d');
        window.overviewChart = new Chart(overviewCtx, createChartConfig(
            'Investment Value',
            portfolioData.performance.values,
            portfolioData.performance.labels
        ));
    }
    if (window.performanceChart) {
        window.performanceChart.destroy();
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        window.performanceChart = new Chart(performanceCtx, createChartConfig(
            'Performance Trend',
            portfolioData.performance.values,
            portfolioData.performance.labels
        ));
    }
}

// Wait for the page to load
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const assetId = urlParams.get('id') || 0; // Default to first item if no ID provided
    
    // Load portfolio data
    const portfolioData = await loadPortfolioData();
    if (!portfolioData || !portfolioData.portfolioItems) {
        console.error('Failed to load portfolio data');
        return;
    }

    // --- PERFORMANCE OVERVIEW LOGIC ---
    // Generate historical data for each investment if missing
    const months = 12;
    const labels = generateDateLabels(months);
    portfolioData.portfolioItems.forEach(item => {
        if (!item.historicalData || !Array.isArray(item.historicalData)) {
            item.historicalData = simulateInvestmentHistory(item, months);
        }
    });
    // Aggregate portfolio-level performance
    const perfValues = aggregatePortfolioHistory(portfolioData.portfolioItems, months);
    portfolioData.performance = {
        values: perfValues,
        labels: labels
    };
    // Calculate summary returns
    const v = perfValues;
    const summary = {
        '1m': ((v[v.length-1] - v[v.length-2]) / v[v.length-2] * 100).toFixed(2) + '%',
        '1y': ((v[v.length-1] - v[0]) / v[0] * 100).toFixed(2) + '%',
        'since': ((v[v.length-1] - v[0]) / v[0] * 100).toFixed(2) + '%'
    };
    portfolioData.performance.summary = summary;
    // --- END PERFORMANCE OVERVIEW LOGIC ---

    // Get the specific investment
    const investment = portfolioData.portfolioItems[assetId];
    if (!investment) {
        console.error('Investment not found');
        return;
    }

    // Calculate derived values
    const totalCost = investment.purchasePrice * investment.quantity;
    const currentValue = investment.currentPrice * investment.quantity;
    const profit = currentValue - totalCost;
    const profitPercent = ((profit / totalCost) * 100).toFixed(2);

    // Display all values
    displayValue('assetName', investment.name);
    displayValue('assetType', investment.type);
    displayValue('currentValue', currentValue, '₹');
    displayValue('change', profit, profit >= 0 ? '+₹' : '₹', ` (${profitPercent}%)`);
    displayValue('quantity', investment.quantity);
    displayValue('purchasePrice', investment.purchasePrice, '₹');
    displayValue('purchaseDate', investment.purchaseDate);
    displayValue('totalCost', totalCost, '₹');
    displayValue('currentPrice', investment.currentPrice, '₹');
    displayValue('priceChange', investment.currentPrice - investment.purchasePrice, '₹');
    displayValue('totalValue', currentValue, '₹');
    displayValue('profitLoss', profit, profit >= 0 ? '+₹' : '₹');
    displayValue('interestRate', investment.interestRate, '', '%');
    displayValue('maturityDate', investment.maturityDate);    // Create overview chart showing purchase vs current value
    const overviewCtx = document.getElementById('overviewChart').getContext('2d');
    const overviewLabels = ['Purchase Value', 'Current Value'];
    const overviewValues = [totalCost, currentValue];
    window.overviewChart = new Chart(overviewCtx, createChartConfig(
        'Investment Value',
        overviewValues,
        overviewLabels
    ));

    // Create performance chart with historical data if available
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    const hasHistoricalData = investment.historicalData && Array.isArray(investment.historicalData);
    const performanceLabels = hasHistoricalData ? 
        generateDateLabels(investment.historicalData.length) : 
        ['Initial', 'Current'];
    const performanceValues = hasHistoricalData ? 
        investment.historicalData : 
        [totalCost, currentValue];
    
    window.performanceChart = new Chart(performanceCtx, createChartConfig(
        'Performance Trend',
        performanceValues,
        performanceLabels
    ));

    // Add resize handler with debounce
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });

    // --- PERIOD SELECTION LOGIC FOR PERFORMANCE CHART ---
    function updatePerformanceChartForPeriod(portfolioData, period) {
        const monthsMap = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 };
        const months = monthsMap[period] || 12;
        const v = portfolioData.performance.values;
        const l = portfolioData.performance.labels;
        const startIdx = v.length - months;
        const values = v.slice(startIdx);
        const labels = l.slice(startIdx);
        // Update chart
        if (window.performanceChart) {
            window.performanceChart.data.labels = labels;
            window.performanceChart.data.datasets[0].data = values;
            window.performanceChart.update();
        }
        // Update summary
        const summary = {
            '1m': ((v[v.length-1] - v[v.length-2]) / v[v.length-2] * 100).toFixed(2) + '%',
            '1y': ((v[v.length-1] - v[0]) / v[0] * 100).toFixed(2) + '%',
            'since': ((v[v.length-1] - v[0]) / v[0] * 100).toFixed(2) + '%'
        };
        document.getElementById('performance-summary-1m').textContent = summary['1m'];
        document.getElementById('performance-summary-1y').textContent = summary['1y'];
        document.getElementById('performance-summary-since').textContent = summary['since'];
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Add event listeners for period buttons
        const periodButtons = document.querySelectorAll('.chart-btn[data-period]');
        periodButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                periodButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                const period = e.target.getAttribute('data-period');
                updatePerformanceChartForPeriod(window.portfolioData, period);
            });
        });
    });
    // --- END PERIOD SELECTION LOGIC ---
});

// Add back button click handler
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.querySelector('.back-link');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            // Navigate back to Financial Portfolio
            window.location.href = '../financial-portfolio/FinancialPortfolio.html';
        });
    }
});
