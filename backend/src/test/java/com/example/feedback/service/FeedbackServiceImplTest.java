package com.example.feedback.service;

import com.example.feedback.dto.FeedbackRequest;
import com.example.feedback.dto.FeedbackResponse;
import com.example.feedback.model.Feedback;
import com.example.feedback.repository.FeedbackRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;

class FeedbackServiceImplTest {

  @Test
  void create_returnsResponseWithoutSensitiveEmail_andIncludesCreatedAt() {
    FeedbackRepository repo = Mockito.mock(FeedbackRepository.class);
    FeedbackServiceImpl service = new FeedbackServiceImpl(repo);

    Mockito.when(repo.save(any(Feedback.class))).thenAnswer(invocation -> {
      Feedback f = invocation.getArgument(0);
      Feedback saved = new Feedback(f.getName(), f.getEmail(), f.getMessage());
      saved.setId(1L);
      saved.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));
      return saved;
    });

    FeedbackRequest request = new FeedbackRequest("John Doe", "john@example.com", "Your platform looks great!");

    FeedbackResponse response = service.create(request);

    assertThat(response.getId()).isEqualTo(1L);
    assertThat(response.getName()).isEqualTo("John Doe");
    assertThat(response.getMessage()).isEqualTo("Your platform looks great!");
    assertThat(response.getCreatedAt()).isEqualTo(Instant.parse("2024-01-01T00:00:00Z"));
  }

  @Test
  void list_returnsResponsesSortedByCreatedAtDesc() {
    FeedbackRepository repo = Mockito.mock(FeedbackRepository.class);
    FeedbackServiceImpl service = new FeedbackServiceImpl(repo);

    Feedback older = new Feedback("Bob", "bob@example.com", "Hello");
    older.setId(1L);
    older.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));

    Feedback newer = new Feedback("Alice", "alice@example.com", "Hi");
    newer.setId(2L);
    newer.setCreatedAt(Instant.parse("2024-02-01T00:00:00Z"));

    Mockito.when(repo.findAll(any(Sort.class))).thenReturn(Arrays.asList(newer, older));

    List<FeedbackResponse> list = service.list();

    assertThat(list).hasSize(2);
    assertThat(list.get(0).getId()).isEqualTo(2L);
    assertThat(list.get(0).getCreatedAt()).isEqualTo(Instant.parse("2024-02-01T00:00:00Z"));
    assertThat(list.get(1).getId()).isEqualTo(1L);
    assertThat(list.get(1).getCreatedAt()).isEqualTo(Instant.parse("2024-01-01T00:00:00Z"));
  }
  @Test
  void list_withPagination_returnsPageResponse() {
    FeedbackRepository repo = Mockito.mock(FeedbackRepository.class);
    FeedbackServiceImpl service = new FeedbackServiceImpl(repo);

    Feedback older = new Feedback("Bob", "bob@example.com", "Hello");
    older.setId(1L);
    older.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));

    Feedback newer = new Feedback("Alice", "alice@example.com", "Hi");
    newer.setId(2L);
    newer.setCreatedAt(Instant.parse("2024-02-01T00:00:00Z"));

    var pageable = org.springframework.data.domain.PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
    var pageImpl = new org.springframework.data.domain.PageImpl<>(List.of(newer, older), pageable, 2);

    Mockito.when(repo.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(pageImpl);

    var pageResp = service.list(0, 10);

    assertThat(pageResp.getItems()).hasSize(2);
    assertThat(pageResp.getItems().get(0).getId()).isEqualTo(2L);
    assertThat(pageResp.getItems().get(0).getCreatedAt()).isEqualTo(Instant.parse("2024-02-01T00:00:00Z"));
    assertThat(pageResp.getItems().get(1).getId()).isEqualTo(1L);
    assertThat(pageResp.getItems().get(1).getCreatedAt()).isEqualTo(Instant.parse("2024-01-01T00:00:00Z"));
    assertThat(pageResp.getPage()).isEqualTo(0);
    assertThat(pageResp.getSize()).isEqualTo(10);
    assertThat(pageResp.getTotalElements()).isEqualTo(2L);
    assertThat(pageResp.getTotalPages()).isEqualTo(1);
    assertThat(pageResp.isHasNext()).isFalse();
  }
}