import { PrismaClient } from '@prisma/client'
import { getYearShortCode, getYearShortCodeForFinYear, substract } from './helper.js'
import { getFinYearStartTimeEndTime } from './finYearHelper.js'




const prisma = new PrismaClient()

export async function getTableRecordWithId(id, tableName) {
    return await prisma[tableName].findUnique({
        where: {
            id: parseInt(id)
        }
    })
}



export async function getSingleOrderData(id) {
    const data = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },
            orderDetails: {
                select: {
                    id: true,
                    orderId: true,
                    itemTypeId: true,
                    ItemType: true,
                    orderDetailsSubGrid: {
                        select: {
                            id: true,
                            uniformType: true,
                            orderDetailsId: true,
                            isMaleColor: true,
                            noOfSetMale: true,
                            noOfSetFemale: true,
                            isMaleColorId: true,
                            isFemaleColor: true,
                            isFemaleColorId: true,
                            isMaleStyle: true,
                            isMaleItemId: true,
                            isFemaleStyle: true,
                            isFemaleItemId: true,
                            classIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    classId: true,
                                    Class: true
                                }
                            },
                            maleColorIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    maleColorId: true,
                                    Color: true
                                }
                            },
                            femaleColorsIds: {
                                select: {
                                    id: true,
                                    orderDetailsSubGridId: true,
                                    femaleColorId: true,
                                    Color: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    if (!data) return NoRecordFound("order");

    return data

}



export async function getStudentList(filterColorIdList, filterClassOnlyIdList, filterSizeIdList, orderId) {

    const sql = `
    select * ,orderimportitems.id as studentId ,ROW_NUMBER() OVER() AS rowNum from orderimportitems 
   left join orderimport on orderImport.id=orderimportitems.orderImportId
where orderimport.orderId=${orderId}
and sizeid in (${filterSizeIdList.map(val => `"${val}"`).join(',')}) 
and classId in (${filterClassOnlyIdList.map(val => `"${val}"`).join(',')})
    `
    const studentDetails = await prisma.$queryRawUnsafe(sql);

    return studentDetails
}


export async function getFilterStudentList(orderId) {

    const sql = `
    select *,ROW_NUMBER() OVER() AS rowNum from StudentList sl
 left join SizeWiseDetails sw on sw.id=sl.sizeWiseDetailsId 
 left join ColorList cl on sw.colorListId=cl.id 
 left join Items i on i.id=cl.itemsId 
 left join CuttingOrderDetails cod on cod.id=i.cuttingOrderDetailsId
   left join CuttingOrder co on co.id=cod.cuttingOrderId
where co.orderId=${orderId};
    `
    const filterStudentDetails = await prisma.$queryRawUnsafe(sql);

    return filterStudentDetails
}

export async function getPoItemsLotBreakUp(poItemsId) {
    return await prisma.poInwardReturnItems.groupBy({
        where: {
            poItemsId
        },
        by: ['poItemsId', "lotNo"],
        _sum: {
            qty: true
        },
    })
}

export async function getAlreadyPaidAmount(billEntryId, payOutId, advanceAdjustmentId) {
    let payOuts = await prisma.payOutItems.aggregate({
        where: {
            billEntryId: parseInt(billEntryId),
            payoutId: {
                lt: JSON.parse(payOutId) ? parseInt(payOutId) : undefined
            }
        },
        _sum: {
            amount: true
        }
    })
    payOuts = payOuts?._sum?.amount ? payOuts?._sum?.amount : 0
    let advanceAdjustMents = await prisma.advanceAdjustDetails.aggregate({
        where: {
            billEntryId: parseInt(billEntryId),
            advanceAdjustMentId: {
                lt: JSON.parse(advanceAdjustmentId) ? parseInt(advanceAdjustmentId) : undefined
            }
        },
        _sum: {
            amount: true
        }
    })
    advanceAdjustMents = advanceAdjustMents?._sum?.amount ? advanceAdjustMents?._sum?.amount : 0
    return payOuts + advanceAdjustMents
}



export async function findStyleTypeName(id) {
    const data = await prisma.itemType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("styleType");

    return data?.name

}

async function findSizeName(id) {
    const data = await prisma.size.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("styleType");

    return data?.name

}


export async function findStyleItem(styleTypeId, orderData, filterStudentByItem, filterStyleIdList, filterSizeIdList, filterColorIdList, orderId, filterClassOnlyIdList) {
    let styleList = [];
    if (!styleTypeId) return
    let newArrayList = [];

    let newObject = orderData?.orderDetails?.filter(j => parseInt(j.itemTypeId) === parseInt(styleTypeId))

    newObject = newObject?.flatMap(j => j.orderDetailsSubGrid)
    newArrayList = [...newArrayList, ...newObject]

    let femaleItemList = newArrayList?.map(val => {
        return {
            itemName: val?.isFemaleStyle?.name,
            itemId: val?.isFemaleItemId,
            gender: "F"
        }
    }) || [];

    let maleItemList = newArrayList?.map(val => {
        return {
            itemName: val?.isMaleStyle?.name,
            itemId: val?.isMaleItemId,
            gender: "M"
        }
    }) || [];


    styleList = [...femaleItemList, ...maleItemList]



    let prevValue = null;

    styleList = styleList.map((item, index) => {
        const newItem = { ...item, bothGender: prevValue };
        prevValue = item?.gender;
        return newItem;
    });

    // styleList = styleList?.map(val => {
    //     return {
    //         ...val, genderBoth: [...val?.gender, val?.gender]
    //     }
    // })


    let styleArray = styleList;
    styleArray = styleArray.filter((obj, index, self) =>
        index === self.findIndex((item) => parseInt(item.itemId) === parseInt(obj.itemId))
    );


    styleArray = styleArray.filter((obj, index) =>
        filterStyleIdList.some((item) => parseInt(item) === parseInt(obj.itemId))
    );



    for (let index = 0; index < styleArray.length; index++) {
        let style = styleArray[index];
        styleArray[index]["colorList"] = await getItemColorWise(style?.itemId, styleTypeId, filterStudentByItem, filterStyleIdList, orderData, filterSizeIdList, filterColorIdList, style?.gender, orderId, filterClassOnlyIdList)
    }

    return styleArray
}



function findExtraQty(cuttingQty, noOfSet) {
    let result = (parseInt(cuttingQty) * parseInt(noOfSet))
    if (result >= 1 && result < 10) {
        return 2
    }

    else if (result >= 10 && result < 50) {
        return 3
    }
    else if (result >= 50 && result < 75) {
        return 4
    }
    else if (result >= 75 && result <= 100) {
        return 5
    }
    else if (result > 100) {
        return 6
    }

}



async function getItemColorWise(itemId, itemTypeId, filterStudentByItem, filterStyleIdList, orderData, filterSizeIdList, filterColorIdList, gender, orderId, filterClassOnlyIdList) {

    if (!filterStyleIdList) return
    let newArrayList = [];
    let maleColorList = [];
    let feMaleColorList = [];
    let houseMaleColorLists = [];
    let houseFemaleColorLists = [];

    let orderDetailsSubGrid = orderData?.orderDetails?.flatMap(j => j.orderDetailsSubGrid)
    houseFemaleColorLists = orderDetailsSubGrid?.filter(j => parseInt(j.isFemaleItemId) === parseInt(itemId))

    for (let i = 0; i < houseFemaleColorLists?.length; i++) {
        let colorList = houseFemaleColorLists[i]


        if (colorList?.uniformType == "HOUSE") {
            feMaleColorList = [...feMaleColorList, ...colorList?.femaleColorsIds]



        }
        else {
            feMaleColorList = [...feMaleColorList]
            let femaleColorObject = {
                femaleColorId: colorList?.isFemaleColorId,
                name: colorList?.isFemaleColor?.name
            }
            feMaleColorList.push(femaleColorObject)


        }
    }

    houseMaleColorLists = orderDetailsSubGrid?.filter(j => parseInt(j.isMaleItemId) === parseInt(itemId))

    for (let i = 0; i < houseMaleColorLists?.length; i++) {
        let colorList = houseMaleColorLists[i]


        if (colorList?.uniformType == "HOUSE") {


            maleColorList = [...maleColorList, ...colorList?.maleColorIds]


        }
        else {
            maleColorList = [...maleColorList]
            let maleColorObject = {
                maleColorId: colorList?.isMaleColorId,
                name: colorList?.isMaleColor?.name
            }
            maleColorList.push(maleColorObject)


        }
    }

    maleColorList = maleColorList?.map(val => {
        return {
            id: val?.maleColorId,
            name: val?.name ? val?.name : val?.Color?.name
        }
    })


    feMaleColorList = feMaleColorList?.map(val => {
        return {
            id: val?.femaleColorId,
            name: val?.name ? val?.name : val?.Color?.name
        }
    })

    newArrayList = [...newArrayList, ...maleColorList, ...feMaleColorList]
    newArrayList = newArrayList.filter((obj, index, self) =>
        index === self.findIndex((item) => parseInt(item.id) === parseInt(obj.id))
    );


    newArrayList = newArrayList.filter((obj, index) =>
        filterColorIdList.some((item) => parseInt(item) === parseInt(obj.id))
    );



    for (let index = 0; index < newArrayList.length; index++) {
        let color = newArrayList[index];

        let classArray = [];
        let genderArray = [];
        classArray = await getClassArrayFromOrder(itemId, itemTypeId, color?.id, orderId)
        classArray = classArray?.map(val => val.classId)
        let male = await getMaleGenderArrayFromOrderEntry(itemId, itemTypeId, color?.id, orderId)
        if (male !== "") {
            genderArray.push(male)
        }

        let female = await getFeMaleGenderArrayFromOrderEntry(itemId, itemTypeId, color?.id, orderId)
        if (female !== "") {
            genderArray.push(female)
        }


        console.log(genderArray, "genderArray")
        console.log(classArray, "classArray")


        let newArray = [];

        for (let j = 0; j < filterSizeIdList?.length; j++) {

            let size = filterSizeIdList[j];

            // let orderQty = (await getStudentListsByItemWise(itemId, itemTypeId, filterStudentByItem, size, color?.id, gender))?.length || 0
            let noofset = (await getStudentListsByItemWise(itemId, itemTypeId, filterStudentByItem, size, color?.id, gender))[0]?.styleType[0]?.noOfSet || 1
            let orderQty = (await getOrderQtyForCutting(size, orderId, color?.id, noofset, filterClassOnlyIdList, itemId, itemTypeId, genderArray, classArray)) || 0

            let extraQty = (findExtraQty(orderQty, noofset) || 0)

            let obj = {
                sizeId: size,
                genderArray: genderArray,
                classArray: classArray,
                sizeName: await findSizeName(size),
                studentList: await getStudentListsByItemWise(itemId, itemTypeId, filterStudentByItem, size, color?.id, gender),
                orderQty: orderQty,
                // orderQty: (await getStudentListsByItemWise(itemId, itemTypeId, filterStudentByItem, size, color?.id, gender))?.length,
                cuttingQty: (parseInt(orderQty) * parseInt(noofset)) + (extraQty || 0),
                noOfSet: (await getStudentListsByItemWise(itemId, itemTypeId, filterStudentByItem, size, color?.id, gender))[0]?.styleType[0]?.noOfSet || 1
            }
            newArray.push(obj)
        }
        newArrayList[index]["sizeList"] = newArray
    }




    return newArrayList
}


async function getClassArrayFromOrder(itemId, itemTypeId, colorId, orderId) {

    const sql = `select DISTINCT cl.classId from uniform.Order o left join OrderDetails ord on ord.orderId=o.id
left join OrderDetailsSubGrid ords on ords.orderDetailsId=ord.id
left join ClassIds cl on cl.orderDetailsSubGridId=ords.id
left join maleColorIds mc on mc.orderDetailsSubGridId=ords.id 
left join FemaleColorIds fc on fc.orderDetailsSubGridId =ords.id
 where o.id=${orderId} and ord.itemTypeId=${itemTypeId} and (((ords.isMaleItemId=${itemId} and ords.isMaleColorId=${colorId}) 
 or (ords.isMaleItemId=${itemId} and mc.maleColorId=${colorId})) or ((ords.isFemaleItemId=${itemId} and ords.isFemaleColorId=${colorId}) or
 (ords.isFemaleItemId=${itemId} and fc.femaleColorId=${colorId}))) ;
 `
    const classArray = await prisma.$queryRawUnsafe(sql);

    return classArray
}

async function getMaleGenderArrayFromOrderEntry(itemId, itemTypeId, colorId, orderId) {
    const sql = `select ords.isMaleItemId from uniform.Order o left join OrderDetails ord on ord.orderId=o.id
    left join OrderDetailsSubGrid ords on ords.orderDetailsId=ord.id
    left join ClassIds cl on cl.orderDetailsSubGridId=ords.id
    left join maleColorIds mc on mc.orderDetailsSubGridId=ords.id 
    left join FemaleColorIds fc on fc.orderDetailsSubGridId =ords.id
     where o.id=${orderId} and ord.itemTypeId=${itemTypeId} and ((ords.isMaleItemId=${itemId} and ords.isMaleColorId=${colorId}) 
     or (ords.isMaleItemId=${itemId} and mc.maleColorId=${colorId})) ;
     `
    const genderArray = await prisma.$queryRawUnsafe(sql);

    return (genderArray?.length > 0 ? "M" : "")

}



async function getFeMaleGenderArrayFromOrderEntry(itemId, itemTypeId, colorId, orderId) {
    const sql = `select ords.isFemaleItemId from uniform.Order o left join OrderDetails ord on ord.orderId=o.id
    left join OrderDetailsSubGrid ords on ords.orderDetailsId=ord.id
    left join ClassIds cl on cl.orderDetailsSubGridId=ords.id
    left join maleColorIds mc on mc.orderDetailsSubGridId=ords.id 
    left join FemaleColorIds fc on fc.orderDetailsSubGridId =ords.id
     where o.id=${orderId} and ord.itemTypeId=${itemTypeId} and  ((ords.isFemaleItemId=${itemId} and ords.isFemaleColorId=${colorId}) or
     (ords.isFemaleItemId=${itemId} and fc.femaleColorId=${colorId})) ;
     `
    const genderArray = await prisma.$queryRawUnsafe(sql);

    return (genderArray?.length > 0 ? "F" : "")



}




async function findIsBottom(typeId) {
    const process = await getTableRecordWithId(typeId, "itemType")
    const isBottom = process ? process.isBottom : false;

    return isBottom

}



async function getOrderQtyForCutting(sizeId, orderId, colorId, set, filterClassOnlyIdList, itemId, itemTypeId, genderArray, classArray) {

    let setData = set == 0 ? 1 : set
    let returnQty = [];
    const ordersql = `select * from uniform.order where id=${orderId} ;`
    let orderArray = await prisma.$queryRawUnsafe(ordersql);
    let isNotStudentList = orderArray?.[0]?.isForOrderImportItems

    if (isNotStudentList) {
        const addImportData = ` select ImportClassIds.sizeId,ImportClassIds.qty,ImportClassIds.classId,AdditionalImportData.itemId,AdditionalImportData.itemTypeId,AdditionalImportData.colorId  from orderimport 
left join AdditionalImportData on AdditionalImportData.orderImportId=orderimport.id
left join  ImportClassIds on ImportClassIds.additionalImportDataId=AdditionalImportData.id
where orderimport.orderId=${orderId} and (AdditionalImportData.colorId=${colorId} OR AdditionalImportData.bottomcolorId=${colorId})
and ImportClassIds.sizeid=${sizeId} and AdditionalImportData.itemId=${itemId} and AdditionalImportData.itemTypeId=${itemTypeId} ;
                `
        returnQty = await prisma.$queryRawUnsafe(addImportData);

        return parseInt(returnQty[0]?.qty * setData)
    }

    // for (let j = 0; j < filterClassOnlyIdList?.length; j++) {
    //     let classId = filterClassOnlyIdList[j]

    // let genArray = genderArray?.map(val => val)?.join(",")
    // let classItem = classArray?.map(val => val)?.join(",")

    let genArray = genderArray.map(item => `'${item}'`);
    genArray = genArray.join(", ");

    let classItem = classArray.map(item => `'${item}'`);
    classItem = classItem.join(", ");

    console.log(genArray, "genArray", classItem, "classItem")

    const sql = `select OrderImportItems.gender, OrderImportItems.sizeId,OrderImportItems.size ,OrderImportItems.class,OrderImportItems.color,OrderImportItems.bottomcolor,OrderImportItems.classid,OrderImportItems.colorid,OrderImportItems.bottomcolorid
    from OrderImport left join OrderImportItems on OrderImportItems.orderImportId=OrderImport.id 
   where OrderImport.orderId=${orderId} and (OrderImportItems.colorId=${colorId} OR OrderImportItems.bottomcolorId=${colorId})
     and (OrderImportItems.sizeid=${sizeId} or OrderImportItems.bottomSizeId=${sizeId}) and  OrderImportItems.gender IN (${genArray}) and OrderImportItems.classid IN (${classItem});
            `
    returnQty = await prisma.$queryRawUnsafe(sql);

    // if (returnQty?.length > 0) {
    //     break;
    // }


    // }
    return parseInt(returnQty?.length * setData)
}









async function getStudentListsByItemWise(itemId, styleTypeId, filterStudentByItem, sizeId, colorId, gender) {

    let studentList = []
    for (let i = 0; i < filterStudentByItem?.length; i++) {
        let filterByItem = filterStudentByItem[i]
        let filterItem = [];

        if ((parseInt(filterByItem?.sizeId) !== parseInt(sizeId)) && (parseInt(filterByItem?.bottomSizeId) !== parseInt(sizeId))) {
            continue
        }


        if (parseInt(filterByItem?.sizeId) === parseInt(sizeId)) {

            let filterByItemType = filterByItem?.styleType?.find(val => parseInt(val.styleTypeId) == parseInt(styleTypeId))
            if (!filterByItemType) {
                continue
            }

            for (let j = 0; j < filterByItemType?.styleItem?.length; j++) {
                let itemData = filterByItemType?.styleItem[j]

                if ((parseInt(itemData?.colorId) !== parseInt(colorId)) || (parseInt(itemData?.styleItemId) !== parseInt(itemId))) {
                    continue
                }


                filterItem.push(itemData)
            }

            if (filterItem?.length == 0) {
                continue
            }

        }
        else if (parseInt(filterByItem?.bottomSizeId) === parseInt(sizeId)) {

            let filterByItemType = filterByItem?.styleType?.find(val => (parseInt(val.styleTypeId) == parseInt(styleTypeId)))
            if (!filterByItemType || !(await findIsBottom(filterByItemType?.styleTypeId))) {
                continue
            }

            for (let j = 0; j < filterByItemType?.styleItem?.length; j++) {
                let itemData = filterByItemType?.styleItem[j]

                if ((parseInt(itemData?.colorId) !== parseInt(colorId)) || (parseInt(itemData?.styleItemId) !== parseInt(itemId))) {
                    continue
                }

                filterItem.push(itemData)
            }

            if (filterItem?.length == 0) {
                continue
            }

        }
        let newObj = { ...filterByItem, styleType: filterItem }
        studentList.push(newObj)
    }

    return studentList
}


async function groupByFields(array, fields) {

    let grouped = array.reduce((result, item) => {
        const keyObject = Object.fromEntries(fields.map(field => [field, item[field]]));
        const key = JSON.stringify(keyObject); // Use JSON stringification to ensure unique grouping

        if (!result[key]) {
            result[key] = [];
        }

        result[key].push(item);
        return result;
    }, {});

    return Object.entries(grouped).map(([key, values]) => ({
        key: JSON.parse(key),
        values,
    }));
};



async function getOrderQty(classId, sizeId, orderId, field, colorId, set) {

    const sql = `select OrderImportItems.gender, OrderImportItems.sizeId,OrderImportItems.size ,OrderImportItems.class,OrderImportItems.color,OrderImportItems.bottomcolor,OrderImportItems.classid,OrderImportItems.colorid,OrderImportItems.bottomcolorid
 from OrderImport left join OrderImportItems on OrderImportItems.orderImportId=OrderImport.id 
where OrderImport.orderId=${orderId} and OrderImportItems.classId=${classId} and (OrderImportItems.colorId=${colorId} OR OrderImportItems.bottomcolorId=${colorId})
  and OrderImportItems.sizeid=${sizeId} and OrderImportItems.gender="${field}" ;
         `
    let returnQty = await prisma.$queryRawUnsafe(sql);

    return parseInt(parseInt(returnQty?.length) * parseInt(set))
}


async function getcuttingQty(itemId, sizeId, orderId, colorId, set) {


    const sql = `select * from cuttingorder co left join CuttingOrderDetails cod on  cod.cuttingorderid=co.id left join 
items itm on itm.cuttingOrderDetailsId=cod.id left join ColorList cl on cl.itemsId=itm.id 
left join SizeWiseDetails swd on swd.colorListId=cl.id where co.orderId=${orderId} and itm.itemId=${itemId} and cl.colorId=${colorId}
and swd.sizeid=${sizeId};
         `
    let returnQty = await prisma.$queryRawUnsafe(sql);

    return returnQty[0]?.cuttingQty
}

async function getReadyQty(itemId, sizeId, orderId, colorId, set, prevProcessId, packingCategory, packingType) {
    const sql = `select sum(delQty) as delQty from productiondelivery left join productiondeliverydetails on productiondeliverydetails.productionDeliveryId=productiondelivery.id
where productiondelivery.toProcessId=${prevProcessId} and productiondelivery.orderId=${orderId} and productiondeliverydetails.colorId=${colorId} and productiondeliverydetails.itemId=${itemId}
and productiondeliverydetails.sizeid=${sizeId} and productiondelivery.packingCategory="${packingCategory}" and productiondelivery.packingType="${packingType}";
 `
    let returnQty = await prisma.$queryRawUnsafe(sql);

    return returnQty[0]?.delQty
}

async function getReceivedQtymale(itemId, sizeId, orderId, colorId, set, prevProcessId, packingCategory, packingType) {

    const sql = `select sum(maleInwardQty) as Qty from productionreceipt left join productionreceiptdetails on productionreceiptdetails.productionReceiptId=productionReceipt.id
where productionreceipt.prevProcessId=${prevProcessId} and productionreceipt.orderId=${orderId} and productionreceiptdetails.colorId=${colorId} and productionreceiptdetails.itemId=${itemId}
and productionreceiptdetails.sizeid=${sizeId} and productionreceipt.packingCategory="${packingCategory}" and productionreceipt.packingType="${packingType}";
 `
    let returnQty = await prisma.$queryRawUnsafe(sql);



    return parseInt(returnQty[0]?.Qty || 0)
}

async function getReceivedQtymaleByClass(classId, itemId, sizeId, orderId, colorId, set, prevProcessId, packingCategory, packingType) {

    const sql = `select sum(maleInwardQty) as Qty from productionreceipt left join productionreceiptdetails on productionreceiptdetails.productionReceiptId=productionReceipt.id
where productionreceipt.prevProcessId=${prevProcessId} and productionreceipt.orderId=${orderId} and productionreceiptdetails.colorId=${colorId} and productionreceiptdetails.itemId=${itemId}
and productionreceiptdetails.sizeid=${sizeId} and productionreceipt.packingCategory="${packingCategory}" and productionreceipt.packingType="${packingType}" and productionreceiptdetails.classId=${classId};
 `
    let returnQty = await prisma.$queryRawUnsafe(sql);



    return parseInt(returnQty[0]?.Qty || 0)
}

async function getReceivedQtyfemale(itemId, sizeId, orderId, colorId, set, prevProcessId, packingCategory, packingType) {

    const sql = `select sum(femaleInwardQty) as Qty from productionreceipt left join productionreceiptdetails on productionreceiptdetails.productionReceiptId=productionReceipt.id
where productionreceipt.prevProcessId=${prevProcessId} and productionreceipt.orderId=${orderId} and productionreceiptdetails.colorId=${colorId} and productionreceiptdetails.itemId=${itemId}
and productionreceiptdetails.sizeid=${sizeId} and productionreceipt.packingCategory="${packingCategory}" and productionreceipt.packingType="${packingType}";
 `
    let returnQty = await prisma.$queryRawUnsafe(sql);

    return parseInt(returnQty[0]?.Qty || 0)
}

async function getReceivedQtyfemaleByClass(classId, itemId, sizeId, orderId, colorId, set, prevProcessId, packingCategory, packingType) {

    const sql = `select sum(femaleInwardQty) as Qty from productionreceipt left join productionreceiptdetails on productionreceiptdetails.productionReceiptId=productionReceipt.id
where productionreceipt.prevProcessId=${prevProcessId} and productionreceipt.orderId=${orderId} and productionreceiptdetails.colorId=${colorId} and productionreceiptdetails.itemId=${itemId}
and productionreceiptdetails.sizeid=${sizeId} and productionreceipt.packingCategory="${packingCategory}" and productionreceipt.packingType="${packingType}" and productionreceiptdetails.classId=${classId}; 
 `
    let returnQty = await prisma.$queryRawUnsafe(sql);

    return parseInt(returnQty[0]?.Qty || 0)
}


async function getmaleArrayFromOrderEntry(classId, sizeId, orderId, prevProcessId, packingCategory, packingType) {

    const sql = `select DISTINCT  OrderDetailsSubGrid.isMaleItemId,OrderDetailsSubGrid.noOfSetMale,
     OrderDetailsSubGrid.isMaleColorId
 from uniform.order left join orderDetails on orderDetails.orderid=uniform.order.id
 left join OrderDetailsSubGrid on OrderDetailsSubGrid.orderDetailsId=orderDetails.id 
left join ClassIds cl on cl.orderDetailsSubGridId=OrderDetailsSubGrid.id
left join Class on Class.id=cl.classid
left join OrderImport on OrderImport.orderId=uniform.order.id
left join orderImportItems on orderImportItems.OrderImportid=OrderImport.id
where orderDetails.orderid=${orderId} and cl.classid=${classId} and orderImportItems.sizeid=${sizeId};
      `
    let maleArray = await prisma.$queryRawUnsafe(sql);
    let newArray = [];

    for (let i = 0; i < maleArray?.length; i++) {
        let maleObj = maleArray[i]


        let deliverydata = (await getReadyQty(maleObj?.isMaleItemId, sizeId, orderId, maleObj.isMaleColorId, maleObj?.noOfSetMale, prevProcessId, packingCategory, packingType))
        let alreadyReceiveddata = (await getReceivedQtymale(maleObj?.isMaleItemId, sizeId, orderId, maleObj.isMaleColorId, maleObj?.noOfSetMale, prevProcessId, packingCategory, packingType))
        let alreadyReceiveddataByClass = (await getReceivedQtymaleByClass(classId, maleObj?.isMaleItemId, sizeId, orderId, maleObj.isMaleColorId, maleObj?.noOfSetMale, prevProcessId, packingCategory, packingType))
        let readyData = substract((await getReadyQty(maleObj?.isMaleItemId, sizeId, orderId, maleObj.isMaleColorId, maleObj?.noOfSetMale, prevProcessId, packingCategory, packingType)), (await getReceivedQtymale(maleObj?.isMaleItemId, sizeId, orderId, maleObj.isMaleColorId, maleObj?.noOfSetMale, prevProcessId, packingCategory, packingType)));

        let newObj = {
            ...maleObj,
            maleItemId: maleObj?.isMaleItemId,
            // set: maleObj?.noOfSetMale,
            orderQty: parseInt(await getOrderQty(classId, sizeId, orderId, "M", maleObj.isMaleColorId, maleObj?.noOfSetMale)) || 0,
            cuttingQty: parseInt(await getcuttingQty(maleObj?.isMaleItemId, sizeId, orderId, maleObj.isMaleColorId, maleObj?.noOfSetMale)) || 0,
            readyQty: readyData,
            deliveryData: deliverydata,
            alreadyReceivedQty: alreadyReceiveddata,
            alreadyReceivedQtyByClass: alreadyReceiveddataByClass
        }
        newArray.push(newObj)
    }

    return newArray


}

async function getfemaleArrayFromOrderEntry(classId, sizeId, orderId, prevProcessId, packingCategory, packingType) {



    const sql = `select DISTINCT  OrderDetailsSubGrid.isfeMaleItemId,OrderDetailsSubGrid.noOfSetFemale,
   OrderDetailsSubGrid.isFemaleColorId
 from uniform.order left join orderDetails on orderDetails.orderid=uniform.order.id
 left join OrderDetailsSubGrid on OrderDetailsSubGrid.orderDetailsId=orderDetails.id 
left join ClassIds cl on cl.orderDetailsSubGridId=OrderDetailsSubGrid.id
left join Class on Class.id=cl.classid
left join OrderImport on OrderImport.orderId=uniform.order.id
left join orderImportItems on orderImportItems.OrderImportid=OrderImport.id
where orderDetails.orderid=${orderId} and cl.classid=${classId} and orderImportItems.sizeid=${sizeId};
      `
    let femaleArray = await prisma.$queryRawUnsafe(sql);
    let newArray = [];


    for (let i = 0; i < femaleArray?.length; i++) {
        let femaleObj = femaleArray[i]
        let readydata = (await getReadyQty(femaleObj?.isfeMaleItemId, sizeId, orderId, femaleObj.isFemaleColorId, femaleObj?.noOfSetFemale, prevProcessId, packingCategory, packingType))
        let alreadyReceiveddata = (await getReceivedQtyfemale(femaleObj?.isfeMaleItemId, sizeId, orderId, femaleObj.isFemaleColorId, femaleObj?.noOfSetFemale, prevProcessId, packingCategory, packingType))
        let alreadyReceiveddataByClass = (await getReceivedQtyfemaleByClass(classId, femaleObj?.isfeMaleItemId, sizeId, orderId, femaleObj.isFemaleColorId, femaleObj?.noOfSetFemale, prevProcessId, packingCategory, packingType))
        let newObj = {
            ...femaleObj,
            isfeMaleItemId: femaleObj?.isfeMaleItemId,
            // set: femaleObj?.noOfSetFemale,
            orderQty: parseInt(await getOrderQty(classId, sizeId, orderId, "F", femaleObj.isFemaleColorId, femaleObj?.noOfSetFemale)) || 0,
            cuttingQty: parseInt(await getcuttingQty(femaleObj?.isfeMaleItemId, sizeId, orderId, femaleObj.isFemaleColorId, femaleObj?.noOfSetFemale)) || 0,
            deliveryData: parseInt(readydata),
            alreadyReceivedQty: parseInt(alreadyReceiveddata),
            alreadyReceiveddataByClass: parseInt(alreadyReceiveddataByClass),
            readyQty: substract((await getReadyQty(femaleObj?.isfeMaleItemId, sizeId, orderId, femaleObj.isFemaleColorId, femaleObj?.noOfSetFemale, prevProcessId, packingCategory, packingType)), (await getReceivedQtyfemale(femaleObj?.isfeMaleItemId, sizeId, orderId, femaleObj.isFemaleColorId, femaleObj?.noOfSetFemale, prevProcessId, packingCategory, packingType)))
        }
        newArray.push(newObj)
    }


    return newArray

}

function areArraysEqual(maleArrayObj, femaleArrayObj) {
    if (maleArrayObj.length !== femaleArrayObj.length) return false;

    return maleArrayObj.every((obj1) =>
        femaleArrayObj.some(
            (obj2) =>
                obj1.isMaleItemId == obj2.isfeMaleItemId && obj1.isMaleColorId == obj2.isFemaleColorId
        )
    );
};


async function getsizeArrayFromOrderEntry(classId, orderId, prevProcessId, packingCategory, packingType) {
    const sql = `select DISTINCT OrderImportItems.sizeId,OrderImportItems.size  from OrderImport left join OrderImportItems on OrderImportItems.orderImportId=OrderImport.id 
where OrderImport.orderId=${orderId} and OrderImportItems.classId=${classId};
      `
    let sizeArray = await prisma.$queryRawUnsafe(sql);

    let newArray = [];

    for (let i = 0; i < sizeArray?.length; i++) {
        let sizeObj = sizeArray[i]

        let maleArray = await getmaleArrayFromOrderEntry(classId, sizeObj?.sizeId, orderId, prevProcessId, packingCategory, packingType)
        let femaleArray = await getfemaleArrayFromOrderEntry(classId, sizeObj?.sizeId, orderId, prevProcessId, packingCategory, packingType)
        let readyToInwardCommonSet = 0
        let alreadyReceivedQty = 0;


        if (areArraysEqual(maleArray, femaleArray)) {
            readyToInwardCommonSet = substract(parseInt(Math.min(...maleArray?.map(val => val.deliveryData))), (parseInt(maleArray?.[0]?.alreadyReceivedQty) + parseInt(femaleArray?.[0]?.alreadyReceivedQty)))
            alreadyReceivedQty = parseInt(parseInt(maleArray?.[0]?.alreadyReceivedQtyByClass) + parseInt(femaleArray?.[0]?.alreadyReceiveddataByClass))

            alreadyReceivedQty = parseInt(parseInt(maleArray?.[0]?.alreadyReceivedQtyByClass) + parseInt(femaleArray?.[0]?.alreadyReceiveddataByClass))

        }



        let newObj = {
            ...sizeObj,
            size: sizeObj?.size,
            male: maleArray,
            orderQtyForMale: parseInt(Math.min(...maleArray?.map(val => val.orderQty))),
            orderQtyForFemale: parseInt(Math.min(...femaleArray?.map(val => val.orderQty))),
            readyToInwardMaleSet: parseInt(Math.min(...maleArray?.map(val => val.readyQty))),
            readyToInwardFeMaleSet: parseInt(Math.min(...femaleArray?.map(val => val.readyQty))),
            maleInwardQty: parseInt(Math.min(...maleArray?.map(val => val.readyQty))),
            femaleInwardQty: parseInt(Math.min(...femaleArray?.map(val => val.readyQty))),
            female: femaleArray,
            totalInwardQty: parseInt(parseInt(Math.min(...maleArray?.map(val => val.orderQty))) + parseInt(Math.min(...femaleArray?.map(val => val.orderQty))) || 0),
            readyToInwardCommonSet: readyToInwardCommonSet,
            alreadyReceivedQty: alreadyReceivedQty || 0,


        }
        newArray.push(newObj)
    }


    return newArray?.filter(val => (val.totalInwardQty !== val.alreadyReceivedQty))

}



async function getClassArrayFromOrderEntry(orderId) {

    const sql = `select DISTINCT  cl.classId,class.name
 from uniform.order left join orderDetails on orderDetails.orderid=uniform.order.id
 left join OrderDetailsSubGrid on OrderDetailsSubGrid.orderDetailsId=orderDetails.id 
left join ClassIds cl on cl.orderDetailsSubGridId=OrderDetailsSubGrid.id
left join Class on Class.id=cl.classid
where orderDetails.orderid=${orderId};
  ;
      `
    return await prisma.$queryRawUnsafe(sql);


}

async function getSizeArrayFromCuttingOrderEntry(orderId) {

    const sql = `select DISTINCT  swd.sizeId,s.name
 from CuttingOrder co left join CuttingOrderDetails cod on co.id=cod.cuttingOrderId
 left join Items itm on itm.cuttingOrderDetailsId=cod.id 
left join ColorList cl on cl.itemsId=itm.id
left join SizeWiseDetails swd on swd.colorListId=cl.id
left join Size s on s.id=swd.sizeId
where co.orderid=${orderId};
  
      `
    return await prisma.$queryRawUnsafe(sql);


}

async function getOrderQtyForItem(sizeId, colorId, itemId, orderId, set) {



    const sql = `select swd.orderQty,swd.cuttingQty, itm.itemId,i.name as itemName,c.name as colorName,cl.colorId
 from CuttingOrder co left join CuttingOrderDetails cod on co.id=cod.cuttingOrderId
 left join Items itm on itm.cuttingOrderDetailsId=cod.id 
 left join Item i on itm.itemId=i.id 
left join ColorList cl on cl.itemsId=itm.id
left join Color c on cl.colorId=c.id
left join SizeWiseDetails swd on swd.colorListId=cl.id
left join Size s on s.id=swd.sizeId
where co.orderid=${orderId} and swd.sizeid=${sizeId} and  cl.colorId=${colorId} and itm.itemId=${itemId};
  
      `
    let orderData = await prisma.$queryRawUnsafe(sql);



    return orderData[0]?.orderQty


}

async function getReadyQtyForItem(sizeId, colorId, itemId, orderId) {

    const sql = `select delQty
from ProductionDelivery pd  left join ProductionDeliveryDetails pdd  on pd.id=pdd.productionDeliveryId
where pd.orderid=${orderId} and pdd.sizeid=${sizeId} and  pdd.colorId=${colorId} and pdd.itemId=${itemId} and pdd.panelId is null;
  
      `
    let delQty = await prisma.$queryRawUnsafe(sql);
    return delQty[0]?.delQty

}


async function getAlreadyReceivedQtyForItem(sizeId, colorId, itemId, orderId, prevProcessId, packingCategory, packingType) {



    const sql = `select sum(receivedQty) as receivedQty
from Productionreceipt pr  left join ProductionReceiptDetails prd  on pr.id=prd.productionReceiptId
where pr.orderid=${orderId} and prd.sizeid=${sizeId} and  prd.colorId=${colorId} and prd.itemId=${itemId}  and  pr.prevProcessId=${prevProcessId} and pr.packingCategory="${packingCategory}" 
and pr.packingType="${packingType}";
  
      `
    let delQty = await prisma.$queryRawUnsafe(sql);
    return delQty[0]?.receivedQty

}


async function getsetQtyForItem(orderId) {

    const sql = `select noOfset  from UNIFORM.order 
where id=${orderId} ;

 `
    let noOfSet = await prisma.$queryRawUnsafe(sql);

    return noOfSet[0]?.noOfset

}


async function getBalanceQtyForItem(sizeId, colorId, itemId, orderId, setArray) {

    // let classId=await getClassId(orderId,itemId,colorId)

    let balanceQty = 0;
    let sizeArray = setArray?.flatMap(val => val.sizeArray)?.filter(j => parseInt(j.sizeId) == parseInt(sizeId))


    for (let i = 0; i < sizeArray?.length; i++) {
        let sizeObj = sizeArray[i]
        let maleQty = sizeObj?.male?.find(j => j.isMaleItemId == itemId && j.isMaleColorId == colorId)

        let femaleQty = sizeObj?.female?.find(j => j.isfeMaleItemId == itemId && j.isFemaleColorId == colorId)

        if ((!maleQty || Object.keys(maleQty).length === 0) && (!femaleQty || Object.keys(femaleQty).length === 0)) {
            balanceQty = balanceQty + parseInt(sizeObj?.readyToInwardMaleSet + sizeObj?.readyToInwardFeMaleSet)
        }
        else if (!maleQty || Object.keys(maleQty).length === 0) {

            balanceQty = balanceQty + parseInt(sizeObj?.readyToInwardMaleSet)
        }
        else if (!femaleQty || Object.keys(femaleQty).length === 0) {

            balanceQty = balanceQty + parseInt(sizeObj?.readyToInwardFeMaleSet)
        }
        else {
            continue
        }
    }


    return parseInt(balanceQty)

}


async function getItemArrayFromCuttingOrderEntry(orderId, sizeId, prevProcessId, packingCategory, packingType) {

    const sql = `select  distinct itm.itemId,i.name as itemName,c.name as colorName,cl.colorId
 from CuttingOrder co left join CuttingOrderDetails cod on co.id=cod.cuttingOrderId
 left join Items itm on itm.cuttingOrderDetailsId=cod.id 
 left join Item i on itm.itemId=i.id 
left join ColorList cl on cl.itemsId=itm.id
left join Color c on cl.colorId=c.id
left join SizeWiseDetails swd on swd.colorListId=cl.id
left join Size s on s.id=swd.sizeId
where co.orderid=${orderId};
      `
    let itemArray = await prisma.$queryRawUnsafe(sql);
    let newArray = [];

    for (let i = 0; i < itemArray?.length; i++) {
        let itemObj = itemArray[i]
        let set = parseInt(await getsetQtyForItem(orderId));
        let orderQty = parseInt(await getOrderQtyForItem(sizeId, itemObj?.colorId, itemObj?.itemId, orderId, set) || 0);
        let readyQty = parseInt(await getReadyQtyForItem(sizeId, itemObj?.colorId, itemObj?.itemId, orderId)) || 0;
        let alreadyReceivedQty = parseInt(await getAlreadyReceivedQtyForItem(sizeId, itemObj?.colorId, itemObj?.itemId, orderId, prevProcessId, packingCategory, packingType)) || 0;
        let newObj = {
            ...itemObj,
            sizeId: sizeId,
            orderQty: parseInt(orderQty * set),
            readyQty: substract((parseInt(await getReadyQtyForItem(sizeId, itemObj?.colorId, itemObj?.itemId, orderId)) || 0), alreadyReceivedQty),
            alreadyReceivedQty: alreadyReceivedQty,
            // receivedQty: parseInt(substract(readyQty, orderQty))
            // receivedQty: parseInt(await getReadyQtyForItem(sizeId, itemObj?.colorId, itemObj?.itemId, orderId)),
            // balanceQty: substract(parseInt(await getReadyQtyForItem(sizeId, itemObj?.colorId, itemObj?.itemId, orderId)), parseInt(await getBalanceQtyForItem(sizeId, itemObj?.colorId, itemObj?.itemId, orderId, setArray)))

        }
        newArray.push(newObj)
    }


    return newArray?.filter(val => val.readyQty > 0 && val?.readyQty !== val?.alreadyReceivedQty)


}


async function getProcessCost(processData, orderDataId) {



    const sql = `select stitchingcost,packingcost,ironingcost from productiondelivery
where productiondelivery.orderId=${orderDataId} ;

 `
    let cost = await prisma.$queryRawUnsafe(sql);

    if (processData?.isStitching) {
        return cost?.find(v => v.stitchingcost !== "")?.stitchingcost
    }
    else if (processData?.isPacking) {


        return cost?.find(v => v.packingcost !== "")?.packingcost
    }
    else if (processData?.isIroning) {

        return cost?.find(v => v.ironingcost !== "")?.ironingcost
    }
    else {
        return 0
    }
}






async function getPackingForIndividual(orderId, setArray, prevProcessId, packingCategory, packingType) {
    let sizeArray = await getSizeArrayFromCuttingOrderEntry(orderId)

    let newArray = [];
    for (let i = 0; i < sizeArray?.length; i++) {
        let sizeObj = sizeArray[i]

        let newObj = {
            sizeId: sizeObj?.sizeId,
            sizeName: sizeObj?.name,
            itemArray: await getItemArrayFromCuttingOrderEntry(orderId, sizeObj?.sizeId, prevProcessId, packingCategory, packingType)
        }
        newArray.push(newObj)
    }





    return newArray = newArray.filter(val => val.itemArray?.length > 0)

}


export async function getAllProductionDeliveryDetailsItemsByOrderId(orderId, data, prevProcessId, packingCategory, packingType) {

    const process = await getTableRecordWithId(prevProcessId, "process")
    const isStitching = process ? process.isStitching : false;
    const isPacking = process ? process.isPacking : false;

    if ((isPacking && packingCategory == "CLASSWISE" && packingType == "SET")) {

        let classArray = await getClassArrayFromOrderEntry(orderId)

        let newArray = [];
        for (let i = 0; i < classArray?.length; i++) {
            let classObj = classArray[i]

            let newObj = {
                classId: classObj?.classId,
                className: classObj?.name,
                sizeArray: await getsizeArrayFromOrderEntry(classObj?.classId, orderId, prevProcessId, packingCategory, packingType)
            }
            newArray.push(newObj)
        }



        return {
            ...data,
            productionDeliveryDetailsItemForPacking: newArray.filter(val => val.sizeArray?.length > 0)
        }

    }


    if ((isPacking && packingCategory == "SIZEWISE" && packingType == "INDIVIDUAL")) {

        let sizeArray = await getSizeArrayFromCuttingOrderEntry(orderId)

        let newArray = [];
        for (let i = 0; i < sizeArray?.length; i++) {
            let sizeObj = sizeArray[i]

            let newObj = {
                sizeId: sizeObj?.sizeId,
                sizeName: sizeObj?.name,
                itemArray: await getItemArrayFromCuttingOrderEntry(orderId, sizeObj?.sizeId, prevProcessId, packingCategory, packingType)
            }
            newArray.push(newObj)
        }



        return {
            ...data,
            productionDeliveryDetailsItemForPacking: newArray.filter(val => val.itemArray?.length > 0)
        }

    }

    if ((isPacking && packingCategory == "CLASSWISE" && packingType == "MIXED")) {
        let classArray = await getClassArrayFromOrderEntry(orderId)
        let newArray = [];
        for (let i = 0; i < classArray?.length; i++) {
            let classObj = classArray[i]

            let newObj = {
                classId: classObj?.classId,
                className: classObj?.name,
                sizeArray: await getsizeArrayFromOrderEntry(classObj?.classId, orderId, prevProcessId, packingCategory, packingType),

            }
            newArray.push(newObj)
        }

        let packingForIndividualExtraPiece = await getPackingForIndividual(orderId, newArray, prevProcessId, packingCategory, packingType)


        return {
            ...data,
            productionDeliveryDetailsItemForPacking: newArray.filter(val => val.sizeArray?.length > 0),
            packingForIndividualExtra: packingForIndividualExtraPiece
        }

    }


    const sql = `
   select prd.productionReceiptId, size.name as sizeName,panel.name as panelName,color.name as colorName,item.name as itemName, pd.docId,pd.storeId,
   pd.productionType,pd.fromprocessId,pd.toprocessid,pdd.id as id,pd.orderId,pdd.productiondeliveryId,pdd.itemId,pdd.panelId,
   pdd.colorId,pdd.panelColorId,pdd.sizeId,pdd.prevprocessid,pdd.delQty,pdd.processcost
  from productiondelivery pd left join ProductionDeliveryDetails pdd on pd.id=pdd.productiondeliveryid left join item on item.id=pdd.itemId
  left join color on color.id=pdd.panelColorId left join size on size.id=pdd.sizeid left join panel on panel.id=pdd.panelId
  left join ProductionReceiptDetails prd on prd.productionDeliveryDetailsId=pdd.id
where pd.orderId=${orderId} and pd.toprocessid=${prevProcessId} and (pdd.delQty != prd.receivedQty or  prd.receivedQty is null);
    `
    let productionDeliveryItems = await prisma.$queryRawUnsafe(sql);

    let groupedData = [];
    let resultArray = [];


    let productionDeliveryItemPanel = productionDeliveryItems.reduce((acc, current) => {

        if (!acc.some(item => parseInt(item["itemId"]) === parseInt(current["itemId"]))) {
            acc.push(current);
        }
        return acc;
    }, []);


    for (let i = 0; i < productionDeliveryItemPanel?.length; i++) {
        let panelItem = productionDeliveryItemPanel[i];
        let itemWisePanel = await getPanel(panelItem?.itemId, orderId)

        let filterProductionDeliveryItem = productionDeliveryItems?.filter(item => parseInt(item?.itemId) == parseInt(panelItem?.itemId))
        let allMatch = itemWisePanel.every((value) =>
            filterProductionDeliveryItem.some((item) => parseInt(item.panelId) === parseInt(value?.panelId))
        );

        resultArray = [...resultArray, ...(allMatch ? filterProductionDeliveryItem : [])]
    }



    if (isStitching) {
        groupedData = await groupByFields(resultArray, ['itemId', 'sizeId', "colorId"]);
    }




    return {
        ...data,
        productionDeliveryDetailsItems: productionDeliveryItems,
        productionDeliveryDetailsItemPanelWise: resultArray,
        productionDeliveryDetailsItemGroupBy: groupedData,
        processCost: parseFloat(await getProcessCost(process, orderId))

    }



}


async function getPanel(itemId, orderId) {


    const panel = `
        select malePanelProcess.panelId as malePanel,feMalePanelProcess.panelId as femalePanel,isMaleItemId,isFemaleItemId from uniform.order left join orderDetails on orderDetails.orderid=uniform.order.id left join 
OrderDetailsSubGrid on OrderDetailsSubGrid.orderDetailsId=orderDetails.id left join malePanelProcess on
malePanelProcess.orderDetailsSubGridId=OrderDetailsSubGrid.id left join feMalePanelProcess on 
feMalePanelProcess.orderDetailsSubGridId=OrderDetailsSubGrid.id 
where orderDetails.orderid=${orderId} ;
         `
    let orderItemPanelData = await prisma.$queryRawUnsafe(panel);
    let orderItemMalePanelData = orderItemPanelData.filter(val => (val.isMaleItemId == itemId))
    let orderItemFemalePanelData = orderItemPanelData.filter(val => (val.isFemaleItemId == itemId))
    if (orderItemMalePanelData?.length > 0) {
        orderItemPanelData = orderItemMalePanelData?.map(i => {
            return {
                ...i, panelId: i.malePanel
            }
        })
    }
    else {
        orderItemPanelData = orderItemFemalePanelData?.map(i => {
            return {
                ...i, panelId: i.femalePanel
            }
        })
    }

    // orderItemPanelData = orderItemPanelData.filter(val => (val.isMaleItemId == itemId || val.isFemaleItemId == itemId))
    return orderItemPanelData
}



async function getAlreadyReceivedQty(colorId, itemId, panelId, sizeId, productionDeliveryDetailsId, orderId) {
    const sql = `select sum(receivedQty) as alreadyReceivedQty from ProductionReceiptDetails left join productionreceipt on 
      productionreceipt.id =ProductionReceiptDetails.productionreceiptId
    where productionreceipt.orderId=${orderId} and 
    ProductionReceiptDetails.productionDeliveryDetailsId=${productionDeliveryDetailsId}
    and ProductionReceiptDetails.colorId=${colorId} and ProductionReceiptDetails.sizeId=${sizeId}
    and ProductionReceiptDetails.itemId=${itemId} and ProductionReceiptDetails.panelId=${panelId}
    ;
        `
    let qty = await prisma.$queryRawUnsafe(sql);
    return qty[0]
}


export async function getAlreadyReceivedQtyByDeliveryDetailsId(productionDeliveryDetailsItems, orderId) {
    let newArray = [];
    for (let i = 0; i < productionDeliveryDetailsItems?.length; i++) {
        let productionDeliveryDetailsItem = productionDeliveryDetailsItems[i]
        let newObj = {
            ...productionDeliveryDetailsItem,
            alreadyReceivedQty: ((await getAlreadyReceivedQty(productionDeliveryDetailsItem?.colorId, productionDeliveryDetailsItem?.itemId, productionDeliveryDetailsItem?.panelId, productionDeliveryDetailsItem?.sizeId, productionDeliveryDetailsItem?.id, orderId))?.alreadyReceivedQty || 0),
            balanceQty: substract(productionDeliveryDetailsItem.delQty, ((await getAlreadyReceivedQty(productionDeliveryDetailsItem?.colorId, productionDeliveryDetailsItem?.itemId, productionDeliveryDetailsItem?.panelId, productionDeliveryDetailsItem?.sizeId, productionDeliveryDetailsItem?.id, orderId))?.alreadyReceivedQty || 0))

        }
        newArray.push(newObj)

    }
    return newArray.filter(val => val.balanceQty > 0)

}



async function getAlreadyReceivedQtyByItemFinished(colorId, itemId, sizeId, productionDeliveryDetailsId, orderId) {


    const sql = `select sum(receivedQty) as alreadyReceivedQty from ProductionReceiptDetails left join productionreceipt on 
      productionreceipt.id =ProductionReceiptDetails.productionreceiptId
    where productionreceipt.orderId=${orderId} and ProductionReceiptDetails.panelid is null
    and ProductionReceiptDetails.colorId=${colorId} and ProductionReceiptDetails.sizeId=${sizeId}
    and ProductionReceiptDetails.itemId=${itemId} 
    ;
        `
    let qty = await prisma.$queryRawUnsafe(sql);

    return qty[0]
}



const groupBySumQuantity = (arr) => {
    return arr.reduce((acc, item) => {
        const key = `${item.panelId}-${item.colorId}`;

        if (!acc[key]) {
            acc[key] = { panelId: item.panelId, colorId: item.colorId, delQty: 0 };
        }

        acc[key].delQty += item.delQty;

        return acc;
    }, {});
};










export async function getAlreadyReceivedQtyByDeliveryItemGroupBy(productionDeliveryDetailsItemGroupBy, orderId) {



    let newArray = [];
    for (let i = 0; i < productionDeliveryDetailsItemGroupBy?.length; i++) {
        let productionDeliveryDetailsItem = productionDeliveryDetailsItemGroupBy[i]

        let sizename = await getTableRecordWithId(productionDeliveryDetailsItem?.key?.sizeId, "size")
        let itemName = await getTableRecordWithId(productionDeliveryDetailsItem?.key?.itemId, "item")


        let productionDeliveryDetailsItemForReadyQty = Object.values(groupBySumQuantity(productionDeliveryDetailsItem?.values));


        let itemColorId = (await getItemColorId(productionDeliveryDetailsItem?.values[0]?.orderId, productionDeliveryDetailsItem?.key?.itemId))?.colorId
        let alReceivedQty = ((await getAlreadyReceivedQtyByItemFinished(itemColorId, productionDeliveryDetailsItem?.key?.itemId, productionDeliveryDetailsItem?.key?.sizeId, productionDeliveryDetailsItem?.values[0]?.id, orderId))?.alreadyReceivedQty || 0)
        let newObj = {
            productionReceiptId: productionDeliveryDetailsItem?.values[0]?.productionReceiptId,
            sizeName: sizename?.name,
            // colorId: (await getItemColorId(productionDeliveryDetailsItem?.values[0]?.orderId, productionDeliveryDetailsItem?.key?.itemId))?.colorId,
            colorId: productionDeliveryDetailsItem?.key?.colorId,
            itemName: itemName?.name,
            docId: productionDeliveryDetailsItem?.values[0]?.docId,
            storeId: productionDeliveryDetailsItem?.values[0]?.storeId,
            productionType: productionDeliveryDetailsItem?.values[0]?.productionType,
            fromprocessId: productionDeliveryDetailsItem?.values[0]?.fromprocessId,
            toprocessid: productionDeliveryDetailsItem?.values[0]?.toprocessid,
            productiondeliveryId: productionDeliveryDetailsItem?.values[0]?.productiondeliveryId,
            orderId: productionDeliveryDetailsItem?.values[0]?.orderId,
            itemId: productionDeliveryDetailsItem?.key?.itemId,
            sizeId: productionDeliveryDetailsItem?.key?.sizeId,
            prevprocessid: productionDeliveryDetailsItem?.values[0]?.prevprocessid,
            cuttingQty: (await getCuttingQty(productionDeliveryDetailsItem?.values[0]?.orderId, productionDeliveryDetailsItem?.key?.itemId, itemColorId, productionDeliveryDetailsItem?.key?.sizeId))?.cuttingQty || 0,
            itemTypeId: (await getCuttingQty(productionDeliveryDetailsItem?.values[0]?.orderId, productionDeliveryDetailsItem?.key?.itemId, itemColorId, productionDeliveryDetailsItem?.key?.sizeId))?.itemTypeId,
            balanceQty: substract(parseInt(Math.min(...productionDeliveryDetailsItemForReadyQty?.map(val => val.delQty))), parseInt(alReceivedQty)),
            // balanceQty: substract(parseInt(Math.min(...productionDeliveryDetailsItem?.values?.map(val => val.delQty))), parseInt(alReceivedQty)),
            // readyQty: substract(parseInt(Math.min(...productionDeliveryDetailsItem?.values?.map(val => val.delQty))), parseInt(alReceivedQty)),
            readyQty: substract(parseInt(Math.min(...productionDeliveryDetailsItemForReadyQty?.map(val => val.delQty))), parseInt(alReceivedQty)),
            alreadyReceivedQty: alReceivedQty,
            processcost: productionDeliveryDetailsItem?.values.reduce((accumulation, currentValue) => {
                return (parseFloat(accumulation) + parseFloat(currentValue?.processcost ? currentValue?.processcost : 0))
            }, 0)
            // balanceQty: substract(productionDeliveryDetailsItem.delQty, ((await getAlreadyReceivedQty(productionDeliveryDetailsItem?.colorId, productionDeliveryDetailsItem?.itemId, productionDeliveryDetailsItem?.panelId, productionDeliveryDetailsItem?.sizeId, productionDeliveryDetailsItem?.id, orderId))?.alreadyReceivedQty || 0))

            // delQty: productionDeliveryDetailsItem?.values.reduce((accumulation, currentValue) => {
            //     return (parseFloat(accumulation) + parseFloat(currentValue?.delQty ? currentValue?.delQty : 0))
            // }, 0),


        }


        newArray.push(newObj)

    }
    return newArray
}


async function getItemColorId(orderId, itemId) {


    const sql = `select OrderDetailsSubGrid.isMaleColorId, OrderDetailsSubGrid.isFemaleColorId,OrderDetailsSubGrid.isMaleItemId, OrderDetailsSubGrid.isFemaleItemId
 from uniform.order left join orderDetails on orderDetails.orderid=uniform.order.id left join 
OrderDetailsSubGrid on OrderDetailsSubGrid.orderDetailsId=orderDetails.id 
where orderDetails.orderid=${orderId};
  ;
      `
    let orderItemData = await prisma.$queryRawUnsafe(sql);
    let orderItemMalePanelData = orderItemData.filter(val => (val.isMaleItemId == itemId))
    let orderItemFemalePanelData = orderItemData.filter(val => (val.isFemaleItemId == itemId))

    if (orderItemMalePanelData?.length > 0) {
        orderItemData = orderItemMalePanelData?.map(i => {
            return {
                ...i, colorId: i.isMaleColorId
            }
        })
    }
    else {
        orderItemData = orderItemFemalePanelData?.map(i => {
            return {
                ...i, colorId: i.isFemaleColorId
            }
        })
    }

    return orderItemData[0]
}


async function getCuttingQty(orderId, itemId, colorId, sizeId) {

    const sql = `select * from cuttingorder co left join CuttingOrderDetails cod on  cod.cuttingorderid=co.id left join 
items itm on itm.cuttingOrderDetailsId=cod.id left join ColorList cl on cl.itemsId=itm.id 
left join SizeWiseDetails swd on swd.colorListId=cl.id where co.orderId=${orderId} and itm.itemId=${itemId} and cl.colorId=${colorId}
and swd.sizeid=${sizeId};
  ;
      `
    let cuttingqty = await prisma.$queryRawUnsafe(sql);
    return cuttingqty[0]
}

export async function getAlreadyReceivedQtyByDeliveryItemPanelWise(productionDeliveryDetailsItemPanelWise, orderId) {
    let newArray = [];
    for (let i = 0; i < productionDeliveryDetailsItemPanelWise?.length; i++) {
        let productionDeliveryDetailsItem = productionDeliveryDetailsItemPanelWise[i]
        let newObj = {
            ...productionDeliveryDetailsItem,
            alreadyReceivedQty: ((await getAlreadyReceivedQty(productionDeliveryDetailsItem?.colorId, productionDeliveryDetailsItem?.itemId, productionDeliveryDetailsItem?.panelId, productionDeliveryDetailsItem?.sizeId, productionDeliveryDetailsItem?.id, orderId))?.alreadyReceivedQty || 0),
            balanceQty: substract(productionDeliveryDetailsItem.delQty, ((await getAlreadyReceivedQty(productionDeliveryDetailsItem?.colorId, productionDeliveryDetailsItem?.itemId, productionDeliveryDetailsItem?.panelId, productionDeliveryDetailsItem?.sizeId, productionDeliveryDetailsItem?.id, orderId))?.alreadyReceivedQty || 0))
        }
        newArray.push(newObj)
    }

    return newArray.filter(val => val.balanceQty > 0)

}






async function getProductionReceiptNextDocId(branchId, shortCode, startTime, endTime) {
    let lastObject = await prisma.productionReceipt.findFirst({
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
    let newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PDR/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/PDR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}


async function createProductionReceiptConsuptionDetails(tx, productionReceiptDetailsId, item, prevProcessId) {


    // let promises = productionConsumptionDetails.map(async (temp, index) => {
    let promises = tx.productionConsumptionDetails.create({
        data: {
            productionReceiptDetailsId: parseInt(productionReceiptDetailsId),
            colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
            itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
            sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
            panelId: item?.panelId ? parseInt(item?.panelId) : undefined,
            consumption: item?.delQty ? parseFloat(item?.delQty) : 0,
            prevProcessId: prevProcessId ? parseInt(prevProcessId) : undefined,
            // lossDetails: lossDetails ? {
            //     createMany: {
            //         data: lossDetails?.filter(j => j.lossQty)?.map(lossItem => ({ lossReasonId: parseInt(lossItem.lossReasonId), lossQty: parseFloat(lossItem.lossQty) }))
            //     }
            // } : undefined

        }
    })
    // }
    // )

    return Promise.all(promises)
}



async function createProductionReceiptDetails(tx, productionReceiptDetails, productionReceipt, isStitching, orderId, isPacking, isIroning) {




    const promises = productionReceiptDetails.map(async (item) => {

        const dataReceipt = await tx.productionReceiptDetails.create({
            data: {
                productionReceiptId: parseInt(productionReceipt.id),
                productionDeliveryDetailsId: item.id ? parseInt(item.id) : undefined,
                receivedQty: parseInt(item.delQty),
                colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                productionConsumptionDetails: {
                    createMany: {
                        data: {
                            colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                            itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                            sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                            panelId: item?.panelId ? parseInt(item?.panelId) : undefined,
                            consumption: item?.delQty ? parseFloat(item?.delQty) : 0,
                            prevProcessId: productionReceipt?.prevProcessId ? parseInt(productionReceipt?.prevProcessId) : undefined,
                        }
                    }
                },
                StockForPanels: {
                    create: {
                        inOrOut: "In",
                        prevProcessId: parseInt(productionReceipt.prevProcessId),
                        orderId: parseInt(productionReceipt?.orderId),
                        colorId: item?.colorId ? parseInt(item?.colorId) : undefined,
                        itemId: item?.itemId ? parseInt(item?.itemId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item?.sizeId) : undefined,
                        panelId: item?.panelId ? parseInt(item?.panelId) : undefined,
                        storeId: parseInt(productionReceipt.storeId),
                        branchId: parseInt(productionReceipt.branchId),
                        qty: parseInt(item.delQty),
                        stage: (isStitching || isIroning || isPacking) ? "Stitching" : "Panel"
                    }
                }
            }
        })

        // return await createProductionReceiptConsuptionDetails(tx, dataReceipt?.id, item, productionReceipt?.toProcessId)
    }
    )
    return Promise.all(promises)
}



export async function createproductionReceiptByAuto(data, finYearId, branchId) {

    const productionDeliveryData = await prisma.productionDelivery.findUnique({
        where: {
            id: parseInt(data?.id)
        },
        include: {
            FromProcess: {
                select: {
                    name: true
                }
            },
            ToProcess: {
                select: {
                    name: true
                }
            },
            Order: {
                select: {
                    docId: true
                }
            },
            productionDeliveryDetails: {
                include: {
                    Panel: {
                        select: {
                            name: true
                        }
                    },
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
                    Uom: {
                        select: {
                            name: true
                        }
                    }
                }
            },
        }
    })





    const process = await getTableRecordWithId(productionDeliveryData?.toProcessId, "process")
    const isStitching = process ? process.isStitching : false;
    const isPacking = process ? process.isPacking : false;
    const isIroning = process ? process.isIroning : false;
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime) : "";
    let newDocId = await getProductionReceiptNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)

    await prisma.$transaction(async (tx) => {
        let productionReceipt = await tx.productionReceipt.create({
            data: {
                docId: newDocId,
                supplierId: productionDeliveryData?.supplierId ? parseInt(productionDeliveryData?.supplierId) : undefined,
                productionDeliveryId: productionDeliveryData?.id ? parseInt(productionDeliveryData?.id) : undefined,
                orderId: parseInt(productionDeliveryData?.orderId),
                storeId: parseInt(productionDeliveryData?.storeId),
                branchId: parseInt(branchId),
                prevProcessId: parseInt(productionDeliveryData?.toProcessId),
                vehicleNo: productionDeliveryData?.vehicleNo ? productionDeliveryData?.vehicleNo : undefined,
                remarks: productionDeliveryData?.remarks ? productionDeliveryData?.remarks : undefined,
                specialInstructions: productionDeliveryData?.specialInstructions ? productionDeliveryData?.specialInstructions : undefined,
                createdById: parseInt(productionDeliveryData?.createdById)

            },
        });


        await createProductionReceiptDetails(tx, productionDeliveryData?.productionDeliveryDetails, productionReceipt, isStitching, productionDeliveryData?.orderId, isPacking, isIroning)


    })


}

