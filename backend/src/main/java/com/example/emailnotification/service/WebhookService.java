package com.example.emailnotification.service;

import java.util.List;
import java.util.Map;

public interface WebhookService {
    void processSendGridEvents(List<Map<String, Object>> events);
}
