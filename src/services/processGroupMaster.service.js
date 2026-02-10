import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";


async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.processGroup.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      ProcessGroupSeq: {
        select: {
          name: true,
        },
      },
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.processGroup.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      processGroupLists: {
        select: {
          processId: true,
          seqNo: true,
          id: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("processGroup");
  const processIds = data.processGroupLists
    .map((item) => item.processId)
    .filter(Boolean);
  const childRecordProduction = await prisma.cuttingDelivery.count({
    where: {
      processGroupId: parseInt(id),
    },
  });
  return { statusCode: 0, data: { ...data, ...{ childRecordProduction } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.processGroup.findMany({
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
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const {
    processGroupSeqsId,
    companyId,
    active = true,
    processGroupLists,
  } = body;
  const result = await prisma.$transaction(async (tx) => {
    const processGroup = await tx.processGroup.create({
      data: {
        ProcessGroupSeq: {
          connect: { id: parseInt(processGroupSeqsId) },
        },
        active,
        Company: {
          connect: {
            id: parseInt(companyId),
          },
        },
      },
    });
    const items = await Promise.all(
      processGroupLists.map(async (process) => {
        await tx.processGroupList.create({
          data: {
            processGroupId: parseInt(processGroup?.id),
            processId: process?.processId ? parseInt(process.processId) : null,
            seqNo: process?.seqNo ? parseInt(process?.seqNo) : null,
          },
        });
      })
    );
    return { processGroup, items };
  });
  return { statusCode: 0, data: result };
}

function findRemovedItems(dataFound, processGroupLists) {
  let removedItems = dataFound.processGroupLists.filter((oldItem) => {
    let result = processGroupLists.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id)
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function update(id, body) {
  const { processGroupSeqsId, active, companyId, processGroupLists } = body;

  const processGroupId = parseInt(id);

  // 1. Find existing group
  const existing = await prisma.processGroup.findUnique({
    where: { id: processGroupId },
    include: { processGroupLists: true },
  });

  if (!existing) return NoRecordFound("processGroup");

  // 2. Find removed items (existing - incoming)
  const existingIds = existing.processGroupLists.map((item) => item.id);
  const incomingIds = processGroupLists
    .filter((x) => x.id)
    .map((x) => parseInt(x.id));

  const removedIds = existingIds.filter((id) => !incomingIds.includes(id));

  // 3. Transaction
  const result = await prisma.$transaction(async (tx) => {
    // 3A. Delete removed rows
    if (removedIds.length > 0) {
      await tx.processGroupList.deleteMany({
        where: { id: { in: removedIds } },
      });
    }

    // 3B. Update main processGroup record
    const updatedGroup = await tx.processGroup.update({
      where: { id: processGroupId },
      data: {
        processGroupSeqsId: parseInt(processGroupSeqsId),
        active,
        companyId: parseInt(companyId),
      },
    });

    // 3C. Upsert incoming list items
    const promises = processGroupLists.map((p, index) =>
      tx.processGroupList.upsert({
        where: { id: p.id ?? 0 }, // for new items id=null → fallback 0
        update: {
          processId: parseInt(p.processId),
          seqNo: parseInt(p.seqNo),
        },
        create: {
          processGroupId,
          processId: parseInt(p.processId),
          seqNo: parseInt(p.seqNo),
        },
      })
    );

    const listResult = await Promise.all(promises);
    return { updatedGroup, listResult };
  });

  return { statusCode: 0, data: result };
}

async function remove(id) {
  const data = await prisma.processGroup.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
