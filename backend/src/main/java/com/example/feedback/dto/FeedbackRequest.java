package com.example.feedback.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FeedbackRequest {
  @NotBlank
  @Size(max = 255)
  private String name;

  @NotBlank
  @Email
  @Size(max = 255)
  private String email;

  @NotBlank
  @Size(max = 1000)
  private String message;

  public FeedbackRequest() {}

  public FeedbackRequest(String name, String email, String message) {
    this.name = name;
    this.email = email;
    this.message = message;
  }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
}