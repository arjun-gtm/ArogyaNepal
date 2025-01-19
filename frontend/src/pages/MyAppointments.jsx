import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import KhaltiCheckout from "khalti-checkout-web"

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])

  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + ' ' + months[Number(dateArray[1])] + ' ' + dateArray[2]
  }

  const navigate = useNavigate()

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const appointmentKhalti = async (appointmentId) => {
    try {
        const { data } = await axios.post(
            backendUrl + '/api/user/payment-khalti', 
            { appointmentId }, 
            { headers: { token } }
        );
        
        if (data.success) {
            // Store appointmentId in sessionStorage
            sessionStorage.setItem('currentPaymentAppointmentId', appointmentId);
            // Redirect to Khalti payment page
            window.location.href = data.paymentUrl;
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }
};

  //effect to handle Khalti payment verification
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pidx = queryParams.get('pidx');
    
    if (pidx) {
        const verifyPayment = async () => {
            try {
                // Get appointmentId from sessionStorage
                const appointmentId = sessionStorage.getItem('currentPaymentAppointmentId');
                
                if (!appointmentId) {
                    toast.error("Payment verification failed: Appointment ID not found");
                    return;
                }
                
                const { data } = await axios.post(
                    `${backendUrl}/api/user/verify-khalti`,
                    { pidx, appointmentId },
                    { headers: { token } }
                );

                if (data.success) {
                    toast.success("Payment successful!");
                    await getUserAppointments();
                } else {
                    toast.error(data.message || "Payment verification failed");
                }

                // Clear stored appointmentId
                sessionStorage.removeItem('currentPaymentAppointmentId');
                // Clear URL parameters
                window.history.replaceState({}, '', '/my-appointments');
            } catch (error) {
                toast.error(error.response?.data?.message || "Error verifying payment");
                sessionStorage.removeItem('currentPaymentAppointmentId');
                window.history.replaceState({}, '', '/my-appointments');
            }
        };

        verifyPayment();
    }
}, []);


  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My Appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b" key={index}>
            <div>
              <img className="w-32 bg-indigo-50 rounded-2xl" src={item.docData.image} alt="" />
            </div>
            <div className="flex-1 text-sm text-zinc-700">
              <p className="text-neutral-800 font-semibold">{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-800 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-sm mt-1">
                <span className="text-sm text-neutral-700 font-medium">Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && item.payment && !item.isCompleted && <button className="sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50">Paid</button>}

              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => { appointmentKhalti(item._id) }}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Pay with Khalti
                </button>
              )}

              {!item.cancelled && !item.isCompleted && <button onClick={() => { cancelAppointment(item._id) }} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">Cancel Appointment</button>}

              {item.cancelled && !item.isCompleted && <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">Appointment Cancelled</button>}

              {
                item.isCompleted && <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500"> Appointment Completed</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments
