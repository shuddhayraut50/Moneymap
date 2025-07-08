// App.js
import React from 'react';
import './App.css';

const StatCard = ({ title, value, percentage = '' }) => (
  <div className="stat-card">
    <h2>{title}</h2>
    <p>{value}</p>
    {percentage && <span className="percentage">{percentage}</span>}
  </div>
);

const InfoCard = ({ title, value }) => (
  <div className="info-card">
    <p><strong>{title}</strong></p>
    <p>{value}</p>
  </div>
);

const App = () => {
  return (
    <div className="dashboard">
      <header className="header">
        <h1>Investment Portfolio</h1>
        <p>Track your investments and returns in real-time</p>
      </header>

      <div className="main-stats">
        <StatCard title="Total Portfolio Value" value="$125,750.5" />
        <StatCard title="Total Return" value="$25,750.5" />
        <StatCard title="Return Percentage" value="+25.75%" percentage="+25.75%" />
      </div>

      <div className="additional-info">
        <InfoCard title="Total Invested" value="$100,000" />
        <InfoCard title="Number of Holdings" value="6" />
        <InfoCard title="Best Performer" value="NVDA (+34.71%)" />
        <InfoCard title="Portfolio Diversity" value="6 Assets" />
      </div>
    </div>
  );
};

export default App;
