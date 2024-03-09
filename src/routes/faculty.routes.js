import { Router } from "express";
import { loginFaculty, logoutFaculty, registerFaculty, refreshAccessTokenFaculty, getCurrentFaculty, updateAccountDetails,getSubmittedTasksOfFaculty,getTasksForApprovalOfFaculty,rejectTask, approveTask, getApprovedTasksOfFaculty, getTasksRejectedByFaculty,addTask} from "../controllers/faculty.controller.js";
import { verifyJWTfaculty } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/getCurrentFaculty").get(verifyJWTfaculty, getCurrentFaculty)  //working
router.route("/getAddedTasks").get(verifyJWTfaculty, getSubmittedTasksOfFaculty) //working
router.route("/PendingApproval").get(verifyJWTfaculty, getTasksForApprovalOfFaculty) //working
router.route("/getApprovedTasks").get(verifyJWTfaculty, getApprovedTasksOfFaculty) //working
router.route("/getRejectedTasks").get(verifyJWTfaculty, getTasksRejectedByFaculty)  //working

router.route("/registerfaculty").post(registerFaculty)  //working
router.route("/loginfaculty").post(loginFaculty)  //working
router.route("/logoutfaculty").post(verifyJWTfaculty, logoutFaculty) //working
router.route("/refresh-tokenfaculty").post(refreshAccessTokenFaculty)  //working
router.route("/rejectTask").post(verifyJWTfaculty, rejectTask) //working
router.route("/approveTask").post(verifyJWTfaculty, approveTask)  //working
router.route("/addnewTask").post(verifyJWTfaculty,addTask) //working

router.route("/updateAccountDetails").put(verifyJWTfaculty, updateAccountDetails)


export default router 