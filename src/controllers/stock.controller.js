import {
  get as _get,
  getStyleDetail as _getStyleDetail,
  getSummary as _getSummary,
} from "../services/stock.service.js";

async function get(req, res, next) {
  try {
    res.json(await _get(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getSummary(req, res, next) {
  try {
    res.json(await _getSummary(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getStyleDetail(req, res, next) {
  try {
    res.json(await _getStyleDetail(req));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export { get, getStyleDetail, getSummary };
