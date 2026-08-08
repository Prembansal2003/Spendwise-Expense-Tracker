package com.spendwise.tracker.service;

import com.spendwise.tracker.dto.SummaryResponse;
import com.spendwise.tracker.dto.TransactionRequest;
import com.spendwise.tracker.model.Category;
import com.spendwise.tracker.model.Transaction;
import com.spendwise.tracker.model.TransactionType;
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
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final SavingsGoalService savingsGoalService;

    public List<Transaction> getAllTransactions(TransactionType type, Category category, String search, LocalDate startDate, LocalDate endDate, Long userId) {
        List<Transaction> transactions;

        // Fetch by userId first if provided, else fetch all
        if (userId != null) {
            transactions = transactionRepository.findByUserIdOrderByTransactionDateDescCreatedAtDesc(userId);
        } else {
            transactions = transactionRepository.findAllByOrderByTransactionDateDescCreatedAtDesc();
        }

        // Apply additional filters in Java
        if (type != null) {
            transactions = transactions.stream().filter(t -> type.equals(t.getType())).collect(Collectors.toList());
        }
        if (category != null) {
            transactions = transactions.stream().filter(t -> category.equals(t.getCategory())).collect(Collectors.toList());
        }
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            transactions = transactions.stream()
                    .filter(t -> (t.getTitle() != null && t.getTitle().toLowerCase().contains(q)) ||
                                 (t.getNotes() != null && t.getNotes().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }
        if (startDate != null) {
            transactions = transactions.stream().filter(t -> !t.getTransactionDate().isBefore(startDate)).collect(Collectors.toList());
        }
        if (endDate != null) {
            transactions = transactions.stream().filter(t -> !t.getTransactionDate().isAfter(endDate)).collect(Collectors.toList());
        }

        return transactions;
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    private boolean isSavingsTransaction(String title, String notes) {
        return (title != null && (title.toLowerCase().contains("savings deposit") || title.toLowerCase().contains("savings goal deposit")))
                || (notes != null && notes.contains("[GoalID:"));
    }

    public Transaction createTransaction(TransactionRequest request) {
        Transaction transaction = new Transaction();
        transaction.setUserId(request.getUserId() != null ? request.getUserId() : 1L);
        transaction.setTitle(request.getTitle());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory());
        transaction.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now());
        transaction.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Credit Card");
        transaction.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        transaction.setNotes(request.getNotes());
        Transaction saved = transactionRepository.save(transaction);
        if (isSavingsTransaction(saved.getTitle(), saved.getNotes())) {
            savingsGoalService.syncGoalFromTransaction(saved.getUserId(), saved.getTitle(), saved.getNotes(), saved.getAmount(), saved.getCurrency(), "ADD");
        }
        return saved;
    }

    public Transaction updateTransaction(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));

        BigDecimal oldAmount = transaction.getAmount();
        String oldTitle = transaction.getTitle();
        String oldNotes = transaction.getNotes();
        String oldCurrency = transaction.getCurrency();

        if (request.getUserId() != null) transaction.setUserId(request.getUserId());
        transaction.setTitle(request.getTitle());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Credit Card");
        transaction.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        transaction.setNotes(request.getNotes());

        Transaction updated = transactionRepository.save(transaction);

        boolean wasSavings = isSavingsTransaction(oldTitle, oldNotes);
        boolean isSavings = isSavingsTransaction(updated.getTitle(), updated.getNotes());

        if (wasSavings && isSavings) {
            savingsGoalService.syncGoalFromTransactionUpdate(updated.getUserId(), updated.getTitle(), updated.getNotes(), oldAmount, oldCurrency, updated.getAmount(), updated.getCurrency());
        } else if (wasSavings && !isSavings) {
            savingsGoalService.syncGoalFromTransaction(updated.getUserId(), oldTitle, oldNotes, oldAmount, oldCurrency, "DEDUCT");
        } else if (!wasSavings && isSavings) {
            savingsGoalService.syncGoalFromTransaction(updated.getUserId(), updated.getTitle(), updated.getNotes(), updated.getAmount(), updated.getCurrency(), "ADD");
        }

        return updated;
    }

    public void deleteTransaction(Long id) {
        Transaction tx = transactionRepository.findById(id).orElse(null);
        if (tx != null) {
            if (isSavingsTransaction(tx.getTitle(), tx.getNotes())) {
                savingsGoalService.syncGoalFromTransaction(tx.getUserId(), tx.getTitle(), tx.getNotes(), tx.getAmount(), tx.getCurrency(), "DEDUCT");
            }
            transactionRepository.deleteById(id);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteAllTransactionsByUserId(Long userId) {
        Long targetUserId = (userId != null) ? userId : 101L;
        Long queryId = (targetUserId.equals(101L)) ? 1L : targetUserId;
        transactionRepository.deleteByUserId(queryId);
        boolean isVirtualDemo = (targetUserId >= 100000000L && targetUserId <= 999999999L);
        if (targetUserId.equals(101L) || targetUserId.equals(1L) || isVirtualDemo) {
            List<Transaction> demoTxList = List.of(
                new Transaction(null, queryId, "Senior Software Engineer Salary", new BigDecimal("5500.00"), TransactionType.INCOME, Category.SALARY, LocalDate.parse("2026-08-01"), "Bank Transfer", "USD", "Monthly tech payroll credit", null),
                new Transaction(null, queryId, "Freelance Mobile App Contract", new BigDecimal("1200.00"), TransactionType.INCOME, Category.FREELANCE, LocalDate.parse("2026-08-02"), "UPI", "USD", "iOS app milestone completion", null),
                new Transaction(null, queryId, "Stock Dividend & ETF Yield", new BigDecimal("350.00"), TransactionType.INCOME, Category.INVESTMENT, LocalDate.parse("2026-08-03"), "Bank Transfer", "USD", "Quarterly index fund yield", null),
                new Transaction(null, queryId, "Luxury Apartment Rent", new BigDecimal("1600.00"), TransactionType.EXPENSE, Category.HOUSING, LocalDate.parse("2026-08-01"), "Bank Transfer", "USD", "Monthly housing rent payment", null),
                new Transaction(null, queryId, "Organic Groceries & Fresh Produce", new BigDecimal("215.50"), TransactionType.EXPENSE, Category.FOOD, LocalDate.parse("2026-08-02"), "Credit Card", "USD", "Whole Foods market shopping", null),
                new Transaction(null, queryId, "High-Speed Fiber & Electricity Bill", new BigDecimal("185.00"), TransactionType.EXPENSE, Category.UTILITIES, LocalDate.parse("2026-08-03"), "Debit Card", "USD", "Monthly home utility bills", null),
                new Transaction(null, queryId, "Car Gasoline Refill & Highway Tolls", new BigDecimal("85.00"), TransactionType.EXPENSE, Category.TRANSPORT, LocalDate.parse("2026-08-04"), "Credit Card", "USD", "Shell station fuel refill", null),
                new Transaction(null, queryId, "Concert Tickets & Fine Dining", new BigDecimal("145.00"), TransactionType.EXPENSE, Category.ENTERTAINMENT, LocalDate.parse("2026-08-04"), "Credit Card", "USD", "Weekend concert & restaurant dining", null),
                new Transaction(null, queryId, "4K UltraHD Monitor & Tech Gear", new BigDecimal("320.00"), TransactionType.EXPENSE, Category.SHOPPING, LocalDate.parse("2026-08-05"), "Credit Card", "USD", "Workstation upgrade", null),
                new Transaction(null, queryId, "Annual Comprehensive Health Checkup", new BigDecimal("150.00"), TransactionType.EXPENSE, Category.HEALTH, LocalDate.parse("2026-08-06"), "Credit Card", "USD", "Wellness clinic health checkup", null),
                new Transaction(null, queryId, "Professional Tech Books & Courses", new BigDecimal("75.00"), TransactionType.EXPENSE, Category.OTHER, LocalDate.parse("2026-08-06"), "UPI", "USD", "Software development learning course", null)
            );
            transactionRepository.saveAll(demoTxList);
        }
    }

    public SummaryResponse getSummary() {
        BigDecimal totalIncome = Optional.ofNullable(transactionRepository.sumAmountByType(TransactionType.INCOME)).orElse(BigDecimal.ZERO);
        BigDecimal totalExpenses = Optional.ofNullable(transactionRepository.sumAmountByType(TransactionType.EXPENSE)).orElse(BigDecimal.ZERO);
        BigDecimal totalBalance = totalIncome.subtract(totalExpenses);

        Double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = totalIncome.subtract(totalExpenses)
                    .divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        List<Object[]> categoryTotals = transactionRepository.getCategoryExpenseTotals();
        String topCategory = categoryTotals.isEmpty() ? "N/A" : ((Category) categoryTotals.get(0)[0]).getDisplayName();

        return SummaryResponse.builder()
                .totalBalance(totalBalance)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .savingsRatePercentage(savingsRate)
                .topSpendingCategory(topCategory)
                .transactionCount(transactionRepository.count())
                .build();
    }

    public Map<String, Object> getCategoryBreakdown() {
        List<Object[]> categoryTotals = transactionRepository.getCategoryExpenseTotals();
        BigDecimal totalExpense = Optional.ofNullable(transactionRepository.sumAmountByType(TransactionType.EXPENSE)).orElse(BigDecimal.ONE);
        if (totalExpense.compareTo(BigDecimal.ZERO) == 0) totalExpense = BigDecimal.ONE;

        List<Map<String, Object>> breakdown = new ArrayList<>();
        for (Object[] row : categoryTotals) {
            Category cat = (Category) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            double pct = amount.divide(totalExpense, 4, RoundingMode.HALF_UP).doubleValue() * 100;
            Map<String, Object> item = new HashMap<>();
            item.put("category", cat.name());
            item.put("displayName", cat.getDisplayName());
            item.put("icon", cat.getIcon());
            item.put("amount", amount);
            item.put("percentage", Math.round(pct * 10.0) / 10.0);
            breakdown.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("breakdown", breakdown);
        return result;
    }
}
