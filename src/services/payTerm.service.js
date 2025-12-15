import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.payTerm.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.payTerm.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("payTerm");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.payTerm.findMany({
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
  const { name, days, companyId, active, aliasName } = await body;
  const data = await prisma.payTerm.create({
    data: {
      name,
      days: days ? parseInt(days) : undefined,
      companyId: parseInt(companyId),
      active,
      aliasName,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, days, companyId, active, aliasName } = await body;
  const dataFound = await prisma.payTerm.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("payTerm");
  const data = await prisma.payTerm.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      days: days ? parseInt(days) : undefined,
      companyId: companyId ?  parseInt(companyId) : undefined,
      active,
      aliasName: aliasName ? aliasName : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.payTerm.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
