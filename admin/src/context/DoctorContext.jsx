import { createContext } from "react";
import { useState } from "react";
import axios from 'axios'
import { toast } from "react-toastify";
import { set } from "mongoose";
import Swal from "sweetalert2";

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')

    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const getAppointments = async () => {

        try {
            const { data } = await axios.get(backendUrl + 'api/doctor/appointments', { headers: { dToken } })

            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const completeAppointment = async (appointmentId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You are about to mark this appointment as completed.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, complete it!",
            cancelButtonText: "No, keep pending!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await axios.post(`${backendUrl}api/doctor/complete-appointment`, { appointmentId }, { headers: { dToken } });
    
                    if (data.success) {
                        Swal.fire("Completed!", "The appointment has been marked as completed.", "success");
                        getAppointments();
                    } else {
                        Swal.fire("Error!", data.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error!", "Something went wrong. Please try again.", "error");
                }
            }
        });
    };
    
    const cancelAppointment = async (appointmentId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You are about to cancel this appointment.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, cancel it!",
            cancelButtonText: "No, don't cancel!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await axios.post(`${backendUrl}api/doctor/cancel-appointment`, { appointmentId }, { headers: { dToken } });
    
                    if (data.success) {
                        Swal.fire("Cancelled!", "The appointment has been cancelled.", "success");
                        getAppointments();
                    } else {
                        Swal.fire("Error!", data.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error!", "Something went wrong. Please try again.", "error");
                }
            }
        });
    };

    const getDashData = async () => {

        try {

            const { data } = await axios.get(backendUrl + 'api/doctor/dashboard', { headers: { dToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {

        try {
            
            const { data } = await axios.get(backendUrl + 'api/doctor/profile', { headers: { dToken } })

            if (data.success) {
                setProfileData(data.profileData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value = {
        dToken,
        setDToken,
        backendUrl,
        appointments, setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,setDashData,
        getDashData,
        profileData, setProfileData,
        getProfileData

    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider