import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

import {
  billItemsFiltration,
  getDateFromDateTime,
  getRemovedItems,
  getYearShortCodeForFinYear,
  substract,
  balanceQtyCalculation,
  balanceReturnQtyCalculation,
  getYearShortCode,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  createManyStockWithId,
  updateManyStockWithId,
} from "../utils/stockHelper.js";
import { getAllDataPoItems, getPoItemObject } from "./po.service.js";
import {
  getDirectInwardReturnItemsAlreadyData,
  getDirectInwardReturnItemsLotBreakUp,
} from "../utils/directInwardReturnQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
const prisma = new PrismaClient();
function getInwardOrReturnShortCode(poInwardOrDirectInward) {
  switch (poInwardOrDirectInward) {
    case "DirectInward":
      return "DI";
    case "PurchaseInward":
      return "GRN";
    default:
      break;
  }
}

async function getNextDocId(
  branchId,
  poInwardOrDirectInward,
  shortCode,
  startTime,
  endTime
) {
  let lastObject = await prisma.directInwardOrReturn.findFirst({
    where: {
      // poInwardOrDirectInward,
      branchId: parseInt(branchId),
      AND: [
        {
          createdAt: {
            gte: startTime,
          },
        },
        {
          createdAt: {
            lte: endTime,
          },
        },
      ],
    },
    orderBy: {
      id: "desc",
    },
  });
  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}${getYearShortCode(
    new Date()
  )}/${getInwardOrReturnShortCode(poInwardOrDirectInward)}/1`;
  if (lastObject) {
    newDocId = `${branchObj.branchCode}${getYearShortCode(
      new Date()
    )}/${getInwardOrReturnShortCode(poInwardOrDirectInward)}/${
      parseInt(lastObject.docId.split("/").at(-1)) + 1
    }`;
  }
  return newDocId;
}

function manualFilterSearchData(
  searchPoDate,
  searchDueDate,
  searchPoType,
  data
) {
  return data.filter(
    (item) =>
      (searchPoDate
        ? String(getDateFromDateTime(item.createdAt)).includes(searchPoDate)
        : true) &&
      (searchDueDate
        ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate)
        : true) &&
      (searchPoType
        ? item.poType.toLowerCase().includes(searchPoType.toLowerCase())
        : true)
  );
}

async function get(req) {
  const {
    branchId,
    active,
    poInwardOrDirectInward,
    pageNumber,
    dataPerPage,
    searchDocId,
    searchPoDate,
    searchSupplierAliasName,
    searchPoType,
    searchDueDate,
    pagination,
    finYearId,
  } = req.query;
  let data;
  let totalCount;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  console.log(finYearDate, "finYearDate");
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime
      )
    : "";
  if (pagination) {
    data = await prisma.directInwardOrReturn.findMany({
      where: {
        AND: finYearDate
          ? [
              {
                createdAt: {
                  gte: finYearDate.startTime,
                },
              },
              {
                createdAt: {
                  lte: finYearDate.endTime,
                },
              },
            ]
          : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
        // poInwardOrDirectInward,
        docId: Boolean(searchDocId)
          ? {
              contains: searchDocId,
            }
          : undefined,
        supplier: {
          aliasName: Boolean(searchSupplierAliasName)
            ? { contains: searchSupplierAliasName }
            : undefined,
        },
      },
      orderBy: {
        id: "desc",
      },
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });
    data = manualFilterSearchData(
      searchPoDate,
      searchDueDate,
      searchPoType,
      data
    );
    totalCount = data.length;
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
    );
  } else {
    data = await prisma.directInwardOrReturn.findMany({
      where: {
        AND: finYearDate
          ? [
              {
                createdAt: {
                  gte: finYearDate.startTime,
                },
              },
              {
                createdAt: {
                  lte: finYearDate.endTime,
                },
              },
            ]
          : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
        // poInwardOrDirectInward,
      },
      include: {
        supplier: {
          select: {
            name: true,
            id: true,
            aliasName: true,
          },
        },
      },
    });
  }
  let docId = await getNextDocId(
    branchId,
    poInwardOrDirectInward,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime
  );
  return { statusCode: 0, data, nextDocId: docId, totalCount };
}

export async function getDirectItems(req) {
  const {
    branchId,
    active,
    poInwardOrDirectInward,
    dataPerPage,
    storeId,
    searchDocId,
    searchPoDate,
    searchSupplierAliasName,
    searchPoType,
    searchDueDate,
    isDirectInwardFilter,
    supplierId,
    poType,
    pagination,
    pageNumber,
    isPurchaseCancelFilter = false,
    isPurchaseReturnFilter = false,
  } = req.query;
  let data;
  let totalCount;
  console.log(pagination, "pagination");
  if (pagination) {
    data = await prisma.directItems.findMany({
      where: {
        // DirectInwardOrReturn:
        // {
        //     branchId: branchId ? parseInt(branchId) : undefined,
        //     docId: Boolean(searchDocId) ?
        //         {
        //             contains: searchDocId
        //         }
        //         : undefined,
        //     supplierId: supplierId ? parseInt(supplierId) : undefined,
        //     storeId: storeId ? parseInt(storeId) : undefined,
        //     poType,
        //     supplier: {
        //         aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
        //     }
        // },
      },
      include: {
        DirectInwardOrReturn: {
          select: {
            poInwardOrDirectInward: true,
            poType: true,
          },
        },
        DirectReturnItems: true,
        Yarn: {
          select: {
            aliasName: true,
          },
        },
        Color: {
          select: {
            name: true,
          },
        },
        Uom: {
          select: {
            name: true,
          },
        },
        Fabric: {
          select: {
            aliasName: true,
          },
        },
        Gauge: {
          select: {
            name: true,
          },
        },
        LoopLength: {
          select: {
            name: true,
          },
        },
        Design: {
          select: {
            name: true,
          },
        },
        Gsm: {
          select: {
            name: true,
          },
        },
        KDia: {
          select: {
            name: true,
          },
        },
        FDia: {
          select: {
            name: true,
          },
        },
        Accessory: {
          select: {
            aliasName: true,
            accessoryItem: {
              select: {
                name: true,
                AccessoryGroup: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        Size: {
          select: {
            name: true,
          },
        },
      },
    });
    data = manualFilterSearchDataDirectItems(
      searchPoDate,
      searchDueDate,
      searchPoType,
      data
    );
    totalCount = data.length;
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
    );
    // data = await getAllDataPoItems(data)
    data = await getAllDataDirectItems(data, storeId);

    if (isDirectInwardFilter) {
      data = data
        ?.filter(
          (val) =>
            val.DirectInwardOrReturn?.poInwardOrDirectInward == "DirectInward"
        )
        ?.filter(
          (item) =>
            balanceReturnQtyCalculation(
              item.qty,
              0,
              item.alreadyInwardedQty,
              item.alreadyReturnedData._sum?.qty
            ) > 0
        );
    }

    // if (isPurchaseCancelFilter) {
    //     data = data.filter(item => balanceQtyCalculation(item.qty, item.alreadyCancelData._sum?.qty, item.alreadyInwardedData._sum?.qty, item.alreadyReturnedData._sum?.qty) > 0)
    // }
    // if (isPurchaseReturnFilter) {
    //     data = data.filter(item => substract(item.alreadyInwardedData?._sum?.qty ? item.alreadyInwardedData._sum?.qty : 0, item.alreadyReturnedData?._sum?.qty ? item.alreadyReturnedData?._sum?.qty : 0) > 0)
    // }
  } else {
    data = await prisma.directItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }
  return { statusCode: 0, data, totalCount };
}

function manualFilterSearchDataDirectItems(
  searchPoDate,
  searchDueDate,
  searchPoType,
  data
) {
  return data.filter(
    (item) =>
      (searchPoDate
        ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate)
        : true) &&
      (searchDueDate
        ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate)
        : true) &&
      (searchPoType
        ? item.DirectInwardOrReturn.poType
            .toLowerCase()
            .includes(searchPoType.toLowerCase())
        : true)
  );
}

function manualFilterSearchDataPoItems(
  searchPoDate,
  searchDueDate,
  searchPoType,
  data
) {
  return data.filter(
    (item) =>
      (searchPoDate
        ? String(getDateFromDateTime(item.Po.createdAt)).includes(searchPoDate)
        : true) &&
      (searchDueDate
        ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate)
        : true) &&
      (searchPoType
        ? item.Po.transType.toLowerCase().includes(searchPoType.toLowerCase())
        : true)
  );
}

export async function getAllDataDirectItems(data, storeId) {
  let promises = data.map(async (item) => {
    let data = await getDirectItemById(item.id, null, null, storeId, null);
    return data.data;
  });
  return Promise.all(promises);
}

export async function getDirectItemById(
  id,
  billEntryId,
  directReturnOrPoReturnId,
  storeId,
  stockId
) {
  let data = await prisma.directItems.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      inwardLotDetails: true,
      DirectReturnItems: true,
      DirectInwardOrReturn: {
        select: {
          docId: true,
          storeId: true,
          poInwardOrDirectInward: true,
          dcNo: true,
          dcDate: true,
          createdAt: true,
          poType: true,
        },
      },
      Yarn: {
        select: {
          aliasName: true,
        },
      },
      Color: {
        select: {
          name: true,
        },
      },
      Uom: {
        select: {
          name: true,
        },
      },
      // Fabric: {
      //     select: {
      //         aliasName: true,
      //         name: true,
      //     }
      // },
      Gauge: {
        select: {
          name: true,
        },
      },
      LoopLength: {
        select: {
          name: true,
        },
      },
      Design: {
        select: {
          name: true,
        },
      },
      Gsm: {
        select: {
          name: true,
        },
      },
      KDia: {
        select: {
          name: true,
        },
      },
      FDia: {
        select: {
          name: true,
        },
      },
      Accessory: {
        select: {
          aliasName: true,
          accessoryItem: {
            select: {
              name: true,
              AccessoryGroup: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      Size: {
        select: {
          name: true,
        },
      },
    },
  });

  const alreadyReturnedData = await prisma.directReturnItems.aggregate({
    where: {
      directItemsId: parseInt(id),
      DirectReturnOrPoReturn: {
        poInwardOrDirectInward: "DirectReturn",
      },
      directReturnOrPoReturnId: {
        lt: JSON.parse(directReturnOrPoReturnId)
          ? parseInt(directReturnOrPoReturnId)
          : undefined,
      },
    },
    _sum: {
      qty: true,
      noOfBags: true,
      noOfRolls: true,
    },
  });

  console.log(alreadyReturnedData, "alreadyReturnedData");

  const alreadyReturnedLotWiseData = await prisma.directReturnItems.groupBy({
    where: {
      directItemsId: parseInt(id),
      DirectReturnOrPoReturn: {
        poInwardOrDirectInward: "DirectReturn",
      },
      directReturnOrPoReturnId: {
        lt: JSON.parse(directReturnOrPoReturnId)
          ? parseInt(directReturnOrPoReturnId)
          : undefined,
      },
    },
    by: ["directItemsId"],
    _sum: {
      qty: true,
      noOfBags: true,
      noOfRolls: true,
    },
  });

  let alreadyInwardLotWiseData = [];
  let inwardQty = parseFloat(data?.qty || 0).toFixed(3);
  let alreadyInwardedQty = data?.qty
    ? parseFloat(data?.qty).toFixed(3)
    : "0.000";
  let alreadyInwardedRolls = data?.noOfRolls ? parseInt(data?.noOfRolls) : "0";
  let alreadyReturnedRolls = alreadyReturnedData?._sum?.noOfRolls
    ? parseInt(alreadyReturnedData._sum?.noOfRolls)
    : "0";
  let alreadyReturnedQty = alreadyReturnedData?._sum?.qty
    ? parseFloat(alreadyReturnedData._sum?.qty).toFixed(3)
    : "0.000";

  let balanceQty = substract(alreadyInwardedQty, alreadyReturnedQty);
  let allowedReturnRolls = substract(
    alreadyInwardedRolls,
    alreadyReturnedRolls
  );
  console.log(
    alreadyInwardedQty,
    "alreadyInwardedQty",
    alreadyReturnedQty,
    "alreadyReturnedQty"
  );
  let allowedReturnQty = substract(alreadyInwardedQty, alreadyReturnedQty);
  console.log(
    substract(alreadyInwardedQty, alreadyReturnedQty),
    "allowedReturnQty"
  );

  let stockQty = parseFloat(
    (
      await getStockQty(
        data?.DirectInwardOrReturn?.storeId,
        data?.DirectInwardOrReturn?.poType,
        data?.accessoryId,
        data?.colorId,
        data?.uomId,
        data?.designId,
        data?.gaugeId,
        data?.loopLengthId,
        data?.gsmId,
        data?.sizeId,
        data?.fabricId,
        data?.kDiaId,
        data?.fDiaId
      )
    )?.stockQty || 0
  );
  let stockRolls = parseInt(
    (
      await getStockQty(
        data?.DirectInwardOrReturn?.storeId,
        data?.DirectInwardOrReturn?.poType,
        data?.accessoryId,
        data?.colorId,
        data?.uomId,
        data?.designId,
        data?.gaugeId,
        data?.loopLengthId,
        data?.gsmId,
        data?.sizeId,
        data?.fabricId,
        data?.kDiaId,
        data?.fDiaId
      )
    )?.stockRolls || 0
  );

  // let inwardLotDetailsdata = `select directItemsID, lotNo, sum(inwardLotDetails.qty) as qty ,sum(inwardLotDetails.noOfRolls) as noOfRolls from directItems
  // left join DirectInwardOrReturn on  DirectInwardOrReturn.id=directItems.directInwardOrReturnId left join inwardLotDetails on inwardLotDetails.directItemsId=directItems.id
  // WHERE  directItems.poitemsid is null and DirectInwardOrReturn.poinwardordirectinward="DirectInward"
  // group By lotNo ,directItemsID`

  // inwardLotDetailsdata = await prisma.$queryRawUnsafe(inwardLotDetailsdata);

  // for (let i = 0; i < inwardLotDetailsdata?.length; i++) {
  //     let inwardData = inwardLotDetailsdata[i]
  //     alreadyInwardLotWiseData.push(await getLotWiseDatas(inwardData))
  // }

  async function getLotWiseDatas(inwardData) {
    return {
      lotNo: inwardData?.lotNo,
      inwardNoOfRolls: inwardData?.noOfRolls,
      inwardQty: inwardData?.qty,
      qty: 0,
      noOfRolls: 0,
      alreadyReturnedRolls: (
        await getLotWiseReturnRolls(
          inwardData?.lotNo,
          inwardData?.directItemsID
        )
      )?.lotRolls,
      alreadyReturnedQty: (
        await getLotWiseReturnRolls(
          inwardData?.lotNo,
          inwardData?.directItemsID
        )
      )?.lotQty,
      // stockQty: parseFloat(parseFloat(inwardData?.qty) - parseFloat((await getLotWiseReturnRolls(inwardData?.lotNo, inwardData?.directItemsID))?.lotQty || 0)),
      stockQty: parseFloat(
        (
          await getStockQtyByLot(
            inwardData?.lotNo,
            storeId,
            data?.DirectInwardOrReturn?.poType,
            data?.accessoryId,
            data?.colorId,
            data?.uomId,
            data?.designId,
            data?.gaugeId,
            data?.loopLengthId,
            data?.gsmId,
            data?.sizeId,
            data?.fabricId,
            data?.kDiaId,
            data?.fDiaId
          )
        )?.stockQty || 0
      ),
      allowedReturnQty: parseFloat(
        parseFloat(inwardData?.qty) -
          parseFloat(
            (
              await getLotWiseReturnRolls(
                inwardData?.lotNo,
                inwardData?.directItemsID
              )
            )?.lotQty || 0
          )
      ),
    };
  }

  async function getLotWiseReturnRolls(lotNo, directItemsID) {
    let returnDatas = `
    select sum(ReturnLotDetails.qty) as lotQty,sum(ReturnLotDetails.noOfRolls) as lotRolls from directReturnItems left join DirectReturnOrPoReturn on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId
    left join ReturnLotDetails on ReturnLotDetails.directReturnItemsId=directReturnItems.id
    where directReturnItems.poItemsId  is null and DirectReturnOrPoReturn.poInwardOrDirectInward="DirectReturn" and ReturnLotDetails.lotNo=${lotNo} AND directReturnItems.directItemsID=${directItemsID} ;
    `;

    const alreadyReturnData = await prisma.$queryRawUnsafe(returnDatas);

    return alreadyReturnData[0];
  }

  const poItemObj = getStockObject(data?.DirectInwardOrReturn?.poType, data);
  let stockData;
  if (data?.DirectInwardOrReturn?.poType === "Accessory") {
    stockData = await prisma.stock.aggregate({
      where: {
        ...poItemObj,
        storeId: JSON.parse(storeId) ? parseInt(storeId) : undefined,
        id: {
          lt: JSON.parse(stockId) ? parseInt(stockId) : undefined,
        },
      },
      _sum: {
        qty: true,
        noOfBags: true,
        noOfRolls: true,
      },
    });
  } else {
    stockData = await prisma.stock.groupBy({
      where: {
        ...poItemObj,
        inOrOut: data?.DirectInwardOrReturn?.poInwardOrDirectInward,
        storeId: JSON.parse(storeId) ? parseInt(storeId) : undefined,
        id: {
          lt: JSON.parse(stockId) ? parseInt(stockId) : undefined,
        },
      },
      by: [
        "yarnId",
        "colorId",
        "uomId",
        "fabricId",
        "gaugeId",
        "loopLengthId",
        "designId",
        "gsmId",
        "kDiaId",
        "fDiaId",
        "sizeId",
        "storeId",
        "branchId",
      ],
      _sum: {
        qty: true,
        noOfBags: true,
        noOfRolls: true,
      },
    });
  }

  return {
    statusCode: 0,
    data: {
      ...data,
      balanceQty,
      inwardQty,
      stockQty,
      stockRolls,
      allowedReturnRolls,
      allowedReturnQty,
      alreadyInwardedQty,
      alreadyInwardedRolls,
      alreadyReturnedQty,
      alreadyReturnedData,
      stockData,

      alreadyInwardLotWiseData: alreadyInwardLotWiseData?.filter(
        (val) => parseFloat(val?.stockQty) !== 0
      ),
    },
  };

  async function getStockQty(
    storeId,
    itemType,
    accessoryId,
    colorId,
    uomId,
    designId,
    gaugeId,
    loopLengthId,
    gsmId,
    sizeId,
    fabricId,
    kDiaId,
    fDiaId
  ) {
    let sql;

    console.log(
      "hitstock",
      itemType == "Accessory",
      colorId,
      uomId,
      sizeId,
      accessoryId,
      storeId
    );

    if (itemType == "Accessory") {
      sql = `select
            sum(qty) as stockQty from stock
            where colorId=${colorId} and uomId=${uomId} 
           and sizeId=${sizeId} and 
            accessoryId=${accessoryId} and  
            storeId=${storeId} 
                    `;
    } else {
      sql = `select sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
        where colorId=${colorId} and uomId=${uomId} ;`;
    }

    const stockData = await prisma.$queryRawUnsafe(sql);
    return stockData[0];
  }

  async function getStockQtyByLot(
    lotNo,
    storeId,
    itemType,
    accessoryId,
    colorId,
    uomId,
    designId,
    gaugeId,
    loopLengthId,
    gsmId,
    sizeId,
    fabricId,
    kDiaId,
    fDiaId
  ) {
    let sql;

    if (itemType == "DyedFabric") {
      sql = `select 
            sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
            where colorId=${colorId} and uomId=${uomId} and designId=${designId} and gaugeId=${gaugeId} and loopLengthId=${loopLengthId}
             and gsmId=${gsmId}  and 
            fabricId=${fabricId} and   kDiaId=${kDiaId} and fDiaId=${fDiaId} and 
            storeId=${storeId} and lotNo=${lotNo}
                    `;
    } else {
      sql = `select
            sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
            where colorId=${colorId} and uomId=${uomId} 
           and sizeId=${sizeId} and 
            accessoryId=${accessoryId} and  
            storeId=${storeId} 
                    `;
    }

    const stockData = await prisma.$queryRawUnsafe(sql);
    return stockData[0];
  }

  function getStockObject(transType, item, poInwardOrDirectInward = null) {
    let newItem = {};
    if (transType === "GreyYarn" || transType === "DyedYarn") {
      newItem["yarnId"] = parseInt(item["yarnId"]);
    } else if (transType === "GreyFabric" || transType === "DyedFabric") {
      newItem["fabricId"] = parseInt(item["fabricId"]);
      newItem["designId"] = parseInt(item["designId"]);
      newItem["gaugeId"] = parseInt(item["gaugeId"]);
      newItem["loopLengthId"] = parseInt(item["loopLengthId"]);
      newItem["gsmId"] = parseInt(item["gsmId"]);
      newItem["kDiaId"] = parseInt(item["kDiaId"]);
      newItem["fDiaId"] = parseInt(item["fDiaId"]);
    } else if (transType === "Accessory") {
      newItem["accessoryId"] = parseInt(item["accessoryId"]);
      newItem["sizeId"] = item["sizeId"] ? parseInt(item["sizeId"]) : undefined;
    }
    newItem["uomId"] = parseInt(item["uomId"]);
    newItem["colorId"] = parseInt(item["colorId"]);

    return newItem;
  }

  // const alreadyBillData = await prisma.billEntryItems.aggregate({
  //     where: {
  //         directItemsId: parseInt(id),
  //         billEntryId: {
  //             lt: JSON.parse(billEntryId) ? parseInt(billEntryId) : undefined
  //         }
  //     },
  //     _sum: {
  //         qty: true,
  //     }
  // });

  // return {
  //     statusCode: 0, data: {
  //         ...data,
  //         alreadyBillData,
  //     }
  // };
}

export async function getPoItemsandDirectInwardItems(req) {
  const {
    branchId,
    active,
    pageNumber,
    dataPerPage,
    poType,
    searchDocId,
    searchPoDate,
    searchSupplierAliasName,
    searchPoType,
    searchDueDate,
    pagination,
    supplierId,
  } = req.query;
  let poItems;
  let directItems;
  let data;
  let totalCount;
  if (pagination) {
    directItems = await prisma.directItems.findMany({
      where: {
        DirectInwardOrReturn: {
          branchId: branchId ? parseInt(branchId) : undefined,
          docId: Boolean(searchDocId)
            ? {
                contains: searchDocId,
              }
            : undefined,
          supplierId: supplierId ? parseInt(supplierId) : undefined,
          poType,
          supplier: {
            aliasName: Boolean(searchSupplierAliasName)
              ? { contains: searchSupplierAliasName }
              : undefined,
          },
        },
      },
    });
    directItems = manualFilterSearchDataDirectItems(
      searchPoDate,
      searchDueDate,
      searchPoType,
      directItems
    );
    poItems = await prisma.poItems.findMany({
      where: {
        Po: {
          branchId: branchId ? parseInt(branchId) : undefined,
          docId: Boolean(searchDocId)
            ? {
                contains: searchDocId,
              }
            : undefined,
          supplierId: supplierId ? parseInt(supplierId) : undefined,
          transType: poType,
          supplier: {
            aliasName: Boolean(searchSupplierAliasName)
              ? { contains: searchSupplierAliasName }
              : undefined,
          },
        },
      },
      include: {
        Po: true,
      },
    });
    poItems = manualFilterSearchDataPoItems(
      searchPoDate,
      searchDueDate,
      searchPoType,
      poItems
    );
    poItems = await getAllDataPoItems(poItems);
    poItems = poItems.filter((item) =>
      billItemsFiltration(
        item?.alreadyInwardedData?._sum?.qty
          ? item.alreadyInwardedData?._sum?.qty
          : 0,
        item?.alreadyReturnedData?._sum?.qty
          ? item.alreadyReturnedData._sum?.qty
          : 0
      )
    );
    poItems = poItems.map((item) => {
      return { ...item, isPoItem: true };
    });
    data = [...poItems, ...directItems];
    totalCount = data.length;
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
    );
    let poItemsAfterSlice = data.filter((item) => item.isPoItem);
    let directItemsAfterSlice = data.filter((item) => !item.isPoItem);
    directItemsAfterSlice = await getAllDataDirectItems(directItemsAfterSlice);
    data = [...directItemsAfterSlice, ...poItemsAfterSlice];
  } else {
    data = await prisma.directItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }
  return { statusCode: 0, data, totalCount };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.directInwardOrReturn.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: true,
      PayTerm: true,
      DirectItems: {
        select: {
          id: true,
          Fabric: true,
          fabricId: true,
          Yarn: true,
          yarnId: true,
          Accessory: true,
          accessoryId: true,
          accessoryGroupId: true,
          accessoryItemId: true,
          Color: true,
          colorId: true,
          Uom: true,
          uomId: true,
          Design: true,
          Gauge: true,
          LoopLength: true,
          Gsm: true,
          price: true,
          discountType: true,
          discountValue: true,
          taxPercent: true,
          Size: true,
          designId: true,
          gaugeId: true,
          loopLengthId: true,
          gsmId: true,
          sizeId: true,
          KDia: true,
          kDiaId: true,
          FDia: true,
          fDiaId: true,
          directInwardOrReturnId: true,
          weightPerBag: true,
          noOfBags: true,
          noOfRolls: true,
          qty: true,
          poQty: true,
          cancelQty: true,
          alreadyInwardedQty: true,
          alreadyReturnedQty: true,
          balanceQty: true,
          poNo: true,
          inwardLotDetails: true,
          poItemsId: true,
        },
      },
    },
  });
  // data["DirectItems"] = await getDirectInwardReturnItemsLotBreakUp(data.id, data.poType)
  data["directItems"] = await getDirectInwardReturnItemsAlreadyData(
    data.id,
    data.poInwardOrDirectInward,
    data?.poType,
    data?.directItems
  );
  if (!data) return NoRecordFound("directInwardOrReturn");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.directInwardOrReturn.findMany({
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
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function createLotGridItems(
  tx,
  directItemsId,
  inwardLotDetails,
  item,
  poType,
  poInwardOrDirectInward,
  storeId,
  branchId
) {
  let promises = inwardLotDetails.map(async (temp, index) => {
    await tx.inwardLotDetails.create({
      data: {
        directItemsId: parseInt(directItemsId),
        lotNo: temp["lotNo"],
        qty: parseFloat(temp["qty"]),
        noOfBags: parseInt(temp["noOfBags"]),
        Stock: {
          create: {
            itemType: poType,
            inOrOut: poInwardOrDirectInward,
            branchId: parseInt(branchId),
            fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
            YarnId: item.yarnId ? parseInt(item.yarnId) : undefined,
            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            designId: item?.designId ? parseInt(item.designId) : undefined,
            gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
            loopLengthId: item?.loopLengthId
              ? parseInt(item.loopLengthId)
              : undefined,
            gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
            kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
            fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
            noOfBags: item?.noOfBags ? parseInt(item.noOfBags) : undefined,
            storeId: storeId ? parseInt(storeId) : undefined,
            noOfRolls: temp?.noOfRolls ? parseInt(temp.noOfRolls) : undefined,
            qty: parseFloat(temp.qty),
            price: parseFloat(item.price),
            lotNo: temp?.lotNo ? temp.lotNo : undefined,
          },
        },
      },
    });
  });
  // await dataIntegrityValidation(tx, processValid = false);
  return Promise.all(promises);
}

async function createAccessoryStock(
  tx,
  poType,
  poInwardOrDirectInward,
  branchId,
  storeId,
  item
) {
  console.log(storeId, "storeId");

  await tx.stock.create({
    data: {
      itemType: poType ? poType : undefined,
      inOrOut: poInwardOrDirectInward ? poInwardOrDirectInward : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
      sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
      accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
      accessoryGroupId: item?.accessoryGroupId
        ? parseInt(item.accessoryGroupId)
        : undefined,
      accessoryItemId: item?.accessoryItemId
        ? parseInt(item.accessoryItemId)
        : undefined,
      colorId: item?.colorId ? parseInt(item.colorId) : undefined,
      uomId: item?.uomId ? parseInt(item.uomId) : undefined,
      storeId: storeId ? parseInt(storeId) : undefined,
      qty: item?.qty ? parseFloat(item?.qty) : undefined,
      price: item.price ? parseInt(item.price) : undefined,
    },
  });
}

async function createYarnItemsStock(
  tx,
  poType,
  poInwardOrDirectInward,
  branchId,
  storeId,
  item
) {
  console.log(item, "item");
  await tx.stock.create({
    data: {
      itemType: poType,
      inOrOut: poInwardOrDirectInward,
      branchId: parseInt(branchId),
      yarnId: item.yarnId ? parseInt(item.yarnId) : undefined,
      colorId: item?.colorId ? parseInt(item.colorId) : undefined,
      uomId: item?.uomId ? parseInt(item.uomId) : undefined,
      gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
      storeId: storeId ? parseInt(storeId) : undefined,
      qty: item.qty ? parseFloat(item.qty) : undefined,
      price: item.price ? parseFloat(item.price) : undefined,
      orderId: item.orderId ? item.orderId : undefined,
    },
  });
  console.log("Eror");
}

async function createDirectInwardReturnItems(
  tx,
  directInwardOrReturnId,
  directItems,
  poType,
  poInwardOrDirectInward,
  storeId,
  branchId
) {
  console.log(poType == "GreyYarn" || poType == "DyedYarn", "condition");
  let promises;
  if (poType == "GreyYarn" || poType == "DyedYarn") {
    promises = directItems?.map(async (item, index) => {
      const data = await tx.directItems.create({
        data: {
          directInwardOrReturnId: parseInt(directInwardOrReturnId),
          yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
          colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
          gaugeId: item["gaugeId"] ? parseInt(item["gaugeId"]) : undefined,
          loopLengthId: item["loopLengthId"]
            ? parseInt(item["loopLengthId"])
            : undefined,
          gsmId: item["gsmId"] ? parseInt(item["gsmId"]) : undefined,
          kDiaId: item["kDiaId"] ? parseInt(item["kDiaId"]) : undefined,
          fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
          uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
          colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
          qty: item["qty"] ? parseFloat(item["qty"]) : 0,
          noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : 0,
          price: item["price"] ? parseFloat(item["price"]) : 0,
          poItemsId: item["poItemsId"]
            ? parseInt(item["poItemsId"])
            : undefined,
          taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
          poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
          poNo: item["poNo"] ? item["poNo"] : undefined,
          alreadyInwardedQty: item["alreadyInwardedQty"]
            ? parseFloat(item["alreadyInwardedQty"])
            : 0,
          alreadyReturnedQty: item["alreadyReturnedQty"]
            ? parseFloat(item["alreadyReturnedQty"])
            : 0,
          balanceQty: item["balanceQty"] ? parseFloat(item["balanceQty"]) : 0,
          cancelQty: item["cancelQty"] ? parseFloat(item["cancelQty"]) : 0,
        },
      });
      // return await createLotGridItems(tx, data?.id, item?.inwardLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
      await createYarnItemsStock(
        tx,
        poType,
        poInwardOrDirectInward,
        branchId,
        storeId,
        item
      );
    });
  } else {
    // console.log(directItems,"directItems")
    promises = directItems?.map(async (item, index) => {
      const data = await tx.directItems.create({
        data: {
          directInwardOrReturnId: directInwardOrReturnId
            ? parseInt(directInwardOrReturnId)
            : undefined,
          accessoryId: item?.accessoryId
            ? parseInt(item["accessoryId"])
            : undefined,
          accessoryGroupId: item["accessoryGroupId"]
            ? parseInt(item["accessoryGroupId"])
            : undefined,
          accessoryItemId: item["accessoryItemId"]
            ? parseInt(item["accessoryItemId"])
            : undefined,
          sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
          uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
          colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
          qty: item["qty"] ? parseFloat(item["qty"]) : 0,
          price: item["price"] ? parseFloat(item["price"]) : 0,
          taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
          poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
          poNo: item["poNo"] ? item["poNo"] : undefined,
          poItemsId: item["poItemsId"]
            ? parseInt(item["poItemsId"])
            : undefined,
          // Stock: {
          //     create: {
          //         itemType: poType,
          //         inOrOut: poInwardOrDirectInward,
          //         branchId: parseInt(branchId),
          //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
          //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
          //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
          //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
          //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
          //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
          //         storeId: parseInt(storeId),
          //         qty: parseFloat(item.qty),
          //         price: parseFloat(item.price)
          //     }
          // }
        },
      });
      await createAccessoryStock(
        tx,
        poType,
        poInwardOrDirectInward,
        branchId,
        storeId,
        item
      );
    });
  }

  return Promise.all(promises);
}

async function create(body) {
  const {
    poType,
    poInwardOrDirectInward,
    supplierId,
    directInwardReturnItems,
    dcNo,
    dcDate,
    storeId,
    payTermId,
    processValid = false,
    vehicleNo,
    specialInstructions,
    remarks,
    orderId,
    branchId,
    active,
    userId,
    finYearId,
  } = await body;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";
  let docId = await getNextDocId(
    branchId,
    poInwardOrDirectInward,
    shortCode,
    finYearDate?.startTime,
    finYearDate?.endTime
  );
  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.directInwardOrReturn.create({
      data: {
        poType,
        poInwardOrDirectInward: poInwardOrDirectInward
          ? poInwardOrDirectInward
          : undefined,
        supplierId: supplierId ? parseInt(supplierId) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        storeId: storeId ? parseInt(storeId) : undefined,
        dcNo,
        payTermId: payTermId ? parseInt(payTermId) : undefined,
        dcDate: dcDate ? new Date(dcDate) : undefined,
        active,
        createdById: parseInt(userId),
        vehicleNo,
        specialInstructions,
        remarks,
        docId,
      },
    });
    // console.log(directInwardReturnItems,"directItems")

    await createDirectInwardReturnItems(
      tx,
      data.id,
      directInwardReturnItems,
      poType,
      poInwardOrDirectInward,
      storeId,
      branchId
    );
    // await dataIntegrityValidation(tx, processValid);
  });
  return { statusCode: 0, data };
}

async function deletePurchaseInwardReturnItems(
  tx,
  removeItemsPurchaseInwardReturnIds
) {
  return await tx.directItems.deleteMany({
    where: {
      id: {
        in: removeItemsPurchaseInwardReturnIds,
      },
    },
  });
}

async function updateOrCreate(
  tx,
  item,
  directInwardOrReturnId,
  poType,
  poInwardOrDirectInward,
  storeId,
  branchId
) {
  if (item?.id) {
    if (poType == "GreyYarn" || poType == "DyedYarn") {
      let updatedata = await tx.directItems.update({
        where: {
          id: parseInt(item.id),
        },
        data: {
          directInwardOrReturnId: parseInt(directInwardOrReturnId),
          yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
          colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
          discountType: item["discountType"]
            ? parseInt(item["discountType"])
            : undefined,
          discountValue: item["discountValue"]
            ? parseInt(item["discountValue"])
            : undefined,
          noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : undefined,
          price: item["price"] ? parseInt(item["price"]) : undefined,
          fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
          uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
          qty: item["qty"] ? parseFloat(item["qty"]) : 0,

          poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
          poNo: item["poNo"] ? item["poNo"] : undefined,
          alreadyInwardedQty: item["alreadyInwardedQty"]
            ? parseFloat(item["alreadyInwardedQty"])
            : 0,
          alreadyReturnedQty: item["alreadyReturnedQty"]
            ? parseFloat(item["alreadyReturnedQty"])
            : 0,
          balanceQty: item["balanceQty"] ? parseFloat(item["balanceQty"]) : 0,
          cancelQty: item["cancelQty"] ? parseFloat(item["cancelQty"]) : 0,

          noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
          price: item["price"] ? parseFloat(item["price"]) : 0,
          poItemsId: item["poItemsId"]
            ? parseInt(item["poItemsId"])
            : undefined,
          taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
          inwardLotDetails: {
            deleteMany: {},
          },
        },
      });

      // return await createLotGridItems(tx, updatedata?.id, item?.inwardLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
    } else {
      return await tx.directItems.update({
        where: {
          id: parseInt(item.id),
        },
        data: {
          directInwardOrReturnId: parseInt(directInwardOrReturnId),
          accessoryId: parseInt(item["accessoryId"]),
          accessoryGroupId: parseInt(item["accessoryGroupId"]),
          accessoryItemId: parseInt(item["accessoryItemId"]),
          sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
          uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
          colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
          qty: item["qty"] ? parseFloat(item["qty"]) : 0,
          price: item["price"] ? parseFloat(item["price"]) : 0,
          taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
          poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
          poNo: item["poNo"] ? item["poNo"] : undefined,
          poItemsId: item["poItemsId"]
            ? parseInt(item["poItemsId"])
            : undefined,
          // Stock: {
          //     create: {
          //         itemType: poType,
          //         inOrOut: poInwardOrDirectInward,
          //         branchId: parseInt(branchId),
          //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
          //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
          //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
          //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
          //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
          //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
          //         storeId: parseInt(storeId),
          //         qty: parseFloat(item.qty),
          //         price: parseFloat(item.price)
          //     }
          // }
        },
      });
      await createAccessoryStock(
        tx,
        poType,
        poInwardOrDirectInward,
        branchId,
        storeId,
        item
      );
    }
  } else {
    if (poType == "GreyYarn" || poType == "DyedYarn") {
      let data = await tx.directItems.create({
        data: {
          directInwardOrReturnId: parseInt(directInwardOrReturnId),
          yarnId: item["yarnId"] ? parseInt(item["yarnId"]) : undefined,
          colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
          discountType: item["discountType"]
            ? parseInt(item["discountType"])
            : undefined,
          discountValue: item["discountValue"]
            ? parseInt(item["discountValue"])
            : undefined,
          noOfBags: item["noOfBags"] ? parseInt(item["noOfBags"]) : undefined,
          price: item["price"] ? parseInt(item["price"]) : undefined,
          fDiaId: item["fDiaId"] ? parseInt(item["fDiaId"]) : undefined,
          uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
          qty: item["qty"] ? parseFloat(item["qty"]) : 0,

          poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
          poNo: item["poNo"] ? item["poNo"] : undefined,
          noOfRolls: item["noOfRolls"] ? parseInt(item["noOfRolls"]) : 0,
          price: item["price"] ? parseFloat(item["price"]) : 0,
          poItemsId: item["poItemsId"]
            ? parseInt(item["poItemsId"])
            : undefined,
          taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
        },
      });
      // return await createLotGridItems(tx, data?.id, item?.inwardLotDetails, item, poType, poInwardOrDirectInward, storeId, branchId)
    } else {
      return await tx.directItems.create({
        data: {
          directInwardOrReturnId: parseInt(directInwardOrReturnId),
          accessoryId: parseInt(item["accessoryId"]),
          accessoryGroupId: parseInt(item["accessoryGroupId"]),
          accessoryItemId: parseInt(item["accessoryItemId"]),
          sizeId: item["sizeId"] ? parseInt(item["sizeId"]) : undefined,
          uomId: item["uomId"] ? parseInt(item["uomId"]) : undefined,
          colorId: item["colorId"] ? parseInt(item["colorId"]) : undefined,
          qty: item["qty"] ? parseFloat(item["qty"]) : 0,
          price: item["price"] ? parseFloat(item["price"]) : 0,
          taxPercent: item["taxPercent"] ? parseFloat(item["taxPercent"]) : 0,
          poQty: item["poQty"] ? parseFloat(item["poQty"]) : 0,
          poNo: item["poNo"] ? item["poNo"] : undefined,
          poItemsId: item["poItemsId"]
            ? parseInt(item["poItemsId"])
            : undefined,
          // Stock: {
          //     create: {
          //         itemType: poType,
          //         inOrOut: poInwardOrDirectInward,
          //         branchId: parseInt(branchId),
          //         sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
          //         accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
          //         accessoryGroupId: item?.accessoryGroupId ? parseInt(item.accessoryGroupId) : undefined,
          //         accessoryItemId: item?.accessoryItemId ? parseInt(item.accessoryItemId) : undefined,
          //         colorId: item?.colorId ? parseInt(item.colorId) : undefined,
          //         uomId: item?.uomId ? parseInt(item.uomId) : undefined,
          //         storeId: parseInt(storeId),
          //         qty: parseFloat(item.qty),
          //         price: parseFloat(item.price)
          //     }
          // }
        },
      });
      await createAccessoryStock(
        tx,
        poType,
        poInwardOrDirectInward,
        branchId,
        storeId,
        item
      );
    }
  }
}

async function updateAllPInwardReturnItems(
  tx,
  directInwardReturnItems,
  directInwardOrReturnId,
  poType,
  poInwardOrDirectInward,
  storeId,
  branchId
) {
  let promises = directInwardReturnItems?.map(
    async (item) =>
      await updateOrCreate(
        tx,
        item,
        directInwardOrReturnId,
        poType,
        poInwardOrDirectInward,
        storeId,
        branchId
      )
  );
  return Promise.all(promises);
}

async function update(id, body) {
  const {
    poType,
    poInwardOrDirectInward,
    supplierId,
    directInwardReturnItems,
    dcNo,
    dcDate,
    storeId,
    vehicleNo,
    specialInstructions,
    remarks,
    orderId,
    branchId,
    active,
    userId,
  } = await body;

  const dataFound = await prisma.directInwardOrReturn.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      DirectItems: true,
    },
  });
  if (!dataFound) return NoRecordFound("directInwardOrReturn");
  let piData;

  let oldDirectInwardReturnIds = dataFound?.DirectItems.map((item) =>
    parseInt(item.id)
  );
  let currentDirectInwardReturnIds = directInwardReturnItems
    .filter((i) => i?.id)
    ?.map((item) => parseInt(item.id));
  let removeItemsPurchaseInwardReturnIds = getRemovedItems(
    oldDirectInwardReturnIds,
    currentDirectInwardReturnIds
  );

  await prisma.$transaction(async (tx) => {
    await deletePurchaseInwardReturnItems(
      tx,
      removeItemsPurchaseInwardReturnIds
    );
    piData = await tx.directInwardOrReturn.update({
      where: {
        id: parseInt(id),
      },
      data: {
        poType,
        poInwardOrDirectInward,
        supplierId: parseInt(supplierId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        dcNo,
        dcDate: dcDate ? new Date(dcDate) : undefined,
        vehicleNo,
        specialInstructions,
        remarks,
        active,
        updatedById: parseInt(userId),
        orderId: parseInt(orderId),
      },
    });
    await updateAllPInwardReturnItems(
      tx,
      directInwardReturnItems,
      piData.id,
      poType,
      poInwardOrDirectInward,
      storeId,
      branchId
    );
    // await dataIntegrityValidation(tx, processValid = false);
  });
  return { statusCode: 0, data: piData };
}

async function remove(id) {
  const data = await prisma.directInwardOrReturn.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
