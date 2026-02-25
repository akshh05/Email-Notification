package com.example.emailnotification.service;

import com.example.emailnotification.dto.request.CreateTemplateRequest;
import com.example.emailnotification.entity.Template;

import java.util.List;
import java.util.UUID;

public interface TemplateService {
    Template createTemplate(CreateTemplateRequest request);
    Template getTemplateById(UUID id);
    List<Template> getAllTemplates();
    Template updateTemplate(UUID id, CreateTemplateRequest request);
    void deleteTemplate(UUID id);          // ← NEW
}
