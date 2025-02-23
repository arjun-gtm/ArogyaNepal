import { createContext, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '');
    const [doctors, setDoctors] = useState([]);
    const [appliedDoctors, setAppliedDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Fetch all doctors
    const getAllDoctors = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}api/admin/all-doctors`, {}, { headers: { aToken } });
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch applied doctors (unapproved doctors)
    const getAppliedDoctors = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}api/admin/applied-doctors`, {}, { headers: { aToken } });
            if (data.success) {
                setAppliedDoctors(data.doctors.filter(doc => !doc.isApproved));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    //Approve applied doctors
    const approveDoctor = async (docId) => {
        Swal.fire({
          title: "Are you sure?",
          text: "You are about to approve this doctor. This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          cancelButtonText: "No, don't approve!",
          confirmButtonText: "Yes, approve it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const { data } = await axios.post(
                `${backendUrl}api/admin/approve-doctor`,
                { docId },
                { headers: { aToken: localStorage.getItem("aToken") } }
              );
      
              if (data.success) {
                Swal.fire("Approved!", "The doctor has been approved.", "success");
                getAppliedDoctors(); // Refresh the list of applied doctors
              } else {
                Swal.fire("Error!", data.message, "error");
              }
            } catch (error) {
              console.error("Error approving doctor:", error.response?.data || error.message);
              Swal.fire(
                "Error!",
                error.response?.data?.message || "Something went wrong. Please try again.",
                "error"
              );
            }
          }
        });
      };
    

    // Change doctor's availability
    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(`${backendUrl}api/admin/change-availability`, { docId }, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch all appointments
    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}api/admin/appointments`, { headers: { aToken } });
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Cancel an appointment
    const cancelAppointment = async (appointmentId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You are about to cancel this appointment.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonText: "No, don't cancel!",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, cancel it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await axios.post(`${backendUrl}api/admin/cancel-appointment`, { appointmentId }, { headers: { aToken } });

                    if (data.success) {
                        Swal.fire("Cancelled!", "The appointment has been cancelled.", "success");
                        getAllAppointments();
                    } else {
                        Swal.fire("Error!", data.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error!", "Something went wrong. Please try again.", "error");
                }
            }
        });
    };

    // Delete an appointment
    const deleteAppointment = async (appointmentId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            cancelButtonText: "No, don't delete!",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await axios.post(`${backendUrl}api/admin/delete-appointment`, 
                        { appointmentId }, 
                        { headers: { aToken } }
                    );

                    if (data.success) {
                        Swal.fire("Deleted!", "The appointment has been deleted.", "success");
                        setAppointments(prev => prev.filter(item => item._id !== appointmentId));
                    } else {
                        Swal.fire("Error!", data.message, "error");
                    }
                } catch (error) {
                    console.error("Error deleting appointment:", error.response?.data || error.message);
                    Swal.fire("Error!", error.response?.data?.message || "Something went wrong. Please try again.", "error");
                }
            }
        });
    };

    // Fetch dashboard data
    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}api/admin/dashboard`, { headers: { aToken } });

            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Edit Doctor
    const editDoctor = async (docId, updatedData) => {
        try {
            const formData = new FormData();
            formData.append('docId', docId);
            formData.append('name', updatedData.name);
            formData.append('email', updatedData.email);
            formData.append('speciality', updatedData.speciality);
            formData.append('degree', updatedData.degree);
            formData.append('experience', updatedData.experience);
            formData.append('about', updatedData.about);
            formData.append('fees', updatedData.fees);
            formData.append('address', JSON.stringify(updatedData.address));
            if (updatedData.image) {
                formData.append('image', updatedData.image);
            }

            const { data } = await axios.post(`${backendUrl}api/admin/edit-doctor`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    aToken: localStorage.getItem('aToken'),
                },
            });

            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error editing doctor:', error);
            toast.error(error.message);
        }
    };

    // Delete Doctor
    const deleteDoctor = async (docId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You are about to delete this doctor. This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            cancelButtonText: "No, don't delete!",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await axios.post(`${backendUrl}api/admin/delete-doctor`, { docId }, {
                        headers: { aToken: localStorage.getItem('aToken') },
                    });

                    if (data.success) {
                        Swal.fire("Deleted!", "The doctor has been deleted.", "success");
                        getAllDoctors();
                    } else {
                        Swal.fire("Error!", data.message, "error");
                    }
                } catch (error) {
                    console.error("Error deleting doctor:", error.response?.data || error.message);
                    Swal.fire("Error!", error.response?.data?.message || "Something went wrong. Please try again.", "error");
                }
            }
        });
    };

    // Reject Doctor
    const rejectDoctor = async (docId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You are about to reject this doctor. This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            cancelButtonText: "No, don't reject!",
            confirmButtonText: "Yes, reject it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await axios.post(`${backendUrl}api/admin/delete-doctor`, { docId }, {
                        headers: { aToken: localStorage.getItem('aToken') },
                    });

                    if (data.success) {
                        Swal.fire("Rejected!", "The doctor has been rejected.", "success");
                        getAllDoctors();
                    } else {
                        Swal.fire("Error!", data.message, "error");
                    }
                } catch (error) {
                    console.error("Error rejecting doctor:", error.response?.data || error.message);
                    Swal.fire("Error!", error.response?.data?.message || "Something went wrong. Please try again.", "error");
                }
            }
        });
    };

    const value = {
        aToken, setAToken,
        backendUrl, doctors, appliedDoctors,
        getAllDoctors, getAppliedDoctors,
        approveDoctor,
        changeAvailability,
        appointments, setAppointments,
        getAllAppointments,
        cancelAppointment,
        deleteAppointment,
        dashData, getDashData,
        editDoctor, deleteDoctor,
        rejectDoctor
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
