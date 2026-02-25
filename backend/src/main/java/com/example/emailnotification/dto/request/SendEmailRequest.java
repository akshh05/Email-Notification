package com.example.emailnotification.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendEmailRequest {
    @NotBlank @Email
    private String recipient;
    @NotBlank
    private String subject;
    @NotBlank
    private String body;
    private String templateId;
}
