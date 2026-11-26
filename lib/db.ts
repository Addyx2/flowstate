import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Vercel projects created with Vercel Postgres expose POSTGRES_URL; use it when DATABASE_URL isn't set.
    datasourceUrl: process.env.DATABASE_URL ?? process.env.POSTGRES_URL,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// One client per process: warm across serverless invocations, survives Fast Refresh.
globalForPrisma.prisma = prisma;
