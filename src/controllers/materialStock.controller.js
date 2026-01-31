import {
  get as _get,
  getStyleDetail as _getStyleDetail,
} from "../services/materialStock.service.js";

async function get(req, res, next) {
  try {
    res.json(await _get(req));
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

export { get, getStyleDetail };
