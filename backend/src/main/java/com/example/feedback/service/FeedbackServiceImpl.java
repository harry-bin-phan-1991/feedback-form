package com.example.feedback.service;

import com.example.feedback.dto.FeedbackRequest;
import com.example.feedback.dto.FeedbackResponse;
import com.example.feedback.model.Feedback;
import com.example.feedback.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackServiceImpl implements FeedbackService {

  private final FeedbackRepository repository;

  public FeedbackServiceImpl(FeedbackRepository repository) {
    this.repository = repository;
  }

  @Override
  @Transactional
  public FeedbackResponse create(FeedbackRequest request) {
    Feedback entity = new Feedback(request.getName(), request.getEmail(), request.getMessage());
    Feedback saved = repository.save(entity);
    return new FeedbackResponse(saved.getId(), saved.getName(), saved.getMessage());
  }
}