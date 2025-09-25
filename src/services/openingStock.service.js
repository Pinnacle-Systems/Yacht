import { NoRecordFound } from "../configs/Responses.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { PrismaClient } from "@prisma/client";
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
  const childRecord = 0;
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
          id: true,
          openingStockId: true,
          styleId: true,
          sizeId: true,
          qty: true,
          remarks: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("openingStock");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
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
}

async function update(id, body) {
  console.log(body);
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
    await deleteItemsFromStock(tx, removeItemsIds);
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
//     const qty = parseInt(stockDetail.qty) || 0;

//     if (stockDetail.id) {
//       // Update existing OpeningStockItem
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
//         },
//       });

//       // Get existing stock rows
//       const existingStocks = await tx.stock.findMany({
//         where: { OpeningStockItemsId: updatedItem.id },
//         orderBy: { id: "asc" },
//       });
//       const currentCount = existingStocks.length;

//       // Add new stock rows if qty increased
//       if (qty > currentCount) {
//         const rowsToAdd = qty - currentCount;
//         const now = new Date();
//         const dd = String(now.getDate()).padStart(2, "0");
//         const mm = String(now.getMonth() + 1).padStart(2, "0");
//         const yyyy = now.getFullYear();
//         const datePrefix = `${dd}${mm}${yyyy}`;

//         const stockRows = [];
//         for (let i = 0; i < rowsToAdd; i++) {
//           const uniqueId = String(currentCount + i + 1).padStart(4, "0");
//           const barCode = `${datePrefix}${updatedItem.id}${uniqueId}`;
//           stockRows.push(
//             tx.stock.create({
//               data: {
//                 inOrOut: "OpeningStock",
//                 createdById: parseInt(userId),
//                 branchId: parseInt(branchId),
//                 storeId: parseInt(storeId),
//                 styleId: stockDetail?.styleId
//                   ? parseInt(stockDetail.styleId)
//                   : null,
//                 sizeId: stockDetail?.sizeId
//                   ? parseInt(stockDetail.sizeId)
//                   : null,
//                 qty: 1,
//                 OpeningStockItemsId: updatedItem.id,
//                 barCode,
//               },
//             })
//           );
//         }
//         await Promise.all(stockRows);
//       }

//       // Remove extra stock rows if qty decreased
//       if (qty < currentCount) {
//         const rowsToRemove = existingStocks.slice(qty).map((row) => row.id);
//         await tx.stock.deleteMany({
//           where: { id: { in: rowsToRemove } },
//         });
//       }

//       // Update remaining stock rows attributes
//       await tx.stock.updateMany({
//         where: { OpeningStockItemsId: updatedItem.id },
//         data: {
//           styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
//           sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//         },
//       });

//       return updatedItem;
//     } else {
//       // Create new OpeningStockItem
//       const createdItem = await tx.openingStockItems.create({
//         data: {
//           openingStockId: parseInt(openingStock.id),
//           styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
//           sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//           qty: stockDetail?.qty ? parseInt(stockDetail?.qty) : null,
//         },
//       });

//       // Create stock rows
//       const now = new Date();
//       const dd = String(now.getDate()).padStart(2, "0");
//       const mm = String(now.getMonth() + 1).padStart(2, "0");
//       const yyyy = now.getFullYear();
//       const datePrefix = `${dd}${mm}${yyyy}`;

//       const stockRows = [];
//       for (let i = 0; i < qty; i++) {
//         const uniqueId = String(i + 1).padStart(4, "0");
//         const barCode = `${datePrefix}${createdItem.id}${uniqueId}`;
//         stockRows.push(
//           tx.stock.create({
//             data: {
//               inOrOut: "OpeningStock",
//               createdById: parseInt(userId),
//               branchId: parseInt(branchId),
//               storeId: parseInt(storeId),
//               styleId: stockDetail?.styleId
//                 ? parseInt(stockDetail.styleId)
//                 : null,
//               sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//               qty: 1,
//               OpeningStockItemsId: createdItem.id,
//               barCode,
//             },
//           })
//         );
//       }

//       await Promise.all(stockRows);
//       return createdItem;
//     }
//   });

//   return Promise.all(promises);
// }

async function updateOpeningStockItems(
  tx,
  openingStockItems,
  openingStock,
  userId,
  branchId,
  storeId
) {
  const promises = openingStockItems.map(async (stockDetail) => {
    const qty = parseInt(stockDetail.qty) || null;

    if (stockDetail.id) {
      // 1️⃣ Update existing OpeningStockItem
      const updatedItem = await tx.openingStockItems.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          openingStockId: parseInt(openingStock.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          qty:
            stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
              ? Math.round(parseFloat(stockDetail.qty))
              : null,
          remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
        },
      });

      // If stock row already exists → update it
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
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            qty,
            barCode: stockDetail?.barCode,
          },
        });
      } else {
        // 2️⃣ Update stock row (only one row per item)
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, "0");
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const yyyy = now.getFullYear();
        const datePrefix = `${dd}${mm}${yyyy}`;

        const rawCode = `${datePrefix}${updatedItem.id}`;
        const barCode = rawCode.padStart(13, "0");
        // If no stock row exists → create one
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
            qty,
            OpeningStockItemsId: updatedItem.id,
            barCode,
          },
        });
      }

      return updatedItem;
    } else {
      // 3️⃣ Create new OpeningStockItem
      const createdItem = await tx.openingStockItems.create({
        data: {
          openingStockId: parseInt(openingStock.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          qty: stockDetail?.qty ? parseInt(stockDetail?.qty) : null,
          remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
        },
      });

      // 4️⃣ Create one stock row
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      const datePrefix = `${dd}${mm}${yyyy}`;

      const rawCode = `${datePrefix}${createdItem.id}`;
      const barCode = rawCode.padStart(13, "0");

      await tx.stock.create({
        data: {
          inOrOut: "OpeningStock",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          qty: createdItem.qty || 0,
          OpeningStockItemsId: createdItem.id,
          barCode,
        },
      });

      return createdItem;
    }
  });

  return Promise.all(promises);
}

// async function createOpeningStockItems(
//   tx,
//   openingStockItems,
//   openingStock,
//   userId,
//   branchId,
//   storeId
// ) {
//   const promises = openingStockItems.map(async (stockDetail) => {
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
//       },
//     });
//     const stockRows = [];
//     const qty = parseInt(stockDetail.qty) || null;
//     const now = new Date();
//     const dd = String(now.getDate()).padStart(2, "0");
//     const mm = String(now.getMonth() + 1).padStart(2, "0");
//     const yyyy = now.getFullYear();
//     const datePrefix = `${dd}${mm}${yyyy}`;
//     for (let i = 0; i < qty; i++) {
//       const uniqueId = String(i + 1).padStart(4, "0");
//       const barCode = `${datePrefix}${createdItem.id}${uniqueId}`;
//       stockRows.push(
//         tx.stock.create({
//           data: {
//             inOrOut: "OpeningStock",
//             createdById: parseInt(userId),
//             branchId: parseInt(branchId),
//             storeId: parseInt(storeId),
//             styleId: stockDetail?.styleId
//               ? parseInt(stockDetail.styleId)
//               : null,
//             sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
//             qty: 1,
//             OpeningStockItemsId: createdItem.id,
//             barCode,
//           },
//         })
//       );
//     }
//     await Promise.all(stockRows);
//     return createdItem;
//   });

//   return Promise.all(promises);
// }

async function createOpeningStockItems(
  tx,
  openingStockItems,
  openingStock,
  userId,
  branchId,
  storeId
) {
  const promises = openingStockItems.map(async (stockDetail) => {
    const createdItem = await tx.openingStockItems.create({
      data: {
        openingStockId: parseInt(openingStock.id),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        qty:
          stockDetail?.qty && !isNaN(parseFloat(stockDetail.qty))
            ? Math.round(parseFloat(stockDetail.qty))
            : null,
        remarks: stockDetail?.remarks ? stockDetail?.remarks : undefined,
      },
    });
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const datePrefix = `${dd}${mm}${yyyy}`;
    const rawCode = `${datePrefix}${createdItem.id}`;
    const barCode = rawCode.padStart(13, "0");
    await tx.stock.create({
      data: {
        inOrOut: "OpeningStock",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        qty: stockDetail.qty ? parseInt(stockDetail.qty) : null,
        OpeningStockItemsId: createdItem.id,
        barCode,
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

export { get, getOne, getSearch, create, update, remove };
