import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

import { getTotalQty } from "../utils/poHelpers/getTotalQuantity.js";
const prisma = new PrismaClient();

async function get(req) {
  const { branchId, pagination, pageNumber = 1, dataPerPage = 10 } = req.query;

  const whereClause = {
    branchId: branchId ? parseInt(branchId) : undefined,
  };

  let data = await prisma.purchaseInwardEntry.findMany({
    where: whereClause,
    include: {
      branch: true,
      purchaseInwardEntryGrid: {
        include: {
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },

          purchaseInwardEntrySubGrid: {
            include: {
              color: {
                select: {
                  id: true,
                  name: true,
                },
              },
              UnitOfMeasurement: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const totalCount = data.length;

  data = await getTotalQty(data);

  // Paginate
  if (pagination === "true" || pagination === true) {
    const startIdx = (parseInt(pageNumber) - 1) * parseInt(dataPerPage);
    const endIdx = startIdx + parseInt(dataPerPage);
    data = data.slice(startIdx, endIdx);
  }

  return { statusCode: 0, data, totalCount };
}

async function getOne(id) {
  if (!id) {
    throw new Error("PurchaseInwardEntry ID is required");
  }

  const data = await prisma.purchaseInwardEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      branch: true,
      purchaseInwardEntryGrid: {
        include: {
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },

          purchaseInwardEntrySubGrid: {
            include: {
              color: {
                select: {
                  id: true,
                  name: true,
                },
              },
              UnitOfMeasurement: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!data) {
    return {
      statusCode: 1,
      message: "No PurchaseInwardEntry found",
      data: null,
    };
  }

  return {
    statusCode: 0,
    message: "PurchaseInwardEntry fetched successfully",
    data,
  };
}

async function create(body) {
  const { date, poId, branchId, userId, orderId, poDetails } = body;

  let data;

  console.log("podetailsss", poDetails[0]?.purchaseInwardEntrySubGrid);

  await prisma.$transaction(async (tx) => {
    data = await tx.purchaseInwardEntry.create({
      data: {
        date: date ? new Date(date) : null,
        poId: poId ? parseInt(poId) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        createdBy: userId ? parseInt(userId) : undefined,
        updatedBy: userId ? parseInt(userId) : undefined,
        orderId: orderId ? parseInt(orderId) : undefined,
        isPurchased: true,

        purchaseInwardEntryGrid:
          poDetails?.length > 0
            ? {
                create: poDetails.map((item) => ({
                  styleSheetId: item?.styleSheetId || null,
                  purchaseInwardEntrySubGrid: {
                    createMany:{ 
                      data : item?.purchaseInwardEntrySubGrid?.map((sub) => ({
                      fabType: sub.fabType || "",
                      fiberContent: sub.fiberContent || "",

                      quantity: parseFloat(sub.quantity) || 0,
                      actualQuantity: parseFloat(sub.actualQuantity) || 0,

                      colorId: sub.colorId ? parseInt(sub.colorId) : undefined,
                      uomId: sub.uomId ?parseInt(sub.uomId) : undefined,
                    })),
                  },
                  }
                })),
              }
            : undefined,
      },
    });
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const { date, poId, branchId, userId, orderId, poDetails } = body;

  const dataFound = await prisma.purchaseInwardEntry.findUnique({
    where: { id: parseInt(id) },
  });

  if (!dataFound) return NoRecordFound("Purchase order record");

  let data;

  await prisma.$transaction(async (tx) => {
    // Update parent
    data = await tx.purchaseInwardEntry.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : null,
        poId: poId ? parseInt(poId) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        createdBy: userId ? parseInt(userId) : undefined,
        updatedBy: userId ? parseInt(userId) : undefined,
        orderId: orderId ? parseInt(orderId) : undefined,
        isPurchased: true,
      },
    });

    for (const item of poDetails) {
      for (const sub of item?.purchaseInwardEntrySubGrid || []) {
        if (sub?.id) {
          await tx.purchaseInwardEntrySubGrid.update({
            where: { id: sub?.id },
            data: {
              actualQuantity: parseFloat(sub?.actualQuantity) || 0,
            },
          });
        }
      }
    }
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.purchaseInwardEntry.delete({
    where: {
      id: parseInt(id),
    },

    include: {
      purchaseInwardEntryGrid: {
        include: {
          purchaseInwardEntrySubGrid: true,
        },
      },
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove };
