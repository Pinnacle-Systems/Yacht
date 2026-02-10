import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";


async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.processGroupSeq.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.processGroupSeq.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("processGroupSeq");
  const childRecord = await prisma.processGroup.count({
    where: {
      processGroupSeqsId: parseInt(id),
    },
  });
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.processGroupSeq.findMany({
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
  const { name, companyId, active = true, sequence } = await body;

  const data = await prisma.processGroupSeq.create({
    data: {
      name,
      active,
      sequence: parseInt(sequence),
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
  const { name, active, companyId, sequence } = await body;
  const dataFound = await prisma.processGroupSeq.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("processGroupSeq");
  const data = await prisma.processGroupSeq.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      active,
      sequence: parseInt(sequence),
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.processGroupSeq.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
