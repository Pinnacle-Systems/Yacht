import { prisma } from "../lib/prisma.js";

import {
  getOneBarcode as _getOneBarcode,
  remove as _remove,
  get as _get,
  getOne as _getOne,
  create as _create,
  update as _update,
} from "../services/stockAdjustment.service.js";

async function getOneBarcode(req, res, next) {
  try {
    res.json(await _getOneBarcode(req));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function get(req, res, next) {
  try {
    res.json(await _get(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await _getOne(req.params.id));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function create(req, res, next) {
  try {
    res.json(await _create(req.body));
  } catch (error) {
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message
    );
    if (error instanceof prisma.PrismaClientKnownRequestError) {
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
    res.json(await _update(req.params.id, req.body));
  } catch (error) {
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message
    );
    if (error instanceof prisma.PrismaClientKnownRequestError) {
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
  } catch (error) {
    if (error.code === "P2025") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: `Record Not Found` });
      console.log(res.statusCode);
    } else if (error.code === "P2003") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: "Child record Exists" });
    }
    console.error(`Error`, error.message);
  }
}

export { getOneBarcode, remove, get, getOne, create, update };
