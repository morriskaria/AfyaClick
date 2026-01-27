// src/components/DoctorAppointments.jsx
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const DoctorAppointments = ({ appointments, getPatientName, onUpdateAppointmentStatus }) => {
  if (appointments.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          Patient Appointments
        </h2>
        <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-indigo-600" />
        Patient Appointments
      </h2>
      <div className="space-y-4">
        {appointments.map(apt => (
          <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-800">{getPatientName(apt.patientId)}</p>
                <p className="text-sm text-gray-600 mt-1">{apt.date} at {apt.time}</p>
                <p className="text-sm text-gray-600 mt-1">Reason: {apt.reason}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {apt.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateAppointmentStatus(apt.id, 'confirmed')}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm
              </button>
              <button
                onClick={() => onUpdateAppointmentStatus(apt.id, 'cancelled')}
                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;