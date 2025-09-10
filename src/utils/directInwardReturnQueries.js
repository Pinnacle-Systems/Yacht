import { PrismaClient } from '@prisma/client'
import { substract } from './helper.js'

const prisma = new PrismaClient()
async function getAllDataWithLotDetails(allData) {
    let promises = allData.map(async (item) => {
        item["lotDetails"] = await getLotDetailsForDInwardOrReturn(item.directInwardOrReturnId, item.lotNoCommonIndex)
        return item
    })
    return Promise.all(promises)
}

async function getLotDetailsForDInwardOrReturn(directInwardOrReturnId, lotNoCommonIndex) {
    let dataArr = await prisma.directItems.groupBy({
        where: {
            directInwardOrReturnId: parseInt(directInwardOrReturnId),
            lotNoCommonIndex: Number.isInteger(lotNoCommonIndex) ? parseInt(lotNoCommonIndex) : undefined
        },
        by: ["lotNo", "stockId", "directInwardOrReturnId", "id", "lotNoCommonIndex"],
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
        newItem["lotNoCommonIndex"] = item["lotNoCommonIndex"]
        newItem["directInwardOrReturnId"] = item["directInwardOrReturnId"]
        newItem["lotNo"] = item["lotNo"];
        newItem["noOfBags"] = item?._sum.noOfBags;
        newItem["weightPerBag"] = item?._sum.weightPerBag;
        newItem["noOfRolls"] = item?._sum.noOfRolls;
        newItem["qty"] = item?._sum.qty;
        return newItem
    })
}

export async function getDirectInwardReturnItemsLotBreakUp(directInwardOrReturnId, poType) {
    let allData = await prisma.directItems.findMany({
        where: {
            directInwardOrReturnId: parseInt(directInwardOrReturnId)
        },
        // distinct: poType !== "Accessory" ? "lotNoCommonIndex" : undefined
    })
    return await getAllDataWithLotDetails(allData)
}


async function getAlreadyInwardData(poInwardOrDirectInward, directItemsId, poItemsId, poType) {



    const sql = `
   select  sum(qty) as alreadyInwardedQty,sum(noofrolls) as alreadyInwardedRolls from DirectInwardOrReturn left join directItems
 on DirectInwardOrReturn.id=directItems.DirectInwardOrReturnID
 WHERE  DirectInwardOrReturn.poinwardordirectinward="${poInwardOrDirectInward}" AND  directItems.ID < ${directItemsId} AND directItems.poItemsId=${poItemsId}
 AND DirectInwardOrReturn.poType="${poType}"
    `
    const alreadyInwardData = await prisma.$queryRawUnsafe(sql);

    return alreadyInwardData[0]
}


async function getLotWiseInwardData(lotNO, poItemsId, poInwardOrDirectInward, directItem) {



    let sql
    if (poInwardOrDirectInward == "DirectReturn") {
        sql = `
    select  sum(inwardLotDetails.qty) as lotQty,sum(inwardLotDetails.noofrolls) as lotRolls from DirectInwardOrReturn left join directItems
  on DirectInwardOrReturn.id=directItems.DirectInwardOrReturnID  LEFT JOIN inwardLotDetails on inwardLotDetails.directItemsId=directItems.id
  WHERE  DirectInwardOrReturn.poinwardordirectinward="DirectInward"  AND directItems.id=${directItem?.directItemsId} AND inwardLotDetails.lotNo=${lotNO}
     `
    }
    else {
        sql = `
        select  sum(inwardLotDetails.qty) as lotQty,sum(inwardLotDetails.noofrolls) as lotRolls from DirectInwardOrReturn left join directItems
      on DirectInwardOrReturn.id=directItems.DirectInwardOrReturnID LEFT JOIN inwardLotDetails on inwardLotDetails.directItemsId=directItems.id
     WHERE  directItems.poItemsId=${poItemsId} AND inwardLotDetails.lotNo=${lotNO}
         `
    }

    const alreadyInwardData = await prisma.$queryRawUnsafe(sql);

    return alreadyInwardData[0]
}




async function getLotWiseReturnRolls(lotNo, poItemsId, directReturnItemsId, poInwardOrDirectInward) {
    let returnDatas;
    if (poInwardOrDirectInward == "DirectReturn") {



        returnDatas = `
        select  sum(ReturnLotDetails.qty) as lotQty,sum(ReturnLotDetails.noofrolls) as lotRolls from DirectReturnOrPoReturn left join directReturnItems
      on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId  left join ReturnLotDetails on ReturnLotDetails.directReturnItemsId=directReturnItems.id
      WHERE  DirectReturnOrPoReturn.poinwardordirectinward="${poInwardOrDirectInward}" and ReturnLotDetails.lotNo=${lotNo} AND ReturnLotDetails.directReturnItemsId < ${directReturnItemsId}
         `
    }
    else {
        returnDatas = `
        select sum(ReturnLotDetails.qty) as lotQty,sum(ReturnLotDetails.noOfRolls) as lotRolls from directReturnItems left join DirectReturnOrPoReturn on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId
        left join ReturnLotDetails on ReturnLotDetails.directReturnItemsId=directReturnItems.id
        where poItemsId=${poItemsId}  and DirectReturnOrPoReturn.poInwardOrDirectInward="PurchaseReturn" and ReturnLotDetails.lotNo=${lotNo} and ReturnLotDetails.directReturnItemsId < ${directReturnItemsId}
        `
    }




    const alreadyReturnData = await prisma.$queryRawUnsafe(returnDatas);


    return alreadyReturnData[0]
}



async function getAlreadyInwardDataWithoutLimit(poInwardOrDirectInward, poItemsId, directItem) {



    let sql;
    if (poInwardOrDirectInward == "DirectReturn") {
        sql = `
    select  sum(directItems.qty) as alreadyInwardedQty,sum(directItems.noofrolls) as alreadyInwardedRolls from DirectInwardOrReturn left join directItems
  on DirectInwardOrReturn.id=directItems.DirectInwardOrReturnID  
  WHERE  DirectInwardOrReturn.poinwardordirectinward="DirectInward"  AND directItems.id=${directItem?.directItemsId}
     `
    }
    else if (poInwardOrDirectInward == "PurchaseCancel") {
        sql = `
        select  sum(directItems.qty) as alreadyInwardedQty,sum(directItems.noofrolls) as alreadyInwardedRolls from DirectInwardOrReturn left join directItems
      on DirectInwardOrReturn.id=directItems.DirectInwardOrReturnID
      WHERE  directItems.poItemsId=${poItemsId}
         `
    }
    else {
        sql = `
    select  sum(directItems.qty) as alreadyInwardedQty,sum(directItems.noofrolls) as alreadyInwardedRolls from DirectInwardOrReturn left join directItems
  on DirectInwardOrReturn.id=directItems.DirectInwardOrReturnID
  WHERE  DirectInwardOrReturn.poinwardordirectinward="PurchaseInward"  AND directItems.poItemsId=${poItemsId}
     `
    }


    const alreadyInwardData = await prisma.$queryRawUnsafe(sql);

    return alreadyInwardData[0]
}



export async function getDirectInwardReturnItemsAlreadyData(directInwardOrReturnId, poInwardOrDirectInward, poType, directItems) {
    let directItemsData = [];
    for (let i = 0; i < directItems?.length; i++) {

        let directItem = directItems[i]
        let obj = {
            ...directItem, alreadyInwardedQty: (await getAlreadyInwardData(poInwardOrDirectInward, directItem?.id, directItem?.poItemsId, poType))?.alreadyInwardedQty,
            alreadyInwardedRolls: (await getAlreadyInwardData(poInwardOrDirectInward, directItem?.id, directItem?.poItemsId, poType))?.alreadyInwardedRolls
        }


        directItemsData.push(obj)

    }


    return directItemsData


}




async function getAlreadyReturnData(poInwardOrDirectInward, directReturnItemsId, poItemsId, directItem) {
    let sql;

    if (poInwardOrDirectInward == "DirectReturn") {
        sql = `
        select  sum(qty) as alreadyReturnedQty,sum(noofrolls) as alreadyReturnedRolls from DirectReturnOrPoReturn left join directReturnItems
      on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId
      WHERE  DirectReturnOrPoReturn.poinwardordirectinward="${poInwardOrDirectInward}" AND  directReturnItems.directItemsId = ${directItem?.directItemsId} AND directReturnItems.ID < ${directItem?.id}
         `
    }
    else {
        sql = `
        select  sum(qty) as alreadyReturnedQty,sum(noofrolls) as alreadyReturnedRolls from DirectReturnOrPoReturn left join directReturnItems
      on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId
      WHERE  DirectReturnOrPoReturn.poinwardordirectinward="${poInwardOrDirectInward}" AND  directReturnItems.ID < ${directReturnItemsId} AND directReturnItems.poItemsId=${poItemsId}
         `
    }


    const alreadyReturnData = await prisma.$queryRawUnsafe(sql);

    return alreadyReturnData[0]
}






async function getStockData(directItem, poInwardOrDirectInward, returnLotDetails, fabricId, colorId, gsmId, designId, uomId, gaugeId, loopLengthId, kDiaId, fDiaId, storeId, poItemsId, poType) {



    if (poType == "Accessory") {

        let accessoryArray = []
        return accessoryArray
    }
    else {


        let lotWiseStockDetails = [];
        for (let i = 0; i < returnLotDetails?.length; i++) {
            let returnLotData = returnLotDetails[i]
            const total = `
    SELECT sum(qty) as total FROM stock WHERE id < (select id from stock where returnlotdetailsid=${returnLotData?.id}) AND fabricid=${fabricId} and colorid=${colorId} 
    and uomid=${uomId} and storeId=${storeId}
  and designid=${designId} and gaugeid=${gaugeId} and looplengthid=${loopLengthId} and gsmid=${gsmId} and kdiaid=${kDiaId} and
   fdiaid=${fDiaId} 
      `


            const inward = `
    SELECT sum(qty) as stockInward FROM stock WHERE (returnlotdetailsid < ${returnLotData?.id} OR returnlotdetailsid is null) AND fabricid=${fabricId} and colorid=${colorId} 
    and uomid=${uomId} and storeId=${storeId}
  and designid=${designId} and gaugeid=${gaugeId} and looplengthid=${loopLengthId} and gsmid=${gsmId} and kdiaid=${kDiaId} and
   fdiaid=${fDiaId} and (inorout="PurchaseInward" or inorout="DirectInward");
      `

            const outward = `
      SELECT sum(qty) as stockOutward FROM stock WHERE (returnlotdetailsid < ${returnLotData?.id} OR returnlotdetailsid is null) AND fabricid=${fabricId} and colorid=${colorId} 
      and uomid=${uomId} and storeId=${storeId}
    and designid=${designId} and gaugeid=${gaugeId} and looplengthid=${loopLengthId} and gsmid=${gsmId} and kdiaid=${kDiaId} and
     fdiaid=${fDiaId} and (inorout="PurchaseReturn" or inorout="DirectReturn");
        `
            const beforeLotIdStockDataInward = await prisma.$queryRawUnsafe(inward);
            const beforeLotIdStockDataoutward = await prisma.$queryRawUnsafe(outward);
            const beforeLotIdTotalStock = await prisma.$queryRawUnsafe(total);

            lotWiseStockDetails.push({
                id: returnLotData?.id,
                directReturnItemsId: returnLotData?.directReturnItemsId,
                lotNo: returnLotData?.lotNo,
                qty: returnLotData?.qty,
                noOfRolls: returnLotData?.noOfRolls,
                stockInward: beforeLotIdStockDataInward[0]?.stockInward,
                stockOutward: beforeLotIdStockDataoutward[0]?.stockOutward,
                total: beforeLotIdTotalStock[0]?.total,



                inwardNoOfRolls: (await getLotWiseInwardData(returnLotData?.lotNo, poItemsId, poInwardOrDirectInward, directItem))?.lotRolls,
                inwardQty: (await getLotWiseInwardData(returnLotData?.lotNo, poItemsId, poInwardOrDirectInward, directItem))?.lotQty,

                alreadyReturnedRolls: (await getLotWiseReturnRolls(returnLotData?.lotNo, poItemsId, returnLotData?.id, poInwardOrDirectInward, directItem))?.lotRolls,
                alreadyReturnedQty: (await getLotWiseReturnRolls(returnLotData?.lotNo, poItemsId, returnLotData?.id, poInwardOrDirectInward, directItem))?.lotQty,
                // stockQty: parseFloat(parseFloat((await getLotWiseInwardData(returnLotData?.lotNo, poItemsId, poInwardOrDirectInward, directItem))?.lotQty || 0) - parseFloat((await getLotWiseReturnRolls(returnLotData?.lotNo, poItemsId, returnLotData?.id, poInwardOrDirectInward))?.lotQty || 0) || 0),
                stockQty: parseFloat(beforeLotIdTotalStock[0]?.total),
                allowedReturnQty: parseFloat(parseFloat((await getLotWiseInwardData(returnLotData?.lotNo, poItemsId, poInwardOrDirectInward, directItem))?.lotQty || 0) - parseFloat((await getLotWiseReturnRolls(returnLotData?.lotNo, poItemsId, returnLotData?.directReturnItemsId, poInwardOrDirectInward))?.lotQty || 0) || 0),

            });



        }

        return lotWiseStockDetails;
    }

}


async function getStockDataBySingleLot(directItem, poInwardOrDirectInward, returnLotDetailsingle, fabricId, colorId, gsmId, designId, uomId, gaugeId, loopLengthId, kDiaId, fDiaId, storeId, poItemsId, poType, accessoryId, accessoryGroupId, accessoryItemId, createdAt, sizeId) {

    if (poType == "Accessory") {

        const rawDate = new Date(createdAt);

        let formattedDate = rawDate.toISOString()?.replace('T', ' ')
        formattedDate = formattedDate.slice(0, -1)


        const total = `
            SELECT sum(qty) as total FROM  stock WHERE id < (select id from stock where createdAt="${formattedDate}")
             and itemType="${poType}" AND accessoryId=${accessoryId} and colorid=${colorId} 
            and uomid=${uomId} and storeId=${storeId} and
           sizeId=${sizeId} and  accessoryGroupId=${accessoryGroupId}  and accessoryItemId=${accessoryItemId} 
              `
        const beforeLotIdTotalStock = await prisma.$queryRawUnsafe(total);

        return parseFloat(beforeLotIdTotalStock[0]?.total)
    }
    else {
        let lotWiseStockDetails = [];
        let returnLotData = returnLotDetailsingle
        const total = `
    SELECT sum(qty) as total FROM stock WHERE id < (select id from stock where returnlotdetailsid=${returnLotData?.id}) AND fabricid=${fabricId} and colorid=${colorId} 
    and uomid=${uomId} and storeId=${storeId}
  and designid=${designId} and gaugeid=${gaugeId} and looplengthid=${loopLengthId} and gsmid=${gsmId} and kdiaid=${kDiaId} and
   fdiaid=${fDiaId} 
      `
        const beforeLotIdTotalStock = await prisma.$queryRawUnsafe(total);


        return parseFloat(beforeLotIdTotalStock[0]?.total)
    }

}

export async function getPurchaseReturnItemsAlreadyData(directReturnOrPoReturnId, poInwardOrDirectInward, poType, directReturnItems, storeId, createdAt) {
    let directItemsData = [];


    for (let i = 0; i < directReturnItems?.length; i++) {

        let directItem = directReturnItems[i]
        let alreadyReturnedQty = ((await getAlreadyReturnData(poInwardOrDirectInward, directItem?.id, directItem?.poItemsId, directItem))?.alreadyReturnedQty || 0)
        let alreadyReturnedRolls = (await getAlreadyReturnData(poInwardOrDirectInward, directItem?.id, directItem?.poItemsId, directItem))?.alreadyReturnedRolls;
        let alreadyInwardedQty = ((await getAlreadyInwardDataWithoutLimit(poInwardOrDirectInward, directItem?.poItemsId, directItem))?.alreadyInwardedQty || 0);
        let alreadyInwardedRolls = ((await getAlreadyInwardDataWithoutLimit(poInwardOrDirectInward, directItem?.poItemsId, directItem))?.alreadyInwardedRolls || 0);
        let allowedReturnRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls);
        let allowedReturnQty = substract(alreadyInwardedQty, alreadyReturnedQty);
        let returnLotDetails = (await getStockData(directItem, poInwardOrDirectInward, directItem?.returnLotDetails, directItem?.fabricId, directItem?.colorId, directItem?.gsmId, directItem?.designId, directItem?.uomId, directItem?.gaugeId, directItem?.loopLengthId, directItem?.kDiaId, directItem?.fDiaId, storeId, directItem?.poItemsId, poType,))

        let stockQty = parseFloat(await getStockDataBySingleLot(directItem, poInwardOrDirectInward, directItem?.returnLotDetails[0], directItem?.fabricId, directItem?.colorId, directItem?.gsmId, directItem?.designId, directItem?.uomId, directItem?.gaugeId, directItem?.loopLengthId, directItem?.kDiaId, directItem?.fDiaId, storeId, directItem?.poItemsId, poType, directItem?.accessoryId, directItem?.accessoryGroupId, directItem?.accessoryItemId, createdAt, directItem?.sizeId))

        let obj = {
            ...directItem,
            alreadyReturnedQty,
            alreadyReturnedRolls,
            alreadyInwardedQty,
            alreadyInwardedRolls,
            allowedReturnRolls,
            allowedReturnQty,
            returnLotDetails,
            stockQty
        }



        directItemsData.push(obj)

    }


    return directItemsData


}



async function getAlreadyCancelDataWithoutLimit(poInwardOrDirectInward, poItemsId, cancelItem) {



    let sql;


    sql = `
        select  sum(qty) as alreadyCancelQty from PurchaseCancel left join cancelItems
      on PurchaseCancel.id=cancelItems.purchaseCancelId
      WHERE  cancelItems.poItemsId=${poItemsId} AND cancelItems.ID < ${cancelItem?.id}
         `




    const alreadyCancelData = await prisma.$queryRawUnsafe(sql);

    return alreadyCancelData[0]
}



async function getAlreadyReturnDataByCancel(poInwardOrDirectInward, cancelItemsId, poItemsId, cancelItem) {
    let sql;


    sql = `
        select  sum(qty) as alreadyReturnedQty,sum(noofrolls) as alreadyReturnedRolls from DirectReturnOrPoReturn left join directReturnItems
      on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId
      WHERE   directReturnItems.poItemsId = ${poItemsId} 
         `




    const alreadyReturnData = await prisma.$queryRawUnsafe(sql);

    return alreadyReturnData[0]
}



export async function getCancelItemsAlreadyData(purchaseCancelId, poInwardOrDirectInward, poType, cancelItems, storeId) {
    let cancelItemsData = [];

    for (let i = 0; i < cancelItems?.length; i++) {

        let cancelItem = cancelItems[i]
        let alreadyCancelQty = ((await getAlreadyCancelDataWithoutLimit(poInwardOrDirectInward, cancelItem?.poItemsId, cancelItem))?.alreadyCancelQty || 0);
        let alreadyReturnedQty = ((await getAlreadyReturnDataByCancel(poInwardOrDirectInward, cancelItem?.id, cancelItem?.poItemsId, cancelItem))?.alreadyReturnedQty || 0)
        let alreadyReturnedRolls = (await getAlreadyReturnDataByCancel(poInwardOrDirectInward, cancelItem?.id, cancelItem?.poItemsId, cancelItem))?.alreadyReturnedRolls;
        let alreadyInwardedQty = ((await getAlreadyInwardDataWithoutLimit(poInwardOrDirectInward, cancelItem?.poItemsId, cancelItem))?.alreadyInwardedQty || 0);
        let alreadyInwardedRolls = ((await getAlreadyInwardDataWithoutLimit(poInwardOrDirectInward, cancelItem?.poItemsId, cancelItem))?.alreadyInwardedRolls || 0);
        let allowedReturnRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls);
        let allowedReturnQty = substract(alreadyInwardedQty, alreadyReturnedQty);
        let returnLotDetails = (await getStockData(poInwardOrDirectInward, cancelItem?.returnLotDetails, cancelItem?.fabricId, cancelItem?.colorId, cancelItem?.gsmId, cancelItem?.designId, cancelItem?.uomId, cancelItem?.gaugeId, cancelItem?.loopLengthId, cancelItem?.kDiaId, cancelItem?.fDiaId))
        let totalstockQtyInward = (returnLotDetails?.reduce((total, current) => {
            return total + parseFloat(current?.stockInward)
        }, 0) || 0)
        let totalstockQtyOutward = (returnLotDetails.reduce((total, current) => {
            return total + parseFloat(current?.stockOutward)
        }, 0) || 0)

        let balanceQty = substract(substract(cancelItem?.poQty, (alreadyCancelQty || 0)), substract((alreadyInwardedQty || 0), (alreadyReturnedQty || 0)))
        // let balanceQty = parseFloat((cancelItem?.poQty) - ((alreadyInwardedQty || 0) - (alreadyReturnedQty || 0))).toFixed(3)
        let stockQty = parseFloat(totalstockQtyInward - totalstockQtyOutward)

        let obj = {
            ...cancelItem,
            alreadyReturnedQty,
            alreadyReturnedRolls,
            alreadyInwardedQty,
            alreadyInwardedRolls,
            allowedReturnRolls,
            allowedReturnQty,
            returnLotDetails,
            alreadyCancelQty,
            stockQty,
            balanceQty
        }

        cancelItemsData.push(obj)
    }
    return cancelItemsData
}



async function getAlReceivedQtyForCuttingOrder(cuttingOrderId, colorId, sizeId, panelColorId, panelId) {
    let sql;

    sql = `
           select sum(receivedqty) as alreadyReceivedQty from cuttingreceipt left join CuttingReceiptInwardDetails on
 CuttingReceiptInwardDetails.cuttingreceiptid=cuttingreceipt.id where cuttingreceipt.cuttingorderid=${cuttingOrderId}
 and CuttingReceiptInwardDetails.colorId=${colorId} and CuttingReceiptInwardDetails.sizeId=${sizeId} and CuttingReceiptInwardDetails.panelColorId=${panelColorId} and CuttingReceiptInwardDetails.panelId=${panelId};
         `
    const forCuttingReceivedQty = await prisma.$queryRawUnsafe(sql);
    return forCuttingReceivedQty[0]
}


// export async function getDataCuttingReceiptInwardDetails(cuttingOrderId) {
//     let sql;

//     sql = `
//             select swd.id,co.docId,co.orderId,cod.cuttingOrderId,cod.id as cuttingOrderDetailsId,cod.itemTypeId,
//             itm.itemId,cl.colorId,swd.sizeId,swd.orderQty,swd.cuttingQty,swd.noOfSet 
// from CuttingOrder co left join CuttingOrderDetails cod on co.id=cod.cuttingOrderId
// left join items itm on itm.cuttingOrderDetailsId=cod.id left join colorList cl on cl.itemsId=itm.id
// left join sizeWiseDetails swd on swd.colorListId=cl.id
// where co.id=${cuttingOrderId} and swd.orderQty is not null;`
//     const forCutting = await prisma.$queryRawUnsafe(sql);

//     let arrayForAlreadyReceivedQty = [];

//     for (let i = 0; i < forCutting?.length; i++) {
//         let newObj = {};
//         let cuttingObj = forCutting[i]
//         newObj = { ...cuttingObj, orderQty: (parseInt(cuttingObj?.orderQty) * parseInt(cuttingObj?.noOfSet)), 
//         alreadyReceivedQty: (await getAlReceivedQtyForCuttingOrder(cuttingOrderId, cuttingObj.colorId, cuttingObj.sizeId))?.alreadyReceivedQty || 0 }
//         arrayForAlreadyReceivedQty.push(newObj)
//     }
//     return arrayForAlreadyReceivedQty.filter((row) => substract(row.orderQty, row?.alreadyReceivedQty ? row?.alreadyReceivedQty : 0) > 0)
// }


async function getPanel(itemId, colorId, orderId) {


    const panel = `
        select malePanelProcess.panelId as malePanel,feMalePanelProcess.panelId as femalePanel,malePanelProcess.colorId as malePanelColor,
        feMalePanelProcess.colorId as femalePanelColor,isMaleColorId,isFemaleColorId,maleColorIds.maleColorId,FemaleColorIds.femaleColorId,
        isMaleItemId,isFemaleItemId from uniform.order left join orderDetails on orderDetails.orderid=uniform.order.id left join 
OrderDetailsSubGrid on OrderDetailsSubGrid.orderDetailsId=orderDetails.id left join malePanelProcess on
malePanelProcess.orderDetailsSubGridId=OrderDetailsSubGrid.id left join feMalePanelProcess on 
feMalePanelProcess.orderDetailsSubGridId=OrderDetailsSubGrid.id 
left join maleColorIds on maleColorIds.orderDetailsSubGridId=OrderDetailsSubGrid.id
left join FemaleColorIds on FemaleColorIds.orderDetailsSubGridId=OrderDetailsSubGrid.id
where orderDetails.orderid=${orderId} ;
         `
    let orderItemPanelData = await prisma.$queryRawUnsafe(panel);
    let orderItemMalePanelData = orderItemPanelData.filter(val => ((val.isMaleItemId == itemId && val?.isMaleColorId == colorId) || (val.isMaleItemId == itemId && val?.maleColorId == colorId)))
    let orderItemFemalePanelData = orderItemPanelData.filter(val => (val.isFemaleItemId == itemId && val?.isFemaleColorId == colorId) || (val.isFemaleItemId == itemId && val?.femaleColorId == colorId))
    if (orderItemMalePanelData?.length > 0) {
        orderItemPanelData = orderItemMalePanelData?.map(i => {
            return {
                ...i, panelId: i.malePanel, panelColorId: i.malePanelColor
            }
        })
    }
    else {
        orderItemPanelData = orderItemFemalePanelData?.map(i => {
            return {
                ...i, panelId: i.femalePanel, panelColorId: i.femalePanelColor
            }
        })
    }

    // orderItemPanelData = orderItemPanelData.filter(val => (val.isMaleItemId == itemId || val.isFemaleItemId == itemId))

    orderItemPanelData = orderItemPanelData.filter((obj, index, self) =>
        index === self.findIndex((item) => ((parseInt(item.panelId) === parseInt(obj.panelId)) && (parseInt(item.panelColorId) === parseInt(obj.panelColorId))))
    );
    return orderItemPanelData
}






export async function getDataCuttingReceiptInwardDetails(cuttingOrderId) {

    let cuttingsql = `select * from cuttingdelivery cd left join CuttingDeliveryDetails cdd 
on cd.id=cdd.cuttingDeliveryId where cd.cuttingorderid=${cuttingOrderId};`

    const cuttingDeliverysql = await prisma.$queryRawUnsafe(cuttingsql);

    let sql;

    sql = `
            select swd.id,co.docId,co.orderId,cod.cuttingOrderId,cod.id as cuttingOrderDetailsId,cod.itemTypeId,
            itm.itemId,cl.colorId,swd.sizeId,swd.orderQty,swd.cuttingQty,swd.noOfSet 
from CuttingOrder co left join CuttingOrderDetails cod on co.id=cod.cuttingOrderId
left join items itm on itm.cuttingOrderDetailsId=cod.id left join colorList cl on cl.itemsId=itm.id
left join sizeWiseDetails swd on swd.colorListId=cl.id
where co.id=${cuttingOrderId} and swd.orderQty is not null;`
    const forCutting = await prisma.$queryRawUnsafe(sql);

    let arrayForAlreadyReceivedQty = [];

    for (let i = 0; i < forCutting?.length; i++) {
        let newObj = {};
        let cuttingObj = forCutting[i]
        let itemWisePanel = await getPanel(cuttingObj?.itemId, cuttingObj.colorId, cuttingObj?.orderId)

        for (let j = 0; j < itemWisePanel?.length; j++) {
            let panelObj = itemWisePanel[j]
            let alreadyReceivedQty = (await getAlReceivedQtyForCuttingOrder(cuttingOrderId, cuttingObj.colorId, cuttingObj.sizeId, panelObj?.panelColorId, panelObj?.panelId))?.alreadyReceivedQty || 0

            newObj = {
                ...cuttingObj, ...panelObj,
                orderQty: (parseInt(cuttingObj?.orderQty) * parseInt(cuttingObj?.noOfSet)),
                receivedQty: substract(cuttingObj?.cuttingQty, alreadyReceivedQty),
                alreadyReceivedQty: alreadyReceivedQty
            }
            arrayForAlreadyReceivedQty.push(newObj)
        }

    }

    arrayForAlreadyReceivedQty = arrayForAlreadyReceivedQty.filter((obj, index) =>
        cuttingDeliverysql.some((item) => parseInt(item?.colorId) === parseInt(obj.panelColorId))
    );

    return arrayForAlreadyReceivedQty.filter((row) => substract(row.orderQty, row?.alreadyReceivedQty ? row?.alreadyReceivedQty : 0) > 0)
}



async function getAlreadyReceivedQty(cuttingReceiptInwardDetailsId, cuttingorderdetailsid, colorId, sizeId) {


    let sql;
    sql = `
            select sum(receivedQty) as alreadyReceivedQty from CuttingReceiptInwardDetails  
            where id < ${cuttingReceiptInwardDetailsId}  and cuttingOrderDetailsId=${cuttingorderdetailsid} and colorId=${colorId} and sizeId=${sizeId};;
         `
    const forCutting = await prisma.$queryRawUnsafe(sql);

    return forCutting[0]
}




export async function getCuttingReceiptInwardDetailsAlreadyData(cuttingReceiptInwardDetails, cuttingReceiptId) {

    let receiptItemsData = [];
    for (let i = 0; i < cuttingReceiptInwardDetails?.length; i++) {

        let receiptInwardItem = cuttingReceiptInwardDetails[i]
        let obj = {
            ...receiptInwardItem,
            alreadyReceivedQty: ((await getAlreadyReceivedQty(receiptInwardItem?.id, receiptInwardItem?.cuttingOrderDetailsId, receiptInwardItem?.colorId, receiptInwardItem?.sizeId))?.alreadyReceivedQty || 0)

        }
        receiptItemsData.push(obj)
    }

    return receiptItemsData
}



async function getAlreadyUsedQty(cuttingReceiptFabricConsumptionDetailsId, cuttingReceiptId, uomId, loopLengthId, kDiaId, gsmId, gaugeId, fabricId, fDiaId, designId, colorId) {
    let sql;


    sql = `
            select (cuttingReceiptFabricConsumptionDetails.consumption + CuttingReceiptFabricLossDetails.lossQty) as alreadyUsedQty from cuttingReceiptFabricConsumptionDetails 
            left join CuttingReceiptFabricLossDetails on
CuttingReceiptFabricLossDetails.cuttingReceiptFabricConsumptionDetailsId=cuttingReceiptFabricConsumptionDetails.id
where cuttingReceiptFabricConsumptionDetails.id < ${cuttingReceiptFabricConsumptionDetailsId}   
and colorId=${colorId} and designid=${designId} and fdiaid=${fDiaId} and fabricid=${fabricId} and gaugeid=${gaugeId} and gsmid=${gsmId}
and kdiaid=${kDiaId} and looplengthid=${loopLengthId} and uomid=${uomId};
         `
    const forCutting = await prisma.$queryRawUnsafe(sql);

    return forCutting[0]
}







export async function getFabricConsumptionAlreadyData(cuttingReceiptFabricConsumptionDetails, cuttingReceiptId) {

    let receiptFabricData = [];
    for (let i = 0; i < cuttingReceiptFabricConsumptionDetails?.length; i++) {

        let receiptFabricItem = cuttingReceiptFabricConsumptionDetails[i]
        let obj = {
            ...receiptFabricItem,
            alreadyUsedQty: ((await getAlreadyUsedQty(receiptFabricItem?.id, cuttingReceiptId, receiptFabricItem?.uomId, receiptFabricItem?.loopLengthId, receiptFabricItem?.kDiaId, receiptFabricItem?.gsmId, receiptFabricItem?.gaugeId, receiptFabricItem?.fabricId, receiptFabricItem?.fDiaId, receiptFabricItem?.designId, receiptFabricItem?.colorId))?.alreadyUsedQty || 0)

        }
        receiptFabricData.push(obj)
    }

    return receiptFabricData
}





export async function getProductionReceiptDetails(productionReceiptId, productionReceiptDetails, orderId, isStitching, prevProcessId) {
    let productionReceiptDetailsArray = [];
    for (let i = 0; i < productionReceiptDetails?.length; i++) {
        let productionReceiptItem = productionReceiptDetails[i]
        let alReceivedQty;
        if (isStitching) {
            alReceivedQty = ((await getAlReceivedQtyForStitching(productionReceiptItem?.id, productionReceiptItem?.colorId, productionReceiptItem?.itemId, productionReceiptItem?.sizeId, orderId, prevProcessId))?.alreadyReceivedQty || 0)
        }
        else {
            alReceivedQty = ((await getAlReceivedQty(productionReceiptItem?.id, productionReceiptItem?.colorId, productionReceiptItem?.itemId, productionReceiptItem?.panelId, productionReceiptItem?.sizeId, productionReceiptItem?.productionDeliveryDetailsId, orderId, prevProcessId))?.alreadyReceivedQty || 0)
        }

        let obj = {
            ...productionReceiptItem,
            cuttingQty: (await getCuttingQty(orderId, productionReceiptItem.itemId, productionReceiptItem?.colorId, productionReceiptItem?.sizeId))?.cuttingQty,
            readyQty: productionReceiptItem?.readyQty ? productionReceiptItem?.readyQty : 0,
            delQty: productionReceiptItem?.ProductionDeliveryDetails?.delQty,
            alreadyReceivedQty: alReceivedQty,

        }
        productionReceiptDetailsArray.push(obj)
    }

    return productionReceiptDetailsArray
}




export async function getProductionReceiptDetailsForPacking(productionReceiptId, productionReceiptDetails, orderId, prevProcessId, productionReceipt) {
    let productionReceiptDetailsArray = [];
    for (let i = 0; i < productionReceiptDetails?.length; i++) {
        let productionReceiptItem = productionReceiptDetails[i]


        let obj = {
            ...productionReceiptItem,


        }
        productionReceiptDetailsArray.push(obj)
    }

    return productionReceiptDetailsArray
}


async function getCuttingQty(orderId, itemId, colorId, sizeId) {
    const sql = `select * from cuttingorder co left join CuttingOrderDetails cod on  cod.cuttingorderid=co.id left join 
items itm on itm.cuttingOrderDetailsId=cod.id left join ColorList cl on cl.itemsId=itm.id 
left join SizeWiseDetails swd on swd.colorListId=cl.id where co.orderId=${orderId} and itm.itemId=${itemId} and cl.colorId=${colorId}
and swd.sizeid=${sizeId};
  ;
      `
    let cuttingqty = await prisma.$queryRawUnsafe(sql);

    return cuttingqty[0]



}


async function getAlReceivedQty(id, colorId, itemId, panelId, sizeId, productionDeliveryDetailsId, orderId, prevProcessId) {



    const sql = `select sum(receivedQty) as alreadyReceivedQty from ProductionReceiptDetails left join productionreceipt on 
      productionreceipt.id =ProductionReceiptDetails.productionreceiptId
    where productionreceipt.orderId=${orderId} and productionreceipt.prevProcessId=${prevProcessId} and
    ProductionReceiptDetails.productionDeliveryDetailsId=${productionDeliveryDetailsId}
    and ProductionReceiptDetails.colorId=${colorId} and ProductionReceiptDetails.sizeId=${sizeId}
    and ProductionReceiptDetails.itemId=${itemId} and (ProductionReceiptDetails.panelId=${panelId} or ProductionReceiptDetails.panelId is null)
and ProductionReceiptDetails.id < ${id}
    ;
        `
    let qty = await prisma.$queryRawUnsafe(sql);

    return qty[0]




}


async function getAlReceivedQtyForStitching(id, colorId, itemId, sizeId, orderId, prevProcessId) {



    const sql = `select sum(receivedQty) as alreadyReceivedQty from ProductionReceiptDetails left join productionreceipt on 
      productionreceipt.id =ProductionReceiptDetails.productionreceiptId
    where productionreceipt.orderId=${orderId} and   productionreceipt.prevProcessId=${prevProcessId} 
    and ProductionReceiptDetails.colorId=${colorId} and ProductionReceiptDetails.sizeId=${sizeId}
    and ProductionReceiptDetails.itemId=${itemId} and ProductionReceiptDetails.panelId is null
and ProductionReceiptDetails.id < ${id}
    ;
        `
    let qty = await prisma.$queryRawUnsafe(sql);

    return qty[0]




}