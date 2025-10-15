package com.example.feedback.controller;

import com.example.feedback.dto.FeedbackRequest;
import com.example.feedback.dto.FeedbackResponse;
import com.example.feedback.exception.GlobalExceptionHandler;
import com.example.feedback.service.FeedbackService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.hamcrest.Matchers.*;

@WebMvcTest(controllers = FeedbackController.class)
@Import(GlobalExceptionHandler.class)
class FeedbackControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockBean
  private FeedbackService feedbackService;

  @Test
  void create_returns200AndBody_whenValid() throws Exception {
    when(feedbackService.create(any(FeedbackRequest.class)))
        .thenReturn(new FeedbackResponse(1L, "John Doe", "Your platform looks great!", Instant.parse("2024-01-01T00:00:00Z")));

    FeedbackRequest req = new FeedbackRequest("John Doe", "john@example.com", "Your platform looks great!");

    mockMvc.perform(post("/api/feedback")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.name").value("John Doe"))
        .andExpect(jsonPath("$.message").value("Your platform looks great!"))
        .andExpect(jsonPath("$.createdAt").exists())
        .andExpect(jsonPath("$.email").doesNotExist());
  }

  @Test
  void create_returns400WithValidationDetails_whenInvalid() throws Exception {
    String payload = """
      {
        "name": "",
        "email": "not-an-email",
        "message": ""
      }
      """;

    mockMvc.perform(post("/api/feedback")
            .contentType(MediaType.APPLICATION_JSON)
            .content(payload))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.error").value("Bad Request"))
        .andExpect(jsonPath("$.message").value("Validation error"))
        .andExpect(jsonPath("$.details", hasSize(greaterThanOrEqualTo(1))))
        .andExpect(jsonPath("$.details[*]", hasItem(containsString("name"))))
        .andExpect(jsonPath("$.details[*]", hasItem(containsString("email"))))
        .andExpect(jsonPath("$.details[*]", hasItem(containsString("message"))));
  }

  @Test
  void list_returns200AndPaginatedResponseSortedByCreatedAtDesc() throws Exception {
    when(feedbackService.list(0, 10))
        .thenReturn(new com.example.feedback.dto.PageResponse<>(
            List.of(
                new FeedbackResponse(2L, "Alice", "Hi", Instant.parse("2024-02-01T00:00:00Z")),
                new FeedbackResponse(1L, "Bob", "Hello", Instant.parse("2024-01-01T00:00:00Z"))
            ),
            0,
            10,
            2L,
            1,
            false
        ));
  
    mockMvc.perform(get("/api/feedback")
            .contentType(MediaType.APPLICATION_JSON)
            .param("page", "0")
            .param("size", "10"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.items", hasSize(2)))
        .andExpect(jsonPath("$.items[0].id").value(2))
        .andExpect(jsonPath("$.items[0].createdAt").exists())
        .andExpect(jsonPath("$.items[1].id").value(1))
        .andExpect(jsonPath("$.items[1].createdAt").exists())
        .andExpect(jsonPath("$.page").value(0))
        .andExpect(jsonPath("$.size").value(10))
        .andExpect(jsonPath("$.hasNext").value(false));
  }
}