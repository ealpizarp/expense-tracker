# Expense Tracker - Next.js + MySQL + AI

A modern, intelligent expense tracking application built with Next.js, TypeScript, MySQL, and AI-powered categorization.

## 🚀 Features

### Core Features

- **Interactive Dashboard**: Visual expense tracking with charts and analytics
- **Multi-View Support**: Month, Quarter, and Year views
- **Expense Management**: Add, edit, and delete expenses with manual category editing
- **Smart Categorization**: AI-powered expense categorization using Google Gemini
- **Gmail Integration**: Automatically import expenses from Gmail emails
- **Multi-Currency Support**: Support for 20+ currencies with real-time conversion
- **Location Tracking**: Track expense locations
- **Date Filtering**: Advanced date range filtering and calendar integration

### AI & Automation

- **AI Categorization**: Automatic expense categorization using Google Gemini API
- **Gmail Email Parsing**: Extract expense data from bank/credit card emails
- **Batch Processing**: Process multiple expenses efficiently
- **Smart Fallbacks**: Rule-based categorization when AI fails

### Data Visualization

- **Interactive Charts**: Pie charts, bar charts, and line charts using Recharts
- **Category Breakdown**: Visual spending analysis by category
- **Daily Trends**: Track spending patterns over time
- **Financial Insights**: AI-generated spending insights and recommendations

### User Experience

- **Google Authentication**: Secure sign-in with Google OAuth
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live data updates without page refreshes
- **Modern UI**: Clean, intuitive interface with glassmorphism effects

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Font Awesome
- **Authentication**: NextAuth.js

### Backend

- **API**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **AI Integration**: Google Gemini API
- **Email Integration**: Gmail API
- **Authentication**: Google OAuth 2.0

### External Services

- **AI Categorization**: Google Gemini 2.5 Flash
- **Email Processing**: Gmail API
- **Currency Conversion**: Custom currency utilities
- **Authentication**: Google OAuth

## 📋 Prerequisites

- Node.js 18+
- MySQL database
- Google Cloud Console project (for Gmail API and Gemini API)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/expense_tracker"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gmail API
NEXT_PUBLIC_GMAIL_CLIENT_ID="your-gmail-client-id"
NEXT_PUBLIC_GMAIL_API_KEY="your-gmail-api-key"

# AI Categorization
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Set up Google Cloud Console

1. Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Gmail API and Gemini API
3. Create OAuth 2.0 credentials for authentication
4. Add your domain to authorized origins

### 5. Set up the Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
expense-tracker/
├── pages/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── expenses/          # Expense CRUD operations
│   │   └── categories/        # Category management
│   ├── _app.tsx              # Next.js app wrapper
│   ├── index.tsx             # Main dashboard page
│   └── currencies.tsx        # Currency demo page
├── src/
│   ├── components/           # React components
│   │   ├── charts/          # Chart components
│   │   ├── CurrencyDisplay.tsx
│   │   ├── CurrencySelector.tsx
│   │   ├── CategoryEditModal.tsx
│   │   └── GmailIntegration.tsx
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Service layer
│   │   ├── databaseService.ts
│   │   └── aiService.ts
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   │   ├── currencyUtils.ts
│   │   ├── gmailIntegration.ts
│   │   ├── aiCategorization.ts
│   │   └── expenseUtils.ts
│   └── constants/           # App constants
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                  # Static assets
```

## 🗄️ Database Schema

### Users Table

- `id`: Primary key
- `email`: User email (unique)
- `name`: User display name
- `image`: Profile image URL
- `createdAt`: Account creation timestamp

### Transactions Table

- `transactionId`: Primary key
- `userId`: Foreign key to Users
- `merchantId`: Foreign key to Merchants
- `categoryId`: Foreign key to Categories
- `amount`: Transaction amount (stored as string)
- `currency`: Transaction currency
- `location`: Transaction location
- `transactionDate`: Transaction date
- `source`: Data source (gmail, manual, etc.)
- `createdAt`: Record creation timestamp

### Merchants Table

- `merchantId`: Primary key
- `merchantName`: Merchant name

### Categories Table

- `categoryId`: Primary key
- `categoryName`: Category name

## 🔌 API Endpoints

### Authentication

- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in with Google
- `POST /api/auth/signout` - Sign out

### Expenses

- `GET /api/expenses` - Get all expenses for user
- `POST /api/expenses` - Create new expense
- `POST /api/expenses/batch` - Create multiple expenses
- `PATCH /api/expenses/update-category` - Update expense category
- `DELETE /api/expenses/[id]` - Delete expense
- `DELETE /api/expenses/delete-by-range` - Delete expenses by date range

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Gmail Integration

- `POST /api/gmail/test-connection` - Test Gmail connection
- `POST /api/gmail/process-emails` - Process emails for expenses

## 🤖 AI Features

### Smart Categorization

The app uses Google Gemini API to automatically categorize expenses based on:

- Merchant name
- Transaction amount
- Location
- Transaction date

### Supported Categories

- Food & Dining
- Groceries
- Transportation
- Entertainment
- Utilities
- Shopping
- Travel
- Healthcare
- Education
- Insurance
- Home & Garden
- Personal Care
- Business
- Gifts & Donations
- Other

### Gmail Integration

- Automatically parse bank/credit card emails
- Extract transaction details using regex patterns
- Batch process multiple emails
- AI-powered categorization of extracted expenses

## 💱 Multi-Currency Support

### Supported Currencies

- **North American**: USD, CAD, MXN
- **South American**: BRL, ARS, CLP, COP, PEN, UYU, VES
- **European**: EUR, GBP, CHF, SEK, NOK, DKK, PLN, CZK, HUF
- **Asian**: JPY, KRW, CNY, INR, THB, SGD, MYR, IDR, PHP
- **Others**: CRC, AUD, NZD

### Features

- Real-time currency conversion
- Currency selector with regional grouping
- Automatic USD conversion for reporting
- Currency display components

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Set up MySQL database (PlanetScale, Railway, or similar)
5. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
NEXT_PUBLIC_GMAIL_CLIENT_ID="your-gmail-client-id"
NEXT_PUBLIC_GMAIL_API_KEY="your-gmail-api-key"
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations

## 🔧 Configuration

### Gmail API Setup

1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Configure scopes for email reading

### Gemini API Setup

1. Enable Gemini API in Google Cloud Console
2. Create API key
3. Set usage limits and quotas
4. Configure for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Recharts](https://recharts.org/) - Chart library
- [Google Gemini](https://ai.google.dev/) - AI categorization
- [Gmail API](https://developers.google.com/gmail) - Email integration
