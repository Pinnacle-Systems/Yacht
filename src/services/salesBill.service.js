import { PrismaClient } from "@prisma/client";
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
import { poUpdateValidator } from "../validators/po.validator.js";
import { styleItem } from "../routes/index.js";
// import { getTotalQty } from '../utils/poHelpers/getTotalQuantity.js';
const prisma = new PrismaClient();

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

// function manualFilterSearchData(
//   searchBillDate,
//   searchinvDate,
//   searchPoType,
//   data,
// ) {
//   return data.filter(
//     (item) =>
//       searchBillDate
//         ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate)
//         : true,
//     //     &&
//     //   (searchPoType
//     //     ? item.poType.toLowerCase().includes(searchPoType.toLowerCase())
//     //     : true),
//   );
// }

async function get(req) {
  const {
    branchId,
    active,
    pagination,
    pageNumber,
    dataPerPage,
    finYearId,
    searchDocId,
    searchBillDate,
    searchinvDate,
    customerId,
    startDate,
    endDate,
    filterParties,
    supplier,
    filterPoTypes,
    serachDocNo,
    searchClientName,
    searchDate,
    searchMaterial,
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
      OR:
        customerId || Boolean(filterParties)
          ? [
              {
                customerId: customerId ? parseInt(customerId) : undefined,
              },
              {
                customerId: Boolean(filterParties)
                  ? {
                      in: filterParties.split(",").map((i) => parseInt(i)),
                    }
                  : undefined,
              },
            ]
          : undefined,
      Customer: {
        name: Boolean(supplier) ? { contains: supplier } : undefined,
      },
    },
    include: {
      Customer: {
        select: {
          name: true,
        },
      },

      salesBillItems: {
        select: {
          qty: true,
        },
      },
    },
  });
  // data = manualFilterSearchData(searchBillDate, data);
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
          mobileNo,
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
      await tx.customer.update({
        where: { id: customerId ? parseInt(customerId) : undefined },
        data: {
          name : customerName ? customerName : undefined,
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
        paymentValue:  paymentValue ? parseFloat(paymentValue) : null,
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

function manualFilterSearchDatasalesBillItems(
  searchDocDate,
  searchinvDate,
  data,
) {
  return data.filter(
    (item) =>
      (searchDocDate
        ? String(getDateFromDateTime(item.salesBill.docDate)).includes(
            searchDocDate,
          )
        : true) &&
      (searchinvDate
        ? String(getDateFromDateTime(item.salesBill.invDate)).includes(
            searchinvDate,
          )
        : true),
  );
}

async function getAllDatasalesBillItems(data) {
  let promises = data?.map(async (item) => {
    let data = await getsalesBillItemById(item.id);
    return data.data;
  });
  return Promise.all(promises);
}

async function getsalesBillItemById(id) {
  const data = await prisma.salesBillItems.findUnique({
    where: { id: parseInt(id) },
    include: {
      salesBill: { select: { docId: true, invDate: true, docDate: true } },
      StyleItem: { select: { name: true } },
      Size: { select: { name: true } },
      Color: { select: { name: true } },
    },
  });

  if (!data) return NoRecordFound("Sales Bill");

  // 3️⃣ Stock balance
  const totalStkQty = await prisma.stockLedger.aggregate({
    where: {
      styleItemId: data.styleItemId,
      uomId: data.uomId,
      barcodeNo: data.barcodeNo,
      sizeId: data.sizeId,
      styleId: data.styleId,
    },
    _sum: { qty: true },
  });

  return {
    statusCode: 0,
    data: {
      ...data,
      // poQty: data.qty,
      // inwardQty,
      // returnQty,
      stkQty: totalStkQty._sum.qty ?? 0,
    },
  };
}

async function getsalesBillItems(req) {
  const {
    branchId,
    active,
    customerId,
    pagination,
    dataPerPage,
    searchDocId,
    searchDocDate,
    searchinvDate,
  } = req.query;

  let data;
  let totalCount;
  if (pagination) {
    data = await prisma.salesBillItems.findMany({
      where: {
        salesBill: {
          docId: Boolean(searchDocId)
            ? {
                contains: searchDocId,
              }
            : undefined,
          customerId: customerId ? parseInt(customerId) : undefined,
        },
      },
      include: {
        salesBill: {
          select: {
            customerId: true,
            docDate: true,
            invDate: true,
          },
        },

        Uom: {
          select: {
            name: true,
          },
        },
      },
    });
    data = manualFilterSearchDatasalesBillItems(
      searchDocDate,
      searchinvDate,
      data,
    );

    data = data?.filter(
      (i) => i.salesBill.customerId == customerId,
      // && i.Po.inwardType === po,
    );

    data = await getAllDatasalesBillItems(data);
  } else {
    data = await prisma.salesBillItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }
  return { statusCode: 0, data, totalCount };
}

export { get, getOne, create, update, remove, getsalesBillItems };
