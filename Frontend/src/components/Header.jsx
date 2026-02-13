// src/components/Header.jsx

const Header = ({ currentUser, onLogout, onSearch }) => {
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
          <button className="p-2 text-[#5e758d] hover:bg-slate-100 rounded-lg relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
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

