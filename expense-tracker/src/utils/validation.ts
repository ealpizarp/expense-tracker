/**
 * Validation utilities for form inputs and data validation
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
};

/**
 * Validates amount (must be positive number)
 */
export const validateAmount = (amount: string | number): ValidationResult => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  return { isValid: true };
};

/**
 * Validates date format (ISO string or Date object)
 */
export const validateDate = (date: string | Date): ValidationResult => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  return { isValid: true };
};

/**
 * Validates required fields
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Validates currency code (3-letter format)
 */
export const validateCurrency = (currency: string): ValidationResult => {
  const currencyRegex = /^[A-Z]{3}$/;
  if (!currencyRegex.test(currency)) {
    return { isValid: false, error: 'Currency must be a 3-letter code (e.g., USD, CRC)' };
  }
  return { isValid: true };
};

/**
 * Validates expense data
 */
export const validateExpense = (expense: {
  amount: number;
  category: string;
  date: string;
  location: string;
  merchant: string;
  currency: string;
}): ValidationResult => {
  const validations = [
    validateAmount(expense.amount),
    validateRequired(expense.category, 'Category'),
    validateDate(expense.date),
    validateRequired(expense.location, 'Location'),
    validateRequired(expense.merchant, 'Merchant'),
    validateCurrency(expense.currency),
  ];

  const firstError = validations.find(v => !v.isValid);
  return firstError || { isValid: true };
};
