package com.spendwise.tracker.repository;

import com.spendwise.tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO users (id, name, email, password, role, avatar_url, created_at) VALUES (:id, :name, :email, :password, :role, :avatarUrl, CURRENT_TIMESTAMP)", nativeQuery = true)
    void insertUserWithId(@Param("id") Long id, @Param("name") String name, @Param("email") String email, @Param("password") String password, @Param("role") String role, @Param("avatarUrl") String avatarUrl);
}
