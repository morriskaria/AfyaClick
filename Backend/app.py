# app.py - UPDATED (no deprecated before_first_request)
from flask import Flask, jsonify,request
from flask_migrate import Migrate
from flask_cors import CORS

# Import from models
from models import db, bcrypt, Patient, Doctor, Appointment

# Flask application object 
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"])

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Afyyaclick.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize db and bcrypt with app
db.init_app(app)
bcrypt.init_app(app)

# Create migrate object
migrate = Migrate(app, db)



@app.route('/')
def hello():
    return 'Afyyaclick system is running'

@app.route('/patients', methods=['GET'])
def get_all_patients():
    try:
        patients = Patient.query.all()
        
        def safe_patient_to_dict(patient):
            """Safely convert patient to dict without recursion"""
            return {
                'id': patient.id,
                'email': patient.email,
                'phone': patient.phone
                # Don't include relationships that might cause recursion
            }
        
        patients_list = [safe_patient_to_dict(patient) for patient in patients]

        return jsonify({
            'success': True,
            'count': len(patients_list),
            'patients': patients_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
#patients registration
@app.route('/patients', methods=['POST'])
def create_patient():
    try:
        data = request.get_json()
        
        new_patient = Patient(
            first_name=data.get('first_name', '').split(' ')[0] if data.get('first_name') else '',
            last_name=data.get('first_name', '').split(' ')[1] if data.get('first_name') and ' ' in data.get('first_name') else data.get('first_name', ''),
            gender=data.get('gender', 'Unknown'),
            email=data.get('email'),
            phone=data.get('phone', '')
        )
        new_patient.set_password(data.get('password', 'password123'))  # Default password if not provided
        
        db.session.add(new_patient)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Patient created successfully',
            'patient': {
                'id': new_patient.id,
                'first_name': new_patient.first_name,
                'last_name': new_patient.last_name,
                'email': new_patient.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
#route to get all doctors 
@app.route('/doctors', methods =['GET'])
def get_all_doctors():
    try:
        print("DEBUG: /doctors endpoint called")  # Add this
        doctors = Doctor.query.all()
        print(f"DEBUG: Found {len(doctors)} doctors")  # Add this

        def doctor_to_dict(doctor):
            return{
                'doctor_id': doctor.doctor_id,
                'name' : doctor.name,
                'specialization' : doctor.specialization
            }
        
        doctors_list = [doctor_to_dict(doctor) for doctor in doctors]
        print(f"DEBUG: Sending doctors list: {doctors_list}")  # Add this

        return jsonify({
            'success': True,
            'count': len(doctors_list),
            'doctors': doctors_list
        })
    except Exception as e:
        print(f"DEBUG: Error in /doctors: {str(e)}")  # Add this
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/appointments', methods=['GET'])
def get_all_appointments():
    try:
        appointments = Appointment.query.all()

        def appointment_to_dict(appointment):
            """Convert appointments to dict"""
            return {
                'id': appointment.id,
                'patient_id': appointment.patient_id,
                'doctor_id': appointment.doctor_id,
                'appointment_date': appointment.appointment_date,
                'appointment_time': appointment.appointment_time,
                'status': appointment.status
            }
        
        appointments_list = [appointment_to_dict(appointment) for appointment in appointments]

        return jsonify({
            'success': True,
            'count': len(appointments_list),
            'appointments': appointments_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    # Add a doctor (POST)
@app.route('/createdoctors', methods=['POST'])
def create_doctor():
    try:
        data = request.get_json()
        
        new_doctor = Doctor(
            doctor_id=data.get('doctor_id'),
            name=data.get('name'),
            specialization=data.get('specialization'),
            email=data.get('email', ''),
            phone=data.get('phone', '')
        )
        new_doctor.set_password(data.get('password', 'password123'))  # Default password if not provided
        
        db.session.add(new_doctor)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Doctor created successfully',
            'doctor': {
                'doctor_id': new_doctor.doctor_id,
                'name': new_doctor.name,
                'specialization': new_doctor.specialization,
                'email': new_doctor.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

# Update a doctor (PUT)
@app.route('/doctors/<string:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    try:
        doctor = Doctor.query.filter_by(doctor_id=doctor_id).first()
        
        if not doctor:
            return jsonify({
                'success': False,
                'error': 'Doctor not found'
            }), 404
            
        data = request.get_json()
        
        if 'name' in data:
            doctor.name = data['name']
        if 'specialization' in data:
            doctor.specialization = data['specialization']
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Doctor updated successfully',
            'doctor': {
                'doctor_id': doctor.doctor_id,
                'name': doctor.name,
                'specialization': doctor.specialization
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
# Delete a doctor
@app.route('/doctors/<string:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    try:
        doctor = Doctor.query.filter_by(doctor_id=doctor_id).first()
        
        if not doctor:
            return jsonify({
                'success': False,
                'error': 'Doctor not found'
            }), 404
            
        db.session.delete(doctor)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Doctor deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

    

@app.route('/appointments', methods=['POST'])
def create_appointment():
    try:
        data = request.get_json()
        
        new_appointment = Appointment(
            patient_id=data.get('patient_id'),
            doctor_id=data.get('doctor_id'),
            appointment_date=data.get('appointment_date'),
            appointment_time=data.get('appointment_time'),
            status=data.get('status', 'Scheduled')
        )
        
        db.session.add(new_appointment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment created successfully',
            'appointment': {
                'id': new_appointment.id,
                'patient_id': new_appointment.patient_id,
                'doctor_id': new_appointment.doctor_id,
                'appointment_date': new_appointment.appointment_date,
                'appointment_time': new_appointment.appointment_time,
                'status': new_appointment.status
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
#login endpoint
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Check if user exists as patient
        patient = Patient.query.filter_by(email=email).first()
        if patient and patient.check_password(password):
            return jsonify({
                'success': True,
                'user': {
                    'id': patient.id,
                    'email': patient.email,
                    'name': f"{patient.first_name} {patient.last_name}",
                    'role': 'patient'
                }
            })

        # Check if user exists as doctor
        doctor = Doctor.query.filter_by(email=email).first()
        if doctor and doctor.check_password(password):
            return jsonify({
                'success': True,
                'user': {
                    'id': doctor.doctor_id,
                    'email': doctor.email,
                    'name': doctor.name,
                    'role': 'doctor',
                    'specialty': doctor.specialization
                }
            })

        return jsonify({
            'success': False,
            'error': 'Invalid email or password'
        }), 401

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True)