import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  getOneBarcode,
  remove,
  create,
  update,
} from "../controllers/stockAdjustment.controller.js";

router.get("/", get);
router.get("/barcode", getOneBarcode);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
