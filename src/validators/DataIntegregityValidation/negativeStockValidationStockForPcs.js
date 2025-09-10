export default async function negativeStockValidationStockForPcs(tx) {
    const data = await tx.$queryRaw`
select sum(qty) as qty from stockforpcs
group by styleId, sizeId, storeId, branchId, prevProcessId, uomId, colorId, portionId
having qty < 0`
    if (data.length > 0) {
        throw new Error("Negative Stock Error")
    }
    return
}