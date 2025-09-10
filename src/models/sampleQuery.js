// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// let poInwardReturnItemsCount = await prisma.poInwardReturnItems.count({
//     where: {
//         poItemsId: 75
//     }
// })
// console.log(poInwardReturnItemsCount)

// prismaClient.js
import pkg from '@prisma/client';

const { PrismaClient } = pkg;

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

globalForPrisma.prisma = prisma;

export { prisma };
