// src/components/Navigation.jsx

const Navigation = ({ currentUser, activeTab, setActiveTab }) => {
  const patientNavItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'book-appointment', icon: 'calendar_today', label: 'Book Appointment' },
    { id: 'my-appointments', icon: 'event', label: 'My Appointments' },
    { id: 'my-records', icon: 'clinical_notes', label: 'Medical Records' },
  ];

  const doctorNavItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'doctor-appointments', icon: 'calendar_today', label: 'Appointments' },
    { id: 'view-records', icon: 'group', label: 'Patients' },
    { id: 'add-record', icon: 'add_box', label: 'Add Record' },
  ];

  const navItems = currentUser.role === 'patient' ? patientNavItems : doctorNavItems;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-[#dae0e7] flex flex-col justify-between h-full">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/src/assets/Affyaclicklogo.png" alt="AfyaClick Logo" className="h-10 object-contain" />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-[#5e758d] hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </a>
          ))}
          
          {/* Settings Link */}
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#5e758d] hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => {}}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
      </div>

      {/* Emergency Alert Button */}
      <div className="p-4 border-t border-[#dae0e7]">
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-[18px]">emergency</span>
          Emergency Alert
        </button>
      </div>
    </aside>
  );
};

export default Navigation;

