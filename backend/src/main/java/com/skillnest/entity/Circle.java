package com.skillnest.entity;

import com.skillnest.constants.AppConstants;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "circles")
public class Circle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 80)
    private String topic;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalType goalType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommitmentLevel commitment;

    @Column(nullable = false)
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CircleStatus status;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public Circle() {
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (status == null) {
            status = CircleStatus.OPEN;
        }
        if (capacity == 0) {
            capacity = AppConstants.DEFAULT_CIRCLE_CAPACITY;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public GoalType getGoalType() {
        return goalType;
    }

    public void setGoalType(GoalType goalType) {
        this.goalType = goalType;
    }

    public CommitmentLevel getCommitment() {
        return commitment;
    }

    public void setCommitment(CommitmentLevel commitment) {
        this.commitment = commitment;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public CircleStatus getStatus() {
        return status;
    }

    public void setStatus(CircleStatus status) {
        this.status = status;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
