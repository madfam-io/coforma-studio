import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from './application.exception';
import { ErrorCode, ErrorSeverity } from './error-codes';

/**
 * Tenant-related exceptions
 */
export class TenantNotFoundException extends ApplicationException {
  constructor(tenantIdentifier: string) {
    super({
      code: ErrorCode.TENANT_NOT_FOUND,
      message: 'Tenant not found',
      httpStatus: HttpStatus.NOT_FOUND,
      severity: ErrorSeverity.MEDIUM,
      context: { tenantIdentifier },
    });
  }
}

export class TenantContextMissingException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.TENANT_CONTEXT_MISSING,
      message: 'Tenant context is required for this operation',
      httpStatus: HttpStatus.BAD_REQUEST,
      severity: ErrorSeverity.HIGH,
    });
  }
}

export class TenantAccessDeniedException extends ApplicationException {
  constructor(tenantId: string) {
    super({
      code: ErrorCode.TENANT_ACCESS_DENIED,
      message: 'Access denied to this tenant',
      httpStatus: HttpStatus.FORBIDDEN,
      severity: ErrorSeverity.HIGH,
      context: { tenantId },
    });
  }
}

export class TenantSlugTakenException extends ApplicationException {
  constructor(slug: string) {
    super({
      code: ErrorCode.TENANT_SLUG_TAKEN,
      message: 'Tenant slug is already taken',
      httpStatus: HttpStatus.CONFLICT,
      severity: ErrorSeverity.LOW,
      context: { slug },
    });
  }
}

/**
 * User-related exceptions
 */
export class UserNotFoundException extends ApplicationException {
  constructor(userIdentifier: string) {
    super({
      code: ErrorCode.USER_NOT_FOUND,
      message: 'User not found',
      httpStatus: HttpStatus.NOT_FOUND,
      severity: ErrorSeverity.MEDIUM,
      context: { userIdentifier },
    });
  }
}

export class UserAlreadyExistsException extends ApplicationException {
  constructor(email: string) {
    super({
      code: ErrorCode.USER_ALREADY_EXISTS,
      message: 'User with this email already exists',
      httpStatus: HttpStatus.CONFLICT,
      severity: ErrorSeverity.LOW,
      context: { email },
    });
  }
}

/**
 * Authentication & Authorization exceptions
 */
export class UnauthorizedException extends ApplicationException {
  constructor(message: string = 'Unauthorized') {
    super({
      code: ErrorCode.UNAUTHORIZED,
      message,
      httpStatus: HttpStatus.UNAUTHORIZED,
      severity: ErrorSeverity.MEDIUM,
    });
  }
}

export class ForbiddenException extends ApplicationException {
  constructor(message: string = 'Forbidden') {
    super({
      code: ErrorCode.FORBIDDEN,
      message,
      httpStatus: HttpStatus.FORBIDDEN,
      severity: ErrorSeverity.MEDIUM,
    });
  }
}

export class InvalidTokenException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.INVALID_TOKEN,
      message: 'Invalid or malformed token',
      httpStatus: HttpStatus.UNAUTHORIZED,
      severity: ErrorSeverity.MEDIUM,
    });
  }
}

export class TokenExpiredException extends ApplicationException {
  constructor() {
    super({
      code: ErrorCode.TOKEN_EXPIRED,
      message: 'Token has expired',
      httpStatus: HttpStatus.UNAUTHORIZED,
      severity: ErrorSeverity.LOW,
    });
  }
}

/**
 * Database-related exceptions
 */
export class DatabaseException extends ApplicationException {
  constructor(message: string, context?: Record<string, any>) {
    super({
      code: ErrorCode.DATABASE_ERROR,
      message: `Database error: ${message}`,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      severity: ErrorSeverity.HIGH,
      context,
    });
  }
}

export class RecordNotFoundException extends ApplicationException {
  constructor(model: string, identifier: string) {
    super({
      code: ErrorCode.RECORD_NOT_FOUND,
      message: `${model} not found`,
      httpStatus: HttpStatus.NOT_FOUND,
      severity: ErrorSeverity.LOW,
      context: { model, identifier },
    });
  }
}

export class DuplicateRecordException extends ApplicationException {
  constructor(model: string, field: string, value: string) {
    super({
      code: ErrorCode.DUPLICATE_RECORD,
      message: `${model} with this ${field} already exists`,
      httpStatus: HttpStatus.CONFLICT,
      severity: ErrorSeverity.LOW,
      context: { model, field, value },
    });
  }
}

/**
 * Validation exceptions
 */
export class ValidationException extends ApplicationException {
  constructor(message: string, errors?: Record<string, any>) {
    super({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      httpStatus: HttpStatus.BAD_REQUEST,
      severity: ErrorSeverity.LOW,
      context: { errors },
    });
  }
}

/**
 * Rate limiting exceptions
 */
export class RateLimitExceededException extends ApplicationException {
  constructor(retryAfter?: number) {
    super({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests, please try again later',
      httpStatus: HttpStatus.TOO_MANY_REQUESTS,
      severity: ErrorSeverity.LOW,
      context: retryAfter ? { retryAfter } : undefined,
    });
  }
}

/**
 * General exceptions
 */
export class InternalServerException extends ApplicationException {
  constructor(message: string = 'Internal server error', context?: Record<string, any>) {
    super({
      code: ErrorCode.INTERNAL_ERROR,
      message,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      severity: ErrorSeverity.CRITICAL,
      context,
      isOperational: false,
    });
  }
}

export class ServiceUnavailableException extends ApplicationException {
  constructor(serviceName: string) {
    super({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: `Service temporarily unavailable: ${serviceName}`,
      httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
      severity: ErrorSeverity.HIGH,
      context: { serviceName },
    });
  }
}
