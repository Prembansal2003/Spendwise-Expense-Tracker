package com.spendwise.tracker.config;

import com.spendwise.tracker.model.*;
import com.spendwise.tracker.repository.BudgetRepository;
import com.spendwise.tracker.repository.TransactionRepository;
import com.spendwise.tracker.repository.UserRepository;
import com.spendwise.tracker.util.PasswordEncoderUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Initial User if empty
        if (userRepository.count() == 0) {
            User demoUser = new User();
            demoUser.setName("Alex Morgan");
            demoUser.setEmail("alex.morgan@spendwise.io");
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
                    new Budget(null, Category.FOOD, new BigDecimal("600.00"), new BigDecimal("420.50"), month, year),
                    new Budget(null, Category.HOUSING, new BigDecimal("1500.00"), new BigDecimal("1450.00"), month, year),
                    new Budget(null, Category.TRANSPORT, new BigDecimal("300.00"), new BigDecimal("185.00"), month, year),
                    new Budget(null, Category.ENTERTAINMENT, new BigDecimal("250.00"), new BigDecimal("210.00"), month, year),
                    new Budget(null, Category.UTILITIES, new BigDecimal("350.00"), new BigDecimal("280.00"), month, year),
                    new Budget(null, Category.SHOPPING, new BigDecimal("400.00"), new BigDecimal("310.00"), month, year),
                    new Budget(null, Category.HEALTH, new BigDecimal("200.00"), new BigDecimal("75.00"), month, year)
            ));
        }

        // 3. Seed Initial Transactions if empty
        if (transactionRepository.count() == 0) {
            transactionRepository.saveAll(List.of(
                    new Transaction(null, "Tech Corp Salary", new BigDecimal("5200.00"), TransactionType.INCOME, Category.SALARY, LocalDate.now().minusDays(5), "Bank Transfer", "Monthly salary payment", null),
                    new Transaction(null, "Apartment Rent", new BigDecimal("1450.00"), TransactionType.EXPENSE, Category.HOUSING, LocalDate.now().minusDays(5), "Bank Transfer", "August rent", null),
                    new Transaction(null, "Organic Groceries", new BigDecimal("165.50"), TransactionType.EXPENSE, Category.FOOD, LocalDate.now().minusDays(4), "Credit Card", "Whole Foods market", null),
                    new Transaction(null, "Freelance UI Design", new BigDecimal("850.00"), TransactionType.INCOME, Category.FREELANCE, LocalDate.now().minusDays(3), "UPI", "Dashboard project completion", null),
                    new Transaction(null, "Electric & Water Bill", new BigDecimal("180.00"), TransactionType.EXPENSE, Category.UTILITIES, LocalDate.now().minusDays(3), "Debit Card", "Monthly utility payment", null),
                    new Transaction(null, "Gasoline / Fuel", new BigDecimal("65.00"), TransactionType.EXPENSE, Category.TRANSPORT, LocalDate.now().minusDays(2), "Credit Card", "Shell station refill", null),
                    new Transaction(null, "Cinema & Dinner Out", new BigDecimal("110.00"), TransactionType.EXPENSE, Category.ENTERTAINMENT, LocalDate.now().minusDays(2), "Credit Card", "Weekend movie night", null),
                    new Transaction(null, "Weekly Grocery Run", new BigDecimal("155.00"), TransactionType.EXPENSE, Category.FOOD, LocalDate.now().minusDays(1), "Debit Card", "Trader Joes", null),
                    new Transaction(null, "Wireless Earbuds", new BigDecimal("140.00"), TransactionType.EXPENSE, Category.SHOPPING, LocalDate.now().minusDays(1), "Credit Card", "Tech store purchase", null),
                    new Transaction(null, "Gym Membership", new BigDecimal("55.00"), TransactionType.EXPENSE, Category.HEALTH, LocalDate.now(), "Credit Card", "Monthly fitness club fee", null)
            ));
        }
    }
}
