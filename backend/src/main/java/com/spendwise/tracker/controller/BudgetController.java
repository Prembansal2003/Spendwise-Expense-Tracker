package com.spendwise.tracker.controller;

import com.spendwise.tracker.dto.BudgetProgressDto;
import com.spendwise.tracker.model.Budget;
import com.spendwise.tracker.model.Category;
import com.spendwise.tracker.service.BudgetService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/progress")
    public ResponseEntity<List<BudgetProgressDto>> getBudgetProgress(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(budgetService.getBudgetProgressForCurrentMonth(userId));
    }

    @PostMapping
    public ResponseEntity<Budget> setBudget(@RequestParam(required = false) Long userId, @RequestBody BudgetRequest request) {
        Long targetUserId = (userId != null) ? userId : (request.getUserId() != null ? request.getUserId() : 1L);
        Budget budget = budgetService.setBudget(targetUserId, request.getCategory(), request.getMonthlyLimit(), request.getCurrency());
        return ResponseEntity.ok(budget);
    }

    @Data
    public static class BudgetRequest {
        private Long userId;
        private Category category;
        private BigDecimal monthlyLimit;
        private String currency = "USD";
    }
}
