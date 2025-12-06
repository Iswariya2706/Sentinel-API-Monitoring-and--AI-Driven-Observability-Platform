export enum ServiceName {
  ORDER_SERVICE = 'order-service',
  PAYMENT_SERVICE = 'payment-service',
  USER_SERVICE = 'user-service',
  INVENTORY_SERVICE = 'inventory-service',
  NOTIFICATION_SERVICE = 'notification-service',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

export interface Developer {
  id: string;
  name: string;
  avatar: string;
}

export interface ApiLog {
  id: string;
  serviceName: ServiceName;
  endpoint: string;
  method: HttpMethod;
  statusCode: number;
  latencyMs: number;
  timestamp: string; // ISO string
  requestSize: number; // bytes
  responseSize: number; // bytes
  status: IssueStatus;
  isRateLimitHit: boolean;
  assignedTo?: string; // Developer ID
}

export interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
}

export interface DashboardStats {
  totalRequests: number;
  slowRequestCount: number; // > 500ms
  brokenRequestCount: number; // 5xx
  rateLimitCount: number; // 429
  avgLatency: number;
  topSlowEndpoints: Array<{ endpoint: string; service: string; avgLatency: number }>;
  requestsOverTime: Array<{ time: string; success: number; error: number; slow: number }>;
}

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'DEVELOPER';
  token: string;
}

export type PageView = 'LOGIN' | 'DASHBOARD' | 'EXPLORER' | 'ISSUES';