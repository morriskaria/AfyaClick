import React, { useState } from 'react';
import { FileText, User, Stethoscope, FileCheck, ClipboardList } from 'lucide-react';

const AddRecord = ({ patients, onAddRecord }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-3 rounded-full">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-white">Add Patient Record</h2>
          </div>
          <p className="text-blue-100 ml-16">Complete the form below to add a new medical record</p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Select Patient */}
            <div className="relative">
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
                  <option value="" className="text-gray-500">Choose a patient from the list</option>
                  {patients && patients.map(pat => (
                    <option key={pat.id} value={pat.id} className="text-gray-800">
                      {pat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                placeholder="Enter medical diagnosis"
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Treatment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Treatment Plan
              </label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                required
                placeholder="Describe the recommended treatment plan"
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                rows="4"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                required
                placeholder="Add any additional observations or notes"
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                rows="4"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  if (formData.patientId && formData.diagnosis && formData.treatment && formData.notes) {
                    onAddRecord(formData);
                    setFormData({ patientId: '', diagnosis: '', treatment: '', notes: '' });
                  } else {
                    alert('Please fill in all required fields');
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Add Medical Record
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-1 rounded-full mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Important Information</h4>
                <p className="text-sm text-blue-800">All fields are required. Please ensure accurate information is provided for patient safety and record keeping.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo wrapper to show the component in action
const AddRecordDemo = () => {
  const [records, setRecords] = useState([]);
  
  const mockPatients = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Michael Brown' },
    { id: 4, name: 'Emily Davis' },
  ];

  const handleAddRecord = (formData) => {
    const newRecord = {
      id: records.length + 1,
      ...formData,
      date: new Date().toLocaleDateString(),
    };
    setRecords([...records, newRecord]);
    alert('Record added successfully!');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <AddRecord patients={mockPatients} onAddRecord={handleAddRecord} />
    </div>
  );
};

export default AddRecordDemo;