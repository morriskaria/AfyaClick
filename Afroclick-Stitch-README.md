# Afroclick - Healthcare Management System

## Overview

Afroclick is a comprehensive healthcare management platform that connects patients with healthcare providers. The application provides a seamless experience for booking appointments, managing medical records, and facilitating communication between patients and doctors.

## Core Features

### 🔐 Authentication & User Management
- **User Registration**: New patients and doctors can register with the platform
- **Role-based Access**: Separate interfaces for patients and doctors
- **Secure Login**: Email/password authentication with role-based navigation
- **Profile Management**: User profiles with relevant medical/personal information

### 📅 Appointment Management
- **Book Appointments**: Patients can schedule appointments with available doctors
- **Appointment Calendar**: View upcoming and past appointments
- **Status Tracking**: Real-time appointment status (pending, confirmed, completed, cancelled)
- **Doctor Availability**: View doctor schedules and specialties
- **Appointment History**: Complete history of patient-doctor interactions

### 📋 Medical Records
- **Electronic Health Records**: Secure storage of patient medical history
- **Add New Records**: Doctors can add diagnosis, treatment plans, and notes
- **Record Access**: Patients can view their medical records
- **Record Search**: Easy search and filtering of medical history
- **Privacy Controls**: Role-based access to sensitive medical information

### 👨‍⚕️ Doctor Dashboard
- **Patient Management**: View and manage patient appointments
- **Appointment Scheduling**: Accept, reschedule, or cancel appointments
- **Medical Record Management**: Add and update patient records
- **Patient Communication**: Direct communication with patients
- **Workload Overview**: Daily schedule and appointment statistics

### 🏥 Patient Dashboard
- **Health Overview**: Personal health dashboard with key metrics
- **Appointment Booking**: Easy appointment scheduling interface
- **Medical History**: Access to complete medical records
- **Doctor Directory**: Browse doctors by specialty and availability
- **Health Reminders**: Appointment reminders and health tips

## User Roles & Workflows

### Patient Journey
1. **Registration**: Create account with personal details
2. **Profile Setup**: Complete health profile and preferences
3. **Browse Doctors**: Search doctors by specialty, location, ratings
4. **Book Appointment**: Select doctor, date, time, and reason
5. **Appointment Management**: View, reschedule, or cancel appointments
6. **Medical Records**: Access diagnosis, treatments, and prescriptions
7. **Health Tracking**: Monitor health metrics and appointment history

### Doctor Journey
1. **Registration**: Create professional account with credentials
2. **Profile Setup**: Add specialty, experience, and availability
3. **Patient Management**: View scheduled appointments and patient history
4. **Appointment Handling**: Confirm, reschedule, or complete appointments
5. **Medical Documentation**: Add diagnoses, treatments, and follow-up notes
6. **Patient Communication**: Respond to patient inquiries and concerns
7. **Schedule Management**: Set availability and manage workload

## Technical Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Modern icon library
- **ESLint**: Code quality and consistency

### Backend Integration
- **RESTful API**: Integration with backend services
- **Authentication API**: User login/registration endpoints
- **Appointment API**: CRUD operations for appointments
- **Medical Records API**: Secure patient data management
- **Doctor/Patient APIs**: User profile and data management

## Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Trust, healthcare, professionalism
- **Secondary**: Green (#10B981) - Health, success, positivity
- **Accent**: Purple (#8B5CF6) - Innovation, care, compassion
- **Neutral**: Gray scale (#F9FAFB to #111827) - Clean, modern
- **Status Colors**:
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Error: Red (#EF4444)
  - Info: Blue (#3B82F6)

### Typography
- **Primary Font**: Inter (sans-serif) - Clean, readable, modern
- **Headings**: Bold, 24px-48px, dark gray (#111827)
- **Body Text**: Regular, 14px-16px, medium gray (#6B7280)
- **Small Text**: 12px-14px, light gray (#9CA3AF)

### Component Patterns
- **Cards**: Rounded corners (12px), white background, subtle shadows
- **Buttons**: Rounded (8px), with hover states and loading indicators
- **Forms**: Clean inputs with labels, validation states, and helper text
- **Navigation**: Clean sidebar/header with active state indicators
- **Status Badges**: Color-coded pills for appointment/medical statuses

### Layout Structure
- **Header**: Logo, user menu, notifications, logout
- **Navigation**: Role-based sidebar with feature access
- **Main Content**: Card-based layout with proper spacing
- **Footer**: Links, contact info, copyright
- **Responsive**: Mobile-first design with tablet/desktop breakpoints

## Key Components

### Authentication Components
- **LoginForm**: Email/password fields with validation
- **RegisterForm**: Multi-step registration for patients/doctors
- **Auth**: Main auth container with tab switching
- **Password Reset**: Forgot password functionality

### Dashboard Components
- **Dashboard**: Main dashboard container with role-based views
- **AppointmentCard**: Individual appointment display with actions
- **DoctorCard**: Doctor profile cards with booking options
- **PatientCard**: Patient summary cards for doctors

### Appointment Components
- **BookAppointment**: Calendar-based appointment booking
- **AppointmentList**: Filterable appointment history
- **AppointmentDetails**: Full appointment information modal
- **CalendarView**: Monthly calendar with appointments

### Medical Records Components
- **MedicalRecords**: Patient record dashboard
- **AddRecord**: Form for adding new medical entries
- **ViewRecords**: Detailed record viewer with search
- **RecordCard**: Individual medical record display

### Navigation Components
- **Header**: Top navigation with user actions
- **Navigation**: Sidebar navigation with active states
- **Breadcrumb**: Page navigation breadcrumbs

## Data Models

### User Model
```javascript
{
  id: number,
  email: string,
  name: string,
  role: 'patient' | 'doctor',
  // Patient fields
  dob?: string,
  phone?: string,
  address?: string,
  emergency_contact?: string,
  // Doctor fields
  specialty?: string,
  license_number?: string,
  experience_years?: number,
  hospital?: string
}
```

### Appointment Model
```javascript
{
  id: number,
  patient_id: number,
  doctor_id: number,
  appointment_date: string, // YYYY-MM-DD
  appointment_time: string, // HH:MM
  reason: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes?: string,
  created_at: string,
  updated_at: string
}
```

### Medical Record Model
```javascript
{
  id: number,
  patient_id: number,
  doctor_id: number,
  date: string,
  diagnosis: string,
  treatment: string,
  medications?: string[],
  notes: string,
  follow_up_date?: string,
  attachments?: string[]
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register/patient` - Patient registration
- `POST /api/auth/register/doctor` - Doctor registration
- `POST /api/auth/logout` - User logout

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Medical Records
- `GET /api/records/:patient_id` - Get patient records
- `POST /api/records` - Add medical record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### Users
- `GET /api/doctors` - Get all doctors
- `GET /api/patients` - Get all patients
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## User Experience Goals

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### Performance
- Fast loading times (< 3 seconds)
- Smooth animations and transitions
- Optimized images and assets
- Progressive loading of content

### Mobile Experience
- Responsive design for all screen sizes
- Touch-friendly interface elements
- Optimized forms for mobile input
- Push notifications for appointments

### Security & Privacy
- HIPAA compliant design patterns
- Secure data transmission
- Role-based data access
- Audit trails for medical actions

## Implementation Notes

### State Management
- React hooks for local component state
- Context API for global user state
- Local storage for session persistence
- Real-time updates for appointment status

### Error Handling
- Graceful error messages
- Offline functionality with sync
- Retry mechanisms for failed requests
- User-friendly validation feedback

### Testing Requirements
- Unit tests for all components
- Integration tests for user flows
- E2E tests for critical paths
- Accessibility testing

---

## Stitch Generation Guidelines

When generating the UI for Afroclick using this specification:

1. **Maintain Healthcare Theme**: Use calming colors, professional typography, and trust-building design patterns
2. **Prioritize User Roles**: Clearly separate patient and doctor interfaces while maintaining consistent branding
3. **Focus on Core Workflows**: Appointment booking and medical record management are the primary user journeys
4. **Ensure Accessibility**: Include proper ARIA labels, keyboard navigation, and screen reader support
5. **Mobile-First Design**: Ensure all components work seamlessly across devices
6. **Status Communication**: Use clear visual indicators for appointment statuses and system states

This comprehensive specification should enable Stitch to generate a complete, production-ready healthcare management interface that meets both user needs and industry standards.
