import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
  pool: Pool | undefined,
  adapter: PrismaPg | undefined
};

// 1. Singleton pattern for the PostgreSQL connection pool
// Hardened with SSL and timeouts for Neon stability.
const pool = globalForPrisma.pool ?? new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Industry-standard way to handle Neon/RDS certificates in Node.js
  },
  max: 5, // Limit development pool size to prevent exhausting Neon free-tier limits
  connectionTimeoutMillis: 30000, // 30s timeout to allow for Neon "wake-up" and slowing networks
  idleTimeoutMillis: 30000, // Close idle connections after 30s
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool;

// 2. Singleton pattern for the Prisma Pg Adapter
const adapter = globalForPrisma.adapter ?? new PrismaPg(pool);

if (process.env.NODE_ENV !== 'production') globalForPrisma.adapter = adapter;

// 3. Singleton pattern for the PrismaClient
// Providing the adapter resolves the 'Using engine type "client" requires adapter' error.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;