package com.example.emailnotification.repository;

import com.example.emailnotification.entity.Email;
import com.example.emailnotification.enums.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailRepository extends JpaRepository<Email, UUID> {
    Optional<Email> findByRecipientEmail(String recipientEmail);
    List<Email> findByStatus(EmailStatus status);
}
