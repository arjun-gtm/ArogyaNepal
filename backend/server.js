import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import conncetCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
conncetCloudinary()

// Middlewares
app.use(express.json())
app.use(cors())

// Api endpoints
app.use('/api/admin',adminRouter)
//localhost:4000/api/admin/add-doctor
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

app.get('/', (req,res)=>{
    res.send('Api working')
})

app.listen(port, ()=> console.log("Server Started", port))