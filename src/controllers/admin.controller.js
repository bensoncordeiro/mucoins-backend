import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { Variable, Adminuser } from "../models/admin.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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


const generateAccessAndRefereshTokens = async(adminId) =>{
    try {
        const admin = await Adminuser.findById(adminId)
        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken
        await admin.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const registerAdmin = asyncHandler( async (req, res) => {
    
    const {name, email, password} = req.body
    

    if (
        [name, email, password].some((field) =>
        field?.trim() === "")
    ){
         throw new ApiError(400, "All fields are required")
    }

    const existedAdmin = await Adminuser.findOne({
        $or: [{ email }]
    })

    if (existedAdmin){
        throw new ApiError(409, "Admin with email already exists")
    }

    const admin = await Adminuser.create({
        name,
        email,
        password,
    
    })

    const createdAdmin = await Adminuser.findById(admin._id).select(
        "-password -refreshToken"
    )

    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering the Admin")
    }

    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin registered successfully")
    )
})



const loginAdmin = asyncHandler(async (req, res) =>{
    
    const {email,password} = req.body

    if (!email) {
        throw new ApiError(400, "email is required")
    }
    

    const admin = await Adminuser.findOne({
        $or: [{email}]
    })

    if (!admin) {
        throw new ApiError(404, "Admin does not exist")
    }

   const isPasswordValid = await admin.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid admin credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(admin._id)

    const loggedInAdmin = await Adminuser.findById(admin._id).select("-password -refreshToken")

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
                admin: loggedInAdmin, accessToken, refreshToken
            },
            "Admin logged In Successfully"
        )
    )

})


const logoutAdmin = asyncHandler(async(req, res) => {
    await Adminuser.findByIdAndUpdate(
        req.admin._id,
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
    .json(new ApiResponse(200, {}, "Admin logged Out"))
})



const refreshAccessTokenAdmin = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const admin = await Adminuser.findById(decodedToken?._id)
    
        if (!admin) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== admin?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(admin._id)
    
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

    

    const admin = await Adminuser.findById(req.admin?._id)
    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    admin.password = newPassword
    await admin.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentAdmin = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.admin,
        "admin fetched successfully"
    ))
})


const updateAccountDetails = asyncHandler(async(req, res) => {
    const {name, email} = req.body

    if (!name || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const admin = await Adminuser.findByIdAndUpdate(
        req.admin?._id,
        {
            $set: {
                name,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, admin, "Account details updated successfully"))
});

const addReward = asyncHandler(async (req, res) => {
    const { name,description,category,cost,slot } = req.body

    if (![name, description, hours, category, difficulty, slot].every(field => typeof field === 'string' && field.trim() !== "")) {
        throw new ApiError(400, "All fields are required")
    }

    if (!Array.isArray(branch) || branch.length === 0) {
        throw new ApiError(400, "At least one branch must be selected")
    }

    if (branch.some(branchItem => typeof branchItem !== 'string' || branchItem.trim() === '')) {
        throw new ApiError(400, "Branch names must be non-empty strings")
    }

    const reward = await Task.create({
        name,
        description,
        category,
        cost,
        slot,
        slotsLeft: slot,
        adminId: req.admin?._id
    })

    return res.status(201).json(
        new ApiResponse(200, reward, "Reward added successfully")
    )
})


export {
    setBaseMul,
    updateBaseMul,
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessTokenAdmin,
    changeCurrentPassword,
    getCurrentAdmin,
    updateAccountDetails,
    addReward
 }