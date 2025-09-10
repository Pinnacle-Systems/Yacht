import { PrismaClient } from "@prisma/client";
import { substract } from "../utils/helper.js";
import { getStockQtyForRawMaterials } from "../utils/stockHelper.js";

const prisma = new PrismaClient()

export async function createPoInwardReturnItemsValidation(poInwardReturnItems, inwardOrReturn, poType, poInwardReturnCancelId, storeId, branchId) {
    let isAllItemsValid = await poInwardReturnItemsValidation(poInwardReturnItems, inwardOrReturn, poType, poInwardReturnCancelId, storeId, branchId)
    return isAllItemsValid.every(item => item)
}

async function poInwardReturnItemsValidation(poInwardReturnItems, inwardOrReturn, poType, poInwardReturnCancelId, storeId, branchId) {
    const promises = poInwardReturnItems.map(async (item) => {
        const po = await prisma.poItems.findUnique({
            where: {
                id: parseInt(item.poItemsId)
            }
        })

        const poQty = po.qty;
        const poBags = po?.noOfBags ? po?.noOfBags : 0;

        const inward = await prisma.poInwardReturnItems.aggregate({
            where: {
                poItemsId: parseInt(item.poItemsId),
                PurchaseInwardOrReturn: {
                    inwardOrReturn: "PurchaseInward",
                    id: item?.id ? {
                        lt: parseInt(item?.id)
                    } : undefined
                }
            },
            _sum: {
                qty: true,
                noOfBags: true,
                noOfRolls: true
            }
        })
        const inwardQty = inward?._sum?.qty ? inward?._sum?.qty : 0;
        const inwardBags = inward?._sum?.noOfBags ? inward?._sum?.noOfBags : 0;

        const cancel = await prisma.poInwardReturnItems.aggregate({
            where: {
                poItemsId: parseInt(item.poItemsId),
                PurchaseInwardOrReturn: {
                    inwardOrReturn: "PurchaseCancel",
                    id: item?.id ? {
                        lt: parseInt(item?.id)
                    } : undefined
                }
            },
            _sum: {
                qty: true,
                noOfBags: true,
                noOfRolls: true
            }
        })

        const cancelQty = cancel._sum?.qty ? cancel?._sum.qty : 0;
        const cancelBags = cancel._sum.noOfBags ? cancel._sum.noOfBags : 0;

        const returnItem = await prisma.poInwardReturnItems.aggregate({
            where: {
                poItemsId: parseInt(item.poItemsId),
                PurchaseInwardOrReturn: {
                    inwardOrReturn: "PurchaseReturn",
                    id: item?.id ? {
                        lt: parseInt(item?.id)
                    } : undefined
                }
            },
            _sum: {
                qty: true,
                noOfBags: true,
                noOfRolls: true
            }
        })

        const returnQty = returnItem?._sum?.qty ? returnItem?._sum?.qty : 0;
        const returnBags = returnItem?._sum?.noOfBags ? returnItem?._sum?.noOfBags : 0;


        const actualPoQty = substract(poQty, cancelQty);
        const actualPoBags = substract(poBags, cancelBags)

        const actualInwardedQty = substract(inwardQty, returnQty)
        const actualInwardedBags = substract(inwardBags, returnBags)

        const balanceQty = substract(actualPoQty, actualInwardedQty);
        const balanceBags = substract(actualPoBags, actualInwardedBags);

        if (inwardOrReturn === "PurchaseInward") {
            if (poType === "GreyYarn" || poType === "DyedYarn") {
                if ((parseFloat(item.qty) > balanceQty) || parseInt(item?.noOfBags ? item?.noOfBags : 0) > balanceBags) {
                    return false;
                }
            } else {
                if (parseFloat(item.qty) > balanceQty) {
                    return false;
                }
            }
        } else if (inwardOrReturn === "PurchaseReturn") {
            const { qty: stockQty } = await getStockQtyForRawMaterials(poType, item, storeId, branchId)
            if (stockQty < parseFloat(item.qty)) return false;
            if (poType === "GreyYarn" || poType === "DyedYarn") {
                if ((parseFloat(item.qty) > actualInwardedQty) || parseInt(item?.noOfBags ? item?.noOfBags : 0) > actualInwardedBags) {
                    return false;
                }
            } else {
                if (parseFloat(item.qty) > actualInwardedQty) {
                    return false;
                }
            }
        } else if (inwardOrReturn === "PurchaseCancel") {
            if (poType === "GreyYarn" || poType === "DyedYarn") {
                if ((parseFloat(item.qty) > actualPoQty) || parseInt(item?.noOfBags ? item?.noOfBags : 0) > actualPoBags) {
                    return false;
                }
            } else {
                if (parseFloat(item.qty) > actualPoQty) {
                    return false;
                }
            }
        }
        return true
    })
    return Promise.all(promises)
}