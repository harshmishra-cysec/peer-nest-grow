package com.skillnest.repository;

import com.skillnest.entity.SubGroupMember;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubGroupMemberRepository extends JpaRepository<SubGroupMember, Long> {

    boolean existsBySubGroupIdAndUserId(Long subGroupId, Long userId);

    List<SubGroupMember> findBySubGroupId(Long subGroupId);
}
