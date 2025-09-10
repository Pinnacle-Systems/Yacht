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
  let lastObject = await prisma.companyPaycode.findFirst({
    where: {
      branchId: parseInt(branchId),
    },
    orderBy: {
      id: "desc",
    },
  });

  const code = "COM/PAY";

  const branchObj = await getTableRecordWithId(branchId, "branch");
  // let newDocId = `${branchObj.branchCode}/${shortCode}/${code}/1`;
  let newDocId = `${code}/1`;
  if (lastObject) {
    newDocId = `${code}/${parseInt(lastObject?.docId?.split("/").at(-1)) + 1}`;
  }

  return newDocId;
}

async function get(req) {
  const { companyId, active, branchId, finYearId, searchDocId } = req.query;

  console.log(companyId, active, finYearId, "received--");

  const data = await prisma.companyPaycode.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,

      docId: Boolean(searchDocId)
        ? {
            contains: searchDocId,
          }
        : undefined,
    },
    include: {
      PayDetails: true,
    },
    orderBy: { id: "desc" },
  });

  console.log(data, "datasending");
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime
      )
    : "";
  let newDocId = finYearDate
    ? await getNextDocId(
        branchId,
        shortCode,
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime
      )
    : "";

  return { statusCode: 0, nextDocId: newDocId, data };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.companyPaycode.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      PayDetails: true,
    },
  });
  if (!data) return NoRecordFound("Company Pay Code");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.companyPaycode.findMany({
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
  const {
    date,

    docId,
    branchId,
    payDetails,
    companyId,
  } = await body;

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.companyPaycode.create({
      data: {
        docId: docId,
        date: date ? new Date(date) : null,
        branchId: branchId ? parseInt(branchId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,

        PayDetails:
          payDetails?.length > 0
            ? {
                create: payDetails?.map((item) => ({
                  payComponentId: item?.payComponentId
                    ? parseInt(item?.payComponentId)
                    : undefined,
                  lop: item?.lop ? item?.lop : "",
                  pf: item?.pf ? item?.pf : "",
                  esi: item?.esi ? item?.esi : "",
                  pickFrom: item?.pickFrom ? item?.pickFrom : "",
                })),
              }
            : undefined,
      },
    });
  });

  return { statusCode: 0, data };
}

async function updateCompanyPayCode(tx, payDetails, data) {
  console.log(data, "data");

  let removedItems = data?.payDetails?.filter((oldItem) => {
    let result = payDetails?.find((newItem) => newItem.id === oldItem.id);
    if (result) return false;
    return true;
  });

  let removedItemsId = removedItems.map((item) => parseInt(item.id));
  await tx.payDetails.deleteMany({
    where: {
      id: {
        in: removedItemsId,
      },
    },
  });

  const promises = payDetails.map(async (item) => {
    if (item?.id) {
      return await tx.payDetails.update({
        where: {
          id: parseInt(item.id),
        },
        data: {
          payComponentId: item?.payComponentId
            ? parseInt(item?.payComponentId)
            : undefined,
          lop: item?.lop ?? "",
          pf: item?.pf ?? "",
          esi: item?.esi ?? "",
          pickFrom: item?.pickFrom ?? "",
        },
      });
    } else {
      return await tx.payDetails.create({
        data: {
          payComponentId: item?.payComponentId
            ? parseInt(item?.payComponentId)
            : undefined,
          lop: item?.lop ?? "",
          pf: item?.pf ?? "",
          esi: item?.esi ?? "",
          pickFrom: item?.pickFrom ?? "",
        },
      });
    }
  });
  return Promise.all(promises);
}

async function update(id, body) {
  const {
    date,

    docId,
    branchId,
    payDetails,
    companyId,
  } = await body;
  const dataFound = await prisma.companyPaycode.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Company Pay Code");

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.companyPaycode.update({
      where: {
        id: parseInt(id),
      },
      data: {
        docId: docId,
        date: date ? new Date(date) : null,
        branchId: branchId ? parseInt(branchId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        PayDetails:
          payDetails?.length > 0
            ? {
                deleteMany: {},
                create: payDetails?.map((item) => ({
                  payComponentId: item?.payComponentId
                    ? parseInt(item?.payComponentId)
                    : undefined,
                  lop: item?.lop ? item?.lop : "",
                  pf: item?.pf ? item?.pf : "",
                  esi: item?.esi ? item?.esi : "",
                  pickFrom: item?.pickFrom ? item?.pickFrom : "",
                })),
              }
            : undefined,
      },
      // include: {
      //   PayDetails: true,
      // },
    });
    // await updateCompanyPayCode(tx, payDetails, data);
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.companyPaycode.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
