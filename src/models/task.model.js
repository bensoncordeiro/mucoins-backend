import mongoose, {Schema} from "mongoose"

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

    slotsLeft: {
        type: Number,
        required: true
    }

},
{timestamps: true})


export const Task = mongoose.model("Task", taskSchema)


const AcceptedTaskSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    
    taskId: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },

    rewardValue: {
        type: Number,
        required: true
    },
    
    facultyId: {
        type: Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
    },

    slotAccepted: {
        type: Number,
        required: true,
    },


},
{timestamps: true})


export const AcceptedTask = mongoose.model("AcceptedTask", AcceptedTaskSchema)



const PendingApprovalTasksSchema = new Schema({
    taskId: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    
    facultyId: {
        type: Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
    },

    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    proof: {
        type: String, 
        required: true
    }
},
{ timestamps: true });

export const PendingApprovalTasks = mongoose.model("PendingApprovalTasks", PendingApprovalTasksSchema)