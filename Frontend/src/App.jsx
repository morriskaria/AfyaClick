// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import Auth from './components/Auth';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import { api } from './services/api';
import LandingPage from './components/LandingPage';
import './app.css';
import AfyaclickAssistantWidget from './components/AfyaclickAssistantWidget';
import logo from './assets/Affyaclicklogo.png';


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
  const [showLanding, setShowLanding] = useState(true);
  const [users, setUsers] = useState(DEMO_USERS); // start with demo users so login works offline
  const [appointments, setAppointments] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Initialize App Metadata (Favicon/Title) and Load Data
  useEffect(() => {
    loadInitialData();
    
    // Set Favicon programmatically
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = logo;
    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = "AfyaClick - Modern Healthcare Management";
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
      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
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
        
        const backendPatients =
          patientsRes?.success && Array.isArray(patientsRes.patients)
            ? patientsRes.patients.map((p) => ({
                id: p.id,
                email: p.email,
                phone: p.phone,
                role: 'patient',
                name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || `Patient #${p.id}`,
              }))
            : [];

        setUsers([...demoUsers, ...backendDoctors, ...backendPatients]);
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
    setLoading(true);
    try {
      // Try backend login first
      const backendResponse = await api.login(loginData.email, loginData.password);

      if (backendResponse.success) {
        const backendUser = backendResponse.user;
        const role = backendUser.role || backendUser.user_type || 'patient';
        // Build a unified user object with a 'name' field always present
        const userData = {
          ...backendUser,
          role,
          name: backendUser.name || `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim() || backendUser.email
        };
        setCurrentUser(userData);
        setActiveTab(getDefaultTabForRole(role));
        return;
      }

      // Backend login failed — throw so the form shows the error inline
      throw new Error(backendResponse.error || 'Invalid email or password.');

    } catch (error) {
      setLoading(false);
      throw error; // Re-throw so LoginForm can catch and display it
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (registerData) => {
    setLoading(true);
    try {
      if (users.find(u => u.email === registerData.email)) {
        throw new Error('An account with this email already exists.');
      }

      if (registerData.role === 'patient') {
        const result = await api.registerPatient({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password
        });

        if (result.success) {
          const newUser = {
            id: result.patient.id,
            name: registerData.name,
            first_name: registerData.name.split(' ')[0],
            last_name: registerData.name.split(' ').slice(1).join(' ') || '',
            email: registerData.email,
            phone: registerData.phone,
            role: 'patient'
          };
          setUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
          setActiveTab(getDefaultTabForRole('patient'));
          return;
        } else {
          throw new Error(result.error || 'Patient registration failed.');
        }

      } else if (registerData.role === 'doctor') {
        const result = await api.registerDoctor({
          name: registerData.name,
          specialty: 'General Practice',
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password
        });

        if (result.success) {
          const newUser = {
            id: result.doctor.doctor_id,
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            role: 'doctor',
            specialty: 'General Practice'
          };
          setUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
          setActiveTab(getDefaultTabForRole('doctor'));
          return;
        } else {
          throw new Error(result.error || 'Doctor registration failed.');
        }
      }
      else if (registerData.role === 'receptionist') {
        const result = await api.registerReceptionist({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password
        });

        if (result.success) {
          const newUser = {
            id: result.receptionist.id,
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            role: 'receptionist'
          };
          setUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
          setActiveTab(getDefaultTabForRole('receptionist'));
          return;
        } else {
          throw new Error(result.error || 'Receptionist registration failed.');
        }
      }

    } catch (error) {
      setLoading(false);
      throw error; // Re-throw so RegisterForm can catch and display it
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (appointmentData) => {
    try {
      const patientId =
        currentUser?.role === 'receptionist'
          ? parseInt(appointmentData.patientId)
          : currentUser.id;

      if (!patientId) {
        alert('Please select a patient.');
        return false;
      }

      // Send to backend
      const backendAppointment = {
        patient_id: patientId,
        doctor_id: appointmentData.doctorId?.toString(),
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        status: 'Scheduled'
      };
      
      const result = await api.createAppointment(backendAppointment);
      
      if (result.success) {
        // Also update local state
        const newAppointment = {
          id: result.appointment.id,
          ...appointmentData,
          patientId,
          doctorId: appointmentData.doctorId?.toString(),
          status: 'pending'
        };
        setAppointments([...appointments, newAppointment]);
        const now = new Date().toISOString();
        const patientName =
          users.find((u) => u.role === 'patient' && u.id === patientId)?.name || `patient #${patientId}`;
        const doctorName =
          users.find((u) => u.role === 'doctor' && String(u.id) === String(newAppointment.doctorId))?.name ||
          `doctor ${newAppointment.doctorId}`;

        setNotifications((prev) => [
          {
            id: Date.now(),
            type: 'appointment',
            message: `New appointment scheduled for ${patientName} with Dr. ${doctorName}`,
            timestamp: now,
            read: false,
            forUserId: newAppointment.doctorId,
          },
          {
            id: Date.now() + 1,
            type: 'appointment',
            message: `Your appointment with Dr. ${doctorName} was scheduled for ${newAppointment.date} at ${newAppointment.time}`,
            timestamp: now,
            read: false,
            forUserId: patientId,
          },
          ...prev,
        ]);
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
        patientId:
          currentUser?.role === 'receptionist'
            ? parseInt(appointmentData.patientId)
            : currentUser.id,
        ...appointmentData,
        doctorId: appointmentData.doctorId?.toString(),
        status: 'pending'
      };
      setAppointments([...appointments, newAppointment]);
      const now = new Date().toISOString();
      const patientName =
        users.find((u) => u.role === 'patient' && u.id === newAppointment.patientId)?.name ||
        `patient #${newAppointment.patientId}`;
      const doctorName =
        users.find((u) => u.role === 'doctor' && String(u.id) === String(newAppointment.doctorId))?.name ||
        `doctor ${newAppointment.doctorId}`;

      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'appointment',
          message: `New appointment scheduled for ${patientName} with Dr. ${doctorName}`,
          timestamp: now,
          read: false,
          forUserId: newAppointment.doctorId,
        },
        {
          id: Date.now() + 1,
          type: 'appointment',
          message: `Your appointment with Dr. ${doctorName} was scheduled for ${newAppointment.date} at ${newAppointment.time}`,
          timestamp: now,
          read: false,
          forUserId: newAppointment.patientId,
        },
        ...prev,
      ]);
      alert('Appointment booked successfully! (Local storage)');
      return true;
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return false;

    try {
      const result = await api.deleteAppointment(appointmentId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete appointment');
      }

      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));

      const now = new Date().toISOString();
      const patientName =
        users.find((u) => u.role === 'patient' && u.id === apt.patientId)?.name || `patient #${apt.patientId}`;
      const doctorName =
        users.find((u) => u.role === 'doctor' && String(u.id) === String(apt.doctorId))?.name ||
        `doctor ${apt.doctorId}`;

      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'appointment',
          message: `Appointment for ${patientName} on ${apt.date} at ${apt.time} was cancelled`,
          timestamp: now,
          read: false,
          forUserId: apt.doctorId,
        },
        {
          id: Date.now() + 1,
          type: 'appointment',
          message: `Your appointment with Dr. ${doctorName} on ${apt.date} at ${apt.time} was cancelled`,
          timestamp: now,
          read: false,
          forUserId: apt.patientId,
        },
        ...prev,
      ]);

      return true;
    } catch (error) {
      alert('Failed to delete appointment: ' + error.message);
      return false;
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
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'record',
          message: `New record added for patient #${newRecord.patientId}`,
          timestamp: new Date().toISOString(),
          read: false,
          forUserId: currentUser.role === 'doctor' ? currentUser.id : undefined,
        },
        ...prev,
      ]);
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
    if (showLanding) {
      return (
        <LandingPage 
          onGetStarted={() => {
            setShowLanding(false);
            setActiveTab('login');
          }} 
        />
      );
    }
    return (
      <Auth
        key="auth-component"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={loading}
      />
    );
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
          notifications={notifications}
          onMarkAllRead={() =>
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
          }
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
            onDeleteAppointment={handleDeleteAppointment}
            onAddRecord={handleAddRecord}
            onUpdateAppointmentStatus={updateAppointmentStatus}
            searchQuery={searchQuery}
            onTabChange={setActiveTab}
            onDeletePatient={async (patientId) => {
              try {
                setUsers(prev =>
                  prev.filter(u => !(u.role === 'patient' && u.id === patientId))
                );
                // TODO: wire to backend DELETE /patients/<id> when available
                alert('Patient deleted from current session view.');
                return true;
              } catch (error) {
                alert('Failed to delete patient: ' + error.message);
                return false;
              }
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
