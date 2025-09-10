import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.location.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.location.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("location");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.location.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    storeName: {
                        contains: searchKey,
                    },
                },
                {
                    Location: {
                        branchName: {
                            contains: searchKey
                        }
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { storeName, locationId, isFabric, isYarn, isAccessory, isGarments, companyId, active } = await body
    const data = await prisma.location.create(
        {
            data: {
                storeName, locationId: parseInt(locationId),
                isFabric, isYarn, isAccessory, isGarments,
                companyId: parseInt(companyId), active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { storeName, locationId, isFabric, isYarn, isAccessory, isGarments, companyId, active } = await body
    const dataFound = await prisma.location.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("location");
    const data = await prisma.location.update({
        where: {
            id: parseInt(id),
        },
        data: {
            storeName, locationId: parseInt(locationId),
            isFabric, isYarn, isAccessory, isGarments,
            companyId: parseInt(companyId), active
        }
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.location.delete({
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
