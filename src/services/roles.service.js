import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active, defaultRole } = req.query
    const data = await prisma.role.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            defaultRole: defaultRole ? JSON.parse(defaultRole) : undefined
        }
    });
    return { statusCode: 0, data };
}

async function getOne(id) {
    const childRecord = await prisma.user.count({ where: { roleId: parseInt(id) } });
    const data = await prisma.role.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            RoleOnPage: {
                include: {
                    page: true
                }
            }
        }
    })
    if (!data) return NoRecordFound("role");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, defaultRole } = req.query
    const data = await prisma.role.findMany({
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
    const { name, companyId, pages, active } = await body

    const data = await prisma.role.create({
        data: {
            name,
            companyId: companyId ? parseInt(companyId) : null,
            active: active,
            RoleOnPage: {
                createMany: {
                    data: pages.map((page) => { return { pageId: parseInt(page.id), create: page.create, read: page.read, edit: page.edit, delete: page.delete } }),
                }
            }
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, companyId, pages, active, selectedApprover, controlPanel } = await body
    const dataFound = await prisma.role.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    let data;
    if (controlPanel) {
        data = await prisma.role.update({
            where: {
                id: parseInt(id),
            },
            data: {
                seletedApprover: selectedApprover ?? undefined
            },
        })
    }
    if (!dataFound) return NoRecordFound("role");
    data = await prisma.role.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name,
            companyId: parseInt(companyId),
            active: active,
            RoleOnPage: {
                deleteMany: {},
                createMany: {
                    data: pages.map((page) => { return { pageId: parseInt(page.id), create: page.create, read: page.read, edit: page.edit, delete: page.delete } }),
                }
            }
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.role.delete({
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
