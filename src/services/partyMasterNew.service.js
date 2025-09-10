import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";

const prisma = new PrismaClient();

async function get(req) {
  const { companyId, active } = req.query;

  const data = await prisma.partyMasterNew.findMany({
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
  const childRecord = 0;
  const data = await prisma.partyMasterNew.findUnique({
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
  if (!data) return NoRecordFound("partyMasterNew");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function create(body) {
  const {
    userId,
    isClient,
    isSupplier,
    name,
    aliasName,
    partyCode,
    active,
    displayName,

    address,
    landMark,
    cityId,
    pincode,
    email,
    contact,

    contactPersonName,
    designation,
    department,
    contactPersonEmail,
    contactPersonNumber,
    alterContactNumber,
    currencyId,
    payTermId,
    panNo,
    gstNo,
    msmeNo,
    cinNo,
    bankName,
    bankBranchName,
    accountNumber,
    ifscCode,
    companyId,
  } = body;
  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.partyMasterNew.create({
      data: {
        
        isClient: typeof isClient === "boolean" ? isClient : false,
        isSupplier: typeof isSupplier === "boolean" ? isSupplier : false,
        name: name ? name : "",
        aliasName: aliasName ? aliasName : "",
        partyCode: partyCode ? partyCode : "",
        active: typeof active === "boolean" ? active : true,
        displayName: displayName ? displayName : "",

        address: address ? address : "",
        landMark: landMark ? landMark : "",
        pincode: pincode ? parseInt(pincode) : null,
        email: email ? email : "",
        contact: contact ? BigInt(contact) : null,

        contactPersonName: contactPersonName ? contactPersonName : "",
        designation: designation ? designation : "",
        department: department ? department : "",
        contactPersonEmail: contactPersonEmail ? contactPersonEmail : "",
        contactPersonNumber: contactPersonNumber ? BigInt(contactPersonNumber) : "",
        alterContactNumber: alterContactNumber ? BigInt(alterContactNumber) : "",

        panNo: panNo ? panNo : "",
        gstNo: gstNo ? gstNo : "",
        msmeNo: msmeNo ? msmeNo : "",
        cinNo: cinNo ? cinNo : "",
        bankName: bankName ? bankName : "",
        bankBranchName: bankBranchName ? bankBranchName : "",
        accountNumber: accountNumber ? BigInt(accountNumber) : null,
        ifscCode: ifscCode ? ifscCode : "",
        companyId: companyId ? parseInt(companyId) : null,
        currencyId: currencyId ? parseInt(currencyId) : null,
        cityId: cityId ? parseInt(cityId) : null,
        payTermId: payTermId ? parseInt(payTermId) : null,
         createdById: userId ? parseInt(userId) : null,
      },
    });
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
     userId,
    isClient,
    isSupplier,
    name,
    aliasName,
    partyCode,
    active,
    displayName,

    address,
    landMark,
    cityId,
    pincode,
    email,
    contact,

    contactPersonName,
    designation,
    department,
    contactPersonEmail,
    contactPersonNumber,
    alterContactNumber,
    currencyId,
    payTermId,
    panNo,
    gstNo,
    msmeNo,
    cinNo,
    bankName,
    bankBranchName,
    accountNumber,
    ifscCode,
    companyId,
  } = body;

  const dataFound = await prisma.partyMasterNew.findUnique({
    where: { id: parseInt(id) },
  });

  if (!dataFound) return NoRecordFound("Party Master record not found");
  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.partyMasterNew.update({
      where: { id: parseInt(id) },
      data: {
        isClient: typeof isClient === "boolean" ? isClient : false,
        isSupplier: typeof isSupplier === "boolean" ? isSupplier : false,
        name: name ? name : "",
        aliasName: aliasName ? aliasName : "",
        partyCode: partyCode ? partyCode : "",
        active: typeof active === "boolean" ? active : true,
        displayName: displayName ? displayName : "",

        address: address ? address : "",
        landMark: landMark ? landMark : "",
        pincode: pincode ? parseInt(pincode) : null,
        email: email ? email : "",
        contact: contact ? BigInt(contact) : null,

        contactPersonName: contactPersonName ? contactPersonName : "",
        designation: designation ? designation : "",
        department: department ? department : "",
        contactPersonEmail: contactPersonEmail ? contactPersonEmail : "",
        contactPersonNumber: contactPersonNumber ? BigInt(contactPersonNumber) : "",
        alterContactNumber: alterContactNumber ? BigInt(alterContactNumber) : "",

        panNo: panNo ? panNo : "",
        gstNo: gstNo ? gstNo : "",
        msmeNo: msmeNo ? msmeNo : "",
        cinNo: cinNo ? cinNo : "",
        bankName: bankName ? bankName : "",
        bankBranchName: bankBranchName ? bankBranchName : "",
        accountNumber: accountNumber ? BigInt(accountNumber) : null,
        ifscCode: ifscCode ? ifscCode : "",
        companyId: companyId ? parseInt(companyId) : null,
        currencyId: currencyId ? parseInt(currencyId) : null,
        cityId: cityId ? parseInt(cityId) : null,
        payTermId: payTermId ? parseInt(payTermId) : null,
         createdById: userId ? parseInt(userId) : null,
      },
    });
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.partyMasterNew.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export  {get,getOne,create,update,remove}