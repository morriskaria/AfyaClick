// src/components/MyAppointments.jsx
import { Clock } from 'lucide-react';

const MyAppointments = ({ appointments, getDoctorName }) => {
  if (appointments.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          My Appointments
        </h2>
        <p className="text-gray-500 text-center py-8">No appointments found</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-indigo-600" />
        My Appointments
      </h2>
      <div className="space-y-4">
        {appointments.map(apt => (
          <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{getDoctorName(apt.doctorId)}</p>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;