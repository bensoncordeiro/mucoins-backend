import { Router } from "express";
import { loginStudent, logoutStudent, refreshAccessTokenStudent, registerStudent, getCurrentStudent, updateAccountDetails, acceptTask , getTasksForStudent, getAcceptedTasks, submitProof,rejectedTasksofStudent,resubmitProof,claimReward,getCompletedTasksOfStudent,getRewards,changeCurrentPassword } from "../controllers/student.controller.js";
import { verifyJWTstudent } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"


const router = Router()

router.route("/getCurrentStudent").get(verifyJWTstudent, getCurrentStudent) //working
router.route("/getTasks").get(verifyJWTstudent,getTasksForStudent) //working
router.route("/acceptedTasks").get(verifyJWTstudent,getAcceptedTasks) //working
router.route("/rejectedTasks").get(verifyJWTstudent,rejectedTasksofStudent) //working
router.route("/completedTasks").get(verifyJWTstudent,getCompletedTasksOfStudent) //working
router.route("/rewards").get(verifyJWTstudent,getRewards) //working

router.route("/registerstudent").post(registerStudent)  //working
router.route("/loginstudent").post(loginStudent)  //working
router.route("/logoutstudent").post(verifyJWTstudent, logoutStudent)  //working
router.route("/refresh-tokenstudent").post(refreshAccessTokenStudent) //working
router.route("/accepttask").post(verifyJWTstudent, acceptTask) //working
router.route("/submitTask").post(upload.single('proof'), verifyJWTstudent, submitProof)  //working
router.route("/resubmitTask").post(upload.single('newproof'), verifyJWTstudent, resubmitProof) //working
router.route("/claimReward").post(verifyJWTstudent, claimReward) //working
router.route("/changePassword").post(verifyJWTstudent, changeCurrentPassword)


router.route("/updateaccountdetails").put(verifyJWTstudent, updateAccountDetails)

export default router 