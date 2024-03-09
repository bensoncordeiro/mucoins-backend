import { Router } from "express";
import { loginStudent, logoutStudent, refreshAccessTokenStudent, registerStudent, getCurrentStudent, updateAccountDetails, acceptTask , getTasksForStudent, getAcceptedTasks, submitProof,rejectedTasksofStudent,resubmitProof,claimReward } from "../controllers/student.controller.js";
import { verifyJWTstudent } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"


const router = Router()

router.route("/getCurrentStudent").get(verifyJWTstudent, getCurrentStudent)
router.route("/getTasks").get(verifyJWTstudent,getTasksForStudent)
router.route("/AcceptedTasks").get(verifyJWTstudent,getAcceptedTasks)
router.route("/RejectedTasks").get(verifyJWTstudent,rejectedTasksofStudent)

router.route("/registerstudent").post(registerStudent)
router.route("/loginstudent").post(loginStudent)
router.route("/logoutstudent").post(verifyJWTstudent, logoutStudent)
router.route("/refresh-tokenstudent").post(refreshAccessTokenStudent)
router.route("/accepttask").post(verifyJWTstudent, acceptTask)
router.route("/SubmitTask").post(upload.single('proof'), verifyJWTstudent, submitProof)
router.route("/resubmitTask").post(upload.single('newproof'), verifyJWTstudent, resubmitProof)
router.route("/claimReward").post(verifyJWTstudent, claimReward)

router.route("/updateaccountdetails").put(verifyJWTstudent, updateAccountDetails)

export default router 