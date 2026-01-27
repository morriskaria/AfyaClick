from app import app, db, bcrypt
from models import Patient, Doctor

def add_default_passwords():
    """Add default passwords to existing users"""
    with app.app_context():
        print("Adding default passwords to existing users...")

        # Update all patients with default password
        patients = Patient.query.all()
        for patient in patients:
            if not patient.password_hash:  # Only if password not set
                patient.set_password('password123')
                print(f"Set password for patient: {patient.email}")

        # Update all doctors with default password
        doctors = Doctor.query.all()
        for doctor in doctors:
            if not doctor.password_hash:  # Only if password not set
                doctor.set_password('password123')
                print(f"Set password for doctor: {doctor.email}")

        # Commit changes
        db.session.commit()
        print("✅ Default passwords added successfully!")
        print("Default password for all users: password123")

if __name__ == '__main__':
    add_default_passwords()
