import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { Student } from "../models/student.model.js"
import {AcceptedTask, PendingApprovalTasks, Task} from "../models/task.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const generateAccessAndRefereshTokens = async(studentId) =>{
    try {
        const student = await Student.findById(studentId)
        const accessToken = student.generateAccessToken()
        const refreshToken = student.generateRefreshToken()

        student.refreshToken = refreshToken
        await student.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerStudent = asyncHandler( async (req, res) => {
    
    const {name, rollNo, branch, collEmail, personalEmail,  phoneNumber, walletAdd, password } = req.body
   
    if (
        [name,rollNo, branch, collEmail,personalEmail, phoneNumber,walletAdd, password].some((field) =>
        field?.trim() === "")
    ){
         throw new ApiError(400, "All fields are required")
    }

    const existedStudent = await Student.findOne({
        $or: [{ collEmail }, { rollNo }, { personalEmail }, { phoneNumber }, { walletAdd }]
    })

    if (existedStudent){
        throw new ApiError(409, "user with name or email or rollno already exists")
    }

    const student = await Student.create({
        name,
        rollNo,
        branch,
        collEmail,
        personalEmail,
        phoneNumber,
        walletAdd,
        password,
    })

    const createdStudent = await Student.findById(student._id).select(
        "-password -refreshToken"
    )

    if (!createdStudent) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdStudent, "Student registered successfully")
    )
})


const loginStudent = asyncHandler(async (req, res) =>{
    
    const {collEmail,rollNo, password} = req.body

    if (!rollNo && !collEmail) {
        throw new ApiError(400, "rollno or email is required")
    }
    

    const student = await Student.findOne({
        $or: [{rollNo}, {collEmail}]
    })

    if (!student) {
        throw new ApiError(404, "student does not exist")
    }

   const isPasswordValid = await student.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(student._id)

    const loggedInStudent = await Student.findById(student._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                student: loggedInStudent, accessToken, refreshToken
            },
            "Student logged In Successfully"
        )
    )

})


const logoutStudent = asyncHandler(async(req, res) => {
    await Student.findByIdAndUpdate(
        req.student._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "student logged Out"))
})

const refreshAccessTokenStudent = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const student = await Student.findById(decodedToken?._id)
    
        if (!student) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== student?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(student._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const student = await Student.findById(req.student?._id)
    const isPasswordCorrect = await student.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    student.password = newPassword
    await student.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentStudent = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.student,
        "student fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {name, personalEmail} = req.body

    if (!name || !personalEmail) {
        throw new ApiError(400, "All fields are required")
    }

    const student = await Student.findByIdAndUpdate(
        req.student?._id,
        {
            $set: {
                name,
                personalEmail: personalEmail
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, student, "Account details updated successfully"))
})

const acceptTask = asyncHandler(async(req, res) => {
    const {taskId, reward} = req.body

    const studentId = req.student?._id
    
    const taskDetails = await Task.findById(taskId)
    if(!taskDetails){
        throw new ApiError(404, "Task not found")
    }

    const currentSlotValue = taskDetails.slotsLeft

    const isTaskAlreadyAccepted = await AcceptedTask.findOne({ studentId, taskId })
    if (isTaskAlreadyAccepted) {
        throw new ApiError(400, "Student has already accepted this task")
    }
    else{
        if(currentSlotValue >=1){
            const facultyId = taskDetails.facultyName
            const slotAccepted = (taskDetails.slot - currentSlotValue) + 1
        
        
            const acceptedTaskDetails = await AcceptedTask.create({
                studentId,
                taskId,
                rewardValue: reward,
                facultyId,
                slotAccepted
        
            })
            await Task.findByIdAndUpdate(
                taskId,
                {
                    $set: {
                        slotsLeft: currentSlotValue - 1
                    }
                },
                {new: true}
                
            )
        
            return res
            .status(200)
            .json(new ApiResponse(200, acceptedTaskDetails, "Account details updated successfully"))
        
        }
        else{
            throw new ApiError(502, "No slots Available for this task")
        }
    }
    
})

const getAcceptedTasks = asyncHandler(async (req, res) => {
    const studentId = req.student?._id;

    const acceptedTasks = await AcceptedTask.find({ studentId });

    if (!acceptedTasks || acceptedTasks.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No accepted tasks found for this student"));
    }

    const taskListDetails = await Promise.all(
        acceptedTasks.map(async (acceptedTask) => {
            const task = await Task.findById(acceptedTask.taskId);
            const taskDetails = {
                _id: task._id,
                name: task.name,
                description: task.description,
                branch: task.branch,
                category: task.category,
                reward: acceptedTask.rewardValue, 
            };

            return taskDetails;
        })
    );

    return res.status(200).json(
        new ApiResponse(200, taskListDetails, "Fetched all accepted tasks for the student successfully")
    );
});



const getTasksForStudent = asyncHandler( async (req, res) => {

    const studentBranch = req.student?.branch

    if (!studentBranch) {
        throw new ApiError(401, "Invalid Access token")
    }

    
    const taskList = await Task.find({branch: studentBranch})

    const taskListWithRewards = await Promise.all(
        taskList.map(async (task) => {
          const reward = await calculateReward(task.hours, task.difficulty)

          const frontEndAttributes = {
            _id: task._id,
            name: task.name,
            description: task.description,
            branch: task.branch,
            category: task.category,
            slot: task.slotsLeft,
            reward: reward,
          }
  
          return frontEndAttributes // Add 'reward' field to the task, removed 'hours', 'difficulty', 'timestamp' attributes
        })
      )

    return res.status(201).json(
        new ApiResponse(200, taskListWithRewards, "Fetched All tasks for student successfully")
    )

})

async function calculateReward(hours, difficulty) {
    try {
        const baseMultiplierdata = await Variable.findById(process.env.BASE_MULTIPLIER_ID)
        const baseMultiplier = baseMultiplierdata.baseMul
        const attendance = 100
        let multiplier
        
        if (attendance >=75)
        {
            multiplier = (0.25+(attendance/100))+ (0.33* difficulty) + baseMultiplier
         }
        else{
            multiplier = (0.33* difficulty) + baseMultiplier
        }
        const calculatedReward = multiplier * hours
        return calculatedReward
    } catch (error) {
        throw new ApiError(500, "Something went wrong while calculating reward")
    }
  }

const submitProof = asyncHandler(async (req, res) => {
    try {
        const { taskId } = req.body;
        const studentId = req.student?._id
        const taskDetails = await Task.findById(taskId);

        if (!taskDetails) {
            throw new ApiError(404, "Task not found");
        }
        const facultyId = taskDetails.facultyName;
        if (!req.file) {
            throw new ApiError(400, 'Proof file is required');
        }

        const proofLocalPath = req.file.path;
        const proofOnCloudinary = await uploadOnCloudinary(proofLocalPath);

        if (!proofOnCloudinary) {
            throw new ApiError(500, 'Failed to upload proof file to Cloudinary');
        }
        const PendingApprovalTasksDetails = await PendingApprovalTasks.create({
            taskId: taskId,
            facultyId: facultyId,
            studentId: studentId,
            proof: proofOnCloudinary.url
        });

        return res.status(200).json(new ApiResponse(200, PendingApprovalTasksDetails, "Request sent to faculty successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message || 'Internal server error' });
    }
});





export {
    registerStudent,
    loginStudent,
    logoutStudent,
    refreshAccessTokenStudent,
    changeCurrentPassword,
    getCurrentStudent,
    updateAccountDetails,
    acceptTask,
    getTasksForStudent,
    getAcceptedTasks,
    submitProof
 }
