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
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/progress")
    public ResponseEntity<List<BudgetProgressDto>> getBudgetProgress() {
        return ResponseEntity.ok(budgetService.getBudgetProgressForCurrentMonth());
    }

    @PostMapping
    public ResponseEntity<Budget> setBudget(@RequestBody BudgetRequest request) {
        Budget budget = budgetService.setBudget(request.getCategory(), request.getMonthlyLimit());
        return ResponseEntity.ok(budget);
    }

    @Data
    public static class BudgetRequest {
        private Category category;
        private BigDecimal monthlyLimit;
    }
}
