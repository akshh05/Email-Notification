package com.example.emailnotification.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailStatisticsResponse {
    private long totalSent;
    private long totalFailed;
    private long totalQueued;
    private long totalEmails;
    private double successRate;
}
