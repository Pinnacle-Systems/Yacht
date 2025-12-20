import { NoRecordFound } from "../configs/Responses.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { exec } from "child_process";

const prisma = new PrismaClient();

async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  saveType,
  docId,
  isUpdate
) {
  // Case 1: Draft save
  if (saveType) {
    return "Draft Save";
  } else if (isUpdate === "drift") {
    lastObject = await prisma.openingStock.findFirst({
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
      new Date()
    )}/OST/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/OST/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.openingStock.findFirst({
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
      new Date()
    )}/OST/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/OST/${
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
        : true)
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
    searchStyleNo,
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
    finYearDate?.endDateEndTime
  );
  let data;
  let totalCount;
  data = await prisma.openingStock.findMany({
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
      Store: {
        storeName: searchStore ? { contains: searchStore } : undefined,
      },
    },
    include: {
      Store: {
        select: {
          id: true,
          storeName: true,
        },
      },
      OpeningStockItems: true,
    },
  });
  totalCount = data.length;
  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate)
    );
  }
  if (searchStyleNo) {
    data = data?.filter((item) =>
      item?.OpeningStockItems?.some((product) =>
        product?.styleNo.includes(searchStyleNo)
      )
    );
  }
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
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
  const data = await prisma.openingStock.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      OpeningStockItems: {
        select: {
          Stock: true,
          // Stock: {
          //   select: {
          //     barCode: true,
          //     Style: {
          //       select: {
          //         id: true,
          //         name: true, // use the actual field name in your Style model
          //       },
          //     },
          //     Size: {
          //       select: {
          //         id: true,
          //         name: true, // use the actual field name in your Size model
          //       },
          //     },
          //   },
          // },
          id: true,
          openingStockId: true,
          styleId: true,
          sizeId: true,
          qty: true,
          remarks: true,
          styleNo: true,
          fabricId: true,
          styleItemId: true,
          colorId: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("openingStock");
  const itemWithStkQty = await Promise.all(
    data.OpeningStockItems.map(async (item) => {
      const childRecordSales = await prisma.salesEntryItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
        },
      });
      const childRecordAdjust = await prisma.stockAdjustmentItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
        },
      });
      return {
        ...item,
        stockQty: childRecordSales + childRecordAdjust || 0,
      };
    })
  );
  const styleNos = data.OpeningStockItems.map((item) => item.styleNo).filter(
    Boolean
  );

  // ✅ Count how many SalesEntryItems use those styleNos
  const childRecordSales = await prisma.salesEntryItems.count({
    where: {
      styleNo: { in: styleNos },
    },
  });
  const childRecordStock = await prisma.stockAdjustmentItems.count({
    where: {
      styleNo: { in: styleNos },
    },
  });
  return {
    statusCode: 0,
    data: {
      ...data,
      OpeningStockItems: itemWithStkQty,
      childRecordSales: childRecordSales,
      childRecordStock: childRecordStock,
    },
  };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.openingStock.findMany({
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
  try {
    const {
      userId,
      branchId,
      storeId,
      openingStockItems,
      finYearId,
      term,
      notes,
      docDate,
      draftSave,
      locationId,
    } = await body;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate
      ? getYearShortCodeForFinYear(
          finYearDate?.startDateStartTime,
          finYearDate?.endDateEndTime
        )
      : "";
    let newDocId = await getNextDocId(
      branchId,
      shortCode,
      finYearDate?.startDateStartTime,
      finYearDate?.endDateEndTime,
      draftSave
    );
    let data;
    console.log(newDocId);
    await prisma.$transaction(async (tx) => {
      data = await tx.openingStock.create({
        data: {
          docId: newDocId,
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          createdById: parseInt(userId),
          notes,
          term,
          docDate: docDate ? new Date(docDate) : null,
          locationId: parseInt(locationId),
        },
      });
      await createOpeningStockItems(
        tx,
        openingStockItems,
        data,
        userId,
        branchId,
        storeId
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

async function update(id, body) {
  const {
    branchId,
    openingStockItems,
    userId,
    storeId,
    term,
    notes,
    docDate,
    locationId,
  } = await body;
  let data;
  const dataFound = await prisma.openingStock.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      OpeningStockItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("openingStock");
  let removedItems = findRemovedItems(dataFound, openingStockItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.openingStockItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.openingStock.update({
      where: {
        id: parseInt(id),
      },
      data: {
        storeId: parseInt(storeId),
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        notes,
        term,
        docDate: docDate ? new Date(docDate) : null,
        locationId: parseInt(locationId),
      },
    });
    await updateOpeningStockItems(
      tx,
      openingStockItems,
      data,
      userId,
      branchId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

// async function updateOpeningStockItems(
//   tx,
//   openingStockItems,
//   openingStock,
//   userId,
//   branchId,
//   storeId
// ) {
//   const promises = openingStockItems.map(async (stockDetail) => {
//     const qty = parseInt(stockDetail.qty) || null;

//     if (stockDetail.id) {
//       // 1️⃣ Update existing OpeningStockItem
//       const updatedItem = await tx.openingStockItems.update({
//         where: { id: parseInt(stockDetail.id) },
//         data: {
//           openingStockId: parseInt(openingStock.id),
//           styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
//           sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//           qty:
//             stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
//               ? Math.round(parseFloat(stockDetail.qty))
//               : null,
//           remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
//           barcode: stockDetail?.barcode ? stockDetail?.barcode : undefined,
//         },
//       });

//       // If stock row already exists → update it
//       const existingStock = await tx.stock.findFirst({
//         where: { OpeningStockItemsId: updatedItem.id },
//       });

//       if (existingStock) {
//         await tx.stock.update({
//           where: { id: existingStock.id },
//           data: {
//             styleId: stockDetail?.styleId
//               ? parseInt(stockDetail.styleId)
//               : null,
//             sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//             qty,
//             barCode: stockDetail?.barcode,
//             updatedById: parseInt(userId),
//           },
//         });
//       } else {
//         const newBarcode = stockDetail?.barcode
//           ? stockDetail.barcode
//           : await getNextBarcodeNo();
//         await tx.stock.create({
//           data: {
//             inOrOut: "OpeningStock",
//             createdById: parseInt(userId),
//             branchId: parseInt(branchId),
//             storeId: parseInt(storeId),
//             styleId: stockDetail?.styleId
//               ? parseInt(stockDetail.styleId)
//               : null,
//             sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//             qty,
//             OpeningStockItemsId: updatedItem.id,
//             barCode: newBarcode,
//           },
//         });
//       }

//       return updatedItem;
//     } else {
//       // 3️⃣ Create new OpeningStockItem
//       const newBarcode = await getNextBarcodeNo();
//       const createdItem = await tx.openingStockItems.create({
//         data: {
//           openingStockId: parseInt(openingStock.id),
//           styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
//           sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//           qty: stockDetail?.qty ? parseInt(stockDetail?.qty) : null,
//           remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
//           barcode: newBarcode,
//         },
//       });
//       await tx.stock.create({
//         data: {
//           inOrOut: "OpeningStock",
//           createdById: parseInt(userId),
//           branchId: parseInt(branchId),
//           storeId: parseInt(storeId),
//           styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
//           sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//           qty: createdItem.qty || 0,
//           OpeningStockItemsId: createdItem.id,
//           barCode: newBarcode,
//         },
//       });

//       return createdItem;
//     }
//   });

//   return Promise.all(promises);
// }

// async function createOpeningStockItems(
//   tx,
//   openingStockItems,
//   openingStock,
//   userId,
//   branchId,
//   storeId
// ) {
//   const promises = openingStockItems.map(async (stockDetail,index) => {
//     // 1️⃣ Get the last barcode once
//     const lastObject = await tx.openingStockItems.findFirst({
//       orderBy: { id: "desc" },
//     });
//     let lastNumber = 0;
//     if (lastObject?.barcode) {
//       lastNumber = parseInt(lastObject.barcode.replace("YS", "")) || 0;
//     }
//     const barcode = await getNextBarcodeNo();
//     const createdItem = await tx.openingStockItems.create({
//       data: {
//         openingStockId: parseInt(openingStock.id),
//         styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
//         sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//         qty:
//           stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
//             ? Math.round(parseFloat(stockDetail.qty))
//             : null,
//         remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
//         barcode: barcode,
//       },
//     });

//     await tx.stock.create({
//       data: {
//         inOrOut: "OpeningStock",
//         createdById: parseInt(userId),
//         branchId: parseInt(branchId),
//         storeId: parseInt(storeId),
//         styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
//         sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//         qty: stockDetail.qty ? parseInt(stockDetail.qty) : null,
//         OpeningStockItemsId: createdItem.id,
//         barCode: barcode,
//       },
//     });
//     return createdItem;
//   });

//   return Promise.all(promises);
// }

async function getLastBarcodeNumber(tx) {
  const lastItem = await tx.openingStockItems.findFirst({
    orderBy: { id: "desc" },
  });

  if (lastItem?.barcode) {
    return parseInt(lastItem.barcode.replace("YS", "")) || 0;
  }

  return 0;
}

async function updateOpeningStockItems(
  tx,
  openingStockItems,
  openingStock,
  userId,
  branchId,
  storeId
) {
  // 1️⃣ Get the last barcode number in this branch
  const lastItem = await tx.openingStockItems.findFirst({
    orderBy: { id: "desc" }, // or order by createdAt
  });

  let lastNumber = 0;
  if (lastItem?.barcode) {
    lastNumber = parseInt(lastItem.barcode.replace(/^YS0*/, "")) || 0;
  }

  let newIndex = 0; // Counter for new rows in this update

  const promises = openingStockItems.map(async (stockDetail) => {
    const qty = stockDetail?.qty
      ? Math.round(parseFloat(stockDetail.qty))
      : null;

    let barcode;
    if (stockDetail.id) {
      // Keep existing barcode for existing items
      barcode = stockDetail.barcode;
    } else {
      // Generate new barcode sequentially for new items
      newIndex++;
      barcode = `YS${String(lastNumber + newIndex).padStart(4, "0")}`;
    }

    if (stockDetail.id) {
      // Update existing OpeningStockItem
      const updatedItem = await tx.openingStockItems.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          openingStockId: parseInt(openingStock.id),
          styleNo: stockDetail?.styleNo ?? undefined,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          price: stockDetail?.price ? parseInt(stockDetail.price) : null,
          qty,
          remarks: stockDetail?.remarks ?? undefined,
          barcode,
        },
      });

      // Update or create Stock row
      const existingStock = await tx.stock.findFirst({
        where: { OpeningStockItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.stock.update({
          where: { id: existingStock.id },
          data: {
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
            price: stockDetail?.price ? parseInt(stockDetail.price) : null,
            qty,
            barCode: barcode,
            updatedById: parseInt(userId),
            fabricId: stockDetail?.fabricId
              ? parseInt(stockDetail.fabricId)
              : null,
            styleNo: stockDetail?.styleNo ?? undefined,
          },
        });
      } else {
        await tx.stock.create({
          data: {
            inOrOut: "OpeningStock",
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
            price: stockDetail?.price ? parseInt(stockDetail.price) : null,
            qty,
            OpeningStockItemsId: updatedItem.id,
            styleNo: stockDetail?.styleNo ?? undefined,
            barCode: barcode,
            fabricId: stockDetail?.fabricId
              ? parseInt(stockDetail.fabricId)
              : null,
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
          },
        });
      }

      return updatedItem;
    } else {
      // Create new OpeningStockItem
      const createdItem = await tx.openingStockItems.create({
        data: {
          openingStockId: parseInt(openingStock.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          price: stockDetail?.price ? parseInt(stockDetail.price) : null,
          qty,
          remarks: stockDetail?.remarks ?? undefined,
          barcode,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleNo: stockDetail?.styleNo ?? undefined,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
        },
      });

      // Create Stock row
      await tx.stock.create({
        data: {
          inOrOut: "OpeningStock",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          price: stockDetail?.price ? parseInt(stockDetail.price) : null,
          qty,
          OpeningStockItemsId: createdItem.id,
          barCode: barcode,
          styleNo: stockDetail?.styleNo ?? undefined,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
        },
      });

      return createdItem;
    }
  });

  return Promise.all(promises);
}

async function createOpeningStockItems(
  tx,
  openingStockItems,
  openingStock,
  userId,
  branchId,
  storeId
) {
  const newItems = openingStockItems || [];
  for (const item of newItems) {
    if (!item.styleId || !item.sizeId || !item.colorId) continue;
    const exists = await tx.stock.findFirst({
      where: {
        styleId: item.styleId,
        sizeId: item.sizeId,
        colorId: parseInt(item.colorId),
      },
      include: {
        Style: true,
        Size: true,
        Color: true,
      },
    });
    if (exists) {
      throw new Error(
        `Style No - ${exists.Style?.sku}, Size - ${exists.Size?.name},Color - ${exists.Color?.name} is Already Exists`
      );
    }
  }
  // 1️⃣ Get the highest existing barcode number for this branch
  const lastItem = await tx.openingStockItems.findFirst({
    orderBy: { id: "desc" }, // or order by createdAt
  });

  let lastNumber = 0;
  if (lastItem?.barcode) {
    // Extract the numeric part from barcode like 'YS0005' -> 5
    lastNumber = parseInt(lastItem.barcode.replace(/^YS0*/, "")) || 0;
  }

  // 2️⃣ Map through all items and create them with sequential barcodes
  const promises = openingStockItems.map(async (stockDetail, index) => {
    const qty = stockDetail?.qty
      ? Math.round(parseFloat(stockDetail.qty))
      : null;

    // Generate sequential barcode
    const barcode = stockDetail?.barcode
      ? stockDetail.barcode
      : `YS${String(lastNumber + index + 1).padStart(4, "0")}`;

    // Create OpeningStockItem
    const createdItem = await tx.openingStockItems.create({
      data: {
        openingStockId: parseInt(openingStock.id),
        styleNo: stockDetail?.styleNo ?? undefined,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        qty,
        remarks: stockDetail?.remarks ?? undefined,
        barcode,
        price: stockDetail?.price ? parseInt(stockDetail.price) : null,
      },
    });

    // Create corresponding Stock row
    await tx.stock.create({
      data: {
        inOrOut: "OpeningStock",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        qty,
        OpeningStockItemsId: createdItem.id,
        barCode: barcode,
        styleNo: stockDetail?.styleNo ?? undefined,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        price: stockDetail?.price ? parseInt(stockDetail.price) : null,
      },
    });

    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, openingStockItems) {
  let removedItems = dataFound.OpeningStockItems.filter((oldItem) => {
    let result = openingStockItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id)
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
  console.log(id, "id");
  const data = await prisma.openingStock.delete({
    where: {
      id: parseInt(id),
    },
  });
  console.log(data, "data");

  return { statusCode: 0, data };
}

function printTSPL(tsplCommands, printerName) {
  const tempFile = "temp_tspl.txt";
  fs.writeFileSync(tempFile, tsplCommands, "utf8");

  // Windows: copy file to printer
  exec(
    `copy /b ${tempFile} "\\\\localhost\\${printerName}"`,
    (err, stdout, stderr) => {
      if (err) console.error("Printing failed:", err);
      else console.log("Printed successfully");
      fs.unlinkSync(tempFile);
    }
  );
}

export { get, getOne, getSearch, create, update, remove };
