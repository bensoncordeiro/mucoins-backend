import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    rollNo: {
        type: Number,
        required: true,
        unique: true,
        trim: true, 
        index: true
    },

    branch: {
        type: String,
        required: true,
        lowercase: true
    },

    collEmail: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true
    },

    personalEmail: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true 
    },

    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    walletAdd: {
        type: String,
        required: true,
        unique: true,
        trim: true 
    },

    password: {
        type: String,
        required: [true, 'Password is required']
    },
    
    refreshToken: {
        type: String
    }

},
{timestamps: true})

studentSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

studentSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

studentSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            branch: this.branch,
            rollNo: this.rollNo,
            walletAdd: this.walletAdd,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
studentSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const Student = mongoose.model("Student", studentSchema)