package com.spendwise.tracker.repository;

import com.spendwise.tracker.model.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

    List<SavingsGoal> findByUserId(Long userId);

    Optional<SavingsGoal> findByUserIdAndId(Long userId, Long id);

    @Query("SELECT g FROM SavingsGoal g WHERE g.userId = :userId AND LOWER(g.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<SavingsGoal> findByUserIdAndTitleMatching(@Param("userId") Long userId, @Param("title") String title);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUserId(Long userId);
}
