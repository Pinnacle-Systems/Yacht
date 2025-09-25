import { Router } from "express";
const router = Router();
import {
  getOne,
  remove,
} from "../controllers/stockAdjustment.controller.js";

router.get("/:id", getOne);
router.delete("/:id", remove);

export default router;
