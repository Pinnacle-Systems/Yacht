import { Router } from "express";
const router = Router();
import {
  create,
  get,
  getOne,
  update,
  remove,
  getpurchaseBillItems,
  getBarcodeDetail,
} from "../controllers/purchaseBill.controller.js";

router.post("/", create);
router.get("/", get);
router.get("/purBillItemDetails", getpurchaseBillItems);
router.get("/getBarcodeDetail", getBarcodeDetail);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
