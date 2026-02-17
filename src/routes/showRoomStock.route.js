import { Router } from "express";
import { getSRBarcodeDetail } from "../controllers/showRoomStock.controller.js";
const router = Router();

router.get("/barcodeDetail", getSRBarcodeDetail);

export default router;
