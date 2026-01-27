import React, { useState } from 'react';
import { Calendar, Clock, Stethoscope, FileText, User, CheckCircle } from 'lucide-react';

const BookAppointment = ({ doctors, onBookAppointment }) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onBookAppointment(formData);
    setFormData({ doctorId: '', date: '', time: '', reason: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Get selected doctor details
  const selectedDoctor = doctors?.find(doc => doc.id === parseInt(formData.doctorId));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-3 rounded-full">
              <Calendar className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-white">Book Appointment</h2>
          </div>
          <p className="text-blue-100 ml-16">Schedule your consultation with our healthcare professionals</p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Select Doctor */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Select Doctor
              </label>
              <div className="relative">
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 font-medium appearance-none cursor-pointer hover:border-blue-300"
                >
                  <option value="" className="text-gray-500">Choose your preferred doctor</option>
                  {doctors && doctors.map(doc => (
                    <option key={doc.id} value={doc.id} className="text-gray-800">
                      Dr. {doc.name} - {doc.specialty}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Doctor Info Card */}
              {selectedDoctor && (
                <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 p-2 rounded-full mt-0.5">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">Dr. {selectedDoctor.name}</h4>
                      <p className="text-sm text-blue-800 mt-1">{selectedDoctor.specialty}</p>
                      {selectedDoctor.experience && (
                        <p className="text-xs text-blue-700 mt-1">{selectedDoctor.experience} years of experience</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date and Time Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 font-medium cursor-pointer hover:border-blue-300"
                />
              </div>

              {/* Time */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Appointment Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 font-medium cursor-pointer hover:border-blue-300"
                />
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                Reason for Visit
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                placeholder="Please describe your symptoms or reason for consultation"
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                rows="4"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Appointment
              </button>
            </div>
          </div>

          {/* Info Boxes */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {/* Office Hours Info */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 p-1 rounded-full mt-0.5">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Office Hours</h4>
                  <p className="text-sm text-blue-800">Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p className="text-sm text-blue-800">Saturday: 9:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-gray-600 p-1 rounded-full mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Cancellation Policy</h4>
                  <p className="text-sm text-gray-700">Please notify us at least 24 hours in advance to cancel or reschedule.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-full mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Before Your Appointment</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Arrive 10 minutes early for registration</li>
                  <li>• Bring your insurance card and ID</li>
                  <li>• Have a list of current medications ready</li>
                  <li>• You will receive a confirmation via email/SMS</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const BookAppointmentDemo = () => {
  const [appointments, setAppointments] = useState([]);
  
  const mockDoctors = [
    { id: 1, name: 'Sarah Johnson', specialty: 'Cardiology', experience: 15 },
    { id: 2, name: 'Michael Chen', specialty: 'Pediatrics', experience: 10 },
    { id: 3, name: 'Emily Williams', specialty: 'Orthopedics', experience: 12 },
    { id: 4, name: 'David Brown', specialty: 'Dermatology', experience: 8 },
    { id: 5, name: 'Lisa Anderson', specialty: 'Neurology', experience: 18 },
  ];

  const handleBookAppointment = (formData) => {
    const newAppointment = {
      id: appointments.length + 1,
      ...formData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    setAppointments([...appointments, newAppointment]);
    alert('Appointment booked successfully! You will receive a confirmation email shortly.');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <BookAppointment 
        doctors={mockDoctors} 
        onBookAppointment={handleBookAppointment} 
      />
    </div>
  );
};

export default BookAppointmentDemo;