package com.example.emailnotification.controller;

import com.example.emailnotification.dto.request.CreateTemplateRequest;
import com.example.emailnotification.entity.Template;
import com.example.emailnotification.service.TemplateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TemplateController.class)
@DisplayName("TemplateController Tests")
class TemplateControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean TemplateService templateService;

    private Template t(UUID id, String name) {
        return Template.builder().id(id).name(name).subject("Sub " + name).body("Body " + name).build();
    }

    @Test @WithMockUser
    @DisplayName("POST /api/templates → 200")
    void createTemplate() throws Exception {
        UUID id = UUID.randomUUID();
        when(templateService.createTemplate(any())).thenReturn(t(id, "Welcome"));

        mockMvc.perform(post("/api/templates").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                CreateTemplateRequest.builder().name("Welcome").subject("Sub").body("Body").build()
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Welcome"));
    }

    @Test @WithMockUser
    @DisplayName("GET /api/templates → list")
    void getAllTemplates() throws Exception {
        when(templateService.getAllTemplates()).thenReturn(
                List.of(t(UUID.randomUUID(), "A"), t(UUID.randomUUID(), "B"))
        );
        mockMvc.perform(get("/api/templates").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test @WithMockUser
    @DisplayName("GET /api/templates/{id} → template")
    void getById() throws Exception {
        UUID id = UUID.randomUUID();
        when(templateService.getTemplateById(id)).thenReturn(t(id, "Invoice"));
        mockMvc.perform(get("/api/templates/" + id).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Invoice"));
    }

    @Test @WithMockUser
    @DisplayName("PUT /api/templates/{id} → updated")
    void updateTemplate() throws Exception {
        UUID id = UUID.randomUUID();
        when(templateService.updateTemplate(eq(id), any())).thenReturn(t(id, "Updated"));

        mockMvc.perform(put("/api/templates/" + id).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                CreateTemplateRequest.builder().name("Updated").subject("S").body("B").build()
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test @WithMockUser
    @DisplayName("DELETE /api/templates/{id} → 204")
    void deleteTemplate() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(templateService).deleteTemplate(id);

        mockMvc.perform(delete("/api/templates/" + id).with(csrf()))
                .andExpect(status().isNoContent());

        verify(templateService).deleteTemplate(id);
    }

    @Test
    @DisplayName("Unauthenticated → 401")
    void unauthenticated() throws Exception {
        mockMvc.perform(get("/api/templates")).andExpect(status().isUnauthorized());
    }
}