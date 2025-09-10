import { PrismaClient } from "@prisma/client";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
const prisma = new PrismaClient();

async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  isTaxBill
) {

  let lastObject = await prisma.shiftTemplate.findFirst({
    where: {
      branchId: parseInt(branchId),
    },
    orderBy: {
      id: "desc",
    },
  });

  const code = "SHF/TEM"

  const branchObj = await getTableRecordWithId(branchId, "branch");
  // let newDocId = `${branchObj.branchCode}/${shortCode}/${code}/1`;
  let newDocId = `${code}/1`;
  if (lastObject) {
    newDocId = `${code}/${parseInt(lastObject?.docId?.split("/").at(-1)) + 1
      }`;
  }


  return newDocId;
}

async function get(req) {
  const { companyId, active, branchId, finYearId, searchDocId, } = req.query;

  console.log(companyId, active, finYearId, "received--");

  const data = await prisma.shiftTemplate.findMany({


    where: {
      //   companyId: companyId ? parseInt(companyId) : undefined,
      //   active: active ? Boolean(active) : undefined,
      docId: Boolean(searchDocId)
        ? {
          contains: searchDocId,
        }
        : undefined,
    },
    include: {
      ShiftTemplateItems: true,

    },
    orderBy: { id: "desc" },

  });

  console.log(data,"datasending");
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
  let newDocId = finYearDate ? await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime,) : "";
 
 

  return { statusCode: 0, nextDocId: newDocId, data };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.shiftTemplate.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      ShiftTemplateItems: true,
      
    }
  });
  if (!data) return NoRecordFound("hRCommonTemplate");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.shiftTemplate.findMany({
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
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { name, branchId, companyId, active, categoryId, docId, ShiftTemplateItems } = await body;

  console.log(ShiftTemplateItems, "ShiftTemplateItems");
  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.shiftTemplate.create({
      data: {
        docId: docId,

        branchId: branchId ? parseInt(branchId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        active: active ? Boolean(active) : undefined,
        category: categoryId ? categoryId : "",





        ShiftTemplateItems:
          ShiftTemplateItems?.length > 0
            ? {
              create: ShiftTemplateItems?.map((item) => ({
                date:item?.date ? new Date(item?.date) : null ,
                templateId: item?.templateId ? parseInt(item.templateId) : undefined,
                shiftId: item?.shiftId ? parseInt(item.shiftId) : undefined,
                inNextDay: item?.inNextDay ? item.inNextDay : undefined,
                toleranceInBeforeStart: item?.toleranceInBeforeStart ? item.toleranceInBeforeStart : undefined,
                startTime: item?.startTime ? item.startTime : undefined,
                toleranceInAfterEnd: item?.toleranceInAfterEnd ? item.toleranceInAfterEnd : undefined,
                fbOut: item?.fbOut ? item.fbOut : undefined,
                fbIn: item?.fbIn ? item.fbIn : undefined,
                lunchBst: item?.lunchBst ? item.lunchBst : undefined,
                lBSNDay: item?.lBSNDay ? item.lBSNDay : undefined,
                lunchBET: item?.lunchBET ? item.lunchBET : undefined,
                lBEnday: item?.lBEnday ? item.lBEnday : undefined,
                sbOut: item?.sbOut ? item.sbOut : undefined,
                sbIn: item?.sbIn ? item.sbIn : undefined,
                toleranceOutBeforeStart: item?.toleranceOutBeforeStart ? item.toleranceOutBeforeStart : undefined,
                endTime: item?.endTime ? item.endTime : undefined,
                toleranceOutAfterEnd: item?.toleranceOutAfterEnd ? item.toleranceOutAfterEnd : undefined,
                outNxtDay: item?.outNxtDay ? item.outNxtDay : undefined,
                shiftTimeHrs: item?.shiftTimeHrs ? item.shiftTimeHrs : undefined,
                otHrs: item?.otHrs ? item.otHrs : undefined,
                quater: item?.quater ? item.quater : undefined,
              })),
            }
            : undefined,


      },
    });
  });

  return { statusCode: 0, data };
}

async function updateShiftTemplateItems(tx, ShiftTemplateItems, data) {
  console.log(data, "data")
  console.log(ShiftTemplateItems, "ShiftTemplateItems")

  let removedItems = data?.ShiftTemplateItems?.filter(oldItem => {
    let result = ShiftTemplateItems?.find(newItem => newItem.id === oldItem.id)
    if (result) return false
    return true
  })

  let removedItemsId = removedItems.map(item => parseInt(item.id))
  await tx.ShiftTemplateItems.deleteMany({
    where: {
      id: {
        in: removedItemsId
      }
    }
  })

  const promises = ShiftTemplateItems.map(async (item) => {
    if (item?.id) {
      return await tx.ShiftTemplateItems.update({
        where: {
          id: parseInt(item.id)
        },
        data: {
          
          shiftTemplateId: data?.id ? data?.id : undefined,
           date:item?.date ? new Date(item?.date) : null ,
          templateId: item?.templateId ? parseInt(item.templateId) : undefined,
          shiftId: item?.shiftId ? parseInt(item.shiftId) : undefined,
          inNextDay: item?.inNextDay ? item.inNextDay : undefined,
          toleranceInBeforeStart: item?.toleranceInBeforeStart ? item.toleranceInBeforeStart : undefined,
          startTime: item?.startTime ? item.startTime : undefined,
          toleranceInAfterEnd: item?.toleranceInAfterEnd ? item.toleranceInAfterEnd : undefined,
          fbOut: item?.fbOut ? item.fbOut : undefined,
          fbIn: item?.fbIn ? item.fbIn : undefined,
          lunchBst: item?.lunchBst ? item.lunchBst : undefined,
          lBSNDay: item?.lBSNDay ? item.lBSNDay : undefined,
          lunchBET: item?.lunchBET ? item.lunchBET : undefined,
          lBEnday: item?.lBEnday ? item.lBEnday : undefined,
          sbOut: item?.sbOut ? item.sbOut : undefined,
          sbIn: item?.sbIn ? item.sbIn : undefined,
          toleranceOutBeforeStart: item?.toleranceOutBeforeStart ? item.toleranceOutBeforeStart : undefined,
          endTime: item?.endTime ? item.endTime : undefined,
          toleranceOutAfterEnd: item?.toleranceOutAfterEnd ? item.toleranceOutAfterEnd : undefined,
          outNxtDay: item?.outNxtDay ? item.outNxtDay : undefined,
          shiftTimeHrs: item?.shiftTimeHrs ? item.shiftTimeHrs : undefined,
          otHrs: item?.otHrs ? item.otHrs : undefined,
          quater: item?.quater ? item.quater : undefined,
        }
      })
    } else {
      return await tx.ShiftTemplateItems.create({
        data: {
          shiftTemplateId: data?.id ? data?.id : undefined,
          templateId: item?.templateId ? parseInt(item.templateId) : undefined,
          shiftId: item?.shiftId ? parseInt(item.shiftId) : undefined,
          inNextDay: item?.inNextDay ? item.inNextDay : undefined,
          toleranceInBeforeStart: item?.toleranceInBeforeStart ? item.toleranceInBeforeStart : undefined,
          startTime: item?.startTime ? item.startTime : undefined,
          toleranceInAfterEnd: item?.toleranceInAfterEnd ? item.toleranceInAfterEnd : undefined,
          fbOut: item?.fbOut ? item.fbOut : undefined,
          fbIn: item?.fbIn ? item.fbIn : undefined,
          lunchBst: item?.lunchBst ? item.lunchBst : undefined,
          lBSNDay: item?.lBSNDay ? item.lBSNDay : undefined,
          lunchBET: item?.lunchBET ? item.lunchBET : undefined,
          lBEnday: item?.lBEnday ? item.lBEnday : undefined,
          sbOut: item?.sbOut ? item.sbOut : undefined,
          sbIn: item?.sbIn ? item.sbIn : undefined,
          toleranceOutBeforeStart: item?.toleranceOutBeforeStart ? item.toleranceOutBeforeStart : undefined,
          endTime: item?.endTime ? item.endTime : undefined,
          toleranceOutAfterEnd: item?.toleranceOutAfterEnd ? item.toleranceOutAfterEnd : undefined,
          outNxtDay: item?.outNxtDay ? item.outNxtDay : undefined,
          shiftTimeHrs: item?.shiftTimeHrs ? item.shiftTimeHrs : undefined,
          otHrs: item?.otHrs ? item.otHrs : undefined,
          quater: item?.quater ? item.quater : undefined,
        }

      })
    }
  })
  return Promise.all(promises)
}


async function update(id, body) {
  const { branchId, companyId, active, categoryId, docId, ShiftTemplateItems } = await body;
  const dataFound = await prisma.shiftTemplate.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("shiftTempalte");

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.shiftTemplate.update({
      where: {
        id: parseInt(id),
      },
      data: {
        docId: docId,

        branchId: branchId ? parseInt(branchId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        active: active ? Boolean(active) : undefined,
        category: categoryId ? categoryId : "",




        // ShiftTemplateItems:
        //   ShiftTemplateItems?.length > 0
        //     ? {
        //       update: ShiftTemplateItems?.map((item) => ({
        //         templateId: item?.templateId ? parseInt(item.templateId) : undefined,
        //         shiftId: item?.shiftId ? parseInt(item.shiftId) : undefined,
        //         inNextDay: item?.inNextDay ? item.inNextDay : undefined,
        //         toleranceInBeforeStart: item?.toleranceInBeforeStart ? item.toleranceInBeforeStart : undefined,
        //         startTime: item?.startTime ? item.startTime : undefined,
        //         toleranceInAfterEnd: item?.toleranceInAfterEnd ? item.toleranceInAfterEnd : undefined,
        //         fbOut: item?.fbOut ? item.fbOut : undefined,
        //         fbIn: item?.fbIn ? item.fbIn : undefined,
        //         lunchBst: item?.lunchBst ? item.lunchBst : undefined,
        //         lBSNDay: item?.lBSNDay ? item.lBSNDay : undefined,
        //         lunchBET: item?.lunchBET ? item.lunchBET : undefined,
        //         lBEnday: item?.lBEnday ? item.lBEnday : undefined,
        //         sbOut: item?.sbOut ? item.sbOut : undefined,
        //         sbIn: item?.sbIn ? item.sbIn : undefined,
        //         toleranceOutBeforeStart: item?.toleranceOutBeforeStart ? item.toleranceOutBeforeStart : undefined,
        //         endTime: item?.endTime ? item.endTime : undefined,
        //         toleranceOutAfterEnd: item?.toleranceOutAfterEnd ? item.toleranceOutAfterEnd : undefined,
        //         outNxtDay: item?.outNxtDay ? item.outNxtDay : undefined,
        //         shiftTimeHrs: item?.shiftTimeHrs ? item.shiftTimeHrs : undefined,
        //         otHrs: item?.otHrs ? item.otHrs : undefined,
        //         quater: item?.quater ? item.quater : undefined,
        //       })),
        //     }
        //     : undefined,



      },
      include: {
        ShiftTemplateItems: true
      }
    });
    await updateShiftTemplateItems(tx, ShiftTemplateItems, data)

  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.shiftTemplate.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
