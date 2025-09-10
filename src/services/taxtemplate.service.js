import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { exclude } from '../utils/helper.js';



const prisma = new PrismaClient()

async function get(req) {

    const { companyId, active } = req.query
    const data = await prisma.taxTemplate.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.taxTemplate.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            TaxTemplateDetails: true
        }
    })
    if (!data) return NoRecordFound("taxTemplate");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.taxTemplate.findMany({
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
    const { name, companyId, active, taxTemplateDetails } = await body
    const data = await prisma.taxTemplate.create(
        {
            data: {
                name, companyId: parseInt(companyId), active,
                TaxTemplateDetails: {
                    createMany: {
                        data: taxTemplateDetails.map(temp => { temp["taxTermId"] = parseInt(temp["taxTermId"]); return temp })
                    }
                }
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, companyId, active, taxTemplateDetails } = await body
    const dataFound = await prisma.taxTemplate.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("taxTemplate");
    const data = await prisma.taxTemplate.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, companyId: parseInt(companyId), active,
            TaxTemplateDetails: {
                deleteMany: {},
                createMany: {
                    data: taxTemplateDetails.map(temp => { temp["taxTermId"] = parseInt(temp["taxTermId"]); return exclude(temp, ["id", "taxTemplateId"]) })
                }
            }
        }
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.taxTemplate.delete({
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
