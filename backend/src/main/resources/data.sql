-- Initial Seed Data for SpendWise Java Backend

-- Users Table
INSERT INTO users (id, name, email, password, role, avatar_url, created_at) VALUES
(1, 'Alex Morgan', 'alex.morgan@spendwise.io', 'password123', 'PRO_MEMBER', '/default-avatar.png', CURRENT_TIMESTAMP);

-- Categories & Initial Budgets
INSERT INTO budgets (id, category, monthly_limit, current_spend, month, year) VALUES 
(1, 'FOOD', 600.00, 420.50, 8, 2026),
(2, 'HOUSING', 1500.00, 1450.00, 8, 2026),
(3, 'TRANSPORT', 300.00, 185.00, 8, 2026),
(4, 'ENTERTAINMENT', 250.00, 210.00, 8, 2026),
(5, 'UTILITIES', 350.00, 280.00, 8, 2026),
(6, 'SHOPPING', 400.00, 310.00, 8, 2026),
(7, 'HEALTH', 200.00, 75.00, 8, 2026);

-- Initial Transactions
INSERT INTO transactions (id, title, amount, type, category, transaction_date, payment_method, notes, created_at) VALUES 
(101, 'Tech Corp Salary', 5200.00, 'INCOME', 'SALARY', '2026-08-01', 'Bank Transfer', 'Monthly salary payment', CURRENT_TIMESTAMP),
(102, 'Apartment Rent', 1450.00, 'EXPENSE', 'HOUSING', '2026-08-01', 'Bank Transfer', 'August rent', CURRENT_TIMESTAMP),
(103, 'Organic Groceries', 165.50, 'EXPENSE', 'FOOD', '2026-08-02', 'Credit Card', 'Whole Foods market', CURRENT_TIMESTAMP),
(104, 'Freelance UI Design', 850.00, 'INCOME', 'FREELANCE', '2026-08-03', 'UPI', 'Dashboard project completion', CURRENT_TIMESTAMP),
(105, 'Electric & Water Bill', 180.00, 'EXPENSE', 'UTILITIES', '2026-08-03', 'Debit Card', 'Monthly utility payment', CURRENT_TIMESTAMP),
(106, 'Gasoline / Fuel', 65.00, 'EXPENSE', 'TRANSPORT', '2026-08-04', 'Credit Card', 'Shell station refill', CURRENT_TIMESTAMP),
(107, 'Cinema & Dinner Out', 110.00, 'EXPENSE', 'ENTERTAINMENT', '2026-08-04', 'Credit Card', 'Weekend movie night', CURRENT_TIMESTAMP),
(108, 'Weekly Grocery Run', 155.00, 'EXPENSE', 'FOOD', '2026-08-05', 'Debit Card', 'Trader Joes', CURRENT_TIMESTAMP),
(109, 'New Wireless Earbuds', 140.00, 'EXPENSE', 'SHOPPING', '2026-08-05', 'Credit Card', 'Tech store purchase', CURRENT_TIMESTAMP),
(110, 'Gym Membership', 55.00, 'EXPENSE', 'HEALTH', '2026-08-06', 'Credit Card', 'Monthly fitness club fee', CURRENT_TIMESTAMP),
(111, 'Subway Pass Monthly', 120.00, 'EXPENSE', 'TRANSPORT', '2026-08-06', 'Debit Card', 'Public transit pass', CURRENT_TIMESTAMP);
