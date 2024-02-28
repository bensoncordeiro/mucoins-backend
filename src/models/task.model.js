import mongoose, {Schema} from "mongoose";

const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    branch: [
        {
        type: String,
        required: true,
        lowercase: true
        }
    ],
    
    hours: {
        type: Number,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    difficulty: {
        type: Number,
        required: true,
    },

    facultyName: {
        type: Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
    },

    slot: {
        type: Number,
        required: true,
    },


},
{timestamps: true})



export const Task = mongoose.model("Task", taskSchema)