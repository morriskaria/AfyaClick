// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = {
  // Auth endpoints
  async login(email, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async registerPatient(patientData) {
    const response = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: patientData.name.split(' ')[0],
        last_name: patientData.name.split(' ').slice(1).join(' ') || '',
        email: patientData.email,
        gender: 'Unknown',
        phone: patientData.phone || '',
        password: patientData.password
      }),
    });
    return response.json();
  },

  async registerDoctor(doctorData) {
    const response = await fetch(`${BASE_URL}/createdoctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctor_id: `DOC${Date.now()}`,
        name: doctorData.name,
        specialization: doctorData.specialty || 'General Practice',
        email: doctorData.email,
        phone: doctorData.phone || '',
        password: doctorData.password
      }),
    });
    return response.json();
  },

  // Data fetching endpoints
  async getPatients() {
    const response = await fetch(`${BASE_URL}/patients`);
    return response.json();
  },

  async getDoctors() {
    try {
      const response = await fetch(`${BASE_URL}/doctors`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  async getAppointments() {
    const response = await fetch(`${BASE_URL}/appointments`);
    return response.json();
  },

  // Creation endpoints
  async createAppointment(appointmentData) {
    const response = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });
    return response.json();
  },
};
