// src/components/Header.jsx

const Header = ({ currentUser, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center justify-between p-4">
        <button className="flex size-10 items-center justify-center text-[#111418] dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">AfyyaClick</h2>
        <div className="flex items-center gap-2">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-[#111418] dark:text-white">search</span>
          </button>
          <button
            className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"
            onClick={onLogout}
            title="Logout"
          >
            <img
              alt="User Profile Picture"
              className="w-full h-full object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=137fec&color=fff&size=40`}
            />
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;