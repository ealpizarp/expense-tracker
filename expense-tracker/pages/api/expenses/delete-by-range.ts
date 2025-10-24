import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    console.log('🔐 Delete API - Request headers:', req.headers);
    console.log('🔐 Delete API - Request body:', req.body);
    
    const session = await getServerSession(req, res, {});
    console.log('🔐 Delete API - Session received:', session);
    console.log('🔐 Delete API - User from session:', session?.user);
    console.log('🔐 Delete API - User ID:', (session?.user as any)?.id);
    
    const userId = (session?.user as any)?.id || (session?.user as any)?.email;
    if (!userId) {
      console.log('❌ Delete API - No user ID or email found, returning 401');
      console.log('🔐 Delete API - Available user data:', session?.user);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔍 Delete API - User session data:', {
      id: (session?.user as any)?.id,
      email: (session?.user as any)?.email,
      selectedUserId: userId
    });

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    console.log(`🗑️ Deleting transactions for user ${userId} from ${startDate} to ${endDate}`);

    // Build where clause
    const whereClause: any = {
      userId: userId,
      transactionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    // Count transactions before deletion
    const countBefore = await prisma.transaction.count({
      where: whereClause
    });

    console.log(`📊 Found ${countBefore} transactions to delete`);

    if (countBefore === 0) {
      console.log('ℹ️ No transactions found to delete');
      return res.status(200).json({ 
        success: true, 
        deleted: 0,
        message: 'No transactions found to delete' 
      });
    }

    // Delete transactions
    const deleteResult = await prisma.transaction.deleteMany({
      where: whereClause
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} transactions`);

    res.status(200).json({ 
      success: true, 
      deleted: deleteResult.count,
      message: `Successfully deleted ${deleteResult.count} transactions` 
    });

  } catch (error) {
    console.error('❌ Error deleting transactions:', error);
    res.status(500).json({ error: 'Failed to delete transactions' });
  }
}
