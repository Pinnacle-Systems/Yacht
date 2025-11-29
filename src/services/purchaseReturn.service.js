import { PrismaClient } from "@prisma/client";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { NoRecordFound } from "../configs/Responses.js";

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
    lastObject = await prisma.purchaseReturn.findFirst({
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
    )}/PR/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PR/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.purchaseReturn.findFirst({
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
    searchStore,
    searchReturnType,
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
  data = await prisma.purchaseReturn.findMany({
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
      returnType: Boolean(searchReturnType)
        ? { contains: searchReturnType }
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
      purchaseReturnItems: true,
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
  console.log("error is Here", id);
  const childRecord = 0;
  const data = await prisma.purchaseReturn.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Store: {
        select: {
          locationId: true,
        },
      },
      purchaseReturnItems: {
        select: {
          materialStocks: true,
          id: true,
          purchaseReturnId: true,
          styleNo: true,
          fabricId: true,
          styleItemId: true,
          styleId: true,
          colorId: true,
          fabWidth: true,
          // fabMeter: true,
          sizeId: true,
          noOfPcs: true,
          accessoryId: true,
          accessoryGroupId: true,
          accessoryItemId: true,
          sizeId: true,
          uomId: true,
          // qty: true,
          price: true,
          Fabric: true,
          Color: true,
          StyleItem: true,
          Accessory: true,
          AccessoryGroup: true,
          Uom: true,
          Size: true,
          remarks: true,
          returnFabMeter: true,
          returnQty: true,
        },
      },
      Branch: true,
      Store: true,
      Supplier: true,
    },
  });
  if (!data) return NoRecordFound("PurchaseReturn");
  const purchaseReturnStkQty = await Promise.all(
    data.purchaseReturnItems.map(async (item) => {
      const stkQty = await prisma.materialStock.aggregate({
        where: {
          styleItemId: item.styleItemId,
          fabricId: item.fabricId,
          colorId: item.colorId,
          styleId: item.styleId,
          fabWidth: item.fabWidth,
          invNo: item.invNo,
        },
        _sum: {
          fabMeter: true,
          qty:true
        },
      });
      return {
        ...item,
        fabMeter: stkQty._sum.fabMeter + item.returnFabMeter,
        qty: stkQty._sum.qty + item.returnQty
      };
    })
  );
  return {
    statusCode: 0,
    data: {
      ...data,
      purchaseReturnItems: purchaseReturnStkQty,
      ...{ childRecord },
    },
  };
}

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    locationId,
    docDate,
    supplierId,
    returnType,
    purchaseReturnItems,
    invNo,
    finYearId,
    draftSave,
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
    data = await tx.purchaseReturn.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        locationId: parseInt(locationId),
        storeId: parseInt(storeId),
        supplierId: parseInt(supplierId),
        returnType,
        invNo,
      },
    });
    await createPurchaseReturnItems(
      tx,
      purchaseReturnItems,
      data,
      userId,
      branchId,
      storeId,
      returnType,
      invNo
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
  storeId,
  returnType,
  invNo
) {
  const promises = purchaseReturnItems.map(async (returnDetails, index) => {
    const createdItem = await tx.purchaseReturnItems.create({
      data: {
        purchaseReturnId: parseInt(purchaseReturn.id),
        styleNo: returnDetails?.styleNo ?? undefined,
        fabricId: returnDetails?.fabricId
          ? parseInt(returnDetails.fabricId)
          : null,
        styleItemId: returnDetails?.styleItemId
          ? parseInt(returnDetails.styleItemId)
          : null,
        styleId: returnDetails?.styleId
          ? parseInt(returnDetails.styleId)
          : null,
        colorId: returnDetails?.colorId
          ? parseInt(returnDetails.colorId)
          : null,
        fabWidth: returnDetails?.fabWidth
          ? parseFloat(returnDetails.fabWidth)
          : null,
        fabMeter: returnDetails?.fabMeter
          ? parseFloat(returnDetails.fabMeter)
          : null,
        noOfPcs: returnDetails?.noOfPcs
          ? parseInt(returnDetails.noOfPcs)
          : null,
        accessoryId: returnDetails?.accessoryId
          ? parseInt(returnDetails.accessoryId)
          : null,
        accessoryGroupId: returnDetails?.accessoryGroupId
          ? parseInt(returnDetails.accessoryGroupId)
          : null,
        sizeId: returnDetails?.sizeId ? parseInt(returnDetails.sizeId) : null,
        qty: returnDetails?.qty ? parseFloat(returnDetails.qty) : 0,
        uomId: returnDetails?.uomId ? parseInt(returnDetails.uomId) : null,
        price: returnDetails?.price ? parseInt(returnDetails.price) : null,
        remarks: returnDetails?.remarks ? returnDetails?.remarks : undefined,
        invNo: invNo ? invNo : undefined,
        returnFabMeter: returnDetails?.returnFabMeter
          ? parseFloat(returnDetails.returnFabMeter)
          : null,
        returnQty: returnDetails?.returnQty
          ? parseFloat(returnDetails.returnQty)
          : 0,
      },
    });

    // Create corresponding Stock row
    await tx.materialStock.create({
      data: {
        inOrOut: returnType + "Return" || "MaterialReturn",
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        purchaseReturnItemsId: createdItem.id,
        styleNo: returnDetails?.styleNo ?? undefined,
        fabricId: returnDetails?.fabricId
          ? parseInt(returnDetails.fabricId)
          : null,
        styleItemId: returnDetails?.styleItemId
          ? parseInt(returnDetails.styleItemId)
          : null,
        styleId: returnDetails?.styleId
          ? parseInt(returnDetails.styleId)
          : null,
        colorId: returnDetails?.colorId
          ? parseInt(returnDetails.colorId)
          : null,
        fabWidth: returnDetails?.fabWidth
          ? parseFloat(returnDetails.fabWidth)
          : null,
        fabMeter:
          returnDetails?.returnFabMeter &&
          !isNaN(parseFloat(returnDetails.returnFabMeter))
            ? -Math.abs(parseInt(returnDetails.returnFabMeter))
            : null,
        noOfPcs: returnDetails?.noOfPcs
          ? parseInt(returnDetails.noOfPcs)
          : null,
        accessoryId: returnDetails?.accessoryId
          ? parseInt(returnDetails.accessoryId)
          : null,
        accessoryGroupId: returnDetails?.accessoryGroupId
          ? parseInt(returnDetails.accessoryGroupId)
          : null,
        sizeId: returnDetails?.sizeId ? parseInt(returnDetails.sizeId) : null,
        qty:
          returnDetails?.returnQty &&
          !isNaN(parseFloat(returnDetails.returnQty))
            ? -Math.abs(parseInt(returnDetails.returnQty))
            : null,
        uomId: returnDetails?.uomId ? parseInt(returnDetails.uomId) : null,
        price: returnDetails?.price ? parseInt(returnDetails.price) : null,
        invNo: invNo ? invNo : undefined,
        itemType: returnType ? returnType : undefined,
      },
    });

    return createdItem;
  });

  return Promise.all(promises);
}

function findRemovedItems(dataFound, purchaseReturnItems) {
  let removedItems = dataFound.purchaseReturnItems.filter((oldItem) => {
    let result = purchaseReturnItems.find(
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
    returnType,
    invNo,
    purchaseReturnItems,
  } = await body;
  let data;
  const dataFound = await prisma.purchaseReturn.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      purchaseReturnItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("Purchase Return");
  console.log(purchaseReturnItems, "purchaseReturnItems");

  let removedItems = findRemovedItems(dataFound, purchaseReturnItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.purchaseReturnItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.purchaseReturn.update({
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
        returnType,
        invNo,
      },
    });
    await updatepurchaseReturnItems(
      tx,
      purchaseReturnItems,
      data,
      userId,
      branchId,
      storeId,
      returnType,
      invNo
    );
  });
  return { statusCode: 0, data };
}

async function updatepurchaseReturnItems(
  tx,
  purchaseReturnItems,
  purchaseReturn,
  userId,
  branchId,
  storeId,
  returnType,
  invNo
) {
  const promises = purchaseReturnItems.map(async (returnDetails) => {
    if (returnDetails.id) {
      // Update existing purchaseReturnItem
      const updatedItem = await tx.purchaseReturnItems.update({
        where: { id: parseInt(returnDetails.id) },

        data: {
          purchaseReturnId: parseInt(purchaseReturn.id),
          styleNo: returnDetails?.styleNo ?? undefined,
          fabricId: returnDetails?.fabricId
            ? parseInt(returnDetails.fabricId)
            : null,
          styleItemId: returnDetails?.styleItemId
            ? parseInt(returnDetails.styleItemId)
            : null,
          styleId: returnDetails?.styleId
            ? parseInt(returnDetails.styleId)
            : null,
          colorId: returnDetails?.colorId
            ? parseInt(returnDetails.colorId)
            : null,
          fabWidth: returnDetails?.fabWidth
            ? parseFloat(returnDetails.fabWidth)
            : null,
          fabMeter: returnDetails?.fabMeter
            ? parseFloat(returnDetails.fabMeter)
            : null,
          noOfPcs: returnDetails?.noOfPcs
            ? parseInt(returnDetails.noOfPcs)
            : null,
          accessoryId: returnDetails?.accessoryId
            ? parseInt(returnDetails.accessoryId)
            : null,
          accessoryGroupId: returnDetails?.accessoryGroupId
            ? parseInt(returnDetails.accessoryGroupId)
            : null,
          sizeId: returnDetails?.sizeId ? parseInt(returnDetails.sizeId) : null,
          qty: returnDetails?.qty ? parseFloat(returnDetails.qty) : 0,
          uomId: returnDetails?.uomId ? parseInt(returnDetails.uomId) : null,
          price: returnDetails?.price ? parseInt(returnDetails.price) : null,
          remarks: returnDetails?.remarks ? returnDetails?.remarks : undefined,
          invNo: invNo ? invNo : "",
          returnFabMeter: returnDetails?.returnFabMeter
            ? parseFloat(returnDetails.returnFabMeter)
            : null,
          returnQty: returnDetails?.returnQty
            ? parseFloat(returnDetails.returnQty)
            : 0,
        },
      });

      // Update or create Stock row
      const existingStock = await tx.materialStock.findFirst({
        where: { purchaseReturnItemsId: updatedItem.id },
      });

      if (existingStock) {
        await tx.materialStock.update({
          where: { id: existingStock.id },
          data: {
            updatedById: parseInt(userId),
            branchId: parseInt(branchId),
            storeId: parseInt(storeId),
            styleNo: returnDetails?.styleNo ?? undefined,
            fabricId: returnDetails?.fabricId
              ? parseInt(returnDetails.fabricId)
              : null,
            styleItemId: returnDetails?.styleItemId
              ? parseInt(returnDetails.styleItemId)
              : null,
            styleId: returnDetails?.styleId
              ? parseInt(returnDetails.styleId)
              : null,
            colorId: returnDetails?.colorId
              ? parseInt(returnDetails.colorId)
              : null,
            fabWidth: returnDetails?.fabWidth
              ? parseFloat(returnDetails.fabWidth)
              : null,
            fabMeter:
              returnDetails?.returnFabMeter &&
              !isNaN(parseFloat(returnDetails.returnFabMeter))
                ? -Math.abs(parseInt(returnDetails.returnFabMeter))
                : null,
            noOfPcs: returnDetails?.noOfPcs
              ? parseInt(returnDetails.noOfPcs)
              : null,
            accessoryId: returnDetails?.accessoryId
              ? parseInt(returnDetails.accessoryId)
              : null,
            accessoryGroupId: returnDetails?.accessoryGroupId
              ? parseInt(returnDetails.accessoryGroupId)
              : null,
            sizeId: returnDetails?.sizeId
              ? parseInt(returnDetails.sizeId)
              : null,
            qty:
              returnDetails?.qty && !isNaN(parseFloat(returnDetails.qty))
                ? -Math.abs(parseInt(returnDetails.qty))
                : null,
            uomId: returnDetails?.uomId ? parseInt(returnDetails.uomId) : null,
            price: returnDetails?.price ? parseInt(returnDetails.price) : null,
            inOrOut: returnType + "Return" || "MaterialReturn",
            invNo: invNo ? invNo : undefined,
            itemType: returnType ? returnType : undefined,
          },
        });
      } else {
        await tx.materialStock.create({
          data: {
            inOrOut: returnType + "Return" || "MaterialReturn",
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            storeId: parseInt(storeId),
            purchaseReturnItemsId: createdItem.id,
            styleNo: returnDetails?.styleNo ?? undefined,
            fabricId: returnDetails?.fabricId
              ? parseInt(returnDetails.fabricId)
              : null,
            styleItemId: returnDetails?.styleItemId
              ? parseInt(returnDetails.styleItemId)
              : null,
            styleId: returnDetails?.styleId
              ? parseInt(returnDetails.styleId)
              : null,
            colorId: returnDetails?.colorId
              ? parseInt(returnDetails.colorId)
              : null,
            fabWidth: returnDetails?.fabWidth
              ? parseFloat(returnDetails.fabWidth)
              : null,
            fabMeter:
              returnDetails?.returnFabMeter &&
              !isNaN(parseFloat(returnDetails.returnFabMeter))
                ? -Math.abs(parseInt(returnDetails.returnFabMeter))
                : null,
            noOfPcs: returnDetails?.noOfPcs
              ? parseInt(returnDetails.noOfPcs)
              : null,
            accessoryId: returnDetails?.accessoryId
              ? parseInt(returnDetails.accessoryId)
              : null,
            accessoryGroupId: returnDetails?.accessoryGroupId
              ? parseInt(returnDetails.accessoryGroupId)
              : null,
            sizeId: returnDetails?.sizeId
              ? parseInt(returnDetails.sizeId)
              : null,
            qty:
              returnDetails?.qty && !isNaN(parseFloat(returnDetails.qty))
                ? -Math.abs(parseInt(returnDetails.qty))
                : null,
            uomId: returnDetails?.uomId ? parseInt(returnDetails.uomId) : null,
            price: returnDetails?.price ? parseInt(returnDetails.price) : null,
            invNo: invNo ? invNo : "",
            itemType: returnType ? returnType : undefined,
          },
        });
      }

      return updatedItem;
    } else {
      // Create new purchaseReturnItem
      const createdItem = await tx.purchaseReturnItems.create({
        data: {
          purchaseReturnId: parseInt(purchaseReturn.id),
          styleNo: returnDetails?.styleNo ?? undefined,
          fabricId: returnDetails?.fabricId
            ? parseInt(returnDetails.fabricId)
            : null,
          styleItemId: returnDetails?.styleItemId
            ? parseInt(returnDetails.styleItemId)
            : null,
          styleId: returnDetails?.styleId
            ? parseInt(returnDetails.styleId)
            : null,
          colorId: returnDetails?.colorId
            ? parseInt(returnDetails.colorId)
            : null,
          fabWidth: returnDetails?.fabWidth
            ? parseFloat(returnDetails.fabWidth)
            : null,
          fabMeter: returnDetails?.fabMeter
            ? parseFloat(returnDetails.fabMeter)
            : null,
          noOfPcs: returnDetails?.noOfPcs
            ? parseInt(returnDetails.noOfPcs)
            : null,
          accessoryId: returnDetails?.accessoryId
            ? parseInt(returnDetails.accessoryId)
            : null,
          accessoryGroupId: returnDetails?.accessoryGroupId
            ? parseInt(returnDetails.accessoryGroupId)
            : null,
          sizeId: returnDetails?.sizeId ? parseInt(returnDetails.sizeId) : null,
          qty: returnDetails?.qty ? parseFloat(returnDetails.qty) : 0,
          uomId: returnDetails?.uomId ? parseInt(returnDetails.uomId) : null,
          price: returnDetails?.price ? parseInt(returnDetails.price) : null,
          remarks: returnDetails?.remarks ? returnDetails?.remarks : undefined,
          invNo: invNo ? invNo : "",
          returnFabMeter: returnDetails?.returnFabMeter
            ? parseFloat(returnDetails.returnFabMeter)
            : null,
          returnQty: returnDetails?.returnQty
            ? parseFloat(returnDetails.returnQty)
            : 0,
        },
      });

      // Create Stock row
      await tx.materialStock.create({
        data: {
          inOrOut: returnType + "Return" || "MaterialReturn",
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          storeId: parseInt(storeId),
          purchaseReturnItemsId: createdItem.id,
          styleNo: returnDetails?.styleNo ?? undefined,
          fabricId: returnDetails?.fabricId
            ? parseInt(returnDetails.fabricId)
            : null,
          styleItemId: returnDetails?.styleItemId
            ? parseInt(returnDetails.styleItemId)
            : null,
          styleId: returnDetails?.styleId
            ? parseInt(returnDetails.styleId)
            : null,
          colorId: returnDetails?.colorId
            ? parseInt(returnDetails.colorId)
            : null,
          fabWidth: returnDetails?.fabWidth
            ? parseFloat(returnDetails.fabWidth)
            : null,
          fabMeter:
            returnDetails?.returnFabMeter &&
            !isNaN(parseFloat(returnDetails.returnFabMeter))
              ? -Math.abs(parseInt(returnDetails.returnFabMeter))
              : null,
          noOfPcs: returnDetails?.noOfPcs
            ? parseInt(returnDetails.noOfPcs)
            : null,
          accessoryId: returnDetails?.accessoryId
            ? parseInt(returnDetails.accessoryId)
            : null,
          accessoryGroupId: returnDetails?.accessoryGroupId
            ? parseInt(returnDetails.accessoryGroupId)
            : null,
          sizeId: returnDetails?.sizeId ? parseInt(returnDetails.sizeId) : null,
          qty:
            returnDetails?.qty && !isNaN(parseFloat(returnDetails.qty))
              ? -Math.abs(parseInt(returnDetails.qty))
              : null,
          uomId: returnDetails?.uomId ? parseInt(returnDetails.uomId) : null,
          price: returnDetails?.price ? parseInt(returnDetails.price) : null,
          invNo: invNo ? invNo : "",
          itemType: returnType ? returnType : undefined,
        },
      });

      return createdItem;
    }
  });

  return Promise.all(promises);
}

async function remove(id) {
  const data = await prisma.purchaseReturn.delete({
    where: {
      id: parseInt(id),
    },
  });
  console.log(data, "data");

  return { statusCode: 0, data };
}

export { remove, get, getOne, create, update };
