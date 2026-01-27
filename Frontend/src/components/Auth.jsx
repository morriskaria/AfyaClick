import React, { useState } from 'react';

// LoginForm Component
const LoginForm = ({ onLogin, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-300 ml-1 uppercase tracking-wide">Email Address</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">mail</span>
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            disabled={loading}
            className="block w-full rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-11 py-3.5 text-base focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-300 ml-1 uppercase tracking-wide">Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            className="block w-full rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-11 pr-12 py-3.5 text-base focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
          />
          <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" type="button">
            <span className="material-symbols-outlined text-[20px]">visibility_off</span>
          </button>
        </div>
        <div className="flex justify-end pt-1">
          <a className="text-sm font-semibold text-primary hover:text-blue-600 transition-colors" href="#">Forgot Password?</a>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-blue-900/40 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
        type="button"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Signing in...
          </>
        ) : (
          <>
            <span>Sign In</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </>
        )}
      </button>
    </div>
  );
};

// RegisterForm Component
const RegisterForm = ({ onRegister, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    onRegister(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-300 ml-1 uppercase tracking-wide">Full Name</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={loading}
            className="block w-full rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-11 py-3.5 text-base focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-300 ml-1 uppercase tracking-wide">Email Address</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">mail</span>
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            disabled={loading}
            className="block w-full rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-11 py-3.5 text-base focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-300 ml-1 uppercase tracking-wide">Phone Number</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">call</span>
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            disabled={loading}
            className="block w-full rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-11 py-3.5 text-base focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-300 ml-1 uppercase tracking-wide">Register As</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">stethoscope</span>
          </div>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="block w-full rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-11 pr-8 py-3.5 text-base focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm appearance-none"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-300 ml-1 uppercase tracking-wide">Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            className="block w-full rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-11 pr-12 py-3.5 text-base focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
          />
          <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" type="button">
            <span className="material-symbols-outlined text-[20px]">visibility_off</span>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 dark:text-gray-300 ml-1 uppercase tracking-wide">Confirm Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            className="block w-full rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-11 pr-12 py-3.5 text-base focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
          />
          <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" type="button">
            <span className="material-symbols-outlined text-[20px]">visibility_off</span>
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-blue-900/40 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
        type="button"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Creating account...
          </>
        ) : (
          <>
            <span>Create Account</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </>
        )}
      </button>
    </div>
  );
};

// Main Auth Component
const Auth = ({ activeTab, setActiveTab, onLogin, onRegister, loading }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display antialiased min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full h-[45vh] bg-blue-50 dark:bg-surface-dark overflow-hidden shrink-0">
        <img
          alt="Medical Professional"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-100"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtwygKiLohF3ecCgK-NulWSZj3t-Xvu8XXZ6TvgfdjAMM3LzhktuwteNyP4NMt0An4xX-yrjMiJd03SkmMw7SvziTE5kbKZXvYFJLenGqam178VRXHBeVk2xfckgbokppCk2eBaifTTcNEKe-XcXuzkpXH_VuhALQpyc6AM05f5yM4aQMQuvwAqSmFj_c691WjQu4uFNAAFYDBCt4DpIBgcjIlo5aCvs8kHlryH7F8gnrB4eyX0a3JulwaWZt4H6qqPhH-vGgPLSb6"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

        <div className="absolute bottom-12 left-6 right-6 text-white z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="material-symbols-outlined text-[24px]">local_hospital</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">AfyyaClick</h1>
          </div>
          <p className="text-blue-50/90 text-base font-medium leading-relaxed max-w-xs drop-shadow-sm">
            Professional coordination for modern healthcare teams.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-surface-light dark:bg-surface-dark px-6 pt-8 pb-8 rounded-t-[32px] -mt-8 relative z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-none flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl flex mb-8">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 rounded-[10px] text-sm font-bold transition-all transform duration-200 ${
              activeTab === 'login'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 rounded-[10px] text-sm font-bold transition-all transform duration-200 ${
              activeTab === 'register'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="flex flex-col gap-5">
          {activeTab === 'login' ? (
            <LoginForm onLogin={onLogin} loading={loading} />
          ) : (
            <RegisterForm onRegister={onRegister} loading={loading} />
          )}
        </div>

        
      </div>
    </div>
  );
};

export default Auth;