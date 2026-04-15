// src/components/Header.jsx
// top header
// displaying search bar
// displaying notifications
// displaying user profile
// displaying logout button 

const Header = ({ currentUser, onLogout, onSearch, notifications = [], onMarkAllRead }) => {
  const userNotifications = notifications.filter(
    (n) =>
      !n.forUserId || !currentUser || n.forUserId === currentUser.id
  );
  const unreadCount = userNotifications.filter(n => !n.read).length;
  return (
    <header className="bg-white border-b border-[#dae0e7] px-8 py-4 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-xs hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5e758d] text-[20px]">search</span>
          <input 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20" 
            placeholder="Search patients, files..." 
            type="text"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Right Side - Profile & Notifications */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="p-2 text-[#5e758d] hover:bg-slate-100 rounded-lg relative"
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-[10px] leading-[14px] text-white rounded-full border-2 border-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {userNotifications.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#dae0e7] rounded-lg shadow-lg z-20">
                <div className="px-4 py-2 flex items-center justify-between border-b border-[#dae0e7]">
                  <span className="text-xs font-bold text-[#5e758d] uppercase tracking-wide">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-primary hover:underline"
                      onClick={onMarkAllRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {userNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-2 text-xs border-b border-[#f1f4f8] last:border-b-0 ${
                        n.read ? 'bg-white' : 'bg-primary/5'
                      }`}
                    >
                      <p className="font-medium text-gray-800">{n.message}</p>
                      <p className="text-[10px] text-[#9aa7b8] mt-1">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="p-2 text-[#5e758d] hover:bg-slate-100 rounded-lg">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 bg-cover bg-center border-2 border-primary/20">
            <img
              alt={`${currentUser.name} profile`}
              className="w-full h-full rounded-full object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=137fec&color=fff&size=128`}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">{currentUser.name}</h1>
            <p className="text-[#5e758d] text-xs mt-1 font-medium">
              {currentUser.role === 'doctor' 
                ? `${currentUser.specialty || 'Doctor'} Dept.` 
                : 'Patient'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#5e758d] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

