import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Faculty } from "../models/faculty.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { AcceptedTask, Task, CompletedTasks } from "../models/task.model.js"
import { Student } from "../models/student.model.js"
import { Web3 } from 'web3';
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async(facultyId) =>{
    try {
        const faculty = await Faculty.findById(facultyId)
        const accessToken = faculty.generateAccessToken()
        const refreshToken = faculty.generateRefreshToken()

        faculty.refreshToken = refreshToken
        await faculty.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const registerFaculty = asyncHandler( async (req, res) => {
    
    const {name, branch, collEmail, phoneNumber, password } = req.body
    

    if (
        [name, branch, collEmail, phoneNumber, password].some((field) =>
        field?.trim() === "")
    ){
         throw new ApiError(400, "All fields are required")
    }

    const existedFaculty = await Faculty.findOne({
        $or: [{ collEmail }, { phoneNumber }]
    })

    if (existedFaculty){
        throw new ApiError(409, "faculty with name or email already exists")
    }

    const faculty = await Faculty.create({
        name,
        branch,
        collEmail,
        phoneNumber,
        password,
    })

    const createdFaculty = await Faculty.findById(faculty._id).select(
        "-password -refreshToken"
    )

    if (!createdFaculty) {
        throw new ApiError(500, "Something went wrong while registering the faculty")
    }

    return res.status(201).json(
        new ApiResponse(200, createdFaculty, "Faculty registered successfully")
    )
})



const loginFaculty = asyncHandler(async (req, res) =>{
    
    const {collEmail,name, password} = req.body

    if (!name && !collEmail) {
        throw new ApiError(400, "name or email is required")
    }
    

    const faculty = await Faculty.findOne({
        $or: [{name}, {collEmail}]
    })

    if (!faculty) {
        throw new ApiError(404, "Faculty does not exist")
    }

   const isPasswordValid = await faculty.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid faculty credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(faculty._id)

    const loggedInFaculty = await Faculty.findById(faculty._id).select("-password -refreshToken")

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
                faculty: loggedInFaculty, accessToken, refreshToken
            },
            "Faculty logged In Successfully"
        )
    )

})


const logoutFaculty = asyncHandler(async(req, res) => {
    await Faculty.findByIdAndUpdate(
        req.faculty._id,
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
    .json(new ApiResponse(200, {}, "Faculty logged Out"))
})



const refreshAccessTokenFaculty = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const faculty = await Faculty.findById(decodedToken?._id)
    
        if (!faculty) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== faculty?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(faculty._id)
    
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

    const faculty = await Faculty.findById(req.faculty?._id)
    const isPasswordCorrect = await faculty.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    faculty.password = newPassword
    await faculty.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const addTask = asyncHandler(async (req, res) => {
    const { name, description, branch, hours, category, difficulty, slot } = req.body

    if (![name, description, hours, category, difficulty, slot].every(field => typeof field === 'string' && field.trim() !== "")) {
        throw new ApiError(400, "All fields are required")
    }

    if (!Array.isArray(branch) || branch.length === 0) {
        throw new ApiError(400, "At least one branch must be selected")
    }

    if (branch.some(branchItem => typeof branchItem !== 'string' || branchItem.trim() === '')) {
        throw new ApiError(400, "Branch names must be non-empty strings")
    }

    const task = await Task.create({
        name,
        description,
        branch,
        hours,
        category,
        difficulty,
        facultyId: req.faculty?._id,
        slot,
        slotsLeft: slot
    })

    return res.status(201).json(
        new ApiResponse(200, task, "Task added successfully")
    )
})

const getCurrentFaculty = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.faculty,
        "faculty fetched successfully"
    ))
})


const updateAccountDetails = asyncHandler(async(req, res) => {
    const {name, collEmail} = req.body

    if (!name || !collEmail) {
        throw new ApiError(400, "All fields are required")
    }

    const faculty = await Faculty.findByIdAndUpdate(
        req.faculty?._id,
        {
            $set: {
                name,
                collEmail: collEmail
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, faculty, "Account details updated successfully"))
})

const getSubmittedTasksOfFaculty = asyncHandler(async (req, res) => {
    const facultyId = req.faculty?._id
    const taskList = await Task.find({ facultyId: facultyId })
    if (!taskList) {
        throw new ApiError(404, 'No submitted tasks found of faculty');
    }
    return res.status(200).json(
        new ApiResponse(200, taskList, "Fetched All tasks for faculty successfully")
    )
})


const getTasksForApprovalOfFaculty = asyncHandler(async (req, res) => {
    try {
        const facultyId = req.faculty?._id
        // const taskListForApproval = await AcceptedTask.find({facultyId: facultyId, isSubmitted: true, isRejected: false})
        // if (!taskListForApproval) {
        //     throw new ApiError(404, 'No Tasks found for Approval of faculty');
        // }
    
        // const taskListDetails = await Promise.all(
        //     taskListForApproval.map(async (acceptedTask) => {
        //         const task = await Task.findById(acceptedTask.taskId);
        //         const studentDetails = await Student.findById(acceptedTask.studentId);
        //         const taskDetails = {
        //             taskId: task._id,
        //             taskName: task.name,
        //             taskDescription: task.description,
        //             taskBranch: task.branch,
        //             taskCategory: task.category,
        //             taskRewardValue: acceptedTask.rewardValue,
        //             uploadedProof: acceptedTask.proof,
        //             studentId: acceptedTask.studentId,
        //             studentName: studentDetails.name,
        //             studentRollno: studentDetails.rollNo,
        //             studentBranch: studentDetails.branch,
        //             submittedOn: acceptedTask.updatedAt
        //         };
    
        //         return taskDetails;
        //     })
        // );
        // return res.status(200).json(
        //     new ApiResponse(200, taskListDetails, "Fetched All tasks for Approval of faculty successfully")
        // )

        const pipeline = [
            {
              '$match': { 
                'isSubmitted': true,
                'isRejected': false,
                'facultyId': facultyId
              }
            }, {
              '$lookup': {
                'from': 'tasks', 
                'localField': 'taskId', 
                'foreignField': '_id', 
                'as': 'taskDetails'
              }
            }, {
              '$addFields': {
                'taskDetails': {
                  '$arrayElemAt': [
                    '$taskDetails', 0
                  ]
                }
              }
            }, {
              '$lookup': {
                'from': 'students', 
                'localField': 'studentId', 
                'foreignField': '_id', 
                'as': 'studentDetails'
              }
            }, {
              '$addFields': {
                'studentDetails': {
                  '$arrayElemAt': [
                    '$studentDetails', 0
                  ]
                }
              }
            }, {
              '$project': {
                'studentId': 1, 
                'taskId': 1, 
                'facultyId': 1, 
                'isSubmitted': 1, 
                'createdAt': 1, 
                '_id': 1, 
                'rewardValue': 1, 
                'slotAccepted': 1, 
                'isRejected': 1, 
                'proof': 1,
                'updatedAt': 1, 
                '__v': 1, 
                
                'taskDetails.name': 1, 
                'taskDetails.description': 1, 
                'taskDetails.category': 1, 
                'taskDetails.slot': 1, 
                'taskDetails.branch': 1, 

                'studentDetails.name': 1, 
                'studentDetails.rollNo': 1, 
                'studentDetails.branch': 1,
                'studentDetails.collEmail': 1,
                'studentDetails.phoneNumber': 1,
              }
            }
          ];
      
          const pendingTaskListDetails = await AcceptedTask.aggregate(pipeline).exec();
          if (!pendingTaskListDetails || pendingTaskListDetails.length === 0) {
            return res.status(404).json(new ApiResponse(404, null, "No pending tasks for approval found for the faculty"));
        }

        return res.status(200).json(
            new ApiResponse(200, pendingTaskListDetails, "Fetched all pending tasks for approval of the faculty successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while fetching tasks for approval")
    }
})

const rejectTask = asyncHandler(async (req, res) => {
    try {
        const { taskId,studentId, reason } = req.body
        if(!reason){
            throw new ApiError(400, 'Reason is required to reject the task');
        }
        const taskToBeRejected = await AcceptedTask.findOneAndUpdate(
            { taskId: taskId, studentId: studentId },
            { isRejected: true, isSubmitted: false, reason: reason },
            { new: true }

        )
        if (!taskToBeRejected) {
            throw new ApiError(500, 'Something went wrong while rejecting the task');
        }

        return res.status(200).json(new ApiResponse(200, taskToBeRejected, "Task Rejected successfuly"));
    } catch (error) {
        throw new ApiError(500, error.message || "Task could not be rejected due to some error")
    }
});

const approveTask = asyncHandler(async (req, res) => {
    try {
        const { taskId,studentId,reason } = req.body
    
        if(!reason){
            throw new ApiError(400, 'Reason is required to accept the task');
        }
        
        const completedTask = await AcceptedTask.findOne({ taskId: taskId, studentId: studentId });
        if (!completedTask) {
            throw new ApiError(404, 'Task not found');
        }

        const studentDetails = await Student.findOne({_id : studentId})
        const transactionId = await transfer(completedTask.rewardValue, studentDetails.walletAdd)

        const insertedInCompletedTask = await CompletedTasks.create({
            studentId: completedTask.studentId,
            taskId: completedTask.taskId,
            rewardValue: completedTask.rewardValue,
            facultyId: completedTask.facultyId,
            slotAccepted: completedTask.slotAccepted,
            proof: completedTask.proof,
            reason: reason,
            transactionId: transactionId
        });

    await AcceptedTask.deleteOne({ studentId: studentId, taskId: taskId });

        return res.status(200).json(new ApiResponse(200, insertedInCompletedTask, "Task Approved successfully...Reward has been credited in the student's wallet!"));
    } catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message || 'Internal server error' });
    }
});

async function transfer(value,toaddress) {
    try {
        const web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));
        const weivalue = web3.utils.toWei(value, 'ether');
        const returnedvalue = await sendSigned()
        async function sendSigned() {
            const fromAddress = process.env.ADMIN_WALLET_ADDRESS;
            const toAddress = toaddress;
        
            const tx = {
              from: fromAddress,
              to: toAddress,
              value: weivalue,
              gas: 21000,
              gasPrice: web3.utils.toWei('10', 'gwei'),
              nonce: await web3.eth.getTransactionCount(fromAddress),
            };

    // Sign the transaction with the private key
    const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.ADMIN_WALLET_PRIVATE_KEY);

    // Send the signed transaction to the network
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return receipt.transactionHash
    }  
    return returnedvalue
      
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while calculating reward")
    }
  }

const getApprovedTasksOfFaculty = asyncHandler(async (req, res) => {
   try {
     const facultyId = req.faculty?._id
    //  const taskList = await CompletedTasks.find({ facultyId: facultyId })
    //  if (!taskList) {
    //      throw new ApiError(404, 'No tasks to show');
    //  }
    //  const taskListDetails = await Promise.all(
    //      taskList.map(async (CompletedTasks) => {
    //          const task = await Task.findById(CompletedTasks.taskId);
    //          const studentDetails = await Student.findById(CompletedTasks.studentId);
    //          const taskDetails = {
    //              _id: task._id,
    //              taskName: task.name,
    //              taskDescription: task.description,
    //              taskBranch: task.branch,
    //              taskCategory: task.category,
    //              taskRewardValue: task.rewardValue,
    //              studentName: studentDetails.name,
    //              studentRollno: studentDetails.rollNo,
    //              studentBranch: studentDetails.branch,
    //              acceptedOn: taskList.createdAt
    //          };
 
    //          return taskDetails;
    //      })
    //  );
    //  return res.status(200).json(
    //      new ApiResponse(200, taskListDetails, "Fetched All tasks for faculty successfully")
    //  )
    const pipeline = [
        {
          '$match': { 
            'facultyId': facultyId
          }
        }, {
          '$lookup': {
            'from': 'tasks', 
            'localField': 'taskId', 
            'foreignField': '_id', 
            'as': 'taskDetails'
          }
        }, {
          '$addFields': {
            'taskDetails': {
              '$arrayElemAt': [
                '$taskDetails', 0
              ]
            }
          }
        }, {
            '$lookup': {
              'from': 'students', 
              'localField': 'studentId', 
              'foreignField': '_id', 
              'as': 'studentDetails'
            }
          }, {
            '$addFields': {
              'studentDetails': {
                '$arrayElemAt': [
                  '$studentDetails', 0
                ]
              }
            }
          }, {
            '$project': {
              'studentId': 1, 
              'taskId': 1, 
              'facultyId': 1, 
              'isSubmitted': 1,
              'reason': 1,
              'createdAt': 1, 
              '_id': 1, 
              'rewardValue': 1, 
              'slotAccepted': 1, 
              'proof': 1,
              'transactionId': 1,
              'updatedAt': 1, 
              '__v': 1, 

              'taskDetails.name': 1, 
              'taskDetails.description': 1, 
              'taskDetails.category': 1, 
              'taskDetails.slot': 1, 
              'taskDetails.branch': 1,

              'studentDetails.name': 1, 
              'studentDetails.rollNo': 1, 
              'studentDetails.branch': 1,
              'studentDetails.collEmail': 1,
              'studentDetails.phoneNumber': 1,
            }
          }
      ];
  
      const ApprovedTaskListDetails = await CompletedTasks.aggregate(pipeline).exec();
      if (!ApprovedTaskListDetails || ApprovedTaskListDetails.length === 0) {
        throw new ApiError(500, "No approved tasks found for this faculty")
    }

    return res.status(200).json(
        new ApiResponse(200, ApprovedTaskListDetails, "Fetched all rejected tasks for the student successfully")
    );

   } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong while fetching tasks for approved by faculty")
   }
})

const getTasksRejectedByFaculty = asyncHandler(async (req, res) => {
   try {
     const facultyId = req.faculty?._id
    //  const taskList = await AcceptedTask.find({facultyId: facultyId, isRejected: true})
    //  if (!taskList) {
    //      throw new ApiError(404, 'No tasks to show');
    //  }
    //  const taskListDetails = await Promise.all(
    //      taskList.map(async (acceptedTask) => {
    //          const task = await Task.findById(acceptedTask.taskId);
    //          const studentDetails = await Student.findById(acceptedTask.studentId);
    //          const taskDetails = {
    //              _id: task._id,
    //              taskName: task.name,
    //              taskDescription: task.description,
    //              taskBranch: task.branch,
    //              taskCategory: task.category,
    //              taskRewardValue: acceptedTask.rewardValue,
    //              studentName: studentDetails.name,
    //              studentRollno: studentDetails.rollNo,
    //              studentBranch: studentDetails.branch,
    //              submittedOn: acceptedTask.updatedAt
    //          };
 
    //          return taskDetails;
    //      })
    //  );
    //  return res.status(200).json(
    //      new ApiResponse(200, taskListDetails, "Fetched All tasks Rejected by faculty successfully")
    //  )
    const pipeline = [
        {
          '$match': { 
            'isRejected': true,
            'facultyId': facultyId
          }
        }, {
          '$lookup': {
            'from': 'tasks', 
            'localField': 'taskId', 
            'foreignField': '_id', 
            'as': 'taskDetails'
          }
        }, {
          '$addFields': {
            'taskDetails': {
              '$arrayElemAt': [
                '$taskDetails', 0
              ]
            }
          }
        }, {
            '$lookup': {
              'from': 'students', 
              'localField': 'studentId', 
              'foreignField': '_id', 
              'as': 'studentDetails'
            }
          }, {
            '$addFields': {
              'studentDetails': {
                '$arrayElemAt': [
                  '$studentDetails', 0
                ]
              }
            }
          }, {
            '$project': {
              'studentId': 1, 
              'taskId': 1, 
              'facultyId': 1, 
              'isSubmitted': 1,
              'reason': 1,
              'createdAt': 1, 
              '_id': 1, 
              'rewardValue': 1, 
              'slotAccepted': 1, 
              'isRejected': 1, 
              'proof': 1,
              'updatedAt': 1, 
              '__v': 1, 

              'taskDetails.name': 1, 
              'taskDetails.description': 1, 
              'taskDetails.category': 1, 
              'taskDetails.slot': 1, 
              'taskDetails.branch': 1,

              'studentDetails.name': 1, 
              'studentDetails.rollNo': 1, 
              'studentDetails.branch': 1,
              'studentDetails.collEmail': 1,
              'studentDetails.phoneNumber': 1,
            }
          }
      ];
  
      const rejectedTaskListDetails = await AcceptedTask.aggregate(pipeline).exec();
      if (!rejectedTaskListDetails || rejectedTaskListDetails.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No rejected tasks found for this student"));
    }

    return res.status(200).json(
        new ApiResponse(200, rejectedTaskListDetails, "Fetched all rejected tasks for the student successfully")
    );
   } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong while fetching tasks rejected by faculty")
   }
})

export {
    registerFaculty,
    loginFaculty,
    logoutFaculty,
    refreshAccessTokenFaculty,
    changeCurrentPassword,
    addTask,
    getCurrentFaculty,
    updateAccountDetails,
    getSubmittedTasksOfFaculty,
    getTasksForApprovalOfFaculty,
    rejectTask,
    approveTask,
    getApprovedTasksOfFaculty,
    getTasksRejectedByFaculty
 }