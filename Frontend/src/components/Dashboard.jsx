import React from 'react';

// Import actual components
import BookAppointment from './BookAppointment';
import MyAppointments from './MyAppointments';
import MedicalRecords from './MedicalRecords';
import DoctorAppointments from './DoctorAppointments';
import AddRecord from './AddRecord';
import ViewRecords from './ViewRecords';

// Main Dashboard Component
const Dashboard = ({
  activeTab,
  currentUser,
  users,
  appointments,
  patientRecords,
  onBookAppointment,
  onAddRecord,
  onUpdateAppointmentStatus,
  searchQuery
}) => {
  const getPatientName = (id) => users?.find(u => u.id === id)?.name || 'Unknown';
  const getDoctorName = (id) => users?.find(u => u.id === id)?.name || 'Unknown';

  // Helper to get today's date formatted
  const getTodayFormatted = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    return `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  };

  // Filter appointments based on search query
  const filterBySearch = (items, getName) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      getName(item.patientId || item.doctorId || item.id)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Doctor Dashboard Content
  if (currentUser.role === 'doctor' && activeTab === 'dashboard') {
    const myAppointments = appointments?.filter(apt => apt.doctorId === currentUser.id) || [];
    const filteredAppointments = filterBySearch(myAppointments, getPatientName);
    const pendingAppointments = myAppointments.filter(apt => apt.status === 'pending');
    const todayAppointments = myAppointments.filter(apt => {
      const today = new Date().toISOString().split('T')[0];
      return apt.date === today;
    });
    const totalPatients = users?.filter(u => u.role === 'patient').length || 0;
    const completedVisits = myAppointments.filter(apt => apt.status === 'confirmed').length;

    return (
      <div className="space-y-8">
        {/* Welcome & Stats Row */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight">Welcome back, Dr. {currentUser.name?.split(' ').slice(1).join(' ') || currentUser.name}</h2>
            <p className="text-[#5e758d] mt-1">Today is {getTodayFormatted()}. You have {todayAppointments.length} appointments scheduled.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-[#dae0e7] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">person</span>
                <span className="text-[#078838] text-xs font-bold bg-[#078838]/10 px-2 py-1 rounded">+2.5%</span>
              </div>
              <p className="text-[#5e758d] text-sm font-medium">Total Patients</p>
              <p className="text-2xl font-bold mt-1">{totalPatients}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#dae0e7] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-amber-500 p-2 bg-amber-500/10 rounded-lg">pending_actions</span>
                <span className="text-[#5e758d] text-xs font-bold bg-slate-100 px-2 py-1 rounded">Stable</span>
              </div>
              <p className="text-[#5e758d] text-sm font-medium">Pending Consultations</p>
              <p className="text-2xl font-bold mt-1">{pendingAppointments.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#dae0e7] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">calendar_month</span>
                <span className="text-[#e73908] text-xs font-bold bg-[#e73908]/10 px-2 py-1 rounded">-10%</span>
              </div>
              <p className="text-[#5e758d] text-sm font-medium">Today's Appointments</p>
              <p className="text-2xl font-bold mt-1">{todayAppointments.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#dae0e7] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-green-600 p-2 bg-green-600/10 rounded-lg">check_circle</span>
                <span className="text-[#078838] text-xs font-bold bg-[#078838]/10 px-2 py-1 rounded">+15%</span>
              </div>
              <p className="text-[#5e758d] text-sm font-medium">Completed Visits</p>
              <p className="text-2xl font-bold mt-1">{completedVisits}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <section className="lg:col-span-2 bg-white rounded-xl border border-[#dae0e7] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#dae0e7] flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg">Today's Schedule</h3>
              <button className="text-primary text-sm font-bold hover:underline" onClick={() => {}}>View Calendar</button>
            </div>
            <div className="divide-y divide-[#dae0e7]">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((apt) => (
                  <div key={apt.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-16">
                        <p className="text-sm font-bold text-primary">{apt.time}</p>
                        <p className="text-[10px] uppercase text-[#5e758d] font-bold">PM</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img 
                          className="w-full h-full object-cover" 
                          alt={getPatientName(apt.patientId)}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getPatientName(apt.patientId))}&background=137fec&color=fff&size=40`}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{getPatientName(apt.patientId)}</p>
                        <p className="text-xs text-[#5e758d]">{apt.reason || 'Medical Consultation'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {apt.status}
                      </span>
                      <button className="material-symbols-outlined text-[#5e758d] hover:text-primary">more_vert</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">event_busy</span>
                  <p className="text-[#5e758d]">No appointments scheduled for today</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 text-center">
              <button className="text-sm font-bold text-[#5e758d] hover:text-primary transition-colors" onClick={() => {}}>View All Appointments</button>
            </div>
          </section>

          {/* Quick Actions & Activity */}
          <aside className="space-y-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#dae0e7] rounded-xl hover:border-primary hover:text-primary transition-all group"
                  onClick={() => {}}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_box</span>
                  <span className="text-xs font-bold text-center">Add Patient Record</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#dae0e7] rounded-xl hover:border-primary hover:text-primary transition-all group"
                  onClick={() => {}}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">group</span>
                  <span className="text-xs font-bold text-center">View All Patients</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#dae0e7] rounded-xl hover:border-primary hover:text-primary transition-all group"
                  onClick={() => {}}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">event_seat</span>
                  <span className="text-xs font-bold text-center">Manage Slots</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#dae0e7] rounded-xl hover:border-primary hover:text-primary transition-all group"
                  onClick={() => {}}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">library_books</span>
                  <span className="text-xs font-bold text-center">Medical Resources</span>
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Upcoming Reminders</h3>
              <div className="space-y-3">
                <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-primary">priority_high</span>
                    <p className="text-xs font-bold text-primary uppercase">Staff Meeting</p>
                  </div>
                  <p className="text-sm font-medium">Departmental review at 2:00 PM today in Conference Room B.</p>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-amber-600">history</span>
                    <p className="text-xs font-bold text-amber-600 uppercase">Pending Report</p>
                  </div>
                  <p className="text-sm font-medium">Complete patient reports by end of day.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Patient Dashboard Content
  if (currentUser.role === 'patient' && activeTab === 'dashboard') {
    const myAppointments = appointments?.filter(apt => apt.patientId === currentUser.id) || [];
    const filteredAppointments = filterBySearch(myAppointments, getDoctorName);
    const nextAppointment = myAppointments.find(apt => apt.status === 'confirmed') ||
      myAppointments.find(apt => apt.status === 'pending');
    const upcomingCount = myAppointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length;
    const completedCount = myAppointments.filter(apt => apt.status === 'confirmed').length;

    return (
      <div className="space-y-8">
        {/* Welcome & Stats Row */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight">Welcome back, {currentUser.name?.split(' ')[0]}</h2>
            <p className="text-[#5e758d] mt-1">Today is {getTodayFormatted()}. You have {upcomingCount} upcoming appointments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-[#dae0e7] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">calendar_month</span>
                <span className="text-[#078838] text-xs font-bold bg-[#078838]/10 px-2 py-1 rounded">+1</span>
              </div>
              <p className="text-[#5e758d] text-sm font-medium">Upcoming Appointments</p>
              <p className="text-2xl font-bold mt-1">{upcomingCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#dae0e7] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-green-600 p-2 bg-green-600/10 rounded-lg">check_circle</span>
                <span className="text-[#078838] text-xs font-bold bg-[#078838]/10 px-2 py-1 rounded">+2</span>
              </div>
              <p className="text-[#5e758d] text-sm font-medium">Completed Visits</p>
              <p className="text-2xl font-bold mt-1">{completedCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#dae0e7] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-purple-500 p-2 bg-purple-500/10 rounded-lg">description</span>
                <span className="text-[#5e758d] text-xs font-bold bg-slate-100 px-2 py-1 rounded">Stable</span>
              </div>
              <p className="text-[#5e758d] text-sm font-medium">Medical Records</p>
              <p className="text-2xl font-bold mt-1">{patientRecords?.filter(r => r.patientId === currentUser.id).length || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#dae0e7] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-amber-500 p-2 bg-amber-500/10 rounded-lg">medication</span>
                <span className="text-[#5e758d] text-xs font-bold bg-slate-100 px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-[#5e758d] text-sm font-medium">Prescriptions</p>
              <p className="text-2xl font-bold mt-1">2</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Next Appointment */}
          <section className="lg:col-span-2 bg-white rounded-xl border border-[#dae0e7] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#dae0e7] flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg">Next Appointment</h3>
              <button className="text-primary text-sm font-bold hover:underline" onClick={() => {}}>View All</button>
            </div>
            {nextAppointment ? (
              <div className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img 
                      alt="Doctor portrait"
                      className="w-full h-full object-cover"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getDoctorName(nextAppointment.doctorId))}&background=137fec&color=fff&size=128`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      {nextAppointment.date} • {nextAppointment.time}
                    </div>
                    <h3 className="text-xl font-bold mb-1">Dr. {getDoctorName(nextAppointment.doctorId).split(' ').slice(1).join(' ')}</h3>
                    <p className="text-[#5e758d] text-sm mb-4">{nextAppointment.reason || 'Medical Consultation'}</p>
                    <div className="flex items-center gap-3">
                      <button className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                        Check-in
                      </button>
                      <button className="p-2.5 border border-[#dae0e7] rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">call</span>
                      </button>
                      <button className="p-2.5 border border-[#dae0e7] rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">event_busy</span>
                <h3 className="text-lg font-bold mb-2">No Upcoming Appointments</h3>
                <p className="text-[#5e758d] text-sm mb-4">Book an appointment to get started</p>
                <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                  Book Appointment
                </button>
              </div>
            )}
          </section>

          {/* Quick Actions & Reminders */}
          <aside className="space-y-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#dae0e7] rounded-xl hover:border-primary hover:text-primary transition-all group"
                  onClick={() => {}}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_box</span>
                  <span className="text-xs font-bold text-center">Book Appointment</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#dae0e7] rounded-xl hover:border-primary hover:text-primary transition-all group"
                  onClick={() => {}}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">medication</span>
                  <span className="text-xs font-bold text-center">Prescriptions</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#dae0e7] rounded-xl hover:border-primary hover:text-primary transition-all group"
                  onClick={() => {}}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">science</span>
                  <span className="text-xs font-bold text-center">Lab Results</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-[#dae0e7] rounded-xl hover:border-primary hover:text-primary transition-all group"
                  onClick={() => {}}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">description</span>
                  <span className="text-xs font-bold text-center">Medical Records</span>
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Health Reminders</h3>
              <div className="space-y-3">
                <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-primary">favorite</span>
                    <p className="text-xs font-bold text-primary uppercase">Health Check</p>
                  </div>
                  <p className="text-sm font-medium">Consider scheduling a regular check-up.</p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-green-600">vaccines</span>
                    <p className="text-xs font-bold text-green-600 uppercase">Vaccination Due</p>
                  </div>
                  <p className="text-sm font-medium">Annual flu shot available.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Render content for other tabs
  const renderContent = () => {
    switch (activeTab) {
      case 'book-appointment':
        return (
          <BookAppointment
            doctors={users?.filter(u => u.role === 'doctor') || []}
            onBookAppointment={onBookAppointment}
          />
        );
      case 'my-appointments':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-6">My Appointments</h2>
            {appointments?.filter(apt => apt.patientId === currentUser.id).length > 0 ? (
              <MyAppointments
                appointments={appointments.filter(apt => apt.patientId === currentUser.id)}
                getDoctorName={getDoctorName}
              />
            ) : (
              <div className="bg-white rounded-xl border border-[#dae0e7] shadow-sm p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">calendar_today</span>
                <h3 className="text-xl font-semibold mb-2">No Appointments Yet</h3>
                <p className="text-[#5e758d] mb-6">You haven't booked any appointments yet.</p>
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        );
      case 'my-records':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-6">Medical Records</h2>
            {patientRecords?.filter(rec => rec.patientId === currentUser.id).length > 0 ? (
              <MedicalRecords
                records={patientRecords.filter(rec => rec.patientId === currentUser.id)}
              />
            ) : (
              <div className="bg-white rounded-xl border border-[#dae0e7] shadow-sm p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">description</span>
                <h3 className="text-xl font-semibold mb-2">No Medical Records</h3>
                <p className="text-[#5e758d]">You don't have any medical records yet.</p>
              </div>
            )}
          </div>
        );
      case 'doctor-appointments':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-6">Patient Appointments</h2>
            {appointments?.filter(apt => apt.doctorId === currentUser.id).length > 0 ? (
              <DoctorAppointments
                appointments={appointments.filter(apt => apt.doctorId === currentUser.id)}
                getPatientName={getPatientName}
                onUpdateAppointmentStatus={onUpdateAppointmentStatus}
              />
            ) : (
              <div className="bg-white rounded-xl border border-[#dae0e7] shadow-sm p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">stethoscope</span>
                <h3 className="text-xl font-semibold mb-2">No Appointments</h3>
                <p className="text-[#5e758d]">You don't have any patient appointments scheduled.</p>
              </div>
            )}
          </div>
        );
      case 'add-record':
        return (
          <div className="py-6">
            <AddRecord
              patients={users?.filter(u => u.role === 'patient') || []}
              onAddRecord={onAddRecord}
            />
          </div>
        );
      case 'view-records':
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-6">All Patient Records</h2>
            {patientRecords?.length > 0 ? (
              <ViewRecords
                records={patientRecords}
                getPatientName={getPatientName}
              />
            ) : (
              <div className="bg-white rounded-xl border border-[#dae0e7] shadow-sm p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">description</span>
                <h3 className="text-xl font-semibold mb-2">No Records Available</h3>
                <p className="text-[#5e758d]">There are no medical records in the system yet.</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="py-6 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">dashboard</span>
            <h3 className="text-xl font-semibold mb-2">Welcome to Dashboard</h3>
            <p className="text-[#5e758d]">Select an option from the navigation to get started</p>
          </div>
        );
    }
  };

  // Default content for other tabs
  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default Dashboard;

