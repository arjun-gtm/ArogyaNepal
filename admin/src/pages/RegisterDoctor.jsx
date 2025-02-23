import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterDoctor = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    speciality: "General Physician",
    degree: "",
    experience: "1 Year",
    about: "",
    fees: "",
    address1: "",
    address2: "",
    image: null,
    doctorId: null, // New field for doctor's ID
  });

  const specialities = [
    "General physician",
    "Dermatologist",
    "Pediatricians",
    "Gynecologist",
    "Cardiologist",
    "Neurologist",
    "Gastroenterologist",
  ];

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else if (e.target.name === "doctorId") {
      setFormData({ ...formData, doctorId: e.target.files[0] });
    }
  };

  // Form Submission
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "address1" && key !== "address2") {
          formDataToSend.append(key, value);
        }
      });

      formDataToSend.append(
        "address",
        JSON.stringify({ line1: formData.address1, line2: formData.address2 })
      );

      const { data } = await axios.post(
        `${backendUrl}api/doctor/register-doctor`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success("Doctor Registered Successfully");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Registration failed, try again!");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center justify-center px-4"
    >
      <div className="flex flex-col gap-4 w-full max-w-2xl p-8 border rounded-xl bg-white shadow-md text-gray-700">
        <p className="text-2xl font-semibold text-center text-primary">
          Doctor Registration
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              name="name"
              onChange={handleChange}
              value={formData.name}
              className="border rounded w-full p-2"
              type="text"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              onChange={handleChange}
              value={formData.email}
              className="border rounded w-full p-2"
              type="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              name="password"
              onChange={handleChange}
              value={formData.password}
              className="border rounded w-full p-2"
              type="password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              name="confirmPassword"
              onChange={handleChange}
              value={formData.confirmPassword}
              className="border rounded w-full p-2"
              type="password"
              required
            />
          </div>

          {/* Speciality Dropdown */}
          <div>
            <label className="block text-sm font-medium">Speciality</label>
            <select
              name="speciality"
              onChange={handleChange}
              value={formData.speciality}
              className="border rounded w-full p-2"
              required
            >
              {specialities.map((spec, index) => (
                <option key={index} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-medium">Degree</label>
            <input
              name="degree"
              onChange={handleChange}
              value={formData.degree}
              className="border rounded w-full p-2"
              type="text"
              required
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium">Experience</label>
            <select
              name="experience"
              onChange={handleChange}
              value={formData.experience}
              className="border rounded w-full p-2"
              required
            >
              {[...Array(10)].map((_, i) => (
                <option key={i} value={`${i + 1} Year`}>
                  {i + 1} Year
                </option>
              ))}
            </select>
          </div>

          {/* Fees */}
          <div>
            <label className="block text-sm font-medium">Consultation Fees</label>
            <input
              name="fees"
              onChange={handleChange}
              value={formData.fees}
              className="border rounded w-full p-2"
              type="number"
              required
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium">Address Line 1</label>
            <input
              name="address1"
              onChange={handleChange}
              value={formData.address1}
              className="border rounded w-full p-2"
              type="text"
              required
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium">Address Line 2</label>
            <input
              name="address2"
              onChange={handleChange}
              value={formData.address2}
              className="border rounded w-full p-2"
              type="text"
              required
            />
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-sm font-medium">About</label>
          <textarea
            name="about"
            onChange={handleChange}
            value={formData.about}
            className="border rounded w-full p-2"
            rows="3"
            required
          />
        </div>

        {/* Upload Profile Image */}
        <div>
        <label className="block text-sm font-medium">Upload a photo of yourself holding your ID</label>
          <input
            name="image"
            onChange={handleFileChange}
            className="border rounded w-full p-2"
            type="file"
            accept="image/*"
            required
          />
        </div>


        {/* Register Button */}
        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-lg hover:bg-opacity-90"
        >
          Register
        </button>
      </div>
    </form>
  );
};

export default RegisterDoctor;