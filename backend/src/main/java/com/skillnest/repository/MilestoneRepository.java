package com.skillnest.repository;

import com.skillnest.entity.Milestone;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findBySubGroupId(Long subGroupId);
}
