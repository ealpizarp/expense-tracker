import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../src/lib/auth';
import { databaseService } from '../../../src/services/databaseService';
import { asyncHandler, handleApiError } from '../../../src/utils/errorHandling';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  const userId = (session?.user as any)?.id || (session?.user as any)?.email;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  console.log('🔍 Update Category API - User session data:', {
    id: (session?.user as any)?.id,
    email: (session?.user as any)?.email,
    selectedUserId: userId
  });

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { transactionId, category } = req.body;

    if (!transactionId || !category) {
      return res.status(400).json({ 
        error: 'Transaction ID and category are required' 
      });
    }

    console.log(`🔄 Updating category for transaction ${transactionId} to ${category}`);

    // First, get or create the category
    const categoryRecord = await databaseService.getOrCreateCategory(category);
    
    // Update the transaction
    const updatedTransaction = await databaseService.updateTransactionCategory(
      transactionId,
      categoryRecord.categoryId,
      userId
    );

    console.log(`✅ Successfully updated transaction ${transactionId} category to ${category}`);

    res.status(200).json({
      success: true,
      transaction: updatedTransaction,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating transaction category:', error);
    const { status, body } = handleApiError(error, req.url);
    res.status(status).json(body);
  }
}

export default asyncHandler(handler);
