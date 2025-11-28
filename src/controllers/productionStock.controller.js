import {
  getStyleDetail as _getStyleDetail,
} from "../services/productionStock.service.js";

async function getStyleDetail(req, res, next) {
  try {
    res.json(await _getStyleDetail(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export { getStyleDetail };
