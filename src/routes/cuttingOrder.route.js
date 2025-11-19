import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  getStyleDetail
} from "../controllers/cuttingOrder.controller.js";

router.post("/", create);

router.get("/", get);

router.get("/getStyleDetail",getStyleDetail)

router.get("/:id", getOne);

router.put("/:id", update);

router.delete("/:id", remove);

export default router;
