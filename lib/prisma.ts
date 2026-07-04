import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  adapter: PrismaPg | undefined;
};

// 1. Singleton pattern for the PostgreSQL connection pool
// Hardened with SSL and timeouts for Neon stability.
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    max: 10, // Increased for concurrent bookings
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

// 2. Singleton pattern for the Prisma Pg Adapter
const adapter = globalForPrisma.adapter ?? new PrismaPg(pool);

if (process.env.NODE_ENV !== "production") globalForPrisma.adapter = adapter;

/**
 * 3. Singleton pattern for the PrismaClient
 * IMPORTANT: We using a unique global key prefix ('__siro_v4_') to ensure
 * that the Next.js dev server refreshes the client when new models are added.
 */
const globalPrismaKey = "__siro_v4_prisma__";
const globalObj = global as any;

export const prisma =
  globalObj[globalPrismaKey] ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalObj[globalPrismaKey] = prisma;
