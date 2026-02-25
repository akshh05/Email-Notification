package com.example.emailnotification.repository;

import com.example.emailnotification.entity.EmailActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<EmailActivityLog, Long> {
    List<EmailActivityLog> findByEmailId(UUID emailId);
}
