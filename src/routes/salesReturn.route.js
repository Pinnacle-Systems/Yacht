import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  remove,
  create,
  update,
} from "../controllers/salesReturn.controller.js";

router.get("/", get);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
