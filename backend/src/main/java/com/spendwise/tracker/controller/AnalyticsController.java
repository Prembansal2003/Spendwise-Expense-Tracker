package com.spendwise.tracker.controller;

import com.spendwise.tracker.dto.SummaryResponse;
import com.spendwise.tracker.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final TransactionService transactionService;

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary() {
        return ResponseEntity.ok(transactionService.getSummary());
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<Map<String, Object>> getCategoryBreakdown() {
        return ResponseEntity.ok(transactionService.getCategoryBreakdown());
    }
}
