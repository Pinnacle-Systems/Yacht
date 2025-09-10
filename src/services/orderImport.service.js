import { PrismaClient } from '@prisma/client'
import { NoRecordFound } from '../configs/Responses.js';
import { read, utils } from "xlsx";
import { convertToImportFormat } from "../utils/excelDataTransform.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getDateFromDateTime, getDateTimeRangeForCurrentYear, getYearShortCode, getYearShortCodeForFinYear } from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { createAllClass, createAllColor, createAllSize, getAllClass, getAllColor, getAllSize } from '../query/masters.js';
import moment from 'moment';
const prisma = new PrismaClient()


async function getNextDocId(branchId) {

    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.orderImport.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORDI/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORDI/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}





async function ordergetNextDocId(branchId, shortCode, startTime, endTime, isTaxBill) {
    let lastObject = await prisma.order.findFirst({
        where: {
            // branchId: parseInt(branchId),
            // isTaxBill: typeof (isTaxBill) === "undefined" ? undefined : JSON.parse(isTaxBill),
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
    const code = (typeof (isTaxBill) === "undefined" ? undefined : JSON.parse(isTaxBill)) ? "ORD" : "ORD";
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}/${shortCode}/${code}/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/${code}/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }

    return newDocId
}


const xprisma = prisma.$extends({
    result: {
        orderImport: {
            docDate: {
                needs: { createdAt: true },
                compute(orderImport) {
                    return getDateFromDateTime(orderImport?.createdAt)
                },
            },
        }
    },
})

async function get(req) {
    const { pagination, pageNumber, dataPerPage, branchId, finYearId, searchOrderId, searchDocId, searchDocDate, searchSupplierName, orderId
    } = req.query


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    // let docId = await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime);
    let newDocId = await getNextDocId(branchId)
    let data = await xprisma.orderImport.findMany({
        where: {
            docId: searchDocId ? { contains: searchDocId } : undefined
        },

    });

    let totalCount = data.length;
    if (searchDocDate) {
        data = data.filter(i => i.docDate.includes(searchDocDate))
    }
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }

    return { statusCode: 0, data, totalCount, nextDocId: newDocId };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.orderImport.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {

            orderImportItems: true,


        }
    })
    if (!data) return NoRecordFound("orderImport");

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function createAdditionalImportData(tx, additionalImportData, orderImportId) {
    const promises = additionalImportData.map(async (item) => {
        await tx.additionalImportData.create({
            data: {
                orderImportId: parseInt(orderImportId),
                bottomColorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                itemTypeId: item?.itemTypeId ? parseInt(item?.itemTypeId) : undefined,
                gender: item?.gender ? item?.gender : null,
                qty: item?.qty ? item?.qty : undefined,
                classIds: {
                    createMany: {
                        data: item.classIds.map(temp => ({
                            classId: temp.classId ? parseInt(temp.classId) : undefined,
                            qty: temp.qty ? parseInt(temp.qty) : undefined,
                            sizeId: temp.sizeId ? parseInt(temp.sizeId) : undefined,
                            bottomSizeId: temp?.sizeId ? parseInt(temp?.sizeId) : undefined,
                        }))
                    }
                },
            }
        })
    }
    )
    return Promise.all(promises)
}





async function createOrderImportItems(additionalImportData) {

    let orderImportArray = [];
    for (let i = 0; i < additionalImportData?.length; i++) {
        let obj = additionalImportData[i]
        let colorName = await getTableRecordWithId(parseInt(obj?.colorId), "color")
        colorName = colorName ? colorName.name : "";
        let bottomColor = await getTableRecordWithId(parseInt(obj?.colorId), "color")
        bottomColor = bottomColor ? bottomColor.name : "";
        let genderobj;
        if (obj?.gender === "MALE") {
            genderobj = "M"
        }
        else if (obj?.gender === "FEMALE") {
            genderobj = "F"
        }
        else {
            genderobj = "O"
        }


        for (let j = 0; j < obj?.classIds?.length; j++) {
            let newObj = obj?.classIds[j]

            let className = await getTableRecordWithId(newObj?.classId, "class")
            className = className ? className.name : "";
            let sizeName = await getTableRecordWithId(parseInt(newObj?.sizeId), "size")
            sizeName = sizeName ? sizeName.name : "";
            let bottomSize = await getTableRecordWithId(parseInt(newObj?.sizeId), "size")
            bottomSize = bottomSize ? bottomSize.name : "";

            for (let k = 0; k < newObj?.qty; k++) {


                let readyObj = {
                    classId: parseInt(newObj?.classId),
                    sizeId: parseInt(newObj?.sizeId),
                    bottomSizeId: parseInt(newObj?.sizeId),
                    bottomColorId: parseInt(obj?.colorId),
                    colorId: parseInt(obj?.colorId),
                    bottomColor: colorName,
                    student_name: "samplename",
                    class: className,
                    color: colorName,
                    size: sizeName,
                    bottomsize: sizeName,
                    gender: genderobj,
                }

                orderImportArray?.push(readyObj)

            }
        }
    }

    return orderImportArray

}




async function create(req) {

    const { userId, branchId, partyId, companyId, orderId, finYearId } = await req.body

    let docId = await getNextDocId(branchId);
    let data;
    let file = new Uint8Array(req.file.buffer)
    let workbook = read(file, { type: "array" });
    var sheet_name_list = workbook.SheetNames;
    const importedData = utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let headerNames = importedData;
    const orderImportItems = convertToImportFormat(importedData, headerNames);

    await prisma.$transaction(async (tx) => {
        data = await tx.orderImport.create(
            {
                data: {

                    companyId: companyId ? parseInt(companyId) : undefined,
                    branchId: branchId ? parseInt(branchId) : undefined,
                    docId,
                    createdById: parseInt(userId),
                    orderImportItems: {
                        createMany: {
                            data: orderImportItems
                        }
                    }
                }
            }
        )
    })

    await createOrder(data, finYearId, branchId, userId, companyId)

    return { statusCode: 0, data: orderImportItems };

}

async function findFromList(id, list, property) {


    if (!list) return ""

    let data = list?.find(i => i.mailId == id)?.id


    return data

}


function excelDateToJSDate(serial) {



    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    let date = new Date(utc_value * 1000);
    date = moment(date).format("DD-MM-YYYY")

    const [day, month, year] = date.split("-");
    date = new Date(+year, +month - 1, +day + 1); // month is 0-indexed

    return date

    // return date.toISOString().split('T')[0]; 
}


async function createOrder(importdata, finYearId, branchId, userId, companyId) {



    const partyData = await prisma.party.findMany({
        where: {
            active: true,
        },

    });



    let orderImport = await prisma.orderImport.findUnique({
        where: {
            id: parseInt(importdata?.id)
        },
        include: {
            orderImportItems: true,
        }
    })

    let isSave = false;
    let vendor;
    let ponumber = orderImport?.orderImportItems[0]?.po_number;
    let date = excelDateToJSDate(orderImport?.orderImportItems[0]?.month_year)

    let manufactureId = await findFromList(orderImport?.orderImportItems[0]?.manufacturer_mail_id, partyData)
    let vendorIdData = await findFromList(orderImport?.orderImportItems[0]?.vendor_mail_id, partyData)
    let isMailSent = false;


    let orderDetails = orderImport?.orderImportItems?.map((val) => {
        return {
            itemcode: val?.item_code,
            barCode: val?.ean_barcode,
            sizeDesc: val?.size_desc,
            size: val?.code,
            mrp: val?.mrp,
            orderQty: val?.order_qty,
            qty: val?.qty,
            class: val?.class,
            color: val?.colour,
            department: val?.department ? val?.department : null,
            itemCode: val?.item_code ? val?.item_code : null,
            product: val?.product ? val?.product : null,
            styleCode: val?.style_code_group ? val?.style_code_group : null,
            supplierCode: val?.season_supplier_code ? val?.season_supplier_code : null
        }
    });

    // importdata?.orderImportItems?.forEach(el => {
    //     ponumber = el.po_number;
    // });


    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let newDocId = finYearDate ? (await ordergetNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)) : "";


    let data = await prisma.order.create(
        {
            data: {
                docId: newDocId,
                branchId: parseInt(branchId),
                createdById: parseInt(userId),
                orderdate: date ? new Date(date) : null,
                poNumber: ponumber ? ponumber : null,
                isSave, isMailSent,
                vendorId: vendorIdData ? parseInt(vendorIdData) : null,
                manufactureId: manufactureId ? parseInt(manufactureId) : null,
              
                orderBillItems: orderDetails ? {
                    createMany: {
                        data: orderDetails?.map(item => ({
                            barCode: item?.barCode ? item?.barCode : null,
                            class: item?.class ? item?.class : null,
                            color: item?.color ? item?.color : null,
                            department: item?.department ? item?.department : null,
                            itemCode: item?.itemCode ? item?.itemCode.toString() : null,
                            mrp: item?.mrp ? parseInt(item.mrp) : null,
                            orderQty: item?.orderQty ? parseFloat(item?.orderQty) : null,
                            product: item?.product ? item?.product : null,
                            qty: item?.qty ? parseFloat(item.qty) : null,
                            size: item?.size ? item.size : null,
                            sizeDesc: item?.sizeDesc ? item.sizeDesc : null,
                            styleCode: item?.styleCode ? item?.styleCode : null,
                            supplierCode: item?.supplierCode ? item?.supplierCode : null,
                            excessQty: item?.excessQty ? parseFloat(item?.excessQty) : null,


                        }))
                    }
                } : undefined,

            }
        })
}




async function update(id, body) {
    const { name, code, active, orderId } = await body


    const dataFound = await prisma.orderImport.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("orderImport");
    const data = await prisma.orderImport.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active, orderId: parseInt(orderId)
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {



    const data = await prisma.orderImport.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    create,
    update,
    remove
}
