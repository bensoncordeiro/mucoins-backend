import { Router } from "express";
import { addTask, getTasksForStudent, getSubmittedTasksOfFaculty } from "../controllers/task.controller.js";

const router = Router()

router.route("/newTask").post(addTask)
router.route("/getTasks").get(getTasksForStudent)
router.route("/getAddedTasks").get(getSubmittedTasksOfFaculty)

export default router 