import React, { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Swal from 'sweetalert2'

const Navbar = () => {

    const navigate = useNavigate();

    const { token, setToken, userData } = useContext(AppContext)

    const [showMenu, setShowMenu] = useState(false)

    const logout = () => {
        Swal.fire({
          title: "Are you sure?",
          text: "You will be logged out from your account.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Logout",
          cancelButtonText: "No, Stay Logged In"
        }).then((result) => {
          if (result.isConfirmed) {
            setToken(false);
            localStorage.removeItem('token');
            navigate('/');
            Swal.fire({
              title: "Logged Out",
              text: "You have been successfully logged out.",
              icon: "success",
              confirmButtonColor: "#3085d6",
            });
          }
        });
      }

    const adminLoginRedirect = () => {
        const adminUrl = import.meta.env.VITE_ADMIN_URL;
        window.open(`${adminUrl}/register-doctor`, '_blank');
    }

    return (
        <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
            <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="" />
            <ul className='hidden md:flex items-start gap-5 font-medium'>
                <NavLink to='/'>
                    <li className='py-1'>Home</li>
                    <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='/doctors'>
                    <li className='py-1'>Doctors</li>
                    <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='/about'>
                    <li className='py-1'>About</li>
                    <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='/contact'>
                    <li className='py-1'>Contact</li>
                    <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
                </NavLink>
            </ul>
            <div className='flex items-center gap-4'>

                {!token && (
                    <button
                        onClick={adminLoginRedirect}
                        className='text-stone-700 hover:bg-blue-50 text-xs px-3 py-1.5 rounded border border-blue-200 shadow-sm transition-all duration-200 hidden md:block font-medium'
                    >
                        Register as Doctor
                    </button>
                )}


                {
                    token && userData
                        ? <div className='flex items-center gap-2 cursor-pointer group relative'>
                            <img className='w-8 rounded-full' src={userData.image} alt="" />
                            <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
                                <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                                    <p onClick={() => navigate('my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                                    <p onClick={() => navigate('my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                                    <p onClick={logout} className='hover:text-black cursor-pointer'>Logout</p>
                                </div>
                            </div>
                        </div>
                        :
                        <button onClick={() => navigate('/login')} className='bg-primary text-white px-5 py-3 rounded-full hidden md:block'>Sign Up</button>
                }

                <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />

                {/* ----Mobile Menu---- */}
                <div className={` ${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
                    <div className='flex items-start justify-between px-5 py-6'>
                        <img className='w-36' src={assets.logo} alt="" />
                        <img className='w-7' onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="" />
                    </div>
                    <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
                        <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded inline-block'>Home</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/doctors'><p className='px-4 py-2 rounded inline-block'>Doctors</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/about'><p className='px-4 py-2 rounded inline-block'>About</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/contact'><p className='px-4 py-2 rounded inline-block'>Contact</p></NavLink>
                        {
                            token && userData
                                ? <div className='w-full px-5 mt-4'>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowMenu(false);
                                        }}
                                        className='w-full text-center px-6 py-3 rounded-lg bg-red-600 text-white font-bold shadow-md hover:bg-red-700 transition transform active:scale-95'>
                                        Logout
                                    </button>
                                </div>
                                : <div className='w-full px-5 mt-4'>
                                    <NavLink
                                        onClick={() => setShowMenu(false)}
                                        to='/login'
                                        className='block'>
                                        <button className='w-full text-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transition transform active:scale-95'>
                                            Sign Up
                                        </button>
                                    </NavLink>
                                </div>
                        }
                    </ul>
                </div>

            </div>
        </div>
    )
}

export default Navbar