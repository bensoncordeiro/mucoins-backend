import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const facultySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
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

    phoneNumber: {
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

facultySchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

facultySchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

facultySchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            collEmail: this.collEmail,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
facultySchema.methods.generateRefreshToken = function(){
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


export const Faculty = mongoose.model("Faculty", facultySchema)