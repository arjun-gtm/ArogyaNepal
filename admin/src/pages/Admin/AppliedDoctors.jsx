import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const AppliedDoctors = () => {
  const { appliedDoctors, getAppliedDoctors, approveDoctor, rejectDoctor } = useContext(AdminContext);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchAppliedDoctors = async () => {
      try {
        await getAppliedDoctors();
      } catch (error) {
        console.error("Error fetching applied doctors:", error);
        toast.error("Failed to fetch applied doctors.");
      }
    };

    fetchAppliedDoctors();
  }, [getAppliedDoctors]);

  const handleApproveDoctor = async (doctorId) => {
    try {
      await approveDoctor(doctorId);
    } catch (error) {
      console.error("Error approving doctor:", error);
      toast.error("Failed to approve doctor.");
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    try {
      await rejectDoctor(doctorId);
    } catch (error) {
      console.error("Error rejecting doctor:", error);
      toast.error("Failed to reject doctor.");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Applied Doctors List", 20, 10);

    const tableData = appliedDoctors.map((doctor, index) => [
      index + 1,
      doctor.name,
      doctor.email,
      `Rs.${doctor.fees}`,
      doctor.degree,
      doctor.speciality,
      doctor.experience,
      doctor.address?.line1 || "",
    ]);

    doc.autoTable({
      head: [["#", "Name", "Email", "Fee", "Degree", "Speciality", "Experience", "Address"]],
      body: tableData,
    });

    doc.save("applied_doctors.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(appliedDoctors.map((doctor, index) => ({
      "#": index + 1,
      Name: doctor.name,
      Email: doctor.email,
      Fee: `Rs.${doctor.fees}`,
      Degree: doctor.degree,
      Speciality: doctor.speciality,
      Experience: doctor.experience,
      Address: doctor.address?.line1 || "",
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applied Doctors");
    XLSX.writeFile(workbook, "applied_doctors.xlsx");
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-5">
        <p className="text-xl font-semibold text-gray-800">Applied Doctors</p>
        <div className="flex gap-3">
          <button onClick={exportToPDF} className="px-5 py-2 text-sm bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition">
            Export PDF
          </button>
          <button onClick={exportToExcel} className="px-5 py-2 text-sm bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition">
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-4 px-4">#</th>
              <th className="py-4 px-4">Doctor ID</th>
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Fee</th>
              <th className="py-4 px-4">Degree</th>
              <th className="py-4 px-4">Speciality</th>
              <th className="py-4 px-4">Experience</th>
              <th className="py-4 px-4">Address</th>
              <th className="py-4 px-4 w-48">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appliedDoctors.length > 0 ? (
              appliedDoctors.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">{index + 1}</td>
                  <td className="py-4 px-4">
                    <div
                      className="w-24 h-16 bg-gray-100 border rounded-lg flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition"
                      onClick={() => setSelectedDoctor(item)}
                    >
                      <img className="h-full w-full object-cover rounded-lg" src={item.image} alt="Doctor ID" />
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">{item.name}</td>
                  <td className="py-4 px-4">{item.email}</td>
                  <td className="py-4 px-4 font-medium">{`Rs.${item.fees}`}</td>
                  <td className="py-4 px-4">{item.degree}</td>
                  <td className="py-4 px-4">{item.speciality}</td>
                  <td className="py-4 px-4 text-center">{item.experience}</td>
                  <td className="py-4 px-4">{item.address?.line1 || ""}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2 min-w-[160px]">
                      <button
                        onClick={() => handleApproveDoctor(item._id)}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDoctor(item._id)}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-5 text-gray-500">
                  No applied doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedDoctor(null)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Doctor ID</h2>
            <img className="w-full rounded-lg shadow" src={selectedDoctor?.image} alt="Doctor ID" />
            <p className="mt-2 text-center text-gray-700 font-medium">{selectedDoctor?.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppliedDoctors;