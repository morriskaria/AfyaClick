// src/components/MedicalRecords.jsx
import { FileText } from 'lucide-react';

const MedicalRecords = ({ records }) => {
  if (records.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Medical Records
        </h2>
        <p className="text-gray-500 text-center py-8">No medical records found</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-indigo-600" />
        Medical Records
      </h2>
      <div className="space-y-4">
        {records.map(rec => (
          <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-gray-800">{rec.diagnosis}</p>
              <p className="text-sm text-gray-500">{rec.date}</p>
            </div>
            <p className="text-sm text-gray-600 mb-2"><strong>Treatment:</strong> {rec.treatment}</p>
            <p className="text-sm text-gray-600"><strong>Notes:</strong> {rec.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecords;