import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active, defaultRole, approverData } = req.query
    let data;
    console.log(approverData, "hit");

    if (!approverData) {

        data = await prisma.percentage.findMany({
            where: {
                active: active ? Boolean(active) : undefined,
            }
        });
    } else {

        data = await prisma.approvalDoneBy.findMany({
            select: {
                id: true,
                selectedApprover: true
            }


        });
    }
    return { statusCode: 0, data };
}

async function getOne(id) {
    const childRecord = await prisma.user.count({ where: { roleId: parseInt(id) } });
    const data = await prisma.percentage.findUnique({
        where: {
            id: parseInt(id)
        }

    })
    if (!data) return NoRecordFound("Percentage");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, defaultRole } = req.query
    const data = await prisma.percentage.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            defaultRole: defaultRole ? JSON.parse(defaultRole) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
            ],
        },
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { active, qty, approverData, selectedApprover } = await body
    let data;
    if (approverData) {
        data = await prisma.approvalDoneBy.create({
            data: {
                selectedApprover: selectedApprover ? selectedApprover : undefined,


            },
        });
    } else {

        data = await prisma.percentage.create({
            data: {
                qty: qty ? parseInt(qty) : null,
                active: active,

            },
        });
    }
    return { statusCode: 0, data };
}



async function update(id, body) {
    const { approverData, selectedApprover } = await body
    const dataFound = await prisma.approvalDoneBy.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("role");
    const data = await prisma.approvalDoneBy.update({
        where: {
            id: parseInt(id),
        },
        data: {
            selectedApprover: selectedApprover ? selectedApprover : undefined,
        },
    })
    return { statusCode: 0, data };
};


async function remove(id) {
    const data = await prisma.percentage.delete({
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
    remove,
}
