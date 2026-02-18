import { Router } from "express";
import {
  getSRBarcodeDetail,
  get,
  getBarcodeList,
} from "../controllers/showRoomStock.controller.js";

const router = Router();

router.get("/", get);
router.get("/barcodeDetail", getSRBarcodeDetail);
router.get("/barcodeList", getBarcodeList);

export default router;
