package com.example.emailnotification.service.impl;

import com.example.emailnotification.dto.request.SendEmailRequest;
import com.example.emailnotification.dto.response.EmailResponse;
import com.example.emailnotification.entity.Email;
import com.example.emailnotification.enums.EmailStatus;
import com.example.emailnotification.repository.EmailRepository;
import com.example.emailnotification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final EmailRepository emailRepository;
    private final SendGridEmailSender emailSender;

    @Override
    public EmailResponse sendEmail(SendEmailRequest request) {

        // 1. Persist first so we get the generated UUID
        Email email = Email.builder()
                .recipientEmail(request.getRecipient())
                .subject(request.getSubject())
                .body(request.getBody())
                .status(EmailStatus.QUEUED)
                .retryCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        Email saved = emailRepository.save(email);   // UUID is assigned here
        log.info("Email saved id={} to={}", saved.getId(), saved.getRecipientEmail());

        // 2. Send immediately — update status based on result
        try {
            emailSender.sendEmail(
                    saved.getRecipientEmail(),
                    saved.getSubject(),
                    saved.getBody()
            );
            saved.setStatus(EmailStatus.SENT);
            saved.setSentAt(LocalDateTime.now());
            log.info("Email sent successfully id={}", saved.getId());
        } catch (Exception e) {
            saved.setStatus(EmailStatus.FAILED);
            saved.setErrorMessage(e.getMessage());
            log.error("Email failed id={} error={}", saved.getId(), e.getMessage());
        }

        emailRepository.save(saved);

        return EmailResponse.builder()
                .id(saved.getId())
                .status(saved.getStatus().name())
                .message(saved.getStatus() == EmailStatus.SENT
                        ? "Email sent successfully!"
                        : "Email failed: " + saved.getErrorMessage())
                .build();
    }

    @Override
    public EmailResponse retryEmail(UUID id) {
        Email email = emailRepository.findById(id).orElseThrow();
        email.setRetryCount(email.getRetryCount() + 1);
        email.setErrorMessage(null);

        try {
            emailSender.sendEmail(
                    email.getRecipientEmail(),
                    email.getSubject(),
                    email.getBody()
            );
            email.setStatus(EmailStatus.SENT);
            email.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            email.setStatus(EmailStatus.FAILED);
            email.setErrorMessage(e.getMessage());
        }

        emailRepository.save(email);

        return EmailResponse.builder()
                .id(id)
                .status(email.getStatus().name())
                .message(email.getStatus() == EmailStatus.SENT ? "Retry succeeded!" : "Retry failed: " + email.getErrorMessage())
                .build();
    }

    @Override
    public Email getEmailById(UUID id) {
        return emailRepository.findById(id).orElseThrow();
    }

    @Override
    public List<Email> getAllEmails() {
        return emailRepository.findAll();
    }
}
