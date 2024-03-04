import { Router } from "express";
import { loginStudent, logoutStudent, refreshAccessTokenStudent, registerStudent, getCurrentStudent, updateAccountDetails  } from "../controllers/student.controller.js";
import { verifyJWTstudent } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/registerstudent").post(registerStudent)
router.route("/loginstudent").post(loginStudent)

router.route("/logoutstudent").post(verifyJWTstudent, logoutStudent)
router.route("/refresh-tokenstudent").post(refreshAccessTokenStudent)
router.route("/getCurrentStudent").get(verifyJWTstudent, getCurrentStudent);

router.route("/updateaccountdetails").put(verifyJWTstudent, updateAccountDetails);

export default router 