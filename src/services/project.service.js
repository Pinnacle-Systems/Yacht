import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { getDateFromDateTime, getDateTimeRangeForCurrentYear, getRemovedItems, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import moment from 'moment';



const prisma = new PrismaClient()


async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.project.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/PRO/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/PRO/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}

function manualFilterSearchData(searchDocDate, data) {
    return data.filter(item =>
        (searchDocDate ? String(getDateFromDateTime(item.createdAt)).includes(searchDocDate) : true)

    )
}


async function get(req) {
    const { getNotification = false, searchDocDate, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchPartyName, searchLocation, clientId } = req.query

    let data;


    data = await prisma.project.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            clientId: clientId ? parseInt(clientId) : undefined,
            location: Boolean(searchLocation) ? { contains: searchLocation } : undefined,
            Client: Boolean(searchPartyName) ? {
                name: {
                    contains: searchPartyName
                }
            } : undefined
        },
        include: {
            Client: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    data = manualFilterSearchData(searchDocDate, data)
    const totalCount = data.length
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId)
    if (getNotification) {
        data = await notificationReport(data)
        data = data?.filter(val => val?.projectDatas.length > 0)

    }



    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}

async function notificationReport(allData) {
    let singleProjectData = [];

    for (let index = 0; index < allData.length; index++) {
        const val = allData[index];
        singleProjectData.push(await getSingleData(val.id))

    }

    return singleProjectData

}


function getPriority(planEndDate) {

    const todayDate = new Date();

    if (planEndDate) {
        if ((moment(new Date(planEndDate).getTime()).format("YYYY-MM-DD") === moment(todayDate.getTime()).format("YYYY-MM-DD"))) {


            return "bg-amber-400"
        }
        else if ((moment(new Date(planEndDate).getTime()).format("YYYY-MM-DD") > moment(todayDate.getTime()).format("YYYY-MM-DD"))) {


            return "bg-green-300"
        }
        else if ((moment(new Date(planEndDate).getTime()).format("YYYY-MM-DD") < moment(todayDate.getTime()).format("YYYY-MM-DD"))) {


            return "bg-red-300"
        }
        else {
            return "bg-sky-300"
        }

    }

}

async function getSingleData(projectId) {
    const todayDate = new Date();
    const projectData = await prisma.project.findUnique({
        where: {
            id: parseInt(projectId)
        },
        include: {
            LineItems: {
                select: {
                    id: true,
                    projectId: true,
                    Product: true,
                    productId: true,
                    hsnCode: true,
                    description: true,
                    qty: true,
                    Uom: true,
                    uomId: true,
                    planStartDate: true,
                    planEndDate: true,
                    leadDays: true,
                    subLineItems: true,
                }
            },
            Branch: {
                select: {
                    branchName: true,
                    contactName: true,
                    contactMobile: true,
                    contactEmail: true
                }
            },
            Client: {
                select: {
                    name: true,
                }
            },
            Quotes: {
                select: {
                    id: true,
                    clientId: true,
                    billingAddress: true,
                    projectId: true,
                    quoteVersion: true,
                    QuotesItems: {
                        select: {
                            id: true,
                            quotesId: true,
                            planStartDate: true,
                            planEndDate: true,
                            leadDays: true,
                            productId: true,
                            qty: true,
                            price: true,
                            taxPercent: true,
                            discount: true,
                            uomId: true,
                            quoteVersion: true,
                            Uom: {
                                select: {
                                    name: true,
                                },

                            },
                            Product: {
                                select: {
                                    name: true,
                                    taxPercent: true,
                                    description: true,
                                    hsnCode: true,

                                }
                            }
                        }
                    },
                }
            }
        }
    })

    if (!projectData) return NoRecordFound("ProjectData Not Found");




    return {
        projectDocId: projectData?.docId,
        projectName: projectData?.name,
        clientId: projectData?.clientId,
        clientName: projectData?.Client?.name,

        shippingAddressId: projectData?.shippingAddressId,
        projectAddress: projectData?.address,
        lineItems: projectData?.LineItems,
        location: projectData?.location,
        projectDatas: projectData?.LineItems?.flatMap(val => val.subLineItems).filter(i => ((!i.isCompleted) && (moment(new Date(i.planEndDate).getTime()).format("YYYY-MM-DD") <= moment(todayDate.getTime()).format("YYYY-MM-DD"))))?.map((val) => ({

            lineItemsId: val.lineItemsId,
            description: val.description,
            name: val.name,
            responsiblePerson: val.responsiblePerson,
            isCompleted: val.isCompleted,
            category: val?.category,
            planStartDate: val?.planStartDate,
            planEndDate: val?.planEndDate,
            leadDays: val?.leadDays,
            token: getPriority(val?.planEndDate)
        })

        )
    }




}


async function getOne(id) {
    const childRecord = 0;
    let data;

    data = await prisma.project.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            LineItems: {
                select: {
                    id: true,
                    projectId: true,
                    Product: true,
                    productId: true,
                    hsnCode: true,
                    description: true,
                    qty: true,
                    Uom: true,
                    uomId: true,
                    planStartDate: true,
                    planEndDate: true,
                    leadDays: true,
                    subLineItems: true,
                }
            },
            Branch: {
                select: {
                    branchName: true,
                    contactName: true,
                    contactMobile: true,
                    contactEmail: true
                }
            },
            Quotes: {
                select: {
                    id: true,
                    clientId: true,
                    billingAddress: true,
                    projectId: true,
                    quoteVersion: true,
                    QuotesItems: {
                        select: {
                            id: true,
                            quotesId: true,
                            planStartDate: true,
                            planEndDate: true,
                            leadDays: true,
                            productId: true,
                            qty: true,
                            price: true,
                            taxPercent: true,
                            discount: true,
                            uomId: true,
                            quoteVersion: true,
                            Uom: {
                                select: {
                                    name: true,
                                },

                            },
                            Product: {
                                select: {
                                    name: true,
                                    taxPercent: true,
                                    description: true,
                                    hsnCode: true,

                                }
                            }
                        }
                    },
                }
            }
        }
    })




    if (!data) return NoRecordFound("project");

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.project.findMany({
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


async function createLineItems(tx, projectId, lineItems, skip = 0) {
    let promises = lineItems.map((value, index) =>
        tx.lineItems.create({
            data: {
                projectId: parseInt(projectId),
                productId: value.productId ? parseInt(value.productId) : undefined,
                hsnCode: value.hsnCode ? parseInt(value.hsnCode) : undefined,
                uomId: value.uomId ? parseInt(value.uomId) : undefined,
                description: value.description ? value.description : "",
                qty: value.qty ? parseFloat(value.qty) : 0,
                planStartDate: value["planStartDate"] ? new Date(value["planStartDate"]) : undefined,
                planEndDate: value["planEndDate"] ? new Date(value["planEndDate"]) : undefined,
                leadDays: value["leadDays"] ? value["leadDays"] : "",
                subLineItems: {
                    createMany: {
                        data: value.subLineItems.map(temp => {
                            let newItem = {}
                            newItem["name"] = temp["name"] ? temp["name"] : "";
                            newItem["responsiblePerson"] = temp["responsiblePerson"] ? temp["responsiblePerson"] : "";
                            newItem["isCompleted"] = temp["isCompleted"];
                            newItem["category"] = temp["category"] ? temp["category"] : "";
                            newItem["description"] = temp["description"] ? temp["description"] : "";
                            newItem["planStartDate"] = temp["planStartDate"] ? new Date(temp["planStartDate"]) : undefined,
                                newItem["planEndDate"] = temp["planEndDate"] ? new Date(temp["planEndDate"]) : undefined,
                                newItem["leadDays"] = temp["leadDays"] ? temp["leadDays"] : ""

                            return newItem
                        }
                        )
                    }
                }

            }
        })
    )

    return Promise.all(promises)
}


async function create(body) {
    let data;
    const { name, projectName, location, description, address, branchId, clientId, active,
        // quoteId, shippingAddressId, 
        lineItems } = await body
    let newDocId = await getNextDocId(branchId)

    await prisma.$transaction(async (tx) => {


        data = await tx.project.create(
            {
                data: {
                    docId: newDocId, projectName,
                    // name,
                    description,
                    address,
                    location, active,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    clientId: clientId ? parseInt(clientId) : undefined,
                    // quoteId: parseInt(quoteId),
                    // shippingAddressId: parseInt(shippingAddressId),

                }
            })

        await createLineItems(tx, data.id, lineItems)
    })

    const filteredQuotesId = lineItems.filter((val, index) => {
        return lineItems?.findIndex(item => parseInt(item?.quoteId) === parseInt(val?.quoteId)) === index
    })



    for (let index = 0; index < filteredQuotesId.length; index++) {
        const quoteId = filteredQuotesId[index]["quoteId"];

        await prisma.quotes.update({
            where: {
                id: parseInt(quoteId),
            },
            data: {
                projectId: data?.id ? parseInt(data?.id) : null,
            }
        })

    }


    return { statusCode: 0, data };
}


async function update(id, body) {
    let data
    const { name, projectName, location, description, address, branchId, clientId, active, quoteId, shippingAddressId, lineItems } = await body
    const dataFound = await prisma.project.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            LineItems: {
                select: {
                    id: true,
                    Product: true,
                    productId: true,
                    hsnCode: true,
                    description: true,
                    qty: true,
                    Uom: true,
                    uomId: true,
                    planStartDate: true,
                    planEndDate: true,
                    leadDays: true,
                    subLineItems: true,
                }
            },
            Branch: {
                select: {
                    branchName: true,
                    contactName: true,
                    contactMobile: true,
                    contactEmail: true
                }
            },
            Quotes: {
                select: {
                    id: true,
                    clientId: true,
                    billingAddress: true,
                    projectId: true,
                    quoteVersion: true,
                    QuotesItems: {
                        select: {
                            id: true,
                            quotesId: true,
                            planStartDate: true,
                            planEndDate: true,
                            leadDays: true,
                            productId: true,
                            qty: true,
                            price: true,
                            taxPercent: true,
                            discount: true,
                            uomId: true,
                            quoteVersion: true,
                            Uom: {
                                select: {
                                    name: true,
                                },

                            },
                            Product: {
                                select: {
                                    name: true,
                                    taxPercent: true,
                                    description: true,
                                    hsnCode: true,

                                }
                            }
                        }
                    },
                }
            }
        }
    })




    if (!dataFound) return NoRecordFound("project");

    // data = await prisma.project.update({
    //     where: {
    //         id: parseInt(id),
    //     },
    //     data: {
    //         name,
    //         description,
    //         address,
    //         location, active,
    //         branchId: parseInt(branchId),
    //         clientId: parseInt(clientId),
    //         quoteId: quoteId ? parseInt(quoteId) : "",
    //         shippingAddressId: parseInt(shippingAddressId),
    //     }
    // })




    // function getOldParameters(headingId) {
    //     return dataFound.LabTestAnalyteDetails.find(item => item.id === parseInt(headingId)).labTestAnalyteDetailsParameters.map(i => i.id)

    // }

    await prisma.$transaction(async (tx) => {

        data = await tx.project.update({
            where: {
                id: parseInt(id),
            },
            data:
            {
                // name, 
                projectName,
                description,
                address,
                location, active,
                branchId: branchId ? parseInt(branchId) : undefined,
                clientId: clientId ? parseInt(clientId) : undefined,
                // quoteId: quoteId ? parseInt(quoteId) : "",
                // shippingAddressId: parseInt(shippingAddressId),

            }
        })

        const oldLineItemsIds = dataFound.LineItems.map(item => parseInt(item.id))
        const currentLineItemsIds = lineItems.filter(i => i?.id)?.map(item => parseInt(item.id))
        const removedLineItems = getRemovedItems(oldLineItemsIds, currentLineItemsIds);
        await tx.lineItems?.deleteMany({
            where: {
                id: {
                    in: removedLineItems
                }
            }
        })

        await (async function updateGridLineItems() {
            const promises = lineItems?.map(async (h) => {

                if (h?.id) {


                    await tx.lineItems.update({
                        where: {
                            id: parseInt(h.id)
                        },
                        data: {
                            projectId: parseInt(h.projectId),

                            productId: h.productId ? parseInt(h.productId) : undefined,
                            hsnCode: h.hsnCode ? parseInt(h.hsnCode) : undefined,
                            uomId: h.uomId ? parseInt(h.uomId) : undefined,
                            description: h.description ? h.description : null,
                            qty: h.qty ? parseFloat(h.qty) : 0,

                            // productId: parseInt(h.productId),
                            // hsnCode: parseInt(h.hsnCode),
                            // description: h.description,
                            // qty: parseFloat(h.qty),
                            // uomId: parseInt(h.uomId),

                            planStartDate: h.planStartDate ? new Date(h.planStartDate) : undefined,
                            planEndDate: h.planEndDate ? new Date(h.planEndDate) : undefined,
                            leadDays: h.leadDays ? h.leadDays : "",
                            subLineItems: h.subLineItems ? {
                                deleteMany: {},
                                createMany: h.subLineItems ? {
                                    data: h.subLineItems?.map(temp => {

                                        let newItem = {}
                                        newItem["name"] = temp["name"] ? temp["name"] : null;
                                        newItem["responsiblePerson"] = temp["responsiblePerson"] ? temp["responsiblePerson"] : null;
                                        newItem["isCompleted"] = temp["isCompleted"] ? temp["isCompleted"] : false;
                                        newItem["category"] = temp["category"] ? temp["category"] : null;
                                        newItem["description"] = temp["description"] ? temp["description"] : null;
                                        newItem["planStartDate"] = temp["planStartDate"] ? new Date(temp["planStartDate"]) : undefined,
                                            newItem["planEndDate"] = temp["planEndDate"] ? new Date(temp["planEndDate"]) : undefined,
                                            newItem["leadDays"] = temp["leadDays"] ? temp["leadDays"] : ""



                                        return newItem
                                    }
                                    )
                                } : undefined
                            } : undefined
                        }
                    })
                }

                else {
                    await tx.lineItems.create({

                        data: {
                            projectId: parseInt(dataFound?.id),
                            productId: h.productId ? parseInt(h.productId) : undefined,
                            hsnCode: h.hsnCode ? parseInt(h.hsnCode) : undefined,
                            uomId: h.uomId ? parseInt(h.uomId) : undefined,
                            description: h.description ? h.description : null,
                            qty: h.qty ? parseFloat(h.qty) : 0,

                            planStartDate: h["planStartDate"] ? new Date(h["planStartDate"]) : undefined,
                            planEndDate: h["planEndDate"] ? new Date(h["planEndDate"]) : undefined,
                            leadDays: h["leadDays"] ? h["leadDays"] : "",

                            subLineItems: {

                                createMany: {

                                    data: h.subLineItems.map(temp => {

                                        let newItem = {}
                                        newItem["name"] = temp["name"] ? temp["name"] : null;
                                        newItem["responsiblePerson"] = temp["responsiblePerson"] ? temp["responsiblePerson"] : null;
                                        newItem["isCompleted"] = temp["isCompleted"] ? temp["isCompleted"] : false;
                                        newItem["category"] = temp["category"] ? temp["category"] : null;
                                        newItem["description"] = temp["description"] ? temp["description"] : null;
                                        newItem["planStartDate"] = temp["planStartDate"] ? new Date(temp["planStartDate"]) : undefined,
                                            newItem["planEndDate"] = temp["planEndDate"] ? new Date(temp["planEndDate"]) : undefined,
                                            newItem["leadDays"] = temp["leadDays"] ? temp["leadDays"] : ""

                                        return newItem
                                    }
                                    )
                                }
                            }

                        }
                    })

                }


            })
            return Promise.all(promises)
        }())

    })

    // const filteredQuotesId = lineItems.filter((val, index) => {
    //     return lineItems?.findIndex(item => parseInt(item?.quoteId) === parseInt(val?.quoteId)) === index
    // })



    // for (let index = 0; index < filteredQuotesId.length; index++) {
    //     const quoteId = filteredQuotesId[index]["quoteId"];

    //     await prisma.quotes.update({
    //         where: {
    //             id: parseInt(quoteId),
    //         },
    //         data: {
    //             projectId: data?.id ? parseInt(data?.id) : null,
    //         }
    //     })

    // }

    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.project.delete({
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