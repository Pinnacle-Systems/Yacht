import { PrismaClient } from '@prisma/client';
import { NoRecordFound } from '../configs/Responses.js';
import {
  getDateFromDateTime,
  getYearShortCodeForFinYear,
} from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
const prisma = new PrismaClient();

async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  isTaxBill
) {
  console.log(
    'argumnts : ',
    branchId,
    shortCode,
    startTime,
    endTime,
    isTaxBill
  );

  let lastObject = await prisma.payFrequency.findFirst({
    where: {
      branchId: parseInt(branchId),
    },
    orderBy: {
      id: 'desc',
    },
  });

  const code = 'SHF/TEM';

  const branchObj = await getTableRecordWithId(branchId, 'branch');
  // let newDocId = `${branchObj.branchCode}/${shortCode}/${code}/1`;
  let newDocId = `${code}/1`;
  if (lastObject) {
    newDocId = `${code}/${parseInt(lastObject.docId.split('/').at(-1)) + 1}`;
  }

  return newDocId;
}

async function get(req) {
  const { companyId, active, branchId, finYearId, searchDocId } = req.query;

  console.log(companyId, active, finYearId, 'received');

  const data = await prisma.payFrequency.findMany({
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
      PayFrequencyType: {
        include: {
          PayFrequencyItems: true,
          
        },

      },
    },
  });
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);

  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime
      )
    : '';
  // let newDocId = finYearDate
  //     ? await getNextDocId(
  //         branchId,
  //         shortCode,
  //         finYearDate?.startDateStartTime,
  //         finYearDate?.endDateEndTime,
  //         // isTaxBill
  //     )
  //     : "";

  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.payFrequency.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      PayFrequencyType: {
        include: {
          PayFrequencyItems: true,

        },

      },
    },
  });
  if (!data) return NoRecordFound('hRCommonTemplate');
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.payFrequency.findMany({
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
    name,
    branchId,
    companyId,
    active,
    description,
    docId,
    finYearId,
    payFrequencyType = [],
  } = body;
  console.log(payFrequencyType, 'payFrequency');

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.payFrequency.create({
      data: {
        finYearId: finYearId ? parseInt(finYearId) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        active: active ? Boolean(active) : undefined,

        PayFrequencyType: {
          create: (payFrequencyType ? payFrequencyType : [])?.map((type) => ({
            payFrequencyType: type.type,
            PayFrequencyItems: {
              create: type.payFrequencyItems?.map((item) => ({
                startDate: item?.startDate
                  ? new Date(item.startDate)
                  : undefined,
                endDate: item?.endDate ? new Date(item.endDate) : undefined,
                salaryDate: item?.salaryDate
                  ? new Date(item.salaryDate)
                  : undefined,
                notes: item?.notes || null,
              })),
            },
          })),
        },
      },
    });
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    name,
    branchId,
    companyId,
    active,

    finYearId,
    payFrequencyType = [],
  } = body;

  const dataFound = await prisma.payFrequency.findUnique({
    where: { id: parseInt(id) },
    include: {
      PayFrequencyType: {
        include: { PayFrequencyItems: true },
      },
    },
  });

  if (!dataFound) return NoRecordFound('payFrequency');

  let data;
  await prisma.$transaction(async (tx) => {
    // 1️⃣ First update the PayFrequency base record
    data = await tx.payFrequency.update({
      where: { id: parseInt(id) },
      data: {
        finYearId: finYearId ? parseInt(finYearId) : undefined,
        branchId: branchId ? parseInt(branchId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    // 2️⃣ Delete old PayFrequencyTypes to avoid duplicates
    await tx.payFrequencyType.deleteMany({
      where: { payFrequencyId: parseInt(id) },
    });

    // 3️⃣ Re-insert with new values
    if (payFrequencyType?.length > 0) {
      await tx.payFrequencyType.createMany({
        data: payFrequencyType.map((type) => ({
          payFrequencyId: parseInt(id),
          payFrequencyType: type.type,
        })),
        skipDuplicates: true, // 🚫 prevents duplicate types
      });

      // Insert items for each type
      for (const type of payFrequencyType) {
        const createdType = await tx.payFrequencyType.findFirst({
          where: {
            payFrequencyId: parseInt(id),
            payFrequencyType: type.type,
          },
        });

        if (createdType && type.payFrequencyItems?.length > 0) {
          await tx.payFrequencyItems.createMany({
            data: type.payFrequencyItems.map((item) => ({
              payFrequencyTypeId: createdType.id,
              startDate: item?.startDate ? new Date(item.startDate) : undefined,
              endDate: item?.endDate ? new Date(item.endDate) : undefined,
              salaryDate: item?.salaryDate
                ? new Date(item.salaryDate)
                : undefined,
              notes: item?.notes || null,
            })),
            skipDuplicates: true, // 🚫 prevents duplicate items
          });
        }
      }
    }
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.payFrequency.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
