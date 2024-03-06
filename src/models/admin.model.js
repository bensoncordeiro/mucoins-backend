import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const adminVarSchema = new Schema({
    baseMul: {
        type: Number,
        required: true,
    },
},
{timestamps: true})

export const Variable = mongoose.model("Variable", adminVarSchema)

const adminUserSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
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

adminUserSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

adminUserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

adminUserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
adminUserSchema.methods.generateRefreshToken = function(){
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




export const Adminuser = mongoose.model("Adminuser", adminUserSchema)