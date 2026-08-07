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
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));

        if (request.getUserId() != null) transaction.setUserId(request.getUserId());
        transaction.setTitle(request.getTitle());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Credit Card");
        transaction.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        transaction.setNotes(request.getNotes());
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new RuntimeException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
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
