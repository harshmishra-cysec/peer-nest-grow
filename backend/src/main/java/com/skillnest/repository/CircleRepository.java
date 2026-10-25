package com.skillnest.repository;

import com.skillnest.entity.Circle;
import com.skillnest.entity.CircleStatus;
import com.skillnest.entity.CommitmentLevel;
import com.skillnest.entity.GoalType;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CircleRepository extends JpaRepository<Circle, Long> {

    List<Circle> findByStatus(CircleStatus status);

    Optional<Circle> findByName(String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Circle c WHERE c.id = :id")
    Optional<Circle> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT c FROM Circle c
            WHERE c.status = com.skillnest.entity.CircleStatus.OPEN
              AND c.deadline >= :today
              AND (SELECT COUNT(m) FROM CircleMember m WHERE m.circle = c) < c.capacity
            ORDER BY
              ((CASE WHEN c.topic = :topic THEN 10 ELSE 0 END)
               + (CASE WHEN c.goalType = :goalType THEN 2 ELSE 0 END)
               + (CASE WHEN c.commitment = :commitment THEN 1 ELSE 0 END)) DESC,
              c.deadline ASC
            """)
    List<Circle> findRecommended(
            @Param("topic") String topic,
            @Param("goalType") GoalType goalType,
            @Param("commitment") CommitmentLevel commitment,
            @Param("today") LocalDate today,
            Pageable pageable
    );
}
