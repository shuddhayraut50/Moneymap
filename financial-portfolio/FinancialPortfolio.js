// Portfolio Data and Configuration
// Remove the static portfolioItems array
// Use window.portfolioItems from portfolioData.js

const TAB_ALL = "all";

class Portfolio {
    getTypeToTab() {
        const typeSet = new Set(this.portfolioItems.map(item => item.type));
        const typeToTab = {
            "All": TAB_ALL
        };
        
        // Add all unique types
        typeSet.forEach(type => {
            typeToTab[type] = type.toLowerCase().replace(/\s+/g, '-');
        });

        return typeToTab;
    }    constructor(containerId, tabsSelector) {
        this.container = document.getElementById(containerId);
        this.tabsContainer = document.querySelector(".portfolio-tabs ul");
        this.sortDropdown = document.getElementById('sortOptions');
        this.refreshButton = document.querySelector('.refresh-btn');
        this.portfolioData = null;
        this.portfolioItems = [];
        this.currentFilter = TAB_ALL;
        this.currentSort = 'default';
        this.lastRefreshTime = new Date();
        this.currentUser = localStorage.getItem('currentUser');

        this.init();
    }    async init() {
        try {
            await this.loadPortfolioData();
            this.applyDynamicStyles();
            this.renderTabs();
            this.renderSummary();
            this.render();
            this.setupEventListeners();
            this.analyzePortfolio();
        } catch (error) {
            console.error('Failed to initialize portfolio:', error);
            this.showNotification('Failed to initialize portfolio view', 'error');
        }
    }

    calculateItemProfit(item) {
        const totalPurchaseValue = item.purchasePrice * item.quantity;
        const profit = item.currentValue - totalPurchaseValue;
        const profitPercent = (profit / totalPurchaseValue) * 100;
        
        return {
            profit: parseFloat(profit.toFixed(2)),
            profitPercent: parseFloat(profitPercent.toFixed(2))
        };
    }

    calculateItemValues(item) {
        // Calculate current value based on current price and quantity
        const currentValue = item.currentPrice * item.quantity;
        
        // Calculate total purchase cost
        const totalPurchaseCost = item.purchasePrice * item.quantity;
        
        // Calculate profit
        const profit = currentValue - totalPurchaseCost;
        
        // Calculate profit percentage
        const profitPercent = ((profit / totalPurchaseCost) * 100).toFixed(2);
        
        return {
            currentValue,
            profit,
            profitPercent: parseFloat(profitPercent)
        };
    }

    processPortfolioItem(item) {
        const { profit, profitPercent } = this.calculateItemProfit(item);
        const calculatedValues = this.calculateItemValues(item);
        return {
            ...item,
            profit,
            profitPercent,
            currentValue: calculatedValues.currentValue
        };
    }

    async loadPortfolioData() {
        try {
            const username = this.currentUser;
            if (!username) {
                this.portfolioItems = [];
                this.showNotification('No user logged in.', 'error');
                return false;
            }
            // Fetch unified portfolio items from backend
            const response = await fetch(`http://localhost:3001/api/portfolio-items-combined?username=${encodeURIComponent(username)}`);
            if (!response.ok) throw new Error('Could not load portfolio data');
            const responseData = await response.json();
            let items = responseData.portfolioItems || [];
            this.lastRefreshTime = new Date();
            this.updateLastRefreshDisplay();

            // Fetch target allocation for rebalancing analysis
            let targetAllocation = null;
            try {
                const allocRes = await fetch(`http://localhost:3001/api/target-allocation?username=${encodeURIComponent(username)}`);
                if (allocRes.ok) {
                    const allocData = await allocRes.json();
                    if (allocData && typeof allocData === 'object') {
                        targetAllocation = allocData;
                    }
                }
            } catch (e) {
                console.warn('Could not fetch target allocation:', e);
            }
            if (!this.portfolioData) this.portfolioData = { portfolioMetadata: {} };
            if (!this.portfolioData.portfolioMetadata) this.portfolioData.portfolioMetadata = {};
            this.portfolioData.portfolioMetadata.targetAllocation = targetAllocation;

            // Fetch all asset price JSONs in parallel
            const [stocks, mutualFunds, etfs, crypto] = await Promise.all([
                fetch('/data/stocks.json').then(r => r.ok ? r.json() : {}),
                fetch('/data/mutualFunds.json').then(r => r.ok ? r.json() : {}),
                fetch('/data/etfs.json').then(r => r.ok ? r.json() : {}),
                fetch('/data/crypto.json').then(r => r.ok ? r.json() : {})
            ]);
            const priceMaps = {
                'Stocks': stocks,
                'Mutual Funds': mutualFunds,
                'ETFs': etfs,
                'Crypto': crypto
            };

            // Update each item's currentPrice from the respective JSON file
            items = items.map(item => {
                let typeKey = item.type;
                if (typeKey === 'Fixed Deposits' || typeKey === 'REITs' || typeKey === 'Gold') return item; // skip FDs, REITs, Gold
                let priceData = priceMaps[typeKey] && priceMaps[typeKey][item.name];
                if (priceData && priceData.updated) {
                    return { ...item, currentPrice: priceData.updated };
                }
                return item;
            });
            this.portfolioItems = Array.isArray(items) ? items : [];
            return true;
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.showNotification('Failed to load portfolio data', 'error');
            return false;
        }
    }

    // Fetch target allocation for the user (for rebalancing analysis)
    async loadTargetAllocation(username) {
        try {
            // Try to fetch from backend (implement this endpoint in backend if not present)
            const response = await fetch(`http://localhost:3001/api/target-allocation?username=${encodeURIComponent(username)}`);
            if (!response.ok) throw new Error('No target allocation found');
            const data = await response.json();
            if (!this.portfolioData) this.portfolioData = {};
            if (!this.portfolioData.portfolioMetadata) this.portfolioData.portfolioMetadata = {};
            this.portfolioData.portfolioMetadata.targetAllocation = data.targetAllocation || {};
        } catch (error) {
            // If not found, clear target allocation
            if (!this.portfolioData) this.portfolioData = {};
            if (!this.portfolioData.portfolioMetadata) this.portfolioData.portfolioMetadata = {};
            this.portfolioData.portfolioMetadata.targetAllocation = {};
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateLastRefreshDisplay() {
        const refreshTimeDisplay = document.querySelector('.last-refresh-time');
        if (refreshTimeDisplay) {
            refreshTimeDisplay.textContent = this.lastRefreshTime.toLocaleTimeString();
        }
    }

    analyzePortfolio() {
        const analysis = {
            riskProfile: this.calculateRiskProfile(),
            sectorDiversification: this.calculateSectorDiversity(),
            portfolioAllocation: this.calculateCurrentAllocation(),
            rebalancingNeeded: this.checkRebalancingNeeded()
        };
        this.renderAnalysis(analysis);
    }

    calculateRiskProfile() {
        const riskScores = {
            'Low': 1,
            'Moderate': 2,
            'High': 3
        };
        
        const totalValue = this.portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
        const weightedRiskScore = this.portfolioItems.reduce((score, item) => {
            const weight = item.currentValue / totalValue;
            return score + (riskScores[item.riskLevel] * weight);
        }, 0);

        return weightedRiskScore <= 1.5 ? 'Conservative' : 
               weightedRiskScore <= 2.2 ? 'Moderate' : 'Aggressive';
    }

    calculateSectorDiversity() {
        const sectorAllocation = {};
        const totalValue = this.portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);

        this.portfolioItems.forEach(item => {
            // Use backend-provided sector if available
            const sector = item.sector || 'Others';
            sectorAllocation[sector] = (sectorAllocation[sector] || 0) + 
                                     (item.currentValue / totalValue * 100);
        });

        return sectorAllocation;
    }

    calculateCurrentAllocation() {
        const allocation = {};
        const totalValue = this.portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);

        this.portfolioItems.forEach(item => {
            allocation[item.type] = (allocation[item.type] || 0) + 
                                  (item.currentValue / totalValue * 100);
        });

        return allocation;
    }

    checkRebalancingNeeded() {
        if (!this.portfolioData || !this.portfolioData.portfolioMetadata || !this.portfolioData.portfolioMetadata.targetAllocation) {
            return {};
        }
        const currentAllocation = this.calculateCurrentAllocation();
        const targetAllocation = this.portfolioData.portfolioMetadata.targetAllocation;
        const threshold = 5; // 5% deviation threshold

        return Object.entries(targetAllocation).reduce((rebalancing, [type, target]) => {
            const current = currentAllocation[type] || 0;
            const deviation = Math.abs(current - target);
            
            if (deviation > threshold) {
                rebalancing[type] = {
                    current,
                    target,
                    deviation,
                    action: current > target ? 'Reduce' : 'Increase'
                };
            }
            return rebalancing;
        }, {});
    }

    renderAnalysis(analysis) {
        // Create analysis section if it doesn't exist
        let analysisSection = document.querySelector('.portfolio-analysis');
        if (!analysisSection) {
            analysisSection = document.createElement('section');
            analysisSection.className = 'portfolio-analysis';
            this.container.parentNode.insertBefore(analysisSection, this.container);
        }

        analysisSection.innerHTML = `
            <div class="analysis-card">
                <h3>Portfolio Analysis</h3>
                <div class="analysis-grid"></div>
                    <div class="analysis-item">
                        <span class="analysis-label">Risk Profile</span>
                        <span class="analysis-value">${analysis.riskProfile}</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">Sector Diversity</span>
                        <div class="analysis-sectors">
                            ${Object.entries(analysis.sectorDiversification)
                                .map(([sector, percentage]) => `
                                    <div class="sector-item">
                                        <span class="sector-name">${sector}</span>
                                        <span class="sector-value">${percentage.toFixed(1)}%</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">Rebalancing Needed</span>
                        <div class="rebalancing-list">
                            ${Object.entries(analysis.rebalancingNeeded)
                                .map(([type, data]) => `
                                    <div class="rebalancing-item">
                                        <span class="type">${type}</span>
                                        <span class="action">${data.action}</span>
                                        <span class="deviation">${data.deviation.toFixed(1)}%</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }    handleTabClick(tab) {
        if (!tab) return;
        
        // Remove active class from all tabs
        const allTabs = this.tabsContainer.querySelectorAll('li');
        allTabs.forEach(t => t.classList.remove("active"));
        
        // Add active class to clicked tab
        tab.classList.add("active");
        
        // Update current filter and re-render
        this.currentFilter = tab.getAttribute("data-tab") || TAB_ALL;
        this.render();
    }

    handleViewDetailsClick(button) {
        const card = button.closest(".card");
        card.classList.toggle("expanded");
    }    filterItems() {
        if (this.currentFilter === TAB_ALL) {
            return this.portfolioItems;
        }
        const typeToTab = this.getTypeToTab();
        return this.portfolioItems.filter(item => 
            typeToTab[item.type] === this.currentFilter
        );
    }

    // Helper function to get icon by type (case-insensitive, whitespace-insensitive)
    getTypeIcon(type) {
        if (!type) return '💰';
        const t = type.trim().replace(/\s+/g, '').toLowerCase();
        switch (t) {
            case 'stocks': return '📈';
            case 'mutualfunds': return '📊';
            case 'fixeddeposits': return '🏦';
            case 'gold': return '🥇';
            case 'reits': return '🏢';
            case 'crypto': return '🪙';
            case 'etfs': return '💹';
            default: return '💰';
        }
    }

    // Helper function to create portfolio card with view details button
    createCard(item, index) {
        const card = document.createElement("div");
        card.className = "card";
        const displayQuantity = (item.type === "Fixed Deposits" && (!item.quantity || isNaN(item.quantity))) ? 1 : item.quantity;
        const { profit, profitPercent } = this.calculateItemProfit({...item, quantity: displayQuantity});
        const { currentValue } = this.calculateItemValues({...item, quantity: displayQuantity});
        const typeToTab = this.getTypeToTab();
        const typeClass = typeToTab[item.type];
        const icon = this.getTypeIcon(item.type);
        card.innerHTML = `
            <div class="card-header">
                <span class="card-icon ${typeClass}" data-type="${typeClass}">
                    <span class="card-icon-img">${icon}</span>
                </span>
                <span class="card-title">${item.name}</span>
                <span class="card-type-badge">${item.type}</span>
            </div>
            <div class="card-main">
                <div class="card-grid">
                    <div>
                        <div class="card-label">Quantity</div>
                        <div class="card-value">${displayQuantity}</div>
                    </div>
                    <div>
                        <div class="card-label">Purchase Price</div>
                        <div class="card-value">${this.formatCurrency(item.purchasePrice)}</div>
                    </div>
                    <div>
                        <div class="card-label">Current Price</div>
                        <div class="card-value">${this.formatCurrency(item.currentPrice)}</div>
                    </div>
                    <div>
                        <div class="card-label">Current Value</div>
                        <div class="card-current-value">${this.formatCurrency(currentValue)}</div>
                    </div>
                </div>
                <div class="card-row">
                    <div class="card-profit${profit < 0 ? " negative" : ""}">
                        ${this.getProfitText(profit, profitPercent)}
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <button onclick="window.location.href='../display-option/displayoption.html?id=${index}'" class="view-details-btn">View Details </button>
            </div>
        `;
        return card;
    }

    calculatePortfolioSummary() {
        return this.portfolioItems.reduce((summary, item) => {
            // Always use quantity=1 for FDs if missing/undefined
            const quantity = (item.type === "Fixed Deposits" && (!item.quantity || isNaN(item.quantity))) ? 1 : item.quantity;
            const { currentValue, profit } = this.calculateItemValues({...item, quantity});
            const totalPurchaseCost = item.purchasePrice * quantity;
            summary.totalInvestments++;
            summary.totalCurrentValue += currentValue;
            summary.totalInvestedAmount += totalPurchaseCost;
            summary.totalProfit += profit;
            return summary;
        }, {
            totalInvestments: 0,
            totalCurrentValue: 0,
            totalInvestedAmount: 0,
            totalProfit: 0
        });
    }

    renderSummary() {
        const summaryGrid = document.querySelector('.portfolio-summary-grid');
        if (!summaryGrid) return;
        const summary = this.calculatePortfolioSummary();
        const profitPercent = ((summary.totalProfit / (summary.totalInvestedAmount || 1)) * 100).toFixed(2);
        summaryGrid.innerHTML = `
            <div>
                <span class="summary-label">Total Investments</span>
                <span class="summary-value">${summary.totalInvestments}</span>
            </div>
            <div>
                <span class="summary-label">Portfolio Value</span>
                <span class="summary-value">${this.formatCurrency(summary.totalCurrentValue)}</span>
            </div>
            <div>
                <span class="summary-label">Total Invested</span>
                <span class="summary-value">${this.formatCurrency(summary.totalInvestedAmount)}</span>
            </div>
            <div>
                <span class="summary-label">Total Profit/Loss</span>
                <div class="summary-profit-container">
                    <span class="summary-value profit${summary.totalProfit < 0 ? ' negative' : ''}">
                        ${this.formatCurrency(summary.totalProfit)}
                    </span>
                    <span class="profit-percent${summary.totalProfit < 0 ? ' negative' : ''}">
                        (${profitPercent}%)
                    </span>
                </div>
            </div>
        `;
    }

    sortItems(items) {
        const sortFunctions = {
            'default': () => items,
            'name-asc': () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
            'name-desc': () => [...items].sort((a, b) => b.name.localeCompare(a.name)),
            'value-high': () => [...items].sort((a, b) => 
                (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity)),
            'value-low': () => [...items].sort((a, b) => 
                (a.currentPrice * a.quantity) - (b.currentPrice * b.quantity)),
            'profit-high': () => [...items].sort((a, b) => {
                const profitA = this.calculateItemValues(a).profit;
                const profitB = this.calculateItemValues(b).profit;
                return profitB - profitA;
            }),
            'profit-low': () => [...items].sort((a, b) => {
                const profitA = this.calculateItemValues(a).profit;
                const profitB = this.calculateItemValues(b).profit;
                return profitA - profitB;
            }),
            'roi-high': () => [...items].sort((a, b) => {
                const roiA = this.calculateItemValues(a).profitPercent;
                const roiB = this.calculateItemValues(b).profitPercent;
                return roiB - roiA;
            }),
            'roi-low': () => [...items].sort((a, b) => {
                const roiA = this.calculateItemValues(a).profitPercent;
                const roiB = this.calculateItemValues(b).profitPercent;
                return roiA - roiB;
            })
        };

        return (sortFunctions[this.currentSort] || sortFunctions['default'])();
    }

    getProfitText(profit, profitPercent) {
        if (profit === 0) return "No Change";
        const prefix = profit > 0 ? "+" : "";
        return `${prefix}${this.formatCurrency(profit)} (${prefix}${profitPercent}%)`;
    }

    formatCurrency(val) {
        if (typeof val !== "number" || isNaN(val)) return "₹0";
        return "₹" + val.toLocaleString("en-IN");
    }

    createSummaryElement(parent, id) {
        const element = document.createElement('span');
        element.id = id;
        element.className = id.includes('profit') ? 'summary-value profit' : 'summary-value';
        element.textContent = '--';
        parent.appendChild(element);
        return element;
    }

    renderSummary() {
        const summaryGrid = document.querySelector('.portfolio-summary-grid');
        if (!summaryGrid) {
            console.warn('Portfolio summary grid not found');
            return;
        }

        const elements = {
            totalInvestments: document.getElementById('summary-total-investments') || 
                            this.createSummaryElement(summaryGrid.children[0], 'summary-total-investments'),
            portfolioValue: document.getElementById('summary-portfolio-value') || 
                          this.createSummaryElement(summaryGrid.children[1], 'summary-portfolio-value'),
            totalInvested: document.getElementById('summary-total-invested') || 
                         this.createSummaryElement(summaryGrid.children[2], 'summary-total-invested'),
            totalProfit: document.getElementById('summary-total-profit') || 
                        this.createSummaryElement(summaryGrid.children[3], 'summary-total-profit'),
            profitPercent: document.getElementById('summary-profit-percent') || 
                          this.createSummaryElement(summaryGrid.children[3], 'summary-profit-percent')
        };

        const totalInvestments = this.portfolioItems.length;
        const portfolioValue = this.portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
        const totalInvested = this.portfolioItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
        const totalProfit = portfolioValue - totalInvested;
        const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

        elements.totalInvestments.textContent = totalInvestments;
        elements.portfolioValue.textContent = this.formatCurrency(portfolioValue);
        elements.totalInvested.textContent = this.formatCurrency(totalInvested);
        elements.totalProfit.textContent = this.formatCurrency(totalProfit);
        elements.profitPercent.textContent = `${profitPercent >= 0 ? "↑" : "↓"} ${profitPercent.toFixed(2)}%`;
        elements.totalProfit.className = "summary-value profit" + (totalProfit < 0 ? " negative" : "");
    }

    sortItems(items) {
        const sortFunctions = {
            'default': () => items,
            'name-asc': () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
            'name-desc': () => [...items].sort((a, b) => b.name.localeCompare(a.name)),
            'value-high': () => [...items].sort((a, b) => b.currentValue - a.currentValue),
            'value-low': () => [...items].sort((a, b) => a.currentValue - b.currentValue),
            'profit-high': () => [...items].sort((a, b) => b.profit - a.profit),
            'profit-low': () => [...items].sort((a, b) => a.profit - b.profit),
            'roi-high': () => [...items].sort((a, b) => this.calculateItemROI(b) - this.calculateItemROI(a)),
            'roi-low': () => [...items].sort((a, b) => this.calculateItemROI(a) - this.calculateItemROI(b))
        };

        return (sortFunctions[this.currentSort] || sortFunctions['default'])();
    }

    calculateItemROI(item) {
        const invested = item.purchasePrice * item.quantity;
        return ((item.currentValue - invested) / invested) * 100;
    }

    render() {
        this.renderSummary();
        this.container.innerHTML = "";
        const filteredItems = this.filterItems();
        const sortedItems = this.sortItems(filteredItems);
        sortedItems.forEach((item, index) => {
            this.container.appendChild(this.createCard(item, index));
        });
    }

    renderTabs() {
        const tabsContainer = document.querySelector(".portfolio-tabs ul");
        if (!tabsContainer) return;

        const typeToTab = this.getTypeToTab();
        tabsContainer.innerHTML = Object.entries(typeToTab)
            .map(([type, tabId]) => `
                <li class="tab${tabId === this.currentFilter ? ' active' : ''}" 
                    data-tab="${tabId}">${type}</li>
            `).join('');
    }    setupEventListeners() {
        // Event delegation for tabs
        const tabsContainer = document.querySelector(".portfolio-tabs");
        if (tabsContainer) {
            tabsContainer.addEventListener("click", (e) => {
                const clickedTab = e.target.closest("li");
                if (clickedTab) {
                    this.handleTabClick(clickedTab);
                }
            });
        }

        // Event delegation for card details
        if (this.container) {
            this.container.addEventListener("click", (e) => {
                const detailsButton = e.target.closest(".card-view-details");
                if (detailsButton) {
                    this.handleViewDetailsClick(detailsButton);
                }
            });
        }

        // Add sell assets button listener
        const sellAssetsBtn = document.querySelector(".sell-assets-btn");
        if (sellAssetsBtn) {
            sellAssetsBtn.addEventListener("click", () => {
                window.location.href = "../sell-assets/sellassets.html";
            });
        }

        // Add sort dropdown listener
        if (this.sortDropdown) {
            this.sortDropdown.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.render();
            });
        }

        // Add refresh button listener
        if (this.refreshButton) {
            this.refreshButton.addEventListener('click', () => this.refreshData());
        }

        // Add export buttons listeners
        document.querySelectorAll('.export-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const exportType = e.target.dataset.type;
                if (exportType === 'json') {
                    this.exportToJSON();
                } else if (exportType === 'pdf') {
                    this.exportToPDF();
                }
            });
        });

        // Add user change detection
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                const newUser = localStorage.getItem('currentUser');
                this.handleUserChange(newUser);
            }
        });
    }    async handleUserChange(newUser) {
        this.currentUser = newUser;
        await this.refreshPortfolio();
    }

    async refreshPortfolio() {
        this.showNotification('Refreshing portfolio...', 'info');
        await this.loadPortfolioData();
        this.renderTabs();
        this.renderSummary();
        this.render();
        this.analyzePortfolio();
        this.showNotification('Portfolio refreshed!', 'success');
    }

    async refreshData() {
        const refreshBtn = document.querySelector('.refresh-btn');
        refreshBtn.classList.add('loading');

        try {
            await this.loadPortfolioData();
            this.renderTabs();
            this.renderSummary();
            this.render();
            this.analyzePortfolio();
            this.showNotification('Portfolio data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('Failed to refresh portfolio data', 'error');
        } finally {
            refreshBtn.classList.remove('loading');
        }
    }

    exportToJSON() {
        const data = {
            metadata: {
                exportDate: new Date().toISOString(),
                lastRefresh: this.lastRefreshTime.toISOString()
            },
            summary: {
                totalInvestments: this.portfolioItems.length,
                totalValue: this.portfolioItems.reduce((sum, item) => sum + item.currentValue, 0),
                totalInvested: this.portfolioItems.reduce((sum, item) => 
                    sum + (item.purchasePrice * item.quantity), 0)
            },
            analysis: {
                riskProfile: this.calculateRiskProfile(),
                sectorDiversity: this.calculateSectorDiversity(),
                allocation: this.calculateCurrentAllocation()
            },
            items: this.portfolioItems
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `portfolio-export-${new Date().toISOString().split('T')[0]}.json`);
    }    exportToPDF() {
        // Create new jsPDF doc in landscape for better table formatting
        const doc = new jspdf.jsPDF('landscape');
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Add header with styling
        doc.setFontSize(24);
        doc.setTextColor(25, 118, 210); // Primary blue color
        doc.text('Investment Portfolio Report', pageWidth/2, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(102, 102, 102); // Gray color for date
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth/2, 27, { align: 'center' });

        // Add summary section
        const totalValue = this.portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
        const totalInvested = this.portfolioItems.reduce((sum, item) => 
            sum + (item.purchasePrice * item.quantity), 0);
        const totalProfit = totalValue - totalInvested;
        const profitPercent = ((totalProfit/totalInvested) * 100).toFixed(2);
        
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(247, 250, 252);
        doc.rect(15, 35, pageWidth - 30, 25, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        
        // Format currency without the ¹ character
        const formatPDFCurrency = (val) => {
            return "₹" + val.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0
            }).replace(/^¹/, '');
        };

        // Summary grid
        const summaryData = [
            ['Total Investments', 'Portfolio Value', 'Total Invested', 'Total Profit/Loss'],
            [
                this.portfolioItems.length.toString(),
                formatPDFCurrency(totalValue),
                formatPDFCurrency(totalInvested),
                `${formatPDFCurrency(totalProfit)} (${profitPercent}%)`
            ]
        ];
        
        doc.autoTable({
            startY: 35,
            head: [summaryData[0]],
            body: [summaryData[1]],
            theme: 'grid',
            headStyles: { fillColor: [25, 118, 210], textColor: 255 },
            styles: { halign: 'center' },
            margin: { left: 15, right: 15 }
        });

        // Asset Allocation Section
        doc.setFontSize(16);
        doc.setTextColor(25, 118, 210);
        doc.text('Asset Allocation', 15, 80);
        
        const allocation = this.calculateCurrentAllocation();
        const allocationData = Object.entries(allocation).map(([type, percentage]) => 
            [type, `${percentage.toFixed(1)}%`]
        );
        
        doc.autoTable({
            startY: 85,
            head: [['Asset Type', 'Allocation']],
            body: allocationData,
            theme: 'striped',
            headStyles: { fillColor: [25, 118, 210] },
            margin: { left: 15, right: pageWidth/2 + 15 }
        });

        // Investment Details Section
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(25, 118, 210);
        doc.text('Investment Details', 15, 20);
        
        const investmentData = this.portfolioItems.map(item => [
            item.name,
            item.type,
            item.quantity.toString(),
            this.formatCurrency(item.purchasePrice),
            this.formatCurrency(item.currentValue),
            `${this.formatCurrency(item.profit)} (${item.profitPercent.toFixed(2)}%)`
        ]);
        
        doc.autoTable({
            startY: 25,
            head: [['Name', 'Type', 'Quantity', 'Purchase Price', 'Current Value', 'Profit/Loss']],
            body: investmentData,
            theme: 'grid',
            headStyles: { fillColor: [25, 118, 210] },
            alternateRowStyles: { fillColor: [247, 250, 252] },
            margin: { left: 15, right: 15 },
            styles: { fontSize: 10 }
        });

        // Save the PDF
        doc.save(`portfolio-export-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    cleanup() {
        // Remove event listeners
        this.tabs.forEach(tab => {
            tab.removeEventListener('click', this.handleTabClick);
        });
        // Clear data
        this.portfolioItems = [];
        this.portfolioData = null;
    }

    applyDynamicStyles() {
        // Get all unique types from portfolio items
        const types = new Set(this.portfolioItems.map(item => item.type));
        
        // Generate colors for each type
        const colors = {
            'Stocks': { bg: '#e3f0ff', color: '#1976d2' },
            'Mutual Funds': { bg: '#e6f7f1', color: '#1a7f37' },
            'Fixed Deposits': { bg: '#fff7e6', color: '#e6a700' },
            'Others': { bg: '#f3e6ff', color: '#a259d9' }
        };

        // Create dynamic styles
        const styleSheet = document.createElement('style');
        types.forEach(type => {
            if (!colors[type]) {
                // Generate a random color for new types
                const hue = Math.random() * 360;
                colors[type] = {
                    bg: `hsl(${hue}, 85%, 95%)`,
                    color: `hsl(${hue}, 85%, 35%)`
                };
            }
            
            const className = type.toLowerCase().replace(/\s+/g, '-');
            styleSheet.textContent += `
                .card-icon[data-type='${className}'], .card-icon.${className} {
                    background: ${colors[type].bg};
                    color: ${colors[type].color};
                }
            `;
        });

        // Apply styles
        document.head.appendChild(styleSheet);
    }

    // Helper function to handle View Details click
    onViewDetailsClick(index) {
        window.location.href = `../display-option/displayoption.html?id=${index}`;
    }

    createItemCard(item, index) {
        const { profit, profitPercent } = this.calculateItemProfit(item);
        const isProfit = profit >= 0;
        const icon = this.getTypeIcon(item.type);
        return `
            <div class="portfolio-card">
                <div class="card-header">
                    <span class="asset-icon">${icon}</span>
                    <div class="asset-info">
                        <h3>${item.name}</h3>
                        <span class="asset-type">${item.type}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="value-info">
                        <div class="current-value">₹${item.currentValue.toLocaleString()}</div>
                        <div class="profit-loss ${isProfit ? 'positive' : 'negative'}">
                            ${isProfit ? '+' : ''}₹${Math.abs(profit).toLocaleString()} (${profitPercent}%)
                        </div>
                    </div>
                    <button onclick="portfolio.onViewDetailsClick(${index})" class="view-details-btn">View Details</button>
                </div>
            </div>
        `;
    }

    mergePlans(plans) {
        const merged = {};

        for (const plan of plans) {
            const purchases = plan.purchases || {};
            for (const [type, assets] of Object.entries(purchases)) {
                for (const asset of assets) {
                    // FD special handling
                    if (type === "fd") {
                        const key = `${type}|${asset.name}`;
                        if (!merged[key]) {
                            merged[key] = {
                                name: asset.name,
                                type: "Fixed Deposits",
                                totalAmount: 0,
                                totalMaturity: 0,
                                totalGain: 0,
                                totalRate: 0,
                                count: 0
                            };
                        }
                        merged[key].totalAmount += asset.amount || 0;
                        merged[key].totalMaturity += asset.maturity || 0;
                        merged[key].totalGain += (asset.maturity || 0) - (asset.amount || 0);
                        merged[key].totalRate += asset.rate || 0;
                        merged[key].count += 1;
                    } else {
                        // For stocks, mutualFunds, goldETFs, etc.
                        const key = `${type}|${asset.name}`;
                        if (!merged[key]) {
                            merged[key] = {
                                name: asset.name,
                                type: type,
                                totalUnits: 0,
                                totalCost: 0,
                                price: asset.price || asset.nav || 0
                            };
                        }
                        const units = asset.units || 0;
                        const price = asset.price || asset.nav || 0;
                        const total = asset.total || (units * price);
                        merged[key].totalUnits += units;
                        merged[key].totalCost += total;
                        // Optionally update price if you have latest price info
                    }
                }
            }
        }

        // Format output
        const result = [];
        for (const key in merged) {
            const item = merged[key];
            if (item.type === "Fixed Deposits") {
                result.push({
                    name: item.name,
                    type: "Fixed Deposits",
                    totalAmount: item.totalAmount,
                    maturityValue: item.totalMaturity,
                    gain: item.totalGain,
                    avgRate: item.totalRate / item.count,
                });
            } else {
                const avgPrice = item.totalUnits ? (item.totalCost / item.totalUnits) : 0;
                result.push({
                    name: item.name,
                    type: item.type,
                    quantity: item.totalUnits,
                    averagePurchasePrice: avgPrice,
                    currentPrice: item.price, // or use latest price if available
                    currentValue: item.totalUnits * item.price,
                });
            }
        }
        return result;
    }
}

// Initialize the portfolio on DOM load
document.addEventListener("DOMContentLoaded", () => {
    new Portfolio("portfolio-cards", ".portfolio-tabs .tab");

    // Show/hide Log Out button based on login status
    const currentUser = localStorage.getItem('currentUser');
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        if (currentUser) {
            logoutBtn.style.display = '';
            logoutBtn.addEventListener('click', function() {
                if (document.getElementById('logout-popup')) return;
                const popup = document.createElement('div');
                popup.id = 'logout-popup';
                popup.innerHTML = `
                    <div class="logout-modal-bg" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:9998;"></div>
                    <div class="logout-modal" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:32px 28px 24px 28px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.18);z-index:9999;min-width:300px;text-align:center;">
                        <h2 style='margin-bottom:18px;font-size:1.3em;color:#1a237e;'>Logout Confirmation</h2>
                        <p style='margin-bottom:24px;color:#333;'>Are you sure you want to logout?</p>
                        <button id="logout-yes" style="background:#1a237e;color:#fff;padding:8px 24px;border:none;border-radius:6px;margin-right:12px;cursor:pointer;font-size:1em;">Yes</button>
                        <button id="logout-no" style="background:#fff;color:#1a237e;padding:8px 24px;border:1.5px solid #1a237e;border-radius:6px;cursor:pointer;font-size:1em;">No</button>
                    </div>
                `;
                document.body.appendChild(popup);
                document.getElementById('logout-yes').onclick = function() {
                    localStorage.removeItem('currentUser');
                    document.body.removeChild(popup);
                    window.location.href = '../user/login.html';
                };
                document.getElementById('logout-no').onclick = function() {
                    document.body.removeChild(popup);
                };
                popup.querySelector('.logout-modal-bg').onclick = function() {
                    document.body.removeChild(popup);
                };
            });
        } else {
            logoutBtn.style.display = 'none';
        }
    }
});
