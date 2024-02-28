import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Faculty } from "../models/faculty.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
        throw new ApiError(409, "user with name or email already exists")
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
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdFaculty, "Faculty registered successfully")
    )
})



const loginFaculty = asyncHandler(async (req, res) =>{
    
    const {collEmail,name, password} = req.body
    console.log(collEmail);

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
    throw new ApiError(401, "Invalid user credentials")
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


export {
    registerFaculty,
    loginFaculty,
    logoutFaculty,
 }