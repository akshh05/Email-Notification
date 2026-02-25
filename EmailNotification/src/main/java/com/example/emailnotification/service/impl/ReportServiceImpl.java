package com.example.emailnotification.service.impl;

import com.example.emailnotification.dto.response.EmailStatisticsResponse;
import com.example.emailnotification.entity.Email;
import com.example.emailnotification.enums.EmailStatus;
import com.example.emailnotification.repository.EmailRepository;
import com.example.emailnotification.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final EmailRepository emailRepository;

    @Override
    public EmailStatisticsResponse getStatistics() {
        List<Email> all = emailRepository.findAll();
        long total  = all.size();
        long sent   = all.stream().filter(e -> e.getStatus() == EmailStatus.SENT).count();
        long failed = all.stream().filter(e -> e.getStatus() == EmailStatus.FAILED).count();
        long queued = all.stream().filter(e -> e.getStatus() == EmailStatus.QUEUED).count();
        double rate = total == 0 ? 0.0 : (sent * 100.0) / total;

        return EmailStatisticsResponse.builder()
                .totalEmails(total)
                .totalSent(sent)
                .totalFailed(failed)
                .totalQueued(queued)
                .successRate(rate)
                .build();
    }
}
