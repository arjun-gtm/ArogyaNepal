import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'
import { IoChevronForward } from 'react-icons/io5'

const SpecialityMenu = () => {
 return (
   <div className='flex flex-col items-center gap-4 py-16 text-gray-800 relative' id='speciality'>
     <h1 className='text-3xl font-medium'>Find By Specialities</h1>
     <p className='md:w-1/3 text-center text-sm px-4'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>

     {/* Specialities List */}
     <div className='relative w-full'>
       <div className='flex justify-start md:justify-center gap-4 pt-5 w-full overflow-x-auto scrollbar-hide px-4'>
         {specialityData.map((item, index) => (
           <Link 
             onClick={() => window.scrollTo(0, 0)} 
             className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500 min-w-[100px] text-center' 
             key={index} 
             to={`/doctors/${item.speciality}`}
           >
             <div className='w-16 md:w-24 h-16 md:h-24 flex items-center justify-center mb-2'>
               <img 
                 className='max-w-full max-h-full object-contain' 
                 src={item.image} 
                 alt={item.speciality} 
               />
             </div>
             <p className='text-center'>{item.speciality}</p>
           </Link>
         ))}
       </div>

       {/* Scroll Hint - Mobile Only */}
       <div className='flex justify-center mt-6 text-gray-700 md:hidden'>
         <div className='flex items-center border-2 border-blue-500 rounded-full px-4 py-2 animate-pulse'>
           <IoChevronForward className='text-xl text-blue-500 mr-2' />
           <span className='text-sm text-blue-500 font-medium'>Scroll for more.</span>
         </div>
       </div>
     </div>
   </div>
 )
}

export default SpecialityMenu


