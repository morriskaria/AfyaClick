# models.py
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates

db = SQLAlchemy()
bcrypt = Bcrypt()

class Patient(db.Model,SerializerMixin):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(128), nullable=False)


    
    
    
    # Relationships
    appointments = db.relationship('Appointment', backref='patient', lazy=True)

    def __repr__(self):
        return f"Patient('{self.first_name} {self.last_name}', '{self.email}')"
    
    @validates('email')
    def validates_email(self,key,address):
        if 'a' not in address:
            raise ValueError("Failed simple email validation")
        return address

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    

    

class Doctor(db.Model,SerializerMixin):
    __tablename__ = 'doctors'

    doctor_id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='doctor', lazy=True)

    def __repr__(self):
        return f"Doctor('{self.doctor_id}', '{self.name}', '{self.specialization}')"

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Appointment(db.Model,SerializerMixin):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.String(50), db.ForeignKey('doctors.doctor_id'), nullable=False)
    appointment_date = db.Column(db.String(50), nullable=False)
    appointment_time = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='Scheduled')
    
    def __repr__(self):
        return f"Appointment('{self.id}', 'Patient: {self.patient_id}', 'Doctor: {self.doctor_id}')"