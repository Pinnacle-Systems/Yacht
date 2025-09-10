import { PrismaClient } from "@prisma/client";
// import { validateSupplierActive } from "./commonValidators.js"
import { substract } from "../utils/helper.js";

const prisma = new PrismaClient()

export default async function billEntyItemsValidation(billEntyItems, billEntryId) {
    let promises = billEntyItems.map(async (billEntryItem) => {
        let aggObj = await prisma.programInwardLotDetail.aggregate({
            where: {
                ProgramInwardProgramDetailsId: {
                    processDeliveryProgramDetailsId: parseInt(billEntryItem.processDeliveryProgramDetailsId)
                },
            },
            _sum: {
                inwardQty: true,
                inwardBags: true,
                inwardRolls: true
            }
        })
        let alreadyInwardedQty = aggObj?._sum?.inwardQty ? aggObj._sum.inwardQty : 0
        let alreadyBillQty = await prisma.billEntryItems.aggregate({
            where: {
                processDeliveryProgramDetailsId: parseInt(billEntryItem.processDeliveryProgramDetailsId),
                id: billEntryId ? {
                    lt: JSON.parse(billEntryId) ? parseInt(billEntryId) : undefined
                } : undefined
            },
            _sum: {
                qty: true
            }
        })
        alreadyBillQty = alreadyBillQty?._sum?.qty ? alreadyBillQty?._sum?.qty : 0
        let balanceQty = substract(alreadyInwardedQty, alreadyBillQty)
        if (parseFloat(billEntryItem.qty) > balanceQty) {
            return false
        }
        return true
    });
    return Promise.all(promises).then(data => data.every(i => i))
}