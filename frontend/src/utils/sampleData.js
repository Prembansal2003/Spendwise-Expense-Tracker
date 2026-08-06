export const INITIAL_TRANSACTIONS = [
  {
    id: 101,
    title: 'Tech Corp Salary',
    amount: 5200.00,
    type: 'INCOME',
    category: 'SALARY',
    transactionDate: '2026-08-01',
    paymentMethod: 'Bank Transfer',
    notes: 'Monthly salary credit'
  },
  {
    id: 102,
    title: 'Apartment Rent',
    amount: 1450.00,
    type: 'EXPENSE',
    category: 'HOUSING',
    transactionDate: '2026-08-01',
    paymentMethod: 'Bank Transfer',
    notes: 'August rent payment'
  },
  {
    id: 103,
    title: 'Organic Groceries',
    amount: 165.50,
    type: 'EXPENSE',
    category: 'FOOD',
    transactionDate: '2026-08-02',
    paymentMethod: 'Credit Card',
    notes: 'Whole Foods market'
  },
  {
    id: 104,
    title: 'Freelance UI Design',
    amount: 850.00,
    type: 'INCOME',
    category: 'FREELANCE',
    transactionDate: '2026-08-03',
    paymentMethod: 'UPI',
    notes: 'Dashboard UI design deliverable'
  },
  {
    id: 105,
    title: 'Electric & Water Bill',
    amount: 180.00,
    type: 'EXPENSE',
    category: 'UTILITIES',
    transactionDate: '2026-08-03',
    paymentMethod: 'Debit Card',
    notes: 'Monthly utility bill'
  },
  {
    id: 106,
    title: 'Gasoline / Fuel',
    amount: 65.00,
    type: 'EXPENSE',
    category: 'TRANSPORT',
    transactionDate: '2026-08-04',
    paymentMethod: 'Credit Card',
    notes: 'Car fuel refill'
  },
  {
    id: 107,
    title: 'Cinema & Dinner Out',
    amount: 110.00,
    type: 'EXPENSE',
    category: 'ENTERTAINMENT',
    transactionDate: '2026-08-04',
    paymentMethod: 'Credit Card',
    notes: 'Weekend movie & dinner'
  },
  {
    id: 108,
    title: 'Weekly Grocery Run',
    amount: 155.00,
    type: 'EXPENSE',
    category: 'FOOD',
    transactionDate: '2026-08-05',
    paymentMethod: 'Debit Card',
    notes: 'Trader Joes groceries'
  },
  {
    id: 109,
    title: 'Wireless Earbuds',
    amount: 140.00,
    type: 'EXPENSE',
    category: 'SHOPPING',
    transactionDate: '2026-08-05',
    paymentMethod: 'Credit Card',
    notes: 'Tech store'
  },
  {
    id: 110,
    title: 'Gym Membership',
    amount: 55.00,
    type: 'EXPENSE',
    category: 'HEALTH',
    transactionDate: '2026-08-06',
    paymentMethod: 'Credit Card',
    notes: 'Fitness club monthly fee'
  }
];

export const INITIAL_BUDGETS = [
  { id: 1, category: 'FOOD', monthlyLimit: 600.00 },
  { id: 2, category: 'HOUSING', monthlyLimit: 1500.00 },
  { id: 3, category: 'TRANSPORT', monthlyLimit: 300.00 },
  { id: 4, category: 'ENTERTAINMENT', monthlyLimit: 250.00 },
  { id: 5, category: 'UTILITIES', monthlyLimit: 350.00 },
  { id: 6, category: 'SHOPPING', monthlyLimit: 400.00 },
  { id: 7, category: 'HEALTH', monthlyLimit: 200.00 }
];
