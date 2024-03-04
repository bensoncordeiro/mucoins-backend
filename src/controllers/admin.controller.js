import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { Variable } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const setBaseMul = asyncHandler( async (req, res) => {
    
    const { baseMul } = req.body
   
    if (
        [baseMul].some((field) =>
        field?.trim() === "")
    ){
         throw new ApiError(400, "Base Multiplier is not provided")
    }


    const storedBaseMul = await Variable.create({
        baseMul
        
    })
    console.log(storedBaseMul)

    const checkStoredBaseMul = await Variable.findById(storedBaseMul._id)

    if (!checkStoredBaseMul) {
        throw new ApiError(500, "Something went wrong while stroring the value")
    }

    return res.status(201).json(
        new ApiResponse(200, checkStoredBaseMul, "Value set Successfully")
    )
})

const updateBaseMul = asyncHandler(async(req, res) => {
    const { baseMul } = req.body

    const newBaseMul = await Variable.findByIdAndUpdate(
        process.env.BASE_MULTIPLIER_ID,
        {
            $set: {
                baseMul: baseMul
            }
        },
        {new: true}
        
    )


    if (!newBaseMul) {
        throw new ApiError(400, "Invalid Base Mutiplier")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, newBaseMul, "Base Multiplier updated successfully"))
})

export {
    setBaseMul,
    updateBaseMul
 }