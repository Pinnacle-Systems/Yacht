import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
async function getAllDataWithLotDetails(allData) {
    let promises = allData.map(async (item) => {
        item["lotDetails"] = await getLotDetailsForPInwardOrReturn(item.pInwardOrReturnId, item.poItemsId)
        return item
    })
    return Promise.all(promises)
}

async function getLotDetailsForPInwardOrReturn(pInwardOrReturnId, poItemsId) {
    let dataArr = await prisma.poInwardReturnItems.groupBy({
        where: {
            pInwardOrReturnId: parseInt(pInwardOrReturnId),
            poItemsId: parseInt(poItemsId)
        },
        by: ['poItemsId', "lotNo", "stockId", "pInwardOrReturnId", "id"],
        _sum: {
            qty: true,
            weightPerBag: true,
            noOfBags: true,
            noOfRolls: true
        },
    })
    return dataArr.map(item => {
        let newItem = {};
        newItem["id"] = item["id"]
        newItem["stockId"] = item["stockId"]
        newItem["poItemsId"] = item["poItemsId"]
        newItem["pInwardOrReturnId"] = item["pInwardOrReturnId"]
        newItem["lotNo"] = item["lotNo"];
        newItem["noOfBags"] = item?._sum.noOfBags;
        newItem["weightPerBag"] = item?._sum.weightPerBag;
        newItem["noOfRolls"] = item?._sum.noOfRolls;
        newItem["qty"] = item?._sum.qty;
        return newItem
    })
}

export async function getPurchaseInwardItemsLotBreakUp(pInwardOrReturnId) {
    let allData = await prisma.poInwardReturnItems.findMany({
        where: {
            pInwardOrReturnId: parseInt(pInwardOrReturnId)
        },
        distinct: "poItemsId"
    })
    return await getAllDataWithLotDetails(allData)
}




