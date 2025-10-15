package com.example.feedback.controller;

import com.example.feedback.dto.FeedbackRequest;
import com.example.feedback.dto.FeedbackResponse;
import com.example.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import com.example.feedback.dto.PageResponse;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

  private final FeedbackService service;

  public FeedbackController(FeedbackService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<FeedbackResponse> create(@Valid @RequestBody FeedbackRequest request) {
    FeedbackResponse response = service.create(request);
    return ResponseEntity.ok(response);
  }

  @GetMapping
  public ResponseEntity<PageResponse<FeedbackResponse>> list(
      @RequestParam(name = "page", defaultValue = "0") int page,
      @RequestParam(name = "size", defaultValue = "10") int size) {
    PageResponse<FeedbackResponse> responses = service.list(page, size);
    return ResponseEntity.ok(responses);
  }
}