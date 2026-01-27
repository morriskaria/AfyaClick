from app import app, db 
from models import Patient, Doctor, Appointment
from datetime import datetime, timedelta

import random

def seed_database():
    """Seed the hospital database """

    print("starting hospital database seeding...")


    #delete all existing data

    print("Clearing existing data...")
    Appointment.query.delete()
    Patient.query.delete()
    Doctor.query.delete()

    #create Doctors
    print("Creating Doctors.....")
    doctors_data = [
        {
            'doctor_id': 'DOC001',
            'name': 'Dr. Sarah Johnson',
            'specialization': 'Cardiology',
            'email': 'sarah.johnson@hospital.com',
            'phone': '+1-555-0101'
        },
        {
            'doctor_id': 'DOC002', 
            'name': 'Dr. Michael Chen',
            'specialization': 'Neurology',
            'email': 'michael.chen@hospital.com',
            'phone': '+1-555-0102'
        },
        {
            'doctor_id': 'DOC003',
            'name': 'Dr. Emily Rodriguez',
            'specialization': 'Pediatrics',
            'email': 'emily.rodriguez@hospital.com',
            'phone': '+1-555-0103'
        },
        {
            'doctor_id': 'DOC004',
            'name': 'Dr. James Wilson',
            'specialization': 'Orthopedics',
            'email': 'james.wilson@hospital.com',
            'phone': '+1-555-0104'
        },
        {
            'doctor_id': 'DOC005',
            'name': 'Dr. Lisa Thompson',
            'specialization': 'Dermatology',
            'email': 'lisa.thompson@hospital.com',
            'phone': '+1-555-0105'
        }
    ]
    


    doctors = []
    for doc_data in doctors_data:
        doctor = Doctor(
            doctor_id=doc_data['doctor_id'],
            name=doc_data['name'],
            specialization=doc_data['specialization'],
            email=doc_data['email'],
            phone=doc_data['phone']
        )
        doctor.set_password('doc123')  # Set default password
        doctors.append(doctor)
        db.session.add(doctor)
    
    db.session.commit()
    print(f"✅ Created {len(doctors)} doctors")


    # Create Patients
    print("👥 Creating patients...")
    patients_data = [
        {
            'first_name': 'John',
            'last_name': 'Smith',
            'gender': 'Male',
            'email': 'john.smith@email.com',
            'phone': '+1-555-1001'
        },
        {
            'first_name': 'Maria',
            'last_name': 'Garcia',
            'gender': 'Female', 
            'email': 'maria.garcia@email.com',
            'phone': '+1-555-1002'
        },
        {
            'first_name': 'David',
            'last_name': 'Miller',
            'gender': 'Male',
            'email': 'david.miller@email.com',
            'phone': '+1-555-1003'
        },
        {
            'first_name': 'Sarah',
            'last_name': 'Davis',
            'gender': 'Female',
            'email': 'sarah.davis@email.com',
            'phone': '+1-555-1004'
        },
        {
            'first_name': 'Robert',
            'last_name': 'Taylor',
            'gender': 'Male',
            'email': 'robert.taylor@email.com',
            'phone': '+1-555-1005'
        },
        {
            'first_name': 'Jennifer',
            'last_name': 'Anderson',
            'gender': 'Female',
            'email': 'jennifer.anderson@email.com',
            'phone': '+1-555-1006'
        },
        {
            'first_name': 'Thomas',
            'last_name': 'Brown',
            'gender': 'Male',
            'email': 'thomas.brown@email.com',
            'phone': '+1-555-1007'
        },
        {
            'first_name': 'Lisa',
            'last_name': 'Martinez',
            'gender': 'Female',
            'email': 'lisa.martinez@email.com',
            'phone': '+1-555-1008'
        }
    ]
    
    patients = []
    for patient_data in patients_data:
        patient = Patient(
            first_name=patient_data['first_name'],
            last_name=patient_data['last_name'],
            gender=patient_data['gender'],
            email=patient_data['email'],
            phone=patient_data['phone']
        )
        patient.set_password('pat123')  # Set default password
        patients.append(patient)
        db.session.add(patient)
    
    db.session.commit()
    print(f"✅ Created {len(patients)} patients")
    
    # Create Appointments
    print("📅 Creating appointments...")
    
    # Generate dates for the next 14 days
    base_date = datetime.now()
    dates = [(base_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(14)]
    
    # Available time slots
    time_slots = ['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:00 PM']
    
    # Possible appointment statuses
    statuses = ['Scheduled', 'Completed', 'Cancelled', 'No Show']
    
    appointments = []
    appointment_count = 0
    
    # Create 2-4 appointments per day
    for date in dates:
        num_appointments = random.randint(2, 4)
        for _ in range(num_appointments):
            patient = random.choice(patients)
            doctor = random.choice(doctors)
            time_slot = random.choice(time_slots)
            
            # Weight status probabilities (more scheduled appointments)
            status_weights = [0.6, 0.2, 0.1, 0.1]  # Scheduled, Completed, Cancelled, No Show
            status = random.choices(statuses, weights=status_weights)[0]
            
            appointment = Appointment(
                patient_id=patient.id,
                doctor_id=doctor.doctor_id,
                appointment_date=date,
                appointment_time=time_slot,
                status=status
            )
            
            appointments.append(appointment)
            db.session.add(appointment)
            appointment_count += 1
    
    db.session.commit()
    print(f"✅ Created {appointment_count} appointments")
    
    print("\n🎉 Database seeding completed successfully!")
    print("\n📊 Summary:")
    print(f"   👨‍⚕️  Doctors: {len(doctors)}")
    print(f"   👥 Patients: {len(patients)}")
    print(f"   📅 Appointments: {appointment_count}")

def display_sample_data():
    """Display a sample of the seeded data"""
    print("\n" + "="*50)
    print("📋 SAMPLE DATA PREVIEW")
    print("="*50)
    
    # Display doctors
    print("\n👨‍⚕️  DOCTORS:")
    doctors = Doctor.query.limit(3).all()
    for doctor in doctors:
        print(f"   {doctor.doctor_id}: {doctor.name} - {doctor.specialization}")
    
    # Display patients
    print("\n👥 PATIENTS:")
    patients = Patient.query.limit(3).all()
    for patient in patients:
        print(f"   {patient.id}: {patient.first_name} {patient.last_name} - {patient.email}")
    
    # Display appointments
    print("\n📅 RECENT APPOINTMENTS:")
    appointments = Appointment.query.order_by(Appointment.id.desc()).limit(5).all()
    for appointment in appointments:
        patient = Patient.query.get(appointment.patient_id)
        doctor = Doctor.query.get(appointment.doctor_id)
        print(f"   {appointment.id}: {patient.first_name} {patient.last_name} with Dr. {doctor.name}")
        print(f"      Date: {appointment.appointment_date} {appointment.appointment_time}")
        print(f"      Status: {appointment.status}")
        print()

if __name__ == '__main__':
    with app.app_context():
        seed_database()
        display_sample_data()