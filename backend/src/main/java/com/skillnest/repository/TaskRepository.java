package com.skillnest.repository;

import com.skillnest.entity.Task;
import com.skillnest.entity.TaskStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findBySubGroupId(Long subGroupId);

    long countByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);

    long countBySubGroupIdAndStatus(Long subGroupId, TaskStatus status);

    long countBySubGroupId(Long subGroupId);
}
