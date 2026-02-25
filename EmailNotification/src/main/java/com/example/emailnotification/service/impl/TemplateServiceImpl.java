package com.example.emailnotification.service.impl;

import com.example.emailnotification.dto.request.CreateTemplateRequest;
import com.example.emailnotification.entity.Template;
import com.example.emailnotification.repository.TemplateRepository;
import com.example.emailnotification.service.TemplateService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final TemplateRepository templateRepository;

    @Override
    public Template createTemplate(CreateTemplateRequest request) {
        Template template = Template.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .body(request.getBody())
                .build();
        return templateRepository.save(template);
    }

    @Override
    public Template getTemplateById(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found: " + id));
    }

    @Override
    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Override
    public Template updateTemplate(UUID id, CreateTemplateRequest request) {
        Template template = getTemplateById(id);
        template.setName(request.getName());
        template.setSubject(request.getSubject());
        template.setBody(request.getBody());
        return templateRepository.save(template);
    }

    @Override
    public void deleteTemplate(UUID id) {
        if (!templateRepository.existsById(id)) {
            throw new EntityNotFoundException("Template not found: " + id);
        }
        templateRepository.deleteById(id);
    }
}
