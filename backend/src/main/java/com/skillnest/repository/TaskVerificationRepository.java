package com.skillnest.repository;

import com.skillnest.entity.TaskVerification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskVerificationRepository extends JpaRepository<TaskVerification, Long> {

    List<TaskVerification> findByTaskId(Long taskId);

    boolean existsByTaskIdAndVerifiedById(Long taskId, Long userId);
}
