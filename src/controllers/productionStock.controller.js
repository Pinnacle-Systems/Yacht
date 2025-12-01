import {
  getStyleDetail as _getStyleDetail,
  getProductionStyle as _getProductionStyle,
} from "../services/productionStock.service.js";

async function getStyleDetail(req, res, next) {
  try {
    res.json(await _getStyleDetail(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function getProductionStyle(req, res, next) {
  try {
    res.json(await _getProductionStyle(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export { getStyleDetail,getProductionStyle };
