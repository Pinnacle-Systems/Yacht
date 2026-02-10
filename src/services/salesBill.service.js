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
  let salesBill = await prisma.salesBill.findUnique({
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

  if (!salesBill) return NoRecordFound("salesBill");

  return {
    statusCode: 0,
    data: {
      ...salesBill,
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
        qty:
          itemDetails?.qty && !isNaN(parseFloat(itemDetails.qty))
            ? -Math.abs(parseInt(itemDetails.qty))
            : null,
        salesBillItemsId: createdItem.id,
        barcodeNo: itemDetails?.barcodeNo ?? undefined,
        rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
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
    const qty = itemDetails?.qty
      ? Math.round(parseFloat(itemDetails.qty))
      : null;

    if (itemDetails.id) {
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
          qty,
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
            qty:
              itemDetails?.qty && !isNaN(parseFloat(itemDetails.qty))
                ? -Math.abs(parseInt(itemDetails.qty))
                : null,
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
            qty:
              itemDetails?.qty && !isNaN(parseFloat(itemDetails.qty))
                ? -Math.abs(parseInt(itemDetails.qty))
                : null,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          },
        });
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
          qty,
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
          qty:
            itemDetails?.qty && !isNaN(parseFloat(itemDetails.qty))
              ? -Math.abs(parseInt(itemDetails.qty))
              : null,
          salesBillItemsId: createdItem.id,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
        },
      });

      return createdItem;
    }
  });

  return Promise.all(promises);
}

async function remove(id) {
  const data = await prisma.salesBill.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
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

export { get, getOne, create, update, remove, getSalesBillDetail };
