import { PrismaClient } from '@prisma/client';

async function checkTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database structure...');
    
    // Check if we can query the database directly
    const result = await prisma.$queryRaw`SHOW TABLES`;
    console.log('Tables in database:', result);
    
    // Check if there are any tables with different names
    const allTables = await prisma.$queryRaw`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'expense_tracker'`;
    console.log('All tables in expense_tracker:', allTables);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
