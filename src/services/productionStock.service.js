import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function getStyleDetail(req) {
  const { styleId, branchId, fromProcessId } = req.query;
  if (!styleId || !fromProcessId) {
    return {
      statusCode: 400,
      message: "styleId is required",
    };
  }
  const currentProcess = await prisma.processGroupList.findFirst({
    where: {
      processId: parseInt(fromProcessId),
    },
    select: {
      seqNo: true,
    },
  });
  let prevProcessId;
  if (currentProcess) {
    const prevProcess = await prisma.processGroupList.findFirst({
      where: {
        seqNo: currentProcess?.seqNo - 1,
      },
    });
    prevProcessId = prevProcess?.processId;
  }
  let data = await prisma.productionStock.groupBy({
    by: [
      "styleItemId",
      "fabricId",
      "colorId",
      "portionId",
      "styleId",
      "prevProcessId",
      "sizeId",
      "qty",
      "orderQty"
    ],
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      styleId: styleId ? parseInt(styleId) : undefined,
      prevProcessId: prevProcessId ? parseInt(prevProcessId) : undefined,
    },
    // _sum: {
    //   qty: true,
    // },
  });

  if (!data || data.length === 0) return NoRecordFound("Style not found");

  // 4️⃣ Return formatted result
  return {
    statusCode: 0,
    data: data.map((d) => ({
      styleItemId: d.styleItemId,
      fabricId: d.fabricId,
      colorId: d.colorId,
      portionId: d.portionId,
      sizeId: d.sizeId,
      stkQty: d.qty,
      styleId: d.styleId,
      prevProcessId: d.prevProcessId,
      orderQty: d.orderQty
    })),
  };
}

export { getStyleDetail };
