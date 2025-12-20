import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getReport,
  getSalesInvDetail,
  getSalesInvStyleDetail
} from "../controllers/salesEntry.controller.js";

router.post("/", create);

router.get("/", get);

router.get("/salesReport", getReport);
router.get("/salesInvDetail", getSalesInvDetail);
router.get("/salesInvStyleDetail", getSalesInvStyleDetail);

router.get("/:id", getOne);

router.get("/search/:searchKey", getSearch);

router.put("/:id", update);

router.delete("/:id", remove);

export default router;
