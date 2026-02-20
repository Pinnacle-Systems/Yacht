import { CustomError, NoRecordFound } from "../configs/Responses.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { prisma } from "../lib/prisma.js";

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
    lastObject = await prisma.openingStockSR.findFirst({
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
    )}/OS/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/OS/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.openingStockSR.findFirst({
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
    )}/OS/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/OS/${
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
    finYearId,
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
  data = await prisma.openingStockSR.findMany({
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
    },
    include: {
      openingStockItemsSRs: true,
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
  const data = await prisma.openingStockSR.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      openingStockItemsSRs: true,
    },
  });
  if (!data) return NoRecordFound("Opening Stock");
  const openingWithStkQty = await Promise.all(
    data.openingStockItemsSRs.map(async (item) => {
      const barcodes = await prisma.barcode.findMany({
        where: {
          openingStockItemsSRId: item.id,
        },
      });
      const barcodeIds = barcodes.map((item) => item.id);
      const usedBarcodes = await prisma.salesBillItems.aggregate({
        where: {
          barcodeId: { in: barcodeIds },
        },
        _sum: {
          qty: true,
        },
      });
      return {
        ...item,
        usedQty: usedBarcodes._sum.qty,
      };
    }),
  );
  const openingStockItemsIds = data.openingStockItemsSRs
    .map((item) => item.id)
    .filter(Boolean);
  const barcodes = await prisma.barcode.findMany({
    where: {
      openingStockItemsSRId: { in: openingStockItemsIds },
    },
  });
  const barcodeWithRate = await Promise.all(
    barcodes.map(async (barcode) => {
      const style = await prisma.style.findUnique({
        where: {
          id: barcode.styleId,
        },
      });
      return {
        barcodeNo: barcode.barcodeNo,
        styleId: barcode.styleId,
        styleItemId: barcode.styleItemId,
        sizeId: barcode.sizeId,
        colorId: barcode.colorId,
        openingStockItemsSRId: barcode.openingStockItemsSRId,
        rate: style?.salesPrice || null,
        qty: 1,
        barcodeId: barcode.id,
      };
    }),
  );
  const childRecordSales = openingWithStkQty.reduce(
    (sum, item) => sum + item.usedQty,
    0,
  );

  return {
    statusCode: 0,
    data: {
      ...data,
      barcodes: barcodeWithRate,
      openingStockItemsSRs: openingWithStkQty,
      childRecordSales: childRecordSales
    },
  };
}

async function create(body) {
  const { userId, branchId, openingStockItems, finYearId, docDate } =
    await body;
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
    data = await tx.openingStockSR.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        createdById: parseInt(userId),
        docDate: docDate ? new Date(docDate) : null,
      },
    });
    await createOpeningStockItems(
      tx,
      openingStockItems,
      data,
      userId,
      branchId,
    );
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { branchId, openingStockItems, userId, docDate } = await body;
  let data;
  const dataFound = await prisma.openingStockSR.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      openingStockItemsSRs: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("OpeningStockSR");
  let removedItems = findRemovedItems(dataFound, openingStockItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    if (removeItemsIds.length > 0) {
      const barcodes = await tx.barcode.findMany({
        where: { openingStockItemsSRId: { in: removeItemsIds } },
      });
      const barcodeIds = barcodes.map((b) => b.id);
      await tx.stockSummary.deleteMany({
        where: { barcodeId: { in: barcodeIds } },
      });
      await tx.barcode.deleteMany({
        where: { id: { in: barcodeIds } },
      });
      await tx.openingStockItemsSR.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.openingStockSR.update({
      where: {
        id: parseInt(id),
      },
      data: {
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        docDate: docDate ? new Date(docDate) : null,
      },
    });
    await updateOpeningStockItems(
      tx,
      openingStockItems,
      data,
      userId,
      branchId,
    );
  });
  return { statusCode: 0, data };
}

async function updateOpeningStockItems(
  tx,
  openingStockItems,
  openingStock,
  userId,
  branchId,
) {
  for (const item of openingStockItems) {
    const qty = item?.qty ? Math.round(parseFloat(item.qty)) : 0;
    if (item.id) {
      const updatedItem = await tx.openingStockItemsSR.update({
        where: { id: parseInt(item.id) },
        data: {
          openingStockSRId: parseInt(openingStock.id),
          styleId: item?.styleId ? parseInt(item.styleId) : null,
          sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
          colorId: item?.colorId ? parseInt(item.colorId) : null,
          qty,
          // remarks: item ?.remarks ? item ?.remarks : undefined,
          styleItemId: item?.styleItemId ? parseInt(item.styleItemId) : null,
          uomId: item?.uomId ? parseInt(item.uomId) : null,
        },
      });
      const existingBarcodes = await tx.barcode.findMany({
        where: {
          openingStockItemsSRId: updatedItem.id,
        },
        orderBy: { id: "asc" },
      });
      const existingCount = existingBarcodes.length;
      if (qty > existingCount) {
        const diff = qty - existingCount;

        const barcodeSeq = await tx.barcodeSequence.findFirst({
          where: {
            // companyId: parseInt(companyId),
            active: true,
          },
        });

        if (!barcodeSeq) {
          CustomError("No active barcode sequence found for the Branch");
        }

        for (let i = 0; i < diff; i++) {
          const lastBarcode = await tx.barcode.findFirst({
            where: {
              barcodeSeqId: parseInt(barcodeSeq.id),
            },
            orderBy: {
              id: "desc",
            },
          });

          const fullPrefix = barcodeSeq.prefix + barcodeSeq.code;

          let nextNumber = lastBarcode
            ? parseInt(lastBarcode.barcodeNo.substring(fullPrefix.length)) + 1
            : barcodeSeq.seqStart;

          const newBarcode =
            fullPrefix + nextNumber.toString().padStart(barcodeSeq.digits, "0");

          const saved = await tx.barcode.create({
            data: {
              barcodeNo: newBarcode,
              openingStockItemsSRId: updatedItem.id,
              barcodeSeqId: barcodeSeq.id,
              styleId: item?.styleId ? parseInt(item.styleId) : null,
              sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
              colorId: item?.colorId ? parseInt(item.colorId) : null,
              styleItemId: item?.styleItemId
                ? parseInt(item.styleItemId)
                : null,
              branchId: parseInt(branchId),
              uomId: item?.uomId ? parseInt(item.uomId) : null,
            },
          });
          await createLedgerAndSummary(
            tx,
            saved,
            updatedItem,
            userId,
            branchId,
          );
        }
      }

      // 🔹 CASE 2: Qty Decreased → Delete Extra Barcodes
      if (qty < existingCount) {
        const diff = existingCount - qty;
        const toDelete = existingBarcodes.slice(-diff);

        const barcodeIds = toDelete.map((b) => b.id);
        await tx.stockLedger.deleteMany({
          where: { barcodeId: { in: barcodeIds } },
        });
        await tx.stockSummary.deleteMany({
          where: { barcodeId: { in: barcodeIds } },
        });

        await tx.barcode.deleteMany({
          where: { id: { in: barcodeIds } },
        });
      }
    } else {
      const createdItem = await tx.openingStockItemsSR.create({
        data: {
          openingStockSRId: parseInt(openingStock.id),
          styleId: item?.styleId ? parseInt(item.styleId) : null,
          sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
          colorId: item?.colorId ? parseInt(item.colorId) : null,
          qty,
          // remarks: item ?.remarks ? item ?.remarks : undefined,
          styleItemId: item?.styleItemId ? parseInt(item.styleItemId) : null,
          uomId: item?.uomId ? parseInt(item.uomId) : null,
        },
      });
      const barcodeSeq = await tx.barcodeSequence.findFirst({
        where: {
          // companyId: parseInt(companyId),
          active: true,
        },
      });
      if (!barcodeSeq) {
        CustomError("No active barcode sequence found for the Branch");
      }
      for (let i = 0; i < qty; i++) {
        const lastBarcode = await tx.barcode.findFirst({
          where: {
            barcodeSeqId: parseInt(barcodeSeq.id),
          },
          orderBy: {
            id: "desc",
          },
        });
        const fullPrefix = barcodeSeq.prefix + barcodeSeq.code;
        let nextNumber = lastBarcode
          ? parseInt(lastBarcode.barcodeNo.substring(fullPrefix.length)) + 1
          : barcodeSeq.seqStart;

        const newBarcode =
          fullPrefix + nextNumber.toString().padStart(barcodeSeq.digits, "0");

        const saved = await tx.barcode.create({
          data: {
            barcodeNo: newBarcode,
            openingStockItemsSRId: createdItem.id,
            barcodeSeqId: barcodeSeq.id,
            styleId: item?.styleId ? parseInt(item.styleId) : null,
            sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
            colorId: item?.colorId ? parseInt(item.colorId) : null,
            styleItemId: item?.styleItemId ? parseInt(item.styleItemId) : null,
            branchId: parseInt(branchId),
            uomId: item?.uomId ? parseInt(item.uomId) : null,
          },
        });
        await createLedgerAndSummary(tx, saved, createdItem, userId, branchId);
      }
    }
  }
}

async function createLedgerAndSummary(tx, barcode, item, userId, branchId) {
  await tx.stockLedger.create({
    data: {
      inOrOut: "In",
      refType: "OpeningStock",
      createdById: parseInt(userId),
      branchId: parseInt(branchId),
      styleId: item.styleId,
      sizeId: item.sizeId,
      colorId: item.colorId,
      styleItemId: item.styleItemId,
      uomId: item.uomId,
      qty: 1,
      openingStockItemsSRId: item.id,
      barcodeId: barcode.id,
      barcodeNo: barcode.barcodeNo,
    },
  });

  await tx.stockSummary.upsert({
    where: {
      branchId_barcodeId: {
        branchId: parseInt(branchId),
        barcodeId: barcode.id,
      },
    },
    update: { qty: { increment: 1 } },
    create: {
      branchId: parseInt(branchId),
      createdById: parseInt(userId),
      styleId: item.styleId,
      sizeId: item.sizeId,
      colorId: item.colorId,
      styleItemId: item.styleItemId,
      uomId: item.uomId,
      qty: 1,
      barcodeId: barcode.id,
      barcodeNo: barcode.barcodeNo,
    },
  });
}

async function createOpeningStockItems(
  tx,
  openingStockItems,
  openingStock,
  userId,
  branchId,
) {
  for (const itemDetail of openingStockItems) {
    const qty = itemDetail?.qty ? Math.round(parseFloat(itemDetail.qty)) : 0;
    const createdItem = await tx.openingStockItemsSR.create({
      data: {
        openingStockSRId: parseInt(openingStock.id),
        styleId: itemDetail?.styleId ? parseInt(itemDetail.styleId) : null,
        sizeId: itemDetail?.sizeId ? parseInt(itemDetail.sizeId) : null,
        colorId: itemDetail?.colorId ? parseInt(itemDetail.colorId) : null,
        qty,
        // remarks: itemDetail?.remarks ? itemDetail?.remarks : undefined,
        styleItemId: itemDetail?.styleItemId
          ? parseInt(itemDetail.styleItemId)
          : null,
        uomId: itemDetail?.uomId ? parseInt(itemDetail.uomId) : null,
      },
    });
    const barcodeSeq = await tx.barcodeSequence.findFirst({
      where: {
        // companyId: parseInt(companyId),
        active: true,
      },
    });
    if (!barcodeSeq) {
      CustomError("No active barcode sequence found for the Branch");
    }
    for (let i = 0; i < qty; i++) {
      const lastBarcode = await tx.barcode.findFirst({
        where: {
          barcodeSeqId: parseInt(barcodeSeq.id),
        },
        orderBy: {
          id: "desc",
        },
      });
      const fullPrefix = barcodeSeq.prefix + barcodeSeq.code;
      let nextNumber;
      if (lastBarcode) {
        const lastValue = lastBarcode.barcodeNo;

        // Remove prefix+code
        const numberPart = lastValue.substring(fullPrefix.length);

        nextNumber = parseInt(numberPart) + 1;
      } else {
        nextNumber = barcodeSeq.seqStart;
      }

      const paddedNumber = nextNumber
        .toString()
        .padStart(barcodeSeq.digits, "0");

      const newBarcode = fullPrefix + paddedNumber;
      const saveBarcode = await tx.barcode.create({
        data: {
          barcodeNo: newBarcode,
          openingStockItemsSRId: createdItem.id,
          barcodeSeqId: barcodeSeq.id,
          styleId: itemDetail?.styleId ? parseInt(itemDetail.styleId) : null,
          sizeId: itemDetail?.sizeId ? parseInt(itemDetail.sizeId) : null,
          colorId: itemDetail?.colorId ? parseInt(itemDetail.colorId) : null,
          styleItemId: itemDetail?.styleItemId
            ? parseInt(itemDetail.styleItemId)
            : null,
          branchId: parseInt(branchId),
          uomId: itemDetail?.uomId ? parseInt(itemDetail.uomId) : null,
        },
      });
      await tx.stockLedger.create({
        data: {
          inOrOut: "In",
          refType: "OpeningStock",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          styleId: itemDetail?.styleId ? parseInt(itemDetail.styleId) : null,
          sizeId: itemDetail?.sizeId ? parseInt(itemDetail.sizeId) : null,
          colorId: itemDetail?.colorId ? parseInt(itemDetail.colorId) : null,
          uomId: itemDetail?.uomId ? parseInt(itemDetail.uomId) : null,
          qty: 1,
          openingStockItemsSRId: createdItem.id,
          styleItemId: itemDetail?.styleItemId
            ? parseInt(itemDetail.styleItemId)
            : null,
          barcodeNo: saveBarcode?.barcodeNo ?? undefined,
          barcodeId: saveBarcode?.id ? parseInt(saveBarcode.id) : null,
        },
      });
      await tx.stockSummary.upsert({
        where: {
          branchId_barcodeId: {
            branchId: parseInt(branchId),
            barcodeId: saveBarcode.id,
          },
        },
        update: {
          qty: { increment: 1 },
        },
        create: {
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          styleId: itemDetail?.styleId ? parseInt(itemDetail.styleId) : null,
          sizeId: itemDetail?.sizeId ? parseInt(itemDetail.sizeId) : null,
          colorId: itemDetail?.colorId ? parseInt(itemDetail.colorId) : null,
          uomId: itemDetail?.uomId ? parseInt(itemDetail.uomId) : null,
          styleItemId: itemDetail?.styleItemId
            ? parseInt(itemDetail.styleItemId)
            : null,
          qty: 1,
          barcodeNo: saveBarcode?.barcodeNo ?? undefined,
          barcodeId: saveBarcode.id,
        },
      });
    }
  }
}

function findRemovedItems(dataFound, openingStockItems) {
  let removedItems = dataFound.openingStockItemsSRs.filter((oldItem) => {
    let result = openingStockItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function remove(id) {
  return await prisma.$transaction(async (tx) => {
    const singleData = await tx.openingStockSR.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        openingStockItemsSRs: true,
      },
    });
    const openingStockItemsIds = singleData.openingStockItemsSRs
      .map((item) => item.id)
      .filter(Boolean);
    const barcodes = await tx.barcode.findMany({
      where: {
        openingStockItemsSRId: { in: openingStockItemsIds },
      },
    });
    const barcodeIds = barcodes.map((item) => item.id);
    await tx.stockSummary.deleteMany({
      where: {
        barcodeId: { in: barcodeIds },
        branchId: singleData.branchId,
      },
    });
    const data = await tx.openingStockSR.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { statusCode: 0, data };
  });
}

export { get, getOne, create, update, remove };
