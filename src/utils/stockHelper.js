import { PrismaClient } from "@prisma/client";
import { getDateFromDateTimeYear, getStockProperty, substract } from "./helper.js";
import { getTableRecordWithId } from "./helperQueries.js";

const prisma = new PrismaClient()

export async function getStockObject(transType, inwardOrReturn, item, storeId, branchId) {
    let newItem = {};
    newItem["itemType"] = transType;
    newItem["inOrOut"] = inwardOrReturn;
    let poItem;
    if (inwardOrReturn === "DirectInward") {
        poItem = item
    } else {
        poItem = await getTableRecordWithId(item.poItemsId, "poItems")
    }
    if ((transType === "GreyYarn") || (transType === "DyedYarn")) {
        newItem["yarnId"] = parseInt(poItem["yarnId"]);
        newItem["noOfBags"] = parseInt(item["noOfBags"]);
        if (inwardOrReturn === "PurchaseReturn") {
            newItem["noOfBags"] = substract(0, parseFloat(item["noOfBags"]))
        } else {
            newItem["noOfBags"] = parseFloat(item["noOfBags"])
        }
    } else if ((transType === "GreyFabric") || (transType === "DyedFabric")) {
        newItem["fabricId"] = parseInt(poItem["fabricId"]);
        newItem["designId"] = parseInt(poItem["designId"]);
        newItem["gaugeId"] = parseInt(poItem["gaugeId"]);
        newItem["loopLengthId"] = parseInt(poItem["loopLengthId"]);
        newItem["gsmId"] = parseInt(poItem["gsmId"]);
        newItem["kDiaId"] = parseInt(poItem["kDiaId"]);
        newItem["fDiaId"] = parseInt(poItem["fDiaId"]);
        if (inwardOrReturn === "PurchaseReturn") {
            newItem["noOfRolls"] = substract(0, parseFloat(item["noOfRolls"]))
        } else {
            newItem["noOfRolls"] = parseFloat(item["noOfRolls"])
        }
    } else if (transType === "Accessory") {
        newItem["accessoryId"] = parseInt(poItem["accessoryId"])
        newItem["sizeId"] = poItem["sizeId"] ? parseInt(poItem["sizeId"]) : undefined;
    }
    newItem["uomId"] = parseInt(poItem["uomId"])
    newItem["colorId"] = parseInt(poItem["colorId"])
    if (inwardOrReturn === "PurchaseReturn") {
        newItem["qty"] = substract(0, parseFloat(item["qty"]))
    } else {
        newItem["qty"] = parseFloat(item["qty"])
    }
    newItem["price"] = parseFloat(poItem["price"])
    newItem["lotNo"] = item["lotNo"] ? item["lotNo"] : null;
    newItem["storeId"] = parseInt(storeId)
    newItem["branchId"] = parseInt(branchId)
    return newItem
}

export const stockCreate = async (tx, poType, inwardOrReturn, item, storeId, branchId) => {
    let stockObject = await getStockObject(poType, inwardOrReturn, item, storeId, branchId)
    const stockData = await tx.stock.create({
        data: stockObject
    })
    item["stockId"] = stockData.id;
    return item
}

export const createManyStockWithId = async (tx, poType, inwardOrReturn, items, storeId, branchId) => {
    let promises = items.map(async (item) => await stockCreate(tx, poType, inwardOrReturn, item, storeId, branchId))
    return Promise.all(promises);
}

export const stockUpdateOrCreate = async (tx, poType, inwardOrReturn, item, storeId, branchId) => {
    let stockObject = await getStockObject(poType, inwardOrReturn, item, storeId, branchId)

    if (item?.stockId) {
        await tx.stock.update({
            where: {
                id: parseInt(item.stockId)
            },
            data: stockObject
        })
    } else {
        const stockData = await tx.stock.create({
            data: stockObject
        })
        item["stockId"] = stockData.id;
    }
    return item
}


export const updateManyStockWithId = async (tx, poType, inwardOrReturn, items, storeId, branchId) => {
    let promises = items.map(async (item) => await stockUpdateOrCreate(tx, poType, inwardOrReturn, item, storeId, branchId))
    return Promise.all(promises);
}

export async function getStockQtyForRawMaterials(transType, item, storeId, branchId, stockId) {

    const stockObject = await prisma.stock.aggregate(
        {
            where: {
                id: stockId ? {
                    lt: parseInt(stockId)
                } : undefined,
                itemType: transType,
                yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
                colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                designId: item?.designId ? parseInt(item.designId) : undefined,
                gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
                loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
                gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
                sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
                fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
                lotNo: item?.lotNo ? item.lotNo : undefined,
                branchId: parseInt(branchId),
                storeId: parseInt(storeId),
                processId: item.processId ? parseInt(item.processId) : undefined,
            },
            _sum: {
                qty: true,
            }
        })
    return { qty: stockObject?._sum?.qty ? stockObject?._sum?.qty : 0 }
}


export async function getStockQtyForFinishedGoods(item, storeId, branchId, stockId) {
    const stockObject = await prisma.stockForPcs.aggregate(
        {
            where: {
                id: stockId ? {
                    lt: parseInt(stockId)
                } : undefined,
                styleId: item?.styleId ? parseInt(item.styleId) : undefined,
                sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                branchId: parseInt(branchId),
                storeId: parseInt(storeId),
                prevProcessId: item.prevProcessId ? parseInt(item.prevProcessId) : undefined,
                colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            },
            _sum: {
                qty: true,
            }
        })
    return { qty: stockObject?._sum?.qty ? stockObject?._sum?.qty : 0 }
}


export async function getStockReport(itemType, storeId, endDate, branchId) {
    const subQueryItemMatchingQuery = `
    (CASE 
        WHEN stock.yarnid is null 
        then subquerystock.yarnid is null 
        else subquerystock.yarnid = stock.yarnid 
        end
    )  and
    (CASE 
        WHEN stock.fabricid is null 
        then subquerystock.fabricid is null 
        else subquerystock.fabricid = stock.fabricid 
        end
    ) and
    (CASE 
        WHEN stock.accessoryid is null 
        then subquerystock.accessoryid is null 
        else subquerystock.accessoryid = stock.accessoryid 
        end
    ) and
    (CASE 
        WHEN stock.colorId is null 
        then subquerystock.colorId is null 
        else subquerystock.colorId = stock.colorId 
        end
    ) and
    (CASE 
        WHEN stock.designId is null 
        then subquerystock.designId is null 
        else subquerystock.designId = stock.designId 
        end
    ) and
    (CASE 
        WHEN stock.gaugeId is null 
        then subquerystock.gaugeId is null 
        else subquerystock.gaugeId = stock.gaugeId 
        end
    ) and
    (CASE 
        WHEN stock.loopLengthId is null 
        then subquerystock.loopLengthId is null 
        else subquerystock.loopLengthId = stock.loopLengthId 
        end
    ) and
    (CASE 
        WHEN stock.gsmId is null 
        then subquerystock.gsmId is null 
        else subquerystock.gsmId = stock.gsmId 
        end
    ) and
    (CASE 
        WHEN stock.kDiaId is null 
        then subquerystock.kDiaId is null 
        else subquerystock.kDiaId = stock.kDiaId 
        end
    ) and
    (CASE 
        WHEN stock.fDiaId is null 
        then subquerystock.fDiaId is null 
        else subquerystock.fDiaId = stock.fDiaId 
        end
    ) and
    (CASE 
        WHEN stock.sizeId is null 
        then subquerystock.sizeId is null 
        else subquerystock.sizeId = stock.sizeId 
        end
    ) and 
    (CASE 
        WHEN stock.processid is null 
        then subquerystock.processid is null 
        else subquerystock.processid = stock.processid 
        end
    ) and 
    (CASE 
        WHEN stock.storeid is null 
        then subquerystock.storeid is null 
        else subquerystock.storeid = stock.storeid 
        end
    ) and
    (CASE 
        WHEN stock.lotNo is null 
        then subquerystock.lotNo is null 
        else subquerystock.lotNo = stock.lotNo 
        end
    )`
    const qtyQuery = `
    COALESCE((select sum(qty) 
from stock subquerystock
where createdAt <= '${getDateFromDateTimeYear(endDate ? endDate : new Date())} 23:59:59' and 
${subQueryItemMatchingQuery}
${itemType ? `and itemType ='${itemType}'` : ""} 
${storeId ? `and storeId =${storeId}` : ""}
),0)
    `
    const bagsQuery = `
    COALESCE((select sum(noOfBags) 
from stock subquerystock
where createdAt <= '${getDateFromDateTimeYear(endDate ? endDate : new Date())} 23:59:59' and 
${subQueryItemMatchingQuery}
${itemType ? `and itemType ='${itemType}'` : ""} 
${storeId ? `and storeId =${storeId}` : ""}
),0)
    `
    const rollsQuery = `
    COALESCE((select sum(noOfRolls) 
from stock subquerystock
where createdAt <= '${getDateFromDateTimeYear(endDate ? endDate : new Date())} 23:59:59' and 
${subQueryItemMatchingQuery}
${itemType ? `and itemType ='${itemType}'` : ""} 
${storeId ? `and storeId =${storeId}` : ""}
),0)
    `

    const commonFields = `UnitOfMeasurement.NAME as Uom,
    COLOR.NAME as Color,
    PROCESS.NAME AS Process,
    lotNo as Lot_No,
    LOCATION.storeName as Store, 
    BRANCH.branchName as Location,`
    const sql = `select * from (SELECT
    itemType as Item_Type,
    ${itemType.includes("Yarn") ?
            `YARN.aliasName as Yarn,
            ${commonFields}
            ${bagsQuery} AS No_Of_Bags, 
            `
            : (itemType.includes("Fabric")
                ? `
            FABRIC.ALIASNAME as Fabric,
            DESIGN.NAME as Design,
            GAUGE.NAME as Gauge,
            LOOPLENGTH.NAME as LoopLength,
            GSM.NAME as Gsm,
            KDIA.NAME as KDia,
            FDIA.NAME as FDia,
            ${commonFields}
            ${rollsQuery} AS No_Of_Rolls,
            ` : `
            ACCESSORY.ALIASNAME as Accessory,
            SIZE.NAME as Size,
            ${commonFields}
            `)
        }
        FORMAT(${qtyQuery},3) as Qty
    FROM STOCK 
    LEFT JOIN Location ON STOCK.STOREID = LOCATION.ID
    LEFT JOIN BRANCH ON BRANCH.ID = LOCATION.LocationID 
    LEFT JOIN YARN ON YARN.ID = STOCK.YARNID
    LEFT JOIN FABRIC ON FABRIC.ID = STOCK.FABRICID
    LEFT JOIN ACCESSORY ON ACCESSORY.ID = STOCK.ACCESSORYID
    LEFT JOIN COLOR ON COLOR.ID = STOCK.COLORID
    LEFT JOIN UnitOfMeasurement ON UnitOfMeasurement.ID = STOCK.UOMID
    LEFT JOIN DESIGN ON DESIGN.ID = STOCK.DESIGNID
    LEFT JOIN GAUGE ON GAUGE.ID = STOCK.GAUGEID
    LEFT JOIN LOOPLENGTH ON LOOPLENGTH.ID = STOCK.LOOPLENGTHID
    LEFT JOIN GSM ON GSM.ID = STOCK.GSMID
    LEFT JOIN SIZE ON SIZE.ID = STOCK.SIZEID
    LEFT JOIN DIA KDIA ON KDIA.ID = STOCK.KDIAID
    LEFT JOIN DIA FDIA ON FDIA.ID = STOCK.FDIAID 
    LEFT JOIN PROCESS ON PROCESS.ID = STOCK.PROCESSID
    ${itemType ? `where itemType ='${itemType}'` : ""} 
    ${storeId ? `and storeId =${storeId}` : ""}
    ${branchId ? `and branchId =${branchId}` : ""}
    GROUP BY 
    ITEMTYPE,
    yarnid,fabricid, accessoryid, colorid,uomid, designid, gaugeid,loopLengthId, gsmId,sizeId,kDIaId,fDiaId,storeId,processId,
    YARN.aliasName, 
    FABRIC.ALIASNAME,
    ACCESSORY.ALIASNAME,
    COLOR.NAME,
    UnitOfMeasurement.NAME,
    DESIGN.NAME,
    GAUGE.NAME,
    LOOPLENGTH.NAME,
    GSM.NAME,
    SIZE.NAME,
    KDIA.NAME,
    FDIA.NAME,
    PROCESS.NAME,
    STOREID,
    lotNo,
    LOCATION.storeName, 
    BRANCH.branchName)t where qty > 0
        `
    return await prisma.$queryRawUnsafe(sql)
}
export async function getFinishedGoodsStockReport(storeId, endDate, branchId) {
    const subQueryItemMatchingQuery = `
    subquerystock.styleid = stockForPcs.styleid
    and
    subquerystock.colorId = stockForPcs.colorId
    and
    subquerystock.sizeId = stockForPcs.sizeId
    and
    subquerystock.uomId = stockForPcs.uomId
    and (CASE
        WHEN stockForPcs.portionId is null
        then subquerystock.portionId is null
        else subquerystock.portionId = stockForPcs.portionId
        end)
    and (CASE
        WHEN stockForPcs.prevProcessId is null
        then subquerystock.prevProcessId is null
        else subquerystock.prevProcessId = stockForPcs.prevProcessId
        end
    ) and
    (CASE
        WHEN stockForPcs.storeid is null
        then subquerystock.storeid is null
        else subquerystock.storeid = stockForPcs.storeid
        end
    ) 
   `
    const qtyQuery = `
    COALESCE((select sum(qty) 
from stockForPcs subquerystock
where createdAt <= '${getDateFromDateTimeYear(endDate ? endDate : new Date())} 23:59:59'
and ${subQueryItemMatchingQuery}
${storeId ? `and storeId =${storeId}` : ""}
),0)
    `
    const sql = `select style.sku as Style,portion.name as Portion, color.name as Color, unitOfMeasurement.name as Uom, 
    size.name as Size, IF(stockForPcs.prevProcessId is null, "Cutting",process.name) as Process, Location.storeName as Store,
    Branch.branchName as Location,
    FORMAT(${qtyQuery},3) as Qty
    from stockforpcs
    left join style on style.id = stockForPcs.styleId
    left join size on size.id = stockForPcs.sizeId
    left join color on color.id = stockForPcs.colorId
    left join process on process.id = stockForPcs.prevProcessId
    left join portion on portion.id = stockForPcs.portionId
    left join unitOfMeasurement on unitOfMeasurement.id = stockForPcs.uomId
    left join Location ON stockforpcs.storeId = Location.id 
    left join Branch ON Branch.id = Location.locationId 
    ${storeId ? `where stockforpcs.storeId =${storeId}` : ""}
    ${branchId ? `and branchId =${branchId}` : ""}
    and createdAt <= '${getDateFromDateTimeYear(endDate ? endDate : new Date())} 23:59:59'
    group by stockForPcs.styleId,stockForPcs.portionId, stockForPcs.sizeId, stockForPcs.prevProcessId, stockForPcs.colorId, 
    stockForPcs.uomId, stockForPcs.storeid
    having sum(stockforpcs.qty) > 0
        `

    return await prisma.$queryRawUnsafe(sql)
}




export async function getPriceFromStock(fabricId, colorId, gsmId, gaugeId, loopLengthId, fDiaId, kDiaId, lotNo, itemType, uomId, designId, storeId, branchId) {

    const sql = `select price as stockPrice  from stock  where fabricId=${fabricId} and colorId=${colorId}   and storeId=${storeId}
 and designId=${designId}  and gsmId=${gsmId}  and loopLengthId=${loopLengthId}  and kDiaId=${kDiaId} and branchId=${branchId}
  and fDiaId=${fDiaId}  and uomId=${uomId}  and gaugeId=${gaugeId}  and lotNo=${lotNo} and qty > 0 and itemType="DyedFabric"
        `
    let price = await prisma.$queryRawUnsafe(sql);


    return price[0]


}




export async function getStockReportForCuttingDelivery(storeId, itemType, pagination = true, pageNumber, dataPerPage) {

    const sql = `select fabric.name as fabricName,color.name,itemType,yarnId,accessoryId,colorId,uomId,designId,gaugeId,loopLengthId,gsmId,sizeId,lotNo,
    fabricId, kDiaId,fDiaId,storeId,branchId,
sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock left join color on color.id=stock.colorid left join fabric on fabric.id=stock.fabricId   where itemType="${itemType}"
 group By itemType,yarnId,accessoryId,colorId,uomId,designId,gaugeId,loopLengthId,gsmId,sizeId,lotNo,fabricId,
kDiaId,fDiaId,storeId,branchId
        `
    let data = await prisma.$queryRawUnsafe(sql);

    data = data.filter(item => parseFloat(item.stockQty) > 0);

    let stockArray = [];

    for (let i = 0; i < data?.length; i++) {
        let stockData = data[i]
        let stockPrice = (await getPriceFromStock(stockData?.fabricId, stockData?.colorId, stockData?.gsmId, stockData?.gaugeId, stockData?.loopLengthId, stockData?.fDiaId, stockData?.kDiaId, stockData?.lotNo, itemType, stockData?.uomId, stockData?.designId, stockData?.storeId, stockData?.branchId))?.stockPrice
        let obj = { ...stockData, price: stockPrice }

        stockArray.push(obj)
    }
    return stockArray
}




async function getStockReportLotWise(cuttingDeliveryDetailsId, cuttingDeliveryItem) {

    const sql = `select itemType,yarnId,accessoryId,colorId,uomId,designId,gaugeId,loopLengthId,gsmId,sizeId,lotNo,fabricId, kDiaId,fDiaId,storeId,branchId,
sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock  where (cuttingdeliverydetailsid < ${cuttingDeliveryDetailsId} or cuttingdeliverydetailsid is null) and fabricId=${cuttingDeliveryItem.fabricId} and colorId=${cuttingDeliveryItem.colorId} 
 and designId=${cuttingDeliveryItem.designId}  and gsmId=${cuttingDeliveryItem.gsmId}  and loopLengthId=${cuttingDeliveryItem.loopLengthId}  and kDiaId=${cuttingDeliveryItem.kDiaId}
  and fDiaId=${cuttingDeliveryItem.fDiaId}  and uomId=${cuttingDeliveryItem.uomId}  and gaugeId=${cuttingDeliveryItem.gaugeId}  and lotNo=${cuttingDeliveryItem.lotNo} 
 group By itemType,yarnId,accessoryId,colorId,uomId,designId,gaugeId,loopLengthId,gsmId,sizeId,lotNo,fabricId, kDiaId,fDiaId,storeId,branchId
        `
    let data = await prisma.$queryRawUnsafe(sql);


    return data[0]
}


export async function getStockQty(data) {



    let cuttingDeliveryArray = [];
    let cuttingDeliveryDetails = data?.CuttingDeliveryDetails



    for (let i = 0; i < cuttingDeliveryDetails?.length; i++) {
        let cuttingDeliveryItem = cuttingDeliveryDetails[i]
        let obj = {
            ...cuttingDeliveryItem,
            stockRolls: (await getStockReportLotWise(cuttingDeliveryItem?.id, cuttingDeliveryItem))?.stockRolls,
            stockQty: (await getStockReportLotWise(cuttingDeliveryItem?.id, cuttingDeliveryItem))?.stockQty,

        }

        cuttingDeliveryArray.push(obj)
    }



    return cuttingDeliveryArray
} 
