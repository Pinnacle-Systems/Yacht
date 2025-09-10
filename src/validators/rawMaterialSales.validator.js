import { getStockQtyForRawMaterials } from "../utils/stockHelper.js"

export async function rawMaterialSalesGridValidation(rawMaterialDetails, transType, storeId, branchId) {
    const promises = rawMaterialDetails.map(async (i) => {
        const { qty: stockQty } = await getStockQtyForRawMaterials(transType, i, storeId, branchId, i?.Stock?.id)
        return stockQty >= parseFloat(i.qty);
    })
    return Promise.all(promises)
}

export async function validateRawMaterialSales(rawMaterialDetails, transType, storeId, branchId) {
    const isGridValidationValues = await rawMaterialSalesGridValidation(rawMaterialDetails, transType, storeId, branchId);
    return isGridValidationValues.every(i => JSON.parse(i))
} 