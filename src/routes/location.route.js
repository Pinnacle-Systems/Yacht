import { Router } from "express";
import {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
} from "../controllers/location.controller.js";
const router = Router();

router.post("/", create);

router.get("/", get);

router.get("/:id", getOne);

router.get("/search/:searchKey", getSearch);

router.put("/:id", update);

router.delete("/:id", remove);

export default router;
