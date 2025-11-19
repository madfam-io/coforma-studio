/**
 * Shared enums for Coforma Studio
 * These mirror the Prisma schema enums but are available at runtime
 */

export enum TenantRole {
  ADMIN = 'ADMIN',
  FACILITATOR = 'FACILITATOR',
  MEMBER = 'MEMBER',
}

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum FeedbackType {
  IDEA = 'IDEA',
  BUG = 'BUG',
  REQUEST = 'REQUEST',
  RESEARCH_INSIGHT = 'RESEARCH_INSIGHT',
}

export enum FeedbackStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SHIPPED = 'SHIPPED',
  CLOSED = 'CLOSED',
}

export enum FeedbackPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ActionItemStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum IntegrationProvider {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  SLACK = 'SLACK',
  JIRA = 'JIRA',
  ASANA = 'ASANA',
  CLICKUP = 'CLICKUP',
  GOOGLE_CALENDAR = 'GOOGLE_CALENDAR',
  HUBSPOT = 'HUBSPOT',
  SALESFORCE = 'SALESFORCE',
}

export enum IntegrationStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum BadgeType {
  FOUNDING_PARTNER = 'FOUNDING_PARTNER',
  INFLUENCER = 'INFLUENCER',
  TOP_CONTRIBUTOR = 'TOP_CONTRIBUTOR',
  EARLY_ADOPTER = 'EARLY_ADOPTER',
  POWER_USER = 'POWER_USER',
  STRATEGIC_ADVISOR = 'STRATEGIC_ADVISOR',
}

export enum CaseStudyStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
}
