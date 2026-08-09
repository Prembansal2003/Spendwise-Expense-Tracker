package com.spendwise.tracker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DemoDataCleanupService {

    private final JdbcTemplate jdbcTemplate;

    // Run every 1 hour (3,600,000 ms)
    @Scheduled(fixedRate = 3600000)
    public void cleanupAbandonedDemoAccounts() {
        try {
            // 1. Identify abandoned virtual demo users (IDs >= 100M).
            // A demo user is considered abandoned if their most recent transaction was created over 2 hours ago.
            String deleteAbandonedTransactions = "DELETE FROM transactions WHERE user_id IN (" +
                    "SELECT user_id FROM transactions " +
                    "WHERE user_id >= 100000000 " +
                    "GROUP BY user_id " +
                    "HAVING MAX(created_at) < NOW() - INTERVAL '2 hours')";
            
            int txDeleted = jdbcTemplate.update(deleteAbandonedTransactions);

            // 2. Once their transactions are wiped, their ID no longer exists in the transactions table.
            // We can cleanly sweep all orphaned budgets, goals, and users for IDs >= 100M.
            int budgetsDeleted = jdbcTemplate.update("DELETE FROM budgets WHERE user_id >= 100000000 AND user_id NOT IN (SELECT DISTINCT user_id FROM transactions)");
            int goalsDeleted = jdbcTemplate.update("DELETE FROM savings_goals WHERE user_id >= 100000000 AND user_id NOT IN (SELECT DISTINCT user_id FROM transactions)");
            int usersDeleted = jdbcTemplate.update("DELETE FROM users WHERE id >= 100000000 AND id NOT IN (SELECT DISTINCT user_id FROM transactions)");

            if (txDeleted > 0 || budgetsDeleted > 0 || goalsDeleted > 0 || usersDeleted > 0) {
                System.out.println(String.format("[SpendWise Cleanup] Swept abandoned demo data: %d transactions, %d budgets, %d goals, %d users.", txDeleted, budgetsDeleted, goalsDeleted, usersDeleted));
            }
        } catch (Exception e) {
            System.err.println("[SpendWise Cleanup] Failed to execute automated cleanup: " + e.getMessage());
        }
    }
}
