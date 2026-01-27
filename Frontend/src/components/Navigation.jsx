// src/components/Navigation.jsx

const Navigation = ({ currentUser, activeTab, setActiveTab }) => {
  const patientNavItems = [
    { id: 'book-appointment', icon: 'calendar_add_on', label: 'Book' },
    { id: 'my-appointments', icon: 'calendar_today', label: 'Appts' },
    { id: 'my-records', icon: 'description', label: 'Records' },
    { id: 'dashboard', icon: 'space_dashboard', label: 'Home' },
  ];

  const doctorNavItems = [
    { id: 'dashboard', icon: 'grid_view', label: 'Dashboard' },
    { id: 'add-record', icon: 'add', label: 'Add', isFab: true },
    { id: 'view-records', icon: 'people', label: 'Patients' },
    { id: 'doctor-appointments', icon: 'calendar_today', label: 'Schedule' },
  ];

  const navItems = currentUser.role === 'patient' ? patientNavItems : doctorNavItems;

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div className="grid h-16 max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <div key={item.id} className="relative -top-6">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    activeTab === item.id
                      ? 'bg-dark-text dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300'
                  } shadow-lg hover:scale-105 transition-all`}
                >
                  <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                activeTab === item.id
                  ? 'text-primary'
                  : 'text-gray-500 dark:text-gray-400'
              } group transition-colors`}
              type="button"
            >
              <span className={`material-symbols-outlined text-[24px] mb-1 ${
                activeTab === item.id ? 'filled' : ''
              } group-hover:text-primary dark:group-hover:text-primary`}>
                {item.icon}
              </span>
              <span className={`text-xs group-hover:text-primary dark:group-hover:text-primary ${
                activeTab === item.id ? 'text-primary' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for bottom nav (usually handled by OS, simulated here) */}
      <div className="h-6 w-full bg-surface-light dark:bg-surface-dark fixed bottom-0 left-0 z-40"></div>
    </nav>
  );
};

export default Navigation;