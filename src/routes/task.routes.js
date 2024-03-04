import { Router } from "express";
import { addTask, getTasksForStudent } from "../controllers/task.controller.js";

const router = Router()

router.route("/newTask").post(addTask)
router.route("/getTasks").get(getTasksForStudent)

export default router 