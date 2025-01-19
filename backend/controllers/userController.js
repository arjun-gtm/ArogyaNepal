import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import axios from 'axios'
// import Stripe from 'stripe'
// import stripeLib from 'stripe'


//API to register user

const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details!" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid Email!" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be atleast 8 characters!" })
        }

        // Hashing the user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//API for user login

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User not found!" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credentials!" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data

const getProfile = async (req, res) => {

    try {

        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile data

const updateProfile = async (req, res) => {
    try {
      const { userId, name, phone, address, dob, gender } = req.body;
      const imageFile = req.file;
  
      if (!name || !phone || !dob || !gender) {
        return res.json({ success: false, message: "Missing Details!" });
      }
  
      await userModel.findByIdAndUpdate(userId, {
        name,
        phone,
        address: JSON.parse(address),
        dob,
        gender,
      });
  
      if (imageFile) {
        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        const imageUrl = imageUpload.secure_url;
  
        await userModel.findByIdAndUpdate(userId, { image: imageUrl });
      }
  
      res.json({ success: true, message: "Profile Updated" });
      
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  }  

// API to book appointment

const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor is not available!" })
        }

        let slots_booked = docData.slots_booked

        // Check if slot is already booked
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot is already booked!" })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // Save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: "Appointment Booked" })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get user appointments for frontend my-appointments page

const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to cancel appointment
const cancelAppointment = async (req, res) => {

    try {

        const { userId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        //Verifying user
        if (appointmentData.userId != userId) {
            return res.json({ success: false, message: "Unauthorized" })
        }

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

const initiateKhaltiPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Invalid Appointment" });
        }

        // Get user data from the database
        const userData = await userModel.findById(appointmentData.userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        // Store the appointmentId in a custom field that Khalti will return
        const payload = {
            return_url: `${process.env.FRONTEND_URL}/my-appointments`,
            website_url: process.env.FRONTEND_URL,
            amount: appointmentData.amount * 100,
            purchase_order_id: appointmentId.toString(),
            purchase_order_name: `Appointment Payment - ${appointmentId}`,
            customer_info: {
                name: userData.name || 'Customer',
                email: userData.email || '',
                phone: userData.phone || ''
            },
            metadata: {
                appointmentId: appointmentId.toString()
            }
        };

        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/initiate/',
            payload,
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Include appointmentId in the success response
        res.json({ 
            success: true, 
            paymentUrl: `https://test-pay.khalti.com/?pidx=${response.data.pidx}`,
            appointmentId: appointmentId.toString()
        });

    } catch (error) {
        res.json({ 
            success: false, 
            message: error.response?.data?.message || error.message 
        });
    }
};

const verifyKhaltiPayment = async (req, res) => {
    try {
        const { pidx, appointmentId } = req.body;

        // First verify the appointment exists
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({
                success: false,
                message: "Appointment not found in database"
            });
        }

        // Verify payment with Khalti
        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Khalti verification response:', response.data);

        if (response.data.status === 'Completed') {

            // Update appointment using the appointmentId
            const result = await appointmentModel.findByIdAndUpdate(
                appointmentId,
                { payment: true },
                { new: true }
            );

            if (!result) {
                return res.json({
                    success: false,
                    message: "Failed to update appointment payment status"
                });
            }

            return res.json({
                success: true,
                message: "Payment successful and appointment updated"
            });
        }

        return res.json({
            success: false,
            message: `Payment status: ${response.data.status}`
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, initiateKhaltiPayment, verifyKhaltiPayment }