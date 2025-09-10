import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
const prisma = new PrismaClient()

async function get(req) {
    const { companyId, active, isPcsStage, isCutting, isPrintingJobWork, isStitching, isIroning } = req.query
    const data = await prisma.process.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            // isPcsStage: isPcsStage ? JSON.parse(isPcsStage) : undefined,
            // isCutting: isCutting ? JSON.parse(isCutting) : undefined,
            // isPrintingJobWork: isPrintingJobWork ? JSON.parse(isPrintingJobWork) : undefined,
            isStitching: isStitching ? JSON.parse(isStitching) : undefined,
            isIroning: isIroning ? JSON.parse(isIroning) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.process.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("process");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.process.findMany({
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
    const { name, io, companyId, active, code, isCutting, isPacking, isPcsStage, isPrintingJobWork, isStitching, isIroning } = await body
    const data = await prisma.process.create(
        {
            data: {
                name, io: io ? io : undefined, companyId: parseInt(companyId), isStitching, isIroning,
                active, code, isCutting, isPacking, isPcsStage, isPrintingJobWork
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {


    const { name, io, active, code, isCutting, isPacking, isPcsStage, isStitching, isPrintingJobWork, isIroning } = await body


    const dataFound = await prisma.process.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("process");
    const data = await prisma.process.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, io: io ? io : undefined, active, code, isCutting, isPacking, isPcsStage,
            isPrintingJobWork, isStitching, isIroning
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.process.delete({
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
