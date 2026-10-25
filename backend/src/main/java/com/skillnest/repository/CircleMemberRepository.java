package com.skillnest.repository;

import com.skillnest.entity.CircleMember;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CircleMemberRepository extends JpaRepository<CircleMember, Long> {

    boolean existsByCircleIdAndUserId(Long circleId, Long userId);

    long countByCircleId(Long circleId);

    long countByUserId(Long userId);

    List<CircleMember> findByCircleId(Long circleId);

    Optional<CircleMember> findByCircleIdAndUserId(Long circleId, Long userId);

    List<CircleMember> findByUserId(Long userId);
}
