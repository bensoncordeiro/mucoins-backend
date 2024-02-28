import { Router } from "express";
import { loginFaculty, logoutFaculty, registerFaculty } from "../controllers/faculty.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/registerfaculty").post(registerFaculty)
router.route("/loginfaculty").post(loginFaculty)

router.route("/logoutfaculty").post(verifyJWT, logoutFaculty)

export default router 