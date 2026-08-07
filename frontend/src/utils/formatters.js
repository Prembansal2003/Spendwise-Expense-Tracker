// Currency Configs — rates relative to USD (1 USD = X units)
export const CURRENCIES = [
  { code: 'USD', symbol: '$',   label: 'USD ($)',  rate: 1      },
  { code: 'EUR', symbol: '€',   label: 'EUR (€)',  rate: 0.92   },
  { code: 'GBP', symbol: '£',   label: 'GBP (£)',  rate: 0.79   },
  { code: 'INR', symbol: '₹',   label: 'INR (₹)',  rate: 83.2   },
  { code: 'JPY', symbol: '¥',   label: 'JPY (¥)',  rate: 155.0  },
  { code: 'CAD', symbol: 'CA$', label: 'CAD ($)',  rate: 1.36   },
  { code: 'AUD', symbol: 'A$',  label: 'AUD ($)',  rate: 1.52   }
];

// Get currency object by code
export const getCurrency = (code) =>
  CURRENCIES.find(c => c.code === code) || CURRENCIES[0];

// Get currency symbol by code
export const getCurrencySymbol = (code) => getCurrency(code).symbol;

/**
 * Convert an amount entered in `fromCurrency` → USD for storage.
 * e.g. user enters ₹830 in INR view → stored as $10.00 USD
 */
export const toUSD = (amount, fromCurrencyCode) => {
  const currency = getCurrency(fromCurrencyCode);
  return Number(amount || 0) / currency.rate;
};

/**
 * Convert a USD-base amount → display currency for rendering.
 * e.g. $10 USD → ₹832 in INR view
 */
export const fromUSD = (usdAmount, toCurrencyCode) => {
  const currency = getCurrency(toCurrencyCode);
  return Number(usdAmount || 0) * currency.rate;
};

export const CATEGORY_META = {
  FOOD: { name: 'Food & Dining', icon: '🍽️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  HOUSING: { name: 'Housing & Rent', icon: '🏠', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
  TRANSPORT: { name: 'Transportation', icon: '🚗', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  ENTERTAINMENT: { name: 'Entertainment', icon: '🎬', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  UTILITIES: { name: 'Utilities & Bills', icon: '⚡', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' },
  HEALTH: { name: 'Health & Medical', icon: '🏥', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  SHOPPING: { name: 'Shopping', icon: '🛍️', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  SALARY: { name: 'Salary & Income', icon: '💼', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  FREELANCE: { name: 'Freelance & Side Gigs', icon: '💻', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  INVESTMENT: { name: 'Investments', icon: '📈', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  OTHER: { name: 'Other', icon: '📦', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' }
};

/**
 * Format a USD-base amount for display in the selected currency.
 * Amounts are stored in USD in DB; this converts + formats for display.
 */
export const formatCurrency = (usdAmount, currencyCode = 'USD') => {
  const currency = getCurrency(currencyCode);
  const displayAmount = Number(usdAmount || 0) * currency.rate;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2
  }).format(displayAmount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};
