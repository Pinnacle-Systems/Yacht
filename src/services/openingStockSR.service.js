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
  const salesWithStkQty = await Promise.all(
    data.openingStockItemsSRs.map(async (item) => {
      const totalStkQty = await prisma.stock.aggregate({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          storeId: data.storeId,
          styleItemId: item.styleItemId,
          fabricId: item.fabricId,
        },
        _sum: {
          qty: true,
        },
      });
      const salesReturn = await prisma.salesReturn.findMany({
        where: {
          invNo: data.docId,
        },
      });
      const salesReturnIds = salesReturn.map((sr) => sr.id);
      const totalReturnQty = await prisma.salesReturnItems.count({
        where: {
          salesReturnId: { in: salesReturnIds },
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
        },
      });
      const usedQty = await prisma.salesReturnItems.aggregate({
        where: {
          salesReturnId: { in: salesReturnIds },
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
        },
        _sum: {
          returnQty: true,
        },
      });
      const barcodes = await prisma.barcode.findMany({
        where: {
          openingStockItemsId: item.id,
        },
      });
      const barcodeIds = barcodes.map((item) => item.id);
      const usedBarcodes = await prisma.purchaseBillItems.aggregate({
        where: {
          barcodeId: { in: barcodeIds },
        },
        _sum: {
          qty: true,
        },
      });
      return {
        ...item,
        stkQty: totalStkQty._sum.qty + item.qty,
        returnQty: totalReturnQty + usedBarcodes._sum.qty,
        usedQty: usedQty._sum.returnQty + usedBarcodes._sum.qty,
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
  const childRecordReturn = await prisma.salesReturn.count({
    where: {
      invNo: { in: data.docId },
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
      openingStockItems: salesWithStkQty,
      childRecordReturn: childRecordReturn,
      childRecordSRInward: childRecordSRInward,
      barcodes: barcodeWithRate,
    },
  };
}

async function create(body) {
  const { userId, branchId, openingStockItems, finYearId, docDate, draftSave } =
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
    draftSave,
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
  const {
    branchId,
    openingStockItems,
    userId,
    storeId,
    docDate,
    locationId,
    customerId,
    contactPerson,
    contactNumber,
    taxTemplateId,
    destinationId,
    salesType,
    overAllDisc,
    roundOff,
    companyId,
  } = await body;
  let data;
  const dataFound = await prisma.salesEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      openingStockItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("salesEntry");
  let removedItems = findRemovedItems(dataFound, openingStockItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.openingStockItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.salesEntry.update({
      where: {
        id: parseInt(id),
      },
      data: {
        storeId: parseInt(storeId),
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        docDate: docDate ? new Date(docDate) : null,
        locationId: parseInt(locationId),
        customerId: parseInt(customerId),
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        contactPerson,
        contactNumber,
        destinationId: destinationId ? parseInt(destinationId) : null,
        salesType,
        overAllDisc: overAllDisc ? parseInt(overAllDisc) : null,
        roundOff: roundOff ? parseInt(roundOff) : null,
      },
    });
    await updateopeningStockItems(
      tx,
      openingStockItems,
      data,
      userId,
      branchId,
      storeId,
      salesType,
      companyId,
    );
  });
  return { statusCode: 0, data };
}

async function updateopeningStockItems(
  tx,
  openingStockItems,
  salesEntry,
  userId,
  branchId,
  storeId,
  salesType,
  companyId,
) {
  for (const stockDetail of openingStockItems) {
    const qty =
      stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
        ? -Math.abs(parseInt(stockDetail.qty))
        : null;

    if (stockDetail.id) {
      const updatedItem = await tx.openingStockItemsSR.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          salesEntryId: parseInt(salesEntry.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          stkQty:
            stockDetail?.stkQty && !isNaN(parseFloat(stockDetail.stkQty))
              ? Math.round(parseFloat(stockDetail.stkQty))
              : null,
          qty:
            stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
              ? Math.round(parseFloat(stockDetail.qty))
              : null,
          barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
          remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          price: stockDetail?.price ? parseInt(stockDetail.price) : null,
          disc: stockDetail?.disc ? parseInt(stockDetail.disc) : null,
          amount: stockDetail?.amount ? parseInt(stockDetail.amount) : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          discountType: stockDetail?.discountType
            ? stockDetail?.discountType
            : undefined,
          discountValue: stockDetail?.discountValue
            ? parseInt(stockDetail.discountValue)
            : null,
          taxPercent: stockDetail?.taxPercent
            ? parseInt(stockDetail.taxPercent)
            : null,
        },
      });

      const existingStock = await tx.stock.findFirst({
        where: { openingStockItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.stockLedger.update({
          where: { id: existingStock.id },
          data: {
            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            qty,
            barCode: stockDetail?.barcode,
            updatedById: parseInt(userId),
            styleNo: stockDetail?.styleNo ?? undefined,
            fabricId: stockDetail?.fabricId
              ? parseInt(stockDetail.fabricId)
              : null,
            price: stockDetail?.price ? parseInt(stockDetail.price) : null,
            storeId: parseInt(storeId),
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
          },
        });
      } else {
        await tx.stockLedger.create({
          data: {
            inOrOut: "SalesEntry",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            storeId: parseInt(storeId),
            styleId: stockDetail?.styleId
              ? parseInt(stockDetail.styleId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            qty,
            openingStockItemsId: updatedItem.id,
            barCode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
            styleNo: stockDetail?.styleNo ?? undefined,
            fabricId: stockDetail?.fabricId
              ? parseInt(stockDetail.fabricId)
              : null,
            price: stockDetail?.price ? parseInt(stockDetail.price) : null,
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
          },
        });
      }
      if (salesType === "RETAIL") {
        const newQty = stockDetail?.qty ? parseInt(stockDetail.qty) : 0;
        const existingBarcodes = await tx.barcode.findMany({
          where: {
            openingStockItemsId: updatedItem.id,
          },
          orderBy: { id: "asc" },
        });
        const existingCount = existingBarcodes.length;
        if (newQty > existingCount) {
          const diff = newQty - existingCount;

          const barcodeSeq = await tx.barcodeSequence.findFirst({
            where: {
              companyId: parseInt(companyId),
              active: true,
            },
          });

          if (!barcodeSeq) {
            CustomError("No active barcode sequence found for the company");
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

            let nextNumber;

            if (lastBarcode) {
              const lastValue = lastBarcode.barcodeNo;
              const numberPart = lastValue.substring(fullPrefix.length);
              nextNumber = parseInt(numberPart) + 1;
            } else {
              nextNumber = barcodeSeq.seqStart;
            }

            const paddedNumber = nextNumber
              .toString()
              .padStart(barcodeSeq.digits, "0");

            const newBarcode = fullPrefix + paddedNumber;

            await tx.barcode.create({
              data: {
                barcodeNo: newBarcode,
                openingStockItemsId: updatedItem.id,
                barcodeSeqId: barcodeSeq.id,
                styleId: stockDetail?.styleId
                  ? parseInt(stockDetail.styleId)
                  : null,
                sizeId: stockDetail?.sizeId
                  ? parseInt(stockDetail.sizeId)
                  : null,
                colorId: stockDetail?.colorId
                  ? parseInt(stockDetail.colorId)
                  : null,
                styleItemId: stockDetail?.styleItemId
                  ? parseInt(stockDetail.styleItemId)
                  : null,
                branchId: parseInt(branchId),
                uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
              },
            });
          }
        }

        // 🔹 CASE 2: Qty Decreased → Delete Extra Barcodes
        else if (newQty < existingCount) {
          const diff = existingCount - newQty;

          const barcodesToDelete = existingBarcodes.slice(-diff);

          for (const bc of barcodesToDelete) {
            await tx.barcode.delete({
              where: { id: bc.id },
            });
          }
        }
      }
    } else {
      const createdItem = await tx.openingStockItemsSR.create({
        data: {
          salesEntryId: parseInt(salesEntry.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          stkQty:
            stockDetail?.stkQty && !isNaN(parseFloat(stockDetail.stkQty))
              ? Math.round(parseFloat(stockDetail.stkQty))
              : null,
          qty: stockDetail?.qty ? parseInt(stockDetail?.qty) : null,
          remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
          barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          price: stockDetail?.price ? parseInt(stockDetail.price) : null,
          disc: stockDetail?.disc ? parseInt(stockDetail.disc) : null,
          amount: stockDetail?.amount ? parseInt(stockDetail.amount) : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          discountType: stockDetail?.discountType
            ? stockDetail?.discountType
            : undefined,
          discountValue: stockDetail?.discountValue
            ? parseInt(stockDetail.discountValue)
            : null,
          taxPercent: stockDetail?.taxPercent
            ? parseInt(stockDetail.taxPercent)
            : null,
        },
      });
      await tx.stockLedger.create({
        data: {
          inOrOut: "SalesEntry",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty: createdItem.qty ? -Math.abs(createdItem.qty) : null,
          openingStockItemsId: createdItem.id,
          barCode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
        },
      });
      if (salesType === "RETAIL") {
        const barcodeSeq = await tx.barcodeSequence.findFirst({
          where: {
            companyId: parseInt(companyId),
            active: true,
          },
        });
        if (!barcodeSeq) {
          CustomError("No active barcode sequence found for the company");
        }
        const qty = stockDetail?.qty ? parseInt(stockDetail.qty) : 1;
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
          await tx.barcode.create({
            data: {
              barcodeNo: newBarcode,
              openingStockItemsId: createdItem.id,
              barcodeSeqId: barcodeSeq.id,
              styleId: stockDetail?.styleId
                ? parseInt(stockDetail.styleId)
                : null,
              sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
              colorId: stockDetail?.colorId
                ? parseInt(stockDetail.colorId)
                : null,
              styleItemId: stockDetail?.styleItemId
                ? parseInt(stockDetail.styleItemId)
                : null,
              branchId: parseInt(branchId),
              uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
            },
          });
        }
      }
    }
  }
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
        remarks: itemDetail?.remarks ? itemDetail?.remarks : undefined,
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
          barcodeId: saveBarcode?.id
            ? parseInt(saveBarcode.id)
            : null,
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
  let removedItems = dataFound.openingStockItems.filter((oldItem) => {
    let result = openingStockItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function remove(id) {
  const data = await prisma.salesEntry.delete({
    where: {
      id: parseInt(id),
    },
  });

  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove };
