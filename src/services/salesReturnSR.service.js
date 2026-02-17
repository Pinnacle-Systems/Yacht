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

function validateUniqueBarcode(salesReturnItems) {
  const seen = new Set();

  for (let i = 0; i < salesReturnItems.length; i++) {
    const barcodeId = salesReturnItems[i]?.barcodeId;

    if (!barcodeId) continue; // skip empty if needed

    if (seen.has(barcodeId)) {
      throw new Error(
        `Duplicate Barcode No ${salesReturnItems[i].barcodeNo} found in row ${i + 1}`,
      );
    }

    seen.add(barcodeId);
  }
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
    validateUniqueBarcode(salesReturnItems);
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
    const barcodeId = itemDetails?.barcodeId
      ? parseInt(itemDetails.barcodeId)
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
        barcodeId,
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
        barcodeId,
      },
    });
    await tx.stockSummary.updateMany({
      where: {
        branchId: parseInt(branchId),
        barcodeId: barcodeId,
      },
      data: {
        qty: { increment: qty },
        updatedById: parseInt(userId),
      },
    });
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
  validateUniqueBarcode(salesReturnItems);
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
      const removedItemsData = await tx.salesReturnSRItems.findMany({
        where: { id: { in: removeItemsIds } },
      });
      for (const item of removedItemsData) {
        const returnQty = item?.returnQty || 0;
        const barcodeId = item?.barcodeId;

        // 🔼 Add stock back (because return deleted)
        if (barcodeId && returnQty > 0) {
          await tx.stockSummary.updateMany({
            where: {
              branchId: parseInt(branchId),
              barcodeId: barcodeId,
            },
            data: {
              qty: { decrement: returnQty },
              updatedById: parseInt(userId),
            },
          });
        }
      }
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
    const barcodeId = itemDetails?.barcodeId
      ? parseInt(itemDetails.barcodeId)
      : null;
    if (itemDetails.id) {
      const oldItem = await tx.salesReturnSRItems.findUnique({
        where: { id: parseInt(itemDetails.id) },
      });
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
          barcodeId,
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
            barcodeId,
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
            barcodeId,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            invNo: billNo ? billNo : undefined,
          },
        });
      }

      const oldQty = oldItem?.returnQty || 0;
      const oldBarcodeId = oldItem?.barcodeId || null;
      const newQty = returnQty;
      const newBarcodeId = barcodeId;
      if (oldBarcodeId && newBarcodeId && oldBarcodeId === newBarcodeId) {
        // Same barcode → adjust difference
        const qtyDifference = oldQty - newQty;

        if (qtyDifference !== 0) {
          await tx.stockSummary.updateMany({
            where: {
              branchId: parseInt(branchId),
              barcodeId: newBarcodeId,
            },
            data: {
              qty: { decrement: qtyDifference },
              updatedById: parseInt(userId),
            },
          });
        }
      } else {
        // 🔼 Add back old return qty
        if (oldBarcodeId && oldQty > 0) {
          await tx.stockSummary.updateMany({
            where: {
              branchId: parseInt(branchId),
              barcodeId: oldBarcodeId,
            },
            data: {
              qty: { decrement: oldQty },
              updatedById: parseInt(userId),
            },
          });
        }

        // 🔽 Subtract new return qty
        if (newBarcodeId && newQty > 0) {
          await tx.stockSummary.updateMany({
            where: {
              branchId: parseInt(branchId),
              barcodeId: newBarcodeId,
            },
            data: {
              qty: { increment: newQty },
              updatedById: parseInt(userId),
            },
          });
        }
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
          barcodeId,
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
          barcodeId,
        },
      });
      if (barcodeId && returnQty > 0) {
        await tx.stockSummary.updateMany({
          where: {
            branchId: parseInt(branchId),
            barcodeId: barcodeId,
          },
          data: {
            qty: { increment: returnQty },
            updatedById: parseInt(userId),
          },
        });
      }
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
