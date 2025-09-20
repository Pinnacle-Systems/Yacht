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
  if (lastObject) {
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
    searchDocId,
    searchDelDate,
    searchDueDate,
    finYearId,
    stock,
    rawMaterialType,
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
      docId: Boolean(searchDocId)
        ? {
            contains: searchDocId,
          }
        : undefined,
    },
    include: {
      Store: true,
      openingStockItems: true,
    },
  });
  data = manualFilterSearchData(searchDelDate, searchDueDate, data);
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
    finYearDate?.startTime,
    finYearDate?.endTime
  );

  let StockReport;
  console.log(req.query, "req");

  if (stock) {
    StockReport = await prisma.$queryRaw`
    SELECT * FROM stock WHERE createdAt < STR_TO_DATE(${endDate}, '%Y-%m-%d') AND itemType = ${rawMaterialType} AND storeId = ${storeId} ;
    `;
  }

  return { statusCode: 0, data, nextDocId: newDocId, totalCount, StockReport };
}

async function getOne(id) {
  const childRecord = await prisma.po.count({
    where: { requirementId: parseInt(id) },
  });

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
      openingStockItems: true,
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
  } = await body;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startTime,
    finYearDate?.endTime
  );
  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.openingStock.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        createdById: parseInt(userId),
        notes,
        term,
      },
    });
    await (async function createopeningStockItems() {
      let promises = openingStockItems.map(async (stockDetail) => {
        return await tx.openingStockItems.create({
          data: {
            openingStockId: parseInt(data.id),
            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            qty: parseFloat(stockDetail.qty),
            Stock: {
              create: {
                inOrOut: "OpeningStock",
                createdById: parseInt(userId),
                branchId: parseInt(branchId),
                storeId: parseInt(storeId),
                styleId: stockDetail?.styleId
                  ? parseInt(stockDetail.styleId)
                  : null,
                sizeId: stockDetail?.sizeId
                  ? parseInt(stockDetail.sizeId)
                  : null,
                qty: parseFloat(stockDetail.qty),
              },
            },
          },
        });
      });
      return Promise.all(promises);
    })();
  });
  return { statusCode: 0, data };
}

async function createopeningStockItems(tx,openingStockId,openingStockItems,storeId,branchId){
    
}

function findRemovedItems(dataFound, openingStockItems) {
  let removedItems = dataFound.openingStockItems.filter((oldItem) => {
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

async function update(id, body) {
  const { branchId, openingStockItems, userId, storeId, term, notes } =
    await body;
  let data;
  const dataFound = await prisma.openingStock.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      openingStockItems: {
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
      },
    });
    await (async function updateOpeningStockGridDetails() {
      let promises = openingStockItems.map(async (stockDetail) => {
        if (stockDetail.id) {
          return await tx.openingStockItems.update({
            where: {
              id: parseInt(stockDetail.id),
            },
            data: {
              openingStockId: parseInt(data.id),
              styleId: stockDetail?.styleId
                ? parseInt(stockDetail.styleId)
                : null,
              sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
              qty: parseFloat(stockDetail.qty),
              Stock: {
                update: {},
              },
            },
          });
        } else {
          return await tx.openingStockItems.create({
            data: {
              openingStockId: parseInt(data.id),
              styleId: stockDetail?.styleId
                ? parseInt(stockDetail.styleId)
                : null,
              sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
              qty: parseFloat(stockDetail.qty),
              Stock: {
                create: {},
              },
            },
          });
        }
      });
      return Promise.all(promises);
    })();
  });
  return { statusCode: 0, data };
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
