package com.example.emailnotification.service;

import com.example.emailnotification.dto.request.SendEmailRequest;
import com.example.emailnotification.dto.response.EmailResponse;
import com.example.emailnotification.entity.Email;

import java.util.List;
import java.util.UUID;

public interface EmailService {
    EmailResponse sendEmail(SendEmailRequest request);
    EmailResponse retryEmail(UUID id);
    Email getEmailById(UUID id);
    List<Email> getAllEmails();
}
