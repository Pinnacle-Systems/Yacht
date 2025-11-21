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
    lastObject = await prisma.cuttingDelivery.findFirst({
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
    )}/CPD/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CPD/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.cuttingDelivery.findFirst({
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
    )}/CPD/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/CPD/${
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
  data = await prisma.cuttingDelivery.findMany({
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
      cuttingDeliveryItems: true,
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
  const data = await prisma.cuttingDelivery.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      // Store: {
      //   select: {
      //     locationId: true,
      //   },
      // },
      cuttingDeliveryItems: {
        select: {
          id: true,
          cuttingDeliveryId: true,
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
          issueQty: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("CuttingDelivery");
  return {
    statusCode: 0,
    data: {
      ...data,
    },
  };
}

function findRemovedItems(dataFound, cuttingDeliveryItems) {
  let removedItems = dataFound.cuttingDeliveryItems.filter((oldItem) => {
    let result = cuttingDeliveryItems.find(
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
    finYearId,
    cuttingDeliveryItems,
    styleId,
    docDate,
    draftSave,
    cuttingNo,
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

  await prisma.$transaction(async (tx) => {
    data = await tx.cuttingDelivery.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        createdById: parseInt(userId),
        styleId: parseInt(styleId),
        docDate: docDate ? new Date(docDate) : null,
        cuttingNo,
      },
    });
    await createCuttingDeliveryItems(
      tx,
      cuttingDeliveryItems,
      data,
      userId,
      branchId
    );
  });
  return { statusCode: 0, data };
}

async function createCuttingDeliveryItems(
  tx,
  cuttingDeliveryItems,
  cuttingDelivery,
  userId,
  branchId
  // storeId
) {
  const promises = cuttingDeliveryItems.map(async (deliveryDetail, index) => {
    const orderQty = deliveryDetail?.orderQty
      ? Math.round(parseFloat(deliveryDetail.orderQty))
      : null;
    const createdItem = await tx.cuttingDeliveryItems.create({
      data: {
        cuttingDeliveryId: parseInt(cuttingDelivery.id),
        styleId: deliveryDetail?.styleId ?? undefined,
        fabricId: deliveryDetail?.fabricId
          ? parseInt(deliveryDetail.fabricId)
          : null,
        styleItemId: deliveryDetail?.styleItemId
          ? parseInt(deliveryDetail.styleItemId)
          : null,
        sizeId: deliveryDetail?.sizeId ? parseInt(deliveryDetail.sizeId) : null,
        colorId: deliveryDetail?.colorId
          ? parseInt(deliveryDetail.colorId)
          : null,
        fabWidth: deliveryDetail?.fabWidth
          ? parseFloat(deliveryDetail.fabWidth)
          : null,
        fabMeter: deliveryDetail?.fabMeter
          ? parseFloat(deliveryDetail.fabMeter)
          : null,
        portionId: deliveryDetail?.portionId
          ? parseInt(deliveryDetail.portionId)
          : null,
        orderQty,
        issueQty: deliveryDetail?.issueQty
          ? Math.round(parseFloat(deliveryDetail.issueQty))
          : null,
        remarks: deliveryDetail?.remarks ?? undefined,
      },
    });

    // Create corresponding Stock row
    await tx.productionStock.create({
      data: {
        inOrOut: "cuttingDelivery",
        cuttingDeliveryItemsId: createdItem.id,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),

        styleId: deliveryDetail?.styleId ?? undefined,
        fabricId: deliveryDetail?.fabricId
          ? parseInt(deliveryDetail.fabricId)
          : null,
        styleId: deliveryDetail?.styleId
          ? parseInt(deliveryDetail.styleId)
          : null,
        styleItemId: deliveryDetail?.styleItemId
          ? parseInt(deliveryDetail.styleItemId)
          : null,
        sizeId: deliveryDetail?.sizeId ? parseInt(deliveryDetail.sizeId) : null,
        colorId: deliveryDetail?.colorId
          ? parseInt(deliveryDetail.colorId)
          : null,
        fabWidth: deliveryDetail?.fabWidth
          ? parseFloat(deliveryDetail.fabWidth)
          : null,
        fabMeter: deliveryDetail?.fabMeter
          ? parseFloat(deliveryDetail.fabMeter)
          : null,
        portionId: deliveryDetail?.portionId
          ? parseInt(deliveryDetail.portionId)
          : null,
        remarks: deliveryDetail?.remarks ?? undefined,
        qty: deliveryDetail?.issueQty
          ? Math.round(parseFloat(deliveryDetail.issueQty))
          : null,
        orderQty,
      },
    });

    // Create corresponding Stock row
    // await tx.materialStock.create({
    //   data: {
    //     inOrOut: "cuttingReturn",
    //     cuttingDeliveryItemsId: createdItem.id,
    //     createdById: parseInt(userId),
    //     branchId: parseInt(branchId),
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
    //       ? parseFloat(orderDetail.fabMeter)
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
  return await tx.productionStock.deleteMany({
    where: {
      id: {
        in: removeItemsStockIds,
      },
    },
  });
}

async function update(id, body) {
  const {
    userId,
    branchId,
    cuttingDeliveryItems,
    styleId,
    docDate,
    cuttingNo,
  } = await body;
  let data;
  const dataFound = await prisma.cuttingDelivery.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      cuttingDeliveryItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("cuttingDelivery");
  let removedItems = findRemovedItems(dataFound, cuttingDeliveryItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.cuttingDeliveryItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.cuttingDelivery.update({
      where: {
        id: parseInt(id),
      },
      data: {
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        styleId: parseInt(styleId),
        docDate: docDate ? new Date(docDate) : null,
        cuttingNo,
      },
    });
    await updateCuttingDeliveryItems(
      tx,
      cuttingDeliveryItems,
      data,
      userId,
      branchId
    );
  });
  return { statusCode: 0, data };
}

async function updateCuttingDeliveryItems(
  tx,
  cuttingDeliveryItems,
  cuttingDelivery,
  userId,
  branchId
) {
  const promises = cuttingDeliveryItems.map(async (deliveryDetail) => {
    const orderQty = deliveryDetail?.orderQty
      ? Math.round(parseFloat(deliveryDetail.orderQty))
      : null;
    if (deliveryDetail.id) {
      // Update existing cuttingDeliveryItem
      const updatedItem = await tx.cuttingDeliveryItems.update({
        where: { id: parseInt(deliveryDetail.id) },
        data: {
          cuttingDeliveryId: parseInt(cuttingDelivery.id),
          fabricId: deliveryDetail?.fabricId
            ? parseInt(deliveryDetail.fabricId)
            : null,
          styleId: deliveryDetail?.styleId
            ? parseInt(deliveryDetail.styleId)
            : null,
          styleItemId: deliveryDetail?.styleItemId
            ? parseInt(deliveryDetail.styleItemId)
            : null,
          sizeId: deliveryDetail?.sizeId
            ? parseInt(deliveryDetail.sizeId)
            : null,
          colorId: deliveryDetail?.colorId
            ? parseInt(deliveryDetail.colorId)
            : null,
          fabWidth: deliveryDetail?.fabWidth
            ? parseFloat(deliveryDetail.fabWidth)
            : null,
          fabMeter: deliveryDetail?.fabMeter
            ? parseFloat(deliveryDetail.fabMeter)
            : null,
          portionId: deliveryDetail?.portionId
            ? parseInt(deliveryDetail.portionId)
            : null,
          orderQty,
          remarks: deliveryDetail?.remarks ?? undefined,
          issueQty: deliveryDetail?.issueQty
            ? Math.round(parseFloat(deliveryDetail.issueQty))
            : null,
        },
      });

      // Update or create Stock row
      const existingStock = await tx.productionStock.findFirst({
        where: { cuttingDeliveryItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.productionStock.update({
          where: { id: existingStock.id },
          data: {
            updatedById: parseInt(userId),
            styleId: deliveryDetail?.styleId ?? undefined,
            fabricId: deliveryDetail?.fabricId
              ? parseInt(deliveryDetail.fabricId)
              : null,
            styleId: deliveryDetail?.styleId
              ? parseInt(deliveryDetail.styleId)
              : null,
            styleItemId: deliveryDetail?.styleItemId
              ? parseInt(deliveryDetail.styleItemId)
              : null,
            sizeId: deliveryDetail?.sizeId
              ? parseInt(deliveryDetail.sizeId)
              : null,
            colorId: deliveryDetail?.colorId
              ? parseInt(deliveryDetail.colorId)
              : null,
            fabWidth: deliveryDetail?.fabWidth
              ? parseFloat(deliveryDetail.fabWidth)
              : null,
            fabMeter: deliveryDetail?.fabMeter
              ? parseFloat(deliveryDetail.fabMeter)
              : null,
            portionId: deliveryDetail?.portionId
              ? parseInt(deliveryDetail.portionId)
              : null,
            remarks: deliveryDetail?.remarks ?? undefined,
            qty: deliveryDetail?.issueQty
              ? Math.round(parseFloat(deliveryDetail.issueQty))
              : null,
            orderQty,
          },
        });
      } else {
        await tx.productionStock.create({
          data: {
            inOrOut: "cuttingDelivery",
            cuttingDeliveryItemsId: updatedItem.id,
            createdById: parseInt(userId),
            branchId: parseInt(branchId),

            fabricId: deliveryDetail?.fabricId
              ? parseInt(deliveryDetail.fabricId)
              : null,
            styleId: deliveryDetail?.styleId
              ? parseInt(deliveryDetail.styleId)
              : null,
            styleItemId: deliveryDetail?.styleItemId
              ? parseInt(deliveryDetail.styleItemId)
              : null,
            sizeId: deliveryDetail?.sizeId
              ? parseInt(deliveryDetail.sizeId)
              : null,
            colorId: deliveryDetail?.colorId
              ? parseInt(deliveryDetail.colorId)
              : null,
            fabWidth: deliveryDetail?.fabWidth
              ? parseFloat(deliveryDetail.fabWidth)
              : null,
            fabMeter: deliveryDetail?.fabMeter
              ? parseFloat(deliveryDetail.fabMeter)
              : null,
            portionId: deliveryDetail?.portionId
              ? parseInt(deliveryDetail.portionId)
              : null,
            remarks: deliveryDetail?.remarks ?? undefined,
            qty: deliveryDetail?.issueQty
              ? Math.round(parseFloat(deliveryDetail.issueQty))
              : null,
            orderQty,
          },
        });
      }

      // const existingMaterialStock = await tx.materialStock.findFirst({
      //   where: { cuttingDeliveryItemsId: updatedItem.id },
      // });

      // if (existingMaterialStock) {
      //   await tx.materialStock.update({
      //     where: { id: existingMaterialStock.id },
      //     data: {
      //       updatedById: parseInt(userId),
      //       fabricId: orderDetail?.fabricId
      //         ? parseInt(orderDetail.fabricId)
      //         : null,
      //       styleId: orderDetail?.styleId
      //         ? parseInt(orderDetail.styleId)
      //         : null,
      //       styleItemId: orderDetail?.styleItemId
      //         ? parseInt(orderDetail.styleItemId)
      //         : null,
      //       sizeId: orderDetail?.sizeId ? parseInt(orderDetail.sizeId) : null,
      //       colorId: orderDetail?.colorId
      //         ? parseInt(orderDetail.colorId)
      //         : null,
      //       fabWidth: orderDetail?.fabWidth
      //         ? parseFloat(orderDetail.fabWidth)
      //         : null,
      //       fabMeter: orderDetail?.fabMeter
      //         ? parseFloat(orderDetail.fabMeter)
      //         : null,
      //       portionId: orderDetail?.portionId
      //         ? parseInt(orderDetail.portionId)
      //         : null,
      //       remarks: orderDetail?.remarks ?? undefined,
      //     },
      //   });
      // } else {
      //   await tx.materialStock.create({
      //     data: {
      //       inOrOut: "cuttingDelivery",
      //       cuttingDeliveryItemsId: updatedItem.id,
      //       createdById: parseInt(userId),
      //       branchId: parseInt(branchId),
      //       // storeId: parseInt(storeId),
      //       fabricId: orderDetail?.fabricId
      //         ? parseInt(orderDetail.fabricId)
      //         : null,
      //       styleId: orderDetail?.styleId
      //         ? parseInt(orderDetail.styleId)
      //         : null,
      //       styleItemId: orderDetail?.styleItemId
      //         ? parseInt(orderDetail.styleItemId)
      //         : null,
      //       sizeId: orderDetail?.sizeId ? parseInt(orderDetail.sizeId) : null,
      //       colorId: orderDetail?.colorId
      //         ? parseInt(orderDetail.colorId)
      //         : null,
      //       fabWidth: orderDetail?.fabWidth
      //         ? parseFloat(orderDetail.fabWidth)
      //         : null,
      //       fabMeter: orderDetail?.fabMeter
      //         ? parseFloat(orderDetail.fabMeter)
      //         : null,
      //       portionId: orderDetail?.portionId
      //         ? parseInt(orderDetail.portionId)
      //         : null,
      //       remarks: orderDetail?.remarks ?? undefined,
      //     },
      //   });
      // }

      return updatedItem;
    } else {
      // Create new cuttingDeliveryItem
      const createdItem = await tx.cuttingDeliveryItems.create({
        data: {
          cuttingDeliveryId: parseInt(cuttingDelivery.id),

          fabricId: deliveryDetail?.fabricId
            ? parseInt(deliveryDetail.fabricId)
            : null,
          styleId: deliveryDetail?.styleId
            ? parseInt(deliveryDetail.styleId)
            : null,
          styleItemId: deliveryDetail?.styleItemId
            ? parseInt(deliveryDetail.styleItemId)
            : null,
          sizeId: deliveryDetail?.sizeId
            ? parseInt(deliveryDetail.sizeId)
            : null,
          colorId: deliveryDetail?.colorId
            ? parseInt(deliveryDetail.colorId)
            : null,
          fabWidth: deliveryDetail?.fabWidth
            ? parseFloat(deliveryDetail.fabWidth)
            : null,
          fabMeter: deliveryDetail?.fabMeter
            ? parseFloat(deliveryDetail.fabMeter)
            : null,
          portionId: deliveryDetail?.portionId
            ? parseInt(deliveryDetail.portionId)
            : null,
          remarks: deliveryDetail?.remarks ?? undefined,
          orderQty,
          issueQty: deliveryDetail?.issueQty
            ? Math.round(parseFloat(deliveryDetail.issueQty))
            : null,
        },
      });

      // Create Stock row
      await tx.productionStock.create({
        data: {
          inOrOut: "cuttingDelivery",
          cuttingDeliveryItemsId: createdItem.id,
          createdById: parseInt(userId),
          branchId: parseInt(branchId),

          fabricId: deliveryDetail?.fabricId
            ? parseInt(deliveryDetail.fabricId)
            : null,
          styleId: deliveryDetail?.styleId
            ? parseInt(deliveryDetail.styleId)
            : null,
          styleItemId: deliveryDetail?.styleItemId
            ? parseInt(deliveryDetail.styleItemId)
            : null,
          sizeId: deliveryDetail?.sizeId
            ? parseInt(deliveryDetail.sizeId)
            : null,
          colorId: deliveryDetail?.colorId
            ? parseInt(deliveryDetail.colorId)
            : null,
          fabWidth: deliveryDetail?.fabWidth
            ? parseFloat(deliveryDetail.fabWidth)
            : null,
          fabMeter: deliveryDetail?.fabMeter
            ? parseFloat(deliveryDetail.fabMeter)
            : null,
          portionId: deliveryDetail?.portionId
            ? parseInt(deliveryDetail.portionId)
            : null,
          remarks: deliveryDetail?.remarks ?? undefined,
          orderQty,
          qty: deliveryDetail?.issueQty
            ? Math.round(parseFloat(deliveryDetail.issueQty))
            : null,
        },
      });

      // await tx.materialStock.create({
      //   data: {
      //     inOrOut: "cuttingDelivery",
      //     cuttingDeliveryItemsId: createdItem.id,
      //     createdById: parseInt(userId),
      //     branchId: parseInt(branchId),
      //     // storeId: parseInt(storeId),
      //     fabricId: orderDetail?.fabricId
      //       ? parseInt(orderDetail.fabricId)
      //       : null,
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
      //       ? parseFloat(orderDetail.fabMeter)
      //       : null,
      //     portionId: orderDetail?.portionId
      //       ? parseInt(orderDetail.portionId)
      //       : null,
      //     remarks: orderDetail?.remarks ?? undefined,
      //   },
      // });

      return createdItem;
    }
  });

  return Promise.all(promises);
}

async function remove(id) {
  console.log(id, "id");
  const data = await prisma.cuttingDelivery.delete({
    where: {
      id: parseInt(id),
    },
  });
  console.log(data, "data");

  return { statusCode: 0, data };
}

export { getOne, create, update, remove, get };
