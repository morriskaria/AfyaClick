import React, { useMemo, useState } from 'react';
import { Trash2, Search } from 'lucide-react';

const ReceptionistAppointments = ({ appointments, patients, doctors, onDeleteAppointment }) => {
  const [query, setQuery] = useState('');

  const patientById = useMemo(() => {
    const m = new Map();
    (patients || []).forEach((p) => m.set(String(p.id), p));
    return m;
  }, [patients]);

  const doctorById = useMemo(() => {
    const m = new Map();
    (doctors || []).forEach((d) => m.set(String(d.id), d));
    return m;
  }, [doctors]);

  const rows = useMemo(() => {
    const list = (appointments || []).slice();
    list.sort((a, b) => {
      const ad = `${a.date || ''} ${a.time || ''}`.trim();
      const bd = `${b.date || ''} ${b.time || ''}`.trim();
      return ad.localeCompare(bd);
    });

    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((apt) => {
      const patient = patientById.get(String(apt.patientId));
      const doctor = doctorById.get(String(apt.doctorId));
      return (
        String(apt.id).includes(q) ||
        (patient?.name || '').toLowerCase().includes(q) ||
        (doctor?.name || '').toLowerCase().includes(q) ||
        String(apt.date || '').toLowerCase().includes(q) ||
        String(apt.time || '').toLowerCase().includes(q)
      );
    });
  }, [appointments, doctorById, patientById, query]);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient, doctor, date, id..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#dae0e7] bg-white focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#dae0e7] shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">event_busy</span>
          <h3 className="text-xl font-semibold mb-2">No appointments</h3>
          <p className="text-[#5e758d]">Create an appointment to see it here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#dae0e7] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-[#5e758d]">
                <tr>
                  <th className="text-left font-bold px-4 py-3">ID</th>
                  <th className="text-left font-bold px-4 py-3">Patient</th>
                  <th className="text-left font-bold px-4 py-3">Doctor</th>
                  <th className="text-left font-bold px-4 py-3">Date</th>
                  <th className="text-left font-bold px-4 py-3">Time</th>
                  <th className="text-left font-bold px-4 py-3">Status</th>
                  <th className="text-right font-bold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f4f8]">
                {rows.map((apt) => {
                  const patient = patientById.get(String(apt.patientId));
                  const doctor = doctorById.get(String(apt.doctorId));
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{apt.id}</td>
                      <td className="px-4 py-3">{patient?.name || `Patient #${apt.patientId}`}</td>
                      <td className="px-4 py-3">{doctor ? `Dr. ${doctor.name}` : String(apt.doctorId)}</td>
                      <td className="px-4 py-3">{apt.date}</td>
                      <td className="px-4 py-3">{apt.time}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : apt.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {apt.status || 'scheduled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-semibold"
                            onClick={() => onDeleteAppointment(apt.id)}
                            title="Delete appointment"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistAppointments;

