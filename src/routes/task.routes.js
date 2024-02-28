import { Router } from "express";
import { addTask } from "../controllers/task.controller.js";

const router = Router()

router.route("/newTask").post(addTask)


export default router 