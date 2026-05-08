import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { assets } from '../../assets/assets';
import EditDoctorModal from './EditDoctorModal';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, deleteDoctor, editDoctor } = useContext(AdminContext);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  const handleEditClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleSave = async (docId, updatedData) => {
    try {
      await editDoctor(docId, updatedData);
      setIsModalOpen(false);
      getAllDoctors();
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error('Failed to update doctor details.');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" }); // Landscape mode for better table fit
    doc.text('Doctors List', 14, 10);

    // Prepare table data with Address line1 and line2 combined
    const tableData = doctors.map((doctor, index) => [
        index + 1,
        doctor.name,
        doctor.email,
        `Rs. ${doctor.fees}`,
        doctor.degree,
        doctor.speciality,
        `${doctor.experience}`,
        `${doctor.address?.line1 || ''}\n${doctor.address?.line2 || ''}` // Address line 1 & 2
    ]);

    // Define column widths and styles
    doc.autoTable({
        head: [['SN.', 'Name', 'Email', 'Fee', 'Degree', 'Speciality', 'Experience', 'Address']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 10, cellPadding: 3, overflow: 'linebreak' }, // Enable text wrapping
        theme: 'grid',
        columnStyles: {
            0: { cellWidth: 12 },  // SN
            1: { cellWidth: 40 },  // Name
            2: { cellWidth: 55 },  // Email
            3: { cellWidth: 20 },  // Fee
            4: { cellWidth: 30 },  // Degree
            5: { cellWidth: 50 },  // Speciality
            6: { cellWidth: 25 },  // Experience
            7: { cellWidth: 80, whiteSpace: 'wrap' }  // Address (Multi-line text enabled)
        },
        margin: { top: 20, left: 10, right: 10 },
        pageBreak: 'auto', // Automatically creates a new page if content overflows
    });

    doc.save('doctors_list.pdf');
};


  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      doctors.map((doctor, index) => ({
        'SN.': index + 1,
        Name: doctor.name,
        Email: doctor.email,
        Fee: `Rs.${doctor.fees}`,
        Degree: doctor.degree,
        Speciality: doctor.speciality,
        Experience: `${doctor.experience}`,
        Address: `${doctor.address?.line1 || ''}\n, ${doctor.address?.line2 || ''}` // Add line2 on a new line
      }))
    );
  
    // Set column widths
    const wscols = [
      { wch: 5 },  // SN.
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Fee
      { wch: 20 }, // Degree
      { wch: 20 }, // Speciality
      { wch: 15 }, // Experience
      { wch: 40 }  // Address
    ];
    ws['!cols'] = wscols;
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doctors');
    XLSX.writeFile(wb, 'doctors_list.xlsx');
  };

  return (
    <div className='w-full max-w-8xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-5'>
        <p className='text-xl font-semibold text-gray-800'>All Doctors</p>
        <div className='flex gap-4'>
          <button onClick={exportToPDF} className='px-5 py-2 text-sm bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition'>
            Export PDF
          </button>
          <button onClick={exportToExcel} className='px-5 py-2 text-sm bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition'>
            Export Excel
          </button>
        </div>
      </div>

      <div className='bg-white border rounded-lg shadow-lg text-[15px]'>
        <div className='hidden sm:grid grid-cols-[0.4fr_2fr_2fr_1fr_1.5fr_1.5fr_1fr_2.5fr_1fr_1fr] gap-x-4 py-4 px-6 border-b bg-gray-100 font-semibold text-gray-700'>
          <p>#</p>
          <p>Name</p>
          <p>Email</p>
          <p>Fee</p>
          <p>Degree</p>
          <p>Speciality</p>
          <p>Experience</p>
          <p>Address</p>
          <p>Available</p>
          <p>Actions</p>
        </div>

        {doctors.map((item, index) => (
          <div key={index} className='flex flex-wrap sm:grid sm:grid-cols-[0.4fr_2fr_2fr_1fr_1.5fr_1.5fr_1fr_2.5fr_1fr_1fr] gap-x-4 gap-y-2 items-center text-gray-700 py-5 px-6 border-b hover:bg-gray-50 text-[15px]'>
            <p className='max-sm:hidden'>{index + 1}</p>
            <div className='flex items-center gap-3'>
              <img className='w-12 h-12 rounded-full border' src={item.image} alt='Doctor' />
              <p className='font-medium'>{item.name}</p>
            </div>
            <p className='break-words'>{item.email}</p>
            <p className='font-medium'>{`Rs.${item.fees}`}</p>
            <p className='break-words'>{item.degree}</p>
            <p className='break-words'>{item.speciality}</p>
            <p className='text-center'>{item.experience} yrs</p>
            <div className='break-words'>
              <p>{item.address?.line1 || ''}</p>
              <p>{item.address?.line2 || ''}</p>
            </div>
            <div className='flex justify-center'>
              <input onChange={() => changeAvailability(item._id)} type='checkbox' checked={item.available} className='cursor-pointer w-4 h-4' />
            </div>
            <div className='flex justify-center gap-4'>
              <img onClick={() => handleEditClick(item)} className='w-9 h-9 cursor-pointer transition hover:scale-110' src={assets.edit_icon} alt='Edit' />
              <img onClick={() => deleteDoctor(item._id)} className='w-9 h-9 cursor-pointer transition hover:scale-110' src={assets.delete_icon} alt='Delete' />
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && <EditDoctorModal doctor={selectedDoctor} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
    </div>
  );
};

export default DoctorsList;