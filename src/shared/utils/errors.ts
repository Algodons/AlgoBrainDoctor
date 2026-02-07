// Utility: Custom error classes
export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class WorkerError extends BaseError {
  constructor(message: string) {
    super(message, 'WORKER_ERROR', 500);
  }
}

export class HealdecError extends BaseError {
  constructor(message: string) {
    super(message, 'HEALDEC_ERROR', 500);
  }
}
