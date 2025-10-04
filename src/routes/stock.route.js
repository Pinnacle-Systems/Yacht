import { Router } from "express";
import { get } from "../controllers/stock.controller.js";
import { getStyleDetail } from "../controllers/stock.controller.js";
const router = Router();

router.get("/", get);
router.get("/styleDetail", getStyleDetail);

export default router;
