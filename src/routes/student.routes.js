import { Router } from "express";
import { loginStudent, logoutStudent, registerStudent } from "../controllers/student.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/registerstudent").post(registerStudent)
router.route("/loginstudent").post(loginStudent)

router.route("/logoutstudent").post(verifyJWT, logoutStudent)

export default router 