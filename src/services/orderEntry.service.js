import { NoRecordFound } from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { PrismaClient } from "@prisma/client";
import { excessQty } from "../routes/index.js";

const prisma = new PrismaClient();

async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  isTaxBill
) {
  // console.log("argumnts : ", branchId, shortCode, startTime, endTime, isTaxBill);

  let lastObject = await prisma.order.findFirst({
    where: {
      branchId: parseInt(branchId),
      // AND: [
      //     {
      //         createdAt: {
      //             gte: startTime

      //         }
      //     },
      //     {
      //         createdAt: {
      //             lte: endTime
      //         }
      //     }
      // ],
    },
    orderBy: {
      id: "desc",
    },
  });

  const code = (
    typeof isTaxBill === "undefined" ? undefined : JSON.parse(isTaxBill)
  )
    ? "ORD"
    : "ORD";
  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/${code}/1`;
  if (lastObject) {
    newDocId = `${branchObj.branchCode}/${shortCode}/${code}/${parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
  }

  return newDocId;
}

function manualFilterSearchData(searchBillDate, searchMobileNo, data) {
  return data.filter(
    (item) =>
      (searchBillDate
        ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate)
        : true) &&
      (searchMobileNo
        ? String(item.contactMobile).includes(searchMobileNo)
        : true)
  );
}

function isFilterOrder(data, field) {
  if (field == "ALL") {
    return data;
  } else if (field == "ACTIVE") {
    return data?.filter((item) => parseInt(item?.SalesBill?.length) === 0);
  }
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    searchDocId,
    searchBillDate,
    searchCustomerName,
    searchMobileNo,
    finYearId,
    isTaxBill,
    salesReport,
    IsorderFilter = false,
    orderFilter,
    companyId,
    userRole,
    userId,
    partyId,
    value,
  } = req.query;

  let data = await prisma.order.findMany({
    where: {
      docId: Boolean(searchDocId)
        ? {
          contains: searchDocId,
        }
        : undefined,
    },
    include: {
      orderBillItems: {
        select: {
          id: true,
          orderId: true,
          fabCode: true,
          isPurchased: true,
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },
          subGrid: {
            include: {
              color: {
                select: { id: true, name: true },
              },
              UnitOfMeasurement: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          address: true,
          mobileNumber: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          address: true,
          mobileNumber: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  if (value) {


    data = data.filter((item) => item.isPurchased !== true);




  }
  data = manualFilterSearchData(searchBillDate, searchMobileNo, data);

  if (IsorderFilter) {
    data = isFilterOrder(data, orderFilter);
  }
  if (userRole === "VENDOR") {
    data = data.filter((item) => item.vendorId === parseInt(partyId));
  } else if (userRole === "MANUFACTURE") {
    data = data?.filter((item) => item.manufactureId === parseInt(partyId));
  } else data = data?.filter((item) => item.id);

  const totalCount = data.length;
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage
    );
  }
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
      finYearDate?.endDateEndTime,
      isTaxBill
    )
    : "";


  return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}

async function getOne(req) {
  const id = parseInt(req.params.id);


  console.log(id, "id ");

  if (!id || isNaN(id)) {
    return {
      statusCode: 1,
      message: "Invalid Order ID",
    };
  }

  // let data = await prisma.order.findUnique({
  //   where: {
  //     id,
  //   },
  //   include: {
  //     orderBillItems: {
  //       include: {
  //         subGrid:{
  //           include:{
  //             color: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //             uom: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //           }
  //         },
  //         id: true,
  //         orderId: true,
  //         fabCode: true,
  //         isPurchased: true,
  //       },
  //     },
  //     // attachments: true,
  //     customer: {
  //       select: {
  //         name: true,
  //         address: true,
  //         mobileNumber: true,
  //         id: true,
  //       },
  //     },
  //     supplier: {
  //       select: {
  //         name: true,
  //         address: true,
  //         mobileNumber: true,
  //         id: true,
  //       },
  //     },
  //   },
  // });
  let data = await prisma.order.findUnique({
    where: { id },
    include: {
      orderBillItems: {
        select: {
          id: true,
          orderId: true,
          fabCode: true,
          isPurchased: true,
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },
          subGrid: {
            include: {
              color: {
                select: { id: true, name: true },
              },
              UnitOfMeasurement: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
      purchaseInwardEntry: {
        select: {
          purchaseInwardEntryGrid: {
            select: {
              id: true,
              styleSheet: {
                select: {
                  id: true,
                  fabCode: true,
                },
              },
              purchaseInwardEntrySubGrid: {
                include: {
                  color: {
                    select: { id: true, name: true },
                  },
                  UnitOfMeasurement: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
      },
      customer: {
        select: {
          name: true,
          address: true,
          mobileNumber: true,
          id: true,
        },
      },
      po: {
        select: {
          portOrigin: true,
          finalDestination: true,
          paymentTerms: true,
        },
      },
    },
  });

  // if (isPurchaseBool) {
  //   data.orderBillItems = data.orderBillItems
  //     .map((grid) => ({
  //       ...grid,
  //       subGrid: grid.subGrid.filter((item) => item.isPurchased !== true),
  //     }))
  //     .filter((grid) => {
  //       return !grid.isPurchased && grid.subGrid.length > 0;
  //     });
  // }

  if (!data) return NoRecordFound("Order Bill");

  let percentage = await findPercentageValue();

  // data["orderBillItems"] = data["orderBillItems"]?.map((val) => {
  //   const excessQty = val?.excessQty ?? percentage;
  //   const orderQty = parseFloat(val?.orderQty) || 0;

  //   return {
  //     orderDetailsSubGrid: val.subGrid ?? [],
  //     ...val,
  //     excessQty: excessQty,
  //     qty: getQty(excessQty, orderQty),
  //   };
  // });

  return { statusCode: 0, data };
}

async function getOneFilter(req) {
  const id = parseInt(req.params.id);


  if (!id || isNaN(id)) {
    return {
      statusCode: 1,
      message: "Invalid Order ID",
    };
  }

  let data = await prisma.order.findUnique({
    where: { id },
    include: {
      orderBillItems: {
        select: {
          id: true,
          orderId: true,
          fabCode: true,
          isPurchased: true,
          styleSheet: {
            select: {
              id: true,
              fabCode: true,
            },
          },
          subGrid: {
            include: {
              color: {
                select: { id: true, name: true },
              },
              UnitOfMeasurement: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
      purchaseInwardEntry: {
        select: {
          purchaseInwardEntryGrid: {
            select: {
              id: true,
              styleSheet: {
                select: {
                  id: true,
                  fabCode: true,
                },
              },
              purchaseInwardEntrySubGrid: {
                include: {
                  color: {
                    select: { id: true, name: true },
                  },
                  UnitOfMeasurement: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
      },
      customer: {
        select: {
          name: true,
          address: true,
          mobileNumber: true,
          id: true,
        },
      },
      po: {
        select: {
          portOrigin: true,
          finalDestination: true,
          paymentTerms: true,
        },
      },
    },
  });

  if (data?.orderBillItems) {
    data.orderBillItems = data.orderBillItems.filter(
      (item) => item.isPurchased !== true
    );

    data.orderBillItems.forEach((item) => {
      item.subGrid = item.subGrid.filter((sub) => sub.isPurchased !== true);
    });
  }

  const filterGrid = data?.orderBillItems?.filter(
    (item) => item.isPurchased !== true
  );
  // console.log(filterGrid, "filterGrid");

  const filterSubGrid = filterGrid?.flatMap((val) =>
    val.subGrid.filter((sub) => sub.isPurchased !== true)
  );

  // console.log(filterSubGrid, "filterSubGrid");

  if (!data) return NoRecordFound("Not Found");

  return { statusCode: 0, data };
}

function getQty(excessQty, orderQty) {
  const excess = parseFloat(excessQty) || 0;
  const order = parseFloat(orderQty) || 0;

  const percentage = (order * excess) / 100;
  const updatedQty = order + percentage;
  return updatedQty;
}

async function findPercentageValue() {
  let data = await prisma.percentage.findMany({
    where: {
      active: true,
    },
  });

  return data?.find((v) => v.active)?.qty;
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.order.findMany({
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

async function upload(req) {
  const { id } = req.body;
  const { isDelete } = req.body;

  const data = await prisma.email.create({
    data: {
      poExcelFileName:
        isDelete && JSON.parse(isDelete) ? "" : req.files[0].filename,
      orderId: id ? parseInt(id) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function attach(req) {
  const { id } = req.body;
  const { fileName, date, gridUser } = req.body;

  const data = await prisma.attachments.createMany({
    data: {
      data: JSON.parse(comments || []).map((temp) => ({
        date: temp.date ? new Date(temp.date) : undefined,
        log: temp.log ? temp.log : "",
        gridUser: temp.gridUser ? temp.gridUser : "",
        filePath: temp.filePath ? temp.filePath : undefined,
      })),
    },
  });
  return { statusCode: 0, data };
}

async function createOrderBillItems(tx, orderDetails, order) {
  const promises = orderDetails.map(async (item) => {
    return await tx.orderDetails.create({
      data: {
        orderId: parseInt(order.id) || null,
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
      },
    });
  });
  return Promise.all(promises);
}

async function create(body) {
  const {
    branchId,
    userId,
    vendor,
    date,
    orderDetails,
    attachments,
    ponumber,
    deliveryDate,
    docDate,
    docId,
    partyId,
    customerId,
    supplierId,
    customerAddress,
    supplierAddress,
  } = body;

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.order.create({
      data: {
        docId: docId,
        orderdate: date ? new Date(date) : null,
        poNumber: ponumber ?? null,
        deliverydate: deliveryDate ? new Date(deliveryDate) : null,
        docDate: docDate ?? null,
        partyId: partyId ? parseInt(partyId) : undefined,
        customerId: customerId ? parseInt(customerId) : undefined,
        supplierId: supplierId ? parseInt(supplierId) : undefined,
        customerAddress: customerAddress ?? null,
        supplierAddress: supplierAddress ?? null,
        branchId: branchId ? parseInt(branchId) : undefined,
        createdBy: userId ? parseInt(userId) : undefined,
        vendor: vendor ? parseInt(vendor) : undefined,
        // Branch: branchId ? { connect: { id: parseInt(branchId) } } : undefined,
        // createdBy: userId ? { connect: { id: parseInt(userId) } } : undefined,
        // Vendor: vendor ? { connect: { id: parseInt(vendor) } } : undefined,

        attachments:
          attachments?.length > 0
            ? {
              create: attachments.map((a) => ({
                date: a.date ? new Date(a.date) : undefined,
                log: a.log || "",
                gridUser: a.gridUser || "",
                filePath: a.filePath || "",
              })),
            }
            : undefined,

        orderBillItems:
          orderDetails?.length > 0
            ? {
              create: orderDetails?.map((item) => ({
                fabCode: item?.fabCode || "",
                styleSheetId: item?.styleSheetId || null,

                subGrid:
                  item.orderDetailsSubGrid?.length > 0
                    ? {
                      createMany: {
                        data: item?.orderDetailsSubGrid?.map((sub) => ({
                          fabType: sub.fabType || "",
                          fiberContent: sub.fiberContent || "",
                          weightGSM: sub.weightGSM?.toString() || "",
                          widthFinished: sub.widthFinished || "",
                          priceFob: Number(sub.priceFob) || 0,
                          surCharges: Number(sub.surCharges) || 0,
                          // colorId: sub.colorId || "",
                          // uomId : sub.uomId || "",
                          colorId: sub.colorId
                            ? parseInt(sub.colorId)
                            : null,
                          uomId: sub.uomId ? parseInt(sub.uomId) : null,
                          quantity: parseFloat(sub.quantity) || 0,
                        })),
                      },
                    }
                    : undefined,
              })),
            }
            : undefined,
      },
    });
  });
  console.log("response data", data);

  return { statusCode: 0, data };
}

async function updateOrderBillItems(tx, orderDetails, order) {
  if (!Array.isArray(orderDetails) || !order?.id) {
    throw new Error("Invalid order or orderDetails data");
  }

  await tx.orderBillItems.deleteMany({
    where: { orderId: parseInt(order.id) },
  });

  // Parse and clean orderDetails
  const parsedOrderImportItems = orderDetails
    .map((item) => {
      // Handle valid JSON strings
      if (
        typeof item === "string" &&
        item.trim().startsWith("{") &&
        item.trim().endsWith("}")
      ) {
        try {
          return JSON.parse(item);
        } catch (err) {
          console.error("Failed to parse item:", item, err);
          return null;
        }
      }
      if (typeof item === "object" && item !== null) {
        return item;
      }
      return null;
    })
    .filter((item) => item !== null);

  // Create DB entries
  const insertPromises = parsedOrderImportItems.map((item) => {
    if (!item) return;

    return tx.orderBillItems.create({
      data: {
        orderId: parseInt(order.id),
        barCode: item.barCode,
        class: item.class,
        color: item.color,
        department: item.department,
        date: item.date ? new Date(item.date) : null,
        itemCode: item.itemCode,
        mrp: parseFloat(item.mrp),
        orderQty: parseInt(item.orderQty),
        product: item.product,
        qty: parseInt(item.qty),
        size: item.size,
        sizeDesc: item.sizeDesc,
        styleCode: item.styleCode,
        supplierCode: item.supplierCode,
        excessQty: parseFloat(item.excessQty),
      },
    });
  });

  return Promise.all(insertPromises);
}

async function update(id, body) {
  const {
    branchId,
    userId,
    vendor,
    date,
    orderDetails,
    attachments,
    ponumber,
    deliveryDate,
    docDate,
    docId,
    partyId,
    customerId,
    supplierId,
    customerAddress,
    supplierAddress,
    proformaImage,
  } = body;

  const dataFound = await prisma.order.findUnique({
    where: { id: parseInt(id) },
  });

  if (!dataFound) return NoRecordFound("Purchase order record");

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.order.update({
      where: { id: parseInt(id) },
      data: {
        docId,
        orderdate: date ? new Date(date) : null,
        poNumber: ponumber ?? null,
        deliverydate: deliveryDate ? new Date(deliveryDate) : null,
        docDate: docDate ?? null,
        partyId: partyId ? parseInt(partyId) : undefined,
        customerId: customerId ? parseInt(customerId) : undefined,
        supplierId: supplierId ? parseInt(supplierId) : undefined,
        customerAddress: customerAddress ?? null,
        supplierAddress: supplierAddress ?? null,
        branchId: branchId ? parseInt(branchId) : undefined,
        updatedByBy: userId ? parseInt(userId) : undefined,
        vendor: vendor ? parseInt(vendor) : undefined,
        proformaImage: proformaImage
          ? proformaImage.path || proformaImage
          : dataFound.proformaImage,
        orderBillItems: {
          deleteMany: {},

          create:
            orderDetails?.length > 0
              ? orderDetails.map((item) => ({
                fabCode: item.fabCode,
                styleSheetId: item?.styleSheetId || null,
                subGrid: {
                  createMany: {
                    data: item.orderDetailsSubGrid.map((sub) => ({
                      fabType: sub.fabType || "",
                      fiberContent: sub.fiberContent || "",
                      weightGSM: sub.weightGSM?.toString() || "",
                      widthFinished: sub.widthFinished || "",
                      priceFob: parseFloat(sub.priceFob) || 0,
                      surCharges: Number(sub.surCharges) || 0,
                      // color: sub.color || "",
                      colorId: sub.colorId ? parseInt(sub.colorId) : null,
                      uomId: sub.uomId ? parseInt(sub.uomId) : null,
                      quantity: parseFloat(sub.quantity) || 0,
                    })),
                  },
                },
              }))
              : [],
        },
      },
    });

    await tx.attachments.deleteMany({ where: { orderId: parseInt(id) } });
    if (attachments?.length > 0) {
      await tx.attachments.createMany({
        data: attachments.map((a) => ({
          orderId: parseInt(id),
          date: a.date ? new Date(a.date) : undefined,
          log: a.log || "",
          gridUser: a.gridUser || "",
          filePath: a.filePath || "",
        })),
      });
    }
  });

  return { statusCode: 0, data };
}

async function uploadBillProofImage(id, req) {
  const images = req.files?.images || [];
  const dataFound = await prisma.orderBillItems.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("orderBill");
  const data = await prisma.orderBillItems.update({
    where: {
      id: parseInt(id),
    },
    data: {
      BillProofItems: {
        createMany: { data: images.map((i) => ({ image: i.filename })) },
      },
    },
  });
  return { statusCode: 0 };
}

async function remove(id) {
  const data = await prisma.order.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  upload,
  attach,
  uploadBillProofImage,
  getOneFilter,
};
