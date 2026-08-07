package com.spendwise.tracker.controller;

import com.spendwise.tracker.dto.SavingsGoalRequest;
import com.spendwise.tracker.model.SavingsGoal;
import com.spendwise.tracker.service.SavingsGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/savings-goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    public ResponseEntity<List<SavingsGoal>> getGoals(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(savingsGoalService.getGoalsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<SavingsGoal> createGoal(@Valid @RequestBody SavingsGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(savingsGoalService.createGoal(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoal> updateGoal(@PathVariable Long id, @Valid @RequestBody SavingsGoalRequest request) {
        return ResponseEntity.ok(savingsGoalService.updateGoal(id, request));
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<SavingsGoal> depositToGoal(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BigDecimal amount = BigDecimal.ZERO;
        if (body.containsKey("amount") && body.get("amount") != null) {
            amount = new BigDecimal(body.get("amount").toString());
        }
        return ResponseEntity.ok(savingsGoalService.depositToGoal(id, amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        savingsGoalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
