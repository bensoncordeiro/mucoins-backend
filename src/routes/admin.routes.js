import { Router } from "express";
import { getCurrentAdmin, loginAdmin, logoutAdmin, refreshAccessTokenAdmin, registerAdmin, setBaseMul,updateAccountDetails,updateBaseMul,getBaseMul,addReward } from "../controllers/admin.controller.js";
import { verifyJWTadmin } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/getCurrentAdmin").get(verifyJWTadmin, getCurrentAdmin) //working
router.route("/getBaseMultiplier").get(getBaseMul) //working

router.route("/setBaseMultiplier").post(setBaseMul) //working
router.route("/registeradmin").post(registerAdmin)  //working
router.route("/loginadmin").post(loginAdmin) //working
router.route("/logoutadmin").post(verifyJWTadmin, logoutAdmin)  //working
router.route("/refresh-tokenadmin").post(refreshAccessTokenAdmin)   //working
router.route("/addReward").post(verifyJWTadmin,addReward)  //working

router.route("/updateBaseMultiplier").put(verifyJWTadmin,updateBaseMul)    //working
router.route("/updateAccountDetails").put(verifyJWTadmin, updateAccountDetails)

export default router 