import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.finYear.findMany({
        orderBy: {
            id: 'desc'
        },
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}

async function getOne(id) {
      const childRecord = await prisma.payFrequency.count({ where: { finYearId: parseInt(id) } });
    const data = await prisma.finYear.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!data) return NoRecordFound("FinYear");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.finYear.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        },
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { companyId, from, to, active,code } = await body
    const data = await prisma.finYear.create({
        data: {
            companyId: companyId ? parseInt(companyId) : null,
            from: new Date(from), to: new Date(to),
            active,
            code
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { companyId, from, to, active,code } = await body
    const dataFound = await prisma.finYear.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("FinYear");
    const data = await prisma.finYear.update({
        where: {
            id: parseInt(id),
        },
        data: {
            companyId: parseInt(companyId),
            active: active,
            from: new Date(from), to: new Date(to),
            code
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.finYear.delete({
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
