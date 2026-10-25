package com.skillnest.repository;

import com.skillnest.entity.Report;
import com.skillnest.entity.ReportStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByStatus(ReportStatus status);
}
