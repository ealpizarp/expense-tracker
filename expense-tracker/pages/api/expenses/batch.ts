import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { databaseService } from '../../../src/services/databaseService';
import { asyncHandler, handleApiError } from '../../../src/utils/errorHandling';
import { validateExpense } from '../../../src/utils/validation';
import { authOptions } from '../../../src/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  const userId = (session?.user as any)?.id || (session?.user as any)?.email;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  console.log('🔍 Batch API - User session data:', {
    id: (session?.user as any)?.id,
    email: (session?.user as any)?.email,
    selectedUserId: userId
  });

  const { expenses } = req.body;

  if (!expenses || !Array.isArray(expenses)) {
    return res.status(400).json({ error: 'Expenses array is required' });
  }

  // Validate all expenses
  for (const expense of expenses) {
    const validation = validateExpense({
      amount: parseFloat(expense.amount),
      category: expense.category || 'Other',
      date: expense.transactionDate || expense.date || new Date().toISOString(),
      location: expense.location || 'Costa Rica',
      merchant: expense.merchant,
      currency: expense.currency || 'CRC',
    });

    if (!validation.isValid) {
      return res.status(400).json({ 
        error: `Invalid expense data: ${validation.error}`,
        expense: expense
      });
    }
  }

  try {
    // Get all unique merchants and categories from expenses
    const uniqueMerchants = Array.from(new Set(expenses.map((e: any) => e.merchant)));
    const uniqueCategories = Array.from(new Set(expenses.map((e: any) => e.category || 'Other')));

    // Find or create merchants and categories
    const [merchantRecords, categoryRecords] = await Promise.all([
      Promise.all(uniqueMerchants.map(name => databaseService.findOrCreateMerchant(name))),
      Promise.all(uniqueCategories.map(name => databaseService.findOrCreateCategory(name))),
    ]);

    // Create lookup maps
    const merchantMap = new Map(merchantRecords.map((m: any) => [m.merchantName, m.merchantId]));
    const categoryMap = new Map(categoryRecords.map((c: any) => [c.categoryName, c.categoryId]));

    // Prepare transaction data
    const transactionData = expenses.map((expense: any) => ({
      amount: expense.amount.toString(),
      currency: expense.currency || 'CRC',
      location: expense.location || 'Costa Rica',
      transactionDate: new Date(expense.transactionDate || expense.date),
      merchantId: merchantMap.get(expense.merchant) as number,
      categoryId: categoryMap.get(expense.category || 'Other') as number,
      userId: userId
    }));

    // Create all transactions in batch
    const result = await databaseService.createTransactionsBatch(transactionData);

    res.status(200).json({ 
      success: true, 
      stored: result.length,
      message: `Successfully stored ${result.length} expenses`
    });

  } catch (error) {
    const { status, body } = handleApiError(error, req.url);
    res.status(status).json(body);
  }
}

export default asyncHandler(handler);