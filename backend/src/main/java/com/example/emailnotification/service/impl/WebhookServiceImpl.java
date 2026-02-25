package com.example.emailnotification.service.impl;

import com.example.emailnotification.entity.Email;
import com.example.emailnotification.enums.EmailStatus;
import com.example.emailnotification.repository.EmailRepository;
import com.example.emailnotification.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookServiceImpl implements WebhookService {

    private final EmailRepository emailRepository;

    @Override
    public void processSendGridEvents(List<Map<String, Object>> events) {
        for (Map<String, Object> event : events) {
            String emailAddress = (String) event.get("email");
            String eventType    = (String) event.get("event");
            log.info("Webhook event: {} for {}", eventType, emailAddress);

            try {
                Optional<Email> optionalEmail = emailRepository.findByRecipientEmail(emailAddress);
                if (optionalEmail.isPresent()) {
                    Email email = optionalEmail.get();
                    email.setStatus(EmailStatus.valueOf(eventType.toUpperCase()));
                    emailRepository.save(email);
                }
            } catch (IllegalArgumentException e) {
                log.warn("Unknown event type: {}", eventType);
            }
        }
    }
}
