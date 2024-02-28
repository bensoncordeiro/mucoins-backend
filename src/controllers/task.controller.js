import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Task } from "../models/task.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addTask = asyncHandler( async (req, res) => {
    
    const {name, description, branch, hours, category,  difficulty, facultyName, slot } = req.body


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

export {
    addTask
 }
