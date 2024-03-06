import { Router } from "express";
import { getCurrentAdmin, loginAdmin, logoutAdmin, refreshAccessTokenAdmin, registerAdmin, setBaseMul,updateAccountDetails,updateBaseMul } from "../controllers/admin.controller.js";
import { verifyJWTadmin } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/setBaseMultiplier").post(setBaseMul)
router.route("/updateBaseMultiplier").put(updateBaseMul)
router.route("/registeradmin").post(registerAdmin)
router.route("/loginadmin").post(loginAdmin)

router.route("/logoutadmin").post(verifyJWTadmin, logoutAdmin)
router.route("/refresh-tokenadmin").post(refreshAccessTokenAdmin)

router.route("/getCurrentAdmin").get(verifyJWTadmin, getCurrentAdmin);

router.route("/updateAccountDetails").put(verifyJWTadmin, updateAccountDetails);

export default router 