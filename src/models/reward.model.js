import mongoose, {Schema} from "mongoose"

const RewardSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true,
    },

    cost: {
        type: Number,
        required: true,
    },

    slot: {
        type: Number,
        required: true,
    },

    slotsLeft: {
        type: Number,
        required: true
    },

    adminId: {
        type: Schema.Types.ObjectId,
        ref: "Adminuser",
        required: true
    },

},
{timestamps: true})

export const Reward = mongoose.model("Reward", RewardSchema)

const AcceptedRewardSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    
    rewardId: {
        type: Schema.Types.ObjectId,
        ref: "Reward",
        required: true
    },

    slotAccepted: {
        type: Number,
        required: true,
    },

    TransactionId: {
        type: String,
        required: true
    },

},
{timestamps: true})

export const AcceptedReward = mongoose.model("AcceptedReward", AcceptedRewardSchema)