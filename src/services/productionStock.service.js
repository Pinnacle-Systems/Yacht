import { PrismaClient } from "@prisma/client";
import { CustomError, NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function getStyleDetail(req) {
  const { styleId, branchId, fromProcessId, toProcessId } = req.query;
  // if (!styleId || !fromProcessId) {
  //   return {
  //     statusCode: 400,
  //     message: "styleId is required",
  //   };
  // }
  const currentProcess = await prisma.processGroupList.findFirst({
    where: {
      processId: parseInt(fromProcessId),
    },
    select: {
      seqNo: true,
    },
  });
  let prevProcessId;
  let nextProcessId;
  if (currentProcess) {
    const prevProcess = await prisma.processGroupList.findFirst({
      where: {
        seqNo: currentProcess?.seqNo - 1,
      },
    });
    const nextProcess = await prisma.processGroupList.findFirst({
      where: {
        seqNo: currentProcess?.seqNo + 1,
      },
    });
    nextProcessId = nextProcess?.processId;
    prevProcessId = prevProcess?.processId;
  }
  if (prevProcessId === undefined || !styleId) {
    return {
      statusCode: 400,
      message: "Choose Correct From Process",
    };
  }
  console.log(nextProcessId, "nextProcessId");
  console.log(toProcessId, "toProcessId");
  if (nextProcessId !== parseInt(toProcessId)) {
    return {
      statusCode: 400,
      message: "Choose Correct To Process",
    };
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
      "orderQty",
    ],
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      styleId: styleId ? parseInt(styleId) : undefined,
      prevProcessId: prevProcessId ? parseInt(prevProcessId) : undefined,
    },
    _sum: {
      qty: true,
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
      portionId: d.portionId,
      sizeId: d.sizeId,
      stkQty: d._sum.qty,
      styleId: d.styleId,
      prevProcessId: d.prevProcessId,
      orderQty: d.orderQty,
    })),
  };
}

async function getProductionStyle(req) {
  const { styleId, branchId } = req.query;
  if (!styleId || styleId === undefined) {
    return {
      statusCode: 400,
      message: "Choose Correct Style No",
    };
  }
  const lostProcess = await prisma.process.findFirst({
    where: {
      isIroning: true,
    },
  });
  const lastProcessId = lostProcess?.id;
  console.log(lastProcessId, "lastProcessId");
  let data;
  if (lastProcessId) {
    data = await prisma.productionStock.groupBy({
      by: [
        "styleId",
        "styleItemId",
        "fabricId",
        "colorId",
        "portionId",
        "prevProcessId",
        "sizeId",
      ],
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        styleId: styleId ? parseInt(styleId) : undefined,
        prevProcessId: lastProcessId ? parseInt(lastProcessId) : undefined,
      },
      _sum: {
        qty: true,
      },
    });
  }
  if (!data || data.length === 0) return NoRecordFound("Style");
  const style = await prisma.style.findUnique({
    where: {
      id: parseInt(styleId),
    },
  });
  return {
    statusCode: 0,
    data: data.map((d) => ({
      styleItemId: d.styleItemId,
      styleId: d.styleId,
      fabricId: d.fabricId,
      colorId: d.colorId,
      portionId: d.portionId,
      sizeId: d.sizeId,
      stkQty: d._sum.qty,
      prevProcessId: d.prevProcessId,
      styleNo: style?.sku,
    })),
  };
}

export { getStyleDetail, getProductionStyle };
