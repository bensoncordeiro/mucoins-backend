import { Router } from "express";
import { addTask } from "../controllers/task.controller.js";
import { verifyJWTfaculty } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/newTask").post(addTask)

export default router 