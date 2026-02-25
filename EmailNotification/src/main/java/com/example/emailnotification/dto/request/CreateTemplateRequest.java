package com.example.emailnotification.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTemplateRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String subject;
    @NotBlank
    private String body;
}
