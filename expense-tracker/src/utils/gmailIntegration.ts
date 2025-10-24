/**
 * Gmail API integration utilities
 */

import { categorizeExpenseWithAI, CategorizationRequest, batchCategorizeExpenses } from './aiCategorization';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
  };
}

export interface ParsedExpense {
  amount: number;
  merchant: string;
  date: string;
  category?: string;
  location?: string;
  currency?: string;
}

export interface GmailConfig {
  clientId: string;
  apiKey: string;
  discoveryDocs: string[];
  scopes: string[];
}

/**
 * Initialize Gmail API using existing OAuth session
 */
export const initializeGmailAPI = async (): Promise<boolean> => {
  try {
    // Get access token from existing session
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    const session = await response.json();
    
    if (!session?.accessToken) {
      throw new Error('No access token available. Please sign in first.');
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Gmail API:', error);
    throw error;
  }
};

/**
 * Authenticate user with Gmail using existing session
 */
export const authenticateGmail = async (): Promise<boolean> => {
  try {
    // Check if user is already authenticated with Google
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    const session = await response.json();
    
    if (!session?.user) {
      throw new Error('User not authenticated. Please sign in first.');
    }

    // Check if we have the necessary Gmail scope
    if (!session.accessToken) {
      throw new Error('Gmail access not granted. Please sign in again to grant Gmail permissions.');
    }

    return true;
  } catch (error) {
    console.error('Gmail authentication failed:', error);
    throw error;
  }
};

/**
 * Get access token from session for Gmail API calls
 */
const getAccessToken = async (): Promise<string> => {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    const session = await response.json();
    
    if (!session?.accessToken) {
      throw new Error('No Gmail access token available. Please sign in again and grant Gmail permissions.');
    }
    
    return session.accessToken;
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    throw new Error('Failed to get access token. Please sign in again.');
  }
};

/**
 * Get emails from a specific sender with rate limiting
 */
export const getEmailsFromSender = async (
  senderEmail: string,
  month: number,
  year: number,
  rateLimitMode: 'conservative' | 'normal' | 'aggressive' = 'normal'
): Promise<GmailMessage[]> => {
  try {
    console.log('🔍 Starting email search:', { senderEmail, month, year, rateLimitMode });
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained successfully');
    
    // Create date range for the month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month
    
    // Format dates for Gmail search (try multiple formats)
    const startDateStr = `${year}/${month.toString().padStart(2, '0')}/01`;
    const endDateStr = `${year}/${month.toString().padStart(2, '0')}/${endDate.getDate().toString().padStart(2, '0')}`;
    
    // Alternative format: YYYY-MM-DD
    const startDateAlt = startDate.toISOString().split('T')[0];
    const endDateAlt = endDate.toISOString().split('T')[0];
    
    console.log('📅 Date range created:', { startDateStr, endDateStr, startDateAlt, endDateAlt });
    
    
    // Try different search query formats
    let searchQuery = `from:${senderEmail} after:${startDateStr} before:${endDateStr}`;
    
    // Try first search with date range
    console.log('🔍 Trying first search query:', searchQuery);
    let searchResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('📧 First search response status:', searchResponse.status);
    
    let searchData = null;
    if (searchResponse.ok) {
      searchData = await searchResponse.json();
      console.log('📊 First search results:', { 
        messagesFound: searchData?.messages?.length || 0, 
        resultSizeEstimate: searchData?.resultSizeEstimate 
      });
    }
    
    // If no results with date range, try different approaches
    if (!searchResponse.ok || !searchData?.messages || searchData.messages.length === 0) {
      console.log('⚠️ No results from first search, trying alternative date format');
      
      // Try alternative date format (YYYY-MM-DD)
      searchQuery = `from:${senderEmail} after:${startDateAlt} before:${endDateAlt}`;
      console.log('🔍 Trying alternative search query:', searchQuery);
      
      searchResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (searchResponse.ok) {
        searchData = await searchResponse.json();
        console.log('📊 Alternative search results:', { 
          messagesFound: searchData?.messages?.length || 0, 
          resultSizeEstimate: searchData?.resultSizeEstimate 
        });
      }
      
      // If still no results, try without date filter to test if emails exist
      if (!searchResponse.ok || !searchData?.messages || searchData.messages.length === 0) {
        console.log('⚠️ Still no results, trying without date filter');
        searchQuery = `from:${senderEmail}`;
        console.log('🔍 Trying fallback search query:', searchQuery);
        
        searchResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (searchResponse.ok) {
          searchData = await searchResponse.json();
          console.log('📊 Fallback search results:', { 
            messagesFound: searchData?.messages?.length || 0, 
            resultSizeEstimate: searchData?.resultSizeEstimate 
          });
        }
      }
    }
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ Gmail API error:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        error: errorText
      });
      
      if (searchResponse.status === 401) {
        throw new Error('Gmail authentication failed. Please sign out and sign in again to refresh your Gmail permissions.');
      }
      
      if (searchResponse.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return getEmailsFromSender(senderEmail, month, year, rateLimitMode);
      }
      
      throw new Error(`Gmail API error: ${searchResponse.status} - ${errorText}`);
    }
    
    let allMessages = searchData?.messages || [];
    let nextPageToken = searchData?.nextPageToken;
    
    console.log('📋 Initial message collection:', { 
      totalMessages: allMessages.length, 
      hasNextPage: !!nextPageToken 
    });
    
    // Fetch all pages of results
    while (nextPageToken) {
      console.log('📄 Fetching next page of results...');
      
      // Add delay to respect rate limits
      if (rateLimitMode === 'conservative') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (rateLimitMode === 'normal') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const nextPageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100&pageToken=${nextPageToken}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!nextPageResponse.ok) {
        console.error(`❌ Error fetching next page: ${nextPageResponse.status}`);
        break;
      }
      
      const nextPageData = await nextPageResponse.json();
      const nextPageMessages = nextPageData?.messages || [];
      
      allMessages = [...allMessages, ...nextPageMessages];
      nextPageToken = nextPageData?.nextPageToken;
      
      console.log('📄 Page fetched:', { 
        newMessages: nextPageMessages.length, 
        totalMessages: allMessages.length, 
        hasNextPage: !!nextPageToken 
      });
      
    }
    
    
    if (allMessages.length === 0) {
      console.log('❌ No messages found, trying final fallback search');
      
      // Try a fallback search without date filters to see if there are any emails from this sender
      const fallbackQuery = `from:${senderEmail}`;
      console.log('🔍 Final fallback search query:', fallbackQuery);
      
      const fallbackResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(fallbackQuery)}&maxResults=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const fallbackMessages = fallbackData.messages || [];
        
        console.log('📊 Final fallback search results:', { 
          messagesFound: fallbackMessages.length, 
          resultSizeEstimate: fallbackData?.resultSizeEstimate 
        });
        
        if (fallbackMessages.length > 0) {
          console.log('✅ Found emails from sender, but none in the specified date range');
        } else {
          console.log('❌ No emails found from this sender at all');
        }
      }
      
      return [];
    }
    
    
    // Get full message details with rate limiting based on mode
    console.log('📨 Starting to fetch full message details for', allMessages.length, 'messages');
    const messageDetails: GmailMessage[] = [];
    const batchSize = rateLimitMode === 'conservative' ? 3 : rateLimitMode === 'normal' ? 5 : 10;
    const delayBetweenBatches = rateLimitMode === 'conservative' ? 2000 : rateLimitMode === 'normal' ? 1000 : 500;
    const delayBetweenRequests = rateLimitMode === 'conservative' ? 500 : rateLimitMode === 'normal' ? 200 : 100;
    
    console.log('⚙️ Rate limiting settings:', { batchSize, delayBetweenBatches, delayBetweenRequests });
    
    for (let i = 0; i < allMessages.length; i += batchSize) {
      const batch = allMessages.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allMessages.length / batchSize)}:`, { 
        batchSize: batch.length, 
        messageIds: batch.map((m: { id: string }) => m.id) 
      });
      
      const batchPromises = batch.map(async (message: { id: string }, index: number) => {
        try {
          // Add delay between individual requests within batch based on mode
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
          }
          
          const messageResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (!messageResponse.ok) {
            if (messageResponse.status === 429) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              // Retry the same message
              return getEmailsFromSender(senderEmail, month, year, rateLimitMode);
            }
            throw new Error(`Failed to fetch message ${message.id}: ${messageResponse.status}`);
          }
          
          return messageResponse.json();
        } catch (error) {
          console.error(`❌ Error fetching message ${message.id}:`, error);
          return null; // Return null for failed messages
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      messageDetails.push(...validResults);
      
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed:`, { 
        successful: validResults.length, 
        failed: batch.length - validResults.length,
        totalProcessed: messageDetails.length 
      });
      
      
      // Add delay between batches (except for the last batch)
      if (i + batchSize < allMessages.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    console.log('🎉 Email fetching completed:', { 
      totalMessages: messageDetails.length,
      originalMessageIds: allMessages.length 
    });
    
    return messageDetails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

/**
 * Parse email content to extract expense information without AI categorization
 */
export const parseExpenseEmailWithoutAI = async (message: any): Promise<ParsedExpense | null> => {
  try {
    console.log('📧 Parsing email without AI:', { messageId: message.id });
    const headers = message.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';
    
    console.log('📋 Email headers:', { subject, from, date });


    // Get HTML content from email parts
    let htmlContent = '';
    if (message.payload.parts) {
      
      // Look for HTML part first
      const htmlPart = message.payload.parts.find((part: any) => part.mimeType === 'text/html');
      if (htmlPart?.body.data) {
        htmlContent = atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else {
        // Fallback to text/plain if no HTML
        const textPart = message.payload.parts.find((part: any) => part.mimeType === 'text/plain');
        if (textPart?.body.data) {
          htmlContent = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    } else if (message.payload.body.data) {
      // Direct body data
      htmlContent = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }


    console.log('📄 HTML content length:', htmlContent.length);
    
    // Parse expense information using HTML content (without AI)
    const expense = await parseExpenseFromTextWithoutAI(htmlContent, from, date);
    
    if (expense) {
      console.log('✅ Successfully parsed expense:', { 
        merchant: expense.merchant, 
        amount: expense.amount, 
        currency: expense.currency 
      });
    } else {
      console.log('❌ Failed to parse expense from email');
    }
    
    return expense;
  } catch (error) {
    console.error('Error parsing email:', error);
    return null;
  }
};

/**
 * Parse email content to extract expense information
 */
export const parseExpenseEmail = async (message: any): Promise<ParsedExpense | null> => {
  try {
    const headers = message.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';


    // Get HTML content from email parts
    let htmlContent = '';
    if (message.payload.parts) {
      
      // Look for HTML part first
      const htmlPart = message.payload.parts.find((part: any) => part.mimeType === 'text/html');
      if (htmlPart?.body.data) {
        htmlContent = atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else {
        // Fallback to text/plain if no HTML
        const textPart = message.payload.parts.find((part: any) => part.mimeType === 'text/plain');
        if (textPart?.body.data) {
          htmlContent = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    } else if (message.payload.body.data) {
      // Direct body data
      htmlContent = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }


    // Parse expense information using HTML content
    const expense = await parseExpenseFromText(htmlContent, from, date);
    
    return expense;
  } catch (error) {
    console.error('Error parsing email:', error);
    return null;
  }
};

/**
 * Parse expense information from text using HTML regex selectors (without AI categorization)
 */
const parseExpenseFromTextWithoutAI = async (text: string, from: string, date: string): Promise<ParsedExpense | null> => {
  console.log('🔍 Parsing expense from text without AI');
  
  // Extract data using HTML regex selectors
  const commerce = text.match(/<p>\s*Comercio:<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>\s*([^<]+)/i)?.[1]?.trim();
  const dateMatch = text.match(/<p>\s*Fecha:<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>\s*([^<]+)/i)?.[1]?.trim();
  const location = text.match(/<p>\s*Ciudad y pa&iacute;s:<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>\s*([^<]+)/i)?.[1]?.trim().replace(',', '.');
  const montoMatch = text.match(/<p>\s*Monto:<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>\s*([^<]+)/i)?.[1]?.trim()?.replace(',', '').split(' ');
  
  console.log('🔍 Extracted data:', { commerce, dateMatch, location, montoMatch });

  // Validate required fields
  if (!commerce || !montoMatch || montoMatch.length < 2) {
    console.log('❌ Validation failed - missing required fields');
    return null;
  }

  const [currency, amountStr] = montoMatch;
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    console.log('❌ Invalid amount - not a number or <= 0:', amountStr, 'parsed as:', amount);
    return null;
  }

  // Parse date with better error handling
  let transactionDate: string;
  try {
    // Try to parse the date from the email first
    if (dateMatch) {
      const parsedDate = new Date(dateMatch);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = parsedDate.toISOString();
      } else {
        // Fallback to email header date
        const headerDate = new Date(date);
        if (!isNaN(headerDate.getTime())) {
          transactionDate = headerDate.toISOString();
        } else {
          // Last resort: current date
          transactionDate = new Date().toISOString();
        }
      }
    } else {
      // Use email header date
      const headerDate = new Date(date);
      if (!isNaN(headerDate.getTime())) {
        transactionDate = headerDate.toISOString();
      } else {
        // Last resort: current date
        transactionDate = new Date().toISOString();
      }
    }
  } catch (error) {
    console.warn('Date parsing failed, using current date:', error);
    transactionDate = new Date().toISOString();
  }

  return {
    amount,
    merchant: commerce,
    date: transactionDate,
    category: 'Other', // Will be updated by AI categorization
    location: location || 'Costa Rica',
    currency: currency
  };
};

/**
 * Parse expense information from text using HTML regex selectors
 */
const parseExpenseFromText = async (text: string, from: string, date: string): Promise<ParsedExpense | null> => {
  
  // Extract data using HTML regex selectors
  const commerce = text.match(/<p>\s*Comercio:<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>\s*([^<]+)/i)?.[1]?.trim();
  const dateMatch = text.match(/<p>\s*Fecha:<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>\s*([^<]+)/i)?.[1]?.trim();
  const location = text.match(/<p>\s*Ciudad y pa&iacute;s:<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>\s*([^<]+)/i)?.[1]?.trim().replace(',', '.');
  const montoMatch = text.match(/<p>\s*Monto:<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>\s*([^<]+)/i)?.[1]?.trim()?.replace(',', '').split(' ');

  // Validate required fields
  if (!commerce || !montoMatch || montoMatch.length < 2) {
    return null;
  }

  const [currency, amountStr] = montoMatch;
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    console.log('❌ Invalid amount - not a number or <= 0:', amountStr, 'parsed as:', amount);
    return null;
  }

  // Parse date with better error handling
  let transactionDate: string;
  try {
    // Try to parse the date from the email first
    if (dateMatch) {
      const parsedDate = new Date(dateMatch);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = parsedDate.toISOString();
      } else {
        // Fallback to email header date
        const headerDate = new Date(date);
        if (!isNaN(headerDate.getTime())) {
          transactionDate = headerDate.toISOString();
        } else {
          // Last resort: current date
          transactionDate = new Date().toISOString();
        }
      }
    } else {
      // Use email header date
      const headerDate = new Date(date);
      if (!isNaN(headerDate.getTime())) {
        transactionDate = headerDate.toISOString();
      } else {
        // Last resort: current date
        transactionDate = new Date().toISOString();
      }
    }
  } catch (error) {
    console.warn('Date parsing failed, using current date:', error);
    transactionDate = new Date().toISOString();
  }

  // Use AI categorization
  const categorizationRequest: CategorizationRequest = {
    merchant: commerce,
    amount,
    location: location || 'Costa Rica',
    date: transactionDate
  };

  try {
    const aiResult = await categorizeExpenseWithAI(categorizationRequest);

    return {
      amount,
      merchant: commerce,
      date: transactionDate,
      category: aiResult.category,
      location: location || 'Costa Rica',
      currency: currency
    };
  } catch (error) {
    console.error('❌ AI categorization failed, using fallback:', error);

    // Fallback to rule-based categorization
    const category = determineCategory(commerce);

    return {
      amount,
      merchant: commerce,
      date: transactionDate,
      category,
      location: location || 'Costa Rica',
      currency: currency
    };
  }
};

/**
 * Determine expense category based on merchant
 */
const determineCategory = (merchant: string): string => {
  const merchantLower = merchant.toLowerCase();

  // Groceries
  if (merchantLower.includes('grocery') || merchantLower.includes('market') || 
      merchantLower.includes('supermarket') || merchantLower.includes('food')) {
    return 'Groceries';
  }

  // Gas/Transportation
  if (merchantLower.includes('gas') || merchantLower.includes('fuel') || 
      merchantLower.includes('shell') || merchantLower.includes('exxon')) {
    return 'Transportation';
  }

  // Restaurants
  if (merchantLower.includes('restaurant') || merchantLower.includes('cafe') || 
      merchantLower.includes('pizza') || merchantLower.includes('burger')) {
    return 'Food & Dining';
  }

  // Online shopping
  if (merchantLower.includes('amazon') || merchantLower.includes('shop')) {
    return 'Shopping';
  }

  // Utilities
  if (merchantLower.includes('electric') || merchantLower.includes('water') || 
      merchantLower.includes('internet') || merchantLower.includes('phone')) {
    return 'Utilities';
  }

  // Healthcare
  if (merchantLower.includes('pharmacy') || merchantLower.includes('medical') || 
      merchantLower.includes('doctor') || merchantLower.includes('hospital')) {
    return 'Healthcare';
  }

  // Entertainment
  if (merchantLower.includes('movie') || merchantLower.includes('theater') || 
      merchantLower.includes('netflix') || merchantLower.includes('spotify')) {
    return 'Entertainment';
  }

  return 'Other';
};

/**
 * Extract location from text
 */
const extractLocation = (text: string): string | undefined => {
  // Look for common location patterns
  const locationPatterns = [
    /(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /([A-Z][a-z]+,\s*[A-Z]{2})/g, // City, State format
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/g // City, Country format
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
};

/**
 * Delete existing transactions in date range before importing new ones
 */
export const deleteExistingTransactions = async (startDate: string, endDate: string, userId: string): Promise<number> => {
  try {
    
    const requestData = {
      startDate: startDate,
      endDate: endDate
    };
    
    
    const response = await fetch('/api/expenses/delete-by-range', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestData),
    });
    

    if (!response.ok) {
      const errorData = await response.json();
      console.error('🗑️ Delete API error response:', errorData);
      console.error('🗑️ Delete API error status:', response.status);
      
      if (response.status === 401) {
        throw new Error(`Authentication failed: Please sign in again. ${errorData.error}`);
      }
      throw new Error(`Failed to delete existing transactions: ${errorData.error}`);
    }

    const result = await response.json();
    return result.deleted;
  } catch (error) {
    console.error('❌ Error deleting existing transactions:', error);
    throw error;
  }
};

/**
 * Store multiple parsed expenses in database using API (batch operation)
 */
export const storeParsedExpensesBatch = async (expenses: ParsedExpense[], userId: string): Promise<void> => {
  try {

    // Prepare transaction data for API with validation
    const transactionData = expenses
      .map(expense => {
        // Parse and validate amount
        let amount: number;
        if (typeof expense.amount === 'number') {
          amount = expense.amount;
        } else {
          amount = parseFloat(expense.amount);
        }
        
        // Skip expenses with invalid amounts
        if (isNaN(amount) || amount <= 0) {
          console.warn('⚠️ Skipping expense with invalid amount:', {
            merchant: expense.merchant,
            amount: expense.amount,
            parsedAmount: amount
          });
          return null;
        }

        // Ensure date is in proper ISO format
        let transactionDate: string;
        try {
          const dateObj = new Date(expense.date);
          if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date from Gmail:', expense.date, 'using current date');
            transactionDate = new Date().toISOString();
          } else {
            transactionDate = dateObj.toISOString();
          }
        } catch (error) {
          console.warn('Date parsing error:', error, 'using current date');
          transactionDate = new Date().toISOString();
        }

        // Validate and clean the expense data
        const cleanExpense = {
          amount: amount,
          category: (expense.category || 'Other').toString().trim(),
          location: (expense.location || 'Costa Rica').toString().trim(),
          currency: (expense.currency || 'CRC').toString().trim(),
          source: 'gmail',
          merchant: expense.merchant.toString().trim(),
          transactionDate: transactionDate
        };
        
        // Log each cleaned expense for debugging
        console.log('📝 Prepared expense for storage:', {
          merchant: cleanExpense.merchant,
          amount: cleanExpense.amount,
          currency: cleanExpense.currency,
          transactionDate: cleanExpense.transactionDate,
          category: cleanExpense.category
        });
        
        return cleanExpense;
      })
      .filter((expense): expense is NonNullable<typeof expense> => expense !== null);

    // Check if we have any valid expenses to store
    if (transactionData.length === 0) {
      console.warn('⚠️ No valid expenses to store after filtering');
      return;
    }

    console.log(`📊 Storing ${transactionData.length} valid expenses out of ${expenses.length} total`);
    
    // Test JSON serialization before sending
    let requestBody;
    try {
      requestBody = JSON.stringify({ expenses: transactionData });
    } catch (jsonError) {
      console.error('❌ Gmail Integration - JSON serialization failed:', jsonError);
      console.error('❌ Gmail Integration - Transaction data that failed:', transactionData);
      throw new Error(`JSON serialization failed: ${jsonError}`);
    }

    // Make batch API request
    const response = await fetch('/api/expenses/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookies for authentication
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error(`Authentication failed: Please sign in again. ${errorData.error}`);
      }
      throw new Error(`Failed to store expenses batch: ${errorData.error}`);
    }

    const result = await response.json();
  } catch (error) {
    console.error('❌ Error storing expenses batch via API:', error);
    throw error;
  }
};

/**
 * Store parsed expense in database using API
 */
export const storeParsedExpense = async (expense: ParsedExpense, userId: string): Promise<void> => {
  try {
    
    // Validate and clean the expense data
    const requestData = {
      amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0,
      category: (expense.category || 'Other').toString().trim(),
      location: (expense.location || 'Costa Rica').toString().trim(),
      currency: (expense.currency || 'CRC').toString().trim(),
      source: 'gmail',
      merchant: expense.merchant.toString().trim(),
      transactionDate: expense.date.toString().trim()
    };
    
    
    
    // Test JSON serialization before sending
    let requestBody;
    try {
      requestBody = JSON.stringify(requestData);
    } catch (jsonError) {
      console.error('❌ Individual Gmail Integration - JSON serialization failed:', jsonError);
      console.error('❌ Individual Gmail Integration - Request data that failed:', requestData);
      throw new Error(`JSON serialization failed: ${jsonError}`);
    }
    
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookies for authentication
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error(`Authentication failed: Please sign in again. ${errorData.error}`);
      }
      throw new Error(`Failed to store expense: ${errorData.error}`);
    }

  } catch (error) {
    console.error('❌ Error storing expense via API:', error);
    throw error;
  }
};

/**
 * Extract transaction information in the specified format
 */
export const extractTransactionInfo = (expense: ParsedExpense) => {
  return {
    Commerce: expense.merchant,
    Date: expense.date,
    Amount: expense.amount.toString(),
    Currency: expense.currency || 'CRC',
    Category: expense.category || 'Other',
    Location: expense.location || 'Costa Rica'
  };
};

/**
 * Add AI categorization to an array of expenses
 * Takes the full array and returns the same array with categories added
 * 
 * @example
 * // Basic usage - categorize all expenses from Gmail
 * const expensesFromGmail = [
 *   { merchant: "Starbucks", amount: 15.50, date: "2024-01-15T10:30:00.000Z", location: "San Jose", currency: "USD" },
 *   { merchant: "Fresh Market", amount: 45.20, date: "2024-01-15T14:20:00.000Z", location: "San Jose", currency: "USD" }
 * ];
 * const categorizedExpenses = await categorizeExpensesWithAI(expensesFromGmail);
 * // Returns the same array but with category field added to each expense
 * 
 * @example
 * // In a React component
 * const handleCategorizeAllExpenses = async () => {
 *   const categorized = await categorizeExpensesWithAI(allMyExpenses);
 *   setExpenses(categorized); // Update state with categorized expenses
 * };
 */

/**
 * Debug function to test AI categorization with sample data
 */
export const testAICategorization = async (): Promise<void> => {
  const now = new Date();
  const sampleExpenses: ParsedExpense[] = [
    {
      amount: 15.50,
      merchant: "Starbucks",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString(), // 8:30 AM
      location: "San Jose, Costa Rica",
      currency: "USD"
    },
    {
      amount: 45.20,
      merchant: "Fresh Market",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 45).toISOString(), // 3:45 PM
      location: "San Jose, Costa Rica",
      currency: "USD"
    },
    {
      amount: 25.00,
      merchant: "Shell",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 15).toISOString(), // 8:15 PM
      location: "San Jose, Costa Rica",
      currency: "USD"
    }
  ];

  
  try {
    const result = await categorizeExpensesWithAI(sampleExpenses);
  } catch (error) {
    console.error('❌ AI categorization test failed:', error);
  }
};
export const categorizeExpensesWithAI = async (expenses: ParsedExpense[]): Promise<ParsedExpense[]> => {
  if (expenses.length === 0) {
    return expenses;
  }


  try {
    // Use batch categorization to get the full array back with categories
    const categorizedExpenses = await batchCategorizeExpenses(expenses);
    return categorizedExpenses;
  } catch (error) {
    console.error('❌ AI categorization failed, using fallback categorization:', error);
    
    // Fallback to rule-based categorization
    return expenses.map(expense => ({
      ...expense,
      category: determineCategory(expense.merchant)
    }));
  }
};

/**
 * Process all emails from a sender and store expenses
 */
export const processEmailsFromSender = async (
  senderEmail: string,
  userId: string,
  month: number,
  year: number,
  rateLimitMode: 'conservative' | 'normal' | 'aggressive' = 'normal'
): Promise<{ processed: number; stored: number; deleted: number; errors: number; transactions: any[] }> => {
  try {
    console.log('🚀 Starting email processing:', { senderEmail, userId, month, year, rateLimitMode });
    const messages = await getEmailsFromSender(senderEmail, month, year, rateLimitMode);
    console.log('📧 Retrieved messages:', messages.length);
    let processed = 0;
    let errors = 0;
    let deleted = 0;
    const rawExpenses: ParsedExpense[] = [];
    const transactions: any[] = [];


    // Calculate date range for deletion
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
    
    
    // Step 0: Delete existing transactions in the date range
    console.log('🗑️ Deleting existing transactions in date range');
    try {
      deleted = await deleteExistingTransactions(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        userId
      );
      console.log('✅ Deleted existing transactions:', deleted);
    } catch (deleteError) {
      console.error('❌ Error deleting existing transactions:', deleteError);
      // Continue with processing even if deletion fails
      deleted = 0;
    }

    // Step 1: Extract all expenses from emails (without AI categorization)
    console.log('📧 Processing', messages.length, 'messages to extract expenses');
    for (const message of messages) {
      try {
        const parsedExpense = await parseExpenseEmailWithoutAI(message);
        if (parsedExpense) {
          rawExpenses.push(parsedExpense);
          console.log('✅ Extracted expense from message:', message.id);
        } else {
          console.log('❌ Failed to extract expense from message:', message.id);
        }
        processed++;
      } catch (error) {
        console.error(`❌ Error processing message ${message.id}:`, error);
        errors++;
      }
    }
    
    console.log('📊 Expense extraction complete:', { 
      processed, 
      extracted: rawExpenses.length, 
      errors 
    });


    // Step 2: Batch categorize all expenses with AI
    let categorizedExpenses: ParsedExpense[] = [];
    if (rawExpenses.length > 0) {
      try {
        
        categorizedExpenses = await batchCategorizeExpenses(rawExpenses);
        
        // Log categorization results
        const categoryCounts = categorizedExpenses.reduce((acc, expense) => {
          acc[expense.category || 'Unknown'] = (acc[expense.category || 'Unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
      } catch (error) {
        console.error('❌ Batch AI categorization failed, using fallback categorization:', error);
        // Fallback to individual rule-based categorization
        categorizedExpenses = rawExpenses.map(expense => ({
          ...expense,
          category: determineCategory(expense.merchant)
        }));
      }
    }

    // Step 3: Store all categorized expenses using batch operation
    let stored = 0;
    if (categorizedExpenses.length > 0) {
      try {
        // Extract transaction info for all expenses
        categorizedExpenses.forEach(expense => {
          const transactionInfo = extractTransactionInfo(expense);
          transactions.push(transactionInfo);
        });
        
        
        // Store all expenses in batch using API
        await storeParsedExpensesBatch(categorizedExpenses, userId);
        stored = categorizedExpenses.length;
      } catch (error) {
        console.error(`❌ Error storing expenses batch:`, error);
        errors++;
        
        // Fallback to individual storage
        for (const expense of categorizedExpenses) {
          try {
            await storeParsedExpense(expense, userId);
            stored++;
          } catch (individualError) {
            console.error(`❌ Error storing individual expense:`, individualError);
            errors++;
          }
        }
      }
    }


    return { processed, stored, deleted, errors, transactions };
  } catch (error) {
    console.error('Error processing emails:', error);
    throw error;
  }
};
