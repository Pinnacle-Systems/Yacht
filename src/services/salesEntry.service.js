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
    lastObject = await prisma.salesEntry.findFirst({
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
    )}/SBE/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SBE/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.salesEntry.findFirst({
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
    )}/SBE/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SBE/${
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
    searchType,
    searchCustomer,
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
  data = await prisma.salesEntry.findMany({
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
      Customer: {
        name: searchCustomer ? { contains: searchCustomer } : undefined,
      },
      salesType: searchType ? { contains: searchType } : undefined,
    },
    include: {
      Store: {
        select: {
          id: true,
          storeName: true,
        },
      },
      SalesEntryItems: true,
      Customer: {
        select: {
          id: true,
          name: true,
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

async function getSalesReport(req) {
  const { finYearId, branchId, storeId, fromDate, toDate, customerId } =
    req.query;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  let data;
  let totalCount;
  let totalAmount;
  const from = fromDate ? new Date(fromDate) : undefined;
  const to = toDate ? new Date(toDate) : undefined;
  if (to) to.setHours(23, 59, 59, 999);
  data = await prisma.salesEntry.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      storeId: storeId ? parseInt(storeId) : undefined,
      customerId: customerId ? parseInt(customerId) : undefined,
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
      //       {
      //         docDate: {
      //           gte: from,
      //           lte: to,
      //         },
      //       },
      //     ]
      //   : undefined,
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
      SalesEntryItems: true,
    },
  });
  totalCount = data.length;
  return {
    statusCode: 0,
    data,
    totalCount,
  };
}

async function getOne(id) {
  const data = await prisma.salesEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      Customer: true,
      SalesEntryItems: {
        select: {
          Stock: true,
          id: true,
          salesEntryId: true,
          barcode: true,
          StyleItem: true,
          Size: true,
          Fabric: true,
          styleId: true,
          sizeId: true,
          qty: true,
          remarks: true,
          stkQty: true,
          styleNo: true,
          fabricId: true,
          disc: true,
          amount: true,
          price: true,
          styleItemId: true,
          discountType: true,
          taxPercent: true,
          discountValue: true,
          colorId: true,
        },
      },
      Location: true,
      Store: true,
      Destination: true,
    },
  });
  if (!data) return NoRecordFound("salesEntry");
  const salesWithStkQty = await Promise.all(
    data.SalesEntryItems.map(async (item) => {
      const totalStkQty = await prisma.stock.aggregate({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          storeId: data.storeId,
          styleItemId: item.styleItemId,
          fabricId: item.fabricId,
        },
        _sum: {
          qty: true,
        },
      });
      const salesReturn = await prisma.salesReturn.findMany({
        where: {
          invNo: data.docId,
        },
      });
      const salesReturnIds = salesReturn.map((sr) => sr.id);
      const totalReturnQty = await prisma.salesReturnItems.count({
        where: {
          salesReturnId: { in: salesReturnIds },
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
        },
      });
      const usedQty = await prisma.salesReturnItems.aggregate({
        where: {
          salesReturnId: { in: salesReturnIds },
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
        },
        _sum: {
          returnQty: true,
        },
      });
      return {
        ...item,
        stkQty: totalStkQty._sum.qty + item.qty,
        returnQty: totalReturnQty,
        usedQty: usedQty._sum.returnQty,
      };
    })
  );
  const styleNos = data.SalesEntryItems.map((item) => item.styleNo).filter(
    Boolean
  );
  const childRecordReturn = await prisma.salesReturn.count({
    where: {
      invNo: { in: data.docId },
    },
  });
  return {
    statusCode: 0,
    data: {
      ...data,
      SalesEntryItems: salesWithStkQty,
      childRecordReturn: childRecordReturn,
    },
  };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.salesEntry.findMany({
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
    salesEntryItems,
    finYearId,
    docDate,
    draftSave,
    locationId,
    customerId,
    contactPerson,
    contactNumber,
    taxTemplateId,
    destinationId,
    salesType,
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
    data = await tx.salesEntry.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        createdById: parseInt(userId),
        docDate: docDate ? new Date(docDate) : null,
        locationId: parseInt(locationId),
        customerId: parseInt(customerId),
        contactPerson,
        contactNumber,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        destinationId: destinationId ? parseInt(destinationId) : null,
        salesType,
      },
    });
    await createSalesEntryItems(
      tx,
      salesEntryItems,
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
  const {
    branchId,
    salesEntryItems,
    userId,
    storeId,
    docDate,
    locationId,
    customerId,
    contactPerson,
    contactNumber,
    taxTemplateId,
    destinationId,
    salesType,
  } = await body;
  let data;
  const dataFound = await prisma.salesEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      SalesEntryItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("salesEntry");
  let removedItems = findRemovedItems(dataFound, salesEntryItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.salesEntryItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.salesEntry.update({
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
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        contactPerson,
        contactNumber,
        destinationId: destinationId ? parseInt(destinationId) : null,
        salesType,
      },
    });
    await updateSalesEntryItems(
      tx,
      salesEntryItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function updateSalesEntryItems(
  tx,
  salesEntryItems,
  salesEntry,
  userId,
  branchId,
  storeId
) {
  const promises = salesEntryItems.map(async (stockDetail) => {
    const qty =
      stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
        ? -Math.abs(parseInt(stockDetail.qty))
        : null;

    if (stockDetail.id) {
      const updatedItem = await tx.salesEntryItems.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          salesEntryId: parseInt(salesEntry.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          stkQty:
            stockDetail?.stkQty && !isNaN(parseFloat(stockDetail.stkQty))
              ? Math.round(parseFloat(stockDetail.stkQty))
              : null,
          qty:
            stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
              ? Math.round(parseFloat(stockDetail.qty))
              : null,
          barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
          remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          price: stockDetail?.price ? parseInt(stockDetail.price) : null,
          disc: stockDetail?.disc ? parseInt(stockDetail.disc) : null,
          amount: stockDetail?.amount ? parseInt(stockDetail.amount) : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          discountType: stockDetail?.discountType
            ? stockDetail?.discountType
            : undefined,
          discountValue: stockDetail?.discountValue
            ? parseInt(stockDetail.discountValue)
            : null,
          taxPercent: stockDetail?.taxPercent
            ? parseInt(stockDetail.taxPercent)
            : null,
        },
      });

      const existingStock = await tx.stock.findFirst({
        where: { salesEntryItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.stock.update({
          where: { id: existingStock.id },
          data: {
            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            qty,
            barCode: stockDetail?.barcode,
            updatedById: parseInt(userId),
            styleNo: stockDetail?.styleNo ?? undefined,
            fabricId: stockDetail?.fabricId
              ? parseInt(stockDetail.fabricId)
              : null,
            price: stockDetail?.price ? parseInt(stockDetail.price) : null,
            storeId: parseInt(storeId),
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
          },
        });
      } else {
        await tx.stock.create({
          data: {
            inOrOut: "SalesEntry",
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
            salesEntryItemsId: updatedItem.id,
            barCode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
            styleNo: stockDetail?.styleNo ?? undefined,
            fabricId: stockDetail?.fabricId
              ? parseInt(stockDetail.fabricId)
              : null,
            price: stockDetail?.price ? parseInt(stockDetail.price) : null,
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
          },
        });
      }

      return updatedItem;
    } else {
      const createdItem = await tx.salesEntryItems.create({
        data: {
          salesEntryId: parseInt(salesEntry.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          stkQty:
            stockDetail?.stkQty && !isNaN(parseFloat(stockDetail.stkQty))
              ? Math.round(parseFloat(stockDetail.stkQty))
              : null,
          qty: stockDetail?.qty ? parseInt(stockDetail?.qty) : null,
          remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
          barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          price: stockDetail?.price ? parseInt(stockDetail.price) : null,
          disc: stockDetail?.disc ? parseInt(stockDetail.disc) : null,
          amount: stockDetail?.amount ? parseInt(stockDetail.amount) : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          discountType: stockDetail?.discountType
            ? stockDetail?.discountType
            : undefined,
          discountValue: stockDetail?.discountValue
            ? parseInt(stockDetail.discountValue)
            : null,
          taxPercent: stockDetail?.taxPercent
            ? parseInt(stockDetail.taxPercent)
            : null,
        },
      });
      await tx.stock.create({
        data: {
          inOrOut: "SalesEntry",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty: createdItem.qty ? -Math.abs(createdItem.qty) : null,
          salesEntryItemsId: createdItem.id,
          barCode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
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

async function createSalesEntryItems(
  tx,
  salesEntryItems,
  salesEntry,
  userId,
  branchId,
  storeId
) {
  const promises = salesEntryItems.map(async (itemDetail) => {
    const createdItem = await tx.salesEntryItems.create({
      data: {
        salesEntryId: parseInt(salesEntry.id),
        barcode: itemDetail?.barcode ? itemDetail?.barcode : undefined,
        styleId: itemDetail?.styleId ? parseInt(itemDetail.styleId) : null,
        sizeId: itemDetail?.sizeId ? parseInt(itemDetail.sizeId) : null,
        colorId: itemDetail?.colorId ? parseInt(itemDetail.colorId) : null,
        stkQty:
          itemDetail?.stkQty && !isNaN(parseFloat(itemDetail.stkQty))
            ? Math.round(parseFloat(itemDetail.stkQty))
            : null,
        qty:
          itemDetail?.qty && !isNaN(parseFloat(itemDetail.qty))
            ? Math.round(parseFloat(itemDetail.qty))
            : null,
        remarks: itemDetail?.remarks ? itemDetail?.remarks : undefined,
        styleNo: itemDetail?.styleNo ?? undefined,
        fabricId: itemDetail?.fabricId ? parseInt(itemDetail.fabricId) : null,
        price: itemDetail?.price ? parseInt(itemDetail.price) : null,
        disc: itemDetail?.disc ? parseInt(itemDetail.disc) : null,
        amount: itemDetail?.amount ? parseInt(itemDetail.amount) : null,
        styleItemId: itemDetail?.styleItemId
          ? parseInt(itemDetail.styleItemId)
          : null,
        discountType: itemDetail?.discountType
          ? itemDetail?.discountType
          : undefined,
        discountValue: itemDetail?.discountValue
          ? parseInt(itemDetail.discountValue)
          : null,
        taxPercent: itemDetail?.taxPercent
          ? parseInt(itemDetail.taxPercent)
          : null,
      },
    });
    await tx.stock.create({
      data: {
        inOrOut: "SalesEntry",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId: itemDetail?.styleId ? parseInt(itemDetail.styleId) : null,
        sizeId: itemDetail?.sizeId ? parseInt(itemDetail.sizeId) : null,
        colorId: itemDetail?.colorId ? parseInt(itemDetail.colorId) : null,
        qty:
          itemDetail?.qty && !isNaN(parseFloat(itemDetail.qty))
            ? -Math.abs(parseInt(itemDetail.qty))
            : null,
        salesEntryItemsId: createdItem.id,
        barCode: itemDetail?.barcode ? itemDetail?.barcode : undefined,
        styleNo: itemDetail?.styleNo ?? undefined,
        fabricId: itemDetail?.fabricId ? parseInt(itemDetail.fabricId) : null,
        price: itemDetail?.price ? parseInt(itemDetail.price) : null,
        styleItemId: itemDetail?.styleItemId
          ? parseInt(itemDetail.styleItemId)
          : null,
      },
    });
    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, salesEntryItems) {
  let removedItems = dataFound.SalesEntryItems.filter((oldItem) => {
    let result = salesEntryItems.find(
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
  const data = await prisma.salesEntry.delete({
    where: {
      id: parseInt(id),
    },
  });
  console.log(data, "data");

  return { statusCode: 0, data };
}

async function getSalesInvDetail(req) {
  const { invNo, storeId, branchId } = req.query;
  if (!invNo || !storeId || !branchId) {
    return {
      statusCode: 400,
      message: "Please Choose Required Fields",
    };
  }

  // 1️⃣ First try fetching by styleNo
  let data = await prisma.salesEntry.findFirst({
    where: {
      docId: invNo,
      storeId: parseInt(storeId),
      branchId: parseInt(branchId),
    },
    include: {
      SalesEntryItems: {
        select: {
          id: true,
          salesEntryId: true,
          barcode: true,
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

  if (!data) return NoRecordFound("Sales Entry");
  return {
    statusCode: 0,
    data: {
      ...data,
    },
  };
}

export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getSalesReport,
  getSalesInvDetail,
};
