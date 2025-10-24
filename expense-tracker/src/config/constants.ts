/**
 * Application constants
 */

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Transportation',
  'Food & Dining',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Utilities',
  'Education',
  'Travel',
  'Insurance',
  'Personal Care',
  'Home & Garden',
  'Business',
  'Gifts & Donations',
  'Uncategorized',
] as const;

export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#A78BFA', // Violet
  '#FBBF24', // Amber
  '#34D399', // Emerald
  '#F87171', // Rose
] as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
] as const;

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  api: 'yyyy-MM-dd',
  monthYear: 'MMMM yyyy',
  short: 'MM/dd/yyyy',
} as const;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const;

export const EXPENSE_LIMITS = {
  minAmount: 0.01,
  maxAmount: 999999.99,
  maxDescriptionLength: 255,
  maxLocationLength: 100,
  maxMerchantLength: 100,
} as const;

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  currency: /^[A-Z]{3}$/,
  amount: /^\d+(\.\d{1,2})?$/,
} as const;

export const API_ENDPOINTS = {
  expenses: '/api/expenses',
  categories: '/api/categories',
  auth: '/api/auth',
  gmail: '/api/gmail',
  insights: '/api/gemini-insights',
} as const;

export const STORAGE_KEYS = {
  theme: 'expense-tracker-theme',
  preferences: 'expense-tracker-preferences',
  lastSync: 'expense-tracker-last-sync',
} as const;
