import {
  CustomError,
  ErrorResponse,
  NoRecordFound,
} from "../configs/Responses.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { prisma } from "../lib/prisma.js";
import { io } from "../../server.js";

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
    lastObject = await prisma.salesEntry.findFirst({
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
    )}/SBE/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SBE/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.salesEntry.findFirst({
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
    )}/SBE/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/SBE/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }
    return newDocId;
  }
}

function manualFilterSearchData(searchDelDate, searchDueDate, data) {
  return data.filter(
    (item) =>
      (searchDelDate
        ? String(getDateFromDateTime(item.createdAt)).includes(searchDelDate)
        : true) &&
      (searchDueDate
        ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate)
        : true),
  );
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchStore,
    finYearId,
    searchType,
    searchCustomer,
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
  data = await prisma.salesEntry.findMany({
    where: {
      // branchId: branchId ? parseInt(branchId) : undefined,
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
      Store: {
        storeName: searchStore ? { contains: searchStore } : undefined,
      },
      Customer: {
        name: searchCustomer ? { contains: searchCustomer } : undefined,
      },
      salesType: searchType ? { contains: searchType } : undefined,
    },
    include: {
      Store: {
        select: {
          id: true,
          storeName: true,
        },
      },
      SalesEntryItems: true,
      Customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // 🔥 Descending Order
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

async function getSalesReport(req) {
  const { finYearId, branchId, storeId, fromDate, toDate, customerId } =
    req.query;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  let data;
  let totalCount;
  let totalAmount;
  const from = fromDate ? new Date(fromDate) : undefined;
  const to = toDate ? new Date(toDate) : undefined;
  if (to) to.setHours(23, 59, 59, 999);
  data = await prisma.salesEntry.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      storeId: storeId ? parseInt(storeId) : undefined,
      customerId: customerId ? parseInt(customerId) : undefined,
      // AND: finYearDate
      //   ? [
      //       {
      //         createdAt: {
      //           gte: finYearDate.startTime,
      //         },
      //       },
      //       {
      //         createdAt: {
      //           lte: finYearDate.endTime,
      //         },
      //       },
      //       {
      //         docDate: {
      //           gte: from,
      //           lte: to,
      //         },
      //       },
      //     ]
      //   : undefined,
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
            ...(from && to ? [{ docDate: { gte: from, lte: to } }] : []),
          ]
        : from && to
          ? [{ docDate: { gte: from, lte: to } }]
          : undefined,
    },
    include: {
      SalesEntryItems: true,
    },
  });
  totalCount = data.length;
  return {
    statusCode: 0,
    data,
    totalCount,
  };
}

async function getOne(id) {
  const data = await prisma.salesEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      Customer: true,
      SalesEntryItems: {
        select: {
          // Stock: true,
          id: true,
          salesEntryId: true,
          barcode: true,
          StyleItem: true,
          Size: true,
          Fabric: true,
          styleId: true,
          sizeId: true,
          qty: true,
          remarks: true,
          stkQty: true,
          styleNo: true,
          fabricId: true,
          disc: true,
          amount: true,
          price: true,
          styleItemId: true,
          discountType: true,
          taxPercent: true,
          discountValue: true,
          colorId: true,
          uomId: true,
        },
      },
      Location: true,
      Store: true,
      Destination: true,
    },
  });
  if (!data) return NoRecordFound("salesEntry");
  const salesWithStkQty = await Promise.all(
    data.SalesEntryItems.map(async (item) => {
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
          salesEntryItemsId: item.id,
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
  const salesEntryItemsIds = data.SalesEntryItems.map((item) => item.id).filter(
    Boolean,
  );
  const barcodes = await prisma.barcode.findMany({
    where: {
      salesEntryItemsId: { in: salesEntryItemsIds },
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
        salesEntryItemsId: barcode.salesEntryItemsId,
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
      SalesEntryItems: salesWithStkQty,
      childRecordReturn: childRecordReturn,
      childRecordSRInward: childRecordSRInward,
      barcodes: barcodeWithRate,
    },
  };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.salesEntry.findMany({
    where: {
      country: {
        companyId: companyId ? parseInt(companyId) : undefined,
      },
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          aliasName: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    salesEntryItems,
    finYearId,
    docDate,
    draftSave,
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
    data = await tx.salesEntry.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        createdById: parseInt(userId),
        docDate: docDate ? new Date(docDate) : null,
        locationId: parseInt(locationId),
        customerId: parseInt(customerId),
        contactPerson,
        contactNumber,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        destinationId: destinationId ? parseInt(destinationId) : null,
        salesType,
        roundOff: roundOff ? parseInt(roundOff) : null,
        overAllDisc: overAllDisc ? parseInt(overAllDisc) : null,
      },
    });
    await createSalesEntryItems(
      tx,
      salesEntryItems,
      data,
      userId,
      branchId,
      storeId,
      salesType,
      companyId,
    );
  });
  io.emit("purchaseBill:updated", {
    message: "Sales Entry Created",
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    branchId,
    salesEntryItems,
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
      SalesEntryItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("salesEntry");
  let removedItems = findRemovedItems(dataFound, salesEntryItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.salesEntryItems.deleteMany({
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
    await updateSalesEntryItems(
      tx,
      salesEntryItems,
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

async function updateSalesEntryItems(
  tx,
  salesEntryItems,
  salesEntry,
  userId,
  branchId,
  storeId,
  salesType,
  companyId,
) {
  for (const stockDetail of salesEntryItems) {
    const qty =
      stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
        ? -Math.abs(parseInt(stockDetail.qty))
        : null;

    if (stockDetail.id) {
      const updatedItem = await tx.salesEntryItems.update({
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
        where: { salesEntryItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.stock.update({
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
        await tx.stock.create({
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
            salesEntryItemsId: updatedItem.id,
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
      if (salesType === "SHOWROOM") {
        const newQty = stockDetail?.qty ? parseInt(stockDetail.qty) : 0;
        const existingBarcodes = await tx.barcode.findMany({
          where: {
            salesEntryItemsId: updatedItem.id,
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

            let fullPrefix;
            if (barcodeSeq.prefix === "STYLECODE") {
              fullPrefix = generatePrefix(stockDetail.styleNo);
            } else {
              fullPrefix = barcodeSeq.prefix + barcodeSeq.code;
            }

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
                salesEntryItemsId: updatedItem.id,
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
      const createdItem = await tx.salesEntryItems.create({
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
      await tx.stock.create({
        data: {
          inOrOut: "SalesEntry",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty: createdItem.qty ? -Math.abs(createdItem.qty) : null,
          salesEntryItemsId: createdItem.id,
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
      if (salesType === "SHOWROOM") {
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
          let fullPrefix;
          if (barcodeSeq.prefix === "STYLECODE") {
            fullPrefix = generatePrefix(stockDetail.styleNo);
          } else {
            fullPrefix = barcodeSeq.prefix + barcodeSeq.code;
          }

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
              salesEntryItemsId: createdItem.id,
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

function generatePrefix(styleNo) {
  if (!styleNo) {
    CustomError("Style Code is Missing Failed to Barcode Generation");
  }

  // Extract first continuous number sequence
  const match = styleNo.match(/\d+/);

  if (!match) return null;

  // Take first numeric match
  const numericPart = match[0];

  // Pad to 4 digits
  const paddedStyle = numericPart.padStart(4, "0").slice(0, 4);

  // Get current YYMM
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const yymm = `${year}${month}`;

  return `${paddedStyle}${yymm}`;
}

async function createSalesEntryItems(
  tx,
  salesEntryItems,
  salesEntry,
  userId,
  branchId,
  storeId,
  salesType,
  companyId,
) {
  for (const itemDetail of salesEntryItems) {
    const createdItem = await tx.salesEntryItems.create({
      data: {
        salesEntryId: parseInt(salesEntry.id),
        styleId: itemDetail?.styleId ? parseInt(itemDetail.styleId) : null,
        sizeId: itemDetail?.sizeId ? parseInt(itemDetail.sizeId) : null,
        colorId: itemDetail?.colorId ? parseInt(itemDetail.colorId) : null,
        stkQty:
          itemDetail?.stkQty && !isNaN(parseFloat(itemDetail.stkQty))
            ? Math.round(parseFloat(itemDetail.stkQty))
            : null,
        qty:
          itemDetail?.qty && !isNaN(parseFloat(itemDetail.qty))
            ? Math.round(parseFloat(itemDetail.qty))
            : null,
        remarks: itemDetail?.remarks ? itemDetail?.remarks : undefined,
        styleNo: itemDetail?.styleNo ?? undefined,
        fabricId: itemDetail?.fabricId ? parseInt(itemDetail.fabricId) : null,
        price: itemDetail?.price ? parseInt(itemDetail.price) : null,
        disc: itemDetail?.disc ? parseInt(itemDetail.disc) : null,
        amount: itemDetail?.amount ? parseInt(itemDetail.amount) : null,
        styleItemId: itemDetail?.styleItemId
          ? parseInt(itemDetail.styleItemId)
          : null,
        discountType: itemDetail?.discountType
          ? itemDetail?.discountType
          : undefined,
        discountValue: itemDetail?.discountValue
          ? parseInt(itemDetail.discountValue)
          : null,
        taxPercent: itemDetail?.taxPercent
          ? parseInt(itemDetail.taxPercent)
          : null,
        uomId: itemDetail?.uomId ? parseInt(itemDetail.uomId) : null,
      },
    });
    await tx.stock.create({
      data: {
        inOrOut: "SalesEntry",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId: itemDetail?.styleId ? parseInt(itemDetail.styleId) : null,
        sizeId: itemDetail?.sizeId ? parseInt(itemDetail.sizeId) : null,
        colorId: itemDetail?.colorId ? parseInt(itemDetail.colorId) : null,
        qty:
          itemDetail?.qty && !isNaN(parseFloat(itemDetail.qty))
            ? -Math.abs(parseInt(itemDetail.qty))
            : null,
        salesEntryItemsId: createdItem.id,
        styleNo: itemDetail?.styleNo ?? undefined,
        fabricId: itemDetail?.fabricId ? parseInt(itemDetail.fabricId) : null,
        price: itemDetail?.price ? parseInt(itemDetail.price) : null,
        styleItemId: itemDetail?.styleItemId
          ? parseInt(itemDetail.styleItemId)
          : null,
      },
    });
    if (salesType === "SHOWROOM") {
      const barcodeSeq = await tx.barcodeSequence.findFirst({
        where: {
          companyId: parseInt(companyId),
          active: true,
        },
      });
      if (!barcodeSeq) {
        CustomError("No active barcode sequence found for the company");
      }
      const qty = itemDetail?.qty ? parseInt(itemDetail.qty) : 1;
      for (let i = 0; i < qty; i++) {
        const lastBarcode = await tx.barcode.findFirst({
          where: {
            barcodeSeqId: parseInt(barcodeSeq.id),
          },
          orderBy: {
            id: "desc",
          },
        });
        let fullPrefix;
        if (barcodeSeq.prefix === "STYLECODE") {
          fullPrefix = generatePrefix(itemDetail.styleNo);
        } else {
          fullPrefix = barcodeSeq.prefix + barcodeSeq.code;
        }
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
            salesEntryItemsId: createdItem.id,
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
      }
    }
  }
}

function findRemovedItems(dataFound, salesEntryItems) {
  let removedItems = dataFound.SalesEntryItems.filter((oldItem) => {
    let result = salesEntryItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function deleteItemsFromStock(tx, removeItemsStockIds) {
  return await tx.stock.deleteMany({
    where: {
      id: {
        in: removeItemsStockIds,
      },
    },
  });
}

async function remove(id) {
  const data = await prisma.salesEntry.delete({
    where: {
      id: parseInt(id),
    },
  });

  return { statusCode: 0, data };
}

async function getSalesInvDetail(req) {
  const { invNo, storeId, branchId } = req.query;
  if (!invNo || !storeId || !branchId) {
    return {
      statusCode: 400,
      message: "Please Choose Required Fields",
    };
  }

  // 1️⃣ First try fetching by styleNo
  let data = await prisma.salesEntry.findFirst({
    where: {
      docId: invNo,
      storeId: parseInt(storeId),
      branchId: parseInt(branchId),
    },
  });

  if (!data) return NoRecordFound("Sales Entry");
  return {
    statusCode: 0,
    data: {
      ...data,
    },
  };
}

async function getSalesDcDetail(req) {
  const { dcNo } = req.query;

  let data = await prisma.salesEntry.findFirst({
    where: {
      docId: dcNo,
    },
    select: {
      SalesEntryItems: {
        select: {
          id: true,
          salesEntryId: true,
          styleId: true,
          sizeId: true,
          qty: true,
          styleItemId: true,
          colorId: true,
        },
      },
      docDate: true,
    },
  });

  const salesReturn = await prisma.salesReturn.findMany({
    where: {
      invNo: dcNo,
    },
    include: {
      salesReturnItems: true,
    },
  });
  const salesEntryItemIds = data?.SalesEntryItems.map((item) => item.id) || [];

  const barcodes = await prisma.barcode.findMany({
    where: {
      salesEntryItemsId: { in: salesEntryItemIds },
    },
  });
  const returnItems = salesReturn.flatMap((sr) => sr.salesReturnItems);
  const returnedBarcodeIds = new Set(returnItems.map((item) => item.barcodeId));
  const filteredBarcodes = barcodes.filter(
    (barcode) => !returnedBarcodeIds.has(barcode.id),
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
        salesEntryItemsId: barcode.salesEntryItemsId,
        barcodeSeqId: barcode.barcodeSeqId,
        rate: style?.price || null,
        taxPercent: style?.Hsn?.taxPerc ?? 5,
        qty: 1,
        barcodeId: barcode.id,
      };
    }),
  );
  const invValue = barcodeWithRate?.reduce((sum, item) => sum + item.rate, 0);

  if (!data) return NoRecordFound("Sales Entry");
  return {
    statusCode: 0,
    data: barcodeWithRate,
    invValue: invValue,
    invDate: data?.docDate,
  };
}

async function getSalesInvStyleDetail(req) {
  const { invNo, storeId, branchId, styleNo } = req.query;
  if (!invNo || !storeId || !branchId || !styleNo) {
    return {
      statusCode: 400,
      message: "Please Choose Required Fields",
    };
  }
  const salesEntry = await prisma.salesEntry.findFirst({
    where: {
      docId: invNo,
      storeId: parseInt(storeId),
      branchId: parseInt(branchId),
    },
    include: {
      SalesEntryItems: {
        select: {
          barcode: true,
          styleNo: true,
          styleId: true,
          sizeId: true,
          colorId: true,
          fabricId: true,
          styleItemId: true,
          qty: true,
          Size: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const salesReturn = await prisma.salesReturn.findMany({
    where: {
      invNo: invNo,
      storeId: parseInt(storeId),
      branchId: parseInt(branchId),
    },
    include: {
      salesReturnItems: {
        select: {
          barcode: true,
          styleNo: true,
          styleId: true,
          sizeId: true,
          colorId: true,
          fabricId: true,
          styleItemId: true,
          returnQty: true,
        },
      },
    },
  });
  const allReturnItems = salesReturn.flatMap(
    (returnEntry) => returnEntry.salesReturnItems,
  );
  const returnItems =
    allReturnItems.filter((item) => item.styleNo === styleNo) || [];

  // 1️⃣ First try fetching by styleNo
  let data = salesEntry.SalesEntryItems.filter(
    (item) => item.styleNo === styleNo,
  );

  if (data.length === 0) {
    return {
      statusCode: 1,
      message: "Style No Not Found",
    };
  }

  const finalData = data.map((item) => {
    const returnedQty = returnItems
      .filter(
        (r) =>
          r.styleId === item.styleId &&
          r.sizeId === item.sizeId &&
          r.styleItemId === item.styleItemId &&
          r.colorId === item.colorId,
      )
      .reduce((sum, r) => sum + r.returnQty, 0);

    return {
      ...item,
      alreadyReturnQty: returnedQty,
      balanceQty: item.qty - returnedQty,
    };
  });

  return {
    statusCode: 0,
    data: finalData,
  };
}
async function getSalesInvBarcodeDetail(req) {
  const { invNo, barcodeNo } = req.query;
  if (!invNo || !barcodeNo) {
    return {
      statusCode: 400,
      message: "Please Choose Required Fields",
    };
  }
  const salesEntry = await prisma.salesEntry.findFirst({
    where: {
      docId: invNo,
    },
    include: {
      SalesEntryItems: {
        select: {
          barcode: true,
          styleNo: true,
          styleId: true,
          sizeId: true,
          colorId: true,
          fabricId: true,
          styleItemId: true,
          qty: true,
          id: true,
        },
      },
    },
  });

  const barcodeItem = await prisma.barcode.findUnique({
    where: {
      barcodeNo: barcodeNo,
    },
  });
  if (!barcodeItem) {
    return ErrorResponse("Barcode Number Not found");
  }
  const StockQty = await prisma.stockSummary.aggregate({
    where: {
      barcodeId: barcodeItem.id,
    },
    _sum: {
      qty: true,
    },
  });

  if (StockQty._sum.qty > 0) {
    return ErrorResponse(
      "This Barcode Number is Inward in another Branch Stock",
    );
  } else {
    const data = salesEntry.SalesEntryItems.find(
      (item) => item.id === barcodeItem.salesEntryItemsId,
    );
    if (!data) {
      return ErrorResponse("Barcode Not Found in This Invoice");
    }
    const salesReturn = await prisma.salesReturn.findMany({
      where: {
        invNo: invNo,
      },
      include: {
        salesReturnItems: {
          select: {
            barcode: true,
            styleNo: true,
            styleId: true,
            sizeId: true,
            colorId: true,
            fabricId: true,
            styleItemId: true,
            returnQty: true,
            barcodeId: true,
            barcodeNo: true,
          },
        },
      },
    });
    const allReturnItems = salesReturn.flatMap(
      (returnEntry) => returnEntry.salesReturnItems,
    );
    const returnItems =
      allReturnItems.filter((item) => item.barcodeNo === barcodeNo) || [];

    const returnedQty = returnItems
      .filter(
        (r) =>
          r.styleId === data.styleId &&
          r.sizeId === data.sizeId &&
          r.styleItemId === data.styleItemId &&
          r.colorId === data.colorId,
      )
      .reduce((sum, r) => sum + r.returnQty, 0);

    const finalData = {
      ...data,
      alreadyReturnQty: returnedQty,
      balanceQty: data.qty - returnedQty,
      qty: 1, // since barcode return always 1
      returnQty: 1 - returnedQty,
      barcodeNo: barcodeItem.barcodeNo,
      barcodeId: barcodeItem.id,
    };

    return {
      statusCode: 0,
      data: finalData,
    };
  }
}

export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getSalesReport,
  getSalesInvDetail,
  getSalesDcDetail,
  getSalesInvStyleDetail,
  getSalesInvBarcodeDetail,
};
