package com.skillnest.repository;

import com.skillnest.entity.User;
import java.util.Optional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByLastActivityDateIsNullOrLastActivityDateBefore(LocalDate date);
}
