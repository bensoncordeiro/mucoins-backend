import mongoose, {Schema} from "mongoose";

const adminVarSchema = new Schema({
    baseMul: {
        type: Number,
        required: true,
    },
},
{timestamps: true})



export const Variable = mongoose.model("Variable", adminVarSchema)