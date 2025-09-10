import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.department.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.employee.count({ where: { departmentId: parseInt(id) } });
    const data = await prisma.department.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("Department");
    return { statusCode: 0, data: {...data, ...{childRecord}} };
}

async function getSearch(req) {
    const { companyId, active } = req.query
    const {searchKey} = req.params
    const data = await prisma.department.findMany({
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
    const { name, code, companyId } = await body
    const data = await prisma.department.create(
        {
            data: {
                name, code, companyId: parseInt(companyId)
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active } = await body
    const dataFound = await prisma.department.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Department");
    const data = await prisma.department.update({
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

async function remove(id) {
    const data = await prisma.department.delete({
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
