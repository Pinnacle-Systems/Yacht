import { Prisma } from "@prisma/client";

import {
  get as _get,
  getOne as _getOne,
  create as _create,
  update as _update,
  remove as _remove,
} from "../services/sampleEnter.service.js";

export const transformSampleEntryBody = (body) => {
  console.log(body, "raw sample entry body (before transform)");

  return {
    date: body.date ? new Date(body.date) : null,
    submitter: body.submitter || "",
    submittingTo: body.submittingTo || "",
    supplierId: body.supplierId ? parseInt(body.supplierId) : undefined,
    supplierName: body.supplierName || "",
    supplierAddress: body.supplierAddress || "",
    supplierMobile: body.supplierMobile || "",

    // Parse sampleEntryGrid if sent as JSON string
    sampleEntryGrid:
      typeof body.sampleEntryGrid === "string"
        ? JSON.parse(body.sampleEntryGrid)
        : body.sampleEntryGrid || [],

    // Parse attachments if sent as JSON string
    attachments:
      typeof body.attachments === "string"
        ? JSON.parse(body.attachments)
        : body.attachments || [],
  };
};

async function create(req, res, next) {
  try {
    const parsedBody = transformSampleEntryBody(req.body);
    res.json(await _create(parsedBody));
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
    const parsedBody = transformSampleEntryBody(req.body);
    res.json(await _update(req.params.id, parsedBody));
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
export { get, getOne, create, update, remove };
