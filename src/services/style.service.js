import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

// async function get(req) {
//   const { companyId, active } = req.query;
//   const data = await prisma.style.findMany({
//     where: {
//       companyId: companyId ? parseInt(companyId) : undefined,

//       active: active ? Boolean(active) : undefined,
//     },
//     include: {
//       StyleItem: true,
//       Fabric:true
//     },
//   });
//   return { statusCode: 0, data };
// }

async function get(req) {
  const {
    companyId,
    active,
    searchStyleNo,
    searchStylename,
    searchFabricName,
  } = req.query;

  const data = await prisma.style.findMany({
    where: {
      // companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      sku: searchStyleNo ? { contains: searchStyleNo } : undefined,
      Fabric: {
        name: searchFabricName ? { contains: searchFabricName } : undefined,
      },
      StyleItem: {
        name: searchStylename ? { contains: searchStylename } : undefined,
      },
    },
    include: {
      StyleItem: true,
      Fabric: true,
    },
    orderBy: {
      sku: "asc",
    },
  });

  // Add childRecord count for each style
  const enrichedData = await Promise.all(
    data.map(async (style) => {
      const childCount = await prisma.openingStockItems.count({
        where: { styleId: style.id },
      });
      const childRecord = await prisma.fabricInwardItems.count({
        where: { styleId: style.id },
      });
      return {
        ...style,
        childRecordStock: childCount,
        childRecordPurchase: childRecord,
      };
    }),
  );

  return { statusCode: 0, data: enrichedData };
}

async function getOne(id) {
  const childRecordStock = await prisma.openingStockItems.count({
    where: { styleId: parseInt(id) },
  });
  const childRecordPurchase = await prisma.fabricInwardItems.count({
    where: { styleId: parseInt(id) },
  });
  const childRecordReadyGoods = await prisma.readyGoods.count({
    where: { styleId: parseInt(id) },
  });
  const data = await prisma.style.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!data) return NoRecordFound("style");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecordStock: childRecordStock,
      childRecordPurchase: childRecordPurchase,
      childRecord:
        childRecordPurchase + childRecordStock + childRecordReadyGoods,
    },
  };
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

async function create(req) {
  const {
    name,
    companyId,
    active,
    sku,
    alias,
    img,
    fabricId,
    sizeTemplateId,
    styleItemId,
    price,
    salesPrice,
    hsnId,
    uomId
  } = await req;
  // const file = req.file;
  const data = await prisma.style.create({
    data: {
      name,
      sku,
      alias,
      active: active !== undefined ? JSON.parse(active) : undefined,
      companyId: companyId ? parseInt(companyId) : null,
      img,
      styleItemId: styleItemId ? parseInt(styleItemId) : undefined,
      sizeTemplateId: sizeTemplateId ? parseInt(sizeTemplateId) : undefined,
      fabricId: fabricId ? parseInt(fabricId) : undefined,
      price: price ? parseInt(price) : undefined,
      salesPrice: salesPrice ? parseInt(salesPrice) : undefined,
      hsnId: hsnId ? parseInt(hsnId) : null,
      uomId: uomId ? parseInt(uomId) : null,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    name,
    companyId,
    active,
    sku,
    alias,
    img,
    fabricId,
    sizeTemplateId,
    styleItemId,
    price,
    salesPrice,
    hsnId,
    uomId
  } = await body;

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
      img: img === "" ? null : img,
      fabricId: fabricId ? parseInt(fabricId) : undefined,
      sizeTemplateId: sizeTemplateId ? parseInt(sizeTemplateId) : undefined,
      styleItemId: styleItemId ? parseInt(styleItemId) : undefined,
      price: price ? parseInt(price) : undefined,
      salesPrice: salesPrice ? parseInt(salesPrice) : undefined,
      hsnId: hsnId ? parseInt(hsnId) : null,
      uomId: uomId ? parseInt(uomId) : null,
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
      // companyId: companyId ? parseInt(companyId) : undefined,
      sku: styleNo,
    },
  });
  if (!data) return NoRecordFound("style");
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove, getStyleCode };
