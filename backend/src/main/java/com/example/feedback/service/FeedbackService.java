package com.example.feedback.service;

import com.example.feedback.dto.FeedbackRequest;
import com.example.feedback.dto.FeedbackResponse;

import java.util.List;
import com.example.feedback.dto.PageResponse;

public interface FeedbackService {
  FeedbackResponse create(FeedbackRequest request);
  List<FeedbackResponse> list();
  PageResponse<FeedbackResponse> list(int page, int size);
}