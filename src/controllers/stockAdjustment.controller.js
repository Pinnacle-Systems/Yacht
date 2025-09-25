import { Prisma } from "@prisma/client";

import {
  getOne as _getOne,
  remove as _remove,
} from "../services/stockAdjustment.service.js";


async function getOne(req, res, next) {
  try {
    res.json(await _getOne(req.params.id));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
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
    console.error(`Error`, error.message);
  }
}

export { getOne, remove };
