import express from 'express';
import { addDoctor, allDoctors, loginAdmin, appointmenstsAdmin, appointmentCancel, adminDashboard, deleteAppointment, editDoctor, deleteDoctor, appliedDoctors,approveDoctor } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailability } from '../controllers/doctorController.js'

const adminRouter = express.Router();

adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/all-doctors', authAdmin, allDoctors);
adminRouter.post('/applied-doctors',authAdmin, appliedDoctors)
adminRouter.get('/appointments', authAdmin, appointmenstsAdmin);
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel);
adminRouter.get('/dashboard', authAdmin, adminDashboard);
adminRouter.post('/delete-appointment', authAdmin, deleteAppointment);
adminRouter.post('/edit-doctor', authAdmin, upload.single('image'), editDoctor);
adminRouter.post('/delete-doctor', authAdmin, deleteDoctor);
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.post('/approve-doctor',authAdmin,approveDoctor)


export default adminRouter;