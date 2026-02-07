import { Router } from "express";
const router = Router();
import {
  create,
  get,
  getOne,
  update,
  remove,
  getsalesBillItems,
} from "../controllers/salesBill.controller.js";

router.post("/", create);
router.get("/", get);
router.get("/salesBillItems", getsalesBillItems);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
