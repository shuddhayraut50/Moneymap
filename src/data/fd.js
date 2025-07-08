// fd.js
// List of banks and their FD rates for use in manualSelection()

export const fdData = {
  low: [
    {
      name: "Suryoday SF Bank",
      rates: { 1: 7.25, 2: 7.25, 3: 7.25 },
      isSmallFinance: true
    },
    {
      name: "HDFC Bank",
      rates: { 1: 6.5, 2: 7.0, 3: 7.1 },
      isSmallFinance: false
    },
    {
      name: "SBI",
      rates: { 1: 6.8, 2: 7.0, 3: 7.0 },
      isSmallFinance: false
    }
  ],
  medium: [
    {
      name: "Utkarsh SF Bank",
      rates: { 1: 7.0, 2: 7.25, 3: 7.5 },
      isSmallFinance: true
    },
    {
      name: "ICICI Bank",
      rates: { 1: 6.7, 2: 7.1, 3: 7.2 },
      isSmallFinance: false
    },
    {
      name: "Axis Bank",
      rates: { 1: 6.85, 2: 7.05, 3: 7.1 },
      isSmallFinance: false
    }
  ],
  high: [
    {
      name: "Unity SF Bank",
      rates: { 1: 6.25, 2: 7.0, 3: 8.15 },
      isSmallFinance: true
    },
    {
      name: "IndusInd Bank",
      rates: { 1: 7.1, 2: 7.5, 3: 7.75 },
      isSmallFinance: false
    },
    {
      name: "RBL Bank",
      rates: { 1: 7.05, 2: 7.55, 3: 7.8 },
      isSmallFinance: false
    }
  ]
};

export function getFDInterestRate(bank, years) {
  if (years === 1) return bank.rates[1];
  if (years === 2) return bank.rates[2];
  if (years === 3 || years === 4) return bank.rates[3];
  if (years >= 5 && years <= 10) return bank.rates[3] + 1;
  if (years >= 11 && years <= 20) return bank.rates[3] + 1.5;
  return bank.rates[3];
}
