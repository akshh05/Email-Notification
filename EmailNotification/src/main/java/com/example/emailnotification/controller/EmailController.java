package com.example.emailnotification.controller;

import com.example.emailnotification.dto.request.SendEmailRequest;
import com.example.emailnotification.dto.response.EmailResponse;
import com.example.emailnotification.entity.Email;
import com.example.emailnotification.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<EmailResponse> sendEmail(@Valid @RequestBody SendEmailRequest request) {
        return ResponseEntity.ok(emailService.sendEmail(request));
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<EmailResponse> retryEmail(@PathVariable UUID id) {
        return ResponseEntity.ok(emailService.retryEmail(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Email> getEmailById(@PathVariable UUID id) {
        return ResponseEntity.ok(emailService.getEmailById(id));
    }

    @GetMapping
    public ResponseEntity<List<Email>> getAllEmails() {
        return ResponseEntity.ok(emailService.getAllEmails());
    }
}
