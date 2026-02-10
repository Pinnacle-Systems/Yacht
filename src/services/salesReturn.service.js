import { prisma } from "../lib/prisma.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { NoRecordFound } from "../configs/Responses.js";

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
    lastObject = await prisma.salesReturn.findFirst({
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
    )}/SR/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SR/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.salesReturn.findFirst({
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
    )}/SR/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SR/${
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
    searchSales,
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
  data = await prisma.salesReturn.findMany({
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
      invNo: Boolean(searchSales) ? { contains: searchSales } : undefined,
    },
    include: {
      Store: {
        select: {
          id: true,
          storeName: true,
        },
      },
      salesReturnItems: true,
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
  const childRecord = 0;
  const data = await prisma.salesReturn.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      salesReturnItems: {
        select: {
          stocks: true,
          id: true,
          salesReturnId: true,
          barcode: true,
          styleId: true,
          sizeId: true,
          Size: true,
          qty: true,
          returnQty: true,
          remarks: true,
          fabricId: true,
          Fabric: true,
          styleNo: true,
          styleItemId: true,
          StyleItem: true,
          Color: true,
          colorId: true,
        },
      },
      Branch: true,
      Store: true,
      Customer: true,
    },
  });
  if (!data) return NoRecordFound("salesReturn");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    salesReturnItems,
    finYearId,
    docDate,
    draftSave,
    locationId,
    customerId,
    invNo,
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
    data = await tx.salesReturn.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        createdById: parseInt(userId),
        docDate: docDate ? new Date(docDate) : null,
        locationId: parseInt(locationId),
        customerId: parseInt(customerId),
        invNo,
      },
    });
    await createSalesReturnItems(
      tx,
      salesReturnItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function createSalesReturnItems(
  tx,
  salesReturnItems,
  salesReturn,
  userId,
  branchId,
  storeId
) {
  const promises = salesReturnItems.map(async (stockDetail) => {
    const createdItem = await tx.salesReturnItems.create({
      data: {
        salesReturnId: parseInt(salesReturn.id),
        barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        qty:
          stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
            ? Math.round(parseFloat(stockDetail.qty))
            : null,
        returnQty:
          stockDetail?.returnQty && !isNaN(parseFloat(stockDetail.returnQty))
            ? Math.round(parseFloat(stockDetail.returnQty))
            : null,
        remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
        styleNo: stockDetail?.styleNo ?? undefined,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
      },
    });
    await tx.stock.create({
      data: {
        inOrOut: "salesReturn",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        qty:
          stockDetail?.returnQty && !isNaN(parseFloat(stockDetail.returnQty))
            ? Math.round(parseFloat(stockDetail.returnQty))
            : null,
        salesReturnItemsId: createdItem.id,
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
    salesReturnItems,
    userId,
    storeId,
    docDate,
    locationId,
    customerId,
    invNo,
  } = await body;
  let data;
  const dataFound = await prisma.salesReturn.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      salesReturnItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("SalesReturn");
  let removedItems = findRemovedItems(dataFound, salesReturnItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.salesReturnItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.salesReturn.update({
      where: {
        id: parseInt(id),
      },
      data: {
        storeId: parseInt(storeId),
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        docDate: docDate ? new Date(docDate) : null,
        locationId: parseInt(locationId),
        customerId: parseInt(customerId),
        invNo,
      },
    });
    await updateSalesReturnItems(
      tx,
      salesReturnItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function updateSalesReturnItems(
  tx,
  salesReturnItems,
  salesReturn,
  userId,
  branchId,
  storeId
) {
  const promises = salesReturnItems.map(async (stockDetail) => {
    if (stockDetail.id) {
      const updatedItem = await tx.salesReturnItems.update({
        where: {
          id: parseInt(stockDetail.id),
        },
        data: {
          barcode: stockDetail?.barcode ? stockDetail.barCode : "",
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty:
            stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
              ? Math.round(parseFloat(stockDetail.qty))
              : null,
          returnQty:
            stockDetail?.returnQty && !isNaN(parseFloat(stockDetail.returnQty))
              ? Math.round(parseFloat(stockDetail.returnQty))
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
      await tx.stock.updateMany({
        where: { salesReturnItemsId: parseInt(stockDetail.id) },
        data: {
          inOrOut: "SalesReturn",
          updatedById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty:
            stockDetail?.returnQty && !isNaN(parseFloat(stockDetail.returnQty))
              ? Math.round(parseFloat(stockDetail.returnQty))
              : null,
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
      const createdItem = await tx.salesReturnItems.create({
        data: {
          salesReturnId: parseInt(salesReturn.id),
          barcode: stockDetail?.barcode || undefined,
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty:
            stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
              ? Math.round(parseFloat(stockDetail.qty))
              : null,
          returnQty:
            stockDetail?.returnQty && !isNaN(parseFloat(stockDetail.returnQty))
              ? Math.round(parseFloat(stockDetail.returnQty))
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
      await tx.stock.create({
        data: {
          inOrOut: "salesReturn",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty:
            stockDetail?.returnQty && !isNaN(parseFloat(stockDetail.returnQty))
              ? Math.round(parseFloat(stockDetail.returnQty))
              : null,
          salesReturnItemsId: createdItem.id,
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

function findRemovedItems(dataFound, salesReturnItems) {
  let removedItems = dataFound.salesReturnItems.filter((oldItem) => {
    let result = salesReturnItems.find(
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
  const data = await prisma.salesReturn.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

async function getSalesReturnReport(req) {
  const { finYearId, branchId, storeId, fromDate, toDate, customerId } =
    req.query;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  let data;
  let totalCount;
  let totalAmount;
  const from = fromDate ? new Date(fromDate) : undefined;
  const to = toDate ? new Date(toDate) : undefined;
  if (to) to.setHours(23, 59, 59, 999);
  data = await prisma.salesReturn.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      storeId: storeId ? parseInt(storeId) : undefined,
      customerId: customerId ? parseInt(customerId) : undefined,
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
            ...(from && to ? [{ docDate: { gte: from, lte: to } }] : []),
          ]
        : from && to
        ? [{ docDate: { gte: from, lte: to } }]
        : undefined,
    },
    include: {
      salesReturnItems: true,
    },
  });
  totalCount = data.length;
  return {
    statusCode: 0,
    data,
    totalCount,
  };
}

export { remove, get, getOne, create, update, getSalesReturnReport };
