package com.example.emailnotification.controller;

import com.example.emailnotification.dto.response.EmailStatisticsResponse;
import com.example.emailnotification.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/emails/statistics")
    public ResponseEntity<EmailStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(reportService.getStatistics());
    }
}
