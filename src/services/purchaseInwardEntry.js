import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getYearShortCode,
  getDateFromDateTime,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
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
    lastObject = await prisma.purchaseInward.findFirst({
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
    )}/PI/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PI/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.purchaseInward.findFirst({
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
    )}/PI/1`;
    if (lastObject) {
      if (lastObject.docId === "Draft Save") {
        const records = await prisma.purchaseInward.findMany({
          select: {
            docId: true,
          },
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
        });
        const maxDocId = records.reduce((max, current) => {
          const currentNo = Number(current.docId.split("/").pop());
          const maxNo = max ? Number(max.split("/").pop()) : 0;

          return currentNo > maxNo ? current.docId : max;
        }, null);
        newDocId = `${branchObj.branchCode}${getYearShortCode(
          new Date()
        )}/PI/${parseInt(maxDocId.split("/").at(-1)) + 1}`;
      } else {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PI/${
          parseInt(lastObject.docId.split("/").at(-1)) + 1
        }`;
      }
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
    searchStore,
    searchStyleId,
    searchInwardType,
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
    finYearDate?.endDateEndTime
  );
  let data;
  let totalCount;
  data = await prisma.purchaseInward.findMany({
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
      inwardType: Boolean(searchInwardType)
        ? { contains: searchInwardType }
        : undefined,
      invNo: Boolean(searchInvNo) ? { contains: searchInvNo } : undefined,
      Store: {
        storeName: searchStore ? { contains: searchStore } : undefined,
      },
      Supplier: {
        name: searchSupplier ? { contains: searchSupplier } : undefined,
      },
    },
    include: {
      Store: {
        select: {
          id: true,
          storeName: true,
        },
      },
      fabricInwardItems: true,
      readyGoods: true,
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
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate)
    );
  }
  if (searchStyleId) {
    const styleIdNumber = Number(searchStyleId);
    data = data.filter((item) => {
      return item.inwardType === "Finished Goods"
        ? item.readyGoods?.some(
            (style) => Number(style.styleId) === styleIdNumber
          )
        : item.fabricInwardItems?.some(
            (style) => Number(style.styleId) === styleIdNumber
          );
    });
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
  const data = await prisma.purchaseInward.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
          storeName: true,
        },
      },
      Branch: {
        select: {
          branchName: true,
        },
      },
      Supplier: {
        select: {
          name: true,
        },
      },
      fabricInwardItems: {
        select: {
          materialStocks: true,
          id: true,
          purchaseInwardId: true,
          styleNo: true,
          fabricId: true,
          styleItemId: true,
          styleId: true,
          colorId: true,
          fabWidth: true,
          fabMeter: true,
          sizeId: true,
          noOfPcs: true,
          accessoryId: true,
          accessoryGroupId: true,
          accessoryItemId: true,
          sizeId: true,
          uomId: true,
          qty: true,
          price: true,
          Fabric: true,
          Color: true,
          StyleItem: true,
          Accessory: true,
          AccessoryGroup: true,
          Uom: true,
          Size: true,
          filePath: true,
          portionId: true,
          Style: true,
          Portion: true,
        },
      },
      readyGoods: {
        select: {
          Stock: true,
          id: true,
          purchaseInwardId: true,
          styleId: true,
          sizeId: true,
          qty: true,
          styleNo: true,
          fabricId: true,
          styleItemId: true,
          colorId: true,
          Style: true,
          StyleItem: true,
          Fabric: true,
          Size: true,
          Color: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Purchase Inward");
  const itemWithStkQty = await Promise.all(
    data.fabricInwardItems.map(async (item) => {
      const childRecordPlan = await prisma.cuttingOrderItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          fabricId: item.fabricId,
          portionId: item.portionId,
        },
      });
      const childRecordDelivery = await prisma.cuttingDeliveryItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          fabricId: item.fabricId,
          portionId: item.portionId,
        },
      });
      const childRecordReturn = await prisma.purchaseReturnItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
          fabricId: item.fabricId,
          portionId: item.portionId,
          accessoryGroupId: item.accessoryGroupId,
          accessoryId: item.accessoryId,
        },
      });
      const minDelivery = await prisma.cuttingDeliveryItems.aggregate({
        where: {
          styleId: item.styleId,
          fabricId: item.fabricId,
          portionId: item.portionId,
        },
        _sum: {
          usedMeter: true,
        },
      });
      const minReturn = await prisma.purchaseReturnItems.aggregate({
        where: {
          styleId: item.styleId,
          fabricId: item.fabricId,
          portionId: item.portionId,
        },
        _sum: {
          returnFabMeter: true,
        },
      });
      return {
        ...item,
        stockQty:
          childRecordPlan + childRecordDelivery + childRecordReturn || 0,
        minQty:
          (minDelivery._sum.usedMeter || 0) +
          (minReturn._sum.returnFabMeter || 0),
      };
    })
  );
  const goodsWithStkQty = await Promise.all(
    data.readyGoods.map(async (item) => {
      const childRecordSales = await prisma.salesEntryItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          fabricId: item.fabricId,
          styleItemId: item.styleItemId,
        },
      });
      const childRecordAdjustment = await prisma.stockAdjustmentItems.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          fabricId: item.fabricId,
          styleItemId: item.styleItemId,
        },
      });
      const childRecordReturn = await prisma.returnGoods.count({
        where: {
          styleId: item.styleId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          styleItemId: item.styleItemId,
          fabricId: item.fabricId,
        },
      });
      const minDelivery = await prisma.salesEntryItems.aggregate({
        where: {
          styleId: item.styleId,
          fabricId: item.fabricId,
          colorId: item.colorId,
          sizeId: item.sizeId,
          styleItemId: item.styleItemId,
        },
        _sum: {
          qty: true,
        },
      });
      const minReturn = await prisma.returnGoods.aggregate({
        where: {
          styleId: item.styleId,
          fabricId: item.fabricId,
          colorId: item.colorId,
          sizeId: item.sizeId,
          styleItemId: item.styleItemId,
        },
        _sum: {
          returnQty: true,
        },
      });
      const minAdjust = await prisma.stockAdjustmentItems.aggregate({
        where: {
          styleId: item.styleId,
          fabricId: item.fabricId,
          colorId: item.colorId,
          sizeId: item.sizeId,
          styleItemId: item.styleItemId,
        },
        _sum: {
          adjQty: true,
        },
      });
      return {
        ...item,
        usedQty:
          childRecordSales + childRecordAdjustment + childRecordReturn || 0,
        minQty:
          (minDelivery._sum.qty || 0) +
          (minReturn._sum.returnQty || 0) +
          (minAdjust._sum.adjQty || 0),
      };
    })
  );
  const styleIds = data.fabricInwardItems
    .map((item) => item.styleId)
    .filter(Boolean);
  const goodsStyleIds = data.readyGoods
    .map((item) => item.styleId)
    .filter(Boolean);
  const accessoryIds = data.fabricInwardItems
    .map((item) => item.accessoryId)
    .filter(Boolean);
  const childRecordCutPlan = await prisma.cuttingOrderItems.count({
    where: {
      styleId: {
        in: styleIds,
      },
    },
  });
  const childRecordCutDelivery = await prisma.cuttingDeliveryItems.count({
    where: {
      styleId: {
        in: styleIds,
      },
    },
  });
  const childRecordReturn =
    data?.inwardType === "Finished Goods"
      ? await prisma.returnGoods.count({
          where: {
            styleId: {
              in: goodsStyleIds,
            },
          },
        })
      : await prisma.purchaseReturnItems.count({
          where: {
            OR: [
              {
                styleId: {
                  in: styleIds,
                },
              },
              {
                accessoryId: {
                  in: accessoryIds,
                },
              },
            ],
          },
        });
  const childRecordSales = await prisma.salesEntryItems.count({
    where: {
      styleId: { in: goodsStyleIds },
    },
  });
  const childRecordStock = await prisma.stockAdjustmentItems.count({
    where: {
      styleId: { in: goodsStyleIds },
    },
  });
  return {
    statusCode: 0,
    data: {
      ...data,
      fabricInwardItems: itemWithStkQty,
      readyGoods: goodsWithStkQty,
      childRecordCutting: childRecordCutDelivery + childRecordCutPlan,
      childRecordReturn: childRecordReturn,
      childRecordSales: childRecordSales,
      childRecordStock: childRecordStock,
    },
  };
}

async function create(req) {
  const {
    userId,
    branchId,
    storeId,
    locationId,
    docDate,
    supplierId,
    inwardType,
    dcNo,
    dcDate,
    remarks,
    vehicleNo,
    fabricInwardItems,
    readyGoods,
    finYearId,
    draftSave,
    invNo,
  } = await req.body;
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
  await prisma.$transaction(async (tx) => {
    data = await tx.purchaseInward.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        locationId: parseInt(locationId),
        storeId: parseInt(storeId),
        supplierId: parseInt(supplierId),
        inwardType,
        dcNo,
        dcDate: dcDate ? new Date(dcDate) : null,
        remarks,
        vehicleNo,
        invNo,
      },
    });
    if (inwardType === "Finished Goods") {
      await createReadyGoods(
        tx,
        readyGoods,
        data,
        userId,
        branchId,
        storeId,
        invNo
      );
    } else {
      await createPurchaseInwardItems(
        tx,
        fabricInwardItems,
        data,
        userId,
        branchId,
        storeId,
        inwardType,
        invNo
      );
    }
  });
  return { statusCode: 0, data };
}

async function createPurchaseInwardItems(
  tx,
  fabricInwardItems,
  fabricInward,
  userId,
  branchId,
  storeId,
  inwardType,
  invNo
) {
  const promises = JSON.parse(fabricInwardItems).map(
    async (inwardDetails, index) => {
      const createdItem = await tx.fabricInwardItems.create({
        data: {
          purchaseInwardId: parseInt(fabricInward.id),
          styleNo: inwardDetails?.styleNo ?? undefined,
          fabricId: inwardDetails?.fabricId
            ? parseInt(inwardDetails.fabricId)
            : null,
          styleItemId: inwardDetails?.styleItemId
            ? parseInt(inwardDetails.styleItemId)
            : null,
          styleId: inwardDetails?.styleId
            ? parseInt(inwardDetails.styleId)
            : null,
          colorId: inwardDetails?.colorId
            ? parseInt(inwardDetails.colorId)
            : null,
          fabWidth: inwardDetails?.fabWidth
            ? parseFloat(inwardDetails.fabWidth)
            : null,
          fabMeter: inwardDetails?.fabMeter
            ? parseFloat(inwardDetails.fabMeter)
            : null,
          noOfPcs: inwardDetails?.noOfPcs
            ? parseInt(inwardDetails.noOfPcs)
            : null,
          accessoryId: inwardDetails?.accessoryId
            ? parseInt(inwardDetails.accessoryId)
            : null,
          accessoryGroupId: inwardDetails?.accessoryGroupId
            ? parseInt(inwardDetails.accessoryGroupId)
            : null,
          sizeId: inwardDetails?.sizeId ? parseInt(inwardDetails.sizeId) : null,
          qty: inwardDetails?.qty ? parseFloat(inwardDetails.qty) : 0,
          uomId: inwardDetails?.uomId ? parseInt(inwardDetails.uomId) : null,
          price: inwardDetails?.price ? parseInt(inwardDetails.price) : null,
          filePath: inwardDetails?.filePath
            ? inwardDetails?.filePath
            : undefined,
          invNo: invNo ? invNo : undefined,
          portionId: inwardDetails?.portionId
            ? parseInt(inwardDetails.portionId)
            : null,
        },
      });
      // Create corresponding Stock row
      await tx.materialStock.create({
        data: {
          inOrOut: inwardType + "Inward" || "MaterialInward",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          fabricInwardItemsId: createdItem.id,
          styleNo: inwardDetails?.styleNo ?? undefined,
          fabricId: inwardDetails?.fabricId
            ? parseInt(inwardDetails.fabricId)
            : null,
          styleItemId: inwardDetails?.styleItemId
            ? parseInt(inwardDetails.styleItemId)
            : null,
          styleId: inwardDetails?.styleId
            ? parseInt(inwardDetails.styleId)
            : null,
          colorId: inwardDetails?.colorId
            ? parseInt(inwardDetails.colorId)
            : null,
          fabWidth: inwardDetails?.fabWidth
            ? parseFloat(inwardDetails.fabWidth)
            : null,
          fabMeter: inwardDetails?.fabMeter
            ? parseFloat(inwardDetails.fabMeter)
            : null,
          noOfPcs: inwardDetails?.noOfPcs
            ? parseInt(inwardDetails.noOfPcs)
            : null,
          accessoryId: inwardDetails?.accessoryId
            ? parseInt(inwardDetails.accessoryId)
            : null,
          accessoryGroupId: inwardDetails?.accessoryGroupId
            ? parseInt(inwardDetails.accessoryGroupId)
            : null,
          sizeId: inwardDetails?.sizeId ? parseInt(inwardDetails.sizeId) : null,
          qty: inwardDetails?.qty ? parseFloat(inwardDetails.qty) : 0,
          uomId: inwardDetails?.uomId ? parseInt(inwardDetails.uomId) : null,
          price: inwardDetails?.price ? parseInt(inwardDetails.price) : null,
          filePath: inwardDetails?.filePath
            ? inwardDetails?.filePath
            : undefined,
          invNo: invNo ? invNo : undefined,
          itemType: inwardType ? inwardType : undefined,
          portionId: inwardDetails?.portionId
            ? parseInt(inwardDetails.portionId)
            : null,
        },
      });

      return createdItem;
    }
  );

  return Promise.all(promises);
}

async function createReadyGoods(
  tx,
  readyGoods,
  purchaseInward,
  userId,
  branchId,
  storeId,
  invNo
) {
  const promises = JSON.parse(readyGoods).map(async (stockDetail, index) => {
    const qty = stockDetail?.qty
      ? Math.round(parseFloat(stockDetail.qty))
      : null;
    const createdItem = await tx.readyGoods.create({
      data: {
        purchaseInwardId: parseInt(purchaseInward.id),
        styleNo: stockDetail?.styleNo ?? undefined,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        qty,
        invNo: invNo ? invNo : "",
      },
    });

    // Create corresponding Stock row
    await tx.stock.create({
      data: {
        inOrOut: "PurchaseGoods",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        fabricId: stockDetail?.fabricId ? parseInt(stockDetail.fabricId) : null,
        qty,
        readyGoodsId: createdItem.id,
        styleNo: stockDetail?.styleNo ?? undefined,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
      },
    });

    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, fabricInwardItems) {
  let removedItems = dataFound.fabricInwardItems.filter((oldItem) => {
    let result = JSON.parse(fabricInwardItems).find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id)
    );
    if (result) return false;
    return true;
  });
  return removedItems;
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
    userId,
    branchId,
    storeId,
    locationId,
    docDate,
    supplierId,
    inwardType,
    dcNo,
    dcDate,
    remarks,
    vehicleNo,
    fabricInwardItems,
    readyGoods,
    invNo,
  } = await body;
  let data;
  const dataFound = await prisma.purchaseInward.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      fabricInwardItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("Purchase Inward");

  let removedItems = findRemovedItems(dataFound, fabricInwardItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.fabricInwardItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.purchaseInward.update({
      where: {
        id: parseInt(id),
      },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        updatedById: parseInt(userId),
        storeId: parseInt(storeId),
        branchId: parseInt(branchId),
        locationId: parseInt(locationId),
        supplierId: parseInt(supplierId),
        inwardType,
        dcNo,
        dcDate: dcDate ? new Date(dcDate) : null,
        remarks,
        vehicleNo,
        invNo,
      },
    });
    if (inwardType === "Finished Goods") {
      await updateReadyGoods(
        tx,
        readyGoods,
        data,
        userId,
        branchId,
        storeId,
        invNo
      );
    } else {
      await updateFabricInwardItems(
        tx,
        fabricInwardItems,
        data,
        userId,
        branchId,
        storeId,
        inwardType,
        invNo
      );
    }
  });
  return { statusCode: 0, data };
}

async function updateFabricInwardItems(
  tx,
  fabricInwardItems,
  fabricInward,
  userId,
  branchId,
  storeId,
  inwardType,
  invNo
) {
  const promises = JSON.parse(fabricInwardItems).map(async (inwardDetails) => {
    if (inwardDetails.id) {
      // Update existing FabricInwardItem
      const updatedItem = await tx.fabricInwardItems.update({
        where: { id: parseInt(inwardDetails.id) },

        data: {
          purchaseInwardId: parseInt(fabricInward.id),
          styleNo: inwardDetails?.styleNo ?? undefined,
          fabricId: inwardDetails?.fabricId
            ? parseInt(inwardDetails.fabricId)
            : null,
          styleItemId: inwardDetails?.styleItemId
            ? parseInt(inwardDetails.styleItemId)
            : null,
          styleId: inwardDetails?.styleId
            ? parseInt(inwardDetails.styleId)
            : null,
          colorId: inwardDetails?.colorId
            ? parseInt(inwardDetails.colorId)
            : null,
          fabWidth: inwardDetails?.fabWidth
            ? parseFloat(inwardDetails.fabWidth)
            : null,
          fabMeter: inwardDetails?.fabMeter
            ? parseFloat(inwardDetails.fabMeter)
            : null,
          noOfPcs: inwardDetails?.noOfPcs
            ? parseInt(inwardDetails.noOfPcs)
            : null,
          accessoryId: inwardDetails?.accessoryId
            ? parseInt(inwardDetails.accessoryId)
            : null,
          accessoryGroupId: inwardDetails?.accessoryGroupId
            ? parseInt(inwardDetails.accessoryGroupId)
            : null,
          sizeId: inwardDetails?.sizeId ? parseInt(inwardDetails.sizeId) : null,
          qty: inwardDetails?.qty ? parseFloat(inwardDetails.qty) : 0,
          uomId: inwardDetails?.uomId ? parseInt(inwardDetails.uomId) : null,
          price: inwardDetails?.price ? parseInt(inwardDetails.price) : null,
          filePath: inwardDetails?.filePath
            ? inwardDetails?.filePath
            : undefined,
          invNo: invNo ? invNo : undefined,
          portionId: inwardDetails?.portionId
            ? parseInt(inwardDetails.portionId)
            : null,
        },
      });

      // Update or create Stock row
      const existingStock = await tx.materialStock.findFirst({
        where: { fabricInwardItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.materialStock.update({
          where: { id: existingStock.id },
          data: {
            updatedById: parseInt(userId),
            branchId: parseInt(branchId),
            storeId: parseInt(storeId),
            styleNo: inwardDetails?.styleNo ?? undefined,
            fabricId: inwardDetails?.fabricId
              ? parseInt(inwardDetails.fabricId)
              : null,
            styleItemId: inwardDetails?.styleItemId
              ? parseInt(inwardDetails.styleItemId)
              : null,
            styleId: inwardDetails?.styleId
              ? parseInt(inwardDetails.styleId)
              : null,
            colorId: inwardDetails?.colorId
              ? parseInt(inwardDetails.colorId)
              : null,
            fabWidth: inwardDetails?.fabWidth
              ? parseFloat(inwardDetails.fabWidth)
              : null,
            fabMeter: inwardDetails?.fabMeter
              ? parseFloat(inwardDetails.fabMeter)
              : null,
            noOfPcs: inwardDetails?.noOfPcs
              ? parseInt(inwardDetails.noOfPcs)
              : null,
            accessoryId: inwardDetails?.accessoryId
              ? parseInt(inwardDetails.accessoryId)
              : null,
            accessoryGroupId: inwardDetails?.accessoryGroupId
              ? parseInt(inwardDetails.accessoryGroupId)
              : null,
            sizeId: inwardDetails?.sizeId
              ? parseInt(inwardDetails.sizeId)
              : null,
            qty: inwardDetails?.qty ? parseFloat(inwardDetails.qty) : 0,
            uomId: inwardDetails?.uomId ? parseInt(inwardDetails.uomId) : null,
            price: inwardDetails?.price ? parseInt(inwardDetails.price) : null,
            inOrOut: inwardType + "Inward" || "MaterialInward",
            filePath: inwardDetails?.filePath
              ? inwardDetails?.filePath
              : undefined,
            invNo: invNo ? invNo : undefined,
            itemType: inwardType ? inwardType : undefined,
            portionId: inwardDetails?.portionId
              ? parseInt(inwardDetails.portionId)
              : null,
          },
        });
      } else {
        await tx.materialStock.create({
          data: {
            inOrOut: inwardType + "Inward" || "MaterialInward",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            storeId: parseInt(storeId),
            fabricInwardItemsId: createdItem.id,
            styleNo: inwardDetails?.styleNo ?? undefined,
            fabricId: inwardDetails?.fabricId
              ? parseInt(inwardDetails.fabricId)
              : null,
            styleItemId: inwardDetails?.styleItemId
              ? parseInt(inwardDetails.styleItemId)
              : null,
            styleId: inwardDetails?.styleId
              ? parseInt(inwardDetails.styleId)
              : null,
            colorId: inwardDetails?.colorId
              ? parseInt(inwardDetails.colorId)
              : null,
            fabWidth: inwardDetails?.fabWidth
              ? parseFloat(inwardDetails.fabWidth)
              : null,
            fabMeter: inwardDetails?.fabMeter
              ? parseFloat(inwardDetails.fabMeter)
              : null,
            noOfPcs: inwardDetails?.noOfPcs
              ? parseInt(inwardDetails.noOfPcs)
              : null,
            accessoryId: inwardDetails?.accessoryId
              ? parseInt(inwardDetails.accessoryId)
              : null,
            accessoryGroupId: inwardDetails?.accessoryGroupId
              ? parseInt(inwardDetails.accessoryGroupId)
              : null,
            sizeId: inwardDetails?.sizeId
              ? parseInt(inwardDetails.sizeId)
              : null,
            qty: inwardDetails?.qty ? parseFloat(inwardDetails.qty) : 0,
            uomId: inwardDetails?.uomId ? parseInt(inwardDetails.uomId) : null,
            price: inwardDetails?.price ? parseInt(inwardDetails.price) : null,
            filePath: inwardDetails?.filePath
              ? inwardDetails?.filePath
              : undefined,
            invNo: invNo ? invNo : undefined,
            itemType: inwardType ? inwardType : undefined,
            portionId: inwardDetails?.portionId
              ? parseInt(inwardDetails.portionId)
              : null,
          },
        });
      }

      return updatedItem;
    } else {
      // Create new FabricInwardItem
      const createdItem = await tx.fabricInwardItems.create({
        data: {
          purchaseInwardId: parseInt(fabricInward.id),
          styleNo: inwardDetails?.styleNo ?? undefined,
          fabricId: inwardDetails?.fabricId
            ? parseInt(inwardDetails.fabricId)
            : null,
          styleItemId: inwardDetails?.styleItemId
            ? parseInt(inwardDetails.styleItemId)
            : null,
          styleId: inwardDetails?.styleId
            ? parseInt(inwardDetails.styleId)
            : null,
          colorId: inwardDetails?.colorId
            ? parseInt(inwardDetails.colorId)
            : null,
          fabWidth: inwardDetails?.fabWidth
            ? parseFloat(inwardDetails.fabWidth)
            : null,
          fabMeter: inwardDetails?.fabMeter
            ? parseFloat(inwardDetails.fabMeter)
            : null,
          noOfPcs: inwardDetails?.noOfPcs
            ? parseInt(inwardDetails.noOfPcs)
            : null,
          accessoryId: inwardDetails?.accessoryId
            ? parseInt(inwardDetails.accessoryId)
            : null,
          accessoryGroupId: inwardDetails?.accessoryGroupId
            ? parseInt(inwardDetails.accessoryGroupId)
            : null,
          sizeId: inwardDetails?.sizeId ? parseInt(inwardDetails.sizeId) : null,
          qty: inwardDetails?.qty ? parseFloat(inwardDetails.qty) : 0,
          uomId: inwardDetails?.uomId ? parseInt(inwardDetails.uomId) : null,
          price: inwardDetails?.price ? parseInt(inwardDetails.price) : null,
          filePath: inwardDetails?.filePath
            ? inwardDetails?.filePath
            : undefined,
          invNo: invNo ? invNo : undefined,
          portionId: inwardDetails?.portionId
            ? parseInt(inwardDetails.portionId)
            : null,
        },
      });

      // Create Stock row
      await tx.materialStock.create({
        data: {
          inOrOut: inwardType + "Inward" || "MaterialInward",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          fabricInwardItemsId: createdItem.id,
          styleNo: inwardDetails?.styleNo ?? undefined,
          fabricId: inwardDetails?.fabricId
            ? parseInt(inwardDetails.fabricId)
            : null,
          styleItemId: inwardDetails?.styleItemId
            ? parseInt(inwardDetails.styleItemId)
            : null,
          styleId: inwardDetails?.styleId
            ? parseInt(inwardDetails.styleId)
            : null,
          colorId: inwardDetails?.colorId
            ? parseInt(inwardDetails.colorId)
            : null,
          fabWidth: inwardDetails?.fabWidth
            ? parseFloat(inwardDetails.fabWidth)
            : null,
          fabMeter: inwardDetails?.fabMeter
            ? parseFloat(inwardDetails.fabMeter)
            : null,
          noOfPcs: inwardDetails?.noOfPcs
            ? parseInt(inwardDetails.noOfPcs)
            : null,
          accessoryId: inwardDetails?.accessoryId
            ? parseInt(inwardDetails.accessoryId)
            : null,
          accessoryGroupId: inwardDetails?.accessoryGroupId
            ? parseInt(inwardDetails.accessoryGroupId)
            : null,
          sizeId: inwardDetails?.sizeId ? parseInt(inwardDetails.sizeId) : null,
          qty: inwardDetails?.qty ? parseFloat(inwardDetails.qty) : 0,
          uomId: inwardDetails?.uomId ? parseInt(inwardDetails.uomId) : null,
          price: inwardDetails?.price ? parseInt(inwardDetails.price) : null,
          filePath: inwardDetails?.filePath
            ? inwardDetails?.filePath
            : undefined,
          invNo: invNo ? invNo : undefined,
          itemType: inwardType ? inwardType : undefined,
          portionId: inwardDetails?.portionId
            ? parseInt(inwardDetails.portionId)
            : null,
        },
      });

      return createdItem;
    }
  });

  return Promise.all(promises);
}

async function updateReadyGoods(
  tx,
  readyGoods,
  purchaseInward,
  userId,
  branchId,
  storeId,
  invNo
) {
  const parsedReadyGoods = JSON.parse(readyGoods || "[]");
  const existingRows = await tx.readyGoods.findMany({
    where: { purchaseInwardId: parseInt(purchaseInward.id) },
    select: { id: true },
  });
  const existingIds = existingRows.map((r) => r.id);
  const incomingIds = parsedReadyGoods
    .filter((r) => r.id)
    .map((r) => parseInt(r.id));
  const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));
  if (idsToDelete.length > 0) {
    // Delete stock first (FK dependency)
    await tx.stock.deleteMany({
      where: { readyGoodsId: { in: idsToDelete } },
    });

    // Delete ready goods
    await tx.readyGoods.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }
  const promises = JSON.parse(readyGoods).map(async (stockDetail) => {
    const qty = stockDetail?.qty
      ? Math.round(parseFloat(stockDetail.qty))
      : null;

    if (stockDetail.id) {
      // Update existing OpeningStockItem
      const updatedItem = await tx.readyGoods.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          purchaseInwardId: parseInt(purchaseInward.id),
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
          qty,
          invNo: invNo ? invNo : "",
        },
      });

      // Update or create Stock row
      const existingStock = await tx.stock.findFirst({
        where: { readyGoodsId: updatedItem.id },
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
            qty,
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
            inOrOut: "PurchaseGoods",
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
            readyGoodsId: updatedItem.id,
            styleNo: stockDetail?.styleNo ?? undefined,
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
      const createdItem = await tx.readyGoods.create({
        data: {
          purchaseInwardId: parseInt(purchaseInward.id),
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty,
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleNo: stockDetail?.styleNo ?? undefined,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          invNo: invNo ? invNo : "",
        },
      });

      // Create Stock row
      await tx.stock.create({
        data: {
          inOrOut: "PurchaseGoods",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          fabricId: stockDetail?.fabricId
            ? parseInt(stockDetail.fabricId)
            : null,
          styleId: stockDetail?.styleId ? parseInt(stockDetail.styleId) : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          qty,
          readyGoodsId: createdItem.id,
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

async function remove(id) {
  const data = await prisma.purchaseInward.delete({
    where: {
      id: parseInt(id),
    },
  });

  return { statusCode: 0, data };
}

async function getPurchaseDetail(req) {
  const { invNo, storeId, branchId } = req.query;

  // 1️⃣ First try fetching by styleNo
  let data = await prisma.purchaseInward.findFirst({
    where: {
      invNo: invNo,
    },
    include: {
      fabricInwardItems: {
        select: {
          materialStocks: true,
          id: true,
          purchaseInwardId: true,
          styleNo: true,
          fabricId: true,
          styleItemId: true,
          styleId: true,
          colorId: true,
          fabWidth: true,
          fabMeter: true,
          sizeId: true,
          noOfPcs: true,
          accessoryId: true,
          accessoryGroupId: true,
          accessoryItemId: true,
          sizeId: true,
          uomId: true,
          qty: true,
          price: true,
          Fabric: true,
          Color: true,
          StyleItem: true,
          Accessory: true,
          AccessoryGroup: true,
          Uom: true,
          Size: true,
          filePath: true,
        },
      },
      supplierId: true,
      inwardType: true,
    },
  });

  if (!data) return NoRecordFound("Purchase Inward");
  return {
    statusCode: 0,
    data: {
      ...data,
    },
  };
}

async function getPurchaseDetailStock(req) {
  const { invNo, storeId, branchId, returnType } = req.query;

  let purchaseData = await prisma.purchaseInward.findFirst({
    where: {
      invNo: invNo,
      inwardType: returnType,
    },
    include: {
      readyGoods: true,
    },
  });
  if (!purchaseData || purchaseData.length === 0)
    return NoRecordFound("Invoice");
  let data;
  const isMaterial =
    returnType?.toLowerCase().includes("fabric") ||
    returnType?.toLowerCase().includes("accessory");
  if (isMaterial) {
    data = await prisma.materialStock.groupBy({
      by: [
        "fabricId",
        "colorId",
        "fabWidth",
        "accessoryId",
        "accessoryGroupId",
        "sizeId",
        "uomId",
        "styleId",
        "invNo",
        "portionId",
      ],
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        storeId: storeId ? parseInt(storeId) : undefined,
        invNo: invNo,
      },
      _sum: {
        qty: true,
        fabMeter: true,
      },
    });
  } else {
    const rg =
      purchaseData.readyGoods.filter(
        (item) => item.styleId && item.styleItemId && item.sizeId
      ) || [];
    const orConditions = rg.map((item) => ({
      styleId: item.styleId,
      styleItemId: item.styleItemId,
      colorId: item.colorId,
      sizeId: item.sizeId,
    }));
    data = await prisma.stock.groupBy({
      by: [
        "fabricId",
        "colorId",
        "sizeId",
        "styleId",
        "styleItemId",
        "styleNo",
      ],
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        storeId: storeId ? parseInt(storeId) : undefined,
        OR: orConditions,
      },
      _sum: {
        qty: true,
      },
    });
  }

  if (!data || data.length === 0) return NoRecordFound("Invoice not found");

  // 4️⃣ Return formatted result
  return {
    statusCode: 0,
    data: isMaterial
      ? data.map((d) => ({
          invNo: d.invNo,
          styleItemId: d.styleItemId,
          fabricId: d.fabricId,
          colorId: d.colorId,
          sizeId: d.sizeId,
          fabWidth: d.fabWidth,
          fabMeter: d._sum.fabMeter,
          accessoryId: d.accessoryId,
          accessoryGroupId: d.accessoryGroupId,
          sizeId: d.sizeId,
          uomId: d.uomId,
          qty: d._sum.qty,
          styleId: d.styleId,
          portionId: d.portionId,
        }))
      : data.map((d) => ({
          invNo: purchaseData.invNo,
          styleItemId: d.styleItemId,
          fabricId: d.fabricId,
          colorId: d.colorId,
          sizeId: d.sizeId,
          stkQty: d._sum.qty,
          styleId: d.styleId,
          styleNo: d.styleNo,
        })),
    returnType: purchaseData.inwardType,
    supplierId: purchaseData.supplierId,
  };
}

export {
  get,
  getOne,
  create,
  update,
  remove,
  getPurchaseDetail,
  getPurchaseDetailStock,
};
