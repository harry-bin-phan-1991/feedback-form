import React from 'react';
import * as Label from '@radix-ui/react-label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient, type ApiError } from '../apiClient';
import { useToast } from './ToastProvider';
import { useFeedbackStore } from '../store/feedbackStore';

const schema = z.object({
  name: z
    .string()
    .min(1, 'must not be blank')
    .max(255, 'must be at most 255 characters'),
  email: z
    .string()
    .min(1, 'must not be blank')
    .email('must be a well-formed email address')
    .max(255, 'must be at most 255 characters'),
  message: z
    .string()
    .min(1, 'must not be blank')
    .max(1000, 'must be at most 1000 characters')
});

type FormData = z.infer<typeof schema>;

export default function FeedbackForm() {
  const { showToast } = useToast();

  const setSubmitting = useFeedbackStore((s) => s.setSubmitting);
  const setLastResponse = useFeedbackStore((s) => s.setLastResponse);
  const setLastError = useFeedbackStore((s) => s.setLastError);
  const submitting = useFeedbackStore((s) => s.submitting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const resp = await apiClient.submitFeedback(data);
      setLastResponse(resp);
      reset();
      showToast({
        title: 'Feedback sent',
        description: `Thanks ${resp.name}! Your feedback was submitted successfully.`,
        variant: 'success'
      });
    } catch (e) {
      const err = e as Error & { status?: number; body?: ApiError };
      setLastError(err.body ?? null);
      const details =
        err.body?.details && err.body.details.length ? ` Details: ${err.body.details.join(', ')}` : '';
      showToast({
        title: 'Submission failed',
        description: `${err.message ?? 'Request failed.'}${details}`,
        variant: 'error',
        duration: 6000
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-field">
        <Label.Root className="label" htmlFor="name-input">Name</Label.Root>
        <input
          id="name-input"
          type="text"
          placeholder="John Doe"
          className={`input ${errors.name ? 'invalid' : ''}`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
          disabled={submitting}
        />
        {errors.name ? (
          <div id="name-error" className="form-error">{errors.name.message}</div>
        ) : null}
      </div>

      <div className="form-field">
        <Label.Root className="label" htmlFor="email-input">Email</Label.Root>
        <input
          id="email-input"
          type="email"
          placeholder="john@example.com"
          className={`input ${errors.email ? 'invalid' : ''}`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
          disabled={submitting}
        />
        {errors.email ? (
          <div id="email-error" className="form-error">{errors.email.message}</div>
        ) : null}
      </div>

      <div className="form-field">
        <Label.Root className="label" htmlFor="message-input">Message</Label.Root>
        <textarea
          id="message-input"
          placeholder="Your platform looks great!"
          className={`input ${errors.message ? 'invalid' : ''}`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          rows={5}
          {...register('message')}
          disabled={submitting}
        />
        {errors.message ? (
          <div id="message-error" className="form-error">{errors.message.message}</div>
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="button primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          className="button"
          onClick={() => reset()}
          disabled={submitting}
        >
          Reset
        </button>
      </div>
    </form>
  );
}