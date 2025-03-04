import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const Navbar = () => {

    const {aToken,setAToken} = useContext(AdminContext)
    const {dToken,setDToken} = useContext(DoctorContext)

    const navigate = useNavigate()

    const logout = () => {
      Swal.fire({
          title: "Are you sure?",
          text: "You will be logged out!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Logout!"
      }).then((result) => {
          if (result.isConfirmed) {
              navigate('/')
              aToken && setAToken('')
              aToken && localStorage.removeItem('aToken')
              dToken && setDToken('')
              dToken && localStorage.removeItem('dToken')

              Swal.fire({
                  title: "Logged Out",
                  text: "You have been logged out successfully!",
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false
              });
          }
      });
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img className='w=36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
      </div>
      <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Logout</button>
    </div>
  )
}

export default Navbar
