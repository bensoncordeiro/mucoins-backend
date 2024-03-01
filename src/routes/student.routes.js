import { Router } from "express";
import { loginStudent, logoutStudent, refreshAccessTokenStudent, registerStudent  } from "../controllers/student.controller.js";
import { verifyJWTstudent } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/registerstudent").post(registerStudent)
router.route("/loginstudent").post(loginStudent)

router.route("/logoutstudent").post(verifyJWTstudent, logoutStudent)
router.route("/refresh-tokenstudent").post(refreshAccessTokenStudent)

export default router 