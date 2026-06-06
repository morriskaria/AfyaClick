from flask import Blueprint, request, jsonify
from models import db, Patient
from datetime import datetime
import logging

# Note: Placeholders for your existing security utilities
from ai_config import require_auth_token, require_role

patients_bp = Blueprint('patients', __name__, url_prefix='/api/patients')
logger = logging.getLogger(__name__)

@patients_bp.route('', methods=['POST'])
@require_auth_token
@require_role('Admin', 'Clinician')
def add_patient():
    """
    Add a new patient record to the system.
    Expected JSON: first_name, last_name, email, date_of_birth, gender, medical_record_number, phone, password
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # 1. Validation Logic
    required_fields = [
        'first_name', 'last_name', 'email', 'date_of_birth', 
        'gender', 'medical_record_number', 'password'
    ]
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    try:
        # 2. Check if patient already exists
        if Patient.query.filter((Patient.email == data['email']) | 
                                (Patient.medical_record_number == data['medical_record_number'])).first():
            return jsonify({"error": "Patient with this email or MRN already exists"}), 409

        # 3. Parse Date of Birth
        try:
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format for date_of_birth. Use YYYY-MM-DD"}), 400

        # 4. Create Patient Instance
        new_patient = Patient(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            date_of_birth=dob,
            gender=data['gender'],
            medical_record_number=data['medical_record_number'],
            phone=data.get('phone')  # Compatible with PHIFilter
        )
        new_patient.set_password(data['password'])

        # 5. Database Transaction
        db.session.add(new_patient)
        db.session.commit()

        logger.info(f"New patient created: {new_patient.id} | MRN: {new_patient.medical_record_number}")

        return jsonify({
            "message": "Patient created successfully",
            "patient": {
                "id": str(new_patient.id),
                "mrn": new_patient.medical_record_number,
                "name": f"{new_patient.first_name} {new_patient.last_name}"
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to create patient: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500