import { prisma } from "../lib/prisma.js";
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

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.salesBill.findFirst({
    where: {
      branchId: parseInt(branchId),
    },
    orderBy: {
      id: "desc",
    },
  });
  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SB/1`;
  if (lastObject) {
    newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
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
    customerId,
    startDate,
    endDate,
    supplier,
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
  let data = await prisma.salesBill.findMany({
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
    },
    include: {
      Customer: {
        select: {
          name: true,
          mobileNo: true,
        },
      },

      salesBillItems: {
        select: {
          qty: true,
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
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage,
    );
  }

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

async function getSalesReport(req) {
  const {
    branchId,
    active,
    pagination,
    pageNumber,
    dataPerPage,
    finYearId,
    startDate,
    endDate,
  } = req.query;
  const { startTime: startDateStartTime } = getDateTimeRange(startDate);
  const { endTime: endDateEndTime } = getDateTimeRange(endDate);
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  let data = await prisma.salesBill.findMany({
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
    },
    include: {
      Customer: {
        select: {
          name: true,
          mobileNo: true,
        },
      },

      salesBillItems: {
        select: {
          qty: true,
        },
      },
    },
  });
  const totalCount = data.length;
  const totalCashAmount = data?.reduce(
    (sum, item) => sum + (item.paymentValue || 0),
    0,
  );
  const totalCardAmount = data?.reduce(
    (sum, item) => sum + (item.cardAmount || 0),
    0,
  );
  const totalUpiAmount = data?.reduce(
    (sum, item) => sum + (item.upiAmount || 0),
    0,
  );
  const totalNetAmount = totalCashAmount + totalCardAmount + totalUpiAmount;
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage,
    );
  }

  return {
    statusCode: 0,
    data,
    totalCount,
    totalCashAmount,
    totalCardAmount,
    totalUpiAmount,
    totalNetAmount
  };
}

async function getOne(id) {
  // Fetch PO with relations
  let data = await prisma.salesBill.findUnique({
    where: { id: parseInt(id) },
    include: {
      salesBillItems: true,
      Customer: {
        select: {
          name: true,
          mobileNo: true,
        },
      },
    },
  });

  if (!data) return NoRecordFound("salesBill");
  const itemsWithUsedQty = await Promise.all(
    data.salesBillItems.map(async (item) => {
      const childRecordReturn = await prisma.salesReturnSRItems.count({
        where: {
          barcodeId: item.barcodeId,
        },
      });
      return {
        ...item,
        usedQty: childRecordReturn || 0,
      };
    }),
  );
  const barcodeIds = data.salesBillItems
    .map((item) => item.barcodeId)
    .filter(Boolean);
  const childRecord = await prisma.salesReturnSRItems.count({
    where: {
      barcodeId: { in: barcodeIds },
    },
  });
  return {
    statusCode: 0,
    data: {
      ...data,
      salesBillItems: itemsWithUsedQty,
      childRecord,
    },
  };
}

function validateUniqueBarcode(salesBillItems) {
  const seen = new Set();

  for (let i = 0; i < salesBillItems.length; i++) {
    const barcodeId = salesBillItems[i]?.barcodeId;

    if (!barcodeId) continue; // skip empty if needed

    if (seen.has(barcodeId)) {
      throw new Error(
        `Duplicate Barcode No ${salesBillItems[i].barcodeNo} found in row ${i + 1}`,
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
      taxTemplateId,
      paymentType,
      paymentValue,
      customerId,
      mobileNo,
      remarks,
      salesBillItems,
      discountType,
      discountValue,
      termsAndCondition,
      customerName,
      isCash,
      isCard,
      isUpI,
      cardAmount,
      upiAmount,
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
    validateUniqueBarcode(salesBillItems);
    await prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customerId ? parseInt(customerId) : undefined },
        data: {
          name: customerName ? customerName : undefined,
        },
      });
      const customerObj = await tx.customer.findUnique({
        where: { id: customerId ? parseInt(customerId) : undefined },
      });
      data = await tx.salesBill.create({
        data: {
          docId: newDocId,
          docDate: docDate ? new Date(docDate) : null,
          taxTemplateId: parseInt(taxTemplateId),
          paymentValue: paymentValue ? parseFloat(paymentValue) : null,
          branchId: parseInt(branchId),
          createdById: parseInt(userId),
          // paymentType,
          customerId: customerId ? parseInt(customerId) : undefined,
          mobileNo: customerObj ? customerObj.mobileNo : undefined,
          termsAndCondition,
          remarks,
          discountType,
          discountValue:
            discountValue === "" || discountValue == null
              ? null
              : Number(discountValue),
          customerName: customerName ? customerName : undefined,
          isCash: Boolean(isCash),
          isCard: Boolean(isCard),
          isUpI: Boolean(isUpI),
          cardAmount: cardAmount ? parseFloat(cardAmount) : null,
          upiAmount: upiAmount ? parseFloat(upiAmount) : null,
        },
      });

      await createSalesBillItems(tx, salesBillItems, data, userId, branchId);
    });
    return { statusCode: 0, data };
  } catch (err) {
    return {
      statusCode: 400,
      message: err.message,
    };
  }
}

async function createSalesBillItems(
  tx,
  salesBillItems,
  salesBill,
  userId,
  branchId,
) {
  const promises = salesBillItems.map(async (itemDetails, index) => {
    const qty = itemDetails?.qty
      ? Math.round(parseFloat(itemDetails.qty))
      : null;
    const barcodeId = itemDetails?.barcodeId
      ? parseInt(itemDetails.barcodeId)
      : null;
    const createdItem = await tx.salesBillItems.create({
      data: {
        salesBillId: parseInt(salesBill.id),
        styleItemId: itemDetails?.styleItemId
          ? parseInt(itemDetails.styleItemId)
          : null,
        sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
        styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
        uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
        colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
        qty,
        barcodeId,
        barcodeNo: itemDetails?.barcodeNo ?? undefined,
        rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
        discountType: itemDetails?.discountType ?? undefined,
        discountValue: itemDetails?.discountValue
          ? parseInt(itemDetails.discountValue)
          : null,
        taxPercent: itemDetails?.taxPercent
          ? parseInt(itemDetails.taxPercent)
          : null,
      },
    });
    await tx.stockLedger.create({
      data: {
        inOrOut: "Out",
        refType: "salesBill",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
        sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
        colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
        uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
        styleItemId: itemDetails?.styleItemId
          ? parseInt(itemDetails.styleItemId)
          : null,
        qty: -qty,
        barcodeId,
        salesBillItemsId: createdItem.id,
        barcodeNo: itemDetails?.barcodeNo ?? undefined,
        rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
      },
    });
    await tx.stockSummary.updateMany({
      where: {
        branchId: parseInt(branchId),
        barcodeId: barcodeId,
      },
      data: {
        qty: { decrement: qty },
        updatedById: parseInt(userId),
      },
    });
    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, salesBillItems) {
  let removedItems = dataFound.salesBillItems.filter((oldItem) => {
    let result = salesBillItems.find(
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
    taxTemplateId,
    paymentValue,
    paymentType,
    customerId,
    mobileNo,
    remarks,
    salesBillItems,
    discountType,
    discountValue,
    termsAndCondition,
    customerName,
    isCash,
    isCard,
    isUpI,
    cardAmount,
    upiAmount,
  } = await body;
  let data;
  validateUniqueBarcode(salesBillItems);
  const dataFound = await prisma.salesBill.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      salesBillItems: true,
    },
  });
  if (!dataFound) return NoRecordFound("Sales Bill");
  let removedItems = findRemovedItems(dataFound, salesBillItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    if (removeItemsIds.length > 0) {
      const removedItemsData = await tx.salesBillItems.findMany({
        where: { id: { in: removeItemsIds } },
      });
      for (const item of removedItemsData) {
        const salesQty = item?.qty || 0;
        const barcodeId = item?.barcodeId;

        // 🔼 Add stock back (because return deleted)
        if (barcodeId && salesQty > 0) {
          await tx.stockSummary.updateMany({
            where: {
              branchId: parseInt(branchId),
              barcodeId: barcodeId,
            },
            data: {
              qty: { increment: salesQty },
              updatedById: parseInt(userId),
            },
          });
        }
      }
      await tx.salesBillItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.salesBill.update({
      where: {
        id: parseInt(id),
      },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        taxTemplateId: parseInt(taxTemplateId),
        paymentValue: paymentValue ? parseFloat(paymentValue) : null,
        branchId: parseInt(branchId),
        updatedById: parseInt(userId),
        isCash: Boolean(isCash),
        isCard: Boolean(isCard),
        isUpI: Boolean(isUpI),
        cardAmount: cardAmount ? parseFloat(cardAmount) : null,
        upiAmount: upiAmount ? parseFloat(upiAmount) : null,
        paymentType,
        customerId: customerId ? parseInt(customerId) : null,
        customerName: customerName ? customerName : undefined,
        mobileNo,
        termsAndCondition,
        remarks,
        discountType,
        discountValue:
          discountValue === "" || discountValue == null
            ? null
            : Number(discountValue),
      },
    });
    await updateSalesBillItems(tx, salesBillItems, data, userId, branchId);
  });
  return { statusCode: 0, data };
}

async function updateSalesBillItems(
  tx,
  salesBillItems,
  salesBill,
  userId,
  branchId,
) {
  const promises = salesBillItems.map(async (itemDetails) => {
    const salesQty = itemDetails?.qty
      ? Math.round(parseFloat(itemDetails.qty))
      : null;
    const barcodeId = itemDetails?.barcodeId
      ? parseInt(itemDetails.barcodeId)
      : null;
    if (itemDetails.id) {
      const oldItem = await tx.salesBillItems.findUnique({
        where: { id: parseInt(itemDetails.id) },
      });
      // Update existing poItem
      const updatedItem = await tx.salesBillItems.update({
        where: { id: parseInt(itemDetails.id) },
        data: {
          salesBillId: parseInt(salesBill.id),
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          qty: salesQty,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          barcodeId,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          discountType: itemDetails?.discountType ?? undefined,
          discountValue: itemDetails?.discountValue
            ? parseInt(itemDetails.discountValue)
            : null,
          taxPercent: itemDetails?.taxPercent
            ? parseInt(itemDetails.taxPercent)
            : null,
        },
      });
      const existingStock = await tx.stockLedger.findFirst({
        where: { salesBillItemsId: updatedItem.id },
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
            qty: -salesQty,
            barcodeId,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          },
        });
      } else {
        await tx.stockLedger.create({
          data: {
            inOrOut: "Out",
            refType: "salesBill",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            salesBillItemsId: updatedItem.id,
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
            qty: -salesQty,
            barcodeId,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          },
        });
      }

      const oldQty = oldItem?.qty || 0;
      const oldBarcodeId = oldItem?.barcodeId || null;
      const newQty = salesQty;
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
              qty: { increment: qtyDifference },
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
              qty: { increment: oldQty },
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
              qty: { decrement: newQty },
              updatedById: parseInt(userId),
            },
          });
        }
      }
      return updatedItem;
    } else {
      // Create new poItem
      const createdItem = await tx.salesBillItems.create({
        data: {
          salesBillId: parseInt(salesBill.id),
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          qty: salesQty,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          barcodeId,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          discountType: itemDetails?.discountType ?? undefined,
          discountValue: itemDetails?.discountValue
            ? parseInt(itemDetails.discountValue)
            : null,
          taxPercent: itemDetails?.taxPercent
            ? parseInt(itemDetails.taxPercent)
            : null,
        },
      });

      await tx.stockLedger.create({
        data: {
          inOrOut: "Out",
          refType: "salesBill",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          qty: -salesQty,
          salesBillItemsId: createdItem.id,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          barcodeId,
        },
      });

      if (barcodeId && salesQty > 0) {
        await tx.stockSummary.updateMany({
          where: {
            branchId: parseInt(branchId),
            barcodeId: barcodeId,
          },
          data: {
            qty: { decrement: salesQty },
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
  return await prisma.$transaction(async (tx) => {
    const singleData = await tx.salesBill.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        salesBillItems: true,
      },
    });
    for (const item of singleData.salesBillItems) {
      await tx.stockSummary.updateMany({
        where: {
          barcodeId: item.barcodeId,
          branchId: singleData.branchId,
        },
        data: {
          qty: {
            increment: item.qty || 0,
          },
        },
      });
    }
    const data = await tx.salesBill.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { statusCode: 0, data };
  });
}

async function getSalesBillDetail(req) {
  const { billNo, branchId } = req.query;

  let data = await prisma.salesBill.findFirst({
    where: {
      docId: billNo,
      branchId: parseInt(branchId),
    },
    include: {
      salesBillItems: {
        select: {
          id: true,
          salesBillId: true,
          styleId: true,
          sizeId: true,
          colorId: true,
          uomId: true,
          rate: true,
          qty: true,
          styleItemId: true,
          Size: {
            select: {
              name: true,
            },
          },
          StyleItem: {
            select: {
              name: true,
            },
          },
          Color: {
            select: {
              name: true,
            },
          },
          Uom: {
            select: {
              name: true,
            },
          },
          barcodeNo: true,
          id: true,
          barcodeId: true,
        },
      },
      Customer: {
        select: {
          name: true,
          mobileNo: true,
        },
      },
    },
  });

  if (!data) return NoRecordFound("Sales Bill");
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
  create,
  update,
  remove,
  getSalesBillDetail,
  getSalesReport,
};
