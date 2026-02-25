package com.example.emailnotification.service;

import com.example.emailnotification.dto.response.EmailStatisticsResponse;
import com.example.emailnotification.entity.Email;
import com.example.emailnotification.enums.EmailStatus;
import com.example.emailnotification.repository.EmailRepository;
import com.example.emailnotification.service.impl.ReportServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService Unit Tests")
class ReportServiceImplTest {

    @Mock private EmailRepository emailRepository;
    @InjectMocks private ReportServiceImpl reportService;

    private Email makeEmail(EmailStatus status) {
        return Email.builder().id(UUID.randomUUID()).recipientEmail("t@t.com")
                .subject("s").body("b").status(status).retryCount(0).build();
    }

    @Test @DisplayName("getStatistics: correct counts and success rate")
    void getStatistics_correctCalc() {
        when(emailRepository.findAll()).thenReturn(List.of(
                makeEmail(EmailStatus.SENT), makeEmail(EmailStatus.SENT),
                makeEmail(EmailStatus.SENT), makeEmail(EmailStatus.FAILED), makeEmail(EmailStatus.QUEUED)
        ));
        EmailStatisticsResponse result = reportService.getStatistics();
        assertThat(result.getTotalSent()).isEqualTo(3);
        assertThat(result.getTotalFailed()).isEqualTo(1);
        assertThat(result.getSuccessRate()).isEqualTo(60.0);
    }

    @Test @DisplayName("getStatistics: zero emails → 0% success rate")
    void getStatistics_noEmails() {
        when(emailRepository.findAll()).thenReturn(Collections.emptyList());
        EmailStatisticsResponse result = reportService.getStatistics();
        assertThat(result.getTotalSent()).isZero();
        assertThat(result.getSuccessRate()).isZero();
    }

    @Test @DisplayName("getStatistics: all sent → 100% success rate")
    void getStatistics_allSent() {
        when(emailRepository.findAll()).thenReturn(List.of(
                makeEmail(EmailStatus.SENT), makeEmail(EmailStatus.SENT)
        ));
        assertThat(reportService.getStatistics().getSuccessRate()).isEqualTo(100.0);
    }
}
