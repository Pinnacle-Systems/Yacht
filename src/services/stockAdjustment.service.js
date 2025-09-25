import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.stock.findFirst({
    where: { barCode: id },
  });

  if (!data) return NoRecordFound("Barcode No");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function remove(id) {
  const data = await prisma.stock.delete({
    where: {
      barCode: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { getOne, remove };
