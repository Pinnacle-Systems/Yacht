import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function validateSupplierActive(supplierId){
    const supplier = await prisma.party.findUnique({
        where:{
            supplierId: parseInt(supplierId)
        }
    })
    return supplier.active
} 