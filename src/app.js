import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes
import facultyRouter from './routes/faculty.routes.js'
import studentRouter from './routes/student.routes.js'
import taskRouter from './routes/task.routes.js'
import adminRouter from './routes/admin.routes.js'


//routes declaration 
app.use("/api/v1/faculty",facultyRouter)
app.use("/api/v1/student",studentRouter)
app.use("/api/v1/task",taskRouter)
app.use("/api/v1/admin",adminRouter)

export { app }