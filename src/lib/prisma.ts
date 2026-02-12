import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Skip Prisma initialization during build
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL

function createPrismaClient(): PrismaClient {
  if (isBuildTime) {
    // Return a proxy that throws on access during build
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error('Prisma client not available during build')
      }
    })
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && !isBuildTime) globalForPrisma.prisma = prisma

export default prisma
