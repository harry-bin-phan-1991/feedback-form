package com.example.feedback.dto;

import java.time.Instant;
import java.util.List;

public class ErrorResponse {
  private Instant timestamp;
  private int status;
  private String error;
  private String message;
  private List<String> details;

  public ErrorResponse() {}

  public ErrorResponse(Instant timestamp, int status, String error, String message, List<String> details) {
    this.timestamp = timestamp;
    this.status = status;
    this.error = error;
    this.message = message;
    this.details = details;
  }

  public Instant getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Instant timestamp) {
    this.timestamp = timestamp;
  }

  public int getStatus() {
    return status;
  }

  public void setStatus(int status) {
    this.status = status;
  }

  public String getError() {
    return error;
  }

  public void setError(String error) {
    this.error = error;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public List<String> getDetails() {
    return details;
  }

  public void setDetails(List<String> details) {
    this.details = details;
  }
}