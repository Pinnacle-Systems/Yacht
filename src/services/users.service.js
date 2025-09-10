import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findDateInRange, generateSubscriptionCode, exclude } from '../utils/helper.js';
import { sendMail } from '../utils/mailer.js';
import { getSubscriptionDetails } from '../utils/subscriptionCall.js';

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


async function login(req) {
    const { username, password } = req.body
    const returnData = await getSubscriptionDetails()
    if (returnData) return returnData
    const data = await xprisma.user.findUnique({
        where: {
            username: username
        },
        include: {
            role: {
                include: {
                    RoleOnPage: {
                        include: {
                            page: true
                        }
                    },
                    company: {
                        include: {
                            Subscription: {
                                orderBy: {
                                    id: 'desc'
                                }
                            }
                        }
                    },
                }
            }
        }
    })
    if (!data) {
        return { statusCode: 1, message: "Username doesn't exists" }
    };
    const isMatched = await bcrypt.compare(password, data.password);
    if (!isMatched) return { statusCode: 1, message: "Invalid Password" };
    const token = jwt.sign(
        {
            userId: data.id,
            userName: data.username,
            userRole: data.role
        },
        "RANDOM-TOKEN",
        { expiresIn: "24h" }
    );
    return { statusCode: 0, message: "Login Successfull", token, userInfo: data };
}

async function get(req) {
    const { companyId, active, defaultRole } = req.query
    const data = await prisma.user.findMany({
        where: {
            role: {
                companyId: companyId ? parseInt(companyId) : undefined,
                defaultRole: defaultRole ? JSON.parse(defaultRole) : undefined
            },
            active: active ? Boolean(active) : undefined,
        },
        include: {
            role: true
        }
    });
    return { statusCode: 0, data };
}

async function getOne(id) {
    const data = await prisma.user.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            role: true,
            UserOnBranch: {
                include: {
                    Branch: true
                }
            },
            Employee: {
                select: {
                    id: true,
                    email: true
                }
            }
        }
    })
    if (!data) return NoRecordFound("User");
    return { statusCode: 0, data: exclude(data, ["otp", "password"]) };
}

async function getSearch(req) {
    const { companyId, active, defaultRole } = req.query
    const { searchKey } = req.params
    const data = await prisma.user.findMany({
        where: {
            role: {
                companyId: companyId ? parseInt(companyId) : undefined,
                defaultRole: defaultRole ? JSON.parse(defaultRole) : undefined
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    username: {
                        contains: searchKey,
                    },
                },
            ],
        },
        include: {
            role: true
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { username, password, active, roleId, branches, employeeId, isAdmin } = await body
    const hashedPassword = await bcrypt.hash(password, 10);
    const data = await prisma.user.create({
        data: {
            username, password: hashedPassword,
            UserOnBranch: branches ? {
                createMany: {
                    data: branches.map((branch) => { return { branchId: parseInt(branch.id) } })
                }
            } : undefined,
            role: roleId ?
                {
                    connect: { id: parseInt(roleId) }
                } : undefined
            ,
            Employee: employeeId ?
                {
                    connect: { id: parseInt(employeeId) }
                }
                : undefined,
            active,
            isAdmin
        }
    })
    console.log("data", data);
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { username, password, active, roleId, branches, isAdmin } = await body
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const dataFound = await prisma.user.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("User");
    const data = await prisma.user.update({
        where: {
            id: parseInt(id),
        },
        data: {
            username, password: hashedPassword,
            UserOnBranch: {
                deleteMany: branches ? {} : undefined,
                createMany: branches ? {
                    data: branches.map((branch) => { return { branchId: parseInt(branch.id) } })
                } : undefined
            },
            roleId: roleId ? parseInt(roleId) : undefined, active, isAdmin
        }
    })
    return { statusCode: 0, data };
};


async function sendOtp(req) {
    const { userId } = await req.body
    const userData = await prisma.user.findUnique({
        where: {
            id: parseInt(userId)
        },
        include: {
            Employee: {
                select: {
                    email: true
                }
            }
        }
    })
    if (!userData) return NoRecordFound("User");
    const otp = generateSubscriptionCode();
    const data = await prisma.user.update({
        where: {
            id: parseInt(userId),
        },
        data: { otp }
    })
    let to;
    if (userData.Employee) {
        to = userData.Employee.email;
    } else {
        to = userData.email;
    }
    if (sendMail({ to, OTP: data.otp })) {
        return { statusCode: 0, message: "Otp send Successfull" }
    }
    return { statusCode: 1, message: "otp not send" };
}

async function verifyOtp(req) {
    const { userId, otp } = await req.body
    const userData = await prisma.user.findUnique({
        where: {
            id: parseInt(userId)
        }
    })
    if (userData.otp === otp) {
        return { statusCode: 0, message: "Otp Verified" }
    }
    return { statusCode: 1, message: "Wrong Otp" }
}



async function remove(id) {
    const data = await prisma.user.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    login,
    verifyOtp,
    getSearch,
    create,
    update,
    remove,
    sendOtp
}
