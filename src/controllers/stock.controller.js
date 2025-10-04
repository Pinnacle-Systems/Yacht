import { Prisma } from "@prisma/client";

import {
  get as _get,
  getStyleDetail as _getStyleDetail,
} from "../services/stock.service.js";

async function get(req, res, next) {
  try {
    res.json(await _get(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getStyleDetail(req, res, next) {
  try {
    res.json(await _getStyleDetail(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export { get, getStyleDetail };
