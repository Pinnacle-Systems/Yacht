import { prisma } from "../lib/prisma.js";
import {
  CustomError,
  ErrorResponse,
  NoRecordFound,
} from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getDateTimeRange,
  getYearShortCode,
  getYearShortCodeForFinYear,
  substract,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
// import { getTotalQty } from '../utils/poHelpers/getTotalQuantity.js';

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
        ? String(getDateFromDateTime(item.docDate)).includes(searchPoDate)
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
    searchDocDate,
    searchInvNo,
    searchPoType,
    searchinvDate,
    supplierId,
    startDate,
    endDate,
    searchSupplier,
    serachDocNo,
    searchBillType,
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
      Supplier: {
        name: Boolean(searchSupplier)
          ? { contains: searchSupplier }
          : undefined,
      },
      invNo: Boolean(searchInvNo)
        ? {
            contains: searchInvNo,
          }
        : undefined,
      paymentType: Boolean(searchBillType)
        ? {
            contains: searchBillType,
          }
        : undefined,
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
          barcodeId: true,
          barcodeNo:true
        },
      },
    },
  });
  data = manualFilterSearchData(
    searchDocDate,
    searchinvDate,
    searchPoType,
    data,
  );
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

async function getOne(id) {
  // Fetch PO with relations
  let data = await prisma.purchaseBill.findUnique({
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

  if (!data) return NoRecordFound("purchaseBill");
  const itemsWithUsedQty = await Promise.all(
    data.purchaseBillItems.map(async (item) => {
      const childRecordSales = await prisma.salesBillItems.count({
        where: {
          barcodeId: item.barcodeId,
        },
      });
      const childRecordReturn = await prisma.purchasReturnItemsSR.count({
        where: {
          barcodeId: item.barcodeId,
        },
      });
      return {
        ...item,
        usedQty: childRecordSales + childRecordReturn || 0,
      };
    }),
  );
  const barcodeIds = data.purchaseBillItems
    .map((item) => item.barcodeId)
    .filter(Boolean);
  const childRecordReturn = await prisma.purchasReturnItemsSR.count({
    where: {
      barcodeId: { in: barcodeIds },
    },
  });

  const childRecordSales = await prisma.salesBillItems.count({
    where: {
      barcodeId: { in: barcodeIds },
    },
  });
  return {
    statusCode: 0,
    data: {
      ...data,
      purchaseBillItems: itemsWithUsedQty,
      childRecordReturn: childRecordReturn,
      childRecordSales: childRecordSales,
    },
  };
}

function validateUniqueBarcode(purchaseBillItems) {
  const seen = new Set();

  for (let i = 0; i < purchaseBillItems.length; i++) {
    const barcodeId = purchaseBillItems[i]?.barcodeId;

    if (!barcodeId) continue; // skip empty if needed

    if (seen.has(barcodeId)) {
      throw new Error(
        `Duplicate Barcode No ${purchaseBillItems[i].barcodeNo} found in row ${i + 1}`,
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
    validateUniqueBarcode(purchaseBillItems);
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

async function existItemCheck(tx, branchId, barcodeId, barcodeNo) {
  const result = await tx.stockLedger.aggregate({
    where: {
      branchId: parseInt(branchId),
      barcodeId: parseInt(barcodeId),
    },
    _sum: {
      qty: true,
    },
  });
  const currentQty = result._sum.qty ?? 0;

  if (currentQty > 0) {
    throw new Error(`The BarcodeNo - ${barcodeNo} Already Exist`);
  }
}

async function createPurchaseBillItems(
  tx,
  purchaseBillItems,
  purchaseBill,
  userId,
  branchId,
  invNo,
  dcNo,
) {
  const promises = purchaseBillItems.map(async (itemDetails, index) => {
    await existItemCheck(
      tx,
      branchId,
      itemDetails?.barcodeId,
      itemDetails?.barcodeNo,
    );
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
        barcodeId: itemDetails?.barcodeId
          ? parseInt(itemDetails.barcodeId)
          : null,
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
        barcodeId: itemDetails?.barcodeId
          ? parseInt(itemDetails.barcodeId)
          : null,
        rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
        invNo: invNo ? invNo : undefined,
      },
    });
    await tx.stockSummary.upsert({
      where: {
        branchId_barcodeId: {
          branchId: parseInt(branchId),
          barcodeId: parseInt(itemDetails.barcodeId),
        },
      },
      update: {
        qty: { increment: qty },
      },
      create: {
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
        barcodeNo: itemDetails?.barcodeNo ?? undefined,
        barcodeId: parseInt(itemDetails.barcodeId),
        rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
      },
    });
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
  validateUniqueBarcode(purchaseBillItems);
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
      const removedStockItems = await tx.purchaseBillItems.findMany({
        where: { id: { in: removeItemsIds } },
      });
      for (const item of removedStockItems) {
        await tx.stockSummary.updateMany({
          where: {
            branchId: parseInt(branchId), // ✅ FIXED
            barcodeId: parseInt(item.barcodeId), // ✅ FIXED
          },
          data: {
            qty: { decrement: item.qty || 0 },
          },
        });
      }
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
      dcNo,
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
    const qty = itemDetails?.qty ? Math.round(parseFloat(itemDetails.qty)) : 0;

    const newBarcodeId = itemDetails?.barcodeId
      ? parseInt(itemDetails.barcodeId)
      : null;

    if (itemDetails.id) {
      // 🔹 Get old item
      const oldItem = await tx.purchaseBillItems.findUnique({
        where: { id: parseInt(itemDetails.id) },
      });

      if (!oldItem) return null;

      const oldBarcodeId = oldItem?.barcodeId
        ? parseInt(oldItem.barcodeId)
        : null;

      const oldQty = oldItem?.qty || 0;

      // 🔹 Update purchaseBillItem
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
          invNo,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          barcodeId: itemDetails?.barcodeId
            ? parseInt(itemDetails.barcodeId)
            : null,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          discountType: itemDetails?.discountType ?? undefined,
          discountValue: itemDetails?.discountValue
            ? parseInt(itemDetails.discountValue)
            : null,
          taxPercent: itemDetails?.taxPercent
            ? parseInt(itemDetails.taxPercent)
            : null,
          dcNo: dcNo ?? undefined,
        },
      });

      // 🔹 Update or Create Stock Ledger
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
            barcodeId: itemDetails?.barcodeId
              ? parseInt(itemDetails.barcodeId)
              : null,
            rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
            invNo: invNo ?? undefined,
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
            invNo: invNo ?? undefined,
            barcodeId: itemDetails?.barcodeId
              ? parseInt(itemDetails.barcodeId)
              : null,
          },
        });
      }

      // 🔹 STOCK SUMMARY LOGIC

      const newQty = qty;

      if (oldBarcodeId && newBarcodeId && oldBarcodeId === newBarcodeId) {
        const qtyDifference = newQty - oldQty;

        await tx.stockSummary.upsert({
          where: {
            branchId_barcodeId: {
              branchId: parseInt(branchId),
              barcodeId: newBarcodeId,
            },
          },
          update: {
            qty: { increment: qtyDifference },
          },
          create: {
            createdById: parseInt(userId),
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
            qty: qtyDifference,
            barcodeId: newBarcodeId,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          },
        });
      } else {
        // Decrement old barcode
        if (oldBarcodeId) {
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

        // Increment new barcode
        if (newBarcodeId) {
          await tx.stockSummary.upsert({
            where: {
              branchId_barcodeId: {
                branchId: parseInt(branchId),
                barcodeId: newBarcodeId,
              },
            },
            update: {
              qty: { increment: newQty },
            },
            create: {
              createdById: parseInt(userId),
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
              qty: newQty,
              barcodeId: newBarcodeId,
              barcodeNo: itemDetails?.barcodeNo ?? undefined,
              rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
            },
          });
        }
      }

      return updatedItem;
    } else {
      // 🔹 CREATE NEW ITEM

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
          invNo,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          discountType: itemDetails?.discountType ?? undefined,
          discountValue: itemDetails?.discountValue
            ? parseInt(itemDetails.discountValue)
            : null,
          taxPercent: itemDetails?.taxPercent
            ? parseInt(itemDetails.taxPercent)
            : null,
          dcNo: dcNo ?? undefined,
          barcodeId: itemDetails?.barcodeId
            ? parseInt(itemDetails.barcodeId)
            : null,
        },
      });

      await tx.stockLedger.create({
        data: {
          inOrOut: "In",
          refType: "PurchaseBill",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          PurchaseBillItemsId: createdItem.id,
          styleId: itemDetails?.styleId ? parseInt(itemDetails.styleId) : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          qty,
          barcodeNo: itemDetails?.barcodeNo ?? undefined,
          barcodeId: itemDetails?.barcodeId
            ? parseInt(itemDetails.barcodeId)
            : null,
          rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
          invNo: invNo ?? undefined,
        },
      });

      if (newBarcodeId) {
        await tx.stockSummary.upsert({
          where: {
            branchId_barcodeId: {
              branchId: parseInt(branchId),
              barcodeId: newBarcodeId,
            },
          },
          update: {
            qty: { increment: qty },
          },
          create: {
            createdById: parseInt(userId),
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
            barcodeId: newBarcodeId,
            barcodeNo: itemDetails?.barcodeNo ?? undefined,
            rate: itemDetails?.rate ? parseInt(itemDetails.rate) : null,
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
    const singleData = await tx.purchaseBill.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        purchaseBillItems: true,
      },
    });
    for (const item of singleData.purchaseBillItems) {
      await tx.stockSummary.deleteMany({
        where: {
          barcodeId: item.barcodeId,
          branchId: singleData.branchId,
        },
      });
    }
    const data = await tx.purchaseBill.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { statusCode: 0, data };
  });
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

async function getpurchaseBillItems(req) {
  const {
    branchId,
    active,
    pagination,
    dataPerPage,
    searchDocId,
    searchDocDate,
    searchinvDate,
    invNo,
  } = req.query;

  let data;
  let totalCount;
  const headerData = invNo
    ? await prisma.purchaseBill.findFirst({
        where: { invNo: invNo },
      })
    : null;
  if (pagination) {
    data = await prisma.purchaseBillItems.findMany({
      where: {
        PurchaseBill: {
          docId: Boolean(searchDocId)
            ? {
                contains: searchDocId,
              }
            : undefined,
          supplierId: headerData?.supplierId
            ? parseInt(headerData.supplierId)
            : undefined,
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

    if (headerData?.supplierId) {
      data = data?.filter(
        (i) => i.PurchaseBill.supplierId == headerData.supplierId,
      );
    }

    data = await getAllDatapurchaseBillItems(data);
  } else {
    data = await prisma.purchaseBillItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }
  return {
    statusCode: 0,
    data,
    totalCount,
    supplierId: headerData?.supplierId || null,
  };
}

async function getBarcodeDetail(req) {
  const { barcodeNo } = req.query;

  // 1️⃣ First try fetching by styleNo
  let data = await prisma.barcode.findUnique({
    where: {
      barcodeNo: barcodeNo,
    },
  });

  // 2️⃣ If no data found, try fetching by barCode
  if (!data || data.length === 0 || data === null) {
    return ErrorResponse("Failed to fetch barcode details");
  }

  const style = await prisma.style.findUnique({
    where: {
      id: data.styleId,
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
    statusCode: 0,
    data: {
      ...data,
      rate: style?.salesPrice ?? null,
      qty: 1,
      taxPercent: style?.Hsn?.taxPerc ?? 5,
    },
  };
}

export {
  get,
  getOne,
  create,
  update,
  remove,
  getpurchaseBillItems,
  getBarcodeDetail,
};
