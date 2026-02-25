package com.example.emailnotification.service;

import com.example.emailnotification.dto.request.CreateTemplateRequest;
import com.example.emailnotification.entity.Template;
import com.example.emailnotification.repository.TemplateRepository;
import com.example.emailnotification.service.impl.TemplateServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TemplateService Unit Tests")
class TemplateServiceImplTest {

    @Mock private TemplateRepository templateRepository;
    @InjectMocks private TemplateServiceImpl templateService;

    private UUID templateId;
    private Template template;
    private CreateTemplateRequest request;

    @BeforeEach
    void setUp() {
        templateId = UUID.randomUUID();
        template = Template.builder().id(templateId).name("Welcome").subject("Welcome {{name}}").body("Hi {{name}}").build();
        request  = CreateTemplateRequest.builder().name("Welcome").subject("Welcome {{name}}").body("Hi {{name}}").build();
    }

    @Test @DisplayName("createTemplate: saves and returns template")
    void createTemplate_success() {
        when(templateRepository.save(any())).thenReturn(template);
        Template result = templateService.createTemplate(request);
        assertThat(result.getName()).isEqualTo("Welcome");
        verify(templateRepository).save(any());
    }

    @Test @DisplayName("getTemplateById: found")
    void getById_found() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        assertThat(templateService.getTemplateById(templateId).getId()).isEqualTo(templateId);
    }

    @Test @DisplayName("getTemplateById: not found throws")
    void getById_notFound() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> templateService.getTemplateById(templateId))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test @DisplayName("getAllTemplates: returns list")
    void getAllTemplates() {
        when(templateRepository.findAll()).thenReturn(List.of(template));
        assertThat(templateService.getAllTemplates()).hasSize(1);
    }

    @Test @DisplayName("updateTemplate: updates fields")
    void updateTemplate_success() {
        CreateTemplateRequest update = CreateTemplateRequest.builder()
                .name("New").subject("NewSub").body("NewBody").build();
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(templateRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Template result = templateService.updateTemplate(templateId, update);
        assertThat(result.getName()).isEqualTo("New");
        assertThat(result.getSubject()).isEqualTo("NewSub");
    }

    @Test @DisplayName("updateTemplate: not found throws")
    void updateTemplate_notFound() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> templateService.updateTemplate(templateId, request))
                .isInstanceOf(Exception.class);
    }

    @Test @DisplayName("deleteTemplate: calls deleteById when exists")
    void deleteTemplate_success() {
        when(templateRepository.existsById(templateId)).thenReturn(true);
        doNothing().when(templateRepository).deleteById(templateId);

        assertThatCode(() -> templateService.deleteTemplate(templateId))
                .doesNotThrowAnyException();
        verify(templateRepository).deleteById(templateId);
    }

    @Test @DisplayName("deleteTemplate: throws when not found")
    void deleteTemplate_notFound() {
        when(templateRepository.existsById(templateId)).thenReturn(false);
        assertThatThrownBy(() -> templateService.deleteTemplate(templateId))
                .isInstanceOf(EntityNotFoundException.class);
        verify(templateRepository, never()).deleteById(any());
    }
}