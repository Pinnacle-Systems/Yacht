export function getYarnStockItem(checkItem, property, stockData) {
    let item = stockData.find(item =>
        checkItem.prevProcessId === item.prevProcessId
        &&
        checkItem.yarnId === item.yarnId
        &&
        checkItem.colorId === item.colorId
        &&
        checkItem.uomId === item.uomId
        &&
        checkItem.lotNo.toString() === item?.lotNo?.toString()
    )
    if (!item) return 0
    return item["_sum"][property]
}

export function getFabricStockItem(checkItem, property, stockData) {
    let item = stockData.find(item =>
        checkItem.prevProcessId === item.prevProcessId
        &&
        checkItem.fabricId === item.fabricId
        &&
        checkItem.colorId === item.colorId
        &&
        checkItem.uomId === item.uomId
        &&
        checkItem.gaugeId === item.gaugeId
        &&
        checkItem.loopLengthId === item.loopLengthId
        &&
        checkItem.gsmId === item.gsmId
        &&
        checkItem.kDiaId === item.kDiaId
        &&
        checkItem.fDiaId === item.fDiaId
        &&
        checkItem.lotNo.toString() === item?.lotNo?.toString()
    )
    if (!item) return 0
    return item["_sum"][property]
}