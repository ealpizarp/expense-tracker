# Gmail Integration Guide

This guide explains how to set up Gmail integration for automatic expense parsing from emails.

## Prerequisites

1. **Google Cloud Console Project** with Gmail API enabled
2. **OAuth 2.0 credentials** configured
3. **Gmail API** enabled in your Google Cloud project

## Setup Steps

### 1. Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable Gmail API**:

   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins: `http://localhost:3000` (for development)
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### 2. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Gmail API Configuration
NEXT_PUBLIC_GMAIL_CLIENT_ID=your-gmail-client-id
NEXT_PUBLIC_GMAIL_API_KEY=your-gmail-api-key
```

### 3. Gmail API Scopes

The integration uses the following Gmail API scopes:

- `https://www.googleapis.com/auth/gmail.readonly` - Read access to Gmail messages

## How It Works

### 1. User Authentication

- Users click "Connect Gmail" button
- Google OAuth popup opens for Gmail access
- User grants permission to read emails
- Gmail API is initialized with user credentials

### 2. Email Processing

- User enters sender email address (e.g., `noreply@bank.com`)
- App searches Gmail for emails from that sender
- Emails are fetched and parsed for expense information

### 3. Expense Parsing

The app uses regex patterns to extract:

- **Amount**: `$123.45`, `USD 123.45`, `123.45`
- **Merchant**: Text after "at", "from", "@"
- **Date**: Various date formats
- **Category**: Auto-determined from merchant name
- **Location**: Extracted from email content

### 4. Data Storage

- Parsed expenses are stored in your database
- Merchant and category records are created/updated
- Expenses appear in your expense tracker dashboard

## Supported Email Formats

The parser works with common expense email formats:

### Bank Transaction Alerts

```
Subject: Transaction Alert - $45.67 at GROCERY STORE
From: noreply@bank.com

Your card ending in 1234 was used for $45.67 at GROCERY STORE on 01/15/2024.
```

### Credit Card Statements

```
Subject: New transaction on your Visa card
From: alerts@creditcard.com

Transaction: $23.50 at GAS STATION
Date: 01/15/2024
Location: San Jose, CA
```

### Receipt Emails

```
Subject: Your receipt from AMAZON
From: receipts@amazon.com

Order total: $89.99
Merchant: Amazon.com
Date: January 15, 2024
```

## Configuration Options

### Email Processing Limits

- **5 emails**: Quick test
- **10 emails**: Default processing
- **25 emails**: Moderate batch
- **50 emails**: Large batch processing

### Parsing Rules

The app automatically categorizes expenses based on merchant names:

| Merchant Keywords                   | Category       |
| ----------------------------------- | -------------- |
| grocery, market, supermarket, food  | Groceries      |
| gas, fuel, shell, exxon             | Transportation |
| restaurant, cafe, pizza, burger     | Food & Dining  |
| amazon, shop, online, ecommerce     | Shopping       |
| electric, water, internet, phone    | Utilities      |
| pharmacy, medical, doctor, hospital | Healthcare     |
| movie, theater, netflix, spotify    | Entertainment  |

## Troubleshooting

### Common Issues

1. **"Failed to authenticate with Gmail"**

   - Check Gmail API is enabled in Google Cloud Console
   - Verify OAuth credentials are correct
   - Ensure authorized origins include your domain

2. **"No emails found"**

   - Verify sender email address is correct
   - Check if emails exist from that sender
   - Try with a different sender email

3. **"Failed to parse email"**

   - Email format may not be supported
   - Check email content for amount/merchant information
   - Try with different email types

4. **"Failed to store expense"**
   - Check database connection
   - Verify user is authenticated
   - Check API endpoint is working

### Debug Mode

Enable debug logging by checking browser console for:

- Gmail API initialization messages
- Email fetching progress
- Parsing results
- Database storage confirmations

## Security Considerations

1. **OAuth Scopes**: Only requests read-only access to Gmail
2. **Data Privacy**: Emails are processed locally, not stored
3. **User Control**: Users can disconnect Gmail access anytime
4. **API Limits**: Respects Gmail API rate limits

## Advanced Configuration

### Custom Parsing Rules

You can modify the parsing logic in `src/utils/gmailIntegration.ts`:

```typescript
// Add custom amount patterns
const customAmountPattern = /YOUR_CUSTOM_PATTERN/g;

// Add custom merchant patterns
const customMerchantPattern = /YOUR_MERCHANT_PATTERN/g;

// Add custom category rules
const customCategoryRule = (merchant: string, text: string) => {
  if (merchant.includes("your-keyword")) {
    return "Your Category";
  }
  return "Other";
};
```

### Batch Processing

For large-scale processing, consider implementing:

- Background job processing
- Rate limiting
- Progress tracking
- Error recovery

## API Reference

### GmailIntegration Component Props

```typescript
interface GmailIntegrationProps {
  onExpensesImported?: (count: number) => void;
}
```

### ParsedExpense Interface

```typescript
interface ParsedExpense {
  amount: number;
  description: string;
  merchant: string;
  date: string;
  category?: string;
  location?: string;
}
```

## Support

For issues with:

- **Gmail API**: Check Google Cloud Console logs
- **Parsing**: Review email content and patterns
- **Database**: Check API endpoint and database connection
- **Authentication**: Verify OAuth configuration
