package com.skillnest.repository;

import com.skillnest.entity.Resource;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findBySubGroupId(Long subGroupId);
}
