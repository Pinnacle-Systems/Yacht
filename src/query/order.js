import { PrismaClient } from '@prisma/client'
import { findStyleItem, findStyleTypeName, getFilterStudentList, getSingleOrderData, getStudentList, getTableRecordWithId } from "../utils/helperQueries.js";

const prisma = new PrismaClient()


export async function getCuttingOrderParams(filterOrderImportIdList) {
    console.log(filterOrderImportIdList, "filterOrderImportIdList")

    let colorIdList = [];
    let topsizeIdList = [];
    let bottomsizeIdList = [];



    for (let i = 0; i < filterOrderImportIdList?.length; i++) {

        let orderImportId = filterOrderImportIdList[i]

        let colorIddata = await prisma.$queryRaw`select distinct colorId, (select name from color where id = colorid) as color
    from orderimportitems 
    where orderimportid=${orderImportId}`;

        colorIdList.push(colorIddata)



        let topsizeIddata = await prisma.$queryRaw`
    select distinct sizeId, (select name from size where id = sizeId) as size 
    from orderimportitems 
where orderimportid=${orderImportId}
    `;
        topsizeIdList = [...topsizeIdList, ...topsizeIddata]
    


        let bottomsizeIddata = await prisma.$queryRaw`
    select distinct bottomsizeId, (select name from size where id = bottomsizeId) as size 
    from orderimportitems 
where orderimportid=${orderImportId}
    `;

        bottomsizeIdList = [...bottomsizeIdList, ...bottomsizeIddata]

    }


    // let colorIdList = await prisma.$queryRaw`select distinct colorId, (select name from color where id = colorid) as color
    //     from orderimportitems 
    //     where orderimportid in (${filterOrderImportIdList.join(",")})`;
    let classIdList = await prisma.$queryRaw`
         select distinct class.classnameonly as classOnlyId
    from orderimportitems
     left join class on class.id = orderimportitems.classid 
    where orderimportid in (${filterOrderImportIdList.join(",")})
        `;
 

    //     let topsizeIdList = await prisma.$queryRaw`
    //     select distinct sizeId, (select name from size where id = sizeId) as size 
    //     from orderimportitems 
    // where orderimportid in (${filterOrderImportIdList.join(",")})
    //     `;
    //     let bottomsizeIdList = await prisma.$queryRaw`
    //     select distinct bottomsizeId, (select name from size where id = bottomsizeId) as size 
    //     from orderimportitems 
    // where orderimportid in (${filterOrderImportIdList.join(",")})
    //     `;


    bottomsizeIdList = bottomsizeIdList?.map(j => {
        return {
            sizeId: j.bottomsizeId,
            size: j.size
        }
    })



    let sizeIdList = [...topsizeIdList, ...bottomsizeIdList]
    sizeIdList.sort((a, b) => {
        const numA = parseInt(a.size); 
        const numB = parseInt(b.size);
        const hasLetterA = isNaN(a.size[a.size.length - 1]) ? 0 : 1;
        const hasLetterB = isNaN(b.size[b.size.length - 1]) ? 0 : 1;
    
        if (numA === numB) {
            return hasLetterA - hasLetterB; 
        }
        return numA - numB; 
    });

    sizeIdList = sizeIdList.filter((obj, index, self) =>
        index === self.findIndex((o) => parseInt(o.sizeId) === parseInt(obj.sizeId))
    );


console.log(classIdList,"classIdList")

    return { statusCode: 0, data: { colorIdList, classIdList, sizeIdList } }
}

export async function getCuttingOrderPackingList(orderId, filterOrderImportIdList, filterColorIdList, filterClassOnlyIdList, filterSizeIdList, filterStyleTypeIdList, filterStyleIdList) {
    const colorWiseDetails = [];
    let studentList = await getStudentList(filterColorIdList, filterClassOnlyIdList, filterSizeIdList, orderId);
    let checkStudentForCuttingOrder = await getFilterStudentList(orderId);
    let filterStudentListByStudentId = studentList?.filter((item1) =>
        !checkStudentForCuttingOrder.some((item2) => parseInt(item2?.studentId) === parseInt(item1.studentId))
    );

    let orderData = await getSingleOrderData(orderId);
    let studentCuttingOrder = [];

    for (let i = 0; i < filterStudentListByStudentId?.length; i++) {
        const student = filterStudentListByStudentId[i]
        let newObj = {
            studentId: student?.studentId,
            name: student?.student_name,
            classId: student?.classId,
            colorId: student?.colorId,
            bottomColorId: student?.bottomColorId,
            sizeId: student?.sizeId,
            bottomSizeId: student?.bottomSizeId,
            class: student?.class,
            color: student?.color,
            size: student?.size,
            gender: student?.gender,
            index: parseInt(i + 1),
            styleType: await findStyleType(student?.classId, student?.gender, orderData)

        }

        studentCuttingOrder = [...studentCuttingOrder]
        studentCuttingOrder.push(newObj)

    }

    let filterStudentByItemType = [];
    for (let i = 0; i < studentCuttingOrder?.length; i++) {
        let cuttingOrder = studentCuttingOrder[i]
        let filterStudentList = cuttingOrder?.styleType.filter((item1) =>
            filterStyleTypeIdList.some((item2) => parseInt(item2) === parseInt(item1.styleTypeId))
        );
        filterStudentByItemType = [...filterStudentByItemType]
        let newObj = { ...cuttingOrder, styleType: filterStudentList }
        filterStudentByItemType.push(newObj)

    }



    let filterStudentByItem = [];


    for (let i = 0; i < filterStudentByItemType?.length; i++) {
        let filterByItem = filterStudentByItemType[i]

        let filterItem = [];

        for (let j = 0; j < filterByItem?.styleType?.length; j++) {
            let itemData = filterByItem?.styleType[j]
            let filterStudentList = itemData?.styleItem?.filter((item1) =>
                filterStyleIdList.some((item2) => parseInt(item2) === parseInt(item1.styleItemId))
            );

            filterItem = [...filterItem]

            if (filterStudentList?.length === 0) {
                continue
            }
            let newObj = { ...itemData, styleItem: filterStudentList }

            filterItem.push(newObj)

        }


        if (filterItem?.length == 0) {
            continue
        }

        let newObj = { ...filterByItem, styleType: filterItem }
        filterStudentByItem.push(newObj)

    }

    let groupDataByItem = []

    for (let i = 0; i < filterStyleTypeIdList?.length; i++) {
        groupDataByItem.push(
            {
                itemTypeId: filterStyleTypeIdList[i],
                itemTypeName: await findStyleTypeName(filterStyleTypeIdList[i]),
                items: await findStyleItem(filterStyleTypeIdList[i], orderData, filterStudentByItem, filterStyleIdList, filterSizeIdList, filterColorIdList, orderId, filterClassOnlyIdList)
            })
    }


    return {
        statusCode: 0, data: colorWiseDetails.sort((a, b) => a.colorId - b.colorId), studentCuttingOrder, filterStudentByItemType,
        filterStudentByItem, groupDataByItem
    }
}




async function findStyleType(classId, gender, orderData) {

    let styleArray = [];

    for (let i = 0; i < orderData?.orderDetails?.length; i++) {
        let order = orderData?.orderDetails[i]
        let filterClass = order?.orderDetailsSubGrid?.flatMap(item => item.classIds)?.filter(j => parseInt(j.classId) === parseInt(classId))
        if (filterClass?.length === 0) {
            continue;
        }
        styleArray = [...styleArray]
        let newObj = {
            styleTypeId: order?.itemTypeId,
            styleItemName: order?.ItemType?.name,
            styleItem: await getStyleItems(order?.orderDetailsSubGrid, gender)
        }

        styleArray.push(newObj);


    }


    return (styleArray || [])


}


async function getStyleItems(orderSubGrid, gender) {



    let subGridArray = [];
    for (let i = 0; i < orderSubGrid?.length; i++) {
        let subGrid = orderSubGrid[i];
        subGridArray = [...subGridArray]
        let maleObj;
        let femaleObj;
        if (gender == "M") {
            maleObj = {
                typeOfUniform: subGrid?.uniformType,
                noOfSet: subGrid?.noOfSetMale,
                styleItemId: subGrid?.isMaleItemId,
                maleColor: subGrid?.isMaleColor?.name,
                colorId: (subGrid?.isMaleColorId || subGrid?.maleColorIds),
                maleStyle: subGrid?.isMaleStyle?.name,
            }
            subGridArray.push(maleObj);
        }
        else if (gender == "F") {
            femaleObj = {
                typeOfUniform: subGrid?.uniformType,
                noOfSet: subGrid?.noOfSetFemale,
                styleItemId: subGrid?.isFemaleItemId,
                femaleColor: subGrid?.isFemaleColor?.name,
                colorId: (subGrid?.isFemaleColorId || subGrid?.femaleColorsIds),
                femaleStyle: subGrid?.isFemaleStyle?.name,
            }

            subGridArray.push(femaleObj);
        }

    }
    return (subGridArray || [])
}


// export async function getCuttingOrderPackingList(filterOrderImportIdList, filterColorIdList, filterClassOnlyIdList, filterSizeIdList) {
//     const colorWiseDetails = [];
//     for (let i = 0; i < filterColorIdList.length; i++) {
//         let colorId = filterColorIdList[i];
//         const color = await getTableRecordWithId(colorId, 'color');

//         const joined = filterClassOnlyIdList.map(val => `"${val}"`).join(',');


//         const sql = `
//         select sizeId as sizeId, count(1) as orderQty, count(1) as cuttingQty from orderimportitems
//         left join class c on c.id = orderimportitems.classid
// where colorId = ${colorId}
// and sizeid in (${filterSizeIdList.join(",")})
// and c.classnameonly in (${filterClassOnlyIdList.map(val => `"${val}"`).join(',')})
// and orderimportid in (${filterOrderImportIdList.join(",")})
// group by sizeid
//         `

//         const sizeWiseDetails = await prisma.$queryRawUnsafe(sql);

//         colorWiseDetails.push({ colorId, color, sizeWiseDetails })
//     }



//     return { statusCode: 0, data: colorWiseDetails.sort((a, b) => a.colorId - b.colorId) }
// }












//     for (let i = 0; i < filterColorIdList.length; i++) {
//         let colorId = filterColorIdList[i];
//         const color = await getTableRecordWithId(colorId, 'color');

//         const sql = `
//         select sizeId as sizeId, count(1) as orderQty, count(1) as cuttingQty from orderimportitems
//       left join orderimport on orderImport.id=orderimportitems.orderImportId
//         left join class c on c.id = orderimportitems.classid
//         where orderimport.orderId=${orderId}
// and colorId = ${colorId}
// and sizeid in (${filterSizeIdList.map(val => `"${val}"`).join(',')})
// and c.id in (${filterClassOnlyIdList.map(val => `"${val}"`).join(',')})

// group by sizeid
//         `

//         const sizeWiseDetails = await prisma.$queryRawUnsafe(sql);

//         colorWiseDetails.push({ colorId, color, sizeWiseDetails })
//     }
