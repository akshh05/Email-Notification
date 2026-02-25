package com.example.emailnotification.controller;

import com.example.emailnotification.dto.request.SendEmailRequest;
import com.example.emailnotification.dto.response.EmailResponse;
import com.example.emailnotification.entity.Email;
import com.example.emailnotification.enums.EmailStatus;
import com.example.emailnotification.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmailController.class)
@DisplayName("EmailController Tests")
class EmailControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean EmailService emailService;

    @Test @WithMockUser
    @DisplayName("POST /api/emails/send → 200")
    void sendEmail_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        when(emailService.sendEmail(any())).thenReturn(
                EmailResponse.builder().id(id).status("QUEUED").message("Email queued successfully").build()
        );
        mockMvc.perform(post("/api/emails/send").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                SendEmailRequest.builder().recipient("t@t.com").subject("Hi").body("Hello").build()
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("QUEUED"))
                .andExpect(jsonPath("$.message").value("Email queued successfully"));
    }

    @Test @WithMockUser
    @DisplayName("GET /api/emails → returns list")
    void getAllEmails() throws Exception {
        Email e = Email.builder().id(UUID.randomUUID()).recipientEmail("a@a.com")
                .subject("S").body("B").status(EmailStatus.SENT).retryCount(0).createdAt(LocalDateTime.now()).build();
        when(emailService.getAllEmails()).thenReturn(List.of(e));

        mockMvc.perform(get("/api/emails").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].recipientEmail").value("a@a.com"))
                .andExpect(jsonPath("$[0].status").value("SENT"));
    }

    @Test @WithMockUser
    @DisplayName("GET /api/emails/{id} → returns email")
    void getEmailById() throws Exception {
        UUID id = UUID.randomUUID();
        Email e = Email.builder().id(id).recipientEmail("x@x.com").subject("S").body("B")
                .status(EmailStatus.QUEUED).retryCount(0).createdAt(LocalDateTime.now()).build();
        when(emailService.getEmailById(id)).thenReturn(e);

        mockMvc.perform(get("/api/emails/" + id).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recipientEmail").value("x@x.com"));
    }

    @Test @WithMockUser
    @DisplayName("POST /api/emails/{id}/retry → 200")
    void retryEmail() throws Exception {
        UUID id = UUID.randomUUID();
        when(emailService.retryEmail(id)).thenReturn(
                EmailResponse.builder().id(id).status("RETRY_QUEUED").message("Retry initiated").build()
        );
        mockMvc.perform(post("/api/emails/" + id + "/retry").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETRY_QUEUED"));
    }

    @Test
    @DisplayName("Unauthenticated → 401")
    void unauthenticated() throws Exception {
        mockMvc.perform(get("/api/emails")).andExpect(status().isUnauthorized());
    }
}
