import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function get(req) {
  const { companyId, active } = req.query;

  const data = await prisma.accessory.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.accessory.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("Assessory");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.accessory.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
        {
          code: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { name, aliasName, accessoryGroupId, hsn, companyId, active } = body;

  const data = await prisma.accessory.create({
    data: {
      name,
      aliasName,
      hsn,
      accessoryGroupId: parseInt(accessoryGroupId),
      companyId: parseInt(companyId),
      active,
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, aliasName, accessoryGroupId, hsn, companyId, active } =
    await body;
  const dataFound = await prisma.accessory.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Accessory");
  const data = await prisma.accessory.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      aliasName,
      hsn,
      accessoryGroupId: parseInt(accessoryGroupId),
      companyId: parseInt(companyId),
      active,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.accessory.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
