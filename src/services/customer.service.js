import { prisma } from "../lib/prisma.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.customer.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function create(body) {
  const { name, mobileNo, companyId, active, branchId } = await body;
  let data;

  // let newDocId = await getNextDocId(branchId)
  data = await prisma.customer.create({
    data: {
      name: name ? name : undefined,
      mobileNo: mobileNo ? mobileNo : undefined,
      companyId: parseInt(companyId),
      active,
      branchId: parseInt(branchId),
    },
  });

  return { statusCode: 0, data };
}

async function getOne(id) {
    const data = await prisma.customer.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!data) return NoRecordFound("customer");
    return { statusCode: 0, data };
}

export { get, create, getOne };
