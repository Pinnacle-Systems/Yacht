import { Router } from "express";
import { getProductionStyle, getStyleDetail } from "../controllers/productionStock.controller.js";
const router = Router();

router.get("/styleDetail", getStyleDetail);
router.get("/productionStyle",getProductionStyle)

export default router;
