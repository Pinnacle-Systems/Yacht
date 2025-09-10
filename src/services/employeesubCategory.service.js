import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function get(req) {
  const { branchId, active } = req.query;
  const data = await prisma.employeSubCategory.findMany({
    where: {
      // active: active ? Boolean(active) : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
    },
     include: {
      employeeCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.employeSubCategory.findUnique({
    where: {
      id: parseInt(id),
    }, include: {
      employeeCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Employee Sub Category");
  return { statusCode: 0, data };
}

async function getSearch(req) {
  const { branchId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.employeSubCategory.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      // active: active ? Boolean(active) : undefined,
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
  const { gradeName, active, employeeCategoryId, branchId, companyId } =
    await body;

  const data = await prisma.employeSubCategory.create({
    data: {
      gradeName,
      active,
      companyId: companyId ? parseInt(companyId) : undefined,
      employeeCategoryId: employeeCategoryId
        ? parseInt(employeeCategoryId)
        : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { gradeName, active, employeeCategoryId, branchId, companyId } =
    await body;
  const dataFound = await prisma.employeSubCategory.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Employee Category");
  const data = await prisma.employeSubCategory.update({
    where: {
      id: parseInt(id),
    },
    data: {
      gradeName,
      active,
      companyId: companyId ? parseInt(companyId) : undefined,
      employeeCategoryId: employeeCategoryId
        ? parseInt(employeeCategoryId)
        : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.employeSubCategory.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
