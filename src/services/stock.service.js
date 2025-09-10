import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { getStockProperty } from '../utils/helper.js';
import { getFinishedGoodsStockReport, getStockReport, getStockReportForCuttingDelivery } from '../utils/stockHelper.js';
const prisma = new PrismaClient()
const xprisma = prisma.$extends({
    result: {
        stock: {
            gross: {
                needs: { price: true, qty: true },
                compute(stock) {
                    return stock.price * stock.qty
                }
            },
        }
    },
})

export async function getPcsStock(req) {
    const {
        pagination = false, dataPerPage = 5, pageNumber = 1, storeId, prevProcessId, itemId, orderId,
        productionDeliveryId, isPacking, finishedGoodsSalesId, finishedGoodsSalesDeliveryId, branchId,
        stockTransferFinishedGoodsId, onlineSalesId, searchStyleNo, isForProductionDelivery, toProcessId,
    } = req.query
    let processId;

    let toProcessData;
    if (prevProcessId) {
        toProcessData = await prisma.process.findUnique({
            where: {
                id: parseInt(toProcessId)
            }
        })


    }

    let processData;
    if (prevProcessId) {
        processData = await prisma.process.findUnique({
            where: {
                id: parseInt(prevProcessId)
            }
        })

        // processId = prevProcessId;
        // if (processData?.isCutting) {
        //     processId = null
        // }
    }
    const storeFilter = `stockForPanels.storeId = ${storeId}`
    const processFilter = processId ? `stockForPanels.prevProcessId = ${prevProcessId}` : `stockForPanels.prevProcessId IS NULL`
    const productionDeliveryIdFilter = `(productionDelivery.id < ${productionDeliveryId} or productionDelivery.id IS NULL)`
    const isPackingFilter = isPacking ? `process.isPacking = 1` : `(process.isPacking = 0 OR process.isPacking IS NULL)`
    let filterConditions = []
    if (itemId) {
        filterConditions.push(`stockForPanels.itemId = ${itemId}`)
    }
    if (productionDeliveryId) {
        filterConditions.push(productionDeliveryIdFilter)
    }
    if (finishedGoodsSalesId) {
        filterConditions.push(`(finishedGoodsSales.id < ${finishedGoodsSalesId} or finishedGoodsSales.id IS NULL)`)
    }
    if (finishedGoodsSalesDeliveryId) {
        filterConditions.push(`(finishedGoodsSalesDelivery.id < ${finishedGoodsSalesDeliveryId} or finishedGoodsSalesDelivery.id IS NULL)`)
    }
    if (stockTransferFinishedGoodsId) {
        filterConditions.push(`(stockTransferdelivery.id < ${stockTransferFinishedGoodsId} or stockTransferdelivery.id IS NULL)
            `)
    }
    if (onlineSalesId) {
        filterConditions.push(`(onlineSales.id < ${onlineSalesId} or onlineSales.id IS NULL)
            `)
    }
    // if (searchStyleNo) {
    //     filterConditions.push(`LOWER(style.sku) LIKE LOWER('%${searchStyleNo}%')`)
    // }
    if (storeId) {
        filterConditions.push(storeFilter)
    }
    if (processId) {
        filterConditions.push(processFilter)
    }
    if (isPacking) {
        filterConditions.push(isPackingFilter)
    }
    if (branchId) {
        filterConditions.push(`stockForPanels.branchId = ${branchId}`)
    }

    const where = `where ${filterConditions.join(' and ')}`
    let filterStockByProcess;
    if (processData?.isIroning || processData?.isStitching || processData?.isPacking) {
        filterStockByProcess = "Stitching"
    }
    else {
        filterStockByProcess = "Panel"
    }

    let sql;
    if (isForProductionDelivery) {

        if ((filterStockByProcess == "Stitching") || (toProcessData?.isPacking || toProcessData?.isIroning)) {
            sql = `
    select item.name as itemName,stockForPanels.itemId,stockForPanels.panelId,panel.name as panelName, stockForPanels.sizeId,stockForPanels.colorId,stockForPanels.panelColorId,color.name as colorName, stockForPanels.uomId, uom.name as uomName, 
      size.name as sizeName, stockForPanels.stage as stage, sum(stockForPanels.qty) as qty
      from stockForPanels
      left join productionDeliveryDetails on productionDeliveryDetails.id = stockForPanels.productionDeliveryDetailsId 
      left join productionDelivery on productionDelivery.id = productionDeliveryDetails.productionDeliveryId
      left join item on item.id = stockForPanels.itemId
      left join size on size.id = stockForPanels.sizeId
      left join color on color.id = stockForPanels.colorId
      left join process on process.id = stockForPanels.prevProcessId 
      left join panel on panel.id = stockForPanels.panelId 
      left join uom on uom.id = stockForPanels.uomId 
      where stockForPanels.orderId=${orderId} and  stockForPanels.stage="${filterStockByProcess}" and stockForPanels.prevProcessId =${prevProcessId} and stockForPanels.storeId=${storeId} and
    ((stockForPanels.prevProcessId !=${toProcessId} OR stockForPanels.productionReceiptDetailsId is null) or stockForPanels.prevProcessId is null)    
      group by stockForPanels.itemId,stockForPanels.panelId, stockForPanels.sizeId, 
        stockForPanels.panelColorId, stockForPanels.uomId, stockForPanels.stage,stockForPanels.colorId;
      `
        }
        else {
            sql = `
    select item.name as itemName,stockForPanels.itemId,stockForPanels.panelId,panel.name as panelName, stockForPanels.sizeId,stockForPanels.panelColorId,stockForPanels.colorId,color.name as colorName, stockForPanels.uomId, uom.name as uomName, 
      size.name as sizeName, stockForPanels.stage as stage, sum(stockForPanels.qty) as qty
      from stockForPanels
      left join productionDeliveryDetails on productionDeliveryDetails.id = stockForPanels.productionDeliveryDetailsId 
      left join productionDelivery on productionDelivery.id = productionDeliveryDetails.productionDeliveryId
      left join item on item.id = stockForPanels.itemId
      left join size on size.id = stockForPanels.sizeId
      left join color on color.id = stockForPanels.panelColorId
      left join process on process.id = stockForPanels.prevProcessId 
      left join panel on panel.id = stockForPanels.panelId 
      left join uom on uom.id = stockForPanels.uomId 
      where stockForPanels.orderId=${orderId} and  stockForPanels.stage="${filterStockByProcess}" and stockForPanels.storeId=${storeId} and
    ((stockForPanels.prevProcessId !=${toProcessId} OR stockForPanels.productionReceiptDetailsId is null) or stockForPanels.prevProcessId is null) 
     group by stockForPanels.itemId,stockForPanels.panelId, stockForPanels.sizeId,
      stockForPanels.panelColorId, stockForPanels.uomId, stockForPanels.stage,stockForPanels.colorId;

      `
        }

    }
    else {
        sql = `
    select item.name as itemName,stockForPanels.itemId,stockForPanels.panelId,panel.name as panelName,stockForPanels.panelColorId, stockForPanels.sizeId,stockForPanels.colorId,color.name as colorName, stockForPanels.uomId, uom.name as uomName, 
      size.name as sizeName, stockForPanels.stage as stage, sum(stockForPanels.qty) as qty
      from stockForPanels
      left join productionDeliveryDetails on productionDeliveryDetails.id = stockForPanels.productionDeliveryDetailsId 
      left join productionDelivery on productionDelivery.id = productionDeliveryDetails.productionDeliveryId
      left join item on item.id = stockForPanels.itemId
      left join size on size.id = stockForPanels.sizeId
      left join color on color.id = stockForPanels.panelColorId
      left join process on process.id = stockForPanels.prevProcessId 
      left join panel on panel.id = stockForPanels.panelId 
      left join uom on uom.id = stockForPanels.uomId 
      where stockForPanels.orderId=${orderId} 
      group by stockForPanels.itemId,stockForPanels.panelId, stockForPanels.sizeId, 
       stockForPanels.panelColorId, stockForPanels.uomId, stockForPanels.stage,stockForPanels.colorId;
     
      `
    }



    // group by stockForPanels.itemId,stockForPanels.panelId, stockForPanels.sizeId, ----
    // stockForPanels.colorId, stockForPanels.uomId, stockForPanels.stage ;

    let data = await prisma.$queryRawUnsafe(sql)

    data = data?.filter(val => val.qty > 0)

    if (processData?.isIroning || processData?.isStitching || processData?.isPacking) {
        data = data?.filter(val => val.stage !== "Panel")
    }

    let totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }

    return { statusCode: 0, data, totalCount };
}

function manualFilterSearchData(searchYarnAliasName, searchColor, data) {
    if (!searchYarnAliasName && !searchColor) return data

    let color = searchColor.toUpperCase();
    let fabric = searchYarnAliasName.toUpperCase();

    if (searchYarnAliasName && searchColor) {

        return data.filter(item =>
            (color ? String(item.name).includes(color) : true && fabric ? String(item.fabricName).includes(fabric) : true)
        )
    }
    else {
        return data.filter(item =>
            (color ? String(item.name).includes(color) : true || fabric ? String(item.fabricName).includes(fabric) : true)
        )
    }

}

async function get(req) {
    const { branchId, storeId, itemType, filterColors, isGetStockReport = false,
        pagination = false, dataPerPage = 5, pageNumber = 1,
        searchColor, searchUom, searchLotNo, searchPrevProcess, searchYarnAliasName, processInwardId, stockId, rawMaterialSalesId,
        yarnId, fabricId, designId, gaugeId, loopLengthId, gsmId, kDiaId, fDiaId, accessoryId, sizeId, colorId, uomId, lotNo, processId, stockReport, fromDate, toDate, finishedGoodsStockReport
    } = req.query
    let data;
    if (stockReport) {
        return { statusCode: 0, data: await getStockReport(itemType, storeId, toDate, branchId) };
    }
    if (finishedGoodsStockReport) {
        return { statusCode: 0, data: await getFinishedGoodsStockReport(storeId, toDate, branchId) };
    };


    if (isGetStockReport) {
        data = await getStockReportForCuttingDelivery(storeId, itemType, branchId, pageNumber, dataPerPage)
    }
    else {
        data = await xprisma.stock.groupBy({
            where: {
                branchId: branchId ? parseInt(branchId) : undefined,
                storeId: storeId ? parseInt(storeId) : undefined,
                itemType,
                yarnId: yarnId ? parseInt(yarnId) : undefined,
                fabricId: fabricId ? parseInt(fabricId) : undefined,
                designId: designId ? parseInt(designId) : undefined,
                gaugeId: gaugeId ? parseInt(gaugeId) : undefined,
                loopLengthId: loopLengthId ? parseInt(loopLengthId) : undefined,
                gsmId: gsmId ? parseInt(gsmId) : undefined,
                kDiaId: kDiaId ? parseInt(kDiaId) : undefined,
                fDiaId: fDiaId ? parseInt(fDiaId) : undefined,
                accessoryId: accessoryId ? parseInt(accessoryId) : undefined,
                sizeId: sizeId ? parseInt(sizeId) : undefined,
                colorId: colorId ? parseInt(colorId) : undefined,
                uomId: uomId ? parseInt(uomId) : undefined,
                lotNo,
                processId: (processId && JSON.parse(processId)) ? parseInt(processId) : undefined,
                Color: searchColor ? {
                    name: {
                        contains: searchColor
                    }
                } : undefined,
                Uom: searchUom ? {
                    name: {
                        contains: searchUom
                    }
                } : undefined,
                lotNo: searchLotNo ? {
                    contains: searchLotNo
                } : undefined,
                Process: searchPrevProcess ? {
                    name: {
                        contains: searchPrevProcess
                    }
                } : undefined,
                Yarn: searchYarnAliasName ? {
                    aliasName: {
                        contains: searchYarnAliasName
                    }
                } : undefined,
                colorId: (filterColors && filterColors.length > 0) ? {
                    in: filterColors.split(",").map(id => parseInt(id))
                } : undefined,
                id: stockId ? { lt: parseInt(stockId) } : undefined,
                OR: processInwardId ? [
                    {
                        ProgramInwardLotDetails: {
                            processInwardProgramDetailsId: {
                                processInwardId: { lt: parseInt(processInwardId) }
                            }
                        }
                    },
                    { programInwardLotDetailsId: null }
                ] : undefined,
                OR: rawMaterialSalesId ? [
                    {
                        RawMaterialsSalesDetails: {
                            rawMaterialsSalesId: {
                                lt: parseInt(rawMaterialSalesId)
                            }
                        },
                    },
                    { rawMaterialsSalesDetailsId: null }
                ] : undefined
            },
            by: ["storeId", "itemType", "processId",
                "yarnId",
                "fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId",
                "accessoryId", "sizeId",
                "colorId",
                "uomId",
                "lotNo", "branchId", 'inOrOut'
            ],
            _sum: {
                qty: true,
                gross: true,
                noOfRolls: true,
                noOfBags: true,
            },
        })
        data = data.filter(item => (item._sum.qty > 0));
    }

    // data = data.filter(item => !(item._sum.qty === 0));
    let newItemArray = []
    data = await (async function getPrice() {
        for (let i = 0; i < data?.length; i++) {
            let item = data[i]
            let price = await getStockProperty(itemType, item, "price", item.storeId, branchId);
            let newObj = { ...item, price: price }
            newItemArray.push(newObj)
        }
        return Promise.all(newItemArray)
    })()



    data = newItemArray

    data = manualFilterSearchData(searchYarnAliasName, searchColor, data)

    let totalCount = data.length
    if (pagination) {


        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    return { statusCode: 0, data, totalCount };
}


async function getOne() {
    const {
        branchId,
        storeId,
        yarnId,
        fabricId,
        designId,
        gaugeId,
        loopLengthId,
        gsmId,
        kDiaId,
        fDiaId,
        accessoryId,
        sizeId,
        colorId,
        uomId,
        lotNo,
        itemType
    } = req.query
    let data = await xprisma.stock.groupBy({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            itemType,
            yarnId: yarnId ? parseInt(yarnId) : undefined,
            fabricId: fabricId ? parseInt(fabricId) : undefined,
            designId: designId ? parseInt(designId) : undefined,
            gaugeId: gaugeId ? parseInt(gaugeId) : undefined,
            loopLengthId: loopLengthId ? parseInt(loopLengthId) : undefined,
            gsmId: gsmId ? parseInt(gsmId) : undefined,
            kDiaId: kDiaId ? parseInt(kDiaId) : undefined,
            fDiaId: fDiaId ? parseInt(fDiaId) : undefined,
            accessoryId: accessoryId ? parseInt(accessoryId) : undefined,
            sizeId: sizeId ? parseInt(sizeId) : undefined,
            colorId: colorId ? parseInt(colorId) : undefined,
            uomId: uomId ? parseInt(uomId) : undefined,
            lotNo,
            processId: processId ? parseInt(processId) : undefined
        },
        by: ["storeId", "itemType", "processId",
            "yarnId",
            "fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId",
            "accessoryId", "sizeId",
            "colorId",
            "uomId",
            "lotNo"
        ],
        _sum: {
            qty: true,
            gross: true,
            noOfRolls: true,
            noOfBags: true,
        },
    })
    data = await (async function getPrice() {
        let promises = data.map(async (item) => {
            let newItem = structuredClone(item);
            newItem["price"] = await getStockProperty(itemType, item, "price", item.storeId, branchId);
            return newItem
        })
        return Promise.all(promises)
    })()
    if (!data) return NoRecordFound("stock");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.stock.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    aliasName: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { aliasName, accessoryItemId, hsn, accessoryCategory, active, companyId } = await body
    const data = await prisma.stock.create({
        data: {
            aliasName, accessoryItemId: parseInt(accessoryItemId), hsn, accessoryCategory,
            active, companyId: parseInt(companyId)
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { aliasName, accessoryItemId, hsn, accessoryCategory, active, companyId } = await body
    const dataFound = await prisma.stock.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("stock");
    const data = await prisma.stock.update({
        where: {
            id: parseInt(id),
        },
        data: {
            aliasName, accessoryItemId: parseInt(accessoryItemId), hsn, accessoryCategory,
            active, companyId: parseInt(companyId)
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.stock.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
}




// import { PrismaClient, Prisma } from '@prisma/client'
// import { NoRecordFound } from '../configs/Responses.js';
// import { getDateFromDateTime, getDateTimeRange, getStockProperty } from '../utils/helper.js';

// const prisma = new PrismaClient()

// const xprisma = prisma.$extends({
//     result: {
//         stock: {
//             gross: {
//                 needs: { price: true, qty: true },
//                 compute(stock) {
//                     return stock.price * stock.qty
//                 }
//             },
//         }
//     },
// })

// export async function getPcsStock(req) {
//     const {
//         pagination = false, dataPerPage = 5, pageNumber = 1, storeId, prevProcessId, styleId, productionDeliveryId, isPacking, finishedGoodsSalesId
//     } = req.query
//     let processId;
//     if (prevProcessId) {
//         let processData = await prisma.process.findUnique({
//             where: {
//                 id: parseInt(prevProcessId)
//             }
//         })
//         processId = prevProcessId;
//         if (processData?.isCutting) {
//             processId = null
//         }
//     }
//     const storeFilter = Prisma.sql`stockForPcs.storeId = ${storeId}`
//     const processFilter = processId ? Prisma.sql`stockForPcs.prevProcessId = ${prevProcessId}` : Prisma.sql`stockForPcs.prevProcessId IS NULL`
//     const productionDeliveryIdFilter = Prisma.sql`(productionDelivery.id < ${productionDeliveryId} or productionDelivery.id IS NULL)`
//     const isPackingFilter = isPacking ? Prisma.sql`process.isPacking = 1` : Prisma.sql`(process.isPacking = 0 OR process.isPacking IS NULL)`
//     let filterConditions = []
//     if (styleId) {
//         filterConditions.push(Prisma.sql`stockForPcs.styleId = ${styleId}`)
//     }
//     if (productionDeliveryId) {
//         filterConditions.push(productionDeliveryIdFilter)
//     }
//     if (finishedGoodsSalesId) {
//         filterConditions.push(Prisma.sql`(finishedGoodsSales.id < ${finishedGoodsSalesId} or finishedGoodsSales.id IS NULL)`)
//     }
//     if (!isPacking) {
//         filterConditions.push(processFilter)
//     }
//     filterConditions = [...filterConditions, storeFilter, isPackingFilter]
//     const where = Prisma.sql`where ${Prisma.join(filterConditions, ' and ')}`
//     let data = await prisma.$queryRaw`
//     select style.sku as styleName, stockForPcs.styleId,stockForPcs.portionId,portion.name as portionName, stockForPcs.sizeId,stockForPcs.colorId,color.name as colorName, stockForPcs.uomId, unitOfMeasurement.name as uomName,
//     size.name as sizeName, stockForPcs.prevProcessId, IF(stockForPcs.prevProcessId is null, "Cutting",process.name) as processName, sum(stockforpcs.qty) as qty
//     from stockforpcs
//     left join productionDeliveryDetails on productionDeliveryDetails.id = stockforpcs.productionDeliveryDetailsId
//     left join productionDelivery on productionDelivery.id = productionDeliveryDetails.productionDeliveryId
//     left join finishedGoodsSalesDetails on finishedGoodsSalesDetails.id = stockForPcs.finishedGoodsSalesDetailsId
//     left join finishedGoodsSales on finishedGoodsSales.id = finishedGoodsSalesDetails.finishedGoodsSalesId
//     left join style on style.id = stockForPcs.styleId
//     left join size on size.id = stockForPcs.sizeId
//     left join color on color.id = stockForPcs.colorId
//     left join process on process.id = stockForPcs.prevProcessId
//     left join portion on portion.id = stockForPcs.portionId
//     left join unitOfMeasurement on unitOfMeasurement.id = stockForPcs.uomId
//     ${where}
//     group by stockForPcs.styleId,stockForPcs.portionId, stockForPcs.sizeId, stockForPcs.prevProcessId, stockForPcs.colorId, stockForPcs.
//     having sum(stockforpcs.qty) > 0
//     `
//     let totalCount = data.length
//     if (pagination) {
//         data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
//     }
//     return { statusCode: 0, data, totalCount };
// }

// async function get(req) {

//     const {
//         branchId,
//         fromDate,
//         productId,
//         searchProduct,
//         pagination = false, dataPerPage = 5, pageNumber = 1,
//         stockData,
//         stockReport,
//     } = req.query;

//     let data;

//     if (stockData) {
//         data = await prisma.$queryRaw`
//         SELECT
//     stock.productId,
//     stock.uomId,
//     product.name,
//     sum(qty) as sum,
//     uom.name as uom
// FROM
//     stock
// LEFT JOIN
//     product ON product.Id = stock.productId
// LEFT JOIN
//     uom ON uom.Id = stock.uomId
// WHERE
//     stock.branchId = ${branchId}
// GROUP BY
//     stock.productId,
//     stock.uomId;
//         `;
//         let totalCount = data.length;
//         if (pagination) {
//             data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage);
//         }
//         return { statusCode: 0, data, totalCount };
//     }

//     if (stockReport) {
//         data = await prisma.$queryRaw`
//  SELECT product.name AS Product,
//              SUM(qty)as Stock ,saleprice as "SaleRate", uom.name as Uom,  (saleprice * SUM(qty)) AS "SaleValue"
//             FROM
//                 Stock sub
//                 LEFT JOIN
//                 product ON product.id = sub.productId
//                 LEFT JOIN uom
//                 on uom.id = sub.uomId
//                 WHERE
//            product.id = sub.productId
//             GROUP BY sub.saleprice,sub.productId , product.name, sub.uomId, uom.name
//             having Stock > 0
//             order by product.name`;
//         let totalCount = data.length;
//         if (pagination) {
//             data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage);
//         }
//         return { statusCode: 0, data, totalCount };
//     }

//     data = await xprisma.stock.groupBy({
//         where: {
//             productId: productId ? parseInt(productId) : undefined,
//             Product: searchProduct ? {
//                 name: {
//                     contains: searchProduct,
//                 },
//             } : undefined,
//         },
//         by: ["productId", 'uomId'],
//         _sum: {
//             qty: true,
//         },
//     });
//     data = data.filter(item => !(item._sum.qty === 0));
//     let totalCount = data.length;

//     if (pagination) {
//         data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage);
//     }

//     return { statusCode: 0, data, totalCount };
// }



// async function getOne(id, query) {
//     const { productId, uomId, salePrice } = query;
//     let data;

//     if (salePrice) {
//         data = await prisma.$queryRaw`
//             SELECT
//                 SUM(qty) AS stockQty,
//                 salePrice,
//                 productId
//             FROM
//                 stock
//             WHERE
//                 stock.productId = ${productId}
//                 AND stock.uomId = ${uomId}
//                 AND stock.salePrice = ${salePrice}
//             GROUP BY
//                 productId,
//                 salePrice;
//         `;
//     } else {
//         data = await prisma.$queryRaw`
//             SELECT
//                 SUM(qty) AS stockQty,
//                 salePrice,
//                 productId
//             FROM
//                 stock
//             WHERE
//                 stock.productId = ${productId}
//                 AND stock.uomId = ${uomId}
//             GROUP BY
//                 productId,
//                 salePrice;
//         `;
//     }

//     if (!data || data.length === 0) {
//         return NoRecordFound("stock");
//     }

//     return { statusCode: 0, data };
// }



// async function getSearch(req) {
//     const { companyId, active } = req.query
//     const { searchKey } = req.params
//     const data = await prisma.stock.findMany({
//         where: {
//             country: {
//                 companyId: companyId ? parseInt(companyId) : undefined,
//             },
//             active: active ? Boolean(active) : undefined,
//             OR: [
//                 {
//                     aliasName: {
//                         contains: searchKey,
//                     },
//                 }
//             ],
//         }
//     })
//     return { statusCode: 0, data: data };
// }

// async function create(body) {
//     const { aliasName, accessoryItemId, hsn, accessoryCategory, active, companyId } = await body
//     const data = await prisma.stock.create({
//         data: {
//             aliasName, accessoryItemId: parseInt(accessoryItemId), hsn, accessoryCategory,
//             active, companyId: parseInt(companyId)
//         },
//     });
//     return { statusCode: 0, data };
// }

// async function update(id, body) {
//     const { aliasName, accessoryItemId, hsn, accessoryCategory, active, companyId } = await body
//     const dataFound = await prisma.stock.findUnique({
//         where: {
//             id: parseInt(id)
//         }
//     })
//     if (!dataFound) return NoRecordFound("stock");
//     const data = await prisma.stock.update({
//         where: {
//             id: parseInt(id),
//         },
//         data: {
//             aliasName, accessoryItemId: parseInt(accessoryItemId), hsn, accessoryCategory,
//             active, companyId: parseInt(companyId)
//         },
//     })
//     return { statusCode: 0, data };
// };

// async function remove(id) {
//     const data = await prisma.stock.delete({
//         where: {
//             id: parseInt(id)
//         },
//     })
//     return { statusCode: 0, data };
// }

// export {
//     get,
//     getOne,
//     getSearch,
//     create,
//     update,
//     remove,
// }





































