import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export const db =
  globalDb.prisma ??
  new PrismaClient({
    log: [],
    transactionOptions: { maxWait: 2000, timeout: 8000 },
  });
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;
