import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function create(body) {
  const { date, submitter, submittingTo, supplierId, sampleEntryGrid } = body;

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.sampleEntry.create({
      data: {
        date: date ? new Date(date) : null,
        submitter: submitter || "",
        submittingTo: submittingTo || "",
        supplierId: parseInt(supplierId),
        sampleEntryGrid:
          sampleEntryGrid?.length > 0
            ? {
                create: sampleEntryGrid.map((item) => ({
                  fabCode: item.fabCode,
                  styleSheetId: item?.styleSheetId || null,
                  sampleEntrySubGrid: {
                    createMany: {
                      data: item?.sampleEntrySubGrid.map((sub) => ({
                        fabType: sub?.fabType || "",
                        fiberContent: sub?.fiberContent || "",
                        weightGSM: sub?.weightGSM?.toString() || "",
                        widthFinished: sub?.widthFinished || "",
                        smsMoq: sub?.smsMoq || "",
                        smsMcq: sub?.smsMcq || "",
                        smsLeadTime: sub?.smsLeadTime || "",
                        fabricImage: sub?.fabricImage || "",
                      })),
                    },
                  },
                })),
              }
            : undefined,
      },
    });
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { date, submitter, submittingTo, supplierId, sampleEntryGrid } = body;

  const dataFound = await prisma.sampleEntry.findUnique({
    where: { id: parseInt(id) },
  });

  if (!dataFound) return NoRecordFound("Purchase order record");

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.sampleEntry.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : null,
        submitter: submitter || "",
        submittingTo: submittingTo || "",
        supplierId: parseInt(supplierId),
        // sampleEntryGrid: {
        //   deleteMany: {},
        //   create: sampleEntryGrid.map((item) => ({
        //     fabCode: item.fabCode,
        //     styleSheetId: item?.styleSheetId || null,
        //     sampleEntrySubGrid: {
        //       create: {
        //         fabType: item.sampleEntrySubGrid?.fabType || "",
        //         fiberContent: item.sampleEntrySubGrid?.fiberContent || "",
        //         weightGSM: item.sampleEntrySubGrid?.weightGSM?.toString() || "",
        //         widthFinished: item.sampleEntrySubGrid?.widthFinished || "",
        //         smsMoq: item.sampleEntrySubGrid?.smsMoq || "",
        //         smsMcq: item.sampleEntrySubGrid?.smsMcq || "",
        //         smsLeadTime: item.sampleEntrySubGrid?.smsLeadTime || "",
        //         fabricImage: item.sampleEntrySubGrid?.fabricImage || "",
        //       },
        //     },
        //   })),
        // },
      },
    });
  });
  return { statusCode: 0, data };
}

async function get(req) {
  const { pagination, pageNumber, dataPerPage } = req.query;

  let data = await prisma.sampleEntry.findMany({
    include: {
      sampleEntryGrid: {
        include: {
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },
          sampleEntrySubGrid: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          address: true,
          mobileNumber: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const totalCount = data.length;
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
    );
  }

  return { statusCode: 0, data, totalCount };
}

async function getOne(id) {
  if (!id) {
    throw new Error("PO ID is required");
  }

  const data = await prisma.sampleEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      sampleEntryGrid: {
        include: {
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },
          sampleEntrySubGrid: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          address: true,
          mobileNumber: true,
        },
      },
    },
  });

  if (!data) {
    return { statusCode: 1, message: "No Sample Entry found", data: null };
  }

  return { statusCode: 0, message: "Sample Entry fetched successfully", data };
}

async function remove(id) {
  const data = await prisma.sampleEntry.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { create, update, getOne, get, remove };
