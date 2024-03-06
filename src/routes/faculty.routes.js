import { Router } from "express";
import { loginFaculty, logoutFaculty, registerFaculty, refreshAccessTokenFaculty, getCurrentFaculty, updateAccountDetails,getSubmittedTasksOfFaculty } from "../controllers/faculty.controller.js";
import { verifyJWTfaculty } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/registerfaculty").post(registerFaculty)
router.route("/loginfaculty").post(loginFaculty)
router.route("/logoutfaculty").post(verifyJWTfaculty, logoutFaculty)
router.route("/refresh-tokenfaculty").post(refreshAccessTokenFaculty)
router.route("/getCurrentFaculty").get(verifyJWTfaculty, getCurrentFaculty)
router.route("/updateAccountDetails").put(verifyJWTfaculty, updateAccountDetails)
router.route("/getAddedTasks").get(verifyJWTfaculty, getSubmittedTasksOfFaculty)

export default router 