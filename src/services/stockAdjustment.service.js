import { PrismaClient } from "@prisma/client";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

// async function getOneBarcode(req) {
//   const { barcode, styleId, sizeId } = req.query;
//   let data;
//   let totalCount;
//   data = await prisma.stock.findMany({
//     where: { barCode: barcode, styleId: styleId, sizeId: sizeId },
//   });
//   totalCount = data.length;
//   if (!data) return NoRecordFound("Barcode No");
//   return { statusCode: 0, data: data, totalCount };
// }

async function getOneBarcode(req) {
  const { barcode, styleId, sizeId } = req.query;

  const where = {};

  if (barcode) {
    where.barCode = barcode;
  }

  if (styleId && !isNaN(styleId)) {
    where.styleId = parseInt(styleId);
  }

  if (sizeId && !isNaN(sizeId)) {
    where.sizeId = parseInt(sizeId);
  }

  const data = await prisma.stock.findMany({ where });

  if (!data || data.length === 0) {
    return NoRecordFound("Barcode No");
  }

  return { statusCode: 0, data, totalCount: data.length };
}

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
  console.log("error is Here", id);
  const childRecord = 0;
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
        },
      },
    },
  });
  if (!data) return NoRecordFound("stockAdjustment");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    stockAdjustItems,
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
  console.log(newDocId);
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
    await createStockAdjustItems(
      tx,
      stockAdjustItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function createStockAdjustItems(
  tx,
  stockAdjustItems,
  stockAdjustment,
  userId,
  branchId,
  storeId
) {
  const promises = stockAdjustItems.map(async (stockDetail) => {
    const createdItem = await tx.stockAdjustmentItems.create({
      data: {
        stockAdjustmentId: parseInt(stockAdjustment.id),
        barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
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
        qty,
        stockAdjustmentId: createdItem.id,
      },
    });
    return createdItem;
  });

  return Promise.all(promises);
}

async function update(id, body) {
  const { branchId, stockAdjustItems, userId, storeId, docDate, locationId } =
    await body;
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
  let removedItems = findRemovedItems(dataFound, stockAdjustItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    await deleteItemsFromStock(tx, removeItemsIds);
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
      stockAdjustItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

function findRemovedItems(dataFound, stockAdjustItems) {
  let removedItems = dataFound.stockAdjustItems.filter((oldItem) => {
    let result = stockAdjustItems.find(
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
  console.log(data, "data");

  return { statusCode: 0, data };
}

export { getOneBarcode, remove, get, getOne, create, update };
