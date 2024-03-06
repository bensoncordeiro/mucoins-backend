import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { Task } from "../models/task.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Variable } from "../models/admin.model.js";
import jwt from "jsonwebtoken";


const addTask = asyncHandler(async (req, res) => {
    const { name, description, branch, hours, category, difficulty, slot } = req.body
    const incomingAccessToken = req.cookies.accessToken

    if (!incomingAccessToken) {
        throw new ApiError(401, "Faculty not logged in")
    }

    const decodedToken = jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_SECRET)

    const facultyName = decodedToken?._id

    if (!facultyName) {
        throw new ApiError(401, "Invalid Access token")
    }

    // Check if any required field is empty
    if (![name, description, hours, category, difficulty, slot].every(field => typeof field === 'string' && field.trim() !== "")) {
        throw new ApiError(400, "All fields are required")
    }

    // Validate branch field if it's an array
    if (!Array.isArray(branch) || branch.length === 0) {
        throw new ApiError(400, "At least one branch must be selected")
    }

    // Validate each branch in the array
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
        facultyName,
        slot
    })

    return res.status(201).json(
        new ApiResponse(200, task, "Task added successfully")
    )
})

const getTasksForStudent = asyncHandler( async (req, res) => {
    const incomingAccessToken = req.cookies.accessToken

    if (!incomingAccessToken) {
        throw new ApiError(401, "Student not logged in")
    }

    const decodedToken = jwt.verify(
        incomingAccessToken,
        process.env.ACCESS_TOKEN_SECRET
    )
    

    const studentBranch = decodedToken?.branch

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
            slot: task.slot,
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

const getSubmittedTasksOfFaculty = asyncHandler(async (req, res) => {
    const incomingAccessToken = req.cookies.accessToken

    if (!incomingAccessToken) {
        throw new ApiError(401, "Faculty not logged in")
    }

    const decodedToken = jwt.verify(
        incomingAccessToken,
        process.env.ACCESS_TOKEN_SECRET
 )

    const facultyName = decodedToken?._id

    if (!facultyName) {
        throw new ApiError(401, "Invalid Access token")
    }

    const taskList = await Task.find({facultyName})

    return res.status(201).json(
        new ApiResponse(200, taskList, "Fetched All tasks for faculty successfully")
    )
})

export {
    addTask,
    getTasksForStudent,
    getSubmittedTasksOfFaculty
 }
