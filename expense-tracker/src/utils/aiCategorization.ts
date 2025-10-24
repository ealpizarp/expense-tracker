/**
 * AI-powered expense categorization using Gemini API
 * 
 * This module provides intelligent expense categorization using Google's Gemini API
 * with fallback to Unknown category for reliability.
 */

import { ParsedExpense } from './gmailIntegration';
import { RobustJSONParser, parseJSONWithRetry } from './jsonParser';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CategorizationRequest {
  merchant: string;
  amount: number;
  location?: string;
  date?: string;
}

export interface CategorizationResult {
  category: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Transportation', 
  'Food & Dining',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Education',
  'Insurance',
  'Travel',
  'Home & Garden',
  'Personal Care',
  'Business',
  'Gifts & Donations',
  'Other'
] as const;

// ============================================================================
// GEMINI API CONFIGURATION
// ============================================================================

const GEMINI_CONFIG = {
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  maxRetries: 3,
  baseDelay: 1000,
  maxTokens: 2048, // Reduced to prevent truncation
  temperature: 0.1
} as const;

// ============================================================================
// GEMINI API INTEGRATION
// ============================================================================

/**
 * Safely fetch response from Gemini API with comprehensive error handling
 */
async function callGeminiAPI(prompt: string, attempt = 1): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }


    const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: GEMINI_CONFIG.temperature,
          maxOutputTokens: GEMINI_CONFIG.maxTokens,
          topP: 0.8,
          topK: 10,
          responseMimeType: "application/json"
        }
      })
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API error: ${response.status} - ${errorText}`);
      
      // Retry on specific errors
      if ((response.status === 503 || response.status === 429) && attempt <= GEMINI_CONFIG.maxRetries) {
        const delay = GEMINI_CONFIG.baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return callGeminiAPI(prompt, attempt + 1);
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!responseText.trim()) {
      throw new Error('Empty response from Gemini API');
    }
    
    return responseText;
    
  } catch (error) {
    console.error('❌ Gemini API call failed:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    
    // Retry on network errors
    if (attempt <= GEMINI_CONFIG.maxRetries && error instanceof TypeError) {
      const delay = GEMINI_CONFIG.baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiAPI(prompt, attempt + 1);
    }
    
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitize string to remove control characters and ensure JSON safety
 */
function sanitizeString(str: string): string {
  if (!str) return '';
  
  return str
    // Remove control characters (ASCII 0-31 except tab, newline, carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove any remaining problematic characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================================
// PROMPT GENERATION
// ============================================================================

/**
 * Create prompt for single expense categorization
 */
function createSinglePrompt(request: CategorizationRequest): string {
  const { merchant, amount, location, date } = request;
  
  // Sanitize input strings
  const sanitizedMerchant = sanitizeString(merchant);
  const sanitizedLocation = sanitizeString(location || 'Unknown');
  
  return `Categorize this expense into one of these categories with examples:

- Food & Dining: Starbucks, McDonald's, Burger King, Pizzería, Soda, Restaurante, Café Britt, Subway, KFC, Uber Eats
- Groceries: Walmart, Masxmenos, Auto Mercado, Fresh Market, Supermercado, PriceSmart, Perimercados
- Transportation: Uber, Didi, Shell, Delta, Gas Station, Recope, Quick Lube, Riteve, Car Wash
- Entertainment: Netflix, Spotify, Disney+, Cinemark, YouTube Premium, Twitch, Eventbrite, Bars, XStyle, La Cali, Jogo, Fira
- Utilities: Claro, Kolbi, ICE, Tigo, Internet, Electricidad, Agua, Banco, Insurance
- Shopping: Amazon, Shein, Aliexpress, Zara, H&M, Tienda, Boutique, Nike, Adidas, Electronics
- Travel: Airbnb, Booking, Expedia, Hotel, Hertz, Aerolínea, Avianca, Copa, American Airlines
- Healthcare: Pharmacy, Medical, Doctor, Hospital, Clinics, Dentist, Optometrist
- Education: Schools, Universities, Online Courses, Books, Educational Materials
- Insurance: Car Insurance, Health Insurance, Life Insurance, Property Insurance
- Home & Garden: Home Depot, Hardware Stores, Furniture, Garden Centers, Home Improvement
- Personal Care: Salons, Spas, Gyms, Personal Care Products, Beauty Services
- Business: Office Supplies, Business Services, Professional Services, Software
- Gifts & Donations: Gift Shops, Charities, Donations, Gifts, Fundraising
- Other: Anything not clearly fitting in the above categories

Expense: ${sanitizedMerchant} - $${amount.toFixed(2)} - ${sanitizedLocation} - ${date}

Return only: {"category": "CategoryName"}`;
}

/**
 * Create prompt for batch expense categorization
 */
function createBatchPrompt(expenses: ParsedExpense[]): string {
  // Sanitize and truncate merchant names to prevent JSON issues
  const sanitizedExpenses = expenses.map(expense => ({
    ...expense,
    merchant: sanitizeString(expense.merchant.length > 50 ? expense.merchant.substring(0, 50) + '...' : expense.merchant),
    location: expense.location ? sanitizeString(expense.location) : 'Unknown'
  }));
  
  const expensesJson = JSON.stringify(sanitizedExpenses, null, 2);
  
  return `Categorize each expense into one of these categories with examples:

- Food & Dining: Starbucks, McDonald's, Burger King, Pizzería, Soda, Restaurante, Café Britt, Subway, KFC, Uber Eats
- Groceries: Walmart, Masxmenos, Auto Mercado, Fresh Market, Supermercado, PriceSmart, Perimercados
- Transportation: Uber, Didi, Shell, Delta, Gas Station, Recope, Quick Lube, Riteve, Car Wash
- Entertainment: Netflix, Spotify, Disney+, Cinemark, YouTube Premium, Twitch, Bars, XStyle, La Cali, Jogo, Fira, Campo Lago
- Utilities: Claro, Kolbi, ICE, Tigo, Internet, Electricidad, Agua, Banco, Insurance
- Shopping: Amazon, Shein, Aliexpress, Zara, H&M, Tienda, Boutique, Nike, Adidas, Electronics
- Travel: Airbnb, Booking, Expedia, Hotel, Hertz, Aerolínea, Avianca, Copa, American Airlines
- Healthcare: Pharmacy, Medical, Doctor, Hospital, Clinics, Dentist, Optometrist
- Education: Schools, Universities, Online Courses, Books, Educational Materials
- Insurance: Car Insurance, Health Insurance, Life Insurance, Property Insurance
- Personal Care: Salons, Spas, Gyms, Personal Care Products, Beauty Services, Smart Fit, Fitness First
- Business: Office Supplies, Business Services, Professional Services, Software
- Gifts & Donations: Gift Shops, Charities, Donations, Gifts, Fundraising
- Other: Anything not clearly fitting in the above categories

${expensesJson}

Return the same array with "category" field added. Use only the categories listed above.`;
}

// ============================================================================
// RESPONSE PARSING
// ============================================================================

/**
 * Parse single categorization response
 */
function parseSingleResponse(response: string): CategorizationResult {
  
  const parsed = parseJSONWithRetry<any>(response, 3);
  
  if (!parsed) {
    console.error('❌ Failed to parse single response, using fallback');
    return { category: 'Unknown' };
  }
  
  const category = parsed.category || parsed.Category || 'Other';
  
  if (!EXPENSE_CATEGORIES.includes(category as any)) {
    return { category: 'Other' };
  }
  
  return { category };
}

/**
 * Parse batch categorization response
 */
function parseBatchResponse(response: string, originalExpenses: ParsedExpense[]): ParsedExpense[] {
  
  // Use the robust JSON parser with retry mechanism
  const parsed = parseJSONWithRetry<any[]>(response, 3);
  
  if (!parsed) {
    console.error('❌ All JSON parsing strategies failed, falling back to regex extraction');
    return extractCategoriesWithRegex(response, originalExpenses);
  }
  
  if (!Array.isArray(parsed)) {
    console.error('❌ Response is not an array:', parsed);
    return extractCategoriesWithRegex(response, originalExpenses);
  }
  
  
  return parsed.map((expense: any, index: number) => {
    
    const category = expense.category || 'Unknown';
    
    if (!EXPENSE_CATEGORIES.includes(category as any)) {
      return { ...expense, category: 'Unknown' };
    }
    
    return { ...expense, category };
  });
}

/**
 * Extract categories using regex patterns as a fallback
 */
function extractCategoriesWithRegex(response: string, originalExpenses: ParsedExpense[]): ParsedExpense[] {
  
  try {
    // Look for patterns like "category": "Groceries" or "category": "Food & Dining"
    const categoryMatches = response.match(/"category":\s*"([^"]+)"/g);
    
    if (categoryMatches && categoryMatches.length > 0) {
      const categories = categoryMatches.map(match => {
        const categoryMatch = match.match(/"category":\s*"([^"]+)"/);
        return categoryMatch ? categoryMatch[1] : 'Unknown';
      });
      
      
      return originalExpenses.map((expense, index) => ({
        ...expense,
        category: categories[index] || 'Unknown'
      }));
    }
    
    // If no category matches found, try to extract from the structure
    
    // Look for any quoted strings that might be categories
    const allQuotedStrings = response.match(/"([^"]+)"/g);
    if (allQuotedStrings) {
      const potentialCategories = allQuotedStrings
        .map(match => match.replace(/"/g, ''))
        .filter(str => 
          str.length > 2 && 
          str.length < 50 && 
          !str.includes('{') && 
          !str.includes('}') &&
          !str.includes('[') &&
          !str.includes(']') &&
          !str.includes(':') &&
          !str.includes(',') &&
          !str.match(/^\d+$/) && // Not just numbers
          !str.match(/^\d+\.\d+$/) // Not decimal numbers
        );
      
      
      // Try to map these to our expense categories
      const validCategories = potentialCategories.filter(cat => 
        EXPENSE_CATEGORIES.includes(cat as any)
      );
      
      if (validCategories.length > 0) {
        return originalExpenses.map((expense, index) => ({
          ...expense,
          category: validCategories[index] || 'Unknown'
        }));
      }
    }
    
    return [];
    
  } catch (regexError) {
    console.error('❌ Regex extraction failed:', regexError);
    return [];
  }
}

/**
 * Attempt to repair common JSON issues
 */
function repairJSON(jsonString: string): string {
  try {
    // First try parsing as-is
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    
    let repaired = jsonString;
    
    // Remove control characters first
    repaired = repaired
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove additional control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Fix the specific malformed patterns we're seeing
    repaired = repaired
      // Fix pattern: "merchant": "UBER BV USD-USD COSTA\", \\"date" -> "merchant": "UBER BV USD-USD COSTA", "date"
      .replace(/"([^"]*)\\\",\s*\\\\"([^"]*)"([^"]*):/g, '"$1", "$2$3":')
      // Fix pattern: "merchant": "FRESH MARKET PIEDADES\", \\"date" -> "merchant": "FRESH MARKET PIEDADES", "date"
      .replace(/"([^"]*)\\\",\s*\\\\"([^"]*)"([^"]*):/g, '"$1", "$2$3":')
      // Fix pattern: "amount\": 5, \"merchant" -> "amount": 5, "merchant"
      .replace(/"([^"]*)\\\":\s*([^,}]+),\s*\\\\"([^"]*)"([^"]*):/g, '"$1": $2, "$3$4":')
      // Fix pattern: "location": ". Estados Unidos\", \\"currency" -> "location": ". Estados Unidos", "currency"
      .replace(/"([^"]*)\\\",\s*\\\\"([^"]*)"([^"]*):/g, '"$1", "$2$3":')
      // Fix pattern: "currency": "USD\" } -> "currency": "USD" }
      .replace(/"([^"]*)\\\"\s*}/g, '"$1" }')
      // Fix pattern: "currency": "CRC\" } -> "currency": "CRC" }
      .replace(/"([^"]*)\\\"\s*}/g, '"$1" }');
    
    // Fix unquoted property names (common Gemini API issue)
    repaired = repaired
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys (second pass)
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":'); // Quote unquoted keys (third pass)
    
    // Fix single quotes to double quotes
    repaired = repaired
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/""/g, '"'); // Fix double double quotes
    
    // Fix malformed escape sequences (common Gemini API issue)
    repaired = repaired
      // Fix remaining double-escaped quotes
      .replace(/\\\\"/g, '"')
      // Fix remaining escaped quotes that shouldn't be escaped
      .replace(/\\"/g, '"')
      // Fix double backslashes
      .replace(/\\\\/g, '\\');
    
    // Fix common JSON issues
    repaired = repaired
      // Fix unterminated strings by finding the last complete object
      .replace(/,\s*$/, '') // Remove trailing commas
      .replace(/,\s*\]/, ']') // Remove comma before closing bracket
      .replace(/,\s*\}/, '}') // Remove comma before closing brace
      // Fix truncated arrays/objects
      .replace(/,\s*$/, '') // Remove trailing commas
      .replace(/,\s*$/, ''); // Remove any remaining trailing commas
    
    
    // If still broken, try to extract valid JSON array
    if (repaired.includes('[') && repaired.includes(']')) {
      const startIndex = repaired.indexOf('[');
      const lastBracketIndex = repaired.lastIndexOf(']');
      
      if (startIndex !== -1 && lastBracketIndex !== -1 && lastBracketIndex > startIndex) {
        const extracted = repaired.substring(startIndex, lastBracketIndex + 1);
        
        try {
          JSON.parse(extracted);
          return extracted;
        } catch (extractError) {
          
          // Try to fix incomplete objects in the array
          const fixed = extracted
            .replace(/,\s*$/, '') // Remove trailing comma
            .replace(/,\s*\]/, ']') // Remove comma before closing bracket
            .replace(/\{[^}]*$/, '') // Remove incomplete object at end
            .replace(/,\s*$/, '') // Remove trailing comma
            + ']'; // Close the array
          
          try {
            JSON.parse(fixed);
            return fixed;
          } catch (fixError) {
          }
        }
      }
    }
    
    return repaired;
  }
}

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Categorize a single expense using AI
 */
export async function categorizeExpenseWithAI(
  request: CategorizationRequest
): Promise<CategorizationResult> {
  try {
    
    const prompt = createSinglePrompt(request);
    const response = await callGeminiAPI(prompt);
    const result = parseSingleResponse(response);
    
    return result;
    
  } catch (error) {
    console.error('❌ Single categorization failed:', error);
    return { category: 'Unknown' };
  }
}

/**
 * Categorize multiple expenses using AI
 */
export async function batchCategorizeExpenses(
  expenses: ParsedExpense[]
): Promise<ParsedExpense[]> {
  try {
    
    // Limit batch size to prevent token limit issues
    const maxBatchSize = 10;
    if (expenses.length > maxBatchSize) {
      
      const results: ParsedExpense[] = [];
      for (let i = 0; i < expenses.length; i += maxBatchSize) {
        const chunk = expenses.slice(i, i + maxBatchSize);
        
        const prompt = createBatchPrompt(chunk);
        const response = await callGeminiAPI(prompt);
        const chunkResult = parseBatchResponse(response, chunk);
        
        results.push(...chunkResult);
        
        // Add small delay between chunks to avoid rate limiting
        if (i + maxBatchSize < expenses.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return results;
    }
    
    const prompt = createBatchPrompt(expenses);
    const response = await callGeminiAPI(prompt);
    const result = parseBatchResponse(response, expenses);
    
    return result;
    
  } catch (error) {
    console.error('❌ Batch categorization failed:', error);
    
    return expenses.map(expense => ({
      ...expense,
      category: 'Unknown'
    }));
  }
}

/**
 * Test function for debugging
 */
export async function testAICategorization(): Promise<void> {
  const sampleExpenses: ParsedExpense[] = [
    {
      amount: 15.50,
      merchant: "Starbucks",
      date: new Date().toISOString(),
      location: "San Jose, Costa Rica",
      currency: "USD"
    },
    {
      amount: 45.20,
      merchant: "Fresh Market", 
      date: new Date().toISOString(),
      location: "San Jose, Costa Rica",
      currency: "USD"
    }
  ];

}