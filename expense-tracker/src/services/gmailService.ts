/**
 * Gmail Service - Handles Gmail API integration and email processing
 */

import { ExternalServiceError } from '../utils/errorHandling';
import { ParsedExpense, GmailMessage } from '../types';
import { formatDateForAPI } from '../utils/formatting';

interface GmailConfig {
  clientId: string;
  apiKey: string;
}

interface EmailSearchParams {
  sender: string;
  startDate: Date;
  endDate: Date;
  maxResults?: number;
}

interface ProcessedEmailsResult {
  expenses: ParsedExpense[];
  processed: number;
  errors: number;
  deleted: number;
}

class GmailService {
  private config: GmailConfig;

  constructor() {
    this.config = {
      clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID || '',
      apiKey: process.env.NEXT_PUBLIC_GMAIL_API_KEY || '',
    };

    if (!this.config.clientId || !this.config.apiKey) {
      throw new Error('Gmail configuration is required');
    }
  }

  /**
   * Initializes Gmail API
   */
  async initializeAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Gmail API can only be initialized in browser'));
        return;
      }

      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', () => {
          window.gapi.client.init({
            apiKey: this.config.apiKey,
            clientId: this.config.clientId,
            discoveryDocs: ['https://gmail.googleapis.com/$discovery/rest?version=v1'],
            scope: 'https://www.googleapis.com/auth/gmail.readonly'
          }).then(() => {
            resolve();
          }).catch(reject);
        });
      };
      script.onerror = () => reject(new Error('Failed to load Gmail API'));
      document.head.appendChild(script);
    });
  }

  /**
   * Authenticates user with Gmail
   */
  async authenticateUser(): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('Authentication can only be performed in browser');
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        throw new Error('Gmail API not initialized');
      }
      const user = await authInstance.signIn({
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
      });

      // Get the access token from the user
      const authResponse = (user as any).getAuthResponse();
      return authResponse.access_token;
    } catch (error) {
      throw new ExternalServiceError('Gmail', `Authentication failed: ${error}`);
    }
  }

  /**
   * Searches for emails from a specific sender within date range
   */
  async searchEmails(
    accessToken: string,
    params: EmailSearchParams
  ): Promise<GmailMessage[]> {
    try {
      const query = this.buildSearchQuery(params);
      const response = await this.fetchEmails(accessToken, query, params.maxResults);
      return response.messages || [];
    } catch (error) {
      throw new ExternalServiceError('Gmail', `Email search failed: ${error}`);
    }
  }

  /**
   * Processes emails and extracts expense data
   */
  async processEmails(
    accessToken: string,
    messages: GmailMessage[],
    sender: string
  ): Promise<ProcessedEmailsResult> {
    const expenses: ParsedExpense[] = [];
    let processed = 0;
    let errors = 0;

    for (const message of messages) {
      try {
        const emailContent = await this.fetchEmailContent(accessToken, message.id);
        const expense = this.parseExpenseFromEmail(emailContent, sender);
        
        if (expense) {
          expenses.push(expense);
        }
        processed++;
      } catch (error) {
        console.error(`Failed to process email ${message.id}:`, error);
        errors++;
      }
    }

    return {
      expenses,
      processed,
      errors,
      deleted: 0, // This would be handled by the calling service
    };
  }

  /**
   * Builds Gmail search query
   */
  private buildSearchQuery(params: EmailSearchParams): string {
    const startDate = formatDateForAPI(params.startDate);
    const endDate = formatDateForAPI(params.endDate);
    
    return `from:${params.sender} after:${startDate} before:${endDate}`;
  }

  /**
   * Fetches emails from Gmail API
   */
  private async fetchEmails(
    accessToken: string,
    query: string,
    maxResults: number = 50
  ): Promise<{ messages: GmailMessage[] }> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetches full email content
   */
  private async fetchEmailContent(accessToken: string, messageId: string): Promise<GmailMessage> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Parses expense data from email content
   */
  private parseExpenseFromEmail(email: GmailMessage, sender: string): ParsedExpense | null {
    try {
      const body = this.extractEmailBody(email);
      if (!body) return null;

      const expense = this.extractExpenseData(body);
      if (!expense) return null;

      return {
        merchant: expense.merchant || 'Unknown Merchant',
        amount: expense.amount || 0,
        currency: expense.currency || 'USD',
        date: expense.date || new Date().toISOString(),
        location: expense.location || 'Unknown Location',
        category: 'Uncategorized', // Will be categorized by AI service
      };
    } catch (error) {
      console.error('Failed to parse email:', error);
      return null;
    }
  }

  /**
   * Extracts email body from Gmail message
   */
  private extractEmailBody(email: GmailMessage): string | null {
    const payload = email.payload;
    if (!payload) return null;

    // Try to get body from parts
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }

    // Fallback to main body
    if (payload.body?.data) {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }

    return null;
  }

  /**
   * Extracts expense data from email body using regex patterns
   */
  private extractExpenseData(body: string): Partial<ParsedExpense> | null {
    const patterns = {
      merchant: /Comercio[:\s]+([^\n\r]+)/i,
      amount: /Monto[:\s]+([0-9,]+\.?[0-9]*)/i,
      currency: /(CRC|USD|EUR|GBP)/i,
      date: /Fecha[:\s]+([^\n\r]+)/i,
      location: /Ciudad y país[:\s]+([^\n\r]+)/i,
    };

    const matches = Object.entries(patterns).reduce((acc, [key, pattern]) => {
      const match = body.match(pattern);
      if (match) {
        acc[key] = match[1].trim();
      }
      return acc;
    }, {} as Record<string, string>);

    if (!matches.merchant || !matches.amount) {
      return null;
    }

    return {
      merchant: matches.merchant,
      amount: parseFloat(matches.amount.replace(/,/g, '')),
      currency: matches.currency || 'CRC',
      date: this.parseDate(matches.date),
      location: matches.location || 'Unknown',
    };
  }

  /**
   * Parses date string to ISO format
   */
  private parseDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}

export const gmailService = new GmailService();
export default gmailService;
