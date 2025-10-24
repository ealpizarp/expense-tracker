/**
 * Application configuration
 */

export const APP_CONFIG = {
  name: 'Expense Tracker',
  version: '1.0.0',
  description: 'AI-powered expense tracking and analysis',
  author: 'Your Name',
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
} as const;

export const UI_CONFIG = {
  theme: {
    primary: 'blue',
    secondary: 'slate',
  },
  animations: {
    duration: 300,
    easing: 'ease-in-out',
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
} as const;
