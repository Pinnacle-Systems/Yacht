export default async function negativeStockValidation(tx) {
    const data = await tx.$queryRaw`
select sum(qty) as qty from stock 
group by yarnId,fabricId,accessoryId,gaugeId,designId,sizeId,colorId, gsmId,loopLengthId,fDiaId,kDiaId,processId,
uomId,storeId,branchId,lotNo
having qty < 0`

    console.log(data, "data")

    if (data.length > 0) {
        throw new Error("Negative Stock Error")
    }
    return
}