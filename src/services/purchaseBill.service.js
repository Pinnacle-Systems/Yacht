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
  let lastObject = await prisma.purchaseBill.findFirst({
    where: {
      branchId: parseInt(branchId),
    },
    orderBy: {
      id: "desc",
    },
  });
  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PB/1`;
  if (lastObject) {
    newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
  }
  return newDocId;
}

function manualFilterSearchData(
  searchPoDate,
  searchinvDate,
  searchPoType,
  data,
) {
  return data.filter(
    (item) =>
      (searchPoDate
        ? String(getDateFromDateTime(item.createdAt)).includes(searchPoDate)
        : true) &&
      (searchinvDate
        ? String(getDateFromDateTime(item.invDate)).includes(searchinvDate)
        : true) &&
      (searchPoType
        ? item.poType.toLowerCase().includes(searchPoType.toLowerCase())
        : true),
  );
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
    searchPoDate,
    searchSupplierAliasName,
    searchPoType,
    searchinvDate,
    supplierId,
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
  let data = await prisma.purchaseBill.findMany({
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
        supplierId || Boolean(filterParties)
          ? [
              {
                supplierId: supplierId ? parseInt(supplierId) : undefined,
              },
              {
                supplierId: Boolean(filterParties)
                  ? {
                      in: filterParties.split(",").map((i) => parseInt(i)),
                    }
                  : undefined,
              },
            ]
          : undefined,
      Supplier: {
        name: Boolean(supplier) ? { contains: supplier } : undefined,
      },
    },
    include: {
      Supplier: {
        select: {
          name: true,
        },
      },

      purchaseBillItems: {
        select: {
          qty: true,
        },
      },
    },
  });
  data = manualFilterSearchData(searchDate, searchinvDate, searchPoType, data);
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
  let purchaseBill = await prisma.purchaseBill.findUnique({
    where: { id: parseInt(id) },
    include: {
      purchaseBillItems: true,
      Supplier: {
        select: {
          aliasName: true,
          contactPersonName: true,
          gstNo: true,
          address: true,
          pincode: true,
          City: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!purchaseBill) return NoRecordFound("purchaseBill");

  return {
    statusCode: 0,
    data: {
      ...purchaseBill,
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
      invNo,
      invDate,
      invValue,
      paymentType,
      supplierId,
      contactPerson,
      contactNumber,
      remarks,
      purchaseBillItems,
      discountType,
      discountValue,
      termsAndCondition,
      dcNo,
    } = await body;
    console.log(dcNo,"dcNo")
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
      data = await tx.purchaseBill.create({
        data: {
          docId: newDocId,
          docDate: docDate ? new Date(docDate) : null,
          taxTemplateId: parseInt(taxTemplateId),
          invNo,
          invDate: invDate ? new Date(invDate) : null,
          invValue,
          branchId: parseInt(branchId),
          createdById: parseInt(userId),
          paymentType,
          supplierId: parseInt(supplierId),
          contactPerson,
          contactNumber,
          termsAndCondition,
          remarks,
          discountType,
          discountValue:
            discountValue === "" || discountValue == null
              ? null
              : Number(discountValue),
          dcNo,
        },
      });
      await createPurchaseBillItems(
        tx,
        purchaseBillItems,
        data,
        userId,
        branchId,
        invNo,
        dcNo,
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

async function createPurchaseBillItems(
  tx,
  purchaseBillItems,
  purchaseBill,
  userId,
  branchId,
  invNo,
  dcNo
) {
  const promises = purchaseBillItems.map(async (itemDetails, index) => {
    const qty = itemDetails?.qty
      ? Math.round(parseFloat(itemDetails.qty))
      : null;

    const createdItem = await tx.purchaseBillItems.create({
      data: {
        purchaseBillId: parseInt(purchaseBill.id),
        styleItemId: itemDetails?.styleItemId
          ? parseInt(itemDetails.styleItemId)
          : null,
        sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
        styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
        uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
        colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
        qty,
        invNo: invNo,
        dcNo: dcNo ? dcNo : undefined,
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
        inOrOut: "In",
        refType: "PurchaseBill",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
        sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
        colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
        uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
        styleItemId: itemDetails?.styleItemId
          ? parseInt(itemDetails.styleItemId)
          : null,
        qty,
        PurchaseBillItemsId: createdItem.id,
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

function findRemovedItems(dataFound, purchaseBillItems) {
  let removedItems = dataFound.purchaseBillItems.filter((oldItem) => {
    let result = purchaseBillItems.find(
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
    invNo,
    invDate,
    invValue,
    paymentType,
    supplierId,
    contactPerson,
    contactNumber,
    remarks,
    purchaseBillItems,
    discountType,
    discountValue,
    termsAndCondition,
    dcNo,
  } = await body;
  let data;
  const dataFound = await prisma.purchaseBill.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      purchaseBillItems: true,
    },
  });
  if (!dataFound) return NoRecordFound("Purchase Bill");
  let removedItems = findRemovedItems(dataFound, purchaseBillItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    if (removeItemsIds.length > 0) {
      await tx.purchaseBillItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.purchaseBill.update({
      where: {
        id: parseInt(id),
      },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        taxTemplateId: parseInt(taxTemplateId),
        invNo,
        invDate: invDate ? new Date(invDate) : null,
        invValue,
        dcNo,
        branchId: parseInt(branchId),
        updatedById: parseInt(userId),
        paymentType,
        supplierId: parseInt(supplierId),
        contactPerson,
        contactNumber,
        termsAndCondition,
        remarks,
        discountType,
        discountValue:
          discountValue === "" || discountValue == null
            ? null
            : Number(discountValue),
      },
    });
    await updatePurchaseBillItems(
      tx,
      purchaseBillItems,
      data,
      userId,
      branchId,
      invNo,
      dcNo
    );
  });
  return { statusCode: 0, data };
}

async function updatePurchaseBillItems(
  tx,
  purchaseBillItems,
  purchaseBill,
  userId,
  branchId,
  invNo,
  dcNo,
) {
  const promises = purchaseBillItems.map(async (itemDetails) => {
    const qty = itemDetails?.qty
      ? Math.round(parseFloat(itemDetails.qty))
      : null;

    if (itemDetails.id) {
      // Update existing poItem
      const updatedItem = await tx.purchaseBillItems.update({
        where: { id: parseInt(itemDetails.id) },
        data: {
          purchaseBillId: parseInt(purchaseBill.id),
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          qty,
          invNo: invNo,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          discountType: itemDetails?.discountType ?? undefined,
          discountValue: itemDetails?.discountValue
            ? parseInt(itemDetails.discountValue)
            : null,
          taxPercent: itemDetails?.taxPercent
            ? parseInt(itemDetails.taxPercent)
            : null,
          dcNo: dcNo ? dcNo : undefined,
        },
      });
      const existingStock = await tx.stockLedger.findFirst({
        where: { PurchaseBillItemsId: updatedItem.id },
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
            qty,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          },
        });
      } else {
        await tx.stockLedger.create({
          data: {
            inOrOut: "In",
            refType: "PurchaseBill",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            PurchaseBillItemsId: updatedItem.id,
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
            qty,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          },
        });
      }
      return updatedItem;
    } else {
      // Create new poItem
      const createdItem = await tx.purchaseBillItems.create({
        data: {
          purchaseBillId: parseInt(purchaseBill.id),
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          qty,
          invNo: invNo,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          discountType: itemDetails?.discountType ?? undefined,
          discountValue: itemDetails?.discountValue
            ? parseInt(itemDetails.discountValue)
            : null,
          taxPercent: itemDetails?.taxPercent
            ? parseInt(itemDetails.taxPercent)
            : null,
          dcNo: dcNo ? dcNo : undefined,
        },
      });

      await tx.stockLedger.create({
        data: {
          inOrOut: "In",
          refType: "PurchaseBill",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          qty,
          PurchaseBillItemsId: createdItem.id,
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
  const data = await prisma.purchaseBill.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

function manualFilterSearchDatapurchaseBillItems(
  searchDocDate,
  searchinvDate,
  data,
) {
  return data.filter(
    (item) =>
      (searchDocDate
        ? String(getDateFromDateTime(item.PurchaseBill.docDate)).includes(
            searchDocDate,
          )
        : true) &&
      (searchinvDate
        ? String(getDateFromDateTime(item.PurchaseBill.invDate)).includes(
            searchinvDate,
          )
        : true),
  );
}

async function getAllDatapurchaseBillItems(data) {
  let promises = data?.map(async (item) => {
    let data = await getPurchaseBillItemById(item.id);
    return data.data;
  });
  return Promise.all(promises);
}

async function getPurchaseBillItemById(id) {
  const data = await prisma.purchaseBillItems.findUnique({
    where: { id: parseInt(id) },
    include: {
      PurchaseBill: { select: { docId: true, invDate: true, docDate: true } },
      StyleItem: { select: { name: true } },
      Size: { select: { name: true } },
      Color: { select: { name: true } },
    },
  });

  if (!data) return NoRecordFound("Purchase Bill");

  // 3️⃣ Stock balance
  const totalStkQty = await prisma.stockLedger.aggregate({
    where: {
      styleItemId: data.styleItemId,
      uomId: data.uomId,
      barcodeNo: data.barcodeNo,
      sizeId: data.sizeId,
      styleId: data.styleId
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

async function getpurchaseBillItems(req) {
  const {
    branchId,
    active,
    supplierId,
    pagination,
    dataPerPage,
    searchDocId,
    searchDocDate,
    searchinvDate,
    invNo,
  } = req.query;

  let data;
  let totalCount;
  if (pagination) {
    data = await prisma.purchaseBillItems.findMany({
      where: {
        PurchaseBill: {
          docId: Boolean(searchDocId)
            ? {
                contains: searchDocId,
              }
            : undefined,
          supplierId: supplierId ? parseInt(supplierId) : undefined,
          invNo: invNo ? invNo : undefined,
        },
      },
      include: {
        PurchaseBill: {
          select: {
            supplierId: true,
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
    data = manualFilterSearchDatapurchaseBillItems(
      searchDocDate,
      searchinvDate,
      data,
    );

    data = data?.filter(
      (i) => i.PurchaseBill.supplierId == supplierId,
      // && i.Po.inwardType === po,
    );

    data = await getAllDatapurchaseBillItems(data);
  } else {
    data = await prisma.purchaseBillItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }
  return { statusCode: 0, data, totalCount };
}

export { get, getOne, create, update, remove, getpurchaseBillItems };
