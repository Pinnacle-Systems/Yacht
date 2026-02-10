import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  let data = await prisma.sizeTemplate.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecord = await prisma.style.count({
    where: { sizeTemplateId: parseInt(id) },
  });
  const data = await prisma.sizeTemplate.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      SizeTemplateList: {
        select: {
          id: true,
          sizeId: true,
          Size: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("sizeTemplate");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.sizeTemplate.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { name, companyId, active, sizeTemplateList } = body;
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create SizeTemplate
    const sizeTemplate = await tx.sizeTemplate.create({
      data: {
        name,
        companyId: companyId ? parseInt(companyId) : null,
        active: active ?? true,
      },
    });

    // Step 2: Insert into SizeTemplateList
    if (sizeTemplateList?.length) {
      await tx.sizeTemplateList.createMany({
        data: sizeTemplateList.map((sizeId) => ({
          sizeTemplateId: sizeTemplate.id,
          sizeId: parseInt(sizeId),
        })),
      });
    }

    return sizeTemplate;
  });

  return { statusCode: 0, data: result };
}

async function update(id, body) {
  const { name, active, companyId, sizeTemplateList } = body;

  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Check if SizeTemplate exists
    const dataFound = await tx.sizeTemplate.findUnique({
      where: { id: parseInt(id) },
      include: { SizeTemplateList: true },
    });
    if (!dataFound) return NoRecordFound("sizeTemplate");

    // Step 2: Update SizeTemplate
    const updatedTemplate = await tx.sizeTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        active,
        companyId: companyId ? parseInt(companyId) : null,
      },
    });

    // Step 3: Replace SizeTemplateList
    if (Array.isArray(sizeTemplateList)) {
      // Delete all existing rows for this template
      await tx.sizeTemplateList.deleteMany({
        where: { sizeTemplateId: updatedTemplate.id },
      });

      // Insert new rows
      for (const sizeId of sizeTemplateList) {
        await tx.sizeTemplateList.create({
          data: {
            SizeTemplate: { connect: { id: updatedTemplate.id } },
            Size: { connect: { id: parseInt(sizeId) } },
          },
        });
      }
    }

    return updatedTemplate;
  });

  return { statusCode: 0, data: result };
}

async function remove(id) {
  const data = await prisma.sizeTemplate.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
