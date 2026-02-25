package com.example.emailnotification.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailResponse {
    private UUID id;
    private String status;
    private String message;
}
