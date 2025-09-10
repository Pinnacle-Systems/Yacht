import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { generateSubscriptionCode } from '../utils/helper.js';
import bcrypt from "bcrypt";

const prisma = new PrismaClient()


async function get() {
    const data = await prisma.company.findMany();
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.company.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Subscription: {
                where: {
                    AND: [
                        {
                            validFrom: {
                                lte: new Date()
                            }
                        },
                        {
                            expireAt: {
                                gte: new Date()
                            }
                        }
                    ]

                }
            }
        }
    })
    if (!data) return NoRecordFound("Company");
    return { statusCode: 0, data };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const data = await prisma.company.findMany({
        where: {
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
                }
            ],
        },
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, gstNo,panNo, contactEmail, contactName, contactMobile, validFrom, expireAt, maxUsers } = await body
    const data = await prisma.company.create({
        data: {
            name, code, gstNo,panNo, contactEmail, contactName, contactMobile: parseInt(contactMobile),
            branch: {
                create: {
                    branchName: name,
                    branchCode: code,
                    contactName,
                    contactEmail,
                    contactMobile: parseInt(contactMobile)
                },
            },
            Role: {
                create: {
                    name: "DEFAULT ADMIN",
                    User: {
                        create: {
                            username: `${name}ADMIN`,
                            password: await bcrypt.hash("Admin", 10),
                            email: contactEmail
                        }
                    },
                    defaultRole: true
                }
            },
            Subscription: {
                create: {
                    validFrom: new Date(validFrom), expireAt: new Date(expireAt),
                    code: generateSubscriptionCode(), maxUsers: parseInt(maxUsers)
                }
            },
            finYear: {
                create: {
                    from: new Date(validFrom), to: new Date(expireAt),
                }
            }
        },
    });
    const companyData = await prisma.company.findUnique({
        where: {
            id: parseInt(data.id)
        },
        include: {
            Subscription: {
                where: {
                    AND: [
                        {
                            validFrom: {
                                lte: new Date()
                            }
                        },
                        {
                            expireAt: {
                                gte: new Date()
                            }
                        }
                    ]

                }
            }
        }
    })
    return { statusCode: 0, data: companyData };
}

async function update(id, body) {
    const { name, code, gstNo,panNo, contactEmail, contactName, contactMobile } = await body
    const dataFound = await prisma.company.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Company");
    const data = await prisma.company.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, code, gstNo,panNo, contactEmail, contactName, contactMobile: parseInt(contactMobile),
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.company.delete({
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
