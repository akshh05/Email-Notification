package com.example.emailnotification.service.impl;

import com.example.emailnotification.service.QueueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueServiceImpl implements QueueService {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void pushToQueue(UUID emailId) {
        try {
            rabbitTemplate.convertAndSend("email_queue", emailId.toString());
            log.info("Pushed email {} to queue", emailId);
        } catch (Exception e) {
            log.warn("RabbitMQ unavailable, skipping queue push: {}", e.getMessage());
        }
    }
}