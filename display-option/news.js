document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tabs .tab');
    const tabContents = {
        'overview': document.getElementById('overview-tab'),
        'performance': document.getElementById('performance-tab'),
        'news': document.getElementById('news-tab')
        // Add more if you have more tabs
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            Object.values(tabContents).forEach(tc => tc.style.display = 'none');
            const tabName = tab.getAttribute('data-tab');
            if (tabContents[tabName]) {
                tabContents[tabName].style.display = '';
            }
            if (tabName === 'performance' && window.renderPerformanceTab) {
                window.renderPerformanceTab(portfolioData.performance);
            }
            if (tabName === 'news' && window.renderNewsTab) {
                window.renderNewsTab();
            }
        });
    });
    tabContents['overview'].style.display = '';
    tabContents['performance'].style.display = 'none';
    tabContents['news'].style.display = 'none';
});