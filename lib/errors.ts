// Domain error hierarchy. Services throw these; server actions translate them
// into user-visible form errors. Unexpected errors (anything NOT subclassing
// AppError) bubble up to Sentry + Next's error boundary.

export abstract class AppError extends Error {
  abstract readonly kind: string;
}

export class ValidationError extends AppError {
  readonly kind = "validation" as const;
}

export class ConflictError extends AppError {
  readonly kind = "conflict" as const;
}

export class NotFoundError extends AppError {
  readonly kind = "not_found" as const;
}
