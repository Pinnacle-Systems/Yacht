import { ErrorResponse } from "../configs/Responses.js";
import { prisma } from "../lib/prisma.js";

async function getSRBarcodeDetail(req) {
  const { barcodeNo } = req.query;

  // 1️⃣ First try fetching by styleNo
  let data = await prisma.stockSummary.findFirst({
    where: {
      barcodeNo: barcodeNo,
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
      rate: true,
    },
  });

  // 2️⃣ If no data found, try fetching by barCode
  if (!data || data.length === 0 || data === null) {
    return ErrorResponse("Barcode Number Not Found");
  }

  if (data.qty === 0) {
    return ErrorResponse("Barcode Number Does Not Exist");
  }

  return {
    statusCode: 0,
    data: { ...data },
  };
}

export { getSRBarcodeDetail };
