package com.skillnest.repository;

import com.skillnest.entity.Message;
import java.util.List;
import java.time.Instant;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySubGroupIdOrderBySentAtAsc(Long subGroupId);

    List<Message> findBySubGroupIdOrderBySentAtDesc(Long subGroupId, Pageable pageable);

    List<Message> findBySubGroupIdAndSentAtAfterOrderBySentAtAsc(Long subGroupId, Instant since);
}
