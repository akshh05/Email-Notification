package com.example.emailnotification.repository;

import com.example.emailnotification.entity.Email;
import com.example.emailnotification.enums.EmailStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
// FIX: override dialect explicitly to H2 — prevents MySQL InnoDB/enum DDL
@TestPropertySource(properties = {
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DisplayName("EmailRepository Integration Tests")
class EmailRepositoryTest {

    @Autowired EmailRepository emailRepository;

    private Email save(String recipient, EmailStatus status) {
        return emailRepository.save(Email.builder()
                .recipientEmail(recipient)
                .subject("Test Subject")
                .body("Test Body")
                .status(status)
                .retryCount(0)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Test
    @DisplayName("findByRecipientEmail: returns email when found")
    void findByRecipientEmail_found() {
        save("alice@example.com", EmailStatus.SENT);
        Optional<Email> result = emailRepository.findByRecipientEmail("alice@example.com");
        assertThat(result).isPresent();
        assertThat(result.get().getRecipientEmail()).isEqualTo("alice@example.com");
        assertThat(result.get().getStatus()).isEqualTo(EmailStatus.SENT);
    }

    @Test
    @DisplayName("findByRecipientEmail: empty when not found")
    void findByRecipientEmail_notFound() {
        Optional<Email> result = emailRepository.findByRecipientEmail("nobody@example.com");
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findByStatus: returns only matching emails")
    void findByStatus_filtered() {
        save("a@a.com", EmailStatus.SENT);
        save("b@b.com", EmailStatus.SENT);
        save("c@c.com", EmailStatus.FAILED);

        List<Email> sent   = emailRepository.findByStatus(EmailStatus.SENT);
        List<Email> failed = emailRepository.findByStatus(EmailStatus.FAILED);

        assertThat(sent).hasSize(2);
        assertThat(failed).hasSize(1);
    }

    @Test
    @DisplayName("save and findById: round-trip persists correctly")
    void saveAndFindById() {
        Email saved = save("x@x.com", EmailStatus.QUEUED);
        assertThat(saved.getId()).isNotNull();

        Optional<Email> found = emailRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(EmailStatus.QUEUED);
        assertThat(found.get().getRecipientEmail()).isEqualTo("x@x.com");
    }
}
