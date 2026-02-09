import { Router } from "express";
const router = Router();
import { get, create, getOne } from "../controllers/customer.controller.js";

router.post("/", create);

router.get("/", get);

router.get("/:id", getOne);

export default router;
