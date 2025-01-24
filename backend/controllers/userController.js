import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import axios from 'axios'
import PDFDocument from 'pdfkit'

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
            res.json({ success: true, token ,message:"Login Successfull"})
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

// API to generate bill
const generateBill = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Fetch appointment with populated data
        const appointment = await appointmentModel.findById(appointmentId)
            .populate({
                path: 'docData',
                select: 'name speciality'
            })
            .populate({
                path: 'userData',
                select: 'name email phone'
            });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (!appointment.userData || !appointment.docData) {
            return res.status(400).json({
                success: false,
                message: 'Required appointment data is missing'
            });
        }

        // Format dates
        const billDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const slotDateFormat = (slotDate) => {
            if (!slotDate || slotDate.split('_').length !== 3) return 'Invalid Date';
            
            const [year, monthIndex, day] = slotDate.split('_');
            if (monthIndex < 0 || monthIndex > 11) return 'Invalid Month';

            return `${year} ${months[monthIndex]} ${day}`;
        };

        const appointmentDate = appointment.slotDate
            ? new Date(appointment.slotDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'Invalid Date';

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bill-${appointmentId}.pdf`);

        // Pipe PDF to response
        doc.pipe(res);

        // Add header text
        doc.fontSize(20).text('Arogya Nepal', 110, 50);
        doc.fontSize(14).text('Medical Bill', 110, 75);

        // Add horizontal line
        doc.moveTo(50, 100).lineTo(550, 100).stroke();

        // Bill and patient details
        doc.fontSize(10);
        const tableTop = 120;
        const leftColumn = 50;
        const middleColumn = 300;

        // Bill details (left side)
        doc.text('Bill Details:', leftColumn, tableTop);
        doc.text(`Bill No: ${appointmentId}`, leftColumn, tableTop + 20);
        doc.text(`Bill Date: ${billDate}`, leftColumn, tableTop + 35);

        // Patient details (right side)
        doc.text('Patient Details:', middleColumn, tableTop);
        doc.text(`Name: ${appointment.userData.name}`, middleColumn, tableTop + 20);
        doc.text(`Email: ${appointment.userData.email}`, middleColumn, tableTop + 35);
        doc.text(`Phone: ${appointment.userData.phone}`, middleColumn, tableTop + 50);

        // Add horizontal line
        doc.moveTo(50, tableTop + 80).lineTo(550, tableTop + 80).stroke();

        // Doctor and appointment details
        const serviceTableTop = tableTop + 100;

        // Table headers
        doc.font('Helvetica-Bold').text('Doctor Details', leftColumn, serviceTableTop);
        doc.text('Appointment Details', middleColumn, serviceTableTop);
        doc.font('Helvetica');

        // Table content
        doc.text(`Doctor: Dr. ${appointment.docData.name.replace('Dr. ', '')}`, leftColumn, serviceTableTop + 20);
        doc.text(`Speciality: ${appointment.docData.speciality}`, leftColumn, serviceTableTop + 35);
        doc.text(`Date: ${slotDateFormat(appointment.slotDate)}`, middleColumn, serviceTableTop + 20);
        doc.text(`Time: ${appointment.slotTime || 'N/A'}`, middleColumn, serviceTableTop + 35);

        // Add horizontal line
        doc.moveTo(50, serviceTableTop + 60).lineTo(550, serviceTableTop + 60).stroke();

        // Payment details
        const paymentTableTop = serviceTableTop + 80;
        doc.font('Helvetica-Bold').text('Payment Details', leftColumn, paymentTableTop);
        doc.font('Helvetica');

        // Payment details table
        const paymentTable = {
            headers: ['Description', 'Amount'],
            rows: [
                ['Consultation Fee:', `NPR ${appointment.amount}`],
                ['Payment Status:', appointment.payment ? 'Paid' : 'Pending'],
                ['Payment Method:', 'Khalti'],
                ['Transaction Date:', billDate]
            ]
        };

        // Draw payment table
        let yPosition = paymentTableTop + 20;
        paymentTable.rows.forEach(row => {
            doc.text(row[0], leftColumn, yPosition);
            doc.text(row[1], leftColumn + 200, yPosition);
            yPosition += 15;
        });

        // Footer
        doc.fontSize(10)
            .text('Thank you for choosing Arogya Nepal', 50, doc.page.height - 100, { align: 'center' })
            .text('This is a computer generated bill', { align: 'center', italics: true });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate bill: ' + error.message
        });
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, initiateKhaltiPayment, verifyKhaltiPayment, generateBill };