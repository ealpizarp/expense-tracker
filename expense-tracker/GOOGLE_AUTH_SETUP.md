# Google Authentication Setup Guide

## Prerequisites

1. A Google Cloud Console account
2. Your expense tracker app running locally

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3001/api/auth/callback/google` (if using port 3001)
     - `http://localhost:3002/api/auth/callback/google` (if using port 3002)
5. Copy your Client ID and Client Secret

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/expense_tracker"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Analysis (existing)
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"
```

Replace the placeholder values with your actual credentials.

## Step 3: Generate NextAuth Secret

Generate a secure secret for NextAuth.js:

```bash
openssl rand -base64 32
```

Use this as your `NEXTAUTH_SECRET` value.

## Step 4: Start the Application

```bash
npm run dev
```

## Step 5: Test Authentication

1. Open your browser and go to `http://localhost:3000`
2. You should see a sign-in page
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected back to your expense tracker dashboard

## Features

- **Secure Authentication**: Users must sign in with Google to access the app
- **User-Specific Data**: Each user only sees their own transactions
- **Profile Display**: User's name, email, and profile picture are shown in the header
- **Sign Out**: Easy sign-out functionality
- **Session Management**: Automatic session handling with NextAuth.js

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:

   - Make sure your redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`
   - Check that the port number matches your running application

2. **"Client ID not found" error**:

   - Verify your `GOOGLE_CLIENT_ID` in `.env.local`
   - Make sure there are no extra spaces or quotes

3. **Database connection issues**:

   - Ensure your MySQL database is running
   - Check your `DATABASE_URL` in `.env.local`

4. **NextAuth secret issues**:
   - Make sure `NEXTAUTH_SECRET` is set and is a secure random string
   - Regenerate if needed using the openssl command above

### Database Schema

The authentication system adds the following tables:

- `users` - User account information
- `accounts` - OAuth provider accounts
- `sessions` - User sessions
- `verification_tokens` - Email verification tokens

The `transactions` table now includes a `user_id` field to associate transactions with users.

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong, unique secrets for production
- Regularly rotate your OAuth credentials
- Consider using environment-specific redirect URIs for production
