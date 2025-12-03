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
    lastObject = await prisma.stockInward.findFirst({
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
    )}/FGI/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/FGI/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.stockInward.findFirst({
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
    )}/FGI/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/FGI/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }
    return newDocId;
  }
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
  data = await prisma.stockInward.findMany({
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
      StockInwardItems: true,
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
  const data = await prisma.stockInward.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      StockInwardItems: {
        select: {
          Stock: true,
          id: true,
          stockInwardId: true,
          styleId: true,
          sizeId: true,
          qty: true,
          remarks: true,
          styleNo: true,
          fabricId: true,
          styleItemId: true,
          colorId: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("stockInward");
  const styleIds = data.StockInwardItems.map((item) => item.styleId).filter(
    Boolean
  );
  const childRecordSales = await prisma.salesEntryItems.count({
    where: {
      styleId: { in: styleIds },
    },
  });
  const childRecordStock = await prisma.stockAdjustmentItems.count({
    where: {
      styleId: { in: styleIds },
    },
  });
  const lastProcess = await prisma.process.findFirst({
    where: {
      isIroning: true,
    },
  });
  const lastProcessId = lastProcess?.id;
  const productionStockQty = await Promise.all(
    data.StockInwardItems.map(async (item) => {
      const stockData = await prisma.productionStock.aggregate({
        where: {
          styleItemId: item.styleItemId,
          fabricId: item.fabricId,
          colorId: item.colorId,
          styleId: item.styleId,
          prevProcessId: lastProcessId,
          sizeId: item.sizeId,
        },
        _sum: {
          qty: true,
        },
      });
      return {
        ...item,
        stkQty: stockData._sum.qty || 0, // Dynamic field for view
      };
    })
  );
  return {
    statusCode: 0,
    data: { ...data, StockInwardItems: productionStockQty, ...{ childRecord } },
    childRecordSales: childRecordSales,
    childRecordStock: childRecordStock,
  };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.stockInward.findMany({
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
  try {
    const {
      userId,
      branchId,
      storeId,
      stockInwardItems,
      finYearId,
      docDate,
      draftSave,
      locationId,
    } = body;
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
      data = await tx.stockInward.create({
        data: {
          docId: newDocId,
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          createdById: parseInt(userId),
          docDate: docDate ? new Date(docDate) : null,
          locationId: parseInt(locationId),
        },
      });
      await createStockInwardItems(
        tx,
        stockInwardItems,
        data,
        userId,
        branchId,
        storeId
      );
    });
    return { statusCode: 0, data };
  } catch (err) {
    return {
      statusCode: 400,
      message: err.message,
    };
  }
}

async function update(id, body) {
  const { branchId, stockInwardItems, userId, storeId, docDate, locationId } =
    await body;
  let data;
  const dataFound = await prisma.stockInward.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      StockInwardItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("stockInward");
  let removedItems = findRemovedItems(dataFound, stockInwardItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    if (removeItemsIds.length > 0) {
      await tx.stockInwardItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.stockInward.update({
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
    await updateStockInwardItems(
      tx,
      stockInwardItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function updateStockInwardItems(
  tx,
  stockInwardItems,
  stockInward,
  userId,
  branchId,
  storeId
) {
  // 1️⃣ Get the last barcode number in this branch
  const lastItem = await tx.stockInwardItems.findFirst({
    orderBy: { id: "desc" }, // or order by createdAt
  });

  let lastNumber = 0;
  if (lastItem?.barcode) {
    lastNumber = parseInt(lastItem.barcode.replace(/^YS0*/, "")) || 0;
  }

  let newIndex = 0; // Counter for new rows in this update

  const promises = stockInwardItems.map(async (stockDetail) => {
    const qty = stockDetail?.qty
      ? Math.round(parseFloat(stockDetail.qty))
      : null;

    let barcode;
    if (stockDetail.id) {
      // Keep existing barcode for existing items
      barcode = stockDetail.barcode;
    } else {
      // Generate new barcode sequentially for new items
      newIndex++;
      barcode = `YS${String(lastNumber + newIndex).padStart(4, "0")}`;
    }

    if (stockDetail.id) {
      const updatedItem = await tx.stockInwardItems.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          stockInwardId: parseInt(stockInward.id),
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty,
          remarks: stockDetail?.remarks ?? undefined,
          barcode,
        },
      });

      // Update or create Stock row
      const existingStock = await tx.stock.findFirst({
        where: { stockInwardItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.stock.update({
          where: { id: existingStock.id },
          data: {
            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            qty,
            barCode: barcode,
            updatedById: parseInt(userId),
            fabricId: stockDetail?.fabricId
              ? parseInt(stockDetail.fabricId)
              : null,
            styleNo: stockDetail?.styleNo ?? undefined,
          },
        });
      } else {
        await tx.stock.create({
          data: {
            inOrOut: "ReadyGoodsInward",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            storeId: parseInt(storeId),
            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            qty,
            stockInwardItemsId: updatedItem.id,
            barCode: barcode,
            fabricId: stockDetail?.fabricId
              ? parseInt(stockDetail.fabricId)
              : null,
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
            styleNo: stockDetail?.styleNo ?? undefined,
          },
        });
      }

      return updatedItem;
    } else {
      const createdItem = await tx.stockInwardItems.create({
        data: {
          stockInwardId: parseInt(stockInward.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty,
          remarks: stockDetail?.remarks ?? undefined,
          barcode,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleNo: stockDetail?.styleNo ?? undefined,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
        },
      });

      // Create Stock row
      await tx.stock.create({
        data: {
          inOrOut: "ReadyGoodsInward",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty,
          stockInwardItemsId: createdItem.id,
          barCode: barcode,
          styleNo: stockDetail?.styleNo ?? undefined,
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

async function createStockInwardItems(
  tx,
  stockInwardItems,
  stockInward,
  userId,
  branchId,
  storeId
) {
  const newItems = stockInwardItems || [];

  for (const item of newItems) {
    if (!item.styleId || !item.sizeId) continue;
    const exists = await tx.stock.findFirst({
      where: {
        styleId: item.styleId,
        sizeId: item.sizeId,
      },
      include: {
        Style: true,
        Size: true,
      },
    });
    if (exists) {
      throw new Error(
        `Style No - ${exists.Style?.sku}, Size - ${exists.Size?.name} is Already Exists`
      );
    }
  }
  // 1️⃣ Get the highest existing barcode number for this branch
  const lastItem = await tx.stockInwardItems.findFirst({
    orderBy: { id: "desc" }, // or order by createdAt
  });

  let lastNumber = 0;
  if (lastItem?.barcode) {
    // Extract the numeric part from barcode like 'YS0005' -> 5
    lastNumber = parseInt(lastItem.barcode.replace(/^YS0*/, "")) || 0;
  }
  // 2️⃣ Map through all items and create them with sequential barcodes
  const promises = stockInwardItems.map(async (stockDetail, index) => {
    const qty = stockDetail?.qty
      ? Math.round(parseFloat(stockDetail.qty))
      : null;

    // Generate sequential barcode
    const barcode = stockDetail?.barcode
      ? stockDetail.barcode
      : `YS${String(lastNumber + index + 1).padStart(4, "0")}`;

    const createdItem = await tx.stockInwardItems.create({
      data: {
        stockInwardId: parseInt(stockInward.id),
        styleNo: stockDetail?.styleNo ?? undefined,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        qty,
        remarks: stockDetail?.remarks ?? undefined,
        barcode,
      },
    });

    // Create corresponding Stock row
    await tx.stock.create({
      data: {
        inOrOut: "ReadyGoodsInward",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        qty,
        stockInwardItemsId: createdItem.id,
        barCode: barcode,
        styleNo: stockDetail?.styleNo ?? undefined,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
      },
    });

    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, stockInwardItems) {
  let removedItems = dataFound.StockInwardItems.filter((oldItem) => {
    let result = stockInwardItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id)
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function remove(id) {
  console.log(id, "id");
  const data = await prisma.stockInward.delete({
    where: {
      id: parseInt(id),
    },
  });
  console.log(data, "data");

  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
