import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { createproductionReceiptByAuto, getTableRecordWithId } from '../utils/helperQueries.js';
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import dataIntegrityValidation from "../validators/DataIntegregityValidation/index.js";
const prisma = new PrismaClient()
async function getNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.dipatched.findFirst({
        where: {
            branchId: parseInt(branchId),
            AND: [
                {
                    createdAt: {
                        gte: startTime

                    }
                },
                {
                    createdAt: {
                        lte: endTime
                    }
                }
            ],
        },
        orderBy: {
            id: 'desc'
        }
    });
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/DIS/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/DIS/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

function manualFilterSearchData(searchDelDate, data) {
    return data.filter(item =>
        (searchDelDate ? String(getDateFromDateTime(item.createdAt)).includes(searchDelDate) : true)
    )
}

async function get(req) {
    const { branchId, active, storeId, pagination, pageNumber, dataPerPage,
        searchDocId, searchDelDate, searchSupplierAliasName, styleId, finYearId
    } = req.query
    let data;
    let totalCount;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    data = await prisma.dipatched.findMany({
        where: {
            AND: (finYearDate) ? [
                {
                    createdAt: {
                        gte: finYearDate?.startTime
                    }
                },
                {
                    createdAt: {
                        lte: finYearDate?.endTime
                    }
                }
            ] : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            active: active ? Boolean(active) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            // itemId: (itemId ? JSON.parse(itemId) : null) ? parseInt(itemId) : undefined,
            Supplier: Boolean(searchSupplierAliasName) ? {
                aliasName: { contains: searchSupplierAliasName }
            } : undefined,
        },
        orderBy: {
            id: "desc"
        },
        include: {

            Order: {
                select: {
                    docId: true
                }
            },
        }
    });
    data = manualFilterSearchData(searchDelDate, data)
    totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
    return { statusCode: 0, data, nextDocId: newDocId, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.dipatched.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {

            Order: {
                select: {
                    docId: true
                }
            },
            dispatchedDetails: {
                include: {

                    Item: {
                        select: {
                            name: true
                        }
                    },

                    Color: {
                        select: {
                            name: true
                        }
                    },
                    Size: {
                        select: {
                            name: true
                        }
                    },

                }
            },
        }
    })

    if (!data) return NoRecordFound("dipatched");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function getSearch(req) {
    const { companyId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.dipatched.findMany({
        where: {
            country: {
                companyId: companyId ? parseInt(companyId) : undefined,
            },
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    aliasName: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function createDispatchedDetails(tx, dispatchedDetails, dispatched, orderId) {

    const promises = dispatchedDetails.map(async (item) => {
        return await tx.dispatchedDetails.create({
            data: {
                dipatchedId: parseInt(dispatched.id),
                itemId: parseInt(item.itemId),
                colorId: item.colorId ? parseInt(item.colorId) : undefined,
                sizeId: parseInt(item.sizeId),
                delQty: parseFloat(item.delQty),
                stockForPanels: {
                    create: {
                        inOrOut: "Out",
                        orderId: orderId ? parseInt(orderId) : undefined,
                        panelId: item?.panelId ? parseInt(item.panelId) : null,
                        // prevProcessId: processId ? parseInt(processId) : undefined,
                        colorId: item.colorId ? parseInt(item.colorId) : undefined,
                        panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                        uomId: item.uomId ? parseInt(item.uomId) : undefined,
                        itemId: parseInt(item.itemId),
                        sizeId: parseInt(item.sizeId),
                        storeId: parseInt(dispatched.storeId),
                        branchId: parseInt(dispatched.branchId),
                        qty: 0 - parseInt(item.delQty),

                    }
                }
            }
        })
    }
    )
    return Promise.all(promises)
}


async function create(body) {
    const { supplierId, branchId, userId, orderId,
        vehicleNo, remarks, storeId, specialInstructions, dueDate, dispatchedDetails, dispatchedType, deliveryId, finYearId } = await body
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);

    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)
    let data;
    await prisma.$transaction(async (tx) => {
        data = await tx.dipatched.create({
            data: {
                docId: newDocId,
                supplierId: supplierId ? parseInt(supplierId) : undefined,
                deliveryId: deliveryId ? parseInt(deliveryId) : undefined,
                storeId: parseInt(storeId),
                orderId: orderId ? parseInt(orderId) : undefined,
                dispatchedType,
                vehicleNo,
                remarks,
                specialInstructions,
                createdById: parseInt(userId),
                branchId: parseInt(branchId),
            },
        });
        await createDispatchedDetails(tx, dispatchedDetails, data, orderId)
        // await dataIntegrityValidation(tx);
    })


    return { statusCode: 0, data };
}

async function updateDispatchedDetails(tx, dispatchedDetails, dispatched, orderId) {
    let stage;
    let removedItems = dispatched?.dispatchedDetails?.filter(oldItem => {
        let result = dispatchedDetails.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })
    let removedItemsId = removedItems.map(item => parseInt(item))
    await tx.dispatchedDetails.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })
    const promises = dispatchedDetails.map(async (item) => {
        if (item?.id) {
            return await tx.dispatchedDetails.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    dipatchedId: parseInt(dispatched.id),

                    itemId: parseInt(item.itemId),

                    colorId: item.colorId ? parseInt(item.colorId) : undefined,

                    sizeId: parseInt(item.sizeId),
                    delQty: parseFloat(item.delQty),

                    stockForPanels: {
                        update: {
                            inOrOut: "Out",
                            orderId: orderId ? parseInt(orderId) : undefined,
                            panelId: item?.panelId ? parseInt(item.panelId) : null,
                            // prevProcessId: processId ? parseInt(processId) : undefined,
                            colorId: item.colorId ? parseInt(item.colorId) : undefined,
                            panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                            uomId: item.uomId ? parseInt(item.uomId) : undefined,
                            itemId: parseInt(item.itemId),
                            sizeId: parseInt(item.sizeId),
                            storeId: parseInt(dispatched.storeId),
                            branchId: parseInt(dispatched.branchId),
                            qty: 0 - parseInt(item.delQty),

                        }
                    }
                }
            })
        } else {
            return await tx.dispatchedDetails.create({
                data: {
                    dipatchedId: parseInt(dispatched.id),
                    itemId: parseInt(item.itemId),
                    colorId: item.colorId ? parseInt(item.colorId) : undefined,
                    sizeId: parseInt(item.sizeId),
                    delQty: parseFloat(item.delQty),

                    stockForPanels: {
                        create: {
                            inOrOut: "Out",
                            orderId: orderId ? parseInt(orderId) : undefined,
                            panelId: item?.panelId ? parseInt(item.panelId) : null,
                            prevProcessId: processId ? parseInt(processId) : undefined,
                            colorId: item.colorId ? parseInt(item.colorId) : undefined,
                            panelColorId: item.panelColorId ? parseInt(item.panelColorId) : undefined,
                            uomId: item.uomId ? parseInt(item.uomId) : undefined,
                            itemId: parseInt(item.itemId),
                            sizeId: parseInt(item.sizeId),
                            storeId: parseInt(productionDelivery.storeId),
                            branchId: parseInt(productionDelivery.branchId),
                            qty: 0 - parseInt(item.delQty),

                        }
                    }
                }
            })
        }
    })
    return Promise.all(promises)
}

async function update(id, body) {
    const { supplierId, branchId, userId, orderId, dispatchedType,
        vehicleNo, remarks, storeId, specialInstructions, dispatchedDetails, deliveryId } = await body
    let data;
    const dataFound = await prisma.dipatched.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            dispatchedDetails: true
        }
    })
    if (!dataFound) return NoRecordFound("dipatched");
    await prisma.$transaction(async (tx) => {
        data = await tx.dipatched.update({
            where: {
                id: parseInt(id),
            },
            data: {
                supplierId: supplierId ? parseInt(supplierId) : undefined,
                deliveryId: deliveryId ? parseInt(deliveryId) : undefined,
                storeId: parseInt(storeId),
                dispatchedType,
                vehicleNo,
                remarks,
                orderId: orderId ? parseInt(orderId) : undefined,
                specialInstructions,
                updatedById: parseInt(userId),
                branchId: parseInt(branchId),

            },

        });
        await updateDispatchedDetails(tx, dispatchedDetails, dataFound, orderId)
        // await dataIntegrityValidation(tx);
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.dipatched.delete({
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
