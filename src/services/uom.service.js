import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query

    const data = await prisma.unitOfMeasurement.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.unitOfMeasurement.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("unitOfMeasurement");
    return { statusCode: 0, data: data};

}



async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.unitOfMeasurement.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },

            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, companyId, active } = await body
    console.log('its working')
    const data = await prisma.unitOfMeasurement.create(
        {
            data: {
                name, companyId: parseInt(companyId), active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active } = await body
    const dataFound = await prisma.unitOfMeasurement.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("unitOfMeasurement");
    const data = await prisma.unitOfMeasurement.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.unitOfMeasurement.delete({
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
