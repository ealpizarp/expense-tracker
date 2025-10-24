import { PrismaClient } from '@prisma/client';

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database connection...');
    
    // Check merchants
    const merchants = await prisma.merchant.findMany();
    console.log(`Found ${merchants.length} merchants:`, merchants);
    
    // Check categories
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories:`, categories);
    
    // Check transactions
    const transactions = await prisma.transaction.findMany({
      include: {
        merchant: true,
        category: true
      }
    });
    console.log(`Found ${transactions.length} transactions:`, transactions);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
