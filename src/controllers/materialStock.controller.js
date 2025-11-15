import { get as _get } from "../services/materialStock.service.js";

async function get(req, res, next) {
  try {
    res.json(await _get(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

export { get };
