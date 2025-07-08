// Initialize charts object if not exists
window.charts = window.charts || {};

// Function to initialize a chart
function initializeChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Performance',
                data: [],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
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
                            return '₹' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

window.renderPerformanceTab = function(performanceData) {
    // If chart exists, destroy it
    if (charts.performance) {
        charts.performance.destroy();
    }
    
    // Initialize performance chart
    charts.performance = initializeChart('performanceChart');

    // Update summary cards
    const summary = performanceData.summary || {
        '1m': `+${((performanceData.values[performanceData.values.length - 1] - performanceData.values[0]) / performanceData.values[0] * 100).toFixed(2)}%`,
        '1y': `+${((performanceData.values[performanceData.values.length - 1] - performanceData.values[0]) / performanceData.values[0] * 100).toFixed(2)}%`,
        'since': `+${((performanceData.values[performanceData.values.length - 1] - performanceData.values[0]) / performanceData.values[0] * 100).toFixed(2)}%`
    };
    
    document.getElementById('performance-summary-1m').textContent = summary['1m'];
    document.getElementById('performance-summary-1y').textContent = summary['1y'];
    document.getElementById('performance-summary-since').textContent = summary['since'];
};

document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tabs .tab');
    const tabContents = {
        'overview': document.getElementById('overview-tab'),
        'performance': document.getElementById('performance-tab')
        // Add more if you have more tabs
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all tab contents
            Object.values(tabContents).forEach(tc => tc.style.display = 'none');

            // Show the selected tab content
            const tabName = tab.getAttribute('data-tab');
            if (tabContents[tabName]) {
                tabContents[tabName].style.display = '';
            }

            // Render chart only when Performance tab is shown
            if (tabName === 'performance') {
                if (window.renderPerformanceTab) {
                    window.renderPerformanceTab(portfolioData.performance);
                }
            }
        });
    });

    // Show Overview tab by default
    tabContents['overview'].style.display = '';
    tabContents['performance'].style.display = 'none';
});