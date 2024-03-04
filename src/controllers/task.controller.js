import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Task } from "../models/task.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const addTask = asyncHandler( async (req, res) => {
    
    const {name, description, branch, hours, category,  difficulty,slot } = req.body
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

    if (
        [name, description, branch, hours, category,  difficulty, facultyName, slot].some((field) =>
        field?.trim() === "")
    ){
         throw new ApiError(400, "All fields are required")
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


    const taskList = await Task.find({branch: studentBranch});


    return res.status(201).json(
        new ApiResponse(200, taskList, "Fetched All tasks for student successfully")
    )

})

export {
    addTask,
    getTasksForStudent
 }
