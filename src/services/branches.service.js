import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active } = req.query
    const data = await prisma.branch.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        },
        include:{
            Employee:{
                select:{
                    id:true
                }
            }
        }
    });
    return { statusCode: 0, data };
}

async function getOne(id) {
    const data = await prisma.branch.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Employee: {
                select: {
                    id: true
                }
            }
        }
    })
    if (!data) return NoRecordFound("Branch");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.branch.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    branchName: {
                        contains: searchKey,
                    },
                },
                {
                    branchCode: {
                        contains: searchKey,
                    },
                }
            ],
        },
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, contactEmail, contactName, contactMobile, companyId, address } = await body
    const data = await prisma.branch.create({
        data: {
            branchName: name, branchCode: code, contactEmail, contactName, contactMobile: parseInt(contactMobile),address,
            company: {
                connect: { id: parseInt(companyId) }
            }
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, contactEmail, contactName, contactMobile, active, prefixCategory, idPrefix, idSequence, tempPrefix, tempSequence, address } = await body

    const dataFound = await prisma.branch.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Branch");
    const data = await prisma.branch.update({
        where: {
            id: parseInt(id),
        },
        data: {
            branchName: name, branchCode: code, contactEmail, contactName, contactMobile: contactEmail ? parseInt(contactMobile) : undefined, active,
            idPrefix, idSequence, tempPrefix, tempSequence, prefixCategory, address
        },
    })
    return { statusCode: 0, data };
};

async function updateMany(req) {
    const branchDetails = await req.body;
    for (let branch of branchDetails) {
        if (!branch.prefixCategory) continue
        const dataFound = await prisma.branch.findUnique({
            where: {
                id: parseInt(branch.id)
            }
        })
        if (!dataFound) return NoRecordFound("Branch", branch.branchName);
        const data = await prisma.branch.update({
            where: {
                id: parseInt(branch.id),
            },
            data: {
                branchName: branch.branchName,
                idPrefix: branch.idPrefix, idSequence: branch.idSequence, tempPrefix: branch.tempPrefix, tempSequence: branch.tempSequence,
                prefixCategory: branch.prefixCategory
            },
        })
    }
    return { statusCode: 0, message: "Updated Successfully" };
}


async function remove(id) {
    const data = await prisma.branch.delete({
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
    updateMany,
    remove
}
