import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getDirectItems,
  getPoItemsandDirectInwardItems,
  getDirectItemById,
} from "../controllers/directInwardOrReturn.controller.js";

router.post("/", create);

router.get("/", get);

router.get("/getDirectItems", getDirectItems);

router.get(
  "/getDirectItems/:id/:purchaseInwardReturnId/:stockId/:storeId/:billEntryId",
  getDirectItemById
);

router.get("/getPoItemsandDirectInwardItems", getPoItemsandDirectInwardItems);

router.get("/:id", getOne);

router.get("/search/:searchKey", getSearch);

router.put("/:id", update);

router.delete("/:id", remove);

export default router;
