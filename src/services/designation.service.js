import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.designation.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecord = await prisma.employee.count({
    where: { designationId: parseInt(id) },
  });
  const data = await prisma.designation.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("designation");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.designation.findMany({
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
  const { name, code, companyId, active } = await body;
  const data = await prisma.designation.create({
    data: {
      name,
      
      code,
      active,
     
      companyId:  parseInt(companyId) ,
     
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, code, active, companyId} = await body;
  const dataFound = await prisma.designation.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("designation");
  const data = await prisma.designation.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      active,
   
      companyId:  parseInt(companyId) ,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.designation.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
