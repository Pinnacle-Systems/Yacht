import { getSRBarcodeDetail as _getSRBarcodeDetail } from "../services/showroomStock.service.js";

async function getSRBarcodeDetail(req, res, next) {
  try {
    res.json(await _getSRBarcodeDetail(req));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export { getSRBarcodeDetail };
