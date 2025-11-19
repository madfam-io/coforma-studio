/**
 * Application error codes
 * These codes are returned to clients and should remain stable
 */
export enum ErrorCode {
  // Authentication & Authorization (1000-1999)
  UNAUTHORIZED = 'AUTH_001',
  FORBIDDEN = 'AUTH_002',
  INVALID_TOKEN = 'AUTH_003',
  TOKEN_EXPIRED = 'AUTH_004',
  SESSION_EXPIRED = 'AUTH_005',

  // Tenant & Multi-tenancy (2000-2999)
  TENANT_NOT_FOUND = 'TENANT_001',
  TENANT_CONTEXT_MISSING = 'TENANT_002',
  TENANT_ACCESS_DENIED = 'TENANT_003',
  TENANT_SLUG_TAKEN = 'TENANT_004',

  // User Management (3000-3999)
  USER_NOT_FOUND = 'USER_001',
  USER_ALREADY_EXISTS = 'USER_002',
  INVALID_EMAIL = 'USER_003',
  INVALID_PERMISSIONS = 'USER_004',

  // Validation (4000-4999)
  VALIDATION_ERROR = 'VAL_001',
  INVALID_INPUT = 'VAL_002',
  REQUIRED_FIELD_MISSING = 'VAL_003',
  INVALID_FORMAT = 'VAL_004',

  // Database & Data (5000-5999)
  DATABASE_ERROR = 'DB_001',
  RECORD_NOT_FOUND = 'DB_002',
  DUPLICATE_RECORD = 'DB_003',
  CONSTRAINT_VIOLATION = 'DB_004',
  TRANSACTION_FAILED = 'DB_005',

  // Rate Limiting (6000-6999)
  RATE_LIMIT_EXCEEDED = 'RATE_001',

  // General (9000-9999)
  INTERNAL_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  NOT_IMPLEMENTED = 'SYS_003',
  EXTERNAL_SERVICE_ERROR = 'SYS_004',
}

/**
 * Error severity levels for monitoring and alerting
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
