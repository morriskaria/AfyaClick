import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Stethoscope, FileText, User, CheckCircle } from 'lucide-react';

const ReceptionistBookAppointment = ({ doctors, patients, onBookAppointment }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
  });

  const patientOptions = useMemo(
    () => (patients || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [patients]
  );

  const doctorOptions = useMemo(
    () => (doctors || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [doctors]
  );

  const selectedDoctor = doctorOptions.find((doc) => String(doc.id) === String(formData.doctorId));
  const selectedPatient = patientOptions.find((p) => String(p.id) === String(formData.patientId));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBookAppointment(formData);
    setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-3 rounded-full">
              <Calendar className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-white">Book Appointment</h2>
          </div>
          <p className="text-blue-100 ml-16">Schedule an appointment for a patient</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <User className="w-4 h-4 text-blue-600" />
                Select Patient
              </label>
              <div className="relative">
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 font-medium appearance-none cursor-pointer hover:border-blue-300"
                >
                  <option value="" className="text-gray-500">
                    Choose a patient
                  </option>
                  {patientOptions.map((p) => (
                    <option key={p.id} value={p.id} className="text-gray-800">
                      {p.name || `Patient #${p.id}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {selectedPatient && (
                <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 p-2 rounded-full mt-0.5">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">{selectedPatient.name}</h4>
                      {selectedPatient.email && (
                        <p className="text-sm text-blue-800 mt-1">{selectedPatient.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  <option value="" className="text-gray-500">
                    Choose a doctor
                  </option>
                  {doctorOptions.map((doc) => (
                    <option key={doc.id} value={doc.id} className="text-gray-800">
                      Dr. {doc.name} - {doc.specialty || 'General'}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {selectedDoctor && (
                <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 p-2 rounded-full mt-0.5">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">Dr. {selectedDoctor.name}</h4>
                      <p className="text-sm text-blue-800 mt-1">{selectedDoctor.specialty || 'General'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                placeholder="Reason for visit"
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                rows="4"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistBookAppointment;

