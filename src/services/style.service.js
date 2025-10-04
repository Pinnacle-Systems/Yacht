import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.style.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,

      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.style.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!data) return NoRecordFound("style");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const searchKey = req.params.searchKey;
  const { branchId, active } = req.query;
  const data = await prisma.style.findMany({
    where: {
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

export async function upload(req) {
  const { id } = req.params;
  const { isDelete } = req.body;
  const data = await prisma.style.update({
    where: {
      id: parseInt(id),
    },
    data: {
      logo: isDelete && JSON.parse(isDelete) ? "" : req.file.filename,
    },
  });
  return { statusCode: 0, data };
}

async function getNextStyleSku(companyId, prefix) {
  const lastStyle = await prisma.style.findFirst({
    where: { companyId: parseInt(companyId) },
    orderBy: { id: "desc" },
  });

  let nextNumber = 1;
  if (lastStyle?.styleNo) {
    const match = lastStyle.styleNo.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  const padded = String(nextNumber).padStart(4, "0");
  return `${prefix}${padded}`;
}

async function create(req) {
  const { name, companyId, active, sku, alias, img, fabricId, sizeTemplateId } =
    await req;
  // const file = req.file;
  // let styleNo = await getNextStyleSku(companyId, name);
  const data = await prisma.style.create({
    data: {
      name,
      sku,
      alias,
      active: active !== undefined ? JSON.parse(active) : undefined,
      companyId: companyId ? parseInt(companyId) : null,
      img,
      // styleNo,
      sizeTemplateId: sizeTemplateId ? parseInt(sizeTemplateId) : undefined,
      fabricId: fabricId ? parseInt(fabricId) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, companyId, active, sku, alias, img, fabricId, sizeTemplateId } =
    await body;

  const dataFound = await prisma.style.findUnique({
    where: { id: parseInt(id) },
  });

  if (!dataFound) return NoRecordFound("style");

  const data = await prisma.style.update({
    where: { id: parseInt(id) },
    data: {
      name,
      sku,
      alias,
      active: active !== undefined ? JSON.parse(active) : undefined,
      companyId: companyId ? parseInt(companyId) : null,
      img,
      fabricId: fabricId ? parseInt(fabricId) : undefined,
      sizeTemplateId: sizeTemplateId ? parseInt(sizeTemplateId) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.style.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

async function getStyleCode(req) {
  const { styleNo } = req.query;
  const data = await prisma.style.findMany({
    where: {
      sku: styleNo,
    },
  });
  if (!data) return NoRecordFound("style");
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove, getStyleCode };
