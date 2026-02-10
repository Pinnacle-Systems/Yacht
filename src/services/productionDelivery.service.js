import { CustomError, NoRecordFound } from "../configs/Responses.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import {
  getDateFromDateTime,
  getYearShortCode,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { prisma } from "../lib/prisma.js";

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
    searchProcess,
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
      FromProcess: {
        name: searchProcess ? { contains: searchProcess } : undefined,
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
      FromProcess: {
        select: {
          name: true,
          isIroning: true,
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
        include: {
          pcsSizeDetails: true,
          StyleItem: true,
          Fabric: true,
          Color: true,
          Size: true,
          Portion: true,
          Employee: true,
        },
      },
      FromProcess: {
        select: {
          name: true,
          isIroning: true,
        },
      },
      ToProcess: {
        select: {
          name: true,
        },
      },
      Branch: {
        select: {
          branchName: true,
        },
      },
      Store: {
        select: {
          storeName: true,
        },
      },
      Style: {
        select: {
          sku: true,
        },
      },
    },
  });

  if (!data) return NoRecordFound("ProductionEntry");
  const styleIds = data.productionEntryItems
    .map((item) => item.styleId)
    .filter(Boolean);
  const toProcessId = data.toProcessId;
  const styleId = data.styleId;
  let childRecordProduction;
  if (data?.FromProcess?.isIroning === true) {
    childRecordProduction = await prisma.stockInwardItems.count({
      where: {
        styleId: parseInt(data?.styleId),
      },
    });
  } else {
    childRecordProduction = await prisma.productionEntryItems.count({
      where: {
        prevProcessId: {
          in: toProcessId,
        },
        styleId: {
          in: styleId,
        },
      },
    });
  }
  let beforeProcessId = null;
  if (data) {
    const currentProcess = await prisma.processGroupList.findFirst({
      where: {
        processId: data?.fromProcessId,
      },
      select: {
        seqNo: true,
      },
    });
    if (currentProcess?.seqNo) {
      const beforeProcess = await prisma.processGroupList.findFirst({
        where: {
          seqNo: currentProcess.seqNo - 1,
        },
        select: {
          processId: true,
        },
      });
      beforeProcessId = beforeProcess?.processId || null;
    }
  }
  // Add stkQty to each production entry item
  const productionEntryItemsWithStkQty = await Promise.all(
    data.productionEntryItems.map(async (item) => {
      const stockData = await prisma.productionStock.aggregate({
        where: {
          styleItemId: item.styleItemId,
          fabricId: item.fabricId,
          colorId: item.colorId,
          portionId: item.portionId,
          styleId: item.styleId,
          prevProcessId: beforeProcessId,
          sizeId: item.sizeId,
        },
        _sum: {
          qty: true,
        },
      });
      let usedQty;
      let minQty;
      if (data?.FromProcess?.isIroning === true) {
        usedQty = await prisma.stockInwardItems.count({
          where: {
            styleItemId: item.styleItemId,
            fabricId: item.fabricId,
            colorId: item.colorId,
            portionId: item.portionId,
            styleId: item.styleId,
            sizeId: item.sizeId,
          },
        });
        minQty = await prisma.stockInwardItems.aggregate({
          where: {
            styleItemId: item.styleItemId,
            fabricId: item.fabricId,
            colorId: item.colorId,
            portionId: item.portionId,
            styleId: item.styleId,
            sizeId: item.sizeId,
          },
          _sum: {
            qty: true,
          },
        });
      } else {
        usedQty = await prisma.productionEntryItems.count({
          where: {
            prevProcessId: data.toProcessId,
            styleItemId: item.styleItemId,
            fabricId: item.fabricId,
            colorId: item.colorId,
            portionId: item.portionId,
            styleId: item.styleId,
            sizeId: item.sizeId,
          },
        });
        minQty = await prisma.productionEntryItems.aggregate({
          where: {
            prevProcessId: data.toProcessId,
            styleItemId: item.styleItemId,
            fabricId: item.fabricId,
            colorId: item.colorId,
            portionId: item.portionId,
            styleId: item.styleId,
            sizeId: item.sizeId,
          },
          _sum: {
            issueQty: true,
          },
        });
      }

      return {
        ...item,
        stkQty: stockData._sum.qty + item.issueQty || 0, // Dynamic field for view
        usedQty: usedQty,
        minQty:
          data?.FromProcess?.isIroning === true
            ? minQty._sum.qty
            : minQty._sum.issueQty,
      };
    })
  );

  return {
    statusCode: 0,
    data: {
      ...data,
      productionEntryItems: productionEntryItemsWithStkQty,
    },
    childRecordProduction: childRecordProduction,
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
    fromProcessId,
    toProcessId,
    storeId,
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
  if (fromProcessId) {
    const existProcess = await prisma.productionStock.findFirst({
      where: {
        prevProcessId: parseInt(fromProcessId),
        styleId: parseInt(styleId),
      },
    });
    if (existProcess) {
      CustomError("Process Already Exist");
    }
  }
  // const currentProcess = await prisma.processGroupList.findFirst({
  //   where: {
  //     processId: parseInt(fromProcessId),
  //   },
  //   select: {
  //     seqNo: true,
  //   },
  // });
  let processGroupId;
  const processGroup = await prisma.cuttingDelivery.findFirst({
    where: {
      styleId: parseInt(styleId),
    },
  });
  processGroupId = processGroup.processGroupId;
  let processGroupList;
  if (processGroupId) {
    processGroupList = await prisma.processGroupList.findMany({
      where: {
        processGroupId: processGroupId,
      },
    });
  }
  const currentProcess = processGroupList.find(
    (item) => item.processId === parseInt(fromProcessId)
  );
  let nextProcessId;
  let prevProcessId;
  if (currentProcess) {
    // const nextProcess = await prisma.processGroupList.findFirst({
    //   where: {
    //     seqNo: currentProcess?.seqNo + 1,
    //   },
    // });
    // nextProcessId = nextProcess?.processId;
    const nextProcess = processGroupList.find(
      (item) => item.seqNo === currentProcess.seqNo + 1
    );
    nextProcessId = nextProcess?.processId;
    const prevProcess = processGroupList.find(
      (item) => item.seqNo === currentProcess.seqNo - 1
    );
    prevProcessId = prevProcess?.processId;
  }
  const NoStock = await prisma.productionStock.findFirst({
    where: {
      styleId: parseInt(styleId),
      prevProcessId: prevProcessId,
    },
  });
  if (!NoStock) {
    return {
      statusCode: 400,
      message: "No previous Process Record",
    };
  }
  if (nextProcessId !== parseInt(toProcessId)) {
    return {
      statusCode: 400,
      message: "Choose Correct To Process",
    };
  }
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
        // sizeTemplateId: parseInt(sizeTemplateId),
        fromProcessId: parseInt(fromProcessId),
        toProcessId: parseInt(toProcessId),
        storeId: parseInt(storeId),
      },
    });
    await createProductionEntryItems(
      tx,
      productionEntryItems,
      data,
      userId,
      branchId,
      storeId,
      processGroupList,
      currentProcess
    );
  });
  return { statusCode: 0, data };
}

async function createProductionEntryItems(
  tx,
  productionEntryItems,
  productionEntry,
  userId,
  branchId,
  storeId,
  processGroupList,
  currentProcess
) {
  const promises = productionEntryItems.map(async (entryDetail, index) => {
    const prevProcessId = productionEntry?.fromProcessId
      ? productionEntry.fromProcessId
      : null;
    const orderQty = entryDetail?.orderQty
      ? Math.round(parseFloat(entryDetail.orderQty))
      : null;
    let beforeProcessId = null;
    // if (prevProcessId) {
    //   const currentProcess = await tx.processGroupList.findFirst({
    //     where: {
    //       processId: prevProcessId,
    //     },
    //     select: {
    //       seqNo: true,
    //     },
    //   });
    //   if (currentProcess?.seqNo) {
    //     const beforeProcess = await tx.processGroupList.findFirst({
    //       where: {
    //         seqNo: currentProcess.seqNo - 1,
    //       },
    //       select: {
    //         processId: true,
    //       },
    //     });
    //     beforeProcessId = beforeProcess?.processId || null;
    //   }
    // }
    if (currentProcess) {
      const previousProcess = processGroupList.find(
        (item) => item.seqNo === currentProcess.seqNo - 1
      );
      beforeProcessId = previousProcess.processId || null;
    }
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
        employeeId: entryDetail?.employeeId
          ? parseInt(entryDetail?.employeeId)
          : null,
      },
    });

    await tx.productionStock.create({
      data: {
        inOrOut: "productionAdd",
        productionEntryItemsId: createdItem.id,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),

        fabricId: entryDetail?.fabricId ? parseInt(entryDetail.fabricId) : null,
        styleId: entryDetail?.styleId ? parseInt(entryDetail.styleId) : null,
        styleItemId: entryDetail?.styleItemId
          ? parseInt(entryDetail.styleItemId)
          : null,
        colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
        sizeId: entryDetail?.sizeId ? parseInt(entryDetail.sizeId) : null,
        portionId: entryDetail?.portionId
          ? parseInt(entryDetail.portionId)
          : null,
        remarks: entryDetail?.remarks ?? undefined,
        qty: entryDetail?.issueQty
          ? Math.round(parseFloat(entryDetail.issueQty))
          : null,
        orderQty,
        uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
        prevProcessId: prevProcessId,
        employeeId: entryDetail?.employeeId
          ? parseInt(entryDetail?.employeeId)
          : null,
        storeId: parseInt(storeId),
      },
    });
    await tx.productionStock.create({
      data: {
        inOrOut: "productionMinus",
        productionEntryItemsId: createdItem.id,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),

        fabricId: entryDetail?.fabricId ? parseInt(entryDetail.fabricId) : null,
        styleId: entryDetail?.styleId ? parseInt(entryDetail.styleId) : null,
        styleItemId: entryDetail?.styleItemId
          ? parseInt(entryDetail.styleItemId)
          : null,
        colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
        portionId: entryDetail?.portionId
          ? parseInt(entryDetail.portionId)
          : null,
        remarks: entryDetail?.remarks ?? undefined,
        sizeId: entryDetail?.sizeId ? parseInt(entryDetail.sizeId) : null,
        qty: entryDetail?.issueQty
          ? -Math.round(parseFloat(entryDetail.issueQty))
          : null,
        orderQty,
        uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
        prevProcessId: beforeProcessId,
        employeeId: entryDetail?.employeeId
          ? parseInt(entryDetail?.employeeId)
          : null,
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
    productionEntryItems,
    styleId,
    docDate,
    productionType,
    supplierId,
    // sizeTemplateId,
    fromProcessId,
    toProcessId,
    storeId,
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
        // sizeTemplateId: parseInt(sizeTemplateId),
        fromProcessId: parseInt(fromProcessId),
        toProcessId: parseInt(toProcessId),
        storeId: parseInt(storeId),
      },
    });
    await updateProductionEntryItems(
      tx,
      productionEntryItems,
      data,
      userId,
      branchId,
      storeId,
      styleId,
      fromProcessId
    );
  });
  return { statusCode: 0, data };
}

// async function updateProductionEntryItems(
//   tx,
//   productionEntryItems,
//   productionEntry,
//   userId,
//   branchId
// ) {
//   const promises = productionEntryItems.map(async (entryDetail) => {
//     const prevProcessId = productionEntry?.fromProcessId
//       ? productionEntry.fromProcessId
//       : null;
//     const orderQty = entryDetail?.orderQty
//       ? Math.round(parseFloat(entryDetail.orderQty))
//       : null;
//     const sizes = entryDetail?.pcsSizeDetails || [];
//     if (entryDetail.id) {
//       // Update existing productionEntryItem
//       const updatedItem = await tx.productionEntryItems.update({
//         where: { id: parseInt(entryDetail.id) },
//         data: {
//           productionEntryId: parseInt(productionEntry.id),
//           fabricId: entryDetail?.fabricId
//             ? parseInt(entryDetail.fabricId)
//             : null,
//           styleId: entryDetail?.styleId ? parseInt(entryDetail.styleId) : null,
//           styleItemId: entryDetail?.styleItemId
//             ? parseInt(entryDetail.styleItemId)
//             : null,
//           sizeId: entryDetail?.sizeId ? parseInt(entryDetail.sizeId) : null,
//           colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
//           portionId: entryDetail?.portionId
//             ? parseInt(entryDetail.portionId)
//             : null,
//           orderQty,
//           remarks: entryDetail?.remarks ?? undefined,
//           issueQty: entryDetail?.issueQty
//             ? Math.round(parseFloat(entryDetail.issueQty))
//             : null,
//           uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
//           prevProcessId: prevProcessId,
//           employeeId: entryDetail?.employeeId
//             ? parseInt(entryDetail?.employeeId)
//             : null,
//         },
//       });
//       const existingSizes = await tx.pcsSizeDetails.findMany({
//         where: { productionEntryItemsId: updatedItem.id },
//       });
//       // Create map for faster match
//       const existingMap = new Map();
//       existingSizes.forEach((s) => existingMap.set(s.sizeId, s));

//       // Loop through incoming sizes
//       for (const s of sizes) {
//         if (existingMap.has(s.sizeId)) {
//           // Update existing
//           await tx.pcsSizeDetails.update({
//             where: { id: existingMap.get(s.sizeId).id },
//             data: {
//               qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
//             },
//           });

//           existingMap.delete(s.sizeId);
//         } else {
//           // Insert new
//           await tx.pcsSizeDetails.create({
//             data: {
//               sizeId: parseInt(s.sizeId),
//               qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
//               productionEntryItemsId: updatedItem.id,
//             },
//           });
//         }
//       }

//       // Delete removed sizes
//       for (const leftover of existingMap.values()) {
//         await tx.pcsSizeDetails.delete({
//           where: { id: leftover.id },
//         });
//       }
//       // Update or create Stock row
//       // === SIZE-WISE STOCK ===

//       // 1. Fetch existing stock rows for this item
//       const existingStockRows = await tx.productionStock.findMany({
//         where: { productionEntryItemsId: updatedItem.id },
//       });
//       // Create a map for quick lookup
//       const stockMap = new Map();
//       existingStockRows.forEach((row) => stockMap.set(row.sizeId, row));
//       for (const s of sizes) {
//         const sizeId = parseInt(s.sizeId);
//         const qty = s.qty ? Math.round(parseFloat(s.qty)) : null;

//         if (stockMap.has(sizeId)) {
//           // ==== UPDATE EXISTING STOCK ====
//           const row = stockMap.get(sizeId);

//           await tx.productionStock.update({
//             where: { id: row.id },
//             data: {
//               updatedById: parseInt(userId),
//               fabricId: entryDetail?.fabricId
//                 ? parseInt(entryDetail.fabricId)
//                 : null,
//               styleId: entryDetail?.styleId
//                 ? parseInt(entryDetail.styleId)
//                 : null,
//               styleItemId: entryDetail?.styleItemId
//                 ? parseInt(entryDetail.styleItemId)
//                 : null,
//               colorId: entryDetail?.colorId
//                 ? parseInt(entryDetail.colorId)
//                 : null,
//               portionId: entryDetail?.portionId
//                 ? parseInt(entryDetail.portionId)
//                 : null,
//               remarks: entryDetail?.remarks ?? undefined,
//               orderQty,
//               uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
//               prevProcessId: prevProcessId,
//               // size-level fields
//               sizeId,
//               qty,
//             },
//           });

//           // remove from map (means processed)
//           stockMap.delete(sizeId);
//         } else {
//           // ==== INSERT NEW STOCK ROW ====
//           await tx.productionStock.create({
//             data: {
//               inOrOut: "productionEntry",
//               productionEntryItemsId: updatedItem.id,
//               createdById: parseInt(userId),
//               branchId: parseInt(branchId),

//               fabricId: entryDetail?.fabricId
//                 ? parseInt(entryDetail.fabricId)
//                 : null,
//               styleId: entryDetail?.styleId
//                 ? parseInt(entryDetail.styleId)
//                 : null,
//               styleItemId: entryDetail?.styleItemId
//                 ? parseInt(entryDetail.styleItemId)
//                 : null,
//               colorId: entryDetail?.colorId
//                 ? parseInt(entryDetail.colorId)
//                 : null,
//               portionId: entryDetail?.portionId
//                 ? parseInt(entryDetail.portionId)
//                 : null,
//               remarks: entryDetail?.remarks ?? undefined,
//               orderQty,
//               uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
//               prevProcessId: prevProcessId,
//               // size-level
//               sizeId,
//               qty,
//             },
//           });
//         }
//       }

//       // 3. DELETE leftover rows (sizes removed in UI)
//       for (const leftover of stockMap.values()) {
//         await tx.productionStock.delete({
//           where: { id: leftover.id },
//         });
//       }

//       return updatedItem;
//     } else {
//       // Create new productionEntryItem
//       const createdItem = await tx.productionEntryItems.create({
//         data: {
//           productionEntryId: parseInt(productionEntry.id),

//           fabricId: entryDetail?.fabricId
//             ? parseInt(entryDetail.fabricId)
//             : null,
//           styleId: entryDetail?.styleId ? parseInt(entryDetail.styleId) : null,
//           styleItemId: entryDetail?.styleItemId
//             ? parseInt(entryDetail.styleItemId)
//             : null,
//           sizeId: entryDetail?.sizeId ? parseInt(entryDetail.sizeId) : null,
//           colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
//           portionId: entryDetail?.portionId
//             ? parseInt(entryDetail.portionId)
//             : null,
//           remarks: entryDetail?.remarks ?? undefined,
//           orderQty,
//           issueQty: entryDetail?.issueQty
//             ? Math.round(parseFloat(entryDetail.issueQty))
//             : null,
//           uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
//           prevProcessId: prevProcessId,
//         },
//       });

//       for (const s of sizes) {
//         await tx.pcsSizeDetails.create({
//           data: {
//             sizeId: parseInt(s.sizeId),
//             qty: s.qty ? Math.round(parseFloat(s.qty)) : null,
//             productionEntryItems: createdItem.id,
//           },
//         });
//       }
//       for (const s of sizes) {
//         // Create Stock row
//         await tx.productionStock.create({
//           data: {
//             inOrOut: "productionEntry",
//             productionEntryItemsId: createdItem.id,
//             createdById: parseInt(userId),
//             branchId: parseInt(branchId),

//             fabricId: entryDetail?.fabricId
//               ? parseInt(entryDetail.fabricId)
//               : null,
//             styleId: entryDetail?.styleId
//               ? parseInt(entryDetail.styleId)
//               : null,
//             styleItemId: entryDetail?.styleItemId
//               ? parseInt(entryDetail.styleItemId)
//               : null,
//             colorId: entryDetail?.colorId
//               ? parseInt(entryDetail.colorId)
//               : null,
//             portionId: entryDetail?.portionId
//               ? parseInt(entryDetail.portionId)
//               : null,
//             remarks: entryDetail?.remarks ?? undefined,
//             orderQty,
//             sizeId: s?.sizeId ? parseInt(s.sizeId) : null,
//             qty: s?.qty ? Math.round(parseFloat(s.qty)) : null,
//             uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
//             prevProcessId: prevProcessId,
//           },
//         });
//       }

//       return createdItem;
//     }
//   });

//   return Promise.all(promises);
// }

async function updateProductionEntryItems(
  tx,
  productionEntryItems,
  productionEntry,
  userId,
  branchId,
  storeId,
  styleId,
  fromProcessId
) {
  const promises = productionEntryItems.map(async (entryDetail) => {
    const prevProcessId = productionEntry?.fromProcessId
      ? productionEntry.fromProcessId
      : null;
    const orderQty = entryDetail?.orderQty
      ? Math.round(parseFloat(entryDetail.orderQty))
      : null;
    // if (prevProcessId) {
    //   const currentProcess = await tx.processGroupList.findFirst({
    //     where: {
    //       processId: prevProcessId,
    //     },
    //     select: {
    //       seqNo: true,
    //     },
    //   });
    //   if (currentProcess?.seqNo) {
    //     const beforeProcess = await tx.processGroupList.findFirst({
    //       where: {
    //         seqNo: currentProcess.seqNo - 1,
    //       },
    //       select: {
    //         processId: true,
    //       },
    //     });
    //     beforeProcessId = beforeProcess?.processId || null;
    //   }
    // }
    let processGroupId;
    const processGroup = await prisma.cuttingDelivery.findFirst({
      where: {
        styleId: parseInt(styleId),
      },
    });
    processGroupId = processGroup.processGroupId;
    let processGroupList;
    if (processGroupId) {
      processGroupList = await prisma.processGroupList.findMany({
        where: {
          processGroupId: processGroupId,
        },
      });
    }
    const currentProcess = processGroupList.find(
      (item) => item.processId === parseInt(fromProcessId)
    );
    let beforeProcessId;
    if (currentProcess) {
      const prevProcess = processGroupList.find(
        (item) => item.seqNo === currentProcess.seqNo - 1
      );
      beforeProcessId = prevProcess?.processId;
    }
    const commonStockData = {
      fabricId: entryDetail?.fabricId ? parseInt(entryDetail.fabricId) : null,
      styleId: entryDetail?.styleId ? parseInt(entryDetail.styleId) : null,
      styleItemId: entryDetail?.styleItemId
        ? parseInt(entryDetail.styleItemId)
        : null,
      colorId: entryDetail?.colorId ? parseInt(entryDetail.colorId) : null,
      portionId: entryDetail?.portionId
        ? parseInt(entryDetail.portionId)
        : null,
      sizeId: entryDetail?.sizeId ? parseInt(entryDetail.sizeId) : null,
      remarks: entryDetail?.remarks ?? undefined,
      orderQty,
      uomId: entryDetail?.uomId ? parseInt(entryDetail.uomId) : null,
      employeeId: entryDetail?.employeeId
        ? parseInt(entryDetail?.employeeId)
        : null,
    };
    if (entryDetail.id) {
      // Update existing productionEntryItem
      const updatedItem = await tx.productionEntryItems.update({
        where: { id: parseInt(entryDetail.id) },
        data: {
          ...commonStockData,
          productionEntryId: parseInt(productionEntry.id),
          issueQty: entryDetail?.issueQty
            ? Math.round(parseFloat(entryDetail.issueQty))
            : null,
          prevProcessId: prevProcessId,
        },
      });
      // 1. Fetch existing stock rows for this item
      const existingStock = await tx.productionStock.findMany({
        where: { productionEntryItemsId: updatedItem.id },
      });
      const addStock = existingStock.find((s) => s.inOrOut === "productionAdd");
      const minusStock = existingStock.find(
        (s) => s.inOrOut === "productionMinus"
      );
      if (addStock) {
        await tx.productionStock.update({
          where: { id: addStock.id },
          data: {
            ...commonStockData,
            qty: entryDetail?.issueQty
              ? Math.round(parseFloat(entryDetail.issueQty))
              : null,
            prevProcessId: prevProcessId,
            updatedById: parseInt(userId),
            storeId: parseInt(storeId),
          },
        });
      } else {
        await tx.productionStock.create({
          data: {
            ...commonStockData,
            inOrOut: "productionAdd",
            productionEntryItemsId: updatedItem.id,
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            qty: entryDetail?.issueQty
              ? Math.round(parseFloat(entryDetail.issueQty))
              : null,
            prevProcessId: prevProcessId,
            storeId: parseInt(storeId),
          },
        });
      }
      if (minusStock) {
        await tx.productionStock.update({
          where: { id: minusStock.id },
          data: {
            ...commonStockData,
            qty: entryDetail?.issueQty
              ? -Math.round(parseFloat(entryDetail.issueQty))
              : null,
            prevProcessId: beforeProcessId,
            updatedById: parseInt(userId),
            storeId: parseInt(storeId),
          },
        });
      } else {
        await tx.productionStock.create({
          data: {
            ...commonStockData,
            inOrOut: "productionMinus",
            productionEntryItemsId: updatedItem.id,
            createdById: parseInt(userId),
            branchId: parseInt(branchId),
            qty: entryDetail?.issueQty
              ? -Math.round(parseFloat(entryDetail.issueQty))
              : null,
            prevProcessId: beforeProcessId,
            storeId: parseInt(storeId),
          },
        });
      }
      return updatedItem;
    } else {
      // Create new productionEntryItem
      const createdItem = await tx.productionEntryItems.create({
        data: {
          ...commonStockData,
          productionEntryId: parseInt(productionEntry.id),
          issueQty: entryDetail?.issueQty
            ? Math.round(parseFloat(entryDetail.issueQty))
            : null,
          prevProcessId: prevProcessId,
        },
      });
      // Create Stock row
      await tx.productionStock.create({
        data: {
          ...commonStockData,
          inOrOut: "productionAdd",
          productionEntryItemsId: createdItem.id,
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          qty: entryDetail?.issueQty
            ? Math.round(parseFloat(entryDetail.issueQty))
            : null,
          prevProcessId: prevProcessId,
          storeId: parseInt(storeId),
        },
      });

      await tx.productionStock.create({
        data: {
          ...commonStockData,
          inOrOut: "productionMinus",
          productionEntryItemsId: createdItem.id,
          createdById: parseInt(userId),
          branchId: parseInt(branchId),
          qty: entryDetail?.issueQty
            ? -Math.round(parseFloat(entryDetail.issueQty))
            : null,
          prevProcessId: beforeProcessId,
          storeId: parseInt(storeId),
        },
      });

      return createdItem;
    }
  });

  return Promise.all(promises);
}

async function remove(id) {
  const data = await prisma.productionEntry.delete({
    where: {
      id: parseInt(id),
    },
  });

  return { statusCode: 0, data };
}

export { getOne, create, update, remove, get };
