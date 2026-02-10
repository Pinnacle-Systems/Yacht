import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.process.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.process.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("process");
  const childRecord = await prisma.processGroupList.count({
    where: {
      processId: parseInt(id),
    },
  });
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.process.findMany({
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
  const {
    name,
    companyId,
    active = true,
    isCutting,
    isStiching,
    isPacking,
    isIroning
  } = await body;

  const data = await prisma.process.create({
    data: {
      name,
      active,
      isCutting,
      isStiching,
      isPacking,
      isIroning,
      Company: {
        connect: {
          id: parseInt(companyId),
        },
      },
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, active, companyId, isCutting, isStiching, isPacking,isIroning } =
    await body;
  const dataFound = await prisma.process.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("process");
  const data = await prisma.process.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      active,
      isCutting,
      isStiching,
      isPacking,
      isIroning
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.process.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
