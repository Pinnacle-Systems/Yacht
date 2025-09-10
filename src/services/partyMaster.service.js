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
    const childRecord = 0;
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
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
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
        name,
        code,
        aliasName,
        displayName,
        isSupplier,
        isBuyer,
        isClient,
        address,
        processDetails,
        mailId,
        cityId,
        pincode,
        panNo,
        tinNo,
        cstNo,
        cstDate,
        isIgst,
        yarn,
        fabric,
        cinNo,
        faxNo,
        website,
        partyType,
        gstNo,
        currencyId,
        costCode,
        priceDetails,
        shippingAddress,
        contactDetails,
        accessoryGroup,
        accessoryItemList,
        mobileNumber,
        companyId,
        active,
        userId,
    } = await body;
    let data;

    data = await prisma.party.create({
        data: {
            name,
            code,
            aliasName,
            displayName,
            isSupplier,
            isBuyer,
            isIgst: isIgst ? isIgst : false,
            mailId,
            isClient,
            address,
            pincode: pincode ? parseInt(pincode) : undefined,
            Company: companyId ? { connect: { id: parseInt(companyId) } } : undefined,
            panNo,
            tinNo,
            cstNo,
            cstDate: cstDate ? new Date(cstDate) : undefined,
            cinNo,
            faxNo,
            website,
            gstNo,
            costCode,
            mobileNumber,
            active,
            yarn,
            fabric,
            accessoryGroup,
            partyType: partyType ? partyType : null,
            Currency: currencyId
                ? { connect: { id: parseInt(currencyId) } }
                : undefined,
            createdBy: userId ? { connect: { id: parseInt(userId) } } : undefined,
            City: cityId ? { connect: { id: parseInt(cityId) } } : undefined,
            PartyBranchContactDetails: contactDetails?.length
                ? {
                    create: contactDetails.map((contact) => ({
                        contactPersonName: contact.contactPersonName || undefined,
                        mobileNo: contact.mobileNo
                            ? parseInt(contact.mobileNo)
                            : undefined,
                        email: contact.email || undefined,
                        branchName: contact.branchName || undefined,
                        branchCode: contact.branchCode || undefined,
                        branchAddress: contact.branchAddress || undefined,
                    })),
                }
                : undefined,
        },
        include: {
            PartyBranchContactDetails: true,
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
        name,
        code,
        aliasName,
        displayName,
        address,
        isSupplier,
        isBuyer,
        isClient,
        isIgst,
        processDetails,
        mailId,
        cityId,
        pincode,
        panNo,
        tinNo,
        cstNo,
        cstDate,
        yarn,
        fabric,
        accessoryGroup,
        accessoryItemList,
        cinNo,
        faxNo,
        email,
        website,
        shippingAddress,
        contactDetails,
        isContactOnly = false,
        partyType,
        mobileNumber,
        gstNo,
        isLeadForm = false,
        companyId,
        active,
        userId,
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
    console.log("dataFound", dataFound);
    if (!dataFound) return NoRecordFound("party");

    if (isContactOnly) {
        await prisma.$transaction(async (tx) => {
            data = await prisma.party.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    name,
                    code,
                    aliasName,
                    displayName,
                    address,
                    isSupplier,
                    isBuyer,
                    mailId,
                    cityId: cityId ? parseInt(cityId) : undefined,
                    pincode,
                    panNo,
                    tinNo,
                    cstNo,
                    cstDate: cstDate ? new Date(cstDate) : undefined,
                    cinNo,
                    faxNo,
                    email,
                    website,
                    isIgst,
                    gstNo,
                    yarn,
                    fabric,
                    mobileNumber,
                    createdById: userId ? parseInt(userId) : undefined,
                    companyId: companyId ? parseInt(companyId) : undefined,
                    active,
                    accessoryGroup,
                    partyType: partyType ? partyType : null,
                },
            });
        });
    } else {
        await prisma.$transaction(async (tx) => {
            data = await prisma.party.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    name,
                    code,
                    aliasName,
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
                },
            });
        });
    }

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
