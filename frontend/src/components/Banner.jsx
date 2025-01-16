import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const Banner = () => {

    const { token } = useContext(AppContext)
    const navigate = useNavigate()

    return (
        <div className='flex bg-primary rounded-lg px-6 sm:px-10 md:px-12 my-20 md:mx-10'>
            {/* -----Left Side------ */}
            <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
                <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white'>
                    <p>Book Appointment</p>
                    <p className='mt-4'>With 100+ Trusted Doctors</p>
                </div>

                {/* Show "Create Account" button if the user is not logged in */}
                {!token && (
                    <button
                        onClick={() => { navigate('/login'); scrollTo(0, 0) }}
                        className='bg-white text-sm sm:text-base text-gray-600 px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all'>
                        Sign Up
                    </button>
                )}

                {/* Show "Book Now" button if the user is logged in */}
                {token && (
                    <button
                        onClick={() => navigate('/doctors')}
                        className='bg-white text-sm sm:text-base text-gray-600 px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all'>
                        Book Now
                    </button>
                )}
            </div>

            {/* -----Right Side------ */}
            <div className='hidden md:block md:w-1/2 lg:w-[370px] relative'>
                <img className='w-full absolute bottom-0 right-0 max-w-md' src={assets.appointment_img} alt="" />
            </div>
        </div>
    )
}

export default Banner
