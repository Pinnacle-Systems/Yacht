import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.state.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
            active: active ? Boolean(active) : undefined,
        },
        include: {
            country: true
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.city.count({ where: { stateId: parseInt(id) } });
    console.log(childRecord,"childRecord");
    
    const data = await prisma.state.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("State");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.state.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
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
                {
                    country: {
                        name: {
                            contains: searchKey
                        },
                    }
                }
            ],
        },
        select: {
            name: true, code: true, gstNo: true, active: true, id: true,
            country: {
                select: {
                    name: true
                }
            }
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, gstNo, country } = await body
    const data = await prisma.state.create({
        data: {
            name, code, gstNo,
            country: {
                connect: { id: parseInt(country) }
            }
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active, gstNo, country } = await body
    const dataFound = await prisma.state.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("State");
    const data = await prisma.state.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, gstNo, active,
            country: {
                connect: { id: parseInt(country) }
            }
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.state.delete({
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
