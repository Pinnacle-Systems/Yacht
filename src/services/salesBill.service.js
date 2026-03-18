import { prisma } from "../lib/prisma.js";
import twilio from "twilio";
import { ErrorResponse, NoRecordFound } from "../configs/Responses.js";
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
    searchDeliveryTo,
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
      DeliveryTo: {
        branchName: Boolean(searchDeliveryTo)
          ? { contains: searchDeliveryTo }
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
      DeliveryTo: {
        select: {
          branchName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // 🔥 Descending Order
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

async function getHOSalesList(req) {
  const { branchId } = req.query;
  let data = await prisma.salesBill.findMany({
    where: {
      deliveryToId: branchId ? parseInt(branchId) : undefined,
    },
    orderBy: {
      createdAt: "desc", // 🔥 Descending Order
    },
  });
  const totalCount = data.length;
  return { statusCode: 0, data, totalCount };
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
    fromDate,
    toDate,
  } = req.query;
  const { startTime: startDateStartTime } = getDateTimeRange(startDate);
  const { endTime: endDateEndTime } = getDateTimeRange(endDate);
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const from = fromDate ? new Date(fromDate) : undefined;
  const to = toDate ? new Date(toDate) : undefined;
  if (to) to.setHours(23, 59, 59, 999);
  let data = await prisma.salesBill.findMany({
    where: {
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
            ...(from && to ? [{ docDate: { gte: from, lte: to } }] : []),
          ]
        : from && to
          ? [{ docDate: { gte: from, lte: to } }]
          : undefined,
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
          StyleItem: {
            select: {
              name: true,
            },
          },
          Size: {
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
        },
      },
      DeliveryTo: {
        select: {
          branchName: true,
        },
      },
    },
  });
  let returnData = await prisma.salesReturnSR.findMany({
    where: {
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
            ...(from && to ? [{ docDate: { gte: from, lte: to } }] : []),
          ]
        : from && to
          ? [{ docDate: { gte: from, lte: to } }]
          : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
      returnType: "Exchange",
    },
    include: {
      Customer: {
        select: {
          name: true,
          mobileNo: true,
        },
      },
      DeliveryTo: {
        select: {
          branchName: true,
        },
      },
      salesReturnSRItems: {
        select: {
          returnQty: true,
          StyleItem: {
            select: {
              name: true,
            },
          },
          Size: {
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
        },
      },

      salesExchangeItems: {
        select: {
          exchangeQty: true,
          StyleItem: {
            select: {
              name: true,
            },
          },
          Size: {
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
        },
      },
    },
  });
  // Normalize Sales Bills
  const formattedBills = data.map((item) => ({
    id: item.id,
    docId: item.docId,
    docDate: item.docDate,
    createdAt: item.createdAt,
    customerName: item.customerName,
    mobileNo: item.mobileNo,
    type: "Sales",
    cashAmount: item.isCash ? item.paymentValue || 0 : 0,
    cardAmount: item.cardAmount || 0,
    upiAmount: item.upiAmount || 0,
    totalAmount:
      (item.paymentValue || 0) + (item.cardAmount || 0) + (item.upiAmount || 0),
    salesType: "General",
    salesItem: item.salesBillItems,
    deliveryTo: item.DeliveryTo?.branchName,
  }));

  // Normalize Sales Returns (Exchange)
  const formattedExchange = returnData.map((item) => {
    const exchangeItems = (item.salesExchangeItems || []).map((ex) => ({
      ...ex,
      qty: ex.exchangeQty,
    }));

    const returnItems = (item.salesReturnSRItems || []).map((ret) => ({
      ...ret,
      qty: -ret.returnQty,
    }));

    return {
      id: item.id,
      docId: item.docId,
      docDate: item.docDate,
      createdAt: item.createdAt,
      customerName: item.customerName,
      mobileNo: item.mobileNo,
      type: "Exchange",
      cashAmount: item.cashAmount || 0,
      cardAmount: item.cardAmount || 0,
      upiAmount: item.upiAmount || 0,
      totalAmount:
        (item.cashAmount || 0) + (item.cardAmount || 0) + (item.upiAmount || 0),
      salesType: "Exchange",

      salesItem: [...exchangeItems, ...returnItems],

      deliveryTo: item.DeliveryTo?.branchName,
    };
  });
  const combinedData = [...formattedBills, ...formattedExchange].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const totalCount = combinedData.length;
  const totalCashAmount = combinedData?.reduce(
    (sum, item) => sum + (item.cashAmount || 0),
    0,
  );
  const totalCardAmount = combinedData?.reduce(
    (sum, item) => sum + (item.cardAmount || 0),
    0,
  );
  const totalUpiAmount = combinedData?.reduce(
    (sum, item) => sum + (item.upiAmount || 0),
    0,
  );
  const totalNetAmount = totalCashAmount + totalCardAmount + totalUpiAmount;
  // if (pagination) {
  //   data = data.slice(
  //     (pageNumber - 1) * parseInt(dataPerPage),
  //     pageNumber * dataPerPage,
  //   );
  // }

  return {
    statusCode: 0,
    data: combinedData,
    totalCount,
    totalCashAmount,
    totalCardAmount,
    totalUpiAmount,
    totalNetAmount,
  };
}

async function getOne(id) {
  // Fetch PO with relations
  let data = await prisma.salesBill.findUnique({
    where: { id: parseInt(id) },
    include: {
      salesBillItems: {
        select: {
          id: true,
          salesBillId: true,
          styleId: true,
          sizeId: true,
          qty: true,
          styleItemId: true,
          colorId: true,
          uomId: true,
          barcodeNo: true,
          rate: true,
          discountType: true,
          discountValue: true,
          taxPercent: true,
          netAmount: true,
          barcodeId: true,
          StyleItem: {
            select: {
              name: true,
            },
          },
          Size: {
            select: {
              name: true,
            },
          },
          Uom: {
            select: {
              name: true,
            },
          },
          Style: {
            select: {
              sku: true,
            },
          },
        },
      },
      Customer: {
        select: {
          name: true,
          mobileNo: true,
        },
      },
      DeliveryTo: {
        select: {
          branchName: true,
        },
      },
    },
  });

  if (!data) return NoRecordFound("salesBill");
  const branchId = data?.branchId;
  const branchDetails = await prisma.branch.findUnique({
    where: {
      id: data.branchId,
    },
    select: {
      company: {
        select: {
          name: true,
        },
      },
    },
  });
  const branch = await prisma.branch.findFirst({
    where: {
      branchName: branchDetails?.company.name,
    },
  });
  const hoBranchId = parseInt(branch.id);
  const itemsWithUsedQty = await Promise.all(
    data.salesBillItems.map(async (item) => {
      const childRecordReturn = await prisma.salesReturnSRItems.count({
        where: {
          barcodeId: item.barcodeId,
          SalesReturnSR: {
            is: {
              branchId: parseInt(branchId),
            },
          },
        },
      });
      const usedBarcodes = await prisma.purchaseBillItems.count({
        where: {
          barcodeId: item.barcodeId,
          // PurchaseBill: {
          //   isNot: {
          //     branchId: parseInt(branchId),
          //   },
          // },
          PurchaseBill: {
            is: {
              branchId: {
                notIn: [parseInt(branchId), hoBranchId],
              },
            },
          },
        },
      });
      return {
        ...item,
        usedQty: childRecordReturn + usedBarcodes,
      };
    }),
  );
  const barcodeIds = data.salesBillItems
    .map((item) => item.barcodeId)
    .filter(Boolean);
  const childRecord = await prisma.salesReturnSRItems.count({
    where: {
      barcodeId: { in: barcodeIds },
      SalesReturnSR: {
        is: {
          branchId: parseInt(branchId),
        },
      },
    },
  });
  const childRecordSRInward = await prisma.purchaseBill.count({
    where: {
      dcNo: { in: data.docId },
    },
  });
  return {
    statusCode: 0,
    data: {
      ...data,
      salesBillItems: itemsWithUsedQty,
      childRecord,
      childRecordSRInward: childRecordSRInward,
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
      deliveryToId,
      roundOffType,
      roundOffValue,
      salesPersonId,
      referenceId,
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
      let customerObj = null;
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId ? parseInt(customerId) : undefined },
          data: {
            name: customerName ? customerName : undefined,
          },
        });
        customerObj = await tx.customer.findUnique({
          where: { id: customerId ? parseInt(customerId) : undefined },
        });
      }
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
          mobileNo: customerObj?.mobileNo || null,
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
          deliveryToId: deliveryToId ? parseInt(deliveryToId) : undefined,
          roundOffType,
          roundOffValue:
            roundOffValue === "" || roundOffValue == null
              ? null
              : Number(roundOffValue),
          salesPersonId: salesPersonId ? parseInt(salesPersonId) : undefined,
          referenceId: referenceId ? parseInt(referenceId) : undefined,
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
        netAmount: itemDetails?.netAmount
          ? parseInt(itemDetails.netAmount)
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
    deliveryToId,
    roundOffType,
    roundOffValue,
    salesPersonId,
    referenceId,
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
        deliveryToId: deliveryToId ? parseInt(deliveryToId) : undefined,
        roundOffType,
        roundOffValue:
          roundOffValue === "" || roundOffValue == null
            ? null
            : Number(roundOffValue),
        salesPersonId: salesPersonId ? parseInt(salesPersonId) : undefined,
        referenceId: referenceId ? parseInt(referenceId) : undefined,
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
          netAmount: itemDetails?.netAmount
            ? parseInt(itemDetails.netAmount)
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
          netAmount: itemDetails?.netAmount
            ? parseInt(itemDetails.netAmount)
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
  const { billNo, branchId, companyId } = req.query;

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
          netAmount: true,
          discountType: true,
          discountValue: true,
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

  const company = await prisma.company.findUnique({
    where: {
      id: parseInt(companyId),
    },
  });
  const branch = await prisma.branch.findFirst({
    where: {
      branchName: company.name,
    },
  });
  const hoBranchId = parseInt(branch.id);

  const itemsWithUsedQty = await Promise.all(
    data.salesBillItems.map(async (item) => {
      const usedBarcodesInPurchase = await prisma.purchaseBillItems.count({
        where: {
          barcodeId: item.barcodeId,
          PurchaseBill: {
            is: {
              branchId: {
                notIn: [parseInt(branchId), hoBranchId],
              },
            },
          },
        },
      });
      const usedBarcodesInReturn = await prisma.purchasReturnItemsSR.count({
        where: {
          barcodeId: item.barcodeId,
          PurchaseReturnShowRoom: {
            isNot: {
              branchId: parseInt(branchId),
            },
          },
        },
      });
      const usedBarcodesInSalesReturn = await prisma.salesReturnSRItems.count({
        where: {
          barcodeId: item.barcodeId,
          SalesReturnSR: {
            is: {
              branchId: parseInt(branchId),
            },
          },
        },
      });
      return {
        ...item,
        usedQty:
          usedBarcodesInPurchase -
          usedBarcodesInReturn +
          usedBarcodesInSalesReturn,
      };
    }),
  );

  if (!data) return NoRecordFound("Sales Bill");
  return {
    statusCode: 0,
    data: {
      ...data,
      salesBillItems: itemsWithUsedQty,
    },
  };
}

async function getHOSalesDetail(req) {
  const { dcNo } = req.query;

  let data = await prisma.salesBill.findFirst({
    where: {
      docId: dcNo,
    },
    select: {
      salesBillItems: {
        select: {
          id: true,
          salesBillId: true,
          styleId: true,
          sizeId: true,
          qty: true,
          styleItemId: true,
          colorId: true,
          barcodeId: true,
          barcodeNo: true,
        },
      },
      docDate: true,
    },
  });

  const barcodes = data?.salesBillItems || [];

  // const salesReturn = await prisma.salesReturnSR.findMany({
  //   where: {
  //     billNo: dcNo,
  //   },
  //   include: {
  //     salesReturnSRItems: true,
  //   },
  // });
  // const returnItems = salesReturn.flatMap((sr) => sr.salesReturnSRItems);

  const returnItems = await prisma.salesReturnSRItems.findMany({
    where: {
      billNo: dcNo,
    },
  });

  const returnedBarcodeIds = new Set(returnItems.map((item) => item.barcodeId));
  const filteredBarcodes = barcodes.filter(
    (barcode) => !returnedBarcodeIds.has(barcode.barcodeId),
  );
  const barcodeWithRate = await Promise.all(
    filteredBarcodes.map(async (barcode) => {
      const style = await prisma.style.findUnique({
        where: {
          id: barcode.styleId,
        },
        include: {
          Hsn: {
            select: {
              taxPerc: true,
            },
          },
        },
      });
      return {
        barcodeNo: barcode.barcodeNo,
        styleId: barcode.styleId,
        styleItemId: barcode.styleItemId,
        sizeId: barcode.sizeId,
        colorId: barcode.colorId,
        uomId: style.uomId,
        rate: style?.price || null,
        taxPercent: style?.Hsn?.taxPerc ?? 5,
        qty: 1,
        barcodeId: barcode.barcodeId,
      };
    }),
  );
  const invValue = barcodeWithRate?.reduce((sum, item) => sum + item.rate, 0);

  if (!data) return NoRecordFound("Sales Bill");
  return {
    statusCode: 0,
    data: barcodeWithRate,
    invValue: invValue,
    invDate: data?.docDate,
  };
}

async function getSalesBarcodeDetail(req) {
  const { barcodeNo, branchId } = req.query;

  // 1️⃣ First try fetching by styleNo
  let data = await prisma.salesBillItems.findFirst({
    where: {
      barcodeNo: barcodeNo,
      SalesBill: {
        branchId: parseInt(branchId),
      },
    },
    include: {
      SalesBill: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const childRecord = await prisma.salesReturnSRItems.count({
    where: {
      barcodeNo: barcodeNo,
      billNo: data?.SalesBill?.docId,
    },
  });
  if (childRecord > 0) {
    return ErrorResponse("Barcode Number is Already Return");
  }

  const barcodeCount = await prisma.stockSummary.aggregate({
    where: {
      branchId: {
        notIn: parseInt(branchId),
      },
      barcodeNo: barcodeNo,
    },
    _sum: {
      qty: true,
    },
  });

  if (barcodeCount?._sum?.qty > 0) {
    return ErrorResponse(
      "Cannot Return the Barcode Number.This Barcode is stock in another branch!.",
    );
  }

  // 2️⃣ If no data found, try fetching by barCode
  if (!data || data.length === 0 || data === null) {
    return ErrorResponse("Barcode Number Not Found");
  }

  return {
    statusCode: 0,
    data: {
      salesBillId: data?.salesBillId,
      styleId: data?.styleId,
      sizeId: data?.sizeId,
      returnQty: data?.qty,
      styleItemId: data?.styleItemId,
      colorId: data?.colorId,
      uomId: data?.uomId,
      barcodeNo: data?.barcodeNo,
      barcodeId: data?.barcodeId,
      billNo: data?.SalesBill?.docId,
      deliveryToId: data?.SalesBill?.deliveryToId,
    },
  };
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const buildSalesMessage = (data) => {
  const {
    customerName,
    docId,
    docDate,
    totalAmount,
    paymentType,
    branchName,
    branchPhone,
    items = [],
  } = data;

  const date = new Date(docDate).toLocaleDateString("en-IN");
  const billNo = docId?.split("/").pop() || docId;
  const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const totalItems = [...new Set(items.map((i) => i.styleItemId))].length;

  return `🛍️ *${branchName || "Our Store"}* - Sales Receipt

Dear ${customerName},
Thank you for shopping with us! 🙏

📋 *Bill Details*
━━━━━━━━━━━━━━━━
🧾 Bill No   : ${billNo}
📅 Date      : ${date}
👗 Items     : ${totalItems}
📦 Total Qty : ${totalQty}
━━━━━━━━━━━━━━━━
💰 *Net Amount : ₹${formatCurrency(totalAmount)}*
💳 Payment     : ${paymentType || "Cash"}
━━━━━━━━━━━━━━━━

📌 *Terms & Conditions*
- Exchange within 3 days with bill & tag
- Follow wash care instructions
- No cash refund

📞 For queries: ${branchPhone || ""}

_Thank you! Visit Again_ 😊`;
};

async function sendSalesBillSMS(body) {
  try {
     console.log("Twilio Debug:", {
      sid: process.env.TWILIO_ACCOUNT_SID,
      token: process.env.TWILIO_AUTH_TOKEN?.slice(0, 6) + "...",
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    const { messageData } = await body;
    if (!messageData?.mobileNo) throw new Error("Mobile number is required");
    // ✅ Format Indian mobile number
    const formattedNumber = messageData?.mobileNo.startsWith("+")
      ? messageData?.mobileNo
      : `+91${messageData?.mobileNo.replace(/\D/g, "").slice(-10)}`;

    const message = buildSalesMessage(messageData);

    console.log(process.env.TWILIO_PHONE_NUMBER,"process.env.TWILIO_PHONE_NUMBER")
    console.log(formattedNumber,"formattedNumber")
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`, // your Twilio number
      to: `whatsapp:${formattedNumber}`,
    });

    //    const result = await client.messages.create({
    //   body: message,
    //   from: "whatsapp:+14155238886", // your Twilio number
    //   to:  "whatsapp:+919361404953",
    // });

    return { success: true, sid: result.sid };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export {
  get,
  getOne,
  create,
  update,
  remove,
  getSalesBillDetail,
  getSalesReport,
  getHOSalesDetail,
  getHOSalesList,
  getSalesBarcodeDetail,
  sendSalesBillSMS
};
