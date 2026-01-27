import sqlite3
import bcrypt

# Direct database access to bypass Flask import issues
def check_database():
    conn = sqlite3.connect('instance/Afyyaclick.db')
    cursor = conn.cursor()

    print("=== DATABASE DIAGNOSTIC ===")

    # Check if password_hash columns exist
    try:
        cursor.execute("PRAGMA table_info(patients)")
        patient_columns = cursor.fetchall()
        patient_column_names = [col[1] for col in patient_columns]
        has_patient_password = 'password_hash' in patient_column_names
        print(f"Patients table has password_hash column: {has_patient_password}")
        print(f"Patient columns: {patient_column_names}")

        cursor.execute("PRAGMA table_info(doctors)")
        doctor_columns = cursor.fetchall()
        doctor_column_names = [col[1] for col in doctor_columns]
        has_doctor_password = 'password_hash' in doctor_column_names
        print(f"Doctors table has password_hash column: {has_doctor_password}")
        print(f"Doctor columns: {doctor_column_names}")
    except Exception as e:
        print(f"Error checking table structure: {e}")
        conn.close()
        return

    # Check patients
    cursor.execute("SELECT id, first_name, last_name, email, password_hash FROM patients LIMIT 3")
    patients = cursor.fetchall()
    print(f"\nPatients found: {len(patients)}")
    for p in patients:
        patient_id, first_name, last_name, email, password_hash = p
        has_password = bool(password_hash)
        print(f"  {email}: password_hash exists = {has_password}")

    # Check doctors
    cursor.execute("SELECT doctor_id, name, email, password_hash FROM doctors LIMIT 3")
    doctors = cursor.fetchall()
    print(f"Doctors found: {len(doctors)}")
    for d in doctors:
        doctor_id, name, email, password_hash = d
        has_password = bool(password_hash)
        print(f"  {email}: password_hash exists = {has_password}")

    # Add default passwords if columns exist
    if has_patient_password:
        print("\n=== SETTING DEFAULT PASSWORDS ===")
        password_hash = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute("UPDATE patients SET password_hash = ? WHERE password_hash IS NULL OR password_hash = ''", (password_hash,))
        updated_patients = cursor.rowcount
        print(f"Updated {updated_patients} patients with passwords")

        cursor.execute("UPDATE doctors SET password_hash = ? WHERE password_hash IS NULL OR password_hash = ''", (password_hash,))
        updated_doctors = cursor.rowcount
        print(f"Updated {updated_doctors} doctors with passwords")

        conn.commit()
        print("✅ All passwords updated to: password123")
    else:
        print("\n❌ password_hash columns don't exist - database migration needed!")

    print("\n=== TEST LOGIN SIMULATION ===")
    # Test password checking
    test_password = 'password123'

    # Test doctor login
    cursor.execute("SELECT name, email, password_hash FROM doctors WHERE email = ?", ('sarah.johnson@hospital.com',))
    doctor = cursor.fetchone()
    if doctor:
        name, email, password_hash = doctor
        password_valid = bcrypt.checkpw(test_password.encode('utf-8'), password_hash.encode('utf-8'))
        print(f"Test login for {email}: {'SUCCESS' if password_valid else 'FAILED'}")
    else:
        print("Doctor sarah.johnson@hospital.com not found")

    # Test patient login
    cursor.execute("SELECT first_name, last_name, email, password_hash FROM patients WHERE email = ?", ('john.smith@email.com',))
    patient = cursor.fetchone()
    if patient:
        first_name, last_name, email, password_hash = patient
        password_valid = bcrypt.checkpw(test_password.encode('utf-8'), password_hash.encode('utf-8'))
        print(f"Test login for {email}: {'SUCCESS' if password_valid else 'FAILED'}")
    else:
        print("Patient john.smith@email.com not found")

    conn.close()

if __name__ == "__main__":
    check_database()
