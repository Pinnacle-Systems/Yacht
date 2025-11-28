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
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PI/${
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
    searchStore,
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
        },
      },
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
  console.log(newDocId);
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
        },
      });

      return createdItem;
    }
  );

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
  console.log(fabricInwardItems, "fabricInwardItems");

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
  console.log(data, "data");

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
  const { invNo, storeId, branchId } = req.query;

  let data = await prisma.materialStock.groupBy({
    by: [
      "styleNo",
      "styleItemId",
      "fabricId",
      "colorId",
      "fabWidth",
      // "noOfPcs",
      "accessoryId",
      "accessoryGroupId",
      "sizeId",
      "uomId",
      "styleId"
    ],
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      // storeId: storeId ? parseInt(storeId) : undefined,
      invNo: invNo,
    },
    _sum: {
      qty: true,
      fabMeter: true,
    },
  });

  if (!data || data.length === 0) return NoRecordFound("Invoice not found");

  // 4️⃣ Return formatted result
  return {
    statusCode: 0,
    data: data.map((d) => ({
      styleNo: d.styleNo,
      styleItemId: d.styleItemId,
      fabricId: d.fabricId,
      colorId: d.colorId,
      sizeId: d.sizeId,
      fabWidth: d.fabWidth,
      fabMeter: d._sum.fabMeter,
      // noOfPcs: d.noOfPcs,
      accessoryId: d.accessoryId,
      accessoryGroupId: d.accessoryGroupId,
      sizeId: d.sizeId,
      uomId: d.uomId,
      qty: d._sum.qty,
      styleId: d.styleId
    })),
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
