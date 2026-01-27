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
}) => {
  const getPatientName = (id) => users?.find(u => u.id === id)?.name || 'Unknown';
  const getDoctorName = (id) => users?.find(u => u.id === id)?.name || 'Unknown';

  // Doctor Dashboard Content
  if (currentUser.role === 'doctor' && activeTab === 'dashboard') {
    const myAppointments = appointments?.filter(apt => apt.doctorId === currentUser.id) || [];
    const pendingAppointments = myAppointments.filter(apt => apt.status === 'pending');
    const todayAppointments = myAppointments.filter(apt => {
      const today = new Date().toISOString().split('T')[0];
      return apt.date === today;
    });

    return (
      <div className="flex flex-col gap-6">
        {/* Doctor Greeting */}
        <section className="px-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Good Morning,</p>
          <h2 className="text-[#111418] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
            Dr. {currentUser.name?.split(' ')[1] || currentUser.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {currentUser.specialty || 'Healthcare Professional'}
          </p>
        </section>

        {/* Today's Schedule */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em]">
              Today's Schedule
            </h1>
            <a className="text-primary text-sm font-semibold" href="#" onClick={() => setActiveTab('doctor-appointments')}>See all</a>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.slice(0, 2).map((apt) => (
                <div key={apt.id} className="group/card @container rounded-2xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 hover:shadow-md">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-20 h-16 sm:h-auto shrink-0 bg-blue-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl">schedule</span>
                    </div>
                    <div className="flex w-full grow flex-col justify-between p-4 sm:p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          {apt.time}
                        </div>
                        <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight mt-1">
                          {getPatientName(apt.patientId)}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {apt.reason || 'Medical Consultation'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="group/card @container rounded-2xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] overflow-hidden p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">event_busy</span>
              <h3 className="text-[#111418] dark:text-white text-lg font-bold mb-2">No Appointments Today</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">You have no scheduled appointments for today.</p>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section className="pl-4">
          <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em] mb-3 pr-4">
            Overview
          </h1>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pr-4">
            {/* Total Patients */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                  <span className="material-symbols-outlined">group</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">
                  {users?.filter(u => u.role === 'patient').length || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Patients</p>
              </div>
            </div>

            {/* Pending Appointments */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">{pendingAppointments.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending</p>
              </div>
            </div>

            {/* Today's Appointments */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500">
                  <span className="material-symbols-outlined">today</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">{todayAppointments.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Today</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="px-4 pb-4">
          <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em] mb-3">
            Quick Actions
          </h1>
          <div className="grid grid-cols-2 gap-3">
            {/* Add Patient Record */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => setActiveTab('add-record')}
            >
              <div className="mb-3 p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">note_add</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Add Patient<br/>Record
              </p>
            </button>

            {/* View All Patients */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => setActiveTab('view-records')}
            >
              <div className="mb-3 p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">group</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                View All<br/>Patients
              </p>
            </button>

            {/* Manage Appointments */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => setActiveTab('doctor-appointments')}
            >
              <div className="mb-3 p-3 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Manage<br/>Appointments
              </p>
            </button>

            {/* Medical Resources */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">school</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Medical<br/>Resources
              </p>
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Patient Dashboard Content
  if (currentUser.role === 'patient' && activeTab === 'dashboard') {
      const myAppointments = appointments?.filter(apt => apt.patientId === currentUser.id) || [];
    const nextAppointment = myAppointments.find(apt => apt.status === 'confirmed') ||
      myAppointments.find(apt => apt.status === 'pending');

    return (
      <div className="flex flex-col gap-6">
        {/* Headline Greeting */}
        <section className="px-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Good Morning,</p>
          <h2 className="text-[#111418] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h2>
        </section>

        {/* Next Appointment Card */}
        {nextAppointment && (
          <section className="px-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em]">
                Next Appointment
              </h1>
              <a className="text-primary text-sm font-semibold" href="#" onClick={() => {}}>See all</a>
            </div>

            <div className="group/card @container rounded-2xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row">
                {/* Image section */}
                <div className="relative w-full sm:w-32 h-40 sm:h-auto shrink-0 bg-gray-200">
                  <img
                    alt="Doctor portrait"
                    className="absolute inset-0 size-full object-cover"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getDoctorName(nextAppointment.doctorId))}&background=137fec&color=fff&size=128`}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary shadow-sm sm:hidden">
                    {nextAppointment.status === 'confirmed' ? 'Upcoming' : 'Pending'}
                  </div>
                </div>

                <div className="flex w-full grow flex-col justify-between p-4 sm:p-5">
                  <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      {nextAppointment.date} • {nextAppointment.time}
                    </div>
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mt-1">
                      Dr. {getDoctorName(nextAppointment.doctorId).split(' ').slice(1).join(' ')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      {nextAppointment.reason || 'Medical Consultation'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-auto">
                    <button className="flex-1 flex cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold leading-normal shadow-sm shadow-blue-200 dark:shadow-none">
                      Check-in
                    </button>
                    <button className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </button>
                    <button className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">location_on</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Health Vitals Summary */}
        <section className="pl-4">
          <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em] mb-3 pr-4">
            Health Vitals
          </h1>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pr-4">
            {/* Heart Rate */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px] mr-0.5">arrow_upward</span> 2%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">72 <span className="text-sm font-medium text-gray-500">bpm</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Heart Rate</p>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                  <span className="material-symbols-outlined">water_drop</span>
                </div>
                <span className="text-xs font-medium text-gray-400 flex items-center bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  --
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">120/80</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Blood Pressure</p>
              </div>
            </div>

            {/* Weight */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                  <span className="material-symbols-outlined">monitor_weight</span>
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px] mr-0.5">arrow_downward</span> 1%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">68 <span className="text-sm font-medium text-gray-500">kg</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Weight</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="px-4 pb-4">
          <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em] mb-3">
            Quick Actions
          </h1>
          <div className="grid grid-cols-2 gap-3">
            {/* Book New Appointment */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">calendar_add_on</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Book New<br/>Appointment
              </p>
            </button>

            {/* Request Prescription */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">medication</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Request<br/>Prescription
              </p>
            </button>

            {/* View Lab Results */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">science</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                View Lab<br/>Results
              </p>
            </button>

            {/* Medical Records */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">description</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Medical<br/>Records
              </p>
            </button>
          </div>
        </section>
      </div>
    );
  }

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
          <div className="px-4 py-6">
            <h2 className="text-[#111418] dark:text-white text-2xl font-bold mb-4">My Appointments</h2>
            {appointments?.filter(apt => apt.patientId === currentUser.id).length > 0 ? (
              <MyAppointments
                appointments={appointments.filter(apt => apt.patientId === currentUser.id)}
                getDoctorName={getDoctorName}
              />
            ) : (
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">calendar_today</span>
                <h3 className="text-xl font-semibold text-[#111418] dark:text-white mb-2">No Appointments Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't booked any appointments yet.</p>
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        );
      case 'my-records':
        return (
          <div className="px-4 py-6">
            <h2 className="text-[#111418] dark:text-white text-2xl font-bold mb-4">Medical Records</h2>
            {patientRecords?.filter(rec => rec.patientId === currentUser.id).length > 0 ? (
              <MedicalRecords
                records={patientRecords.filter(rec => rec.patientId === currentUser.id)}
              />
            ) : (
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">description</span>
                <h3 className="text-xl font-semibold text-[#111418] dark:text-white mb-2">No Medical Records</h3>
                <p className="text-gray-500 dark:text-gray-400">You don't have any medical records yet.</p>
              </div>
            )}
          </div>
        );
      case 'doctor-appointments':
        return (
          <div className="px-4 py-6">
            <h2 className="text-[#111418] dark:text-white text-2xl font-bold mb-4">Patient Appointments</h2>
            {appointments?.filter(apt => apt.doctorId === currentUser.id).length > 0 ? (
              <DoctorAppointments
                appointments={appointments.filter(apt => apt.doctorId === currentUser.id)}
                getPatientName={getPatientName}
                onUpdateAppointmentStatus={onUpdateAppointmentStatus}
              />
            ) : (
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">stethoscope</span>
                <h3 className="text-xl font-semibold text-[#111418] dark:text-white mb-2">No Appointments</h3>
                <p className="text-gray-500 dark:text-gray-400">You don't have any patient appointments scheduled.</p>
              </div>
            )}
          </div>
        );
      case 'add-record':
        return (
          <div className="px-4 py-6">
          <AddRecord
            patients={users?.filter(u => u.role === 'patient') || []}
            onAddRecord={onAddRecord}
          />
          </div>
        );
      case 'view-records':
        return (
          <div className="px-4 py-6">
            <h2 className="text-[#111418] dark:text-white text-2xl font-bold mb-4">All Patient Records</h2>
            {patientRecords?.length > 0 ? (
              <ViewRecords
                records={patientRecords}
                getPatientName={getPatientName}
              />
            ) : (
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">description</span>
                <h3 className="text-xl font-semibold text-[#111418] dark:text-white mb-2">No Records Available</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no medical records in the system yet.</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="px-4 py-6 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">dashboard</span>
            <h3 className="text-xl font-semibold text-[#111418] dark:text-white mb-2">Welcome to Dashboard</h3>
            <p className="text-gray-500 dark:text-gray-400">Select an option from the navigation to get started</p>
          </div>
        );
    }
  };

  // Handle patient dashboard vs other tabs
  if (currentUser.role === 'patient' && activeTab === 'dashboard') {
    const myAppointments = appointments?.filter(apt => apt.patientId === currentUser.id) || [];
    const nextAppointment = myAppointments.find(apt => apt.status === 'confirmed') ||
      myAppointments.find(apt => apt.status === 'pending');

  return (
      <div className="flex flex-col gap-6">
        {/* Headline Greeting */}
        <section className="px-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Good Morning,</p>
          <h2 className="text-[#111418] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h2>
        </section>

        {/* Next Appointment Card */}
        {nextAppointment && (
          <section className="px-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em]">
                Next Appointment
              </h1>
              <a className="text-primary text-sm font-semibold" href="#" onClick={() => {}}>See all</a>
            </div>

            <div className="group/card @container rounded-2xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row">
                {/* Image section */}
                <div className="relative w-full sm:w-32 h-40 sm:h-auto shrink-0 bg-gray-200">
                  <img
                    alt="Doctor portrait"
                    className="absolute inset-0 size-full object-cover"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getDoctorName(nextAppointment.doctorId))}&background=137fec&color=fff&size=128`}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary shadow-sm sm:hidden">
                    {nextAppointment.status === 'confirmed' ? 'Upcoming' : 'Pending'}
                  </div>
                </div>

                <div className="flex w-full grow flex-col justify-between p-4 sm:p-5">
                  <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      {nextAppointment.date} • {nextAppointment.time}
                    </div>
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mt-1">
                      Dr. {getDoctorName(nextAppointment.doctorId).split(' ').slice(1).join(' ')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      {nextAppointment.reason || 'Medical Consultation'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-auto">
                    <button className="flex-1 flex cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold leading-normal shadow-sm shadow-blue-200 dark:shadow-none">
                      Check-in
                    </button>
                    <button className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </button>
                    <button className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">location_on</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Health Vitals Summary */}
        <section className="pl-4">
          <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em] mb-3 pr-4">
            Health Vitals
          </h1>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pr-4">
            {/* Heart Rate */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px] mr-0.5">arrow_upward</span> 2%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">72 <span className="text-sm font-medium text-gray-500">bpm</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Heart Rate</p>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                  <span className="material-symbols-outlined">water_drop</span>
                </div>
                <span className="text-xs font-medium text-gray-400 flex items-center bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  --
                </span>
              </div>
                      <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">120/80</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Blood Pressure</p>
                    </div>
                  </div>

            {/* Weight */}
            <div className="flex flex-col justify-between min-w-[140px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                  <span className="material-symbols-outlined">monitor_weight</span>
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px] mr-0.5">arrow_downward</span> 1%
                </span>
              </div>
                      <div>
                <p className="text-2xl font-bold text-[#111418] dark:text-white">68 <span className="text-sm font-medium text-gray-500">kg</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Weight</p>
                      </div>
                    </div>
                  </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="px-4 pb-4">
          <h1 className="text-[#111418] dark:text-white text-[18px] font-bold leading-tight tracking-[-0.015em] mb-3">
            Quick Actions
          </h1>
          <div className="grid grid-cols-2 gap-3">
            {/* Book New Appointment */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">calendar_add_on</span>
              </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Book New<br/>Appointment
              </p>
            </button>

            {/* Request Prescription */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">medication</span>
                      </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Request<br/>Prescription
              </p>
            </button>

            {/* View Lab Results */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">science</span>
                    </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                View Lab<br/>Results
              </p>
            </button>

            {/* Medical Records */}
            <button
              className="flex flex-col items-start p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              onClick={() => {}}
            >
              <div className="mb-3 p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">description</span>
                  </div>
              <p className="text-left font-bold text-[#111418] dark:text-white leading-tight">
                Medical<br/>Records
              </p>
            </button>
                      </div>
        </section>
                    </div>
    );
  }

  // Default content for other tabs
  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default Dashboard;