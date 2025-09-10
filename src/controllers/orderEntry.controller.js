import { Prisma } from "@prisma/client";

import {
  get as _get,
  getOne as _getOne,
  getSearch as _getSearch,
  create as _create,
  update as _update,
  remove as _remove,
  uploadBillProofImage as _uploadBillProofImage,
  upload as _upload,
  attach as _attach,
  getOneFilter as _getOneFilter
} from "../services/orderEntry.service.js";

// src/utils/transformOrderBody.js

export const transformOrderBody = (body) => {
  console.log(body, "raw order body (before transform)");

  return {
    docId: body.docId,
    date: body.date ? new Date(body.date) : null,
    customerId: body.customerId ? parseInt(body.customerId) : undefined,
    branchId: body.branchId ? parseInt(body.branchId) : undefined,
    contactMobile: body.contactMobile || "",
    address: body.address || "",

    orderDetails:
      typeof body.orderDetails === "string"
        ? JSON.parse(body.orderDetails)
        : body.orderDetails || [],

    attachments:
      typeof body.attachments === "string"
        ? JSON.parse(body.attachments)
        : body.attachments || [],
    proformaImage: body.proformaImage || null,
  };
};

async function get(req, res, next) {
  try {
    res.json(await _get(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getOne(req, res, next) {

  try {
   res.json(await _getOne(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function getOneFilter(req,res) {

    try {
    
     res.json(await _getOneFilter(req));
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
  // res.json(await _create(req.body));
  try {
    res.json(await _create(req.body));
    console.log(res.statusCode);
  } catch (error) {
    console.error(`Error`, error.message);
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
      res.json({ statusCode: 1, message: error.message });
    }
  }
}

async function update(req, res, next) {
  try {
    // res.json(await _update(req.params.id, req.body));
    // console.log(res.statusCode);
     const { id } = req.params;

    const transformedData = transformOrderBody(req.body);

    
    const updatedOrder = await _update(id, {
      ...transformedData,
      proformaImage: req.file ? req.file.filename : undefined,
    });

    res.status(200).json({ statusCode: 0, data: updatedOrder });



  } catch (error) {
    console.error(`Error`, error.message);
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
      res.json({ statusCode: 1, message: error.message });
    }
  }
}

async function uploadBillProofImage(req, res, next) {
  try {
    res.json(await _uploadBillProofImage(req.params.id, req));
    console.log(res.statusCode);
  } catch (error) {
    console.error(`Error`, error.message);
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
      res.json({ statusCode: 1, message: error.message });
    }
  }
}

export async function upload(req, res, next) {
  try {
    res.json(await _upload(req));
    console.log(res.statusCode);
  } catch (error) {
    console.error(`Error`, error.message);
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
      } else {
        res.json({ statusCode: 1, message: "Child Record Exists" });
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

export async function attach(req, res, next) {
  try {
    res.json(await _attach(req));
    console.log(res.statusCode);
  } catch (error) {
    console.error(`Error`, error.message);
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
      } else {
        res.json({ statusCode: 1, message: "Child Record Exists" });
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
    console.log(`Error`, error.message);
  }
}

export { get, getOne, getSearch, create, update, remove, uploadBillProofImage,getOneFilter };
