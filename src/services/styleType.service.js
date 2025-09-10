import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.styleType.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.styleType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("styleType");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.styleType.findMany({
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
    const { name, code, companyId, active } = await body
    const data = await prisma.styleType.create(
        {
            data: {
                name, code, companyId: parseInt(companyId), active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active } = await body
    const dataFound = await prisma.styleType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("styleType");
    const data = await prisma.styleType.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active
        },
    })
    return { statusCode: 0, data };
};


async function checkIsItemIsUsed(styleTypeId) {

    let data = await prisma.$queryRaw`select *
    from style i
    where i.styleTypeId = ${styleTypeId}
    `
    if (data?.length > 0) throw Error("This styleType Is Already used in  Item")
    return

}



async function remove(id) {
    let data;

    await checkIsItemIsUsed(id)
    data = await prisma.styleType.delete({
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
