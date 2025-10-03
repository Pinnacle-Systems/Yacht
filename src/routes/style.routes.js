import { Router } from "express";
const router = Router();
import multerUpload from "../utils/multerUpload.js";
import {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  upload,
  getOneStyleCode,
} from "../controllers/style.controller.js";
import { styleUpload } from "../configs/styleMulter.config.js";

router.post("/", styleUpload.single("img"), create);

router.patch("/upload/:id", multerUpload.single("image"), upload);

router.get("/", get);
router.get("/styleCode", getOneStyleCode);
router.get("/:id", getOne);

router.get("/search/:searchKey", getSearch);

// router.put("/:id", update);
router.put("/:id", styleUpload.single("img"), update);

router.delete("/:id", remove);

export default router;
