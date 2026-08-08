package com.spendwise.tracker.service;

import com.spendwise.tracker.dto.BudgetProgressDto;
import com.spendwise.tracker.model.Budget;
import com.spendwise.tracker.model.Category;
import com.spendwise.tracker.repository.BudgetRepository;
import com.spendwise.tracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    private BigDecimal getDefaultLimitForCategory(Category category, Long userId) {
        boolean isDemo = (userId != null && (userId.equals(1L) || userId.equals(101L) || (userId >= 100000000L && userId <= 999999999L)));
        if (!isDemo) {
            return new BigDecimal("500.00");
        }
        switch (category) {
            case FOOD: return new BigDecimal("600.00");
            case HOUSING: return new BigDecimal("1800.00");
            case TRANSPORT: return new BigDecimal("300.00");
            case ENTERTAINMENT: return new BigDecimal("250.00");
            case UTILITIES: return new BigDecimal("350.00");
            case SHOPPING: return new BigDecimal("400.00");
            case HEALTH: return new BigDecimal("250.00");
            case OTHER: return new BigDecimal("200.00");
            default: return new BigDecimal("500.00");
        }
    }

    public List<BudgetProgressDto> getBudgetProgressForCurrentMonth(Long userId) {
        Long rawUserId = (userId != null) ? userId : 1L;
        // Normalize 101L to 1L for demo user account consistency
        Long targetUserId = (rawUserId.equals(101L)) ? 1L : rawUserId;

        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        // 1. Fetch budgets strictly scoped by targetUserId
        List<Budget> rawBudgets = budgetRepository.findByUserIdAndMonthAndYear(targetUserId, month, year);

        // 2. Seed clean default budgets if user has no records yet
        if (rawBudgets.isEmpty()) {
            List<Budget> newBudgets = new ArrayList<>();
            for (Category cat : Category.values()) {
                if (cat == Category.SALARY || cat == Category.FREELANCE || cat == Category.INVESTMENT) continue;
                BigDecimal defaultCap = getDefaultLimitForCategory(cat, targetUserId);
                newBudgets.add(new Budget(null, targetUserId, cat, defaultCap, BigDecimal.ZERO, "USD", month, year));
            }
            rawBudgets = budgetRepository.saveAll(newBudgets);
        }

        // 3. Deduplicate by Category to ensure EXACTLY 1 card per category
        Map<Category, Budget> uniqueBudgetMap = new LinkedHashMap<>();
        for (Budget b : rawBudgets) {
            uniqueBudgetMap.put(b.getCategory(), b);
        }
        List<Budget> budgets = new ArrayList<>(uniqueBudgetMap.values());

        // 4. Compute real-time expenses for current month per category FOR THIS SPECIFIC USER ONLY
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        List<Object[]> categoryExpenses = transactionRepository.getCategoryExpensesByUserIdAndDateRange(targetUserId, startOfMonth, endOfMonth);

        Map<Category, BigDecimal> spendMap = categoryExpenses.stream().collect(Collectors.toMap(
                row -> (Category) row[0],
                row -> (BigDecimal) row[1],
                BigDecimal::add
        ));

        List<BudgetProgressDto> progressList = new ArrayList<>();

        for (Budget b : budgets) {
            BigDecimal actualSpend = spendMap.getOrDefault(b.getCategory(), BigDecimal.ZERO);
            BigDecimal limit = b.getMonthlyLimit();
            BigDecimal remaining = limit.subtract(actualSpend);

            double usedPct = 0.0;
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                usedPct = actualSpend.divide(limit, 4, RoundingMode.HALF_UP).doubleValue() * 100;
            }

            String status = "NORMAL";
            if (usedPct > 100) {
                status = "EXCEEDED";
            } else if (usedPct >= 80) {
                status = "WARNING";
            }

            progressList.add(BudgetProgressDto.builder()
                    .id(b.getId())
                    .category(b.getCategory())
                    .categoryDisplayName(b.getCategory().getDisplayName())
                    .categoryIcon(b.getCategory().getIcon())
                    .monthlyLimit(limit)
                    .currentSpend(actualSpend)
                    .remainingAmount(remaining)
                    .percentageUsed(Math.round(usedPct * 10.0) / 10.0)
                    .status(status)
                    .currency(b.getCurrency() != null ? b.getCurrency() : "USD")
                    .build());
        }

        return progressList;
    }

    public Budget setBudget(Long userId, Category category, BigDecimal monthlyLimit, String currency) {
        Long rawUserId = (userId != null) ? userId : 1L;
        Long targetUserId = (rawUserId.equals(101L)) ? 1L : rawUserId;

        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        Optional<Budget> existing = budgetRepository.findByUserIdAndCategoryAndMonthAndYear(targetUserId, category, month, year);
        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setMonthlyLimit(monthlyLimit);
            if (currency != null && !currency.isBlank()) {
                budget.setCurrency(currency);
            }
        } else {
            budget = new Budget();
            budget.setUserId(targetUserId);
            budget.setCategory(category);
            budget.setMonthlyLimit(monthlyLimit);
            budget.setCurrency(currency != null ? currency : "USD");
            budget.setMonth(month);
            budget.setYear(year);
        }
        return budgetRepository.save(budget);
    }
}
