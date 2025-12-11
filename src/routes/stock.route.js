import { Router } from "express";
import { get } from "../controllers/stock.controller.js";
import { getStyleDetail, getSummary } from "../controllers/stock.controller.js";
const router = Router();

router.get("/", get);
router.get("/summary", getSummary);
router.get("/styleDetail", getStyleDetail);

export default router;
