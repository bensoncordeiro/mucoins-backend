import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Student } from "../models/student.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log("collEmail: ", collEmail);

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


export {
    registerStudent,
    loginStudent,
    logoutStudent
 }
