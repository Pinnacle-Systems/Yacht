import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { active } = req.query
    const data = await prisma.pageGroup.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.pageGroup.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("PageGroup");
    return { statusCode: 0, data };
}

async function getPermissions(req) {
    const { roleId, pageId } = req.params
    const data = await prisma.roleOnPage.findUnique({
        where: {
            roleId_pageId: {
                roleId: parseInt(roleId),
                pageId: parseFloat(pageId) ? parseInt(pageId) : undefined,
            }
        },
    })
    if (!data) return NoRecordFound("PageGroup");
    return { statusCode: 0, data };
}


async function getSearch(req) {
    const { searchKey } = req.params
    const data = await prisma.pageGroup.findMany({
        where: {
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
    const { name, active, type } = await body
    const data = await prisma.pageGroup.create(
        {
            data: {
                name, active, type
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active, type } = await body
    const dataFound = await prisma.pageGroup.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("PageGroup");
    const data = await prisma.pageGroup.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active, type
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.pageGroup.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getPermissions,
    getOne,
    getSearch,
    create,
    update,
    remove
}
