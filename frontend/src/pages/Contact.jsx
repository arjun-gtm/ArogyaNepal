import React from 'react'
import {assets} from '../assets/assets'

const Contact = () => {

  return (
    <div>
      
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p> CONTACT <span className='text-gray-700 font-semibold'>US</span> </p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px] rounded-2xl' src={assets.contact_image} alt="" />

        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-lg text-gray-600'>OUR OFFICE</p>
          <p className='text-gray-500'>Nayabazaar, Panga Dobato <br />Kirtipur, Kathmandu</p>
          <p className='text-gray-500'>Phone: +977 9818151385 <br /> Email: contact@arjungtm.com.np </p>
          <p className='font-semibold text-lg text-gray-600'>CAREER AT AROGYA-NEPAL</p>
          <p className='text-gray-500'>Learn more about our teams and job openings.</p>

          <button className='border border-black px-8 py-4 text-sm rounded-xl hover:bg-primary hover:text-white transition-all duration-500 hover:border-primary'>Explore Jobs</button>
        </div>

      </div>

    </div>
  )
}

export default Contact           