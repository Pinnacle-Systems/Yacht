import { Router } from "express";
import { get,getStyleDetail } from "../controllers/materialStock.controller.js";
const router = Router();

router.get("/", get);
router.get("/styleDetail", getStyleDetail);

export default router;
