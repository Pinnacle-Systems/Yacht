import { groupAndSumItems } from "../utils/groupbyMultipleKeys.js";
import { getStockQtyForRawMaterials } from "../utils/stockHelper.js";

export async function createProcessDeliveryValidation(programDetails, rawMaterialType, storeId, branchId) {
    const groupedItem = groupAndSumItems(programDetails.flatMap(i => i.rawMaterials),
        [
            'yarnId', 'colorId', 'uomId',
            'fabricId', 'designId', 'guageId', 'loopLengthId', 'gsmId', 'kDiaId', 'fDia',
            'accessoryId', 'sizeId'
        ], "qty");
    let isAllItemsValid = await createDeliveryItemValidation(groupedItem, storeId, branchId, rawMaterialType)
    return isAllItemsValid.every(item => item)
}

export async function createDeliveryItemValidation(groupedItems, storeId, branchId, transType) {
    const promises = groupedItems.map(async (i) => {
        const { qty: stockQty } = await getStockQtyForRawMaterials(transType, i, storeId, branchId, i?.Stock?.id)
        console.log(stockQty, i)
        return stockQty >= parseFloat(i.qty);
    })
    return Promise.all(promises)
}