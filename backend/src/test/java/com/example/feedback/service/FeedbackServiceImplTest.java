package com.example.feedback.service;

import com.example.feedback.dto.FeedbackRequest;
import com.example.feedback.dto.FeedbackResponse;
import com.example.feedback.model.Feedback;
import com.example.feedback.repository.FeedbackRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;

class FeedbackServiceImplTest {

  @Test
  void create_returnsResponseWithoutSensitiveEmail() {
    FeedbackRepository repo = Mockito.mock(FeedbackRepository.class);
    FeedbackServiceImpl service = new FeedbackServiceImpl(repo);

    Mockito.when(repo.save(any(Feedback.class))).thenAnswer(invocation -> {
      Feedback f = invocation.getArgument(0);
      Feedback saved = new Feedback(f.getName(), f.getEmail(), f.getMessage());
      saved.setId(1L);
      return saved;
    });

    FeedbackRequest request = new FeedbackRequest("John Doe", "john@example.com", "Your platform looks great!");

    FeedbackResponse response = service.create(request);

    assertThat(response.getId()).isEqualTo(1L);
    assertThat(response.getName()).isEqualTo("John Doe");
    assertThat(response.getMessage()).isEqualTo("Your platform looks great!");
  }
}