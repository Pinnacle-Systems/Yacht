import { PrismaClient } from '@prisma/client'
import moment from 'moment'

const prisma = new PrismaClient()

export function getYearShortCode(year) {
  return `${new Date(year).getFullYear().toString().slice(2)}`
}
export const getDateFromDateTime = (dateTime) => moment.utc(dateTime).format("DD-MM-YYYY")
export function getYearShortCodeForFinYear(fromDate, toDate) {
  return `${new Date(fromDate).getFullYear().toString().slice(2)}-${new Date(toDate).getFullYear().toString().slice(2)}`
}

export function getItemFullNameFromShortCode(shortCode) {
  let fullForm = "";
  switch (shortCode) {
    case "GY":
      fullForm = "GreyYarn"
      break;
    case "GF":
      fullForm = "GreyFabric"
      break;
    case "DY":
      fullForm = "DyedYarn"
      break;
    case "DF":
      fullForm = "DyedFabric"
      break;
    default:
      break;
  }
  return fullForm
}

export async function getStockProperty(itemType, item, property, storeId, branchId) {
  let stockItems = await prisma.stock.findMany({
    where: {
      itemType: itemType,
      // branchId: parseInt(branchId),
      yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
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
      noOfBags: item?.noOfBags ? parseInt(item.noOfBags) : undefined,
      noOfRolls: item?.noOfRolls ? parseInt(item.noOfRolls) : undefined,
      qty: item?.qty ? parseFloat(item.qty) : undefined,
      price: item?.price ? parseFloat(item.price) : undefined,
      storeId: parseInt(storeId),
      lotNo: item?.lotNo ? item.lotNo : undefined,
      processId: item?.processId ? parseInt(item.processId) : undefined,
    }
  })


  if (!stockItems) return 0;
  let totalQty = stockItems.reduce((accumulator, current) => {
    return (accumulator + parseFloat(current.qty))
  }, 0)
  if (property === "qty") {
    return totalQty
  }
  let totalGross = stockItems.reduce((accumulator, current) => {
    let currentGross = parseFloat(current.price) * parseFloat(current.qty);
    return (accumulator + currentGross)
  }, 0)


  if ((totalGross === 0) || (totalQty === 0)) return 0
  let weightedAverage = totalGross / totalQty
  return weightedAverage
}


export async function getAlreadyInwardedQty(po, poItemId) {
  let supplierInwards = await prisma.pInwardOrReturn.findMany({
    where: {
      supplierId: parseInt(po.supplierId),
      inwardOrReturn: "PurchaseInward"
    }
  })
  let poItems = []
  supplierInwards.forEach(poInwardOrReturn =>
    poInwardOrReturn.poInwardReturnItems.forEach(poItem => {
      if (poItem.poItemId === poItemId) {
        poItems.push(poItem)
      }
    })
  )
  let totalInwardQty = poItems.reduce((total, currentPoItem) => {
    return total + parseFloat(currentPoItem.inwardQty)
  }, 0)
  return totalInwardQty
}

export async function getAlreadyReturnedQty(po, poItemId) {
  let supplierReturns = await prisma.pInwardOrReturn.findMany({
    where: {
      supplierId: parseInt(po.supplierId),
      inwardOrReturn: "PurchaseReturn"
    }
  })
  let poItems = []
  supplierReturns.forEach(poInwardOrReturn =>
    poInwardOrReturn.poInwardReturnItems.forEach(poItem => {
      if (poItem.poItemId === poItemId) {
        poItems.push(poItem)
      }
    })
  )
  let totalReturnQty = poItems.reduce((total, currentPoItem) => {
    return total + parseFloat(substract(0, currentPoItem.returnQty))
  }, 0)
  return totalReturnQty
}

export async function getAlreadyCanceledQty(po, poItemId) {
  let supplierCancels = await prisma.pInwardOrReturn.findMany({
    where: {
      supplierId: parseInt(po.supplierId),
      inwardOrReturn: "PurchaseCancel"
    }
  })
  let poItems = []
  supplierCancels.forEach(poInwardOrReturn =>
    poInwardOrReturn.poInwardReturnItems.forEach(poItem => {
      if (poItem.poItemId === poItemId) {
        poItems.push(poItem)
      }
    })
  )
  let totalCancelQty = poItems.reduce((total, currentPoItem) => {
    return total + parseFloat(currentPoItem.cancelQty);
  }, 0)
  return totalCancelQty
}

export function generateSubscriptionCode(length = 6) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function findDateInRange(fromDate, toDate, checkDate) {
  if ((fromDate <= checkDate) && (checkDate <= toDate)) {
    return true
  }
  return false;
}

export function exclude(user, keys) {
  for (let key of keys) {
    delete user[key]
  }
  return user
}

export async function base64Tobuffer(base64) {
  const response = await fetch(base64);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer
}



export function getDateTimeRangeForCurrentYear(date) {
  let startTime = new Date(date);
  startTime.setDate(1)
  startTime.setMonth(0)
  startTime.setHours(0, 0, 0, 0);
  let endTime = new Date(date);
  endTime.setDate(31)
  endTime.setMonth(11)
  endTime.setHours(23, 59, 59, 99);
  return { startTime, endTime };
}




export function generateOrderProductID() {
  // Generate a random UUID
  const uuid = generateUUID();

  // Get the current timestamp
  const timestamp = Date.now().toString();

  // Concatenate the timestamp and unique ID
  const orderProductID = `${timestamp}_${uuid}`;

  return orderProductID;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getPriceAddStockQtyWithWeightedAverage(stock, poItem) {
  let stockGross = (parseFloat(stock.price) * parseFloat(stock.qty));
  let currentGross = (parseFloat(poItem.price) * parseFloat(poItem.inwardQty))
  let totalItems = parseFloat(stock.qty) + parseFloat(poItem.inwardQty)
  return (stockGross + currentGross) / totalItems
}

export function getPriceReturnStockQtyWithWeightedAverage(stock, poItem) {
  let stockPrice = parseFloat(stock.price)
  let stockQty = parseFloat(stock.qty)
  let stockGross = stockPrice * stockQty
  let oldInwardedQty = parseFloat(poItem.alreadyInwardedQty)
  let currentItemGross = (parseFloat(poItem.price) * oldInwardedQty)
  let oldStockGross = stockGross - currentItemGross
  let oldStockQty = stockQty - oldInwardedQty
  let oldStockPrice = oldStockGross / oldStockQty
  let currentInwardQty = oldInwardedQty - parseFloat(poItem.returnQty);
  return getPriceAddStockQtyWithWeightedAverage({ price: oldStockPrice, qty: oldStockQty }, { price: parseFloat(poItem.price), inwardQty: currentInwardQty })
}

// export function substract(num1, num2) {
//   let n1 = parseFloat(num1) * 1000;
//   let n2 = parseFloat(num2) * 1000;
//   let result = (n1 - n2) / 1000
//   return result;
// }

const getPoItem = async (tx, item, inwardOrReturn) => {
  let poItem = {}
  if (inwardOrReturn.includes("Direct")) {
    poItem = item
  } else {
    let po = await tx.po.findUnique({
      where: {
        id: parseInt(item.poNo)
      }
    })
    poItem = po.poItems.find(it => it.poItemId === item.poItemId)
    poItem["inwardQty"] = item.inwardQty
    poItem["returnQty"] = item.returnQty
  }
  return poItem
}

function getStockItemObject(transType, item) {
  let newItem = {};
  if ((transType === "GreyYarn") || (transType === "DyedYarn")) {
    newItem["yarnId"] = parseInt(item["yarnId"]);
    newItem["noOfBags"] = parseInt(item["noOfBags"])
  } else if ((transType === "GreyFabric") || (transType === "DyedFabric")) {
    newItem["fabricId"] = parseInt(item["fabricId"]);
    newItem["designId"] = parseInt(item["designId"]);
    newItem["gaugeId"] = parseInt(item["gaugeId"]);
    newItem["loopLengthId"] = parseInt(item["loopLengthId"]);
    newItem["gsmId"] = parseInt(item["gsmId"]);
    newItem["kDiaId"] = parseInt(item["kDiaId"]);
    newItem["fDiaId"] = parseInt(item["fDiaId"]);
  } else if (transType === "Accessory") {
    newItem["accessoryId"] = parseInt(item["accessoryId"])
    newItem["sizeId"] = parseInt(item["sizeId"])
  }
  newItem["uomId"] = parseInt(item["uomId"])
  newItem["colorId"] = parseInt(item["colorId"])
  newItem["qty"] = parseFloat(item["qty"])
  newItem["price"] = parseFloat(item["price"])
  newItem["discountType"] = item["discountType"]
  newItem["discountValue"] = parseFloat(item["discountValue"])
  newItem["taxPercent"] = parseFloat(item["taxPercent"])
  return newItem
}


export const stockCreate = async (tx, poType, inwardOrReturn, item, storeId, branchId) => {
  let poItem = await getPoItem(tx, item, inwardOrReturn)
  const stockData = await tx.stock.create({ data: itemDetails })
  item["stockId"] = stockData.id;
  return item
}

export const createManyStockWithId = async (tx, poType, inwardOrReturn, items, storeId, branchId) => {
  let promises = items.map(async (item) => await stockCreate(tx, poType, inwardOrReturn, item, storeId, branchId))
  return Promise.all(promises);
}



export const stockUpdate = async (tx, poType, inwardOrReturn, item) => {
  let poItem = await getPoItem(tx, item, inwardOrReturn)
  const itemDetails = {
    itemType: poType, inOrOut: inwardOrReturn,
    qty: parseFloat(inwardOrReturn.includes("Inward") ? item.inwardQty : (substract(0, item.returnQty))),
    price: parseFloat(poItem.price),
    itemDetails:
      poType.includes("Yarn")
        ?
        {
          yarnId: parseInt(poItem.yarnId),
          colorId: parseInt(poItem.colorId),
          uomId: parseInt(poItem.uomId),
        }
        :
        (
          poType.includes("Fabric")
            ?
            {
              fabricId: parseInt(poItem.fabricId),
              colorId: parseInt(poItem.colorId),
              uomId: parseInt(poItem.uomId),
              fDiaId: parseInt(poItem.fDiaId),
              kDiaId: parseInt(poItem.kDiaId),
              gaugeId: parseInt(poItem.gaugeId),
              designId: parseInt(poItem.designId),
              gsmId: parseInt(poItem.gsmId),
              loopLengthId: parseInt(poItem.loopLengthId)
            }
            :
            {
              accessoryId: parseInt(poItem.accessoryId),
              colorId: parseInt(poItem.colorId),
              uomId: parseInt(poItem.uomId),
              sizeId: parseInt(poItem.sizeId)
            }
        )
  }
  let stockData = {}
  if (item.stockId) {
    stockData = await tx.stock.update({
      where: {
        id: parseInt(item.stockId)
      },
      data: itemDetails
    })
  } else {
    stockData = await tx.stock.create({ data: itemDetails })
  }
  item["stockId"] = stockData.id;
  return item
}

export const updateManyStockWithId = async (tx, poType, inwardOrReturn, items) => {
  let promises = items.map(async (item) => await stockUpdate(tx, poType, inwardOrReturn, item))
  return Promise.all(promises);
}
export const getDateFromDateTimeYear = (dateTime) => moment.utc(dateTime).format("YYYY-MM-DD")
export const balanceQtyCalculation = (poQty, cancelQty, inwardQty, returnQty) => {

  return Math.abs(substract(substract(poQty ? parseFloat(poQty) : 0, ((cancelQty ? parseFloat(cancelQty) : 0) + (inwardQty ? parseFloat(inwardQty) : 0))), substract(inwardQty ? parseFloat(inwardQty) : 0, returnQty ? parseFloat(returnQty) : 0)))
}

export const balanceCancelQtyCalculation = (poQty, cancelQty, inwardQty, returnQty) => {

  return Math.abs(substract(substract(poQty ? parseFloat(poQty) : 0, (cancelQty ? parseFloat(cancelQty) : 0)), substract(inwardQty ? parseFloat(inwardQty) : 0, returnQty ? parseFloat(returnQty) : 0)))
}


export function substract(num1, num2) {
  let n1 = parseFloat(num1) * 1000;
  let n2 = parseFloat(num2) * 1000;
  let result = (n1 - n2) / 1000
  return result;
}


export const balanceReturnQtyCalculation = (inwardQty, returnQty) => {
  return substract(inwardQty ? parseFloat(inwardQty) : 0, returnQty ? parseFloat(returnQty) : 0)
}

export const inwardQtyCalculation = (poQty, cancelQty, inwardQty, returnQty) => {
  return substract(substract(poQty ? parseFloat(poQty) : 0, cancelQty ? parseFloat(cancelQty) : 0), substract(inwardQty ? parseFloat(inwardQty) : 0, returnQty ? parseFloat(returnQty) : 0))
}

export const billItemsFiltration = (inwardQty, returnQty) => {
  return substract(inwardQty, returnQty) > 0
}

export function getDateTimeRange(date) {
  let startTime = new Date(date);
  startTime.setHours(0, 0, 0, 0);
  let endTime = new Date(date);
  endTime.setHours(23, 59, 59, 99);
  return { startTime, endTime };
}

export const getRemovedItems = (array1, array2) => {
  const filtered = array1.filter(el => {
    return array2.indexOf(el) === -1;
  });
  return filtered;
};





export async function getItemPanel(itemId, colorId, orderId) {





  const malePanel = `
       select malePanelProcess.panelId as malePanel,malepanelprocess.colorId as colorId,isMaleItemId,isFemaleItemId from uniform.order left join orderDetails on orderDetails.orderid=uniform.order.id left join 
OrderDetailsSubGrid on OrderDetailsSubGrid.orderDetailsId=orderDetails.id left join malePanelProcess on
malePanelProcess.orderDetailsSubGridId=OrderDetailsSubGrid.id 
where orderDetails.orderid=${orderId} and OrderDetailsSubGrid.isMaleColorId=${colorId} and OrderDetailsSubGrid.isMaleItemId=${itemId};
         `


  const femalePanel = `
       select feMalePanelProcess.panelId as femalePanel,feMalePanelProcess.colorId as colorId,isMaleItemId,isFemaleItemId from uniform.order left join orderDetails on orderDetails.orderid=uniform.order.id left join 
  OrderDetailsSubGrid on OrderDetailsSubGrid.orderDetailsId=orderDetails.id  left join feMalePanelProcess on 
  feMalePanelProcess.orderDetailsSubGridId=OrderDetailsSubGrid.id 
  where orderDetails.orderid=${orderId}  and OrderDetailsSubGrid.isFemaleColorId=${colorId}  and OrderDetailsSubGrid.isFemaleItemId=${itemId};
           `

  let orderItemMalePanel = await prisma.$queryRawUnsafe(malePanel);
  let orderItemfeMalePanel = await prisma.$queryRawUnsafe(femalePanel);

  let orderItemPanelData;


  // let orderItemMalePanelData = orderItemMalePanel.filter(val => (val.isMaleItemId == itemId))
  // let orderItemFemalePanelData = orderItemfeMalePanel.filter(val => (val.isFemaleItemId == itemId))

  let orderItemMalePanelData = orderItemMalePanel
  let orderItemFemalePanelData = orderItemfeMalePanel




  if (orderItemMalePanelData?.length > 0) {
    orderItemPanelData = orderItemMalePanelData?.map(i => {
      return {
        ...i, panelId: i.malePanel
      }
    })
  }
  else {
    orderItemPanelData = orderItemFemalePanelData?.map(i => {
      return {
        ...i, panelId: i.femalePanel
      }
    })
  }
  return orderItemPanelData



}

export async function stockDataUpdatePanelWise(cuttingReceiptId, storeId, branchId, cuttingOrderId) {

  const data = await prisma.cuttingReceipt.findUnique({
    where: {
      id: parseInt(cuttingReceiptId)
    },
    include: {
      CuttingReceiptInwardDetails: true
    }
  })

  const cuttingOrderTable = await prisma.cuttingOrder.findUnique({
    where: {
      id: parseInt(cuttingOrderId)
    },

  })

  const cuttingReceiptInwardDetails = data?.CuttingReceiptInwardDetails
  const orderId = cuttingOrderTable?.orderId

  for (let i = 0; i < cuttingReceiptInwardDetails?.length; i++) {
    let cuttingReceiptInwardDetailsObj = cuttingReceiptInwardDetails[i];
    let panelsArray = await getItemPanel(cuttingReceiptInwardDetailsObj?.itemId, cuttingReceiptInwardDetailsObj?.colorId, orderId)

    if (panelsArray?.length > 0) {
      for (let j = 0; j < panelsArray?.length; j++) {
        let panelObj = panelsArray[j]
        await prisma.stockForPanels.create({
          data: {
            inOrOut: "In",
            orderId: orderId ? parseInt(orderId) : undefined,
            cuttingReceiptInwardDetailsId: cuttingReceiptInwardDetailsObj?.id ? parseInt(cuttingReceiptInwardDetailsObj.id) : null,
            panelId: panelObj?.panelId ? parseInt(panelObj.panelId) : null,
            panelColorId: panelObj?.colorId ? parseInt(panelObj.colorId) : null,
            colorId: cuttingReceiptInwardDetailsObj?.colorId ? parseInt(cuttingReceiptInwardDetailsObj.colorId) : null,
            // colorId: cuttingReceiptInwardDetailsObj.colorId ? parseInt(cuttingReceiptInwardDetailsObj.colorId) : undefined,
            uomId: cuttingReceiptInwardDetailsObj.uomId ? parseInt(cuttingReceiptInwardDetailsObj.uomId) : undefined,
            itemId: cuttingReceiptInwardDetailsObj.itemId ? parseInt(cuttingReceiptInwardDetailsObj.itemId) : undefined,
            sizeId: cuttingReceiptInwardDetailsObj.sizeId ? parseInt(cuttingReceiptInwardDetailsObj.sizeId) : undefined,
            // prevProcessId: cuttingReceiptInwardDetailsObj.prevProcessId ? parseInt(cuttingReceiptInwardDetailsObj.prevProcessId) : undefined,
            stage: "Panel",
            storeId: parseInt(storeId),
            branchId: parseInt(branchId),
            qty: parseInt(cuttingReceiptInwardDetailsObj.receivedQty)
          }

        })


      }
    }
    else {

      await prisma.stockForPanels.create({
        data: {
          inOrOut: "In",
          cuttingReceiptInwardDetailsId: cuttingReceiptInwardDetailsObj?.id ? parseInt(cuttingReceiptInwardDetailsObj.id) : null,
          orderId: orderId ? parseInt(orderId) : undefined,
          // colorId: panelObj?.colorId ? parseInt(panelObj.colorId) : null,
          colorId: cuttingReceiptInwardDetailsObj.colorId ? parseInt(cuttingReceiptInwardDetailsObj.colorId) : undefined,
          uomId: cuttingReceiptInwardDetailsObj.uomId ? parseInt(cuttingReceiptInwardDetailsObj.uomId) : undefined,
          itemId: cuttingReceiptInwardDetailsObj.itemId ? parseInt(cuttingReceiptInwardDetailsObj.itemId) : undefined,
          sizeId: cuttingReceiptInwardDetailsObj.sizeId ? parseInt(cuttingReceiptInwardDetailsObj.sizeId) : undefined,
          storeId: parseInt(storeId),
          branchId: parseInt(branchId),
          qty: parseInt(cuttingReceiptInwardDetailsObj.receivedQty),
          stage: "Panel",
        }
      })


    }
  }
}




export async function classListData(data){
  let classData = data;
  const order = { "PLAYSCHOOL": 0, "PRE-KG": 1, "LKG": 2, "UKG": 3 };

  classData.sort((a, b) => {
      const extractParts = (className) => {
          let match = className.match(/^([A-Za-z]+)-?(\d*)([A-Za-z]*)$/);
          if (!match) return [Infinity, "", ""]; 
  
          let [_, prefix, num, suffix] = match;
          num = num ? parseInt(num, 10) : (order[prefix] !== undefined ? order[prefix] : Infinity);
          
          return [order[prefix] !== undefined ? order[prefix] : num, num, suffix];
      };
  
      let [orderA, numA, suffixA] = extractParts(a.name);
      let [orderB, numB, suffixB] = extractParts(b.name);
  
      if (orderA !== orderB) return orderA - orderB;
      if (numA !== numB) return numA - numB;
      return suffixA.localeCompare(suffixB);
    });
}
