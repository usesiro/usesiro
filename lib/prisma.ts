import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 1. Initialize the PostgreSQL connection pool
// Using 'connectionString' explicitly is safer in Prisma 7
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Wrap the pool in the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Singleton pattern for Next.js HMR (Hot Module Replacement)
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter 
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;