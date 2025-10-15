package com.example.feedback.exception;

import com.example.feedback.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
    List<String> details = ex.getBindingResult().getFieldErrors().stream()
        .map(err -> err.getField() + " " + err.getDefaultMessage())
        .collect(Collectors.toList());
    ErrorResponse body = new ErrorResponse(
        Instant.now(),
        HttpStatus.BAD_REQUEST.value(),
        "Bad Request",
        "Validation error",
        details
    );
    log.warn("Validation error on {} {} -> {}", request.getMethod(), request.getRequestURI(), details);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
    log.error("Unhandled exception processing {} {}: {}", request.getMethod(), request.getRequestURI(), ex.toString(), ex);
    ErrorResponse body = new ErrorResponse(
        Instant.now(),
        HttpStatus.INTERNAL_SERVER_ERROR.value(),
        "Internal Server Error",
        "Unexpected error",
        List.of()
    );
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }
}