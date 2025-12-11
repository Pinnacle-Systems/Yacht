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
    lastObject = await prisma.cuttingOrder.findFirst({
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
    )}/CP/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CP/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.cuttingOrder.findFirst({
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
    )}/CP/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CP/${
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
    searchStyleNo,
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
  data = await prisma.cuttingOrder.findMany({
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
      Style: {
        sku: searchStyleNo ? { contains: searchStyleNo } : undefined,
      },
    },
    include: {
      Store: {
        select: {
          id: true,
          storeName: true,
        },
      },
      cuttingOrderItems: true,
      Style: {
        select: {
          id: true,
          sku: true,
        },
      },
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
  const data = await prisma.cuttingOrder.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      // Store: {
      //   select: {
      //     locationId: true,
      //   },
      // },
      cuttingOrderItems: {
        select: {
          sizeDetails: true,
          id: true,
          cuttingOrderId: true,
          styleItemId: true,
          fabricId: true,
          colorId: true,
          sizeId: true,
          fabWidth: true,
          fabMeter: true,
          portionId: true,
          styleId: true,
          orderQty: true,
          remarks: true,
          uomId: true,
          invNo: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("CuttingOrder");
  const styleIds = data.cuttingOrderItems
    .map((item) => item.styleId)
    .filter(Boolean);
  const childRecordCutting = await prisma.cuttingDeliveryItems.count({
    where: {
      styleId: {
        in: styleIds,
      },
    },
  });
  return {
    statusCode: 0,
    data: {
      ...data,
      // childRecordCutting: childRecordCutting,
    },
  };
}

function findRemovedItems(dataFound, cuttingOrderItems) {
  let removedItems = dataFound.cuttingOrderItems.filter((oldItem) => {
    let result = cuttingOrderItems.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id)
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    finYearId,
    cuttingOrderItems,
    styleId,
    docDate,
    draftSave,
    sizeTemplateId,
    locationId,
    // processGroupId
  } = await body;
  console.log(branchId, "branchId");
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
  const exist = await prisma.cuttingOrder.findFirst({
    where: {
      styleId: parseInt(styleId),
    },
  });
  if (exist) {
    return {
      status: 400,
      message: "This Style Already Exits",
    };
  }
  await prisma.$transaction(async (tx) => {
    data = await tx.cuttingOrder.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        locationId: parseInt(locationId),
        createdById: parseInt(userId),
        styleId: parseInt(styleId),
        docDate: docDate ? new Date(docDate) : null,
        sizeTemplateId: parseInt(sizeTemplateId),
        // processGroupId: parseInt(processGroupId)
      },
    });
    await createCuttingOrderItems(
      tx,
      cuttingOrderItems,
      data,
      userId,
      branchId
      // storeId
    );
  });
  return { statusCode: 0, data };
}

async function createCuttingOrderItems(
  tx,
  cuttingOrderItems,
  cuttingOrder,
  userId,
  branchId
  // storeId
) {
  const promises = cuttingOrderItems.map(async (orderDetail, index) => {
    const orderQty = orderDetail?.orderQty
      ? Math.round(parseFloat(orderDetail.orderQty))
      : null;
    const createdItem = await tx.cuttingOrderItems.create({
      data: {
        cuttingOrderId: parseInt(cuttingOrder.id),
        fabricId: orderDetail?.fabricId ? parseInt(orderDetail.fabricId) : null,
        styleId: orderDetail?.styleId ? parseInt(orderDetail.styleId) : null,
        styleItemId: orderDetail?.styleItemId
          ? parseInt(orderDetail.styleItemId)
          : null,
        uomId: orderDetail?.uomId ? parseInt(orderDetail.uomId) : null,
        colorId: orderDetail?.colorId ? parseInt(orderDetail.colorId) : null,
        fabWidth: orderDetail?.fabWidth
          ? parseFloat(orderDetail.fabWidth)
          : null,
        fabMeter: orderDetail?.fabMeter
          ? parseFloat(orderDetail.fabMeter)
          : null,
        portionId: orderDetail?.portionId
          ? parseInt(orderDetail.portionId)
          : null,
        orderQty,
        remarks: orderDetail?.remarks ?? undefined,
        invNo: orderDetail?.invNo ? orderDetail?.invNo : null,
      },
    });
    const sizes = orderDetail.sizeDetails || [];

    for (const s of sizes) {
      await tx.sizeDetails.create({
        data: {
          sizeId: s.sizeId ? parseInt(s.sizeId) : null,
          qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
          cuttingOrderItemsId: createdItem.id,
        },
      });
    }
    // // Create corresponding Stock row
    // await tx.materialStock.create({
    //   data: {
    //     inOrOut: "cuttingOrder",
    //     cuttingOrderItemsId: createdItem.id,
    //     createdById: parseInt(userId),
    //     branchId: parseInt(branchId),
    //     // storeId: parseInt(storeId),
    //     fabricId: orderDetail?.fabricId ? parseInt(orderDetail.fabricId) : null,
    //     styleId: orderDetail?.styleId ? parseInt(orderDetail.styleId) : null,
    //     styleItemId: orderDetail?.styleItemId
    //       ? parseInt(orderDetail.styleItemId)
    //       : null,
    //     sizeId: orderDetail?.sizeId ? parseInt(orderDetail.sizeId) : null,
    //     colorId: orderDetail?.colorId ? parseInt(orderDetail.colorId) : null,
    //     fabWidth: orderDetail?.fabWidth
    //       ? parseFloat(orderDetail.fabWidth)
    //       : null,
    //     fabMeter: orderDetail?.fabMeter
    //       ? -Math.abs(parseFloat(orderDetail.fabMeter))
    //       : null,
    //     portionId: orderDetail?.portionId
    //       ? parseInt(orderDetail.portionId)
    //       : null,
    //     remarks: orderDetail?.remarks ?? undefined,
    //   },
    // });

    return createdItem;
  });

  return Promise.all(promises);
}

async function deleteItemsFromStock(tx, removeItemsStockIds) {
  return await tx.materialStock.deleteMany({
    where: {
      id: {
        in: removeItemsStockIds,
      },
    },
  });
}

async function update(id, body) {
  const {
    branchId,
    cuttingOrderItems,
    userId,
    storeId,
    locationId,
    docDate,
    sizeTemplateId,
    styleId,
    // processGroupId
  } = await body;
  let data;
  const dataFound = await prisma.cuttingOrder.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      cuttingOrderItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("cuttingOrder");
  let removedItems = findRemovedItems(dataFound, cuttingOrderItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.cuttingOrderItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.cuttingOrder.update({
      where: {
        id: parseInt(id),
      },
      data: {
        updatedById: parseInt(userId),
        storeId: parseInt(storeId),
        branchId: parseInt(branchId),
        locationId: parseInt(locationId),
        styleId: parseInt(styleId),
        docDate: docDate ? new Date(docDate) : null,
        sizeTemplateId: parseInt(sizeTemplateId),
        // processGroupId: parseInt(processGroupId)
      },
    });
    await updateCuttingOrderItems(
      tx,
      cuttingOrderItems,
      data,
      userId,
      branchId
      // storeId
    );
  });
  return { statusCode: 0, data };
}

// async function updateCuttingOrderItems(
//   tx,
//   cuttingOrderItems,
//   cuttingOrder,
//   userId,
//   branchId,
//   storeId
// ) {
//   const promises = cuttingOrderItems.map(async (orderDetail) => {
//     const orderQty = orderDetail?.orderQty
//       ? Math.round(parseFloat(orderDetail.orderQty))
//       : null;
//     if (orderDetail.id) {
//       // Update existing cuttingOrderItem
//       const updatedItem = await tx.cuttingOrderItems.update({
//         where: { id: parseInt(orderDetail.id) },
//         data: {
//           cuttingOrderId: parseInt(cuttingOrder.id),
//           fabricId: orderDetail?.fabricId
//             ? parseInt(orderDetail.fabricId)
//             : null,
//           styleId: orderDetail?.styleId ? parseInt(orderDetail.styleId) : null,
//           styleItemId: orderDetail?.styleItemId
//             ? parseInt(orderDetail.styleItemId)
//             : null,
//           uomId: orderDetail?.uomId ? parseInt(orderDetail.uomId) : null,
//           colorId: orderDetail?.colorId ? parseInt(orderDetail.colorId) : null,
//           fabWidth: orderDetail?.fabWidth
//             ? parseFloat(orderDetail.fabWidth)
//             : null,
//           fabMeter: orderDetail?.fabMeter
//             ? parseFloat(orderDetail.fabMeter)
//             : null,
//           portionId: orderDetail?.portionId
//             ? parseInt(orderDetail.portionId)
//             : null,
//           orderQty,
//           remarks: orderDetail?.remarks ?? undefined,
//         },
//       });
//       const sizes = orderDetail?.sizeDetails || [];
//       const existingSize = await tx.sizeDetails.findMany({
//         where: {
//           cuttingOrderItemsId: updatedItem.id,
//         },
//       });

//       if (existingSize) {
//         for (const s of sizes) {
//           await tx.sizeDetails.update({
//             where: {
//               id: existingSize.id,
//             },
//             data: {
//               sizeId: s.sizeId ? parseInt(s.sizeId) : null,
//               qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
//             },
//           });
//         }
//       } else {
//         for (const s of sizes) {
//           await tx.sizeDetails.create({
//             data: {
//               sizeId: s.sizeId ? parseInt(s.sizeId) : null,
//               qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
//               cuttingOrderItemsId: updatedItem.id,
//             },
//           });
//         }
//       }

//       // // Update or create Stock row
//       // const existingStock = await tx.materialStock.findFirst({
//       //   where: { cuttingOrderItemsId: updatedItem.id },
//       // });

//       // if (existingStock) {
//       //   await tx.materialStock.update({
//       //     where: { id: existingStock.id },
//       //     data: {
//       //       updatedById: parseInt(userId),
//       //       fabricId: orderDetail?.fabricId
//       //         ? parseInt(orderDetail.fabricId)
//       //         : null,
//       //       styleId: orderDetail?.styleId
//       //         ? parseInt(orderDetail.styleId)
//       //         : null,
//       //       styleItemId: orderDetail?.styleItemId
//       //         ? parseInt(orderDetail.styleItemId)
//       //         : null,
//       //       sizeId: orderDetail?.sizeId ? parseInt(orderDetail.sizeId) : null,
//       //       colorId: orderDetail?.colorId
//       //         ? parseInt(orderDetail.colorId)
//       //         : null,
//       //       fabWidth: orderDetail?.fabWidth
//       //         ? parseFloat(orderDetail.fabWidth)
//       //         : null,
//       //       fabMeter: orderDetail?.fabMeter
//       //         ? -Math.abs(parseFloat(orderDetail.fabMeter))
//       //         : null,
//       //       portionId: orderDetail?.portionId
//       //         ? parseInt(orderDetail.portionId)
//       //         : null,
//       //       remarks: orderDetail?.remarks ?? undefined,
//       //     },
//       //   });
//       // } else {
//       //   await tx.materialStock.create({
//       //     data: {
//       //       inOrOut: "cuttingOrder",
//       //       cuttingOrderItemsId: updatedItem.id,
//       //       createdById: parseInt(userId),
//       //       branchId: parseInt(branchId),
//       //       // storeId: parseInt(storeId),
//       //       fabricId: orderDetail?.fabricId
//       //         ? parseInt(orderDetail.fabricId)
//       //         : null,
//       //       styleId: orderDetail?.styleId
//       //         ? parseInt(orderDetail.styleId)
//       //         : null,
//       //       styleItemId: orderDetail?.styleItemId
//       //         ? parseInt(orderDetail.styleItemId)
//       //         : null,
//       //       sizeId: orderDetail?.sizeId ? parseInt(orderDetail.sizeId) : null,
//       //       colorId: orderDetail?.colorId
//       //         ? parseInt(orderDetail.colorId)
//       //         : null,
//       //       fabWidth: orderDetail?.fabWidth
//       //         ? parseFloat(orderDetail.fabWidth)
//       //         : null,
//       //       fabMeter: orderDetail?.fabMeter
//       //         ? -Math.abs(parseFloat(orderDetail.fabMeter))
//       //         : null,
//       //       portionId: orderDetail?.portionId
//       //         ? parseInt(orderDetail.portionId)
//       //         : null,
//       //       remarks: orderDetail?.remarks ?? undefined,
//       //     },
//       //   });
//       // }

//       return updatedItem;
//     } else {
//       // Create new cuttingOrderItem
//       const createdItem = await tx.cuttingOrderItems.create({
//         data: {
//           cuttingOrderId: parseInt(cuttingOrder.id),
//           fabricId: orderDetail?.fabricId
//             ? parseInt(orderDetail.fabricId)
//             : null,
//           styleId: orderDetail?.styleId ? parseInt(orderDetail.styleId) : null,
//           styleItemId: orderDetail?.styleItemId
//             ? parseInt(orderDetail.styleItemId)
//             : null,
//           uomId: orderDetail?.uomId ? parseInt(orderDetail.uomId) : null,
//           colorId: orderDetail?.colorId ? parseInt(orderDetail.colorId) : null,
//           fabWidth: orderDetail?.fabWidth
//             ? parseFloat(orderDetail.fabWidth)
//             : null,
//           fabMeter: orderDetail?.fabMeter
//             ? parseFloat(orderDetail.fabMeter)
//             : null,
//           portionId: orderDetail?.portionId
//             ? parseInt(orderDetail.portionId)
//             : null,
//           orderQty,
//           remarks: orderDetail?.remarks ?? undefined,
//         },
//       });
//       for (const s of sizes) {
//         await tx.sizeDetails.create({
//           data: {
//             sizeId: s.sizeId ? parseInt(s.sizeId) : null,
//             qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
//             cuttingOrderItemsId: createdItem.id,
//           },
//         });
//       }

//       // Create Stock row
//       // await tx.materialStock.create({
//       //   data: {
//       //     inOrOut: "cuttingOrder",
//       //     cuttingOrderItemsId: createdItem.id,
//       //     createdById: parseInt(userId),
//       //     branchId: parseInt(branchId),
//       //     // storeId: parseInt(storeId),
//       //     fabricId: orderDetail?.fabricId
//       //       ? parseInt(orderDetail.fabricId)
//       //       : null,
//       //     styleId: orderDetail?.styleId ? parseInt(orderDetail.styleId) : null,
//       //     styleItemId: orderDetail?.styleItemId
//       //       ? parseInt(orderDetail.styleItemId)
//       //       : null,
//       //     sizeId: orderDetail?.sizeId ? parseInt(orderDetail.sizeId) : null,
//       //     colorId: orderDetail?.colorId ? parseInt(orderDetail.colorId) : null,
//       //     fabWidth: orderDetail?.fabWidth
//       //       ? parseFloat(orderDetail.fabWidth)
//       //       : null,
//       //     fabMeter: orderDetail?.fabMeter
//       //       ? -Math.abs(parseFloat(orderDetail.fabMeter))
//       //       : null,
//       //     portionId: orderDetail?.portionId
//       //       ? parseInt(orderDetail.portionId)
//       //       : null,
//       //     remarks: orderDetail?.remarks ?? undefined,
//       //   },
//       // });

//       return createdItem;
//     }
//   });

//   return Promise.all(promises);
// }

async function updateCuttingOrderItems(
  tx,
  cuttingOrderItems,
  cuttingOrder,
  userId,
  branchId,
  storeId
) {
  const promises = cuttingOrderItems.map(async (orderDetail) => {
    const orderQty = orderDetail?.orderQty
      ? Math.round(parseFloat(orderDetail.orderQty))
      : null;

    const sizes = orderDetail?.sizeDetails || [];

    // =========================================================
    // 1️⃣ UPDATE EXISTING CUTTING ORDER ITEM
    // =========================================================
    if (orderDetail.id) {
      const updatedItem = await tx.cuttingOrderItems.update({
        where: { id: parseInt(orderDetail.id) },
        data: {
          cuttingOrderId: parseInt(cuttingOrder.id),
          fabricId: orderDetail?.fabricId
            ? parseInt(orderDetail.fabricId)
            : null,
          styleId: orderDetail?.styleId ? parseInt(orderDetail.styleId) : null,
          styleItemId: orderDetail?.styleItemId
            ? parseInt(orderDetail.styleItemId)
            : null,
          uomId: orderDetail?.uomId ? parseInt(orderDetail.uomId) : null,
          colorId: orderDetail?.colorId ? parseInt(orderDetail.colorId) : null,
          fabWidth: orderDetail?.fabWidth
            ? parseFloat(orderDetail.fabWidth)
            : null,
          fabMeter: orderDetail?.fabMeter
            ? parseFloat(orderDetail.fabMeter)
            : null,
          portionId: orderDetail?.portionId
            ? parseInt(orderDetail.portionId)
            : null,
          orderQty,
          remarks: orderDetail?.remarks ?? undefined,
          invNo: orderDetail?.invNo ? orderDetail?.invNo : null,
        },
      });

      // =========================================================
      // 2️⃣ Handle sizeDetails (Update / Insert / Delete)
      // =========================================================

      // Fetch all existing size rows
      const existingSizes = await tx.sizeDetails.findMany({
        where: { cuttingOrderItemsId: updatedItem.id },
      });

      // Create map for faster match
      const existingMap = new Map();
      existingSizes.forEach((s) => existingMap.set(s.sizeId, s));

      // Loop through incoming sizes
      for (const s of sizes) {
        if (existingMap.has(s.sizeId)) {
          // Update existing
          await tx.sizeDetails.update({
            where: { id: existingMap.get(s.sizeId).id },
            data: {
              qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
            },
          });

          existingMap.delete(s.sizeId);
        } else {
          // Insert new
          await tx.sizeDetails.create({
            data: {
              sizeId: parseInt(s.sizeId),
              qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
              cuttingOrderItemsId: updatedItem.id,
            },
          });
        }
      }

      // Delete removed sizes
      for (const leftover of existingMap.values()) {
        await tx.sizeDetails.delete({
          where: { id: leftover.id },
        });
      }

      return updatedItem;
    }

    // =========================================================
    // 3️⃣ CREATE NEW CUTTING ORDER ITEM
    // =========================================================
    else {
      const createdItem = await tx.cuttingOrderItems.create({
        data: {
          cuttingOrderId: parseInt(cuttingOrder.id),
          fabricId: orderDetail?.fabricId
            ? parseInt(orderDetail.fabricId)
            : null,
          styleId: orderDetail?.styleId ? parseInt(orderDetail.styleId) : null,
          styleItemId: orderDetail?.styleItemId
            ? parseInt(orderDetail.styleItemId)
            : null,
          uomId: orderDetail?.uomId ? parseInt(orderDetail.uomId) : null,
          colorId: orderDetail?.colorId ? parseInt(orderDetail.colorId) : null,
          fabWidth: orderDetail?.fabWidth
            ? parseFloat(orderDetail.fabWidth)
            : null,
          fabMeter: orderDetail?.fabMeter
            ? parseFloat(orderDetail.fabMeter)
            : null,
          portionId: orderDetail?.portionId
            ? parseInt(orderDetail.portionId)
            : null,
          orderQty,
          remarks: orderDetail?.remarks ?? undefined,
          invNo: orderDetail?.invNo ? orderDetail?.invNo : null,
        },
      });

      // Insert all new sizes
      for (const s of sizes) {
        await tx.sizeDetails.create({
          data: {
            sizeId: parseInt(s.sizeId),
            qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
            cuttingOrderItemsId: createdItem.id,
          },
        });
      }

      return createdItem;
    }
  });

  return Promise.all(promises);
}

async function remove(id) {
  console.log(id, "id");
  const data = await prisma.cuttingOrder.delete({
    where: {
      id: parseInt(id),
    },
  });
  console.log(data, "data");

  return { statusCode: 0, data };
}

async function getStyleDetail(req) {
  const { styleId, branchId, storeId } = req.query;
  let data = await prisma.cuttingOrder.findFirst({
    where: {
      styleId: parseInt(styleId),
      branchId: parseInt(branchId),
      storeId: parseInt(storeId),
    },
    include: {
      cuttingOrderItems: {
        select: {
          // sizeDetails: true,
          id: true,
          cuttingOrderId: true,
          styleItemId: true,
          fabricId: true,
          colorId: true,
          sizeId: true,
          // fabWidth: true,
          // fabMeter: true,
          portionId: true,
          styleId: true,
          orderQty: true,
          remarks: true,
          invNo: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("CuttingOrder");
  return {
    statusCode: 0,
    data: {
      ...data,
    },
  };
}

export { get, getOne, create, update, remove, getStyleDetail };
