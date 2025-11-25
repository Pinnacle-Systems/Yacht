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
    lastObject = await prisma.productionEntry.findFirst({
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
    )}/PE/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PE/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.productionEntry.findFirst({
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
    )}/PE/1`;
    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PE/${
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
  data = await prisma.productionEntry.findMany({
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
      productionEntryItems: true,
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
  const data = await prisma.productionEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      productionEntryItems: {
        select: {
          id: true,
          productionEntryId: true,
          styleItemId: true,
          fabricId: true,
          colorId: true,
          sizeId: true,
          portionId: true,
          styleId: true,
          orderQty: true,
          remarks: true,
          issueQty: true,
          pcsSizeDetails: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("ProductionEntry");
  return {
    statusCode: 0,
    data: {
      ...data,
    },
  };
}

function findRemovedItems(dataFound, productionEntryItems) {
  let removedItems = dataFound.productionEntryItems.filter((oldItem) => {
    let result = productionEntryItems.find(
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
    productionEntryItems,
    styleId,
    docDate,
    draftSave,
    productionType,
    supplierId,
    sizeTemplateId,
    fromProcessId,
    toProcessId,
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
    data = await tx.productionEntry.create({
      data: {
        docId: newDocId,
        branchId: parseInt(branchId),
        createdById: parseInt(userId),
        styleId: parseInt(styleId),
        docDate: docDate ? new Date(docDate) : null,
        productionType,
        supplierId: supplierId ? parseInt(supplierId) : null,
        sizeTemplateId: parseInt(sizeTemplateId),
        fromProcessId: parseInt(fromProcessId),
        toProcessId: parseInt(toProcessId),
      },
    });
    await createProductionEntryItems(
      tx,
      productionEntryItems,
      data,
      userId,
      branchId
    );
  });
  return { statusCode: 0, data };
}

async function createProductionEntryItems(
  tx,
  productionEntryItems,
  productionEntry,
  userId,
  branchId
) {
  const promises = productionEntryItems.map(async (entryDetail, index) => {
    const prevProcessId = productionEntry?.fromProcessId
      ? productionEntry.fromProcessId
      : null;
    const orderQty = entryDetail?.orderQty
      ? Math.round(parseFloat(entryDetail.orderQty))
      : null;
    const createdItem = await tx.productionEntryItems.create({
      data: {
        productionEntryId: parseInt(productionEntry.id),
        styleId: entryDetail?.styleId ?? undefined,
        fabricId: entryDetail?.fabricId ? parseInt(entryDetail.fabricId) : null,
        styleItemId: entryDetail?.styleItemId
          ? parseInt(entryDetail.styleItemId)
          : null,
        sizeId: entryDetail?.sizeId ? parseInt(entryDetail.sizeId) : null,
        colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
        portionId: entryDetail?.portionId
          ? parseInt(entryDetail.portionId)
          : null,
        orderQty,
        issueQty: entryDetail?.issueQty
          ? Math.round(parseFloat(entryDetail.issueQty))
          : null,
        remarks: entryDetail?.remarks ?? undefined,
        uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
        prevProcessId: prevProcessId,
      },
    });
    const sizes = entryDetail.pcsSizeDetails || [];
    for (const s of sizes) {
      await tx.pcsSizeDetails.create({
        data: {
          sizeId: s.sizeId ? parseInt(s.sizeId) : null,
          qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
          productionEntryItemsId: createdItem.id,
        },
      });
    }
    // Create corresponding Stock row
    for (const s of sizes) {
      await tx.productionStock.create({
        data: {
          inOrOut: "productionEntry",
          productionEntryItemsId: createdItem.id,
          createdById: parseInt(userId),
          branchId: parseInt(branchId),

          fabricId: entryDetail?.fabricId
            ? parseInt(entryDetail.fabricId)
            : null,
          styleId: entryDetail?.styleId ? parseInt(entryDetail.styleId) : null,
          styleItemId: entryDetail?.styleItemId
            ? parseInt(entryDetail.styleItemId)
            : null,
          colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
          portionId: entryDetail?.portionId
            ? parseInt(entryDetail.portionId)
            : null,
          remarks: entryDetail?.remarks ?? undefined,
          sizeId: s?.sizeId ? parseInt(s.sizeId) : null,
          qty: s?.qty ? Math.round(parseFloat(s.qty)) : null,
          orderQty,
          uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
          prevProcessId: prevProcessId,
        },
      });
    }
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
    productionEntryItems,
    styleId,
    docDate,
    productionType,
    supplierId,
    sizeTemplateId,
    fromProcessId,
    toProcessId,
  } = await body;
  let data;
  const dataFound = await prisma.productionEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      productionEntryItems: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("productionEntry");
  let removedItems = findRemovedItems(dataFound, productionEntryItems);
  let removeItemsIds = removedItems.map((item) => parseInt(item.id));
  await prisma.$transaction(async (tx) => {
    // await deleteItemsFromStock(tx, removeItemsIds);
    if (removeItemsIds.length > 0) {
      await tx.productionEntryItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.productionEntry.update({
      where: {
        id: parseInt(id),
      },
      data: {
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        styleId: parseInt(styleId),
        docDate: docDate ? new Date(docDate) : null,
        productionType,
        supplierId: supplierId ? parseInt(supplierId) : null,
        sizeTemplateId: parseInt(sizeTemplateId),
        fromProcessId: parseInt(fromProcessId),
        toProcessId: parseInt(toProcessId),
      },
    });
    await updateProductionEntryItems(
      tx,
      productionEntryItems,
      data,
      userId,
      branchId
    );
  });
  return { statusCode: 0, data };
}

async function updateProductionEntryItems(
  tx,
  productionEntryItems,
  productionEntry,
  userId,
  branchId
) {
  const promises = productionEntryItems.map(async (entryDetail) => {
    const prevProcessId = productionEntry?.fromProcessId
      ? productionEntry.fromProcessId
      : null;
    const orderQty = entryDetail?.orderQty
      ? Math.round(parseFloat(entryDetail.orderQty))
      : null;
    const sizes = entryDetail?.pcsSizeDetails || [];
    if (entryDetail.id) {
      // Update existing productionEntryItem
      const updatedItem = await tx.productionEntryItems.update({
        where: { id: parseInt(entryDetail.id) },
        data: {
          productionEntryId: parseInt(productionEntry.id),
          fabricId: entryDetail?.fabricId
            ? parseInt(entryDetail.fabricId)
            : null,
          styleId: entryDetail?.styleId ? parseInt(entryDetail.styleId) : null,
          styleItemId: entryDetail?.styleItemId
            ? parseInt(entryDetail.styleItemId)
            : null,
          sizeId: entryDetail?.sizeId ? parseInt(entryDetail.sizeId) : null,
          colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
          portionId: entryDetail?.portionId
            ? parseInt(entryDetail.portionId)
            : null,
          orderQty,
          remarks: entryDetail?.remarks ?? undefined,
          issueQty: entryDetail?.issueQty
            ? Math.round(parseFloat(entryDetail.issueQty))
            : null,
          uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
          prevProcessId: prevProcessId,
        },
      });
      const existingSizes = await tx.pcsSizeDetails.findMany({
        where: { productionEntryItemsId: updatedItem.id },
      });
      // Create map for faster match
      const existingMap = new Map();
      existingSizes.forEach((s) => existingMap.set(s.sizeId, s));

      // Loop through incoming sizes
      for (const s of sizes) {
        if (existingMap.has(s.sizeId)) {
          // Update existing
          await tx.pcsSizeDetails.update({
            where: { id: existingMap.get(s.sizeId).id },
            data: {
              qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
            },
          });

          existingMap.delete(s.sizeId);
        } else {
          // Insert new
          await tx.pcsSizeDetails.create({
            data: {
              sizeId: parseInt(s.sizeId),
              qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
              productionEntryItemsId: updatedItem.id,
            },
          });
        }
      }

      // Delete removed sizes
      for (const leftover of existingMap.values()) {
        await tx.pcsSizeDetails.delete({
          where: { id: leftover.id },
        });
      }
      // Update or create Stock row
      // === SIZE-WISE STOCK ===

      // 1. Fetch existing stock rows for this item
      const existingStockRows = await tx.productionStock.findMany({
        where: { productionEntryItemsId: updatedItem.id },
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
              fabricId: entryDetail?.fabricId
                ? parseInt(entryDetail.fabricId)
                : null,
              styleId: entryDetail?.styleId
                ? parseInt(entryDetail.styleId)
                : null,
              styleItemId: entryDetail?.styleItemId
                ? parseInt(entryDetail.styleItemId)
                : null,
              colorId: entryDetail?.colorId
                ? parseInt(entryDetail.colorId)
                : null,
              portionId: entryDetail?.portionId
                ? parseInt(entryDetail.portionId)
                : null,
              remarks: entryDetail?.remarks ?? undefined,
              orderQty,
              uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
              prevProcessId: prevProcessId,
              // size-level fields
              sizeId,
              qty,
            },
          });

          // remove from map (means processed)
          stockMap.delete(sizeId);
        } else {
          // ==== INSERT NEW STOCK ROW ====
          await tx.productionStock.create({
            data: {
              inOrOut: "productionEntry",
              productionEntryItemsId: updatedItem.id,
              createdById: parseInt(userId),
              branchId: parseInt(branchId),

              fabricId: entryDetail?.fabricId
                ? parseInt(entryDetail.fabricId)
                : null,
              styleId: entryDetail?.styleId
                ? parseInt(entryDetail.styleId)
                : null,
              styleItemId: entryDetail?.styleItemId
                ? parseInt(entryDetail.styleItemId)
                : null,
              colorId: entryDetail?.colorId
                ? parseInt(entryDetail.colorId)
                : null,
              portionId: entryDetail?.portionId
                ? parseInt(entryDetail.portionId)
                : null,
              remarks: entryDetail?.remarks ?? undefined,
              orderQty,
              uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
              prevProcessId: prevProcessId,
              // size-level
              sizeId,
              qty,
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

      return updatedItem;
    } else {
      // Create new productionEntryItem
      const createdItem = await tx.productionEntryItems.create({
        data: {
          productionEntryId: parseInt(productionEntry.id),

          fabricId: entryDetail?.fabricId
            ? parseInt(entryDetail.fabricId)
            : null,
          styleId: entryDetail?.styleId ? parseInt(entryDetail.styleId) : null,
          styleItemId: entryDetail?.styleItemId
            ? parseInt(entryDetail.styleItemId)
            : null,
          sizeId: entryDetail?.sizeId ? parseInt(entryDetail.sizeId) : null,
          colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
          portionId: entryDetail?.portionId
            ? parseInt(entryDetail.portionId)
            : null,
          remarks: entryDetail?.remarks ?? undefined,
          orderQty,
          issueQty: entryDetail?.issueQty
            ? Math.round(parseFloat(entryDetail.issueQty))
            : null,
          uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
          prevProcessId: prevProcessId,
        },
      });

      for (const s of sizes) {
        await tx.pcsSizeDetails.create({
          data: {
            sizeId: parseInt(s.sizeId),
            qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
            productionEntryItems: createdItem.id,
          },
        });
      }
      for (const s of sizes) {
        // Create Stock row
        await tx.productionStock.create({
          data: {
            inOrOut: "productionEntry",
            productionEntryItemsId: createdItem.id,
            createdById: parseInt(userId),
            branchId: parseInt(branchId),

            fabricId: entryDetail?.fabricId
              ? parseInt(entryDetail.fabricId)
              : null,
            styleId: entryDetail?.styleId
              ? parseInt(entryDetail.styleId)
              : null,
            styleItemId: entryDetail?.styleItemId
              ? parseInt(entryDetail.styleItemId)
              : null,
            colorId: entryDetail?.colorId
              ? parseInt(entryDetail.colorId)
              : null,
            portionId: entryDetail?.portionId
              ? parseInt(entryDetail.portionId)
              : null,
            remarks: entryDetail?.remarks ?? undefined,
            orderQty,
            sizeId: s?.sizeId ? parseInt(s.sizeId) : null,
            qty: s?.qty ? Math.round(parseFloat(s.qty)) : null,
            uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
            prevProcessId: prevProcessId,
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
  const data = await prisma.productionEntry.delete({
    where: {
      id: parseInt(id),
    },
  });
  console.log(data, "data");

  return { statusCode: 0, data };
}

export { getOne, create, update, remove, get };
