import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 *
 * Instantiate a single instance of PrismaClient and export it across the application.
 * This prevents instantiating PrismaClient multiple times in the same application.
 *
 * Reference: https://www.prisma.io/docs/guides/database/seed-database#manage-prisma-client-in-seed-files
 */

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable so that the value
  // is preserved across module reloads caused by things like HMR.
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };

  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error'],
    });
  }

  prisma = globalWithPrisma.prisma;
}

export default prisma;
