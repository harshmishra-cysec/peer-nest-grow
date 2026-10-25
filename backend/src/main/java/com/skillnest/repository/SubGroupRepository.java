package com.skillnest.repository;

import com.skillnest.entity.SubGroup;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubGroupRepository extends JpaRepository<SubGroup, Long> {

    List<SubGroup> findByCircleId(Long circleId);
}
