package com.example.emailnotification.service;

import com.example.emailnotification.dto.request.SendEmailRequest;
import com.example.emailnotification.dto.response.EmailResponse;
import com.example.emailnotification.entity.Email;
import com.example.emailnotification.enums.EmailStatus;
import com.example.emailnotification.repository.EmailRepository;
import com.example.emailnotification.service.impl.EmailServiceImpl;
import com.example.emailnotification.service.impl.SendGridEmailSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService Unit Tests")
class EmailServiceImplTest {

    @Mock private EmailRepository emailRepository;
    @Mock private SendGridEmailSender emailSender;   // ← matches new EmailServiceImpl
    @InjectMocks private EmailServiceImpl emailService;

    private UUID testId;
    private Email sentEmail;   // what repo returns after first save (QUEUED)
    private Email savedEmail;  // what repo returns after second save (SENT)

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();

        sentEmail = Email.builder()
                .id(testId)
                .recipientEmail("test@example.com")
                .subject("Test Subject")
                .body("Test Body")
                .status(EmailStatus.QUEUED)
                .retryCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        savedEmail = Email.builder()
                .id(testId)
                .recipientEmail("test@example.com")
                .subject("Test Subject")
                .body("Test Body")
                .status(EmailStatus.SENT)
                .retryCount(0)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ── sendEmail ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("sendEmail: saves then sends → status SENT")
    void sendEmail_success() throws IOException {
        // First save returns QUEUED email with ID, second save returns SENT
        when(emailRepository.save(any(Email.class)))
                .thenReturn(sentEmail)
                .thenReturn(savedEmail);
        doNothing().when(emailSender).sendEmail(any(), any(), any());

        EmailResponse response = emailService.sendEmail(
                SendEmailRequest.builder()
                        .recipient("test@example.com")
                        .subject("Test Subject")
                        .body("Test Body")
                        .build()
        );

        verify(emailSender).sendEmail("test@example.com", "Test Subject", "Test Body");
        verify(emailRepository, times(2)).save(any());
        assertThat(response.getStatus()).isEqualTo("SENT");
        assertThat(response.getId()).isEqualTo(testId);
    }

    @Test
    @DisplayName("sendEmail: sender throws → status FAILED saved to DB")
    void sendEmail_senderFails() throws IOException {
        when(emailRepository.save(any(Email.class))).thenReturn(sentEmail);
        doThrow(new IOException("Connection refused"))
                .when(emailSender).sendEmail(any(), any(), any());

        EmailResponse response = emailService.sendEmail(
                SendEmailRequest.builder()
                        .recipient("test@example.com")
                        .subject("Test Subject")
                        .body("Test Body")
                        .build()
        );

        // Should save twice — once QUEUED, once FAILED
        verify(emailRepository, times(2)).save(any());
        assertThat(response.getStatus()).isEqualTo("FAILED");
        assertThat(response.getMessage()).contains("failed");
    }

    @Test
    @DisplayName("sendEmail: builds email with correct fields before saving")
    void sendEmail_correctFields() throws IOException {
        when(emailRepository.save(any(Email.class))).thenReturn(sentEmail);
        doNothing().when(emailSender).sendEmail(any(), any(), any());

        emailService.sendEmail(
                SendEmailRequest.builder()
                        .recipient("a@b.com")
                        .subject("Hello")
                        .body("World")
                        .build()
        );

        ArgumentCaptor<Email> captor = ArgumentCaptor.forClass(Email.class);
        verify(emailRepository, atLeastOnce()).save(captor.capture());
        Email first = captor.getAllValues().get(0);
        assertThat(first.getRecipientEmail()).isEqualTo("a@b.com");
        assertThat(first.getSubject()).isEqualTo("Hello");
        assertThat(first.getStatus()).isEqualTo(EmailStatus.QUEUED);
        assertThat(first.getRetryCount()).isZero();
    }

    // ── retryEmail ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("retryEmail: increments retryCount and marks SENT on success")
    void retryEmail_success() throws IOException {
        sentEmail.setStatus(EmailStatus.FAILED);
        sentEmail.setRetryCount(1);

        when(emailRepository.findById(testId)).thenReturn(Optional.of(sentEmail));
        when(emailRepository.save(any())).thenReturn(sentEmail);
        doNothing().when(emailSender).sendEmail(any(), any(), any());

        EmailResponse response = emailService.retryEmail(testId);

        ArgumentCaptor<Email> captor = ArgumentCaptor.forClass(Email.class);
        verify(emailRepository).save(captor.capture());
        assertThat(captor.getValue().getRetryCount()).isEqualTo(2);
        assertThat(captor.getValue().getStatus()).isEqualTo(EmailStatus.SENT);
        assertThat(response.getStatus()).isEqualTo("SENT");
    }

    @Test
    @DisplayName("retryEmail: marks FAILED when sender throws")
    void retryEmail_fails() throws IOException {
        sentEmail.setStatus(EmailStatus.FAILED);
        when(emailRepository.findById(testId)).thenReturn(Optional.of(sentEmail));
        when(emailRepository.save(any())).thenReturn(sentEmail);
        doThrow(new IOException("SMTP error")).when(emailSender).sendEmail(any(), any(), any());

        EmailResponse response = emailService.retryEmail(testId);

        assertThat(response.getStatus()).isEqualTo("FAILED");
    }

    @Test
    @DisplayName("retryEmail: throws when email not found")
    void retryEmail_notFound() {
        when(emailRepository.findById(testId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> emailService.retryEmail(testId))
                .isInstanceOf(Exception.class);
    }

    // ── getEmailById ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getEmailById: returns email when found")
    void getEmailById_found() {
        when(emailRepository.findById(testId)).thenReturn(Optional.of(sentEmail));
        Email result = emailService.getEmailById(testId);
        assertThat(result.getId()).isEqualTo(testId);
    }

    @Test
    @DisplayName("getEmailById: throws when not found")
    void getEmailById_notFound() {
        when(emailRepository.findById(testId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> emailService.getEmailById(testId))
                .isInstanceOf(Exception.class);
    }

    // ── getAllEmails ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllEmails: returns all emails")
    void getAllEmails_returnsAll() {
        Email second = Email.builder().id(UUID.randomUUID()).recipientEmail("b@b.com")
                .subject("s").body("b").status(EmailStatus.SENT).retryCount(0).build();
        when(emailRepository.findAll()).thenReturn(List.of(sentEmail, second));
        assertThat(emailService.getAllEmails()).hasSize(2);
    }

    @Test
    @DisplayName("getAllEmails: empty list when no emails")
    void getAllEmails_empty() {
        when(emailRepository.findAll()).thenReturn(List.of());
        assertThat(emailService.getAllEmails()).isEmpty();
    }
}