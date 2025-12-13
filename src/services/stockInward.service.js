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
    searchStyleNo,
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
      Style: {
        sku: searchStyleNo ? { contains: searchStyleNo } : undefined,
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
      Style: {
        select: {
          id: true,
          sku: true,
        },
      },
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
          portionId: true,
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
      const childRecordSales = await prisma.salesEntryItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          styleItemId: item.styleItemId,
        },
      });
      const childRecordAdjust = await prisma.stockAdjustmentItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          styleItemId: item.styleItemId,
        },
      });
      const minSales = await prisma.salesEntryItems.aggregate({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          styleItemId: item.styleItemId,
        },
        _sum: {
          qty: true,
        },
      });
      const minAdjust = await prisma.stockAdjustmentItems.aggregate({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          styleItemId: item.styleItemId,
          adjType: "MINUS",
        },
        _sum: {
          adjQty: true,
        },
      });
      return {
        ...item,
        stkQty: stockData._sum.qty || 0, // Dynamic field for view
        usedQty: childRecordSales + childRecordAdjust || 0,
        minQty: (minSales._sum.qty || 0) + (minAdjust._sum.adjQty || 0),
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
      styleId,
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
          styleId: parseInt(styleId),
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
  const {
    branchId,
    stockInwardItems,
    userId,
    storeId,
    docDate,
    locationId,
    styleId,
  } = await body;
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
        styleId: parseInt(styleId),
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
  const newItems = stockInwardItems || [];
  const processedRows = [];

  // 1️⃣ UPDATE/CREATE stockInwardItems rows
  for (const item of newItems) {
    const qty = item?.qty ? Math.round(parseFloat(item.qty)) : 0;

    let saved;

    if (item.id) {
      // update
      saved = await tx.stockInwardItems.update({
        where: { id: parseInt(item.id) },
        data: {
          stockInwardId: parseInt(stockInward.id),
          styleNo: item.styleNo || null,
          fabricId: item.fabricId ? parseInt(item.fabricId) : null,
          styleId: item.styleId ? parseInt(item.styleId) : null,
          styleItemId: item.styleItemId ? parseInt(item.styleItemId) : null,
          sizeId: item.sizeId ? parseInt(item.sizeId) : null,
          colorId: item.colorId ? parseInt(item.colorId) : null,
          qty,
          remarks: item?.remarks || null,
          portionId: item.portionId ? parseInt(item.portionId) : null,
        },
      });
    } else {
      // create
      saved = await tx.stockInwardItems.create({
        data: {
          stockInwardId: parseInt(stockInward.id),
          styleNo: item.styleNo || null,
          fabricId: item.fabricId ? parseInt(item.fabricId) : null,
          styleId: item.styleId ? parseInt(item.styleId) : null,
          styleItemId: item.styleItemId ? parseInt(item.styleItemId) : null,
          sizeId: item.sizeId ? parseInt(item.sizeId) : null,
          colorId: item.colorId ? parseInt(item.colorId) : null,
          qty,
          remarks: item?.remarks || null,
          portionId: item.portionId ? parseInt(item.portionId) : null,
        },
      });
    }

    processedRows.push(saved);
  }

  // 2️⃣ GROUP BY styleId + sizeId + colorId
  const grouped = {};
  for (const row of processedRows) {
    if (!row.styleId || !row.sizeId) continue;

    const key = `${row.styleId}-${row.sizeId}`;
    if (!grouped[key]) grouped[key] = [];

    grouped[key].push(row);
  }

  // 3️⃣ STOCK UPDATE OR CREATE
  for (const key of Object.keys(grouped)) {
    const rows = grouped[key];
    const [styleId, sizeId] = key.split("-").map(Number);

    // qty logic
    let finalQty = 0;

    if (rows.length === 2) {
      const total = rows.reduce((a, b) => a + Number(b.qty), 0);
      finalQty = total / 2; // TOP + BOTTOM logic
    } else {
      finalQty = Number(rows[0].qty);
    }

    // pick any one row to link with stock
    const linked = rows[0];

    // Check existing stock
    const existingStock = await tx.stock.findFirst({
      where: {
        styleId,
        sizeId,
        stockInwardItemsId: linked.id,
      },
    });

    if (existingStock) {
      // 4️⃣ UPDATE stock
      await tx.stock.update({
        where: { id: existingStock.id },
        data: {
          qty: finalQty,
          updatedById: parseInt(userId),
          fabricId: linked.fabricId,
          styleItemId: linked.styleItemId,
          styleNo: linked.styleNo,
        },
      });
    } else {
      // 5️⃣ CREATE stock
      await tx.stock.create({
        data: {
          inOrOut: "ReadyGoodsInward",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId,
          sizeId,
          colorId: parseInt(linked.colorId) || null,
          qty: finalQty,
          stockInwardItemsId: linked.id,
          fabricId: linked.fabricId,
          styleItemId: linked.styleItemId,
          styleNo: linked.styleNo,
        },
      });
    }
  }

  return processedRows;
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

  // Group by styleId + sizeId
  const grouped = {};
  for (const item of newItems) {
    if (!item.styleId || !item.sizeId) continue;

    const key = `${item.styleId}-${item.sizeId}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  // 1️⃣ PRE-CHECK if stock exists already
  for (const key of Object.keys(grouped)) {
    const [styleId, sizeId] = key.split("-").map(Number);

    const exists = await tx.stock.findFirst({
      where: { styleId, sizeId },
      include: { Style: true, Size: true },
    });
    if (exists) {
      throw new Error(
        `Style No - ${exists.Style?.sku}, Size - ${exists.Size?.name} already exists`
      );
    }
  }

  const createdStockInwardItems = [];

  // 2️⃣ CREATE all stockInwardItems rows
  for (const item of newItems) {
    const qty = item?.qty ? Math.round(parseFloat(item.qty)) : 0;

    const created = await tx.stockInwardItems.create({
      data: {
        stockInwardId: parseInt(stockInward.id),
        styleNo: item?.styleNo || null,
        fabricId: item?.fabricId ? parseInt(item.fabricId) : null,
        styleId: parseInt(item.styleId),
        styleItemId: parseInt(item.styleItemId),
        sizeId: parseInt(item.sizeId),
        colorId: item.colorId ? parseInt(item.colorId) : null,
        qty,
        remarks: item?.remarks || null,
        portionId: item?.portionId ? parseInt(item.portionId) : null,
      },
    });

    createdStockInwardItems.push(created);
  }

  // 3️⃣ CREATE STOCK rows — ONE per styleId + sizeId
  for (const key of Object.keys(grouped)) {
    const rows = grouped[key];
    const [styleId, sizeId] = key.split("-").map(Number);

    const matchedCreated = createdStockInwardItems.filter(
      (x) => x.styleId === styleId && x.sizeId === sizeId
    );

    if (matchedCreated.length === 0) {
      throw new Error("Related stockInwardItems not found for stock creation");
    }

    let finalQty = 0;

    if (rows.length === 2) {
      // TOP + BOTTOM (portionId 1 & 2)
      const total = rows.reduce((a, b) => a + Number(b.qty), 0);
      finalQty = total / 2; // divide by 2
    } else {
      // single row case
      finalQty = Number(rows[0].qty);
    }

    // Insert stock row
    await tx.stock.create({
      data: {
        inOrOut: "ReadyGoodsInward",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId,
        sizeId,
        colorId: parseInt(rows[0].colorId) || null,
        fabricId: parseInt(rows[0].fabricId),
        qty: finalQty,
        styleNo: rows[0].styleNo,
        styleItemId: parseInt(rows[0].styleItemId),
        stockInwardItemsId: matchedCreated ? matchedCreated[0].id : null,
      },
    });
  }
  return createdStockInwardItems;
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
