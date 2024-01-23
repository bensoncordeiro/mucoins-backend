import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        const connection_instance = await mongoose.connect(process.env.MONGOURL,{});
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("MongoDB error ", error);
        process.exit(1);
    }
}

export default connectDB;