import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';

const prisma = new PrismaClient()


async function get(req) {
    const { companyId, active } = req.query

    const data = await prisma.email.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    console.log(id,"mailidddd")
    const childRecord = await prisma.email.count({ where: { orderId: parseInt(id) } });
    const data = await prisma.email.findUnique({
        where: {
            id: parseInt(id)
        },
        include:{
            order:{
                select:{
                   
                    orderBillItems:true
                }
            }
        }
     
    })
    if (!data) return NoRecordFound("Country");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.email.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
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
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
     const { id } = req.body
    const { isDelete } = req.body
   


    const data = await prisma.email.create({
      
        data: {
            poExcelFileName: (isDelete && JSON.parse(isDelete)) ? "" : req.file.filename,
            orderId:id  ? parseInt(id) : undefined,
        }
    }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active } = await body
    const dataFound = await prisma.email.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Country");
    const data = await prisma.country.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.email.delete({
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
