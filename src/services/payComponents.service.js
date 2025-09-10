// import prisma from "../models/getPrisma.js"
import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();
async function get(req) {
  const { companyId } = req.query;
  const data = await prisma.payComponents.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
   const childRecord = await prisma.payDetails.count({ where: { payComponentId: parseInt(id) } });
  const data = await prisma.payComponents.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("payComponents");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.payComponents.findMany({
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
    payCode,
    payDescription,
    earningsType,
    taxable,
    branchId,
    notes,
    companyId,
  } = await body;

  const data = await prisma.payComponents.create({
    data: {
      payCode,
      payDescription,
      earningsType,
      taxable,
         branch: branchId
        ? { connect: { id: parseInt(branchId) } }
        : undefined,
      company: companyId
        ? { connect: { id: parseInt(companyId) } }
        : undefined,

      notes
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    
    payCode,
    payDescription,
    earningsType,
    taxable,
    branchId,
    notes,
    companyId,
  } = await body;
  const dataFound = await prisma.payComponents.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("payComponents");
  const data = await prisma.payComponents.update({
    where: {
      id: parseInt(id),
    },
    data: {
      payCode,
      payDescription,
      earningsType,
      taxable,
      taxable,
         branch: branchId
        ? { connect: { id: parseInt(branchId) } }
        : undefined,
      company: companyId
        ? { connect: { id: parseInt(companyId) } }
        : undefined,

      notes
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.payComponents.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
