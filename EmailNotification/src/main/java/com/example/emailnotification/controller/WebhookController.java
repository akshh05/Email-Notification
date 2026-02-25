package com.example.emailnotification.controller;

import com.example.emailnotification.service.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    @PostMapping("/sendgrid")
    public ResponseEntity<Void> handleSendGridWebhook(@RequestBody List<Map<String, Object>> events) {
        webhookService.processSendGridEvents(events);
        return ResponseEntity.ok().build();
    }
}
