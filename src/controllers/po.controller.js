import { Prisma } from "@prisma/client";

import {
  get as _get,
  getOne as _getOne,
  getSearch as _getSearch,
  getPoItems as _getPoItems,
  create as _create,
  update as _update,
  remove as _remove,
  getPoItemById as _getPoItemById,
} from "../services/po.service.js";

// export const transformBody = (body) => {


//   return {
//     docId: body.docId,
//     date: body.date ? new Date(body.date) : null,
//     revisedDate: body.revisedDate ? new Date(body.revisedDate) : null,
//     customerPoNumber: body.customerPoNumber || "",
//     quantityAllowance: body.quantityAllowance || "",
//     shippingMark: body.shippingMark || "",
//     shipmentMode: body.shipmentMode || "",
//     shipDate: body.shipDate ? new Date(body.shipDate) : null,
//     deliveryTerm: body.deliveryTerm || "",
//     portOrigin: body.portOrigin || "",
//     finalDestination: body.finalDestination || "",
//     paymentTerms: body.paymentTerms || "",
//     shipName: body.shipName || "",
//     shipAddress: body.shipAddress || "",
//     shipMobile: body.shipMobile || "",

//     customerId: body.customerId ? parseInt(body.customerId) : undefined,
//     supplierId: body.supplierId ? parseInt(body.supplierId) : undefined,
//     orderId: body.orderId ? parseInt(body.orderId) : undefined,
//     branchId: body.branchId ? parseInt(body.branchId) : undefined,
//     userId: body.userId ? parseInt(body.userId) : undefined,
//     // removeImage : body.removeImage || '',
    
//     attachments:
//       typeof body.attachments === "string"
//         ? JSON.parse(body.attachments)
//         : body.attachments || [],
//     // proformaImage: body.proformaImage,
//     proformaImage: removeImage
//     ? null
//     : file
//     ? file.filename
//     : body.proformaImage, 
//   };
// };


async function get(req, res, next) {
  res.json(await _get(req));
  try {
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await _getOne(req.params.id));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export async function getPoItemById(req, res, next) {
  try {
    res.json(
      await _getPoItemById(
        req.params.id,
        req.params.purchaseInwardReturnId,
        req.params.stockId,
        req.params.storeId,
        req.params.billEntryId,
        req.params.poType
      )
    );
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export async function getPoItems(req, res, next) {
  try {
    res.json(await _getPoItems(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function getSearch(req, res, next) {
  try {
    res.json(await _getSearch(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function create(req, res, next) {
  try {
    res.json(await _create(req.body));
    console.log(res.statusCode);
  } catch (error) {
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      }
    } else {
      res.json({
        statusCode: 1,
        message:
          error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
      });
    }
  }
}

async function update(req, res, next) {
   
  try {
    
    res.json(await _update(req.params.id, req));

  } catch (error) {
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      }
    } else {
      res.json({
        statusCode: 1,
        message:
          error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
      });
    }
  }
}

async function remove(req, res, next) {
  try {
    res.json(await _remove(req.params.id));
    console.log(res.statusCode);
  } catch (error) {
    if (error.code === "P2025") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: `Record Not Found` });
      console.log(res.statusCode);
    } else if (error.code === "P2003") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: "Child record Exists" });
    }
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message
    );
  }
}

export { get, getOne, getSearch, create, update, remove };
