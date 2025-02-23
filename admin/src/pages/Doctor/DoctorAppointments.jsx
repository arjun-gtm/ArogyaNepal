import React, { useEffect, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DoctorAppointment = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Doctor Appointments', 14, 10);

    const tableColumn = ['#', 'Patient', 'Age', 'Date & Time', 'Payment', 'Fees', 'Status'];
    const tableRows = [];

    appointments.forEach((item, index) => {
      tableRows.push([
        index + 1,
        item.userData.name,
        calculateAge(item.userData.dob),
        `${slotDateFormat(item.slotDate)}, ${item.slotTime}`,
        item.payment ? 'Online' : 'Cash',
        `Rs.${item.amount}`,
        item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending',
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: { 5: { cellWidth: 25 } },
      theme: 'grid',
    });

    doc.save('DoctorAppointments.pdf');
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      appointments.map((item, index) => ({
        'SN': index + 1,
        'Patient': item.userData.name,
        'Age': calculateAge(item.userData.dob),
        'Date & Time': `${slotDateFormat(item.slotDate)}, ${item.slotTime}`,
        'Payment': item.payment ? 'Online' : 'Cash',
        'Fees': `Rs.${item.amount}`,
        'Status': item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending',
      }))
    );

    worksheet['!cols'] = [
      { wch: 5 },   // SN
      { wch: 20 },  // Patient
      { wch: 10 },  // Age
      { wch: 25 },  // Date & Time
      { wch: 15 },  // Payment
      { wch: 15 },  // Fees
      { wch: 15 },  // Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DoctorAppointments');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(excelData, 'DoctorAppointments.xlsx');
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <div className='flex justify-between items-center mb-3'>
        <p className='text-lg font-medium'>All Appointments</p>
        <div className='flex gap-3'>
          <button onClick={exportToPDF} className='px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition'>
            Export PDF
          </button>
          <button onClick={exportToExcel} className='px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition'>
            Export Excel
          </button>
        </div>
      </div>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_1fr_1fr_1fr_1fr] py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Payment</p>
          <p>Fees</p>
          <p>Status</p>
          <p>Actions</p>
        </div>

        {appointments.reverse().map((item, index) => (
          <div key={index} className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_1fr_1fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'>
            <p className='max-sm:hidden'>{index + 1}</p>
            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full' src={item.userData.image} alt="" /> 
              <p>{item.userData.name}</p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p className='text-xs inline border border-primary w-16 text-center px-2 rounded-full'>
              {item.payment ? 'Online' : 'Cash'}
            </p>
            <p>{currency}{item.amount}</p>

            {/* Status Column */}
            <p className={`px-4 py-1 w-[80px] mr-4 text-center rounded text-white text-xs font-medium ${
              item.cancelled ? 'bg-red-500' : item.isCompleted ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending'}
            </p>

            {/* Actions Column */}
            <div className='flex items-center gap-2'>
              {!item.cancelled && !item.isCompleted && (
                <>
                  <img 
                    onClick={() => cancelAppointment(item._id)} 
                    className='w-10 cursor-pointer' 
                    src={assets.cancel_icon} 
                    alt="Cancel" 
                  />
                  <img 
                    onClick={() => completeAppointment(item._id)} 
                    className='w-10 cursor-pointer' 
                    src={assets.tick_icon} 
                    alt="Complete" 
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointment;