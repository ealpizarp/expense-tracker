import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../src/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  // Check authentication
  const session = await getServerSession(req, res, {});
  const userId = (session?.user as any)?.id || (session?.user as any)?.email;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔍 Transaction API - User session data:', {
    id: (session?.user as any)?.id,
    email: (session?.user as any)?.email,
    selectedUserId: userId
  });

  if (req.method === 'GET') {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: { 
          transactionId: parseInt(id as string),
          userId: userId
        },
        include: {
          merchant: true,
          category: true
        }
      })
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' })
      }
      
      res.status(200).json(transaction)
    } catch (error) {
      console.error('Error fetching transaction:', error)
      res.status(500).json({ error: 'Failed to fetch transaction' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { amount, category, location, currency } = req.body
      
      // Find or create category if provided
      let categoryId = null;
      if (category) {
        let categoryRecord = await prisma.category.findFirst({
          where: { categoryName: category }
        });
        
        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: { categoryName: category }
          });
        }
        categoryId = categoryRecord.categoryId;
      }
      
      const transaction = await prisma.transaction.update({
        where: { transactionId: parseInt(id as string) },
        data: {
          amount: amount ? amount.toString() : undefined,
          categoryId: categoryId,
          location: location,
          currency: currency
        },
        include: {
          merchant: true,
          category: true
        }
      })
      
      res.status(200).json(transaction)
    } catch (error) {
      console.error('Error updating transaction:', error)
      res.status(500).json({ error: 'Failed to update transaction' })
    }
  } else if (req.method === 'DELETE') {
    try {
      // First check if the transaction belongs to the user
      const transaction = await prisma.transaction.findFirst({
        where: { 
          transactionId: parseInt(id as string),
          userId: userId
        }
      });
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      await prisma.transaction.delete({
        where: { transactionId: parseInt(id as string) }
      })
      
      res.status(200).json({ message: 'Transaction deleted successfully' })
    } catch (error) {
      console.error('Error deleting transaction:', error)
      res.status(500).json({ error: 'Failed to delete transaction' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
