import { getStockQtyForFinishedGoods } from "../utils/stockHelper.js"

export async function finishedGoodsSalesGridValidation(finishedGoodsDetails, storeId, branchId) {
    const promises = finishedGoodsDetails.map(async (i) => {
        const { qty: stockQty } = await getStockQtyForFinishedGoods(i, storeId, branchId, i?.Stock?.id)
        return stockQty >= parseFloat(i.qty);
    })
    return Promise.all(promises)
}

export async function validateFinishedGoodsSales(finishedGoodsDetails, storeId, branchId) {
    const isGridValidationValues = await finishedGoodsSalesGridValidation(finishedGoodsDetails, storeId, branchId);
    return isGridValidationValues.every(i => JSON.parse(i))
}