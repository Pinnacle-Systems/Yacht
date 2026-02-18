import {
  getSRBarcodeDetail as _getSRBarcodeDetail,
  get as _get,
  getBarcodeList as _getBarcodeList
} from "../services/showroomStock.service.js";

async function getSRBarcodeDetail(req, res, next) {
  try {
    res.json(await _getSRBarcodeDetail(req));
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

async function getBarcodeList(req, res, next) {
  try {
    res.json(await _getBarcodeList(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

export { getSRBarcodeDetail, get ,getBarcodeList};
