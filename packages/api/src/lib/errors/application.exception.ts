import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorSeverity } from './error-codes';

export interface ApplicationErrorDetails {
  code: ErrorCode;
  message: string;
  httpStatus: HttpStatus;
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  isOperational?: boolean;
}

/**
 * Base application exception class
 * All custom exceptions should extend this class
 */
export class ApplicationException extends HttpException {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, any>;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(details: ApplicationErrorDetails) {
    super(
      {
        code: details.code,
        message: details.message,
        context: details.context,
        timestamp: new Date().toISOString(),
      },
      details.httpStatus
    );

    this.code = details.code;
    this.severity = details.severity || ErrorSeverity.MEDIUM;
    this.context = details.context;
    this.isOperational = details.isOperational ?? true;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}
