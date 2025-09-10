import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";
import {
  balanceCancelQtyCalculation,
  balanceQtyCalculation,
  getDateFromDateTime,
  getDateTimeRange,
  getYearShortCode,
  getYearShortCodeForFinYear,
  substract,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { poUpdateValidator } from "../validators/po.validator.js";
import { getTotalQty } from "../utils/poHelpers/getTotalQuantity.js";
const prisma = new PrismaClient();

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  console.log("branchId, shortCode, ", branchId, shortCode);

  let lastObject = await prisma.po.findFirst({
    where: {
      branchId: parseInt(branchId),
      // AND: [
      //     {
      //         createdAt: {
      //             gte: startTime

      //         }
      //     },
      //     {
      //         createdAt: {
      //             lte: endTime
      //         }
      //     }
      // ],
    },
    orderBy: {
      id: "desc",
    },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/PO/1`;
  if (lastObject) {
    newDocId = `${branchObj.branchCode}/${shortCode}/PO/${
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
        ? item.transType.toLowerCase().includes(searchPoType.toLowerCase())
        : true)
  );
}

// async function get(req) {
//     const { branchId, active, pagination, pageNumber, dataPerPage,
//         finYearId,
//         searchDocId, searchPoDate, searchSupplierAliasName, searchPoType, searchDueDate, supplierId, startDate, endDate, filterParties,
//         filterPoTypes
//     } = req.query
//     const { startTime: startDateStartTime } = getDateTimeRange(startDate);
//     const { endTime: endDateEndTime } = getDateTimeRange(endDate);
//     let finYearDate = await getFinYearStartTimeEndTime(finYearId);
//     const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
//     let data = await prisma.po.findMany({
//         where: {
//             AND: [
//                 {
//                     AND: (finYearDate) ? [
//                         {
//                             createdAt: {
//                                 gte: finYearDate.startTime
//                             }
//                         },
//                         {
//                             createdAt: {
//                                 lte: finYearDate.endTime
//                             }
//                         }
//                     ] : undefined,
//                 },
//                 {
//                     AND: (startDate && endDate) ? [
//                         {
//                             createdAt: {
//                                 gte: startDateStartTime
//                             }
//                         },
//                         {
//                             createdAt: {
//                                 lte: endDateEndTime
//                             }
//                         }
//                     ] : undefined,
//                 }
//             ],
//             branchId: branchId ? parseInt(branchId) : undefined,
//             active: active ? Boolean(active) : undefined,
//             docId: Boolean(searchDocId) ?
//                 {
//                     contains: searchDocId
//                 }
//                 : undefined,
//             transType: (filterPoTypes && filterPoTypes.length > 0) ? {
//                 in: filterPoTypes.split(",").map(i => i)
//             } : undefined,
//             OR: supplierId || Boolean(filterParties) ? [
//                 {
//                     supplierId: supplierId ? parseInt(supplierId) : undefined,
//                 },
//                 {
//                     supplierId: Boolean(filterParties) ? {
//                         in: filterParties.split(",").map(i => parseInt(i))
//                     } : undefined,
//                 }
//             ] : undefined,
//             // supplier: {
//             //     aliasName: Boolean(searchSupplierAliasName) ? { contains: searchSupplierAliasName } : undefined
//             // }
//         },
//         orderBy: {
//             id: "desc",
//         },
//         // include: {
//         //     supplier: {
//         //         select: {
//         //             aliasName: true
//         //         }
//         //     },
//         //     PayTerms: {
//         //         select: {
//         //             name: true
//         //         }
//         //     },
//         //     PoItems: {
//         //         select: {
//         //             qty: true
//         //         }
//         //     }
//         // }
//     });
//     data = manualFilterSearchData(searchPoDate, searchDueDate, searchPoType, data)
//     const totalCount = data.length
//     data = await getTotalQty(data);
//     if (pagination) {
//         data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
//     }

//     let docId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)) : "";
//     return { statusCode: 0, data, nextDocId: docId, totalCount };
// }
async function get(req) {
  const {
    branchId,
    active,
    pagination,
    pageNumber = 1,
    dataPerPage = 10,
    finYearId,
    searchDocId,
    searchPoDate,
    searchSupplierAliasName,
    searchPoType,
    searchDueDate,
    supplierId,
    startDate,
    endDate,
    filterParties,
    filterPoTypes,
  } = req.query;

  const { startTime: startDateStartTime } = getDateTimeRange(startDate);
  const { endTime: endDateEndTime } = getDateTimeRange(endDate);

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);

  const whereClause = {
    branchId: branchId ? parseInt(branchId) : undefined,
    active: active !== undefined ? Boolean(JSON.parse(active)) : undefined,
    docId: searchDocId ? { contains: searchDocId } : undefined,
    transType:
      filterPoTypes?.length > 0 ? { in: filterPoTypes.split(",") } : undefined,
    AND: [
      finYearDate && {
        createdAt: {
          gte: finYearDate.startTime,
          lte: finYearDate.endTime,
        },
      },
      startDate &&
        endDate && {
          createdAt: {
            gte: startDateStartTime,
            lte: endDateEndTime,
          },
        },
    ].filter(Boolean),
    OR:
      supplierId || filterParties
        ? [
            supplierId && {
              supplierId: parseInt(supplierId),
            },
            filterParties && {
              supplierId: {
                in: filterParties.split(",").map((i) => parseInt(i)),
              },
            },
          ].filter(Boolean)
        : undefined,
  };

  let data = await prisma.po.findMany({
    where: whereClause,
    include: {
      branch: true,
      poGrid: {
        include: {
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },

          poSubGrid: {
            include: {
              color: {
                select: {
                  id: true,
                  name: true,
                },
              },
              UnitOfMeasurement: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          address: true,
          mobileNumber: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          address: true,
          mobileNumber: true,
        },
      },
      attachments: {
        select: {
          id: true,
          date: true,
          comments: true,
          filePath: true,
          log: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  data = manualFilterSearchData(
    searchPoDate,
    searchDueDate,
    searchPoType,
    data
  );

  const totalCount = data.length;

  data = await getTotalQty(data);

  // Paginate
  if (pagination === "true" || pagination === true) {
    const startIdx = (parseInt(pageNumber) - 1) * parseInt(dataPerPage);
    const endIdx = startIdx + parseInt(dataPerPage);
    data = data.slice(startIdx, endIdx);
  }

  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime
      )
    : "";
  let newDocId = finYearDate
    ? await getNextDocId(
        branchId,
        shortCode,
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime
      )
    : "";

  return { statusCode: 0, data, nextDocId: newDocId, totalCount };
}

// async function getOne(id) {
//   if (!id) {
//     throw new Error("PO ID is required");
//   }

//   const data = await prisma.po.findUnique({
//     where: {
//       id: parseInt(id),
//     },
//     include: {
//       branch: true,
//       poGrid: {
//         include: {
//           poSubGrid: true,
//         },
//       },

//       customer: {
//         select: {
//           name: true,
//           address: true,
//           mobileNumber: true,
//           id: true,
//         },
//       },
//       supplier: {
//         select: {
//           name: true,
//           address: true,
//           mobileNumber: true,
//           id: true,
//         },
//       },
//     },
//   });

//   if (!data) {
//     return { statusCode: 1, message: "No PO found", data: null };
//   }

//   return { statusCode: 0, message: "PO fetched successfully", data };
// }
async function getOne(id) {
  if (!id) {
    throw new Error("PO ID is required");
  }

  const data = await prisma.po.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      branch: true,
      poGrid: {
        include: {
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },

          poSubGrid: {
            include: {
              color: {
                select: {
                  id: true,
                  name: true,
                },
              },
              UnitOfMeasurement: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          address: true,
          mobileNumber: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          address: true,
          mobileNumber: true,
        },
      },
      attachments: {
        select: {
          id: true,
          date: true,
          comments: true,
          filePath: true,
          log: true,
        },
      },
    },
  });

  if (!data) {
    return { statusCode: 1, message: "No PO found", data: null };
  }

  return { statusCode: 0, message: "PO fetched successfully", data };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.po.findMany({
    where: {
      country: {
        companyId: companyId ? parseInt(companyId) : undefined,
      },
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
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

export async function getPoItems(req) {
  const {
    branchId,
    active,
    supplierId,
    poType,
    pagination,
    pageNumber,
    dataPerPage,
    searchDocId,
    searchPoDate,
    searchSupplierAliasName,
    searchPoType,
    searchDueDate,
    isPurchaseInwardFilter,
    isPurchaseCancelFilter,
    isPurchaseReturnFilter,
    stockStoreId,
  } = req.query;
  let data;
  let totalCount;
  if (pagination) {
    data = await prisma.poItems.findMany({
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
    data = manualFilterSearchDataPoItems(
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
    data = await getAllDataPoItems(data);
    if (isPurchaseInwardFilter) {
      data = data.filter(
        (item) =>
          parseFloat(
            balanceQtyCalculation(
              item.qty,
              item.alreadyCancelData._sum.qty,
              item.alreadyInwardedData._sum.qty,
              item.alreadyReturnedData._sum.qty
            )
          ) > 0
      );
    }

    if (isPurchaseCancelFilter) {
      data = data.filter(
        (item) =>
          parseFloat(
            balanceCancelQtyCalculation(
              item.qty,
              item.alreadyCancelData._sum.qty,
              item.alreadyInwardedData._sum.qty,
              item.alreadyReturnedData._sum.qty
            )
          ) > 0
      );
    }
    if (isPurchaseReturnFilter) {
      data = data.filter(
        (item) =>
          substract(
            item.alreadyInwardedData?._sum?.qty
              ? item.alreadyInwardedData._sum.qty
              : 0,
            item.alreadyReturnedData?._sum?.qty
              ? item.alreadyReturnedData?._sum?.qty
              : 0
          ) > 0
      );
    }
  } else {
    data = await prisma.poItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }
  return { statusCode: 0, data, totalCount };
}

export async function getAllDataPoItems(data) {
  let promises = data.map(async (item) => {
    let data = await getPoItemById(item.id, null, null, null, null, null);
    return data.data;
  });
  return Promise.all(promises);
}

export async function getPoItemById(
  id,
  purchaseInwardReturnId,
  stockId,
  storeId,
  billEntryId,
  poType
) {
  let data = await prisma.poItems.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Po: true,
      directItems: {
        include: {
          inwardLotDetails: true,
          DirectReturnItems: true,
          DirectInwardOrReturn: {
            select: {
              docId: true,
              poInwardOrDirectInward: true,
              dcNo: true,
              dcDate: true,
              createdAt: true,
              poType: true,
            },
          },
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
          name: true,
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

  const alreadyInwardedData = await prisma.directItems.aggregate({
    where: {
      poItemsId: parseInt(id),
      DirectInwardOrReturn: {
        poInwardOrDirectInward: "PurchaseInward",
      },
      directInwardOrReturnId: {
        lt: JSON.parse(purchaseInwardReturnId)
          ? parseInt(purchaseInwardReturnId)
          : undefined,
      },
    },
    _sum: {
      qty: true,
      noOfBags: true,
      noOfRolls: true,
    },
  });

  const alreadyReturnedData = await prisma.directReturnItems.aggregate({
    where: {
      poItemsId: parseInt(id),
      DirectReturnOrPoReturn: {
        poInwardOrDirectInward: "PurchaseReturn",
      },
      directReturnOrPoReturnId: {
        lt: JSON.parse(purchaseInwardReturnId)
          ? parseInt(purchaseInwardReturnId)
          : undefined,
      },
    },
    _sum: {
      qty: true,
      noOfBags: true,
      noOfRolls: true,
    },
  });

  // const alreadyDirectReturnedData = await prisma.directReturnItems.aggregate({
  //     where: {
  //         poItemsId: parseInt(id),
  //         DirectReturnOrPoReturn: {
  //             poInwardOrDirectInward: "DirectReturn"
  //         },
  //         directReturnOrPoReturnId: {
  //             lt: JSON.parse(purchaseInwardReturnId) ? parseInt(purchaseInwardReturnId) : undefined
  //         }
  //     },
  //     _sum: {
  //         qty: true,
  //         noOfBags: true,
  //         noOfRolls: true
  //     }
  // });

  const alreadyCancelData = await prisma.cancelItems.aggregate({
    where: {
      poItemsId: parseInt(id),
      PurchaseCancel: {
        poInwardOrDirectInward: "PurchaseCancel",
      },
      purchaseCancelId: {
        lt: JSON.parse(purchaseInwardReturnId)
          ? parseInt(purchaseInwardReturnId)
          : undefined,
      },
    },
    _sum: {
      qty: true,
    },
  });

  async function getLotWiseDatas(inwardData) {
    return {
      lotNo: inwardData?.lotNo,
      inwardNoOfRolls: inwardData?.noOfRolls,
      inwardQty: inwardData?.qty,
      qty: 0,
      noOfRolls: 0,
      alreadyReturnedRolls: (await getLotWiseReturnRolls(inwardData?.lotNo, id))
        ?.lotRolls,
      alreadyReturnedQty: (await getLotWiseReturnRolls(inwardData?.lotNo, id))
        ?.lotQty,
      stockQty: parseFloat(
        (
          await getStockQtyByLot(
            inwardData?.lotNo,
            storeId,
            poType,
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
      // stockQty: parseFloat(parseFloat(inwardData?.qty) - parseFloat((await getLotWiseReturnRolls(inwardData?.lotNo, id))?.lotQty || 0)),

      // stockQty: parseFloat(parseFloat(inwardData?.qty) - parseFloat((await getLotWiseReturnRolls(inwardData?.lotNo, id))?.lotQty || 0)),
      allowedReturnQty: parseFloat(
        parseFloat(inwardData?.qty) -
          parseFloat(
            (await getLotWiseReturnRolls(inwardData?.lotNo, id))?.lotQty || 0
          )
      ),
    };
  }

  async function getLotWiseReturnRolls(lotNo, poItemsId) {
    let returnDatas = `
    select sum(ReturnLotDetails.qty) as lotQty,sum(ReturnLotDetails.noOfRolls) as lotRolls from directReturnItems left join DirectReturnOrPoReturn on DirectReturnOrPoReturn.id=directReturnItems.directReturnOrPoReturnId
    left join ReturnLotDetails on ReturnLotDetails.directReturnItemsId=directReturnItems.id
    where poItemsId=${poItemsId}  and DirectReturnOrPoReturn.poInwardOrDirectInward="PurchaseReturn" and ReturnLotDetails.lotNo=${lotNo} ;
    `;

    const alreadyReturnData = await prisma.$queryRawUnsafe(returnDatas);

    return alreadyReturnData[0];
  }

  let poQty = parseFloat(data?.qty || 0).toFixed(3);
  let cancelQty = alreadyCancelData?._sum.qty
    ? parseFloat(alreadyCancelData?._sum.qty).toFixed(3)
    : "0.000";
  let alreadyInwardedQty = alreadyInwardedData?._sum?.qty
    ? parseFloat(alreadyInwardedData._sum.qty).toFixed(3)
    : "0.000";
  let alreadyReturnedQty = alreadyReturnedData?._sum?.qty
    ? parseFloat(alreadyReturnedData._sum.qty).toFixed(3)
    : "0.000";
  let alreadyInwardedRolls = alreadyInwardedData?._sum?.noOfRolls
    ? parseInt(alreadyInwardedData._sum.noOfRolls)
    : "0";
  let alreadyReturnedRolls = alreadyReturnedData?._sum?.noOfRolls
    ? parseInt(alreadyReturnedData._sum.noOfRolls)
    : "0";
  let balanceQty = substract(
    substract(poQty, cancelQty),
    substract(alreadyInwardedQty, alreadyReturnedQty)
  );
  let allowedReturnRolls = substract(
    alreadyInwardedRolls,
    alreadyReturnedRolls
  );
  let allowedReturnQty = substract(alreadyInwardedQty, alreadyReturnedQty);

  let stockQty = parseFloat(
    (
      await getStockQty(
        storeId,
        poType,
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
        storeId,
        poType,
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

  // let stockQty = substract(alreadyInwardedQty, alreadyReturnedQty)
  // let stockRolls = substract(alreadyInwardedRolls, alreadyReturnedRolls)
  let alreadyInwardLotWiseData = [];

  let inwardLotDetailsdata = `select lotNo, sum(inwardLotDetails.qty) as qty ,sum(inwardLotDetails.noOfRolls) as noOfRolls from poItems
 left join directItems on directItems.poitemsid=poItems.id left join inwardLotDetails on inwardLotDetails.directItemsId=directItems.id
 WHERE  poItems.ID=${id}
 group By lotNo`;

  inwardLotDetailsdata = await prisma.$queryRawUnsafe(inwardLotDetailsdata);

  for (let i = 0; i < inwardLotDetailsdata?.length; i++) {
    let inwardData = inwardLotDetailsdata[i];
    alreadyInwardLotWiseData.push(await getLotWiseDatas(inwardData));
  }

  const poItemObj = getStockObject(data.Po.transType, data);
  let stockData;
  if (data.Po.transType === "Accessory") {
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
        "lotNo",
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
      alreadyInwardedData,
      balanceQty,
      cancelQty,
      poQty,
      stockQty,
      stockRolls,
      allowedReturnRolls,
      allowedReturnQty,
      alreadyInwardedQty,
      alreadyReturnedQty,
      alreadyReturnedData,
      alreadyCancelData,
      stockData,
      alreadyInwardLotWiseData: alreadyInwardLotWiseData?.filter(
        (val) => parseFloat(val?.stockQty) !== 0
      ),
    },
  };
}

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

  if (itemType == "DyedFabric") {
    sql = `select 
        sum(qty) as stockQty,sum(noOfRolls) as stockRolls  from stock
        where colorId=${colorId} and uomId=${uomId} and designId=${designId} and gaugeId=${gaugeId} and loopLengthId=${loopLengthId}
         and gsmId=${gsmId}  and 
        fabricId=${fabricId} and   kDiaId=${kDiaId} and fDiaId=${fDiaId} and 
        storeId=${storeId}
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

function getStockObject(transType, item) {
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

export function getPoItemObject(transType, item) {
  let newItem = {};
  if (transType === "GreyYarn" || transType === "DyedYarn") {
    newItem["yarnId"] = parseInt(item["yarnId"]);
    newItem["noOfBags"] = parseInt(item["noOfBags"]);
    newItem["weightPerBag"] = parseFloat(item["weightPerBag"]);
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
    newItem["accessoryGroupId"] = parseInt(item["accessoryGroupId"]);
    newItem["accessoryItemId"] = parseInt(item["accessoryItemId"]);
    newItem["sizeId"] = item["sizeId"] ? parseInt(item["sizeId"]) : undefined;
  }
  newItem["uomId"] = parseInt(item["uomId"]);
  newItem["colorId"] = parseInt(item["colorId"]);
  newItem["qty"] = parseFloat(item["qty"]);
  newItem["price"] = parseFloat(item["price"]);
  newItem["discountType"] = item["discountType"];
  newItem["discountAmount"] = item["discountAmount"];
  newItem["tax"] = item["tax"];
  newItem["discountValue"] = parseFloat(item["discountValue"]);
  newItem["taxPercent"] = item["taxPercent"]
    ? parseFloat(item["taxPercent"])
    : 0;
  return newItem;
}

const afterPoSaved = async (body) => {
  const { orderDetails, orderId } = body;

  if (!orderDetails || !orderId) return;

  const purchasedGridId = orderDetails?.map((item) => item.id);

  const purchasedSubGrid = orderDetails?.flatMap((item) =>
    item?.orderDetailsSubGrid?.map((subId) => subId.id)
  );

  await prisma.$transaction(async (tx) => {
    await tx.subGrid.updateMany({
      where: { id: { in: purchasedSubGrid } },
      data: { isPurchased: true },
    });

    const order_grid = await tx.orderBillItems.findMany({
      where: { id: { in: purchasedGridId } },
      include: { subGrid: true },
    });

    for (let item of order_grid) {
      const is_all_subGrid_purchased = item.subGrid.every(
        (sub) => sub.isPurchased
      );
      if (is_all_subGrid_purchased) {
        await tx.orderBillItems.update({
          where: { id: item.id },
          data: { isPurchased: true },
        });
      }
    }

    const order_nonGrid = await tx.orderBillItems.findMany({
      where: { orderId: parseInt(orderId) },
    });

    const is_all_grid_purchased = order_nonGrid.every(
      (item) => item.isPurchased
    );

    if (is_all_grid_purchased) {
      await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { isPurchased: true },
      });
    }
  });
};

async function create(body) {
  const {
    docId,
    date,
    revisedDate,
    customerPoNumber,
    quantityAllowance,
    shippingMark,
    shipmentMode,
    shipDate,
    deliveryTerm,
    portOrigin,
    finalDestination,
    paymentTerms,
    shipName,
    shipAddress,
    shipMobile,
    customerId,
    supplierId,
    orderId,
    branchId,
    userId,
    orderDetails,
  } = body;

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.po.create({
      data: {
        docId: docId || "",
        date: date ? new Date(date) : null,
        revisedDate: revisedDate ? new Date(revisedDate) : null,
        customerPoNumber: customerPoNumber || "",
        quantityAllowance: quantityAllowance || "",
        shippingMark: shippingMark || "",
        shipmentMode: shipmentMode || "",
        shipDate: shipDate?.trim() ? new Date(shipDate) : null,
        deliveryTerm: deliveryTerm || "",
        portOrigin: portOrigin || "",
        finalDestination: finalDestination || "",
        paymentTerms: paymentTerms || "",
        shipName: shipName || "",
        shipAddress: shipAddress || "",
        shipMobile: shipMobile || "",
        customerId: parseInt(customerId),
        supplierId: parseInt(supplierId),
        orderId: orderId ? parseInt(orderId) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,

        createdBy: userId ? parseInt(userId) : undefined,

        poGrid:
          orderDetails?.length > 0
            ? {
                create: orderDetails.map((item) => ({
                  gridId: item?.id,
                  fabCode: item.fabCode,
                  styleSheetId: item?.styleSheetId || null,
                  poSubGrid: {
                    createMany: {
                      data: item.orderDetailsSubGrid.map((sub) => ({
                        subgridId: sub?.id,
                        fabType: sub.fabType || "",
                        fiberContent: sub.fiberContent || "",
                        weightGSM: sub.weightGSM?.toString() || "",
                        widthFinished: sub.widthFinished || "",
                        priceFob: parseFloat(sub.priceFob) || 0,
                        surCharges: parseFloat(sub.surCharges) || 0,
                        quantity: parseFloat(sub.quantity) || 0,
                        colorId: sub.colorId
                          ? parseInt(sub.colorId)
                          : undefined,
                        uomId: sub.uomId ? parseInt(sub.uomId) : undefined,
                      })),
                    },
                  },
                })),
              }
            : undefined,
      },
    });
  });

  afterPoSaved({
    orderDetails,
    orderId,
  });

  return { statusCode: 0, data };
}

async function update(id, req) {
  const files = req.files;
  console.log(files, "file--");

  const {
    docId,
    date,
    revisedDate,
    customerPoNumber,
    quantityAllowance,
    shippingMark,
    shipmentMode,
    shipDate,
    deliveryTerm,
    portOrigin,
    finalDestination,
    paymentTerms,
    shipName,
    shipAddress,
    shipMobile,
    customerId,
    supplierId,
    orderId,
    branchId,
    userId,
    attachments,
  } = req.body;

  const dataFound = await prisma.po.findUnique({
    where: { id: parseInt(id) },
  });

  if (!dataFound) return NoRecordFound("Purchase order record");

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.po.update({
      where: { id: parseInt(id) },
      data: {
        docId,
        date: date ? new Date(date) : undefined,
        revisedDate: revisedDate ? new Date(revisedDate) : null,
        customerPoNumber: customerPoNumber || "",
        quantityAllowance: quantityAllowance || "",
        shippingMark: shippingMark || "",
        shipmentMode: shipmentMode || "",
        shipDate: shipDate ? new Date(shipDate) : null,
        deliveryTerm: deliveryTerm || "",
        portOrigin: portOrigin || "",
        finalDestination: finalDestination || "",
        paymentTerms: paymentTerms || "",
        shipName: shipName || "",
        shipAddress: shipAddress || "",
        shipMobile: shipMobile || "",

        customerId: customerId ? parseInt(customerId) : undefined,
        supplierId: supplierId ? parseInt(supplierId) : undefined,
        orderId: orderId ? parseInt(orderId) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        updatedById: userId ? parseInt(userId) : undefined,

        // attachments: {
        //   createMany: attachments
        //     ? {
        //         data: JSON.parse(attachments || []).map((temp) => ({
        //           date: temp.date ? new Date(temp.date) : undefined,
        //           log: temp.log ? temp.log : "",
        //           comments: temp.log ? temp.log : "",
        //           filePath: temp.filePath ? temp.filePath : undefined,
        //         })),
        //       }
        //     : undefined,
        // },
      },
    });
    await tx.poAttachments.deleteMany({ where: { poId: parseInt(id) } });
    if (attachments?.length > 0) {
      await tx.poAttachments.createMany({
        data: JSON.parse(attachments || []).map((a) => ({
          poId: parseInt(id),
          date: a.date ? new Date(a.date) : undefined,
          log: a.log || "",
          comments: a.log || "",

          filePath: a.filePath || "",
        })),
      });
    }
  });

  return { statusCode: 0, data };
}

const afterPoDelete = async (poId) => {
  await prisma.$transaction(async (tx) => {
    const poData = await tx.po.findUnique({
      where: { id: parseInt(poId) },
      include: {
        poGrid: {
          include: { poSubGrid: true },
        },
        order: true,
      },
    });

    if (!poData || !poData.orderId) {
      throw new Error("PO or related Order not found");
    }

    const orderId = poData.orderId;

    for (const item of poData.poGrid) {
      for (const sg of item.poSubGrid) {
        await tx.subGrid.update({
          where: { id: sg.subgridId },
          data: { isPurchased: false },
        });
      }

      const subGrids = await tx.subGrid.findMany({
        where: { orderBillItemsId: item.gridId },
      });

      const allPurchased = subGrids.every((sg) => sg.isPurchased === true);

      console.log(allPurchased, "allPurchased");

      await tx.orderBillItems.update({
        where: { id: item.gridId },
        data: { isPurchased: allPurchased },
      });
    }
    const allOrderGrids = await tx.orderBillItems.findMany({
      where: { orderId },
      select: { isPurchased: true },
    });

    const orderAllPurchased =
      allOrderGrids.length > 0 && allOrderGrids.every((g) => g.isPurchased);

    await tx.order.update({
      where: { id: orderId },
      data: { isPurchased: orderAllPurchased },
    });
  });
};

async function remove(id) {
  await afterPoDelete(id);
  const data = await prisma.po.delete({
    where: {
      id: parseInt(id),
    },
  });

  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
