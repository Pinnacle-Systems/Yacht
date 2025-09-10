import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active,poType } = req.query
    const data = await prisma.termsAndConditions.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            itemType: poType,

        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.termsAndConditions.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("termsAndConditions");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.termsAndConditions.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    aliasName: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { itemType, description, companyId, userId, active,isPurchaseOrder } = await body
    const data = await prisma.termsAndConditions.create({
        data: {
            itemType, description,
            createdById: parseInt(userId),
            active, companyId: parseInt(companyId),
            isPurchaseOrder
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { itemType, description, userId, active,isPurchaseOrder } = await body
    const dataFound = await prisma.termsAndConditions.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("termsAndConditions");
    const data = await prisma.termsAndConditions.update({
        where: {
            id: parseInt(id),
        },
        data: {
            itemType, description,
            updatedById: parseInt(userId),
            active, isPurchaseOrder
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.termsAndConditions.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
