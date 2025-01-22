import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, initiateKhaltiPayment, verifyKhaltiPayment, generateBill } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)

userRouter.post('/payment-khalti', authUser, initiateKhaltiPayment)
userRouter.post('/verify-khalti', authUser, verifyKhaltiPayment)

userRouter.get('/generate-bill/:appointmentId', authUser, generateBill)

export default userRouter

