package com.example.emailnotification.service;

import com.example.emailnotification.dto.response.EmailStatisticsResponse;

public interface ReportService {
    EmailStatisticsResponse getStatistics();
}
