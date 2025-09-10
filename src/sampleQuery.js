import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getStock() {
    return await prisma.$queryRaw`
    select itemType, yarnId, fabricId from stock 
    group by itemType, yarnId, fabricId;  
    `
}
let data = await getStock();
console.log(data, "getStock")