import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { databaseService } from '../../../src/services/databaseService'
import { asyncHandler, handleApiError } from '../../../src/utils/errorHandling'
import { validateExpense } from '../../../src/utils/validation'
import { authOptions } from '../../../src/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // Prioritize ID over email for better consistency
  const userId = (session?.user as any)?.id || (session?.user as any)?.email
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found in session' })
  }

  console.log('🔍 User session data:', {
    id: (session?.user as any)?.id,
    email: (session?.user as any)?.email,
    selectedUserId: userId
  })

  if (req.method === 'GET') {
    try {
      const transactions = await databaseService.getTransactions({ userId })
      res.status(200).json(transactions)
    } catch (error) {
      console.error('❌ Error fetching expenses:', error)
      const { status, body } = handleApiError(error, req.url)
      res.status(status).json(body)
    }
  } else if (req.method === 'POST') {
    try {
      const { description, amount, category, location, currency = 'USD', source, merchant, transactionDate } = req.body
      
      // Use provided merchant name or extract from description
      const merchantName = merchant || (description ? description.split(' - ')[0] : 'Unknown')
      
      // Validate expense data
      const validation = validateExpense({
        amount: parseFloat(amount),
        category,
        date: transactionDate || new Date().toISOString(),
        location: location || 'Unknown',
        merchant: merchantName,
        currency,
      })

      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error })
      }

      // Find or create merchant and category
      const [merchantRecord, categoryRecord] = await Promise.all([
        databaseService.findOrCreateMerchant(merchantName),
        databaseService.findOrCreateCategory(category),
      ])

      // Create transaction
      const transaction = await databaseService.createTransaction({
        merchantId: merchantRecord.merchantId,
        categoryId: categoryRecord.categoryId,
        amount: amount.toString(),
        currency,
        location: location || 'Unknown',
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        userId,
      })

      // Transform to Expense format
      const expense = {
        id: transaction.transactionId,
        description: merchantRecord.merchantName,
        amount: parseFloat(transaction.amount),
        category: categoryRecord.categoryName,
        createdAt: transaction.createdAt.toISOString()
      }
      
      res.status(201).json(expense)
    } catch (error) {
      const { status, body } = handleApiError(error, req.url)
      res.status(status).json(body)
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default asyncHandler(handler)