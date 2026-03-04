import { prisma } from "../lib/prisma.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { NoRecordFound } from "../configs/Responses.js";


// async function getOneBarcode(req) {
//   const { barcode, styleId, sizeId } = req.query;
//   const styleNum = styleId ? parseInt(styleId, 10) : null;
//   const sizeNum = sizeId ? parseInt(sizeId, 10) : null;
//   // Check if neither barcode nor style+size is provided
//   if (!barcode && !(styleNum && sizeNum)) {
//     return {
//       statusCode: 0,
//       data: [],
//       totalCount: 0,
//       totalQty: 0,
//       message: "Please provide either a barcode or both styleId and sizeId",
//     };
//   }

//   // Check for incomplete style/size combination
//   if ((styleNum && !sizeNum) || (!styleNum && sizeNum)) {
//     return {
//       statusCode: 0,
//       data: [],
//       totalCount: 0,
//       totalQty: 0,
//       message: "Both styleId and sizeId must be provided together",
//     };
//   }

//   const where = {};

//   if (barcode) {
//     where.barCode = barcode;
//   }

//   if (styleNum && sizeNum) {
//     where.styleId = styleNum;
//     where.sizeId = sizeNum;
//   }

//   // Run both queries in one transaction
//   const [data, aggregate] = await prisma.$transaction([
//     prisma.stock.findMany({ where }),
//     prisma.stock.aggregate({
//       _sum: { qty: true },
//       where,
//     }),
//   ]);

//   if (!data || data.length === 0) {
//     return NoRecordFound("Barcode No");
//   }

//   return {
//     statusCode: 0,
//     data,
//     totalCount: data.length,
//     totalQty: aggregate._sum.qty ?? 0,
//   };
// }

async function getOneBarcode(req) {
  const { barcode, styleId, sizeId } = req.query;
  const styleNum = styleId ? parseInt(styleId, 10) : null;
  const sizeNum = sizeId ? parseInt(sizeId, 10) : null;

  // Validate inputs
  if (!barcode && !(styleNum && sizeNum)) {
    return {
      statusCode: 0,
      data: [],
      totalCount: 0,
      totalQty: 0,
      message: "Please provide either a barcode or both styleId and sizeId",
    };
  }

  if ((styleNum && !sizeNum) || (!styleNum && sizeNum)) {
    return {
      statusCode: 0,
      data: [],
      totalCount: 0,
      totalQty: 0,
      message: "Both styleId and sizeId must be provided together",
    };
  }

  // Build Prisma 'where' dynamically
  const where = {
    ...(barcode ? { barCode: barcode } : {}),
    ...(styleNum && sizeNum ? { styleId: styleNum, sizeId: sizeNum } : {}),
  };

  // Run both queries in one transaction
  const [data, aggregate] = await prisma.$transaction([
    prisma.stock.findMany({ where }),
    prisma.stock.aggregate({
      _sum: { qty: true },
      where,
    }),
  ]);

  if (!data || data.length === 0) {
    return NoRecordFound("Barcode No");
  }

  return {
    statusCode: 0,
    data,
    totalCount: data.length,
    totalQty: aggregate._sum.qty ?? 0,
  };
}

// async function getOneBarcode(req) {
//   const { search } = req.query;

//   if (!search) {
//     return {
//       statusCode: 0,
//       data: [],
//       totalCount: 0,
//       totalQty: 0,
//       message: "Please provide a search term",
//     };
//   }

//   const normalizedSearch = String(search).trim().replace(/\+/g, " ");
//   let data = [];
//   let aggregate = { _sum: { qty: 0 } };

//   // 1️⃣ Try exact barcode match
//   let where = {
//     OR: [
//       { barCode: search },
//       { barCode: normalizedSearch.replace(/\s+/g, "+") },
//       { barCode: normalizedSearch },
//     ],
//   };

//   [data, aggregate] = await prisma.$transaction([
//     prisma.stock.findMany({
//       where,
//       include: { Style: true, Size: true },
//     }),
//     prisma.stock.aggregate({
//       _sum: { qty: true },
//       where,
//     }),
//   ]);

//   // 2️⃣ If no barcode match → fallback to style+size
//   if (!data.length) {
//     const parts = normalizedSearch.split(/\s+/);
//     if (parts.length >= 2) {
//       const sizeName = parts.pop(); // last token = size
//       const styleName = parts.join(" "); // rest = style

//       where = {
//         Style: { name: { equals: styleName, mode: "insensitive" } },
//         Size: { name: { equals: sizeName, mode: "insensitive" } },
//       };

//       [data, aggregate] = await prisma.$transaction([
//         prisma.stock.findMany({
//           where,
//           include: { Style: true, Size: true },
//         }),
//         prisma.stock.aggregate({
//           _sum: { qty: true },
//           where,
//         }),
//       ]);
//     }
//   }

//   if (!data.length) {
//     return {
//       statusCode: 0,
//       data: [],
//       totalCount: 0,
//       totalQty: 0,
//       message: "No record found",
//     };
//   }

//   return {
//     statusCode: 1,
//     data,
//     totalCount: data.length,
//     totalQty: aggregate._sum.qty ?? 0,
//   };
// }

async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  saveType,
  docId,
  isUpdate
) {
  // Case 1: Draft save
  if (saveType) {
    return "Draft Save";
  } else if (isUpdate === "drift") {
    lastObject = await prisma.stockAdjustment.findFirst({
      where: {
        branchId: parseInt(branchId),
        draftSave: false,
        AND: [
          { createdAt: { gte: startTime } },
          { createdAt: { lte: endTime } },
        ],
      },
      orderBy: { id: "desc" },
    });
    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}${getYearShortCode(
      new Date()
    )}/SA/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SA/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.stockAdjustment.findFirst({
      where: {
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
    )}/SA/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SA/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }
    return newDocId;
  }
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchStore,
    finYearId,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime
  );
  let data;
  let totalCount;
  data = await prisma.stockAdjustment.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
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
      docId: Boolean(serachDocNo)
        ? {
            contains: serachDocNo,
          }
        : undefined,
      Store: {
        storeName: searchStore ? { contains: searchStore } : undefined,
      },
    },
    include: {
      Store: {
        select: {
          id: true,
          storeName: true,
        },
      },
      StockAdjustmentItems: true,
    },
    orderBy: {
      createdAt: "desc", // 🔥 Descending Order
    },
  });
  totalCount = data.length;
  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate)
    );
  }
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
    );
  }
  return {
    statusCode: 0,
    data,
    nextDocId: newDocId,
    totalCount,
  };
}

async function getOne(id) {
  const data = await prisma.stockAdjustment.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      StockAdjustmentItems: {
        select: {
          Stock: true,
          id: true,
          stockAdjustmentId: true,
          barcode: true,
          styleId: true,
          sizeId: true,
          stkQty: true,
          adjType: true,
          adjQty: true,
          remarks: true,
          fabricId: true,
          styleNo: true,
          styleItemId: true,
          colorId: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("stockAdjustment");
  const itemWithSalesQty = await Promise.all(
    data.StockAdjustmentItems.map(async (item) => {
      const childRecordSales = await prisma.salesEntryItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
        },
      });
      return {
        ...item,
        salesQty: childRecordSales || 0,
      };
    })
  );
  const styleNos = data.StockAdjustmentItems.map((item) => item.styleNo).filter(
    Boolean
  );
  const childRecordSales = await prisma.salesEntryItems.count({
    where: {
      styleNo: { in: styleNos },
    },
  });
  return {
    statusCode: 0,
    data: {
      ...data,
      StockAdjustmentItems: itemWithSalesQty,
      childRecordSales: childRecordSales,
    },
  };
}

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    stockAdjustmentItems,
    finYearId,
    docDate,
    draftSave,
    locationId,
  } = await body;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime
      )
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime,
    draftSave
  );
  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.stockAdjustment.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        createdById: parseInt(userId),
        docDate: docDate ? new Date(docDate) : null,
        locationId: parseInt(locationId),
      },
    });
    await createStockAdjustmentItems(
      tx,
      stockAdjustmentItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function createStockAdjustmentItems(
  tx,
  stockAdjustmentItems,
  stockAdjustment,
  userId,
  branchId,
  storeId
) {
  const promises = stockAdjustmentItems.map(async (stockDetail) => {
    const createdItem = await tx.stockAdjustmentItems.create({
      data: {
        stockAdjustmentId: parseInt(stockAdjustment.id),
        barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        stkQty:
          stockDetail?.stkQty && !isNaN(parseFloat(stockDetail.stkQty))
            ? Math.round(parseFloat(stockDetail.stkQty))
            : null,
        adjType: stockDetail?.adjType ? stockDetail?.adjType : undefined,
        adjQty:
          stockDetail?.adjQty && !isNaN(parseFloat(stockDetail.adjQty))
            ? Math.round(parseFloat(stockDetail.adjQty))
            : null,
        remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
        styleNo: stockDetail?.styleNo ?? undefined,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
      },
    });
    let qty = null;
    if (stockDetail?.adjQty && !isNaN(parseFloat(stockDetail.adjQty))) {
      const adjQty = parseInt(stockDetail.adjQty);
      qty = stockDetail.adjType === "MINUS" ? -adjQty : adjQty;
    }
    await tx.stock.create({
      data: {
        inOrOut: "stockAdjustment",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        qty,
        stockAdjustmentId: createdItem.id,
        barCode: stockDetail?.barcode ? stockDetail?.barcode : "",
        styleNo: stockDetail?.styleNo ?? undefined,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
      },
    });
    return createdItem;
  });

  return Promise.all(promises);
}

async function update(id, body) {
  const {
    branchId,
    stockAdjustmentItems,
    userId,
    storeId,
    docDate,
    locationId,
  } = await body;
  let data;
  const dataFound = await prisma.stockAdjustment.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      StockAdjustmentItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("stockAdjustment");
  let removedItems = findRemovedItems(dataFound, stockAdjustmentItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.stockAdjustmentItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.stockAdjustment.update({
      where: {
        id: parseInt(id),
      },
      data: {
        storeId: parseInt(storeId),
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        docDate: docDate ? new Date(docDate) : null,
        locationId: parseInt(locationId),
      },
    });
    await updateOpeningStockItems(
      tx,
      stockAdjustmentItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function updateOpeningStockItems(
  tx,
  stockAdjustmentItems,
  stockAdjustment,
  userId,
  branchId,
  storeId
) {
  const promises = stockAdjustmentItems.map(async (stockDetail) => {
    if (stockDetail.id) {
      const updatedItem = await tx.stockAdjustmentItems.update({
        where: {
          id: parseInt(stockDetail.id),
        },
        data: {
          barcode: stockDetail?.barcode ? stockDetail.barCode : "",
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          stkQty:
            stockDetail?.stkQty && !isNaN(parseFloat(stockDetail.stkQty))
              ? Math.round(parseFloat(stockDetail.stkQty))
              : null,
          adjType: stockDetail?.adjType || undefined,
          adjQty:
            stockDetail?.adjQty && !isNaN(parseFloat(stockDetail.adjQty))
              ? Math.round(parseFloat(stockDetail.adjQty))
              : null,
          remarks: stockDetail?.remarks || undefined,
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
        },
      });
      let qty = null;
      if (stockDetail?.adjQty && !isNaN(parseFloat(stockDetail?.adjQty))) {
        const adjQty = parseInt(stockDetail.adjQty);
        qty = stockDetail.adjType === "MINUS" ? -adjQty : adjQty;
      }
      await tx.stock.updateMany({
        where: { stockAdjustmentId: parseInt(stockDetail.id) },
        data: {
          inOrOut: "stockAdjustment",
          updatedById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty,
          barCode: stockDetail?.barcode || "",
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
        },
      });
      return updatedItem;
    } else {
      const createdItem = await tx.stockAdjustmentItems.create({
        data: {
          stockAdjustmentId: parseInt(stockAdjustment.id),
          barcode: stockDetail?.barcode || undefined,
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          stkQty:
            stockDetail?.stkQty && !isNaN(parseFloat(stockDetail.stkQty))
              ? Math.round(parseFloat(stockDetail.stkQty))
              : null,
          adjType: stockDetail?.adjType || undefined,
          adjQty:
            stockDetail?.adjQty && !isNaN(parseFloat(stockDetail.adjQty))
              ? Math.round(parseFloat(stockDetail.adjQty))
              : null,
          remarks: stockDetail?.remarks || undefined,
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
        },
      });
      let qty = null;
      if (stockDetail?.adjQty && !isNaN(parseFloat(stockDetail.adjQty))) {
        const adjQty = parseInt(stockDetail.adjQty);
        qty = stockDetail.adjType === "MINUS" ? -adjQty : adjQty;
      }
      await tx.stock.create({
        data: {
          inOrOut: "stockAdjustment",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty,
          stockAdjustmentId: createdItem.id,
          barCode: stockDetail?.barcode || "",
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
        },
      });
      return createdItem;
    }
  });
  return Promise.all(promises);
}

function findRemovedItems(dataFound, stockAdjustmentItems) {
  let removedItems = dataFound.StockAdjustmentItems.filter((oldItem) => {
    let result = stockAdjustmentItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id)
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function deleteItemsFromStock(tx, removeItemsStockIds) {
  return await tx.stock.deleteMany({
    where: {
      id: {
        in: removeItemsStockIds,
      },
    },
  });
}

async function remove(id) {
  const data = await prisma.stockAdjustment.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { getOneBarcode, remove, get, getOne, create, update };
