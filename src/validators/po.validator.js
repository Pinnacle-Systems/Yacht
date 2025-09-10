import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function poUpdateValidator(poItems) {
    let childRecords = await poItemsChildRecordsCreatedItems(poItems)
    return childRecords.every(item => item)
}

async function poItemsChildRecordsCreatedItems(poItems) {
    let promises = poItems.map(async (item) => {
        let newQty = parseFloat(item.qty);
        let newBags = item?.noOfBags ? parseInt(item?.noOfBags) : null;
        const oldPoItem = await prisma.poItems.findUnique({
            where: {
                id: parseInt(item.id)
            }
        })
        let oldQty = oldPoItem.qty;
        let oldBags = oldPoItem.noOfBags;

        if ((newQty === oldQty) && (newBags === oldBags)) return true

        let poInwardReturnItemsCount = await prisma.poInwardReturnItems.count({
            where: {
                poItemsId: parseInt(item.id)
            }
        })
        let billEntryItemsCount = await prisma.billEntryItems.count({
            where: {
                poItemsId: parseInt(item.id)
            }
        })
        const isNoChildRecord = (poInwardReturnItemsCount + billEntryItemsCount) === 0;
        return isNoChildRecord
    })
    return Promise.all(promises)
}