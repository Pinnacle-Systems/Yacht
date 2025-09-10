import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { generateSubscriptionCode, findDateInRange } from '../utils/helper.js';

const prisma = new PrismaClient()

const xprisma = prisma.$extends({
    result: {
        subscription: {
            planStatus: {
                needs: { validFrom: true, expireAt: true },
                compute(subscription) {
                    return findDateInRange(subscription.validFrom, subscription.expireAt, new Date())
                },
            },
        },
    },
})

async function get(req) {
    const { companyId, active } = req.query
    const data = await xprisma.subscription.findMany({
        orderBy:{
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

    const data = await xprisma.subscription.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!data) return NoRecordFound("subscription");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.subscription.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    validFrom: {
                        contains: searchKey,
                    },
                },
                {
                    expireAt: {
                        contains: searchKey,
                    },
                },
            ],
        },
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { companyId, validFrom, expireAt, active, maxUsers } = await body
    const data = await prisma.subscription.create({
        data: {
            companyId: companyId ? parseInt(companyId) : null,
            validFrom: new Date(validFrom), expireAt: new Date(expireAt),
            code: generateSubscriptionCode(), maxUsers: parseInt(maxUsers)
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, companyId, pages, active } = await body
    const dataFound = await prisma.subscription.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("subscription");
    const data = await prisma.subscription.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name,
            companyId: parseInt(companyId),
            active: active,
            subscriptionOnPage: {
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
    const data = await prisma.subscription.delete({
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
