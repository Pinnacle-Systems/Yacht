import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";

const prisma = new PrismaClient();
async function get(req) {
  const {
    branchId,
    storeId,
    pagination,
    pageNumber,
    dataPerPage,
    searchStyle,
    searchFabric,
    searchStore,
    finYearId,
    styleId,
    sizeId,
    fabricId,
    styleItemId,
    colorId,
    itemType,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  let data;
  let totalCount;
  let totalQty;
  let totalMeter;
  data = await prisma.materialStock.groupBy({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      storeId: storeId ? parseInt(storeId) : undefined,
      styleId: styleId ? parseInt(styleId) : undefined,
      sizeId: sizeId ? parseInt(sizeId) : undefined,
      fabricId: fabricId ? parseInt(fabricId) : undefined,
      styleItemId: styleItemId ? parseInt(styleItemId) : undefined,
      colorId: colorId ? parseInt(colorId) : undefined,
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
      Fabric: {
        name: searchFabric ? { contains: searchFabric } : undefined,
      },
      Store: {
        storeName: searchStore ? { contains: searchStore } : undefined,
      },
      itemType: itemType ? { contains: itemType } : undefined,
    },
    by: [
      "styleId",
      "sizeId",
      "styleNo",
      "fabricId",
      "styleItemId",
      "colorId",
      "accessoryGroupId",
      "accessoryId",
    ],
    _sum: {
      qty: true,
      fabMeter: true,
    },
    orderBy: {
      styleNo: "asc",
    },
  });
  totalCount = data.length;
  totalQty = data?.reduce((sum, item) => sum + (item._sum?.qty || 0), 0);
  totalMeter = data?.reduce((sum, item) => sum + (item._sum?.fabMeter || 0), 0);

  return {
    statusCode: 0,
    data: data.map((d) => ({
      styleNo: d.styleNo,
      styleId: d.styleId,
      sizeId: d.sizeId,
      stkQty: d._sum.qty,
      fabricId: d.fabricId,
      styleItemId: d.styleItemId,
      colorId: d.colorId,
      fabMeter: d._sum.fabMeter,
      accessoryId: d.accessoryId,
      accessoryGroupId: d.accessoryGroupId,
    })),
    totalCount,
    totalQty,
    totalMeter,
  };
}

async function getStyleDetail(req) {
  const { styleId, storeId, branchId } = req.query;
  if (!styleId || styleId === "0" || styleId === "") {
    return {
      statusCode: 400,
      message: "styleId is required",
    };
  }
  // 1️⃣ First try fetching by styleNo
  let data = await prisma.materialStock.groupBy({
    by: ["styleItemId", "fabricId", "colorId", "fabWidth", "styleId"],
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      storeId: storeId ? parseInt(storeId) : undefined,
      styleId: styleId ? parseInt(styleId) : undefined,
    },
    _sum: {
      fabMeter: true,
    },
  });

  if (!data || data.length === 0) return NoRecordFound("Style not found");

  // 4️⃣ Return formatted result
  return {
    statusCode: 0,
    data: data.map((d) => ({
      styleItemId: d.styleItemId,
      fabricId: d.fabricId,
      colorId: d.colorId,
      fabWidth: d.fabWidth,
      fabMeter: d._sum.fabMeter,
      styleId: d.styleId,
    })),
  };
}

export { get, getStyleDetail };
