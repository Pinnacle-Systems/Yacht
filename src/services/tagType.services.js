import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query

    const data = await prisma.tagType.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    // const childRecord = await prisma.state.count({ where: { countryId: parseInt(id) } });
    const data = await prisma.tagType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("tagType");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.tagType.findMany({
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
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, file, active } = await body
    const data = await prisma.tagType.create(
        {
            data: {
                name, active ,fileName : file ? file : undefined
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, file, active } = await body
    const dataFound = await prisma.tagType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("tagType");
    const data = await prisma.tagType.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
         name,active,fileName : file ? file : undefined
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.tagType.delete({
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
