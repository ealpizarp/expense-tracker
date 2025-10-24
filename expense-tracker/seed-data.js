import { PrismaClient } from '@prisma/client';

async function seedData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Seeding database with sample data...');
    
    // Create categories
    const groceries = await prisma.category.create({
      data: { categoryName: 'Groceries' }
    });
    
    const transport = await prisma.category.create({
      data: { categoryName: 'Transport' }
    });
    
    const dining = await prisma.category.create({
      data: { categoryName: 'Dining' }
    });
    
    console.log('Created categories:', { groceries, transport, dining });
    
    // Create merchants
    const supermercado = await prisma.merchant.create({
      data: { merchantName: 'Supermercado Central' }
    });
    
    const uber = await prisma.merchant.create({
      data: { merchantName: 'Uber' }
    });
    
    const restaurant = await prisma.merchant.create({
      data: { merchantName: 'Restaurante El Buen Sabor' }
    });
    
    console.log('Created merchants:', { supermercado, uber, restaurant });
    
    // Create transactions
    const transaction1 = await prisma.transaction.create({
      data: {
        merchantId: supermercado.merchantId,
        categoryId: groceries.categoryId,
        amount: '50000',
        currency: 'CRC',
        location: 'San Jose, Costa Rica',
        transactionDate: new Date('2025-10-01')
      }
    });
    
    const transaction2 = await prisma.transaction.create({
      data: {
        merchantId: uber.merchantId,
        categoryId: transport.categoryId,
        amount: '3500',
        currency: 'CRC',
        location: 'San Jose, Costa Rica',
        transactionDate: new Date('2025-10-02')
      }
    });
    
    const transaction3 = await prisma.transaction.create({
      data: {
        merchantId: restaurant.merchantId,
        categoryId: dining.categoryId,
        amount: '25.99',
        currency: 'USD',
        location: 'San Jose, Costa Rica',
        transactionDate: new Date('2025-10-03')
      }
    });
    
    console.log('Created transactions:', { transaction1, transaction2, transaction3 });
    
    console.log('✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
