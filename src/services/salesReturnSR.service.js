import { NoRecordFound } from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getDateTimeRange,
  getYearShortCode,
  getYearShortCodeForFinYear,
  substract,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { prisma } from "../lib/prisma.js";

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.salesReturnSR.findFirst({
    where: {
      branchId: parseInt(branchId),
    },
    orderBy: {
      id: "desc",
    },
  });
  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SR/1`;
  if (lastObject) {
    newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
  }
  return newDocId;
}

async function get(req) {
  const {
    branchId,
    active,
    pagination,
    pageNumber,
    dataPerPage,
    finYearId,
    searchDocId,
    serachDocNo,
    searchDocDate,
    searchCustomer,
    searchMobile,
    startDate,
    endDate,
    searchInvNo,
  } = req.query;
  const { startTime: startDateStartTime } = getDateTimeRange(startDate);
  const { endTime: endDateEndTime } = getDateTimeRange(endDate);
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";
  let data = await prisma.salesReturnSR.findMany({
    where: {
      AND: [
        {
          AND: finYearDate
            ? [
                {
                  createdAt: {
                    gte: finYearDate.startDateStartTime,
                  },
                },
                {
                  createdAt: {
                    lte: finYearDate.endDateEndTime,
                  },
                },
              ]
            : undefined,
        },
        {
          AND:
            startDate && endDate
              ? [
                  {
                    createdAt: {
                      gte: startDateStartTime,
                    },
                  },
                  {
                    createdAt: {
                      lte: endDateEndTime,
                    },
                  },
                ]
              : undefined,
        },
      ],
      branchId: branchId ? parseInt(branchId) : undefined,
      active: active ? Boolean(active) : undefined,
      docId: Boolean(serachDocNo)
        ? {
            contains: serachDocNo,
          }
        : undefined,
      Customer: {
        name: Boolean(searchCustomer)
          ? { contains: searchCustomer }
          : undefined,
        mobileNo: Boolean(searchMobile)
          ? { contains: searchMobile }
          : undefined,
      },
      billNo: Boolean(searchInvNo)
        ? {
            contains: searchInvNo,
          }
        : undefined,
    },
    include: {
      Customer: {
        select: {
          name: true,
          mobileNo: true,
        },
      },
    },
  });
  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.docDate)).includes(searchDocDate),
    );
  }
  const totalCount = data.length;

  let docId = finYearDate
    ? await getNextDocId(
        branchId,
        shortCode,
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";
  return { statusCode: 0, data, nextDocId: docId, totalCount };
}

async function getOne(id) {
  const childRecord = 0;

  // Fetch PO with relations
  let salesReturnSR = await prisma.salesReturnSR.findUnique({
    where: { id: parseInt(id) },
    include: {
      salesReturnSRItems: true,
      Customer: {
        select: {
          name: true,
          mobileNo: true,
        },
      },
    },
  });

  if (!salesReturnSR) return NoRecordFound("salesReturnSR");

  return {
    statusCode: 0,
    data: {
      ...salesReturnSR,
      childRecord,
    },
  };
}

async function create(body) {
  try {
    const {
      userId,
      branchId,
      finYearId,
      docDate,
      customerId,
      mobileNo,
      remarks,
      salesReturnItems,
      termsAndCondition,
      customerName,
      billNo,
    } = await body;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate
      ? getYearShortCodeForFinYear(
          finYearDate?.startDateStartTime,
          finYearDate?.endDateEndTime,
        )
      : "";
    let newDocId = await getNextDocId(
      branchId,
      shortCode,
      finYearDate?.startDateStartTime,
      finYearDate?.endDateEndTime,
    );
    let data;
    await prisma.$transaction(async (tx) => {
      data = await tx.salesReturnSR.create({
        data: {
          docId: newDocId,
          docDate: docDate ? new Date(docDate) : null,
          branchId: parseInt(branchId),
          createdById: parseInt(userId),
          billNo: billNo ? billNo : undefined,
          customerId: customerId ? parseInt(customerId) : undefined,
          mobileNo: mobileNo ? mobileNo : undefined,
          termsAndCondition,
          remarks,
          customerName: customerName ? customerName : undefined,
        },
      });
      await createSalesReturnItems(
        tx,
        salesReturnItems,
        data,
        userId,
        branchId,
        billNo,
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

async function createSalesReturnItems(
  tx,
  salesReturnItems,
  salesReturnSR,
  userId,
  branchId,
  billNo,
) {
  const promises = salesReturnItems.map(async (itemDetails, index) => {
    const qty = itemDetails?.returnQty
      ? Math.round(parseFloat(itemDetails.returnQty))
      : null;

    const createdItem = await tx.salesReturnSRItems.create({
      data: {
        salesReturnSRId: parseInt(salesReturnSR.id),
        styleItemId: itemDetails?.styleItemId
          ? parseInt(itemDetails.styleItemId)
          : null,
        sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
        styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
        uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
        colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
        returnQty: qty,
        barcodeNo: itemDetails?.barcodeNo ?? undefined,
      },
    });
    await tx.stockLedger.create({
      data: {
        inOrOut: "In",
        refType: "salesReturn",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
        sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
        colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
        uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
        styleItemId: itemDetails?.styleItemId
          ? parseInt(itemDetails.styleItemId)
          : null,
        qty: qty,
        salesReturnSRItemsId: createdItem.id,
        barcodeNo: itemDetails?.barcodeNo ?? undefined,
        invNo: billNo ? billNo : undefined,
      },
    });
    // await prisma.stockSummary.upsert({
    //   where: {
    //     branchId_barcodeNo: {
    //       branchId: parseInt(branchId),
    //       barcodeNo: itemDetails.barcodeNo,
    //     },
    //   },
    //   update: {
    //     qty: { increment: qty },
    //   },
    //   create: {
    //     createdById: parseInt(userId),
    //     branchId: parseInt(branchId),
    //     styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
    //     sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
    //     colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
    //     uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
    //     styleItemId: itemDetails?.styleItemId
    //       ? parseInt(itemDetails.styleItemId)
    //       : null,
    //     qty,
    //     barcodeNo: itemDetails?.barcodeNo ?? undefined,
    //     rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
    //   },
    // });
    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, salesReturnItems) {
  let removedItems = dataFound.salesReturnSRItems.filter((oldItem) => {
    let result = salesReturnItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function update(id, body) {
  const {
    userId,
    branchId,
    docDate,
    customerId,
    mobileNo,
    remarks,
    salesReturnItems,
    termsAndCondition,
    customerName,
    billNo,
  } = await body;
  let data;
  const dataFound = await prisma.salesReturnSR.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      salesReturnSRItems: true,
    },
  });
  if (!dataFound) return NoRecordFound("Sales Return");
  let removedItems = findRemovedItems(dataFound, salesReturnItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    if (removeItemsIds.length > 0) {
      await tx.salesReturnSRItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.salesReturnSR.update({
      where: {
        id: parseInt(id),
      },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        branchId: parseInt(branchId),
        updatedById: parseInt(userId),
        customerId: customerId ? parseInt(customerId) : null,
        billNo: billNo ? billNo : undefined,
        customerName: customerName ? customerName : undefined,
        mobileNo: mobileNo ? mobileNo : undefined,
        termsAndCondition,
        remarks,
      },
    });
    await updateSalesReturnItems(
      tx,
      salesReturnItems,
      data,
      userId,
      branchId,
      billNo,
    );
  });
  return { statusCode: 0, data };
}

async function updateSalesReturnItems(
  tx,
  salesReturnItems,
  salesReturnSR,
  userId,
  branchId,
  billNo,
) {
  const promises = salesReturnItems.map(async (itemDetails) => {
    const returnQty = itemDetails?.returnQty
      ? Math.round(parseFloat(itemDetails.returnQty))
      : null;

    if (itemDetails.id) {
      // Update existing poItem
      const updatedItem = await tx.salesReturnSRItems.update({
        where: { id: parseInt(itemDetails.id) },
        data: {
          salesReturnSRId: parseInt(salesReturnSR.id),
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          returnQty: returnQty,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
        },
      });
      const existingStock = await tx.stockLedger.findFirst({
        where: { salesReturnSRItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.stockLedger.update({
          where: { id: existingStock.id },
          data: {
            updatedById: parseInt(userId),
            branchId: parseInt(branchId),
            styleId: itemDetails?.styleId
              ? parseInt(itemDetails.styleId)
              : null,
            sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
            colorId: itemDetails?.colorId
              ? parseInt(itemDetails.colorId)
              : null,
            uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
            styleItemId: itemDetails?.styleItemId
              ? parseInt(itemDetails.styleItemId)
              : null,
            qty: returnQty,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            invNo: billNo ? billNo : undefined,
          },
        });
      } else {
        await tx.stockLedger.create({
          data: {
            inOrOut: "In",
            refType: "salesReturn",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            salesReturnSRItemsId: updatedItem.id,
            styleId: itemDetails?.styleId
              ? parseInt(itemDetails.styleId)
              : null,
            sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
            colorId: itemDetails?.colorId
              ? parseInt(itemDetails.colorId)
              : null,
            uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
            styleItemId: itemDetails?.styleItemId
              ? parseInt(itemDetails.styleItemId)
              : null,
            qty: returnQty,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            invNo: billNo ? billNo : undefined,
          },
        });
      }
      return updatedItem;
    } else {
      // Create new poItem
      const createdItem = await tx.salesReturnSRItems.create({
        data: {
          salesReturnSRId: parseInt(salesReturnSR.id),
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          returnQty: returnQty,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
        },
      });

      await tx.stockLedger.create({
        data: {
          inOrOut: "In",
          refType: "salesReturn",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          qty: returnQty,
          salesReturnSRItemsId: createdItem.id,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          invNo: billNo ? billNo : undefined,
        },
      });

      return createdItem;
    }
  });

  return Promise.all(promises);
}

async function remove(id) {
  const data = await prisma.salesReturnSR.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove };
