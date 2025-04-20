export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // This helps preserve stack traces
    Error.captureStackTrace(this, this.constructor);
  }
}
