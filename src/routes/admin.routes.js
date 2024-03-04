import { Router } from "express";
import { setBaseMul,updateBaseMul } from "../controllers/admin.controller.js";

const router = Router()

router.route("/setBaseMultiplier").post(setBaseMul)
router.route("/updateBaseMultiplier").put(updateBaseMul)

export default router 