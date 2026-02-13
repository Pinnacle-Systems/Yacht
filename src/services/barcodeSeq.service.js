import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.barcodeSequence.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.barcodeSequence.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("BarcodeSequence");
  return { statusCode: 0, data: { ...data } };
}

async function create(body) {
  const { companyId, prefix, code, seqStart, active, digits, barcodeNo } =
    await body;
  const data = await prisma.barcodeSequence.create({
    data: {
      companyId: companyId ? parseInt(companyId) : null,
      prefix,
      code: parseInt(code),
      digits: parseInt(digits),
      seqStart: parseInt(seqStart),
      active,
      barcode: barcodeNo,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { companyId, code, seqStart, active, digits, barcodeNo,prefix } = await body;
  const dataFound = await prisma.barcodeSequence.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("BarcodeSequence");
  const data = await prisma.barcodeSequence.update({
    where: {
      id: parseInt(id),
    },
    data: {
      companyId: companyId ? parseInt(companyId) : null,
      prefix,
      code: parseInt(code),
      digits: parseInt(digits),
      seqStart: parseInt(seqStart),
      active,
      barcode: barcodeNo,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.barcodeSequence.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne,create, update, remove };
