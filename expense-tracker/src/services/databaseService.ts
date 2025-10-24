/**
 * Database Service - Handles all database operations using Prisma
 */

import { prisma } from '../lib/prisma';
import { Transaction, Merchant, Category, User } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errorHandling';
import { validateExpense } from '../utils/validation';

interface CreateTransactionData {
  merchantId: number;
  location: string;
  categoryId: number | null;
  amount: string;
  currency: string;
  transactionDate: Date;
  userId: string;
}

interface UpdateTransactionData {
  merchantId?: number;
  location?: string;
  categoryId?: number | null;
  amount?: string;
  currency?: string;
  transactionDate?: Date;
}

interface TransactionFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  categoryId?: number;
  merchantId?: number;
}

class DatabaseService {
  /**
   * Creates a new transaction
   */
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const validation = validateExpense({
      amount: parseFloat(data.amount),
      category: data.categoryId ? 'valid' : 'valid',
      date: data.transactionDate.toISOString(),
      location: data.location,
      merchant: 'valid',
      currency: data.currency || 'USD', // Default to USD if currency is undefined/null
    });

    if (!validation.isValid) {
      throw new ValidationError(validation.error || 'Invalid transaction data');
    }

    return prisma.transaction.create({
      data: {
        ...data,
        currency: data.currency || 'USD', // Ensure currency is never undefined
      },
      include: {
        merchant: true,
        category: true,
      },
    });
  }

  /**
   * Creates multiple transactions in batch
   */
  async createTransactionsBatch(transactions: CreateTransactionData[]): Promise<Transaction[]> {
    return prisma.$transaction(
      transactions.map(data => prisma.transaction.create({
        data: {
          ...data,
          currency: data.currency || 'USD', // Ensure currency is never undefined
        },
        include: {
          merchant: true,
          category: true,
        },
      }))
    );
  }

  /**
   * Gets transaction by ID
   */
  async getTransactionById(id: number, userId: string): Promise<Transaction> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        transactionId: id,
        userId,
      },
      include: {
        merchant: true,
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction;
  }

  /**
   * Gets transactions with filters
   */
  async getTransactions(filters: TransactionFilters): Promise<Transaction[]> {
    
    const where: any = {
      userId: filters.userId,
    };

    if (filters.startDate || filters.endDate) {
      where.transactionDate = {};
      if (filters.startDate) where.transactionDate.gte = filters.startDate;
      if (filters.endDate) where.transactionDate.lte = filters.endDate;
    }

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.merchantId) where.merchantId = filters.merchantId;


    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        merchant: true,
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    return transactions;
  }

  /**
   * Updates a transaction
   */
  async updateTransaction(
    id: number,
    userId: string,
    data: UpdateTransactionData
  ): Promise<Transaction> {
    // Verify transaction exists and belongs to user
    await this.getTransactionById(id, userId);

    return prisma.transaction.update({
      where: { transactionId: id },
      data,
      include: {
        merchant: true,
        category: true,
      },
    });
  }

  /**
   * Updates only the category of a transaction
   */
  async updateTransactionCategory(
    id: number,
    categoryId: number,
    userId: string
  ): Promise<Transaction> {
    // Verify transaction exists and belongs to user
    await this.getTransactionById(id, userId);

    return prisma.transaction.update({
      where: { transactionId: id },
      data: { categoryId },
      include: {
        merchant: true,
        category: true,
      },
    });
  }

  /**
   * Deletes a transaction
   */
  async deleteTransaction(id: number, userId: string): Promise<void> {
    // Verify transaction exists and belongs to user
    await this.getTransactionById(id, userId);

    await prisma.transaction.delete({
      where: { transactionId: id },
    });
  }

  /**
   * Deletes transactions by date range
   */
  async deleteTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await prisma.transaction.deleteMany({
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Creates or finds a merchant
   */
  async findOrCreateMerchant(name: string): Promise<Merchant> {
    const existing = await prisma.merchant.findFirst({
      where: { merchantName: name },
    });

    if (existing) return existing;

    return prisma.merchant.create({
      data: { merchantName: name },
    });
  }

  /**
   * Creates or finds a category
   */
  async findOrCreateCategory(name: string): Promise<Category> {
    const existing = await prisma.category.findFirst({
      where: { categoryName: name },
    });

    if (existing) return existing;

    return prisma.category.create({
      data: { categoryName: name },
    });
  }

  /**
   * Gets all categories
   */
  async getCategories(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { categoryName: 'asc' },
    });
  }

  /**
   * Gets all merchants
   */
  async getMerchants(): Promise<Merchant[]> {
    return prisma.merchant.findMany({
      orderBy: { merchantName: 'asc' },
    });
  }

  /**
   * Gets user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Creates a new user
   */
  async createUser(data: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Gets transaction statistics for a user
   */
  async getTransactionStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) where.transactionDate.lte = endDate;
    }

    const totalCount = await prisma.transaction.count({ where });
    
    // Get all transactions to calculate sum manually since amount is a string
    const transactions = await prisma.transaction.findMany({
      where,
      select: { amount: true }
    });
    
    const totalAmount = transactions.reduce((sum, transaction) => {
      return sum + parseFloat(transaction.amount || '0');
    }, 0);

    return {
      totalCount,
      totalAmount: totalAmount.toString(),
    };
  }

  /**
   * Gets or creates a category by name
   */
  async getOrCreateCategory(categoryName: string): Promise<Category> {
    // First try to find existing category
    let category = await prisma.category.findFirst({
      where: { categoryName: categoryName.trim() }
    });

    // If not found, create it
    if (!category) {
      category = await prisma.category.create({
        data: { categoryName: categoryName.trim() }
      });
    }

    return category;
  }

  /**
   * Gets category breakdown for a user
   */
  async getCategoryBreakdown(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) where.transactionDate.lte = endDate;
    }

    // Get all transactions to calculate sums manually since amount is a string
    const transactions = await prisma.transaction.findMany({
      where,
      select: { 
        categoryId: true, 
        amount: true,
        transactionId: true 
      }
    });

    // Group by categoryId and calculate sums manually
    const grouped = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId || 0;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          _sum: { amount: 0 },
          _count: { transactionId: 0 }
        };
      }
      acc[categoryId]._sum.amount += parseFloat(transaction.amount || '0');
      acc[categoryId]._count.transactionId += 1;
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
