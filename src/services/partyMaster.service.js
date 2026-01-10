import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";
import { exclude, getRemovedItems } from "../utils/helper.js";

const prisma = new PrismaClient();

async function get(req) {
  const { companyId, active } = req.query;

  const data = await prisma.party.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      City: {
        select: {
          name: true,
          state: true,
        },
      },
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecordSales = await prisma.salesEntry.count({
    where: { customerId: parseInt(id) },
  });
  const childRecordSalesReturn = await prisma.salesReturn.count({
    where: { customerId: parseInt(id) },
  });
  const childRecordPurchase = await prisma.purchaseInward.count({
    where: { supplierId: parseInt(id) },
  });
  const childRecordPurchaseReturn = await prisma.purchaseReturn.count({
    where: { supplierId: parseInt(id) },
  });
  const data = await prisma.party.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      City: {
        select: {
          name: true,
          state: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("party");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: childRecordSales,
      childRecordPurchase: childRecordPurchase,
      childRecord: childRecordSalesReturn + childRecordPurchaseReturn + childRecordSales + childRecordPurchase
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.party.findMany({
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

export async function upload(req) {
  const { id } = req.params;

  const { isDelete } = req.body;
  const data = await prisma.party.update({
    where: {
      id: parseInt(id),
    },
    data: {
      logo: isDelete && JSON.parse(isDelete) ? "" : req.file.filename,
    },
  });
  return { statusCode: 0, data };
}

async function create(body) {
  const {
    isClient,
    isSupplier,
    name,
    aliasName,
    code,
    active,

    displayName,
    isBuyer,
    address,
    landMark,
    cityId,
    pincode,
    email,
    mobileNumber,
    contactPersonName,
    alterContactNumber,
    contactNumber,
    designation,
    department,
    contactPersonEmail,
    panNo,
    gstNo,
    msmeNo,
    cinNo,
    ifscCode,
    bankName,
    branchName,
    accountNumber,
    mailId,
    tinNo,
    cstNo,
    cstDate,
    isIgst,
    yarn,
    fabric,
    faxNo,
    website,
    partyType,
    currencyId,
    costCode,
    accessoryGroup,
    companyId,
    userId,
    payTermId,
  } = await body;
  let data;
  data = await prisma.party.create({
    data: {
      isClient,
      isSupplier,
      name,
      aliasName,
      code,
      active,
      address,
      landMark,
      displayName,
      isBuyer,
      isIgst: isIgst ? isIgst : false,
      mailId,
      pincode: pincode ? parseInt(pincode) : undefined,
      payTermId: payTermId ? parseInt(payTermId) : undefined,
      Company: companyId ? { connect: { id: parseInt(companyId) } } : undefined,
      panNo,
      tinNo,
      cstNo,
      cstDate: cstDate ? new Date(cstDate) : undefined,
      cinNo,
      faxNo,
      website,
      email,
      gstNo,
      costCode,
      mobileNumber,
      designation,
      department,
      contactPersonEmail,
      yarn,
      fabric,
      msmeNo,
      ifscCode,
      bankName,
      branchName,
      accountNumber,
      accessoryGroup,
      alterContactNumber,
      contactNumber,
      contactPersonName,
      partyType: partyType ? partyType : null,
      Currency: currencyId
        ? { connect: { id: parseInt(currencyId) } }
        : undefined,
      createdBy: userId ? { connect: { id: parseInt(userId) } } : undefined,
      City: cityId ? { connect: { id: parseInt(cityId) } } : undefined,
    },
    include: {
      City: {
        include: {
          state: true,
        },
      },
      Company: true,
      Currency: true,
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    isSupplier,
    isClient,
    name,
    aliasName,
    code,
    active,
    address,
    landMark,
    cityId,
    pincode,
    email,
    mobileNumber,
    contactPersonName,
    alterContactNumber,
    contactNumber,
    designation,
    department,
    contactPersonEmail,
    panNo,
    gstNo,
    msmeNo,
    cinNo,
    ifscCode,
    bankName,
    branchName,
    accountNumber,
    displayName,
    isBuyer,
    isIgst,
    mailId,
    tinNo,
    cstNo,
    cstDate,
    yarn,
    fabric,
    accessoryGroup,
    faxNo,
    website,
    partyType,
    companyId,
    userId,
    payTermId,
  } = await body;

  let data;

  const dataFound = await prisma.party.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      City: {
        select: {
          name: true,
          state: true,
        },
      },
    },
  });
  if (!dataFound) return NoRecordFound("party");

  await prisma.$transaction(async (tx) => {
    data = await prisma.party.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        code,
        aliasName,
        landMark,
        displayName,
        address,
        isBuyer,
        isSupplier,
        isIgst: isIgst ? isIgst : false,
        isClient,
        mailId,
        cityId: cityId ? parseInt(cityId) : undefined,
        yarn,
        fabric,
        pincode: pincode ? parseInt(pincode) : undefined,
        panNo,
        tinNo,
        cstNo,
        cstDate: cstDate ? new Date(cstDate) : undefined,
        cinNo,
        faxNo,
        email,
        website,
        gstNo,
        mobileNumber,
        createdById: userId ? parseInt(userId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        active,
        accessoryGroup,
        partyType: partyType ? partyType : null,
        contactPersonName: contactPersonName ? contactPersonName : "",
        alterContactNumber,
        contactNumber,
        designation,
        department,
        contactPersonEmail,
        msmeNo,
        ifscCode,
        bankName,
        branchName,
        accountNumber,
        payTermId: payTermId ? parseInt(payTermId) : undefined,
      },
    });
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.party.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
