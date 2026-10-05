export interface FieldError {
  field?: string;
  message: string;
}

class ApiError extends Error {
  statusCode: number;
  errors: FieldError[];

  constructor(statusCode: number, message: string, errors: FieldError[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
