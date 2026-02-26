// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import Auth from './components/Auth';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import { api } from './services/api';
import './app.css';
import AfyaclickAssistantWidget from './components/AfyaclickAssistantWidget';


// Map user roles to their default dashboard tab
const getDefaultTabForRole = (role) => {
  return 'dashboard'; // All users go to their main dashboard
};

// Demo users used as fallback/offline data
const DEMO_USERS = [
  { id: 1, email: 'doctor@hospital.com', password: 'doc123', role: 'doctor', name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
  { id: 2, email: 'patient@hospital.com', password: 'pat123', role: 'patient', name: 'John Doe', dob: '1990-05-15' }
];

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [users, setUsers] = useState(DEMO_USERS); // start with demo users so login works offline
  const [appointments, setAppointments] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load initial data from backend
  useEffect(() => {
    loadInitialData();
  }, []);

  // Debug currentUser state changes
  useEffect(() => {
    console.log('currentUser state changed:', currentUser);
    if (currentUser) {
      console.log('User is logged in, should show dashboard');
    } else {
      console.log('No user logged in, should show auth page');
    }
  }, [currentUser]);

  const loadInitialData = async () => {
    try {
      // Load doctors and patients from backend
      const [doctorsRes, , appointmentsRes] = await Promise.all([
        api.getDoctors(),
        api.getPatients(),
        api.getAppointments()
      ]);

      if (doctorsRes.success) {
        const backendDoctors = doctorsRes.doctors.map(doc => ({
          id: doc.doctor_id,
          email: doc.email || `${doc.name.toLowerCase().replace(' ', '.')}@hospital.com`,
          password: 'doc123',
          role: 'doctor',
          name: doc.name,
          specialty: doc.specialization
        }));
        
        // Use demo users as fallback, combine with backend data
        const demoUsers = [
          { id: 1, email: 'doctor@hospital.com', password: 'doc123', role: 'doctor', name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
          { id: 2, email: 'patient@hospital.com', password: 'pat123', role: 'patient', name: 'John Doe', dob: '1990-05-15' }
        ];
        
        setUsers([...demoUsers, ...backendDoctors]);
      }

      if (appointmentsRes.success) {
        const backendAppointments = appointmentsRes.appointments.map(apt => ({
          id: apt.id,
          patientId: apt.patient_id,
          doctorId: apt.doctor_id,
          date: apt.appointment_date,
          time: apt.appointment_time,
          reason: 'Medical Consultation', // You might want to add this field to your backend
          status: apt.status.toLowerCase()
        }));
        
        // Combine with demo appointments
        const demoAppointments = [
          { id: 1, patientId: 2, doctorId: 1, date: '2025-10-05', time: '10:00', reason: 'Regular Checkup', status: 'confirmed' },
          { id: 2, patientId: 2, doctorId: 1, date: '2025-10-10', time: '14:00', reason: 'Follow-up', status: 'pending' }
        ];
        
        setAppointments([...demoAppointments, ...backendAppointments]);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      // Fallback to demo data if backend is not available
      setUsers([
        { id: 1, email: 'doctor@hospital.com', password: 'doc123', role: 'doctor', name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
        { id: 2, email: 'patient@hospital.com', password: 'pat123', role: 'patient', name: 'John Doe', dob: '1990-05-15' }
      ]);
      setAppointments([
        { id: 1, patientId: 2, doctorId: 1, date: '2025-10-05', time: '10:00', reason: 'Regular Checkup', status: 'confirmed' },
        { id: 2, patientId: 2, doctorId: 1, date: '2025-10-10', time: '14:00', reason: 'Follow-up', status: 'pending' }
      ]);
    }

    // Patient records remain as demo data for now
    setPatientRecords([
      { id: 1, patientId: 2, date: '2025-09-15', diagnosis: 'Hypertension', treatment: 'Prescribed medication', notes: 'Monitor blood pressure weekly' }
    ]);
  };

  const handleLogin = async (loginData) => {
    try {
      setLoading(true);

      // Try backend login first
      console.log('Attempting backend login for:', loginData.email);
      const backendResponse = await api.login(loginData.email, loginData.password);
      console.log('Backend response:', backendResponse);

      if (backendResponse.success) {
        const backendUser = backendResponse.user;
        // Ensure we have a role to drive navigation
        const role = backendUser.role || backendUser.user_type || 'patient';
        console.log('Login successful, setting user:', backendUser);

        // Set user and navigate to appropriate dashboard
        const userData = { ...backendUser, role };
        setCurrentUser(userData);
        setActiveTab(getDefaultTabForRole(role));

        // Force a re-render by updating loading state
        setTimeout(() => setLoading(false), 10);

        console.log('User set to:', userData);
        console.log('Active tab set to:', getDefaultTabForRole(role));
        console.log('currentUser should now be set, app should redirect to dashboard');

        return;
      }

      // Backend login failed, fallback to local users list
      console.log('Backend login failed:', backendResponse.error);
      const localUser = users.find(
        (u) => u.email === loginData.email && u.password === loginData.password
      );
      if (localUser) {
        const role = localUser.role || 'patient';
        setCurrentUser(localUser);
        setActiveTab(getDefaultTabForRole(role));

        // Force a re-render
        setTimeout(() => setLoading(false), 10);

        // User successfully logged in and navigated to dashboard

        return;
      }
      alert(`Login failed: ${backendResponse.error || 'Invalid credentials'}`);

    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: Backend server not available. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (registerData) => {
    try {
      setLoading(true);
      
      if (users.find(u => u.email === registerData.email)) {
        alert('Email already exists');
        return;
      }
      
      // Register in backend based on role
      console.log('Registering with data:', registerData);
      if (registerData.role === 'patient') {
        const patientData = {
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password
        };
        
        const result = await api.registerPatient(patientData);
        console.log('Patient registration API result:', result);
        if (result.success) {
          const newUser = {
            id: result.patient.id,
            // Ensure first_name and last_name are correctly extracted from name
            first_name: registerData.name.split(' ')[0],
            last_name: registerData.name.split(' ').slice(1).join(' ') || '',
            email: registerData.email,
            phone: registerData.phone,
            role: 'patient' // Explicitly set role
          };
          setUsers([...users, newUser]);
          // Auto-login and redirect to the correct dashboard
          setCurrentUser(newUser);
          setActiveTab(getDefaultTabForRole(newUser.role));
          console.log('Patient registered and logged in:', newUser);
        } else {
          alert('Registration failed: ' + result.error);
          console.error('Patient registration failed:', result.error);
        }
      } else if (registerData.role === 'doctor') {
        const doctorData = {
          name: registerData.name,
          specialty: registerData.role === 'doctor' ? 'General Practice' : registerData.specialty,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password
        };
        
        const result = await api.registerDoctor(doctorData);
        console.log('Doctor registration API result:', result);
        if (result.success) {
          const newUser = {
            id: result.doctor.doctor_id,
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            role: 'doctor', // Explicitly set role
            specialty: registerData.specialty
          };
          setUsers([...users, newUser]);
          // Auto-login and redirect to the correct dashboard
          setCurrentUser(newUser);
          setActiveTab(getDefaultTabForRole(newUser.role));
          console.log('Doctor registered and logged in:', newUser);
        } else {
          alert('Registration failed: ' + result.error);
          console.error('Doctor registration failed:', result.error);
        }
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (appointmentData) => {
    try {
      // Send to backend
      const backendAppointment = {
        patient_id: currentUser.id,
        doctor_id: appointmentData.doctorId.toString(),
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        status: 'Scheduled'
      };
      
      const result = await api.createAppointment(backendAppointment);
      
      if (result.success) {
        // Also update local state
        const newAppointment = {
          id: result.appointment.id,
          patientId: currentUser.id,
          ...appointmentData,
          doctorId: parseInt(appointmentData.doctorId),
          status: 'pending'
        };
        setAppointments([...appointments, newAppointment]);
        alert('Appointment booked successfully!');
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      // Fallback to local state
      const newAppointment = {
        id: appointments.length + 1,
        patientId: currentUser.id,
        ...appointmentData,
        doctorId: parseInt(appointmentData.doctorId),
        status: 'pending'
      };
      setAppointments([...appointments, newAppointment]);
      alert('Appointment booked successfully! (Local storage)');
      return true;
    }
  };

  const handleAddRecord = async (recordData) => {
    try {
      const newRecord = {
        id: patientRecords.length + 1,
        ...recordData,
        patientId: parseInt(recordData.patientId),
        date: new Date().toISOString().split('T')[0]
      };
      setPatientRecords([...patientRecords, newRecord]);
      alert('Patient record added successfully!');
      return true;
    } catch (error) {
      alert('Failed to add record: ' + error.message);
      return false;
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status } : apt
      ));
      return true;
    } catch (error) {
      alert('Failed to update appointment: ' + error.message);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('login');
  };

  if (!currentUser) {
    return <Auth
      key="auth-component"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogin={handleLogin}
      onRegister={handleRegister}
      loading={loading}
    />;
  }

  // Main app layout with sidebar
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar Navigation */}
      <Navigation 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      <AfyaclickAssistantWidget userRole={currentUser?.role} userId={currentUser?.id} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          currentUser={currentUser} 
          onLogout={handleLogout}
          onSearch={setSearchQuery}
        />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Dashboard
            activeTab={activeTab}
            currentUser={currentUser}
            users={users}
            appointments={appointments}
            patientRecords={patientRecords}
            onBookAppointment={handleBookAppointment}
            onAddRecord={handleAddRecord}
            onUpdateAppointmentStatus={updateAppointmentStatus}
            searchQuery={searchQuery}
          />
        </main>
      </div>
    </div>
  );
};

export default App;

