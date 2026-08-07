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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public List<BudgetProgressDto> getBudgetProgressForCurrentMonth(Long userId) {
        Long targetUserId = (userId != null) ? userId : 1L;
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(targetUserId, month, year);

        // If no custom budgets exist for this user yet, seed clean default budgets (e.g. $500 cap per category)
        if (budgets.isEmpty() && !targetUserId.equals(1L) && !targetUserId.equals(101L)) {
            List<Budget> newBudgets = new ArrayList<>();
            for (Category cat : Category.values()) {
                if (cat == Category.SALARY || cat == Category.FREELANCE || cat == Category.INVESTMENT) continue;
                newBudgets.add(new Budget(null, targetUserId, cat, new BigDecimal("500.00"), BigDecimal.ZERO, "USD", month, year));
            }
            budgets = budgetRepository.saveAll(newBudgets);
        } else if (budgets.isEmpty()) {
            budgets = budgetRepository.findByMonthAndYear(month, year);
        }
        
        // Compute real-time expenses for current month per category for this user
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        List<Object[]> categoryExpenses = transactionRepository.getCategoryExpensesByDateRange(startOfMonth, endOfMonth);

        Map<Category, BigDecimal> spendMap = categoryExpenses.stream().collect(Collectors.toMap(
                row -> (Category) row[0],
                row -> (BigDecimal) row[1]
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
        Long targetUserId = (userId != null) ? userId : 1L;
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
