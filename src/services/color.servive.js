// import prisma from "../models/getPrisma.js"
import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()
async function get(req) {
    const { companyId, active, isGrey } = req.query
    const data = await prisma.color.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            isGrey: isGrey ? Boolean(isGrey) : undefined
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.color.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("color");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.color.findMany({
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

// async function create(body) {
//     const { name, pantone, companyId, active, isGrey } = await body
//     const data = await prisma.color.create(
//         {
//             data: {
//                 name, pantone, companyId: parseInt(companyId), active, isGrey
//             }
//         }
//     )
//     return { statusCode: 0, data };
// }

async function create(body) {
    const { name, pantone, companyId, active = true, isGrey = false } = await body;

    // Auto-generate number: max + 1 per company
    const lastColor = await prisma.color.findFirst({
        where: { companyId: parseInt(companyId) },
        orderBy: { number: 'desc' },
    });

    const nextNumber = lastColor ? lastColor.number + 1 : 1;

    const data = await prisma.color.create({
        data: {
            name,
            pantone,
            number: nextNumber, 
            active,
            isGrey,
            Company: {
                connect: {
                    id: parseInt(companyId),
                },
            },
        },
    });

    return { statusCode: 0, data };
}






async function update(id, body) {
    const { name, pantone, active, isGrey } = await body
    const dataFound = await prisma.color.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("color");
    const data = await prisma.color.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, pantone, active, isGrey
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.color.delete({
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
