import { ErrorResponse } from "../configs/Responses.js";
import { prisma } from "../lib/prisma.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";

async function getSRBarcodeDetail(req) {
  const { barcodeNo, branchId, isHo } = req.query;
  const isHeadOffice = isHo === "true";
  // 1️⃣ First try fetching by styleNo
  let data = await prisma.stockSummary.findFirst({
    where: {
      barcodeNo: barcodeNo,
      branchId: parseInt(branchId),
    },
    select: {
      barcodeNo: true,
      barcodeId: true,
      colorId: true,
      uomId: true,
      styleId: true,
      sizeId: true,
      styleItemId: true,
      qty: true,
    },
  });

  // 2️⃣ If no data found, try fetching by barCode
  if (!data || data.length === 0 || data === null) {
    return ErrorResponse("Barcode Number Not Found");
  }

  const isReturn = await prisma.purchasReturnItemsSR.aggregate({
    where: {
      barcodeNo: barcodeNo,
      PurchaseReturnShowRoom:{
        is:{
          branchId: parseInt(branchId),
        }
      }
    },
    _sum: {
      returnQty: true,
    },
  });

  if (isReturn?._sum?.returnQty > 0) {
    return ErrorResponse("This Barcode Number Already Return");
  }

  if (data.qty === 0) {
    return ErrorResponse("Barcode Number Does Not Exist");
  }

  const purchaseDetail = await prisma.purchaseBillItems.findFirst({
    where: {
      barcodeNo: barcodeNo,
      PurchaseBill: {
        is: {
          branchId: parseInt(branchId),
        },
      },
    },
    orderBy: {
      id: "desc",
    },
    select: {
      PurchaseBill: {
        select: {
          docId: true,
          supplierId: true,
        },
      },
    },
  });

  const style = await prisma.style.findUnique({
    where: {
      id: data.styleId,
    },
    include: {
      Hsn: {
        select: {
          taxPerc: true,
        },
      },
    },
  });

  return {
    statusCode: 0,
    data: {
      ...data,
      rate: isHeadOffice ? style?.price : style?.salesPrice,
      taxPercent: style?.Hsn?.taxPerc ?? 5,
      billNo: purchaseDetail?.PurchaseBill?.docId ?? 0,
      supplierId: purchaseDetail?.PurchaseBill?.supplierId ?? 0,
    },
  };
}

async function get(req) {
  const {
    locationId,
    pagination,
    pageNumber,
    dataPerPage,
    finYearId,
    styleId,
    sizeId,
    styleItemId,
    colorId,
    barcodeId,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  let data;
  let totalCount;
  let totalQty;
  data = await prisma.stockSummary.groupBy({
    where: {
      branchId: locationId ? parseInt(locationId) : undefined,
      styleId: styleId ? parseInt(styleId) : undefined,
      sizeId: sizeId ? parseInt(sizeId) : undefined,
      styleItemId: styleItemId ? parseInt(styleItemId) : undefined,
      colorId: colorId ? parseInt(colorId) : undefined,
      barcodeId: barcodeId ? parseInt(barcodeId) : undefined,
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
    },
    by: [
      "styleId",
      "sizeId",
      "styleItemId",
      "barcodeId",
      "colorId",
      "barcodeNo",
      "branchId",
    ],
    _sum: {
      qty: true,
    },
    orderBy: {
      barcodeNo: "asc",
    },
  });
  data = data.filter((item) => Number(item._sum?.qty) > 0);
  totalCount = data.length;
  totalQty = data?.reduce((sum, item) => sum + (item._sum?.qty || 0), 0);
  // if (pagination) {
  //   data = data.slice(
  //     (pageNumber - 1) * parseInt(dataPerPage),
  //     pageNumber * dataPerPage
  //   );
  // }
  return {
    statusCode: 0,
    data: data.map((d) => ({
      styleId: d.styleId,
      sizeId: d.sizeId,
      qty: d._sum.qty,
      barcodeNo: d.barcodeNo,
      styleItemId: d.styleItemId,
      colorId: d.colorId,
      branchId: d.branchId,
    })),
    totalCount,
    totalQty,
  };
}

async function getBarcodeList(req) {
  const { branchId } = req.query;
  const data = await prisma.stockSummary.findMany({
    where: {
      branchId: parseInt(branchId),
    },
    orderBy: {
      barcodeNo: "asc",
    },
    select: {
      barcodeId: true,
      barcodeNo: true,
    },
  });
  return { statusCode: 0, data };
}

export { getSRBarcodeDetail, get, getBarcodeList };
