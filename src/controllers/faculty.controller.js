import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Faculty } from "../models/faculty.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Task } from "../models/task.model.js"
import { Web3 } from 'web3';
import fs from 'fs';
import path from 'path';
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
    const taskList = await Task.find({ facultyName: facultyId })
    return res.status(200).json(
        new ApiResponse(200, taskList, "Fetched All tasks for faculty successfully")
    )
})


//await transfer(5,"0x3FDA6231C2e5E1A3D772E66620a5aAba88204CDa")
async function transfer(value,toaddress) {
    try {
        const web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));
        const block = await web3.eth.getBlockNumber();

        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
      
        let balance1, balance2;
        //The initial balances of the accounts should be 100 Eth (10^18 wei)
        balance1 = await web3.eth.getBalance(accounts[0]);
        balance2 = await web3.eth.getBalance(toaddress);
      
        console.log(balance1, balance2);
    
        //create a transaction sending 1 Ether from account 0 to account 1
        const transaction = {
          from: accounts[0],
          to: toaddress,
          // value should be passed in wei. For easier use and to avoid mistakes,
          //	we utilize the auxiliary `toWei` function:
          value: web3.utils.toWei(value, 'ether'),
        };
      
        //send the actual transaction
        const transactionHash = await web3.eth.sendTransaction(transaction);
        console.log('transactionHash', transactionHash);
      
        balance1 = await web3.eth.getBalance(accounts[0]);
        balance2 = await web3.eth.getBalance(toaddress);
      
        // see the updated balances
        console.log(balance1, balance2);
      
        // irrelevant with the actual transaction, just to know the gasPrice
        const gasPrice = await web3.eth.getGasPrice();
        console.log(gasPrice);

    } catch (error) {
        throw new ApiError(500, "Something went wrong while calculating reward")
    }
  }


export {
    registerFaculty,
    loginFaculty,
    logoutFaculty,
    refreshAccessTokenFaculty,
    changeCurrentPassword,
    getCurrentFaculty,
    updateAccountDetails,
    getSubmittedTasksOfFaculty
 }