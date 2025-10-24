/**
 * AI Service - Handles all AI-related operations using Gemini API
 */

import { ExternalServiceError } from '../utils/errorHandling';
import { ParsedExpense } from '../types';

interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface CategorizationRequest {
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  location: string;
}

interface CategorizationResult {
  category: string;
}

class AIService {
  private config: GeminiConfig;

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
      model: 'gemini-2.0-flash-exp',
      maxTokens: 2048,
      temperature: 0.1,
    };

    if (!this.config.apiKey) {
      throw new Error('Gemini API key is required');
    }
  }

  /**
   * Categorizes a single expense using AI
   */
  async categorizeExpense(expense: CategorizationRequest): Promise<CategorizationResult> {
    try {
      const prompt = this.createSinglePrompt(expense);
      const response = await this.callGeminiAPI(prompt);
      return this.parseSingleResponse(response);
    } catch (error) {
      console.error('AI categorization failed:', error);
      throw new ExternalServiceError('Gemini', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Categorizes multiple expenses in batch
   */
  async categorizeExpensesBatch(expenses: CategorizationRequest[]): Promise<CategorizationResult[]> {
    try {
      const prompt = this.createBatchPrompt(expenses);
      const response = await this.callGeminiAPI(prompt);
      return this.parseBatchResponse(response, expenses);
    } catch (error) {
      console.error('AI batch categorization failed:', error);
      throw new ExternalServiceError('Gemini', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Generates financial insights based on expense data
   */
  async generateInsights(expenses: ParsedExpense[]): Promise<string> {
    try {
      const prompt = this.createInsightsPrompt(expenses);
      const response = await this.callGeminiAPI(prompt);
      return this.parseInsightsResponse(response);
    } catch (error) {
      console.error('AI insights generation failed:', error);
      throw new ExternalServiceError('Gemini', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Calls Gemini API with retry logic
   */
  private async callGeminiAPI(prompt: string, retries: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: this.config.temperature,
                maxOutputTokens: this.config.maxTokens,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (error) {
        if (attempt === retries) throw error;
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Creates prompt for single expense categorization
   */
  private createSinglePrompt(expense: CategorizationRequest): string {
    return `You are an expert expense categorizer. Categorize this expense into one of these categories:
- Groceries
- Transportation
- Food & Dining
- Entertainment
- Shopping
- Healthcare
- Utilities
- Education
- Travel
- Insurance
- Personal Care
- Home & Garden
- Business
- Gifts & Donations
- Uncategorized

Expense details:
- Merchant: ${expense.merchant}
- Amount: ${expense.amount} ${expense.currency}
- Date: ${expense.date}
- Location: ${expense.location}

Return only the category name as a JSON object: {"category": "CategoryName"}`;
  }

  /**
   * Creates prompt for batch expense categorization
   */
  private createBatchPrompt(expenses: CategorizationRequest[]): string {
    const expensesJson = JSON.stringify(expenses, null, 2);
    
    return `You are an expert expense categorizer. Categorize these expenses into one of these categories:
- Groceries
- Transportation
- Food & Dining
- Entertainment
- Shopping
- Healthcare
- Utilities
- Education
- Travel
- Insurance
- Personal Care
- Home & Garden
- Business
- Gifts & Donations
- Uncategorized

Expenses to categorize:
${expensesJson}

Return an array of JSON objects with the same structure, each containing the category: [{"category": "CategoryName"}, ...]`;
  }

  /**
   * Creates prompt for financial insights
   */
  private createInsightsPrompt(expenses: ParsedExpense[]): string {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Unknown';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return `Analyze these expense patterns and provide 3-5 actionable financial insights:

Total spent: $${totalSpent.toFixed(2)}
Category breakdown: ${JSON.stringify(categoryBreakdown, null, 2)}

Provide insights in a conversational tone, focusing on:
1. Spending patterns and trends
2. Potential savings opportunities
3. Budget recommendations
4. Category-specific advice

Keep each insight concise (1-2 sentences) and actionable.`;
  }

  /**
   * Parses single categorization response
   */
  private parseSingleResponse(response: string): CategorizationResult {
    try {
      const cleaned = this.sanitizeResponse(response);
      const parsed = JSON.parse(cleaned);
      return { category: parsed.category || 'Uncategorized' };
    } catch (error) {
      console.error('Failed to parse single response:', error);
      return { category: 'Uncategorized' };
    }
  }

  /**
   * Parses batch categorization response
   */
  private parseBatchResponse(response: string, originalExpenses: CategorizationRequest[]): CategorizationResult[] {
    try {
      const cleaned = this.sanitizeResponse(response);
      
      const parsed = JSON.parse(cleaned);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      return parsed.map((item, index) => ({
        category: item.category || originalExpenses[index]?.merchant || 'Uncategorized'
      }));
    } catch (error) {
      console.error('❌ Failed to parse batch response:', error);
      console.error('❌ Original response:', response.substring(0, 500));
      console.error('❌ Cleaned response:', this.sanitizeResponse(response).substring(0, 500));
      
      // Fallback: Try to extract categories using regex patterns
      return this.extractCategoriesWithRegex(response, originalExpenses);
    }
  }

  /**
   * Fallback method to extract categories using regex patterns
   */
  private extractCategoriesWithRegex(response: string, originalExpenses: CategorizationRequest[]): CategorizationResult[] {
    try {
      // Look for patterns like "category": "Groceries" or "category": "Food & Dining"
      const categoryMatches = response.match(/"category":\s*"([^"]+)"/g);
      
      if (categoryMatches && categoryMatches.length > 0) {
        const categories = categoryMatches.map(match => {
          const categoryMatch = match.match(/"category":\s*"([^"]+)"/);
          return categoryMatch ? categoryMatch[1] : 'Uncategorized';
        });
        
        
        return originalExpenses.map((_, index) => ({
          category: categories[index] || 'Uncategorized'
        }));
      }
    } catch (regexError) {
      console.error('❌ Regex extraction also failed:', regexError);
    }
    
    // Final fallback: Return all as 'Uncategorized'
    return originalExpenses.map(() => ({ category: 'Uncategorized' }));
  }

  /**
   * Parses insights response
   */
  private parseInsightsResponse(response: string): string {
    return response.trim() || 'Unable to generate insights at this time.';
  }

  /**
   * Sanitizes API response for JSON parsing
   */
  private sanitizeResponse(response: string): string {
    let cleaned = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Simple but effective fix for the main issue: \\", \\" -> ", "
    // This handles the most common malformed JSON pattern from Gemini
    cleaned = cleaned.replace(/\\", \\"/g, '", "');
    
    // Fix double-escaped quotes
    cleaned = cleaned.replace(/\\\\"/g, '\\"');
    
    // Fix any remaining escaped quotes in property names
    cleaned = cleaned.replace(/\\"([a-zA-Z_][a-zA-Z0-9_]*)\\"/g, '"$1"');
    
    // Fix any remaining escaped quotes in string values
    cleaned = cleaned.replace(/\\"([^"]*?)\\"/g, '"$1"');

    return cleaned;
  }
}

export const aiService = new AIService();
export default aiService;
