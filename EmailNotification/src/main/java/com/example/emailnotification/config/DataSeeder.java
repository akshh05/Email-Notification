package com.example.emailnotification.config;

import com.example.emailnotification.entity.Email;
import com.example.emailnotification.entity.Template;
import com.example.emailnotification.enums.EmailStatus;
import com.example.emailnotification.repository.EmailRepository;
import com.example.emailnotification.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final EmailRepository emailRepository;
    private final TemplateRepository templateRepository;

    @Bean
    @Profile("!test")
    CommandLineRunner seedData() {
        return args -> {
            if (templateRepository.count() > 0) {
                log.info("Data already seeded, skipping.");
                return;
            }

            log.info("Seeding sample data...");

            templateRepository.saveAll(List.of(
                Template.builder().name("Welcome Email")
                    .subject("Welcome to our platform, {{name}}!")
                    .body("Hi {{name}},\n\nWelcome aboard! We are thrilled to have you.\n\nBest regards,\nThe Team").build(),
                Template.builder().name("Password Reset")
                    .subject("Reset your password")
                    .body("Hi {{name}},\n\nClick the link to reset your password:\n{{reset_link}}\n\nExpires in 24 hours.").build(),
                Template.builder().name("Invoice Due Reminder")
                    .subject("{{customer.name}} - Invoice Due - {{amount}}")
                    .body("Hi {{customer.name}},\n\nYour invoice of {{amount}} is due on {{due_date}}.\n\nThank you!").build(),
                Template.builder().name("Promotional Offer")
                    .subject("Exclusive offer just for you!")
                    .body("Hi {{name}},\n\nExclusive offer: {{offer_details}}\nCode: {{promo_code}}\nValid until: {{expiry_date}}").build()
            ));

            emailRepository.saveAll(List.of(
                Email.builder().recipientEmail("alice@example.com").subject("Welcome, Alice!").body("Hi Alice")
                    .status(EmailStatus.SENT).retryCount(0).createdAt(LocalDateTime.now().minusDays(6)).sentAt(LocalDateTime.now().minusDays(6)).build(),
                Email.builder().recipientEmail("bob@example.com").subject("Reset your password").body("Hi Bob, click here")
                    .status(EmailStatus.SENT).retryCount(0).createdAt(LocalDateTime.now().minusDays(5)).sentAt(LocalDateTime.now().minusDays(5)).build(),
                Email.builder().recipientEmail("carol@example.com").subject("Invoice Due").body("Hi Carol")
                    .status(EmailStatus.FAILED).retryCount(2).errorMessage("Connection timeout").createdAt(LocalDateTime.now().minusDays(4)).build(),
                Email.builder().recipientEmail("dave@example.com").subject("Exclusive offer!").body("Hi Dave")
                    .status(EmailStatus.SENT).retryCount(0).createdAt(LocalDateTime.now().minusDays(3)).sentAt(LocalDateTime.now().minusDays(3)).build(),
                Email.builder().recipientEmail("eve@example.com").subject("Welcome, Eve!").body("Hi Eve")
                    .status(EmailStatus.QUEUED).retryCount(0).createdAt(LocalDateTime.now().minusDays(2)).build(),
                Email.builder().recipientEmail("frank@example.com").subject("Invoice Due Reminder").body("Hi Frank")
                    .status(EmailStatus.FAILED).retryCount(1).errorMessage("Invalid API key").createdAt(LocalDateTime.now().minusDays(1)).build(),
                Email.builder().recipientEmail("grace@example.com").subject("Reset your password").body("Hi Grace")
                    .status(EmailStatus.SENT).retryCount(0).createdAt(LocalDateTime.now().minusHours(5)).sentAt(LocalDateTime.now().minusHours(5)).build(),
                Email.builder().recipientEmail("henry@example.com").subject("Exclusive offer!").body("Hi Henry")
                    .status(EmailStatus.QUEUED).retryCount(0).createdAt(LocalDateTime.now().minusHours(2)).build()
            ));

            log.info("Seeded {} templates and {} emails", templateRepository.count(), emailRepository.count());
        };
    }
}
