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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">Email Address</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007bff] transition-colors">
            <span className="material-symbols-outlined text-xl">mail</span>
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="dr.smith@hospital.com"
            disabled={loading}
            className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
          <a className="text-xs font-bold text-[#007bff] hover:underline" href="#">Forgot password?</a>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007bff] transition-colors">
            <span className="material-symbols-outlined text-xl">lock</span>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            className="block w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all text-sm outline-none"
          />
          <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600" type="button">
            <span className="material-symbols-outlined text-xl">visibility</span>
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          className="h-4 w-4 rounded border-gray-300 text-[#007bff] focus:ring-[#007bff]"
          id="remember"
          type="checkbox"
        />
        <label className="ml-2 block text-sm text-gray-600 dark:text-gray-400" htmlFor="remember">Remember me for 30 days</label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#007bff] hover:bg-[#007bff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007bff] transition-all transform active:scale-[0.98]"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Signing in...
          </>
        ) : (
          <>
            Sign In to Dashboard
            <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
          </>
        )}
      </button>
    </form>
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Switcher */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Identify as</label>
        <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/50 p-1.5">
          <label className="flex cursor-pointer h-full grow items-center justify-center rounded-lg px-4 transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-gray-700 has-[:checked]:shadow-sm has-[:checked]:text-[#007bff] text-gray-500 text-sm font-semibold">
            <span className="material-symbols-outlined text-lg mr-2">person</span>
            <span>Patient</span>
            <input
              checked={formData.role === 'patient'}
              className="hidden"
              name="role"
              onChange={handleChange}
              type="radio"
              value="patient"
            />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center rounded-lg px-4 transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-gray-700 has-[:checked]:shadow-sm has-[:checked]:text-[#007bff] text-gray-500 text-sm font-semibold">
            <span className="material-symbols-outlined text-lg mr-2">medical_services</span>
            <span>Doctor</span>
            <input
              checked={formData.role === 'doctor'}
              className="hidden"
              name="role"
              onChange={handleChange}
              type="radio"
              value="doctor"
            />
          </label>
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-name">Full Name</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007bff] transition-colors">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <input
            type="text"
            id="reg-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={loading}
            className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-email">Email Address</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007bff] transition-colors">
            <span className="material-symbols-outlined text-xl">mail</span>
          </div>
          <input
            type="email"
            id="reg-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            disabled={loading}
            className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* Phone Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-phone">Phone Number</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007bff] transition-colors">
            <span className="material-symbols-outlined text-xl">call</span>
          </div>
          <input
            type="tel"
            id="reg-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            disabled={loading}
            className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-password">Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007bff] transition-colors">
            <span className="material-symbols-outlined text-xl">lock</span>
          </div>
          <input
            type="password"
            id="reg-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            className="block w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all text-sm outline-none"
          />
          <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600" type="button">
            <span className="material-symbols-outlined text-xl">visibility</span>
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-confirm-password">Confirm Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007bff] transition-colors">
            <span className="material-symbols-outlined text-xl">lock</span>
          </div>
          <input
            type="password"
            id="reg-confirm-password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            className="block w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all text-sm outline-none"
          />
          <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600" type="button">
            <span className="material-symbols-outlined text-xl">visibility</span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#007bff] hover:bg-[#007bff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007bff] transition-all transform active:scale-[0.98]"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
};

// Main Auth Component
const Auth = ({ activeTab, setActiveTab, onLogin, onRegister, loading }) => {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden bg-[#f5f7f8] dark:bg-[#0f1923]">
      {/* Left Side: Hero Image & Branding */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJE_cBxgqhnznSF2ptsx93EwjnZqQg7MyRG4iyO3dftx9-yd533n5XgQOFvarDsr7M6YjwQXdR8qXJKKjNWs3mE3fyLTEpxNN3mf3VO54kyGQpYFbF8N82VhLbUFMbx5XW80HJAfOsISy_k70AJC2cBbTYb32FfAmoXG5FLSImmq9oCidrIBsZvg4r98fmWV3TzwB8byLZuWhJxI3kAViQOu4nVKo_3q4_iTPUgHqJ9TQfAJ5QyUXp1yYjHZkUp2ElPB21R5WaZeI')`
          }}
        >
          <div className="absolute inset-0 bg-[#007bff]/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#007bff]/80 to-transparent"></div>
        </div>
        
        {/* Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <svg className="w-8 h-8 text-[#007bff]" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight">AfyyaClick</h1>
        </div>
        
        {/* Tagline */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-extrabold leading-tight mb-6">Professional coordination for modern healthcare teams.</h2>
          <p className="text-lg text-white/90 font-medium">Streamlining patient care and clinical workflows with secure, real-time collaboration tools.</p>
          
          <div className="mt-12 flex gap-4">
            <div className="flex -space-x-3">
              <img 
                className="h-10 w-10 rounded-full border-2 border-[#007bff] bg-gray-200" 
                alt="Profile photo of a female doctor"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3q4AtZFM0UZt3liOcOTYvlKgnMBB_Ifu1VAnbXtef4CuMq0CPCVjieKk0UQjodiQlNiNiFXd0PG25vqZBYuZS6tLUw-aDhY-wsqrz_anouRkchuWzt5oV63m9x1X33RPs0zEHWu6Govw1xOrTchTouByuznXQFDQPZ1r3qDKmguRo1H2xZDzlVvKkbUQI9oQ6NgbuvGAF9nBHqQEnWDw5ZIwv0MWkT-640CbY8KncKcoiBxHzd_PaPuu17oxVisQILTTQlCO31TQ"
              />
              <img 
                className="h-10 w-10 rounded-full border-2 border-[#007bff] bg-gray-200" 
                alt="Profile photo of a male doctor"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCAEXsOpemfbliV58_lQTAYeKctqlH4ZmdU2oPBrgtbXNXXuqcbGNRBRQ3ytfQT_nWp_610H5Ru60IqzPeN_8A_m9JGVvseMHbUecoe3iQMsGPupt1wcHft2bUQZS9LrbhZ4J0FilC1qcsLXqs7hOQoDjykFYTYqeSYx_B8JksIHVOpdogPrG3s71cgIlhwJ5zpe2_d85AAR8uPQwscjL43DfhrbbZXdGTy5lffFVPA-xh9FB9B6ZtBj8YksIGkl0kdDMA6FcTNEU"
              />
              <img 
                className="h-10 w-10 rounded-full border-2 border-[#007bff] bg-gray-200" 
                alt="Profile photo of a medical specialist"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOBiwA2ztnYWcTPgfeW-yDe---LwuCeeS64_r0rMaxyNg-5M384vGk0xWuBa-xekXUHOOgxh9U4H3zDW6GIrKJOa0oSwz1P4p8qsCqpqM2Ut3IyDXPBdgNUUzCVNC0YUFZUaze30zjrT9T82AerkzxCe74b9hsbnlCwt2Jcrh1ECk9qqfkRJz8MbxBs4MpzIQHV_a8RN8UBKHsPlOotE6UrWOx7WoimDzVnwwXXYHyptcnhhXCMTlEbS__k-JENP55KQI6l3dncaQ"
              />
            </div>
            <div className="text-sm font-medium">
              <p>Joined by 2,000+</p>
              <p className="text-white/70">Healthcare professionals</p>
            </div>
          </div>
        </div>
        
        {/* Footer Meta */}
        <div className="relative z-10 text-sm text-white/60 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span>HIPAA Compliant &amp; Secure Data Encryption</span>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white dark:bg-[#0f1923]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-[#007bff] p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AfyyaClick</h1>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Access your clinical dashboard and patient records.</p>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'login' 
                  ? 'border-[#007bff] text-[#007bff]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Login
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'register' 
                  ? 'border-[#007bff] text-[#007bff]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          {/* Auth Form */}
          {activeTab === 'login' ? (
            <LoginForm onLogin={onLogin} loading={loading} />
          ) : (
            <RegisterForm onRegister={onRegister} loading={loading} />
          )}

          {/* SSO Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-[#0f1923] text-gray-500">Or continue with SSO</span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
              <img 
                alt="Google Logo" 
                className="h-5 w-5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBioFiEqrIxrc3L_4DKoy6He4LNqdZm29xxGQkqQ3UxEcvElP5_xX6wPERaZYTV6R4mOvuQOeiN2VpmEHDyBfv3YOOT-iA8Ng-Sj1UWxfKC0QQ-NA1ZdBoE1is36ZdjdJ56-rA89F9-eKgCinDqmBomxemPRAXB2UZ6Rm2AAtnhKP4bNuPcJob299DHdNd7qF8CAcPq-K-xBTuLQr0qEdbsnbx-iFBBUC_JcEg_mml7b1b7ICoyvYpiV-mEQn3CKe9g-nOEw_a2OaY"
              />
              Google
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
              <img 
                alt="Microsoft Logo" 
                className="h-5 w-5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjDxrf6cMv0wjBYrrRyb30-tCR0f2hrg_aPoDcZu3ti127IrWwHxUH4evncAAFzxhu32G95dYnhB0xydyscVLS1PFHQZGQwWWZoOx1LW0Wzb-pios4W22gUh3-Jt5q19T8qMh9fi7VLcEXdNCeUE9E3EHxCLWIe5U7lYMIv3bw21Mz5L_b7hwegZZePHrci0vFeztFjSyWsp0frrIpB95uL5qvmjw-WxdNb8p_R2tYk4tKkSwNfqlMGuYtfepvNFutcFCAbEb8o2I"
              />
              Microsoft
            </button>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              By signing in, you agree to our 
              <a className="font-bold text-[#007bff] hover:underline" href="#"> Terms of Service</a> 
              {' '}and{' '}
              <a className="font-bold text-[#007bff] hover:underline" href="#">Privacy Policy</a>.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Auth;

