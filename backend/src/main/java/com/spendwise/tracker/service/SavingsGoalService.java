package com.spendwise.tracker.service;

import com.spendwise.tracker.dto.SavingsGoalRequest;
import com.spendwise.tracker.model.SavingsGoal;
import com.spendwise.tracker.repository.SavingsGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;

    public List<SavingsGoal> getGoalsByUserId(Long userId) {
        Long targetUserId = (userId != null && (userId.equals(101L) || userId.equals(1L))) ? 1L : userId;
        if (targetUserId == null) targetUserId = 1L;
        return savingsGoalRepository.findByUserId(targetUserId);
    }

    @Transactional
    public SavingsGoal createGoal(SavingsGoalRequest request) {
        Long targetUserId = (request.getUserId() != null && (request.getUserId().equals(101L) || request.getUserId().equals(1L))) ? 1L : request.getUserId();
        if (targetUserId == null) targetUserId = 1L;

        SavingsGoal goal = new SavingsGoal();
        goal.setUserId(targetUserId);
        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount() != null ? request.getTargetAmount() : new BigDecimal("5000.00"));
        goal.setSavedAmount(request.getSavedAmount() != null ? request.getSavedAmount() : BigDecimal.ZERO);
        goal.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");

        return savingsGoalRepository.save(goal);
    }

    @Transactional
    public SavingsGoal updateGoal(Long id, SavingsGoalRequest request) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings Goal not found with id: " + id));

        if (request.getTitle() != null) goal.setTitle(request.getTitle());
        if (request.getTargetAmount() != null) goal.setTargetAmount(request.getTargetAmount());
        if (request.getSavedAmount() != null) goal.setSavedAmount(request.getSavedAmount());
        if (request.getCurrency() != null) goal.setCurrency(request.getCurrency());

        return savingsGoalRepository.save(goal);
    }

    @Transactional
    public SavingsGoal depositToGoal(Long goalId, BigDecimal amount) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Savings Goal not found with id: " + goalId));

        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            goal.setSavedAmount(goal.getSavedAmount().add(amount));
        }
        return savingsGoalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(Long id) {
        savingsGoalRepository.deleteById(id);
    }

    @Transactional
    public void syncGoalFromTransaction(Long userId, String txTitle, String txNotes, BigDecimal amount, String action) {
        if (amount == null || txTitle == null) return;
        Long targetUserId = (userId != null && (userId.equals(101L) || userId.equals(1L))) ? 1L : userId;
        if (targetUserId == null) targetUserId = 1L;

        String searchTitle = txTitle.replaceAll("(?i)^Savings Deposit:", "")
                .replaceAll("(?i)^Savings Goal Deposit:", "")
                .replaceAll("[^a-zA-Z0-9\\s]", "").trim();

        if (searchTitle.isBlank()) return;

        List<SavingsGoal> matchingGoals = savingsGoalRepository.findByUserIdAndTitleMatching(targetUserId, searchTitle);
        if (!matchingGoals.isEmpty()) {
            SavingsGoal goal = matchingGoals.get(0);
            BigDecimal currentSaved = goal.getSavedAmount() != null ? goal.getSavedAmount() : BigDecimal.ZERO;
            if ("CREATE".equalsIgnoreCase(action) || "ADD".equalsIgnoreCase(action)) {
                goal.setSavedAmount(currentSaved.add(amount));
            } else if ("DELETE".equalsIgnoreCase(action) || "DEDUCT".equalsIgnoreCase(action)) {
                BigDecimal newSaved = currentSaved.subtract(amount);
                goal.setSavedAmount(newSaved.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newSaved);
            }
            savingsGoalRepository.save(goal);
        }
    }

    @Transactional
    public void syncGoalFromTransactionUpdate(Long userId, String txTitle, BigDecimal oldAmount, BigDecimal newAmount) {
        if (txTitle == null) return;
        Long targetUserId = (userId != null && (userId.equals(101L) || userId.equals(1L))) ? 1L : userId;
        if (targetUserId == null) targetUserId = 1L;

        String searchTitle = txTitle.replaceAll("(?i)^Savings Deposit:", "")
                .replaceAll("(?i)^Savings Goal Deposit:", "")
                .replaceAll("[^a-zA-Z0-9\\s]", "").trim();

        if (searchTitle.isBlank()) return;

        List<SavingsGoal> matchingGoals = savingsGoalRepository.findByUserIdAndTitleMatching(targetUserId, searchTitle);
        if (!matchingGoals.isEmpty()) {
            SavingsGoal goal = matchingGoals.get(0);
            BigDecimal currentSaved = goal.getSavedAmount() != null ? goal.getSavedAmount() : BigDecimal.ZERO;
            BigDecimal diff = (newAmount != null ? newAmount : BigDecimal.ZERO).subtract(oldAmount != null ? oldAmount : BigDecimal.ZERO);
            BigDecimal newSaved = currentSaved.add(diff);
            goal.setSavedAmount(newSaved.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newSaved);
            savingsGoalRepository.save(goal);
        }
    }
}
