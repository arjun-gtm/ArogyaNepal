import validator from "validator";
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
 
// API for adding doctor
const addDoctor = async (req,res) => {

    try {

        const { name, email, password, speciality,degree, experience, about, fees, address } = req.body;
        const imageFile = req.file

        //Checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address ) {
            return res.json({success:false,message:"Missing Informations."})
        }

        //Validating email format
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Please enter a valid email address."})
        }

        //Validating the password
        if (password.length < 8) {
            return res.json({success:false,message:"Password must be greater than 8 characters."})
        }

        //Hasing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        //Uploading image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now(),
            isApproved: true
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success:true,message:"Doctor Added"})

        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

//API for admin login
const loginAdmin = async (req,res) => {

    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({ success: true, token ,message:"Login Successfull"})

        }
        else{
            res.json({success:false,message:"Invalid Credentials"})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

//API to get all doctors list for admin panel
const allDoctors = async (req,res) => {

    try {
        
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to get applied (unapproved) doctors list for admin panel
const appliedDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ isApproved: false }).select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all appointments list
const appointmenstsAdmin = async (req,res) => {

    try {
        
        const appointments = await appointmentModel.find({})
        res.json({success:true,appointments})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to cancel the appointment for admin
const appointmentCancel = async (req, res) => {

    try {

        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //Releasing doctor slots

        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: "Appointment Cancelled" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    
    try {
        
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors:doctors.length,
            appointments:appointments.length,
            patients:users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success:true,dashData})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete an appointment
const deleteAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        // Find and delete the appointment
        const deletedAppointment = await appointmentModel.findByIdAndDelete(appointmentId);

        if (!deletedAppointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        res.json({ success: true, message: "Appointment deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to edit doctor details
const editDoctor = async (req, res) => {
    try {
        const { docId, name, email, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // Check if all necessary fields are provided
        if (!docId || !name || !email || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Information." });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email address." });
        }

        let updateData = {
            name,
            email,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
        };

        // If a new image is uploaded, update the image URL
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = imageUpload.secure_url;
        }

        // Update the doctor's details in the database
        await doctorModel.findByIdAndUpdate(docId, updateData);

        res.json({ success: true, message: "Doctor details updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to delete a doctor
const deleteDoctor = async (req, res) => {
    try {
        const { docId } = req.body;

        // Find and delete the doctor
        const deletedDoctor = await doctorModel.findByIdAndDelete(docId);

        if (!deletedDoctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, message: "Doctor deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//API to approve applied doctors
const approveDoctor = async (req, res) => {
    try {
        const { docId } = req.body;

        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        await doctorModel.findByIdAndUpdate(docId, { isApproved: true });

        res.json({ success: true, message: "Doctor Approved Successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmenstsAdmin, appointmentCancel, adminDashboard, deleteAppointment, editDoctor, deleteDoctor, appliedDoctors,approveDoctor }