import { NoRecordFound } from "../configs/Responses.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.stock.findFirst({
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
  let newDocId = `${branchObj.branchCode}/${getYearShortCode(
    new Date()
  )}/OST/1`;
  if (lastObject?.docId) {
    newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/OST/${
      parseInt(lastObject.docId.split("/").at(-1)) + 1
    }`;
  }
  return newDocId;
}

function manualFilterSearchData(searchDelDate, searchDueDate, data) {
  return data.filter(
    (item) =>
      (searchDelDate
        ? String(getDateFromDateTime(item.createdAt)).includes(searchDelDate)
        : true) &&
      (searchDueDate
        ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate)
        : true)
  );
}

async function get(req) {
  const {
    branchId,
    active,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchStore,
    finYearId,
    stock,
    endDate,
    storeId,
  } = req.query;

  let data;
  let totalCount;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);

  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";
  data = await prisma.openingStock.findMany({
    where: {
      // AND: finYearDate
      //   ? [
      //       {
      //         createdAt: {
      //           gte: finYearDate.startTime,
      //         },
      //       },
      //       {
      //         createdAt: {
      //           lte: finYearDate.endTime,
      //         },
      //       },
      //     ]
      //   : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
      // active: active ? Boolean(active) : undefined,
      // docId: Boolean(serachDocNo)
      //   ? {
      //       contains: serachDocNo,
      //     }
      //   : undefined,
    },
    include: {
      Store: true,
      OpeningStockItems: true,
    },
  });
  // data = manualFilterSearchData(searchDelDate, searchDueDate, data);
  totalCount = data.length;
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
    );
  }
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime
  );

  let StockReport;
  console.log(req.query, "req");
  console.log(finYearDate);
  if (stock) {
    StockReport = await prisma.$queryRaw`
    SELECT * FROM stock WHERE createdAt < STR_TO_DATE(${endDate}, '%Y-%m-%d') AND storeId = ${storeId} ;
    `;
  }

  return {
    statusCode: 0,
    data,
    nextDocId: newDocId,
    totalCount,
    StockReport,
  };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.openingStock.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      OpeningStockItems: {
        select: {
          Stock: true,
          id: true,
          openingStockId: true,
          styleId: true,
          sizeId: true,
          qty: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("openingStock");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.openingStock.findMany({
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

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    openingStockItems,
    finYearId,
    term,
    notes,
    docDate,
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
    finYearDate?.endDateEndTime
  );
  let data;
  console.log(newDocId);
  await prisma.$transaction(async (tx) => {
    data = await tx.openingStock.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        createdById: parseInt(userId),
        notes,
        term,
        docDate: docDate ? new Date(docDate) : null,
      },
    });
    await createOpeningStockItems(
      tx,
      openingStockItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  console.log(body);
  const { branchId, openingStockItems, userId, storeId, term, notes, docDate } =
    await body;
  let data;
  const dataFound = await prisma.openingStock.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      OpeningStockItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("openingStock");
  let removedItems = findRemovedItems(dataFound, openingStockItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.openingStockItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.openingStock.update({
      where: {
        id: parseInt(id),
      },
      data: {
        storeId: parseInt(storeId),
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        notes,
        term,
        docDate: docDate ? new Date(docDate) : null,
      },
    });
    await updateOpeningStockItems(
      tx,
      openingStockItems,
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
  openingStockItems,
  openingStock,
  userId,
  branchId,
  storeId
) {
  const promises = openingStockItems.map(async (stockDetail) => {
    if (stockDetail.id) {
      // Update existing item
      const updatedItem = await tx.openingStockItems.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          openingStockId: parseInt(openingStock.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          qty: parseFloat(stockDetail.qty),
        },
      });

      // Delete old stock rows for this item
      await tx.stock.deleteMany({
        where: { OpeningStockItemsId: updatedItem.id },
      });

      // Recreate stock rows with barcodes
      const stockRows = [];
      const qty = parseInt(stockDetail.qty) || 0;
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      const datePrefix = `${dd}${mm}${yyyy}`;

      for (let i = 0; i < qty; i++) {
        const uniqueId = String(i + 1).padStart(4, "0");
        const barCode = `${datePrefix}${updatedItem.id}${uniqueId}`;
        stockRows.push(
          tx.stock.create({
            data: {
              inOrOut: "OpeningStock",
              createdById: parseInt(userId),
              branchId: parseInt(branchId),
              storeId: parseInt(storeId),
              styleId: stockDetail?.styleId
                ? parseInt(stockDetail.styleId)
                : null,
              sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
              qty: 1,
              OpeningStockItemsId: updatedItem.id,
              barCode,
            },
          })
        );
      }

      await Promise.all(stockRows);
      return updatedItem;
    } else {
      // Create new item + stock rows (same as create)
      const createdItem = await tx.openingStockItems.create({
        data: {
          openingStockId: parseInt(openingStock.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          qty: parseFloat(stockDetail.qty),
        },
      });

      const stockRows = [];
      const qty = parseInt(stockDetail.qty) || 0;
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      const datePrefix = `${dd}${mm}${yyyy}`;

      for (let i = 0; i < qty; i++) {
        const uniqueId = String(i + 1).padStart(4, "0");
        const barCode = `${datePrefix}${createdItem.id}${uniqueId}`;
        stockRows.push(
          tx.stock.create({
            data: {
              inOrOut: "OpeningStock",
              createdById: parseInt(userId),
              branchId: parseInt(branchId),
              storeId: parseInt(storeId),
              styleId: stockDetail?.styleId
                ? parseInt(stockDetail.styleId)
                : null,
              sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
              qty: 1,
              OpeningStockItemsId: createdItem.id,
              barCode,
            },
          })
        );
      }

      await Promise.all(stockRows);
      return createdItem;
    }
  });

  return Promise.all(promises);
}

export async function generateBarCode(tx, item) {
  let barCode = item?.barCode ? item?.barCode : "";

  return barCode;
}

async function createOpeningStockItems(
  tx,
  openingStockItems,
  openingStock,
  userId,
  branchId,
  storeId
) {
  const promises = openingStockItems.map(async (stockDetail) => {
    const createdItem = await tx.openingStockItems.create({
      data: {
        openingStockId: parseInt(openingStock.id),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        qty: parseFloat(stockDetail.qty),
      },
    });
    const stockRows = [];
    const qty = parseInt(stockDetail.qty) || 0;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const datePrefix = `${dd}${mm}${yyyy}`;
    for (let i = 0; i < qty; i++) {
      const uniqueId = String(i + 1).padStart(4, "0");
      const barCode = `${datePrefix}${createdItem.id}${uniqueId}`;
      stockRows.push(
        tx.stock.create({
          data: {
            inOrOut: "OpeningStock",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            storeId: parseInt(storeId),
            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            qty: 1,
            OpeningStockItemsId: createdItem.id,
            barCode,
          },
        })
      );
    }
    await Promise.all(stockRows);
    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, openingStockItems) {
  let removedItems = dataFound.OpeningStockItems.filter((oldItem) => {
    let result = openingStockItems.find(
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
  console.log(id, "id");
  const data = await prisma.openingStock.delete({
    where: {
      id: parseInt(id),
    },
  });
  console.log(data, "data");

  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
