import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.city.findMany({
        where: {
            state: {
                country: {
                    companyId: companyId ? parseInt(companyId) : undefined,
                },
            },
            active: active ? Boolean(active) : undefined,
        },
        select: {
            name: true, code: true, active: true, id: true,
            state: {
                select: {
                    name: true,
                    country: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.city.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("City");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.city.findMany({
        where: {
            state: {
                country: {
                    companyId: companyId ? parseInt(companyId) : undefined,
                },
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
                    state: {
                        name: {
                            contains: searchKey
                        },
                    }
                }
            ],
        },
        select: {
            name: true, code: true, active: true, id: true,
            state: {
                select: {
                    name: true,
                    country: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })
    return { statusCode: 0, data: data };
}


async function create(body) {
    const { name, code, state } = await body
    const data = await prisma.city.create({
        data: {
            name, code,
            state: {
                connect: { id: parseInt(state) }
            }
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active, state } = await body
    const dataFound = await prisma.city.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!dataFound) return NoRecordFound("City");
    const data = await prisma.city.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active,
            state: {
                connect: { id: parseInt(state) }
            }
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.city.delete({
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
