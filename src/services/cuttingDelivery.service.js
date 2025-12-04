import { CustomError, NoRecordFound } from "../configs/Responses.js";
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
          // fabMeter: true,
          portionId: true,
          styleId: true,
          // orderQty: true,
          remarks: true,
          issueQty: true,
          sizeDetails: true,
          usedMeter: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("CuttingDelivery");

  const styleIds = data.cuttingDeliveryItems
    .map((item) => item.styleId)
    .filter(Boolean);
  const childRecordProduction = await prisma.productionEntryItems.count({
    where: {
      styleId: {
        in: styleIds,
      },
    },
  });
  const cuttingDeliveryWithStkQty = await Promise.all(
    data.cuttingDeliveryItems.map(async (item) => {
      const stockData = await prisma.materialStock.aggregate({
        where: {
          fabricId: item.fabricId,
          colorId: item.colorId,
          styleId: item.styleId,
          fabWidth: item.fabWidth,
          invNo: item.invNo,
          portionId: item.portionId
        },
        _sum: {
          fabMeter: true,
        },
      });
      const planQty = await prisma.cuttingOrderItems.findFirst({
        where: {
          styleItemId: item.styleItemId,
          fabricId: item.fabricId,
          colorId: item.colorId,
          styleId: item.styleId,
          invNo: item.invNo,
          portionId: item.portionId,
        },
        select: {
          orderQty: true,
        },
      });
      return {
        ...item,
        fabMeter: stockData._sum.fabMeter + item.usedMeter,
        orderQty: planQty.orderQty,
      };
    })
  );
  return {
    statusCode: 0,
    data: {
      ...data,
      cuttingDeliveryItems: cuttingDeliveryWithStkQty,
    },
    childRecordProduction: childRecordProduction,
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
    productionType,
    fromProcessId,
    supplierId,
    sizeTemplateId,
    storeId,
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
  const exist = await prisma.cuttingDelivery.findFirst({
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
  if (fromProcessId) {
    const processData = await prisma.process.findUnique({
      where: {
        id: fromProcessId,
      },
    });
    if (processData?.isCutting === false) {
      CustomError("Invalid Process");
    }
  }
  await prisma.$transaction(async (tx) => {
    data = await tx.cuttingDelivery.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        createdById: parseInt(userId),
        styleId: parseInt(styleId),
        docDate: docDate ? new Date(docDate) : null,
        cuttingNo,
        productionType,
        supplierId: supplierId ? parseInt(supplierId) : null,
        fromProcessId: fromProcessId ? parseInt(fromProcessId) : null,
        sizeTemplateId: parseInt(sizeTemplateId),
      },
    });
    await createCuttingDeliveryItems(
      tx,
      cuttingDeliveryItems,
      data,
      userId,
      branchId,
      storeId,
      fromProcessId
    );
  });
  return { statusCode: 0, data };
}

async function createCuttingDeliveryItems(
  tx,
  cuttingDeliveryItems,
  cuttingDelivery,
  userId,
  branchId,
  storeId,
  fromProcessId
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
        usedMeter: deliveryDetail?.usedMeter
          ? parseFloat(deliveryDetail.usedMeter)
          : null,
        uomId: deliveryDetail?.uomId ? parseInt(deliveryDetail.uomId) : null,
        invNo: deliveryDetail?.invNo ? deliveryDetail?.invNo : undefined,
      },
    });
    const sizes = deliveryDetail.sizeDetails || [];
    for (const s of sizes) {
      await tx.sizeDetails.create({
        data: {
          sizeId: s.sizeId ? parseInt(s.sizeId) : null,
          qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
          cuttingDeliveryItemsId: createdItem.id,
          employeeId: s.employeeId ? parseInt(s.employeeId) : null,
        },
      });
    }
    // Create corresponding Stock row
    for (const s of sizes) {
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
          colorId: deliveryDetail?.colorId
            ? parseInt(deliveryDetail.colorId)
            : null,
          fabWidth: deliveryDetail?.fabWidth
            ? parseFloat(deliveryDetail.fabWidth)
            : null,
          fabMeter: deliveryDetail?.usedMeter
            ? parseFloat(deliveryDetail.usedMeter)
            : null,
          portionId: deliveryDetail?.portionId
            ? parseInt(deliveryDetail.portionId)
            : null,
          remarks: deliveryDetail?.remarks ?? undefined,
          sizeId: s?.sizeId ? parseInt(s.sizeId) : null,
          qty: s?.qty ? Math.round(parseFloat(s.qty)) : null,
          employeeId: s.employeeId ? parseInt(s.employeeId) : null,
          orderQty,
          uomId: deliveryDetail?.uomId ? parseInt(deliveryDetail.uomId) : null,
          prevProcessId: fromProcessId ? parseInt(fromProcessId) : null,
          storeId: parseInt(storeId),
        },
      });
    }

    // Create corresponding Stock row
    await tx.materialStock.create({
      data: {
        inOrOut: "cuttingReturn",
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
        colorId: deliveryDetail?.colorId
          ? parseInt(deliveryDetail.colorId)
          : null,
        fabWidth: deliveryDetail?.fabWidth
          ? parseFloat(deliveryDetail.fabWidth)
          : null,
        fabMeter: deliveryDetail?.usedMeter
          ? -Math.abs(parseFloat(deliveryDetail.usedMeter))
          : null,
        portionId: deliveryDetail?.portionId
          ? parseInt(deliveryDetail.portionId)
          : null,
        remarks: deliveryDetail?.remarks ?? undefined,
        uomId: deliveryDetail?.uomId ? parseInt(deliveryDetail.uomId) : null,
        itemType: "Fabric",
        invNo: deliveryDetail?.invNo ? deliveryDetail?.invNo : undefined,
        storeId: parseInt(storeId),
      },
    });

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
    productionType,
    fromProcessId,
    supplierId,
    sizeTemplateId,
    storeId,
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
        storeId: parseInt(storeId),
        styleId: parseInt(styleId),
        docDate: docDate ? new Date(docDate) : null,
        cuttingNo,
        productionType,
        supplierId: supplierId ? parseInt(supplierId) : null,
        fromProcessId: fromProcessId ? parseInt(fromProcessId) : null,
        sizeTemplateId: parseInt(sizeTemplateId),
      },
    });
    await updateCuttingDeliveryItems(
      tx,
      cuttingDeliveryItems,
      data,
      userId,
      branchId,
      fromProcessId,
      storeId
    );
  });
  return { statusCode: 0, data };
}

async function updateCuttingDeliveryItems(
  tx,
  cuttingDeliveryItems,
  cuttingDelivery,
  userId,
  branchId,
  fromProcessId,
  storeId
) {
  const promises = cuttingDeliveryItems.map(async (deliveryDetail) => {
    const orderQty = deliveryDetail?.orderQty
      ? Math.round(parseFloat(deliveryDetail.orderQty))
      : null;
    const sizes = deliveryDetail?.sizeDetails || [];
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
          usedMeter: deliveryDetail?.usedMeter
            ? parseFloat(deliveryDetail.usedMeter)
            : null,
          uomId: deliveryDetail?.uomId ? parseInt(deliveryDetail.uomId) : null,
          invNo: deliveryDetail?.invNo ? deliveryDetail?.invNo : undefined,
        },
      });
      const existingSizes = await tx.sizeDetails.findMany({
        where: { cuttingDeliveryItemsId: updatedItem.id },
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
              employeeId: s.employeeId ? parseInt(s.employeeId) : null,
            },
          });

          existingMap.delete(s.sizeId);
        } else {
          // Insert new
          await tx.sizeDetails.create({
            data: {
              sizeId: parseInt(s.sizeId),
              qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
              cuttingDeliveryItemsId: updatedItem.id,
              employeeId: s.employeeId ? parseInt(s.employeeId) : null,
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
      // Update or create Stock row
      // === SIZE-WISE STOCK ===

      // 1. Fetch existing stock rows for this item
      const existingStockRows = await tx.productionStock.findMany({
        where: { cuttingDeliveryItemsId: updatedItem.id },
      });
      // Create a map for quick lookup
      const stockMap = new Map();
      existingStockRows.forEach((row) => stockMap.set(row.sizeId, row));
      for (const s of sizes) {
        const sizeId = parseInt(s.sizeId);
        const qty = s.qty ? Math.round(parseFloat(s.qty)) : null;

        if (stockMap.has(sizeId)) {
          // ==== UPDATE EXISTING STOCK ====
          const row = stockMap.get(sizeId);

          await tx.productionStock.update({
            where: { id: row.id },
            data: {
              updatedById: parseInt(userId),
              fabricId: deliveryDetail?.fabricId
                ? parseInt(deliveryDetail.fabricId)
                : null,
              styleId: deliveryDetail?.styleId
                ? parseInt(deliveryDetail.styleId)
                : null,
              styleItemId: deliveryDetail?.styleItemId
                ? parseInt(deliveryDetail.styleItemId)
                : null,
              colorId: deliveryDetail?.colorId
                ? parseInt(deliveryDetail.colorId)
                : null,
              fabWidth: deliveryDetail?.fabWidth
                ? parseFloat(deliveryDetail.fabWidth)
                : null,
              fabMeter: deliveryDetail?.usedMeter
                ? parseFloat(deliveryDetail.usedMeter)
                : null,
              portionId: deliveryDetail?.portionId
                ? parseInt(deliveryDetail.portionId)
                : null,
              remarks: deliveryDetail?.remarks ?? undefined,
              orderQty,
              uomId: deliveryDetail?.uomId
                ? parseInt(deliveryDetail.uomId)
                : null,

              // size-level fields
              sizeId,
              qty,
              employeeId: s.employeeId ? parseInt(s.employeeId) : null,
              prevProcessId: fromProcessId ? parseInt(fromProcessId) : null,
              storeId: parseInt(storeId),
            },
          });

          // remove from map (means processed)
          stockMap.delete(sizeId);
        } else {
          // ==== INSERT NEW STOCK ROW ====
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
              colorId: deliveryDetail?.colorId
                ? parseInt(deliveryDetail.colorId)
                : null,
              fabWidth: deliveryDetail?.fabWidth
                ? parseFloat(deliveryDetail.fabWidth)
                : null,
              fabMeter: deliveryDetail?.usedMeter
                ? parseFloat(deliveryDetail.usedMeter)
                : null,
              portionId: deliveryDetail?.portionId
                ? parseInt(deliveryDetail.portionId)
                : null,
              remarks: deliveryDetail?.remarks ?? undefined,
              orderQty,
              uomId: deliveryDetail?.uomId
                ? parseInt(deliveryDetail.uomId)
                : null,
              prevProcessId: fromProcessId ? parseInt(fromProcessId) : null,
              // size-level
              sizeId,
              qty,
              employeeId: s.employeeId ? parseInt(s.employeeId) : null,
              storeId: parseInt(storeId),
            },
          });
        }
      }

      // 3. DELETE leftover rows (sizes removed in UI)
      for (const leftover of stockMap.values()) {
        await tx.productionStock.delete({
          where: { id: leftover.id },
        });
      }

      const existingMaterialStock = await tx.materialStock.findFirst({
        where: { cuttingDeliveryItemsId: updatedItem.id },
      });

      if (existingMaterialStock) {
        await tx.materialStock.update({
          where: { id: existingMaterialStock.id },
          data: {
            updatedById: parseInt(userId),
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
            fabMeter: deliveryDetail?.usedMeter
              ? -Math.abs(parseFloat(deliveryDetail.usedMeter))
              : null,
            portionId: deliveryDetail?.portionId
              ? parseInt(deliveryDetail.portionId)
              : null,
            remarks: deliveryDetail?.remarks ?? undefined,
            uomId: deliveryDetail?.uomId
              ? parseInt(deliveryDetail.uomId)
              : null,
            itemType: "Fabric",
            invNo: deliveryDetail?.invNo ? deliveryDetail?.invNo : undefined,
            storeId: parseInt(storeId),
          },
        });
      } else {
        await tx.materialStock.create({
          data: {
            inOrOut: "cuttingDelivery",
            cuttingDeliveryItemsId: updatedItem.id,
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            // storeId: parseInt(storeId),
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
            fabMeter: deliveryDetail?.usedMeter
              ? -Math.abs(parseFloat(deliveryDetail.usedMeter))
              : null,
            portionId: deliveryDetail?.portionId
              ? parseInt(deliveryDetail.portionId)
              : null,
            remarks: deliveryDetail?.remarks ?? undefined,
            uomId: deliveryDetail?.uomId
              ? parseInt(deliveryDetail.uomId)
              : null,
            itemType: "Fabric",
            invNo: deliveryDetail?.invNo ? deliveryDetail?.invNo : undefined,
            storeId: parseInt(storeId),
          },
        });
      }

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
          usedMeter: deliveryDetail?.usedMeter
            ? parseFloat(deliveryDetail.usedMeter)
            : null,
          uomId: deliveryDetail?.uomId ? parseInt(deliveryDetail.uomId) : null,
          invNo: deliveryDetail?.invNo ? deliveryDetail?.invNo : undefined,
        },
      });

      for (const s of sizes) {
        await tx.sizeDetails.create({
          data: {
            sizeId: parseInt(s.sizeId),
            qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
            cuttingDeliveryItems: createdItem.id,
            employeeId: s.employeeId ? parseInt(s.employeeId) : null,
          },
        });
      }
      for (const s of sizes) {
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
            colorId: deliveryDetail?.colorId
              ? parseInt(deliveryDetail.colorId)
              : null,
            fabWidth: deliveryDetail?.fabWidth
              ? parseFloat(deliveryDetail.fabWidth)
              : null,
            fabMeter: deliveryDetail?.usedMeter
              ? parseFloat(deliveryDetail.usedMeter)
              : null,
            portionId: deliveryDetail?.portionId
              ? parseInt(deliveryDetail.portionId)
              : null,
            remarks: deliveryDetail?.remarks ?? undefined,
            orderQty,
            sizeId: s?.sizeId ? parseInt(s.sizeId) : null,
            qty: s?.qty ? Math.round(parseFloat(s.qty)) : null,
            uomId: deliveryDetail?.uomId
              ? parseInt(deliveryDetail.uomId)
              : null,
            prevProcessId: fromProcessId ? parseInt(fromProcessId) : null,
            employeeId: s.employeeId ? parseInt(s.employeeId) : null,
            storeId: parseInt(storeId),
          },
        });
      }

      await tx.materialStock.create({
        data: {
          inOrOut: "cuttingDelivery",
          cuttingDeliveryItemsId: createdItem.id,
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          // storeId: parseInt(storeId),
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
          fabMeter: deliveryDetail?.usedMeter
            ? -Math.abs(parseFloat(deliveryDetail.usedMeter))
            : null,
          portionId: deliveryDetail?.portionId
            ? parseInt(deliveryDetail.portionId)
            : null,
          remarks: deliveryDetail?.remarks ?? undefined,
          uomId: deliveryDetail?.uomId ? parseInt(deliveryDetail.uomId) : null,
          invNo: deliveryDetail?.invNo ? deliveryDetail?.invNo : undefined,
          storeId: parseInt(storeId),
        },
      });

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
