import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {

    const { companyId, active } = req.query

    let data = await prisma.styleItem.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}

async function getOne(id) {
    const childRecord = await prisma.style.count({where:{styleItemId : parseInt(id)}});
    const data = await prisma.styleItem.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("styleItem");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.styleItem.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, companyId, active } = await body
    const data = await prisma.styleItem.create(
        {
            data: {
                name, companyId: parseInt(companyId), active,
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active } = await body
    const dataFound = await prisma.styleItem.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("styleItem");
    const data = await prisma.styleItem.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active,
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.styleItem.delete({
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
