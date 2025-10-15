package com.example.feedback.service;

import com.example.feedback.dto.FeedbackRequest;
import com.example.feedback.dto.FeedbackResponse;
import com.example.feedback.model.Feedback;
import com.example.feedback.repository.FeedbackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import com.example.feedback.dto.PageResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {

  private static final Logger log = LoggerFactory.getLogger(FeedbackServiceImpl.class);

  private final FeedbackRepository repository;

  public FeedbackServiceImpl(FeedbackRepository repository) {
    this.repository = repository;
  }

  @Override
  @Transactional
  public FeedbackResponse create(FeedbackRequest request) {
    Feedback entity = new Feedback(request.getName(), request.getEmail(), request.getMessage());
    Feedback saved = repository.save(entity);
    log.info("Created feedback id={}", saved.getId());
    return new FeedbackResponse(saved.getId(), saved.getName(), saved.getMessage(), saved.getCreatedAt());
  }

  @Override
  @Transactional(readOnly = true)
  public List<FeedbackResponse> list() {
    log.info("Fetching feedback list sorted by createdAt desc");
    try {
      List<Feedback> entities = repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
      log.info("Fetched {} feedback rows", entities.size());
      return entities.stream()
          .map(f -> new FeedbackResponse(f.getId(), f.getName(), f.getMessage(), f.getCreatedAt()))
          .collect(Collectors.toList());
    } catch (Exception ex) {
      log.error("Error fetching feedback list", ex);
      throw ex;
    }
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<FeedbackResponse> list(int page, int size) {
    log.info("Fetching feedback page={} size={}", page, size);
    try {
      Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
      Page<Feedback> pageResult = repository.findAll(pageable);
      List<FeedbackResponse> items = pageResult.getContent().stream()
          .map(f -> new FeedbackResponse(f.getId(), f.getName(), f.getMessage(), f.getCreatedAt()))
          .collect(Collectors.toList());
      return new PageResponse<>(
          items,
          pageResult.getNumber(),
          pageResult.getSize(),
          pageResult.getTotalElements(),
          pageResult.getTotalPages(),
          pageResult.hasNext()
      );
    } catch (Exception ex) {
      log.error("Error fetching feedback page", ex);
      throw ex;
    }
  }
}