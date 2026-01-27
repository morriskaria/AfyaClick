// src/components/ViewRecords.jsx
import { FileText } from 'lucide-react';

const ViewRecords = ({ records, getPatientName }) => {
  if (records.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Patient Records
        </h2>
        <p className="text-gray-500 text-center py-8">No patient records found</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-indigo-600" />
        Patient Records
      </h2>
      <div className="space-y-4">
        {records.map(rec => (
          <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-800">{getPatientName(rec.patientId)}</p>
                <p className="text-sm text-gray-500 mt-1">{rec.date}</p>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                {rec.diagnosis}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2"><strong>Treatment:</strong> {rec.treatment}</p>
            <p className="text-sm text-gray-600"><strong>Notes:</strong> {rec.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewRecords; // Make sure this line is present