package com.spendwise.tracker.config;

import com.spendwise.tracker.model.*;
import com.spendwise.tracker.repository.BudgetRepository;
import com.spendwise.tracker.repository.SavingsGoalRepository;
import com.spendwise.tracker.repository.TransactionRepository;
import com.spendwise.tracker.repository.UserRepository;
import com.spendwise.tracker.util.PasswordEncoderUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final SavingsGoalRepository savingsGoalRepository;

    @Override
    public void run(String... args) throws Exception {
        // 0. Ensure user_id and currency columns exist on pre-existing PostgreSQL tables
        try {
            jdbcTemplate.execute("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id BIGINT DEFAULT 1");
            jdbcTemplate.execute("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(20) DEFAULT 'USD'");
            jdbcTemplate.execute("ALTER TABLE transactions ALTER COLUMN currency TYPE VARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id BIGINT DEFAULT 1");
            jdbcTemplate.execute("ALTER TABLE budgets ADD COLUMN IF NOT EXISTS currency VARCHAR(20) DEFAULT 'USD'");
            jdbcTemplate.execute("ALTER TABLE budgets ADD COLUMN IF NOT EXISTS month INT DEFAULT 8");
            jdbcTemplate.execute("ALTER TABLE budgets ADD COLUMN IF NOT EXISTS year INT DEFAULT 2026");
            jdbcTemplate.execute("ALTER TABLE budgets ALTER COLUMN currency TYPE VARCHAR(20)");
        } catch (Exception e) {
            System.err.println("Schema alter check: " + e.getMessage());
        }

        // 1. Seed Initial User if empty
        if (userRepository.count() == 0) {
            User demoUser = new User();
            demoUser.setName("Prem Agrawal");
            demoUser.setEmail("agrawalprem00@gmail.com");
            demoUser.setPassword(PasswordEncoderUtil.encode("password123"));
            demoUser.setRole("PRO_MEMBER");
            demoUser.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80");
            userRepository.save(demoUser);
        }

        // 2. Seed Initial Budgets if empty
        if (budgetRepository.count() == 0) {
            LocalDate now = LocalDate.now();
            int month = now.getMonthValue();
            int year = now.getYear();

            budgetRepository.saveAll(List.of(
                    new Budget(null, 1L, Category.FOOD, new BigDecimal("600.00"), new BigDecimal("215.50"), "USD", month, year),
                    new Budget(null, 1L, Category.HOUSING, new BigDecimal("1800.00"), new BigDecimal("1600.00"), "USD", month, year),
                    new Budget(null, 1L, Category.TRANSPORT, new BigDecimal("300.00"), new BigDecimal("85.00"), "USD", month, year),
                    new Budget(null, 1L, Category.ENTERTAINMENT, new BigDecimal("250.00"), new BigDecimal("145.00"), "USD", month, year),
                    new Budget(null, 1L, Category.UTILITIES, new BigDecimal("350.00"), new BigDecimal("185.00"), "USD", month, year),
                    new Budget(null, 1L, Category.SHOPPING, new BigDecimal("400.00"), new BigDecimal("320.00"), "USD", month, year),
                    new Budget(null, 1L, Category.HEALTH, new BigDecimal("250.00"), new BigDecimal("150.00"), "USD", month, year),
                    new Budget(null, 1L, Category.OTHER, new BigDecimal("200.00"), new BigDecimal("75.00"), "USD", month, year)
            ));
        }

        // 3. Seed Initial Transactions if empty (covering ALL categories)
        // Transaction constructor field order: (id, userId, title, amount, type, category, transactionDate, paymentMethod, currency, notes, createdAt)
        if (transactionRepository.count() == 0) {
            transactionRepository.saveAll(List.of(
                    new Transaction(null, 1L, "Senior Software Engineer Salary", new BigDecimal("5500.00"), TransactionType.INCOME, Category.SALARY, LocalDate.now().minusDays(6), "Bank Transfer", "USD", "Monthly tech payroll credit", null),
                    new Transaction(null, 1L, "Freelance Mobile App Contract", new BigDecimal("1200.00"), TransactionType.INCOME, Category.FREELANCE, LocalDate.now().minusDays(5), "UPI", "USD", "iOS app milestone completion", null),
                    new Transaction(null, 1L, "Stock Dividend & ETF Yield", new BigDecimal("350.00"), TransactionType.INCOME, Category.INVESTMENT, LocalDate.now().minusDays(4), "Bank Transfer", "USD", "Quarterly index fund yield", null),
                    new Transaction(null, 1L, "Luxury Apartment Rent", new BigDecimal("1600.00"), TransactionType.EXPENSE, Category.HOUSING, LocalDate.now().minusDays(5), "Bank Transfer", "USD", "Monthly housing rent payment", null),
                    new Transaction(null, 1L, "Organic Groceries & Fresh Produce", new BigDecimal("215.50"), TransactionType.EXPENSE, Category.FOOD, LocalDate.now().minusDays(4), "Credit Card", "USD", "Whole Foods market shopping", null),
                    new Transaction(null, 1L, "High-Speed Fiber & Electricity Bill", new BigDecimal("185.00"), TransactionType.EXPENSE, Category.UTILITIES, LocalDate.now().minusDays(3), "Debit Card", "USD", "Monthly home utility bills", null),
                    new Transaction(null, 1L, "Car Gasoline Refill & Highway Tolls", new BigDecimal("85.00"), TransactionType.EXPENSE, Category.TRANSPORT, LocalDate.now().minusDays(3), "Credit Card", "USD", "Shell station fuel refill", null),
                    new Transaction(null, 1L, "Concert Tickets & Fine Dining", new BigDecimal("145.00"), TransactionType.EXPENSE, Category.ENTERTAINMENT, LocalDate.now().minusDays(2), "Credit Card", "USD", "Weekend concert & dining", null),
                    new Transaction(null, 1L, "4K UltraHD Monitor & Tech Gear", new BigDecimal("320.00"), TransactionType.EXPENSE, Category.SHOPPING, LocalDate.now().minusDays(2), "Credit Card", "USD", "Workstation upgrade", null),
                    new Transaction(null, 1L, "Annual Comprehensive Health Checkup", new BigDecimal("150.00"), TransactionType.EXPENSE, Category.HEALTH, LocalDate.now().minusDays(1), "Credit Card", "USD", "Wellness clinic checkup", null),
                    new Transaction(null, 1L, "Professional Tech Books & Courses", new BigDecimal("75.00"), TransactionType.EXPENSE, Category.OTHER, LocalDate.now(), "UPI", "USD", "Software development learning course", null)
            ));
        }

        // 4. Seed Initial Savings Goals if table is empty
        if (savingsGoalRepository.count() == 0) {
            SavingsGoal g1 = new SavingsGoal();
            g1.setUserId(1L);
            g1.setTitle("🏖️ Summer Vacation");
            g1.setTargetAmount(new BigDecimal("2000.00"));
            g1.setSavedAmount(BigDecimal.ZERO);
            g1.setCurrency("USD");

            SavingsGoal g2 = new SavingsGoal();
            g2.setUserId(1L);
            g2.setTitle("💻 New Work Laptop");
            g2.setTargetAmount(new BigDecimal("2400.00"));
            g2.setSavedAmount(BigDecimal.ZERO);
            g2.setCurrency("USD");

            SavingsGoal g3 = new SavingsGoal();
            g3.setUserId(1L);
            g3.setTitle("🛡️ Emergency Fund");
            g3.setTargetAmount(new BigDecimal("5000.00"));
            g3.setSavedAmount(BigDecimal.ZERO);
            g3.setCurrency("USD");

            savingsGoalRepository.saveAll(List.of(g1, g2, g3));
        }
    }
}
