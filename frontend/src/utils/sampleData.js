export const INITIAL_TRANSACTIONS = [
  {
    id: 101,
    title: 'Senior Software Engineer Salary',
    amount: 5500.00,
    type: 'INCOME',
    category: 'SALARY',
    transactionDate: '2026-08-01',
    paymentMethod: 'Bank Transfer',
    notes: 'Monthly tech payroll credit'
  },
  {
    id: 102,
    title: 'Freelance Mobile App Contract',
    amount: 1200.00,
    type: 'INCOME',
    category: 'FREELANCE',
    transactionDate: '2026-08-02',
    paymentMethod: 'UPI',
    notes: 'iOS app milestone completion'
  },
  {
    id: 103,
    title: 'Stock Dividend & ETF Yield',
    amount: 350.00,
    type: 'INCOME',
    category: 'INVESTMENT',
    transactionDate: '2026-08-03',
    paymentMethod: 'Bank Transfer',
    notes: 'Quarterly index fund yield'
  },
  {
    id: 104,
    title: 'Luxury Apartment Rent',
    amount: 1600.00,
    type: 'EXPENSE',
    category: 'HOUSING',
    transactionDate: '2026-08-01',
    paymentMethod: 'Bank Transfer',
    notes: 'Monthly housing rent payment'
  },
  {
    id: 105,
    title: 'Organic Groceries & Fresh Produce',
    amount: 215.50,
    type: 'EXPENSE',
    category: 'FOOD',
    transactionDate: '2026-08-02',
    paymentMethod: 'Credit Card',
    notes: 'Whole Foods market shopping'
  },
  {
    id: 106,
    title: 'High-Speed Fiber & Electricity Bill',
    amount: 185.00,
    type: 'EXPENSE',
    category: 'UTILITIES',
    transactionDate: '2026-08-03',
    paymentMethod: 'Debit Card',
    notes: 'Monthly home utility bills'
  },
  {
    id: 107,
    title: 'Car Gasoline Refill & Highway Tolls',
    amount: 85.00,
    type: 'EXPENSE',
    category: 'TRANSPORT',
    transactionDate: '2026-08-04',
    paymentMethod: 'Credit Card',
    notes: 'Shell station fuel refill'
  },
  {
    id: 108,
    title: 'Concert Tickets & Fine Dining',
    amount: 145.00,
    type: 'EXPENSE',
    category: 'ENTERTAINMENT',
    transactionDate: '2026-08-04',
    paymentMethod: 'Credit Card',
    notes: 'Weekend concert & restaurant dining'
  },
  {
    id: 109,
    title: '4K UltraHD Monitor & Tech Gear',
    amount: 320.00,
    type: 'EXPENSE',
    category: 'SHOPPING',
    transactionDate: '2026-08-05',
    paymentMethod: 'Credit Card',
    notes: 'Workstation upgrade'
  },
  {
    id: 110,
    title: 'Annual Comprehensive Health Checkup',
    amount: 150.00,
    type: 'EXPENSE',
    category: 'HEALTH',
    transactionDate: '2026-08-06',
    paymentMethod: 'Credit Card',
    notes: 'Wellness clinic health checkup'
  },
  {
    id: 111,
    title: 'Professional Tech Books & Courses',
    amount: 75.00,
    type: 'EXPENSE',
    category: 'OTHER',
    transactionDate: '2026-08-06',
    paymentMethod: 'UPI',
    notes: 'Software development learning course'
  }
];

export const INITIAL_BUDGETS = [
  { id: 1, category: 'FOOD', monthlyLimit: 600.00 },
  { id: 2, category: 'HOUSING', monthlyLimit: 1800.00 },
  { id: 3, category: 'TRANSPORT', monthlyLimit: 300.00 },
  { id: 4, category: 'ENTERTAINMENT', monthlyLimit: 250.00 },
  { id: 5, category: 'UTILITIES', monthlyLimit: 350.00 },
  { id: 6, category: 'SHOPPING', monthlyLimit: 400.00 },
  { id: 7, category: 'HEALTH', monthlyLimit: 250.00 },
  { id: 8, category: 'OTHER', monthlyLimit: 200.00 }
];

export const CLEAN_DEFAULT_BUDGETS = [
  { id: 1, category: 'FOOD', monthlyLimit: 500.00, currency: 'USD', period: 'MONTHLY' },
  { id: 2, category: 'HOUSING', monthlyLimit: 1500.00, currency: 'USD', period: 'MONTHLY' },
  { id: 3, category: 'TRANSPORT', monthlyLimit: 250.00, currency: 'USD', period: 'MONTHLY' },
  { id: 4, category: 'ENTERTAINMENT', monthlyLimit: 200.00, currency: 'USD', period: 'MONTHLY' },
  { id: 5, category: 'UTILITIES', monthlyLimit: 300.00, currency: 'USD', period: 'MONTHLY' },
  { id: 6, category: 'SHOPPING', monthlyLimit: 300.00, currency: 'USD', period: 'MONTHLY' },
  { id: 7, category: 'HEALTH', monthlyLimit: 200.00, currency: 'USD', period: 'MONTHLY' },
  { id: 8, category: 'OTHER', monthlyLimit: 150.00, currency: 'USD', period: 'MONTHLY' }
];
