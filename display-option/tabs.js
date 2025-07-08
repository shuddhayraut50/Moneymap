// Keep track of chart instances
let charts = {
    overview: null,
    performance: null
};

// Function to destroy chart if it exists
function destroyChart(chartKey) {
    if (charts[chartKey]) {
        charts[chartKey].destroy();
        charts[chartKey] = null;
    }
}

// Function to handle tab switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }

    // Add active class to the clicked tab
    const activeTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Handle chart rendering based on tab
    if (tabName === 'performance' && window.renderPerformanceTab) {
        // Generate 6 months of sample data
        const dates = [];
        const values = [];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            dates.push(date.toLocaleString('default', { month: 'short' }));
            // Generate some sample data with realistic fluctuations
            const baseValue = 100000;
            const randomFluctuation = (Math.random() - 0.3) * 10000; // -3000 to +7000
            values.push(baseValue + (i * 2000) + randomFluctuation);
        }

        const performanceData = {
            labels: dates,
            values: values,
            summary: {
                '1m': `${((values[5] - values[4]) / values[4] * 100).toFixed(2)}%`,
                '1y': `${((values[5] - values[0]) / values[0] * 100).toFixed(2)}%`,
                'since': `${((values[5] - values[0]) / values[0] * 100).toFixed(2)}%`
            }
        };
        window.renderPerformanceTab(performanceData);
    }
}

// Set up tab click listeners
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Destroy all charts before switching tabs
            Object.keys(charts).forEach(key => destroyChart(key));
            
            switchTab(tabName);
        });
    });

    // Show overview tab by default
    switchTab('overview');
});
