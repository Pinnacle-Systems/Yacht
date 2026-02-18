import { prisma } from "../lib/prisma.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { NoRecordFound } from "../configs/Responses.js";

async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  saveType,
  docId,
  isUpdate,
) {
  // Case 1: Draft save
  if (saveType) {
    return "Draft Save";
  } else if (isUpdate === "drift") {
    lastObject = await prisma.purchaseReturnShowRoom.findFirst({
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
      new Date(),
    )}/PR/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PR/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.purchaseReturnShowRoom.findFirst({
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
      new Date(),
    )}/PR/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PR/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }
    return newDocId;
  }
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchInvNo,
    finYearId,
    searchSupplier,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime,
  );
  let data;
  let totalCount;
  data = await prisma.purchaseReturnShowRoom.findMany({
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
      invNo: Boolean(searchInvNo) ? { contains: searchInvNo } : undefined,
      Supplier: {
        name: searchSupplier ? { contains: searchSupplier } : undefined,
      },
    },
    include: {
      purchasReturnItemsSRs: true,
      Supplier: {
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
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate),
    );
  }
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage,
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
  const data = await prisma.purchaseReturnShowRoom.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      purchasReturnItemsSRs: true,
      Supplier: true,
    },
  });
  if (!data) return NoRecordFound("purchaseReturnShowRoom");
  const purchaseReturnStkQty = await Promise.all(
    data.purchasReturnItemsSRs?.map(async (item) => {
      const stkQty = await prisma.stockLedger.aggregate({
        where: {
          styleId: item.styleId,
          styleItemId: item.styleItemId,
          sizeId: item.sizeId,
          uomId: item.uomId,
          barcodeNo: item.barcodeNo,
        },
        _sum: {
          qty: true,
        },
      });
      return {
        ...item,
        stkQty: stkQty._sum.qty + item.returnQty,
      };
    }),
  );

  return {
    statusCode: 0,
    data: {
      ...data,
      purchasReturnItemsSR: purchaseReturnStkQty,
      ...{ childRecord },
    },
  };
}

function validateUniqueBarcode(purchaseReturnItems) {
  const seen = new Set();

  for (let i = 0; i < purchaseReturnItems.length; i++) {
    const barcodeId = purchaseReturnItems[i]?.barcodeId;

    if (!barcodeId) continue; // skip empty if needed

    if (seen.has(barcodeId)) {
      throw new Error(
        `Duplicate Barcode No ${purchaseReturnItems[i].barcodeNo} found in row ${i + 1}`,
      );
    }

    seen.add(barcodeId);
  }
}

async function create(body) {
  const {
    userId,
    branchId,
    docDate,
    supplierId,
    contactPerson,
    contactNumber,
    purchaseReturnItems,
    invNo,
    termsAndCondition,
    remarks,
    finYearId,
    draftSave,
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
    draftSave,
  );
  let data;
  validateUniqueBarcode(purchaseReturnItems);
  await prisma.$transaction(async (tx) => {
    data = await tx.purchaseReturnShowRoom.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        supplierId: parseInt(supplierId),
        invNo,
        contactPerson,
        contactNumber,
        remarks,
        termsAndCondition,
      },
    });
    await createPurchaseReturnItems(
      tx,
      purchaseReturnItems,
      data,
      userId,
      branchId,
      invNo,
    );
  });
  return { statusCode: 0, data };
}

async function createPurchaseReturnItems(
  tx,
  purchaseReturnItems,
  purchaseReturn,
  userId,
  branchId,
  invNo,
) {
  const promises = purchaseReturnItems.map(async (stockDetail, index) => {
    const returnQty = stockDetail?.returnQty
      ? Math.abs(parseFloat(stockDetail.returnQty))
      : 0;

    const barcodeId = stockDetail?.barcodeId
      ? parseInt(stockDetail.barcodeId)
      : null;
    const createdItem = await tx.purchasReturnItemsSR.create({
      data: {
        purchaseReturnShowRoomId: parseInt(purchaseReturn.id),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
        invNo: invNo ? invNo : "",
        returnQty,
        barcodeNo: stockDetail?.barcodeNo ?? undefined,
        barcodeId,
        purchaseBillId: stockDetail?.purchaseBillId
          ? parseInt(stockDetail.purchaseBillId)
          : null,
      },
    });

    // Create corresponding Stock row
    await tx.stockLedger.create({
      data: {
        inOrOut: "Out",
        refType: "PurchaseReturn",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
        qty: -returnQty,
        purchasReturnItemsSRId: createdItem.id,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        barcodeNo: stockDetail?.barcodeNo ?? undefined,
        barcodeId,
        invNo: invNo ? invNo : undefined,
      },
    });
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

    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, purchaseReturnItems) {
  let removedItems = dataFound.purchasReturnItemsSRs.filter((oldItem) => {
    let result = purchaseReturnItems.find(
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
    invNo,
    supplierId,
    contactPerson,
    contactNumber,
    termsAndCondition,
    remarks,
    purchaseReturnItems,
  } = await body;
  let data;
  validateUniqueBarcode(purchaseReturnItems);

  const dataFound = await prisma.purchaseReturnShowRoom.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      purchasReturnItemsSRs: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("Purchase Return ShowRoom");

  let removedItems = findRemovedItems(dataFound, purchaseReturnItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    if (removeItemsIds.length > 0) {
      const removedItemsData = await tx.purchasReturnItemsSR.findMany({
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
              qty: { increment: returnQty },
              updatedById: parseInt(userId),
            },
          });
        }
      }
      await tx.purchasReturnItemsSR.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.purchaseReturnShowRoom.update({
      where: {
        id: parseInt(id),
      },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        supplierId: parseInt(supplierId),
        invNo,
        contactPerson,
        contactNumber,
        remarks,
        termsAndCondition,
      },
    });
    await updatePurchaseReturnItems(
      tx,
      purchaseReturnItems,
      data,
      userId,
      branchId,
      invNo,
    );
  });
  return { statusCode: 0, data };
}

async function updatePurchaseReturnItems(
  tx,
  purchaseReturnItems,
  purchaseReturn,
  userId,
  branchId,
  invNo,
) {
  const promises = purchaseReturnItems.map(async (stockDetail) => {
    const returnQty = stockDetail?.returnQty
      ? Math.abs(parseFloat(stockDetail.returnQty))
      : 0;
    const barcodeId = stockDetail?.barcodeId
      ? parseInt(stockDetail.barcodeId)
      : null;
    if (stockDetail.id) {
      const oldItem = await tx.purchasReturnItemsSR.findUnique({
        where: { id: parseInt(stockDetail.id) },
      });
      // Update existing OpeningStockItem
      const updatedItem = await tx.purchasReturnItemsSR.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          purchaseReturnShowRoomId: parseInt(purchaseReturn.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          returnQty,
          invNo: invNo ? invNo : "",
          barcodeNo: stockDetail?.barcodeNo ?? undefined,
          barcodeId,
          purchaseBillId: stockDetail?.purchaseBillId
            ? parseInt(stockDetail.purchaseBillId)
            : null,
        },
      });

      // Update or create Stock row
      const existingStock = await tx.stockLedger.findFirst({
        where: { purchasReturnItemsSRId: updatedItem.id },
      });

      if (existingStock) {
        await tx.stockLedger.update({
          where: { id: existingStock.id },
          data: {
            updatedById: parseInt(userId),
            branchId: parseInt(branchId),

            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
            qty: -returnQty,
            barcodeNo: stockDetail?.barcodeNo ?? undefined,
            barcodeId,
            invNo: invNo ? invNo : undefined,
          },
        });
      } else {
        await tx.stockLedger.create({
          data: {
            inOrOut: "Out",
            refType: "PurchaseReturn",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
            qty: -returnQty,
            purchasReturnItemsSRId: updatedItem.id,
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
            barcodeNo: stockDetail?.barcodeNo ?? undefined,
            barcodeId,
            invNo: invNo ? invNo : undefined,
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
      // Create new OpeningStockItem
      const createdItem = await tx.purchasReturnItemsSR.create({
        data: {
          purchaseReturnShowRoomId: parseInt(purchaseReturn.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          returnQty,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleNo: stockDetail?.styleNo ?? undefined,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          invNo: invNo ? invNo : "",
          barcodeNo: stockDetail?.barcodeNo ?? undefined,
          barcodeId,
          purchaseBillId: stockDetail?.purchaseBillId
            ? parseInt(stockDetail.purchaseBillId)
            : null,
        },
      });

      // Create Stock row
      await tx.stockLedger.create({
        data: {
          inOrOut: "Out",
          refType: "PurchaseReturn",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          invNo: invNo ? invNo : undefined,
          qty: -returnQty,
          purchasReturnItemsSRId: createdItem.id,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          barcodeNo: stockDetail?.barcodeNo ?? undefined,
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
            qty: { decrement: returnQty },
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
    const singleData = await tx.purchaseReturnShowRoom.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        purchasReturnItemsSRs: true,
      },
    });
    for (const item of singleData.purchasReturnItemsSRs) {
      await tx.stockSummary.updateMany({
        where: {
          barcodeId: item.barcodeId,
          branchId: singleData.branchId,
        },
        data: {
          qty: {
            increment: item.returnQty || 0,
          },
        },
      });
    }
    const data = await tx.purchaseReturnShowRoom.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { statusCode: 0, data };
  });
}

export { remove, get, getOne, create, update };
