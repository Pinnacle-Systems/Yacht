import { Router } from "express";
import { getStyleDetail } from "../controllers/productionStock.controller.js";
const router = Router();

router.get("/styleDetail", getStyleDetail);

export default router;
