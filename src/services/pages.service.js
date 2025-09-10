import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { active } = req.query
    const data = await prisma.page.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.page.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("Page");
    return { statusCode: 0, data };
}


async function getPageId(pageId) {
    const pageDatas = await prisma.page.findMany({
        where: {
            
            active: true,
        }
    });

    return pageDatas?.find(val => val?.name == pageId)
}

async function getPermissions(req) {

    const { roleId, pageId } = req.params

    console.log(roleId, pageId ,"roleId, pageId");
    

    let pageData = await getPageId(pageId);

    const data = await prisma.roleOnPage.findUnique({
        where: {
            roleId_pageId: {
                roleId: parseInt(roleId),
                pageId: parseInt(pageData?.id)
            }
        },
    })
    if (!data) return NoRecordFound("Page");
    return { statusCode: 0, data };
}


async function getSearch(req) {
    const { searchKey } = req.params
    const data = await prisma.page.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    link: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, link, active, type, pageGroupId } = await body
    const data = await prisma.page.create(
        {
            data: {
                name, link, active, type, 
                pageGroupId: pageGroupId ?  parseInt(pageGroupId) : null
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, link, active, type, pageGroupId } = await body
    const dataFound = await prisma.page.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Page");
    const data = await prisma.page.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, link, active, type, pageGroupId: parseInt(pageGroupId)
        }
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.page.delete({
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
