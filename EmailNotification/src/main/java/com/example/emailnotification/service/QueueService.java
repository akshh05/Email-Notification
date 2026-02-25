package com.example.emailnotification.service;

import java.util.UUID;

public interface QueueService {
    void pushToQueue(UUID emailId);
}
