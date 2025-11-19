import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApplicationException } from './application.exception';
import { ErrorCode, ErrorSeverity } from './error-codes';
import { LoggerService } from '../logger/logger.service';

interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  path?: string;
  context?: Record<string, any>;
  stack?: string;
}

/**
 * Global exception filter that handles all exceptions in the application
 * Provides consistent error responses and logging
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const errorResponse = this.buildErrorResponse(exception, request.url);
    const statusCode = this.getHttpStatus(exception);

    // Log the error
    this.logError(exception, errorResponse, request);

    // Send response
    response.status(statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, path: string): ErrorResponse {
    const timestamp = new Date().toISOString();
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Handle ApplicationException
    if (exception instanceof ApplicationException) {
      return {
        code: exception.code,
        message: exception.message,
        timestamp,
        path,
        context: exception.context,
        ...(isDevelopment && { stack: exception.stack }),
      };
    }

    // Handle standard HttpException
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;

      return {
        code: this.mapHttpStatusToErrorCode(exception.getStatus()),
        message,
        timestamp,
        path,
        ...(isDevelopment && { stack: exception.stack }),
      };
    }

    // Handle Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, timestamp, path, isDevelopment);
    }

    // Handle generic errors
    if (exception instanceof Error) {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: isDevelopment ? exception.message : 'An unexpected error occurred',
        timestamp,
        path,
        ...(isDevelopment && { stack: exception.stack }),
      };
    }

    // Unknown error type
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      timestamp,
      path,
    };
  }

  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    timestamp: string,
    path: string,
    isDevelopment: boolean
  ): ErrorResponse {
    const meta = exception.meta as Record<string, any> | undefined;

    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        return {
          code: ErrorCode.DUPLICATE_RECORD,
          message: 'A record with this value already exists',
          timestamp,
          path,
          context: { field: meta?.target },
          ...(isDevelopment && { stack: exception.stack }),
        };

      case 'P2025': // Record not found
        return {
          code: ErrorCode.RECORD_NOT_FOUND,
          message: 'The requested record was not found',
          timestamp,
          path,
          ...(isDevelopment && { stack: exception.stack }),
        };

      case 'P2003': // Foreign key constraint violation
        return {
          code: ErrorCode.CONSTRAINT_VIOLATION,
          message: 'Invalid reference to related record',
          timestamp,
          path,
          context: { field: meta?.field_name },
          ...(isDevelopment && { stack: exception.stack }),
        };

      default:
        return {
          code: ErrorCode.DATABASE_ERROR,
          message: isDevelopment
            ? `Database error: ${exception.message}`
            : 'A database error occurred',
          timestamp,
          path,
          ...(isDevelopment && {
            context: { prismaCode: exception.code },
            stack: exception.stack,
          }),
        };
    }
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return HttpStatus.CONFLICT;
        case 'P2025':
          return HttpStatus.NOT_FOUND;
        case 'P2003':
          return HttpStatus.BAD_REQUEST;
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private mapHttpStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.RECORD_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.DUPLICATE_RECORD;
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMIT_EXCEEDED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }

  private logError(
    exception: unknown,
    errorResponse: ErrorResponse,
    request: any
  ): void {
    const logContext = {
      path: request.url,
      method: request.method,
      code: errorResponse.code,
      userId: request.user?.id,
      tenantId: request.tenant?.id,
      ip: request.ip,
    };

    if (exception instanceof ApplicationException) {
      const severity = exception.severity;

      switch (severity) {
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.HIGH:
          this.logger.error(
            errorResponse.message,
            exception.stack,
            JSON.stringify(logContext)
          );
          break;
        case ErrorSeverity.MEDIUM:
          this.logger.warn(errorResponse.message, JSON.stringify(logContext));
          break;
        default:
          this.logger.log(errorResponse.message, JSON.stringify(logContext));
      }
    } else if (
      exception instanceof HttpException &&
      exception.getStatus() >= 500
    ) {
      this.logger.error(
        errorResponse.message,
        exception.stack,
        JSON.stringify(logContext)
      );
    } else if (exception instanceof Error) {
      this.logger.error(
        errorResponse.message,
        exception.stack,
        JSON.stringify(logContext)
      );
    } else {
      this.logger.warn(errorResponse.message, JSON.stringify(logContext));
    }
  }
}
