document.addEventListener("DOMContentLoaded", function() {
    // Sample data for the dashboard
    const investments = [
        { asset: "SBI Gold ETF", invested: "₹50,000", currentPrice: "₹55,000", roi: "+10%", unrealizedGains: "₹5,000" },
        { asset: "Tata Steel", invested: "₹30,000", currentPrice: "₹32,000", roi: "+6.67%", unrealizedGains: "₹2,000" },
        { asset: "HDFC Mutual Fund", invested: "₹20,000", currentPrice: "₹19,500", roi: "-2.5%", unrealizedGains: "-₹500" }
    ];

    const transactions = [
        { date: "2025-06-10", type: "Buy", amount: "₹10,000", asset: "Tata Steel", status: "Completed" },
        { date: "2025-06-09", type: "Sell", amount: "₹5,000", asset: "SBI Gold ETF", status: "Completed" },
        { date: "2025-06-08", type: "Buy", amount: "₹15,000", asset: "HDFC Mutual Fund", status: "Pending" }
    ];

    const recommendations = [
        { action: "Buy more SBI Gold ETF", reason: "Strong performance in the last month." },
        { action: "Sell Tata Steel", reason: "Riskier due to market fluctuations." },
        { action: "Diversify into Mutual Funds", reason: "Diversification reduces overall risk." }
    ];

    // Populate investments table
    const investmentsTable = document.getElementById('investments-table').getElementsByTagName('tbody')[0];
    investments.forEach(investment => {
        const row = investmentsTable.insertRow();
        row.innerHTML = `
            <td>${investment.asset}</td>
            <td>${investment.invested}</td>
            <td>${investment.currentPrice}</td>
            <td>${investment.roi}</td>
            <td>${investment.unrealizedGains}</td>
        `;
    });

    // Populate recent transactions
    const transactionsDiv = document.getElementById('transactions');
    transactions.forEach(transaction => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>Date:</strong> ${transaction.date} | <strong>Type:</strong> ${transaction.type} | <strong>Amount:</strong> ${transaction.amount} | <strong>Status:</strong> ${transaction.status}</p>
        `;
        transactionsDiv.appendChild(div);
    });

    // Populate recommendations
    const recommendationsDiv = document.getElementById('recommendations');
    recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>Action:</strong> ${rec.action} | <strong>Reason:</strong> ${rec.reason}</p>
        `;
        recommendationsDiv.appendChild(div);
    });

    // Portfolio Allocation Chart (using Chart.js)
    const ctx = document.getElementById('portfolio-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Stocks', 'Mutual Funds', 'Gold', 'FD', 'Crypto'],
            datasets: [{
                data: [45, 25, 10, 15, 5],
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#dc3545']
            }]
        },
        options: {
            responsive: true
        }
    });
});
