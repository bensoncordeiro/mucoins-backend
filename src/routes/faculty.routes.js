import { Router } from "express";
import { loginFaculty, logoutFaculty, registerFaculty, refreshAccessTokenFaculty, getCurrentFaculty, updateAccountDetails,getSubmittedTasksOfFaculty,getTasksForApprovalOfFaculty,rejectTask, approveTask, getApprovedTasksOfFaculty, getTasksRejectedByFaculty,addTask} from "../controllers/faculty.controller.js";
import { verifyJWTfaculty } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/getCurrentFaculty").get(verifyJWTfaculty, getCurrentFaculty)
router.route("/getAddedTasks").get(verifyJWTfaculty, getSubmittedTasksOfFaculty)
router.route("/PendingApproval").get(verifyJWTfaculty, getTasksForApprovalOfFaculty)  
router.route("/getApprovedTasks").get(verifyJWTfaculty, getApprovedTasksOfFaculty)
router.route("/getRejectedTasks").get(verifyJWTfaculty, getTasksRejectedByFaculty)  

router.route("/registerfaculty").post(registerFaculty)
router.route("/loginfaculty").post(loginFaculty)
router.route("/logoutfaculty").post(verifyJWTfaculty, logoutFaculty)
router.route("/refresh-tokenfaculty").post(refreshAccessTokenFaculty)
router.route("/rejectTask").post(verifyJWTfaculty, rejectTask)
router.route("/approveTask").post(verifyJWTfaculty, approveTask)
router.route("/addnewTask").post(verifyJWTfaculty,addTask)

router.route("/updateAccountDetails").put(verifyJWTfaculty, updateAccountDetails)


export default router 