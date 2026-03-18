import { Router } from "express";
const router = Router();
import {
  create,
  get,
  getOne,
  update,
  remove,
  getSaleBillDetail,
  getSalesReport,
  getHOSalesDetail,
  getHOSalesList,
  getSalesBarcodeDetail,
  sendSalesBillSMS
} from "../controllers/salesBill.controller.js";

router.post("/", create);
router.get("/", get);
router.get("/hoSalesList",getHOSalesList)
router.get("/salesReport", getSalesReport);
router.get("/salesBillDetail", getSaleBillDetail);
router.get("/hoSalesDetail", getHOSalesDetail);
router.get("/salesBarcodeDetail", getSalesBarcodeDetail);
router.post("/sales-bill/send-sms",sendSalesBillSMS)
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
