"""
ai_models.py - Extended Database Models for AI Features

NEW Models for storing AI interpretations and chat sessions.
These models extend the existing Afyaclick database without modifying existing tables.

Models:
- NoteInterpretation: Stores AI interpretations of clinical notes
- ChatSession: Stores chatbot conversation metadata
- ChatMessage: Stores individual chat message summaries
- AIAuditLog: Comprehensive audit log for all AI operations (for compliance)

Database tables created:
# - NoteInterpretation (stores AI summaries)
# - ChatSession (tracks conversations)
# - ChatMessage (individual messages)
# - AIAuditLog (compliance logging)

"""

from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON, UUID
import uuid
from models import db


class NoteInterpretation(db.Model):
    """
    Stores AI interpretation of a clinical note.
    
    Preserves original note + stores AI-generated summaries separately.
    Clinicians can review and edit before approval.
    
    Fields:
    - note_id: Reference to source note
    - original_note_text: Original unstructured note (preserved)
    - formatted_note: AI-formatted structured version
    - clinical_summary: AI-generated clinician summary
    - patient_friendly_summary: AI-generated patient explanation
    - extracted_entities: Extracted medical entities (JSON)
    - ai_metadata: Model version, timestamp
    - clinician_approved: Whether clinician approved the interpretation
    - clinician_edits: Edits made by clinician before approval
    """
    
    __tablename__ = 'note_interpretations'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Reference to original note and users
    note_id = db.Column(db.String(100), nullable=False, unique=True, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False, index=True)
    doctor_id = db.Column(db.String(50), db.ForeignKey('doctors.doctor_id'), nullable=False, index=True)
    
    # Original note (PRESERVED - never overwritten)
    original_note_text = db.Column(db.Text, nullable=False)
    
    # AI-generated content
    formatted_note = db.Column(db.Text)
    clinical_summary = db.Column(db.Text)
    patient_friendly_summary = db.Column(db.Text)
    
    # Extracted medical entities (stored as JSON)
    # Example: {
    #   "symptoms": ["cough", "fever"],
    #   "diagnoses": ["bronchitis"],
    #   "medications": ["amoxicillin"],
    #   "vitals": {"BP": "120/80", "HR": "72"}
    # }
    extracted_symptoms = db.Column(JSON)
    extracted_diagnoses = db.Column(JSON)
    extracted_medications = db.Column(JSON)
    extracted_vitals = db.Column(JSON)
    
    # AI metadata (for auditing)
    ai_model_version = db.Column(db.String(100))  # "gpt-4-turbo-2024-04"
    ai_provider = db.Column(db.String(50))  # "openai", "anthropic"
    ai_processing_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ai_processing_latency_ms = db.Column(db.Integer)  # Processing time in milliseconds
    
    # Clinician review & approval workflow
    clinician_approved = db.Column(db.Boolean, default=False, index=True)
    clinician_approved_by = db.Column(db.String(50))  # doctor_id who approved
    clinician_approved_at = db.Column(db.DateTime)
    
    # Track if clinician made edits
    clinician_edited = db.Column(db.Boolean, default=False)
    clinician_edits_summary = db.Column(db.Text)  # What clinician changed
    
    # Audit & record management
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)  # Soft delete flag
    
    def __repr__(self):
        return f"NoteInterpretation(note='{self.note_id}', patient={self.patient_id}, approved={self.clinician_approved})"
    
    def to_dict(self, include_original=True):
        """Serialize to dictionary"""
        data = {
            'id': self.id,
            'note_id': self.note_id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'formatted_note': self.formatted_note,
            'clinical_summary': self.clinical_summary,
            'patient_friendly_summary': self.patient_friendly_summary,
            'extracted_entities': {
                'symptoms': self.extracted_symptoms or [],
                'diagnoses': self.extracted_diagnoses or [],
                'medications': self.extracted_medications or [],
                'vitals': self.extracted_vitals or {}
            },
            'ai_metadata': {
                'model_version': self.ai_model_version,
                'ai_provider': self.ai_provider,
                'timestamp': self.ai_processing_timestamp.isoformat() if self.ai_processing_timestamp else None
            },
            'clinician_approved': self.clinician_approved,
            'clinician_approved_at': self.clinician_approved_at.isoformat() if self.clinician_approved_at else None,
            'clinician_edited': self.clinician_edited,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_original:
            data['original_note_text'] = self.original_note_text
        
        return data


class ChatSession(db.Model):
    """
    Tracks chatbot conversation sessions.
    
    Stores metadata about conversations (NOT full chat history).
    Individual messages stored in ChatMessage table.
    
    Fields:
    - conversation_id: Unique ID for conversation
    - user_id: Patient ID or Doctor ID
    - user_role: "patient" or "clinician"
    - message_count: Total messages in conversation
    - started_at, ended_at: Conversation timeline
    """
    
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    
    # User identification
    user_id = db.Column(db.Integer, nullable=False, index=True)  # patient_id or doctor_id
    user_role = db.Column(db.String(50), nullable=False)  # "patient", "clinician", "admin"
    user_name = db.Column(db.String(200))  # For audit trail
    
    # Conversation metadata
    message_count = db.Column(db.Integer, default=0)
    intent_categories = db.Column(JSON)  # ["documentation", "appointments", ...]
    
    # Session timeline
    started_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    ended_at = db.Column(db.DateTime)
    duration_seconds = db.Column(db.Integer)  # Total session duration
    
    # Session status
    is_active = db.Column(db.Boolean, default=True)
    is_archived = db.Column(db.Boolean, default=False)  # For cleanup
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f"ChatSession(conversation='{self.conversation_id}', user={self.user_id}, role={self.user_role})"
    
    def to_dict(self):
        """Serialize to dictionary"""
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'user_id': self.user_id,
            'user_role': self.user_role,
            'message_count': self.message_count,
            'started_at': self.started_at.isoformat(),
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'duration_seconds': self.duration_seconds,
            'is_active': self.is_active
        }


class ChatMessage(db.Model):
    """
    Individual chat messages in a conversation.
    
    IMPORTANT: Stores METADATA ONLY, not full chat history.
    Does not store sensitive information or full user/assistant messages.
    
    Fields:
    - conversation_id: FK to ChatSession
    - message_type: "user_question", "assistant_response", "action_triggered"
    - intent_category: Classification of intent ("documentation", "faq", etc.)
    - action_triggered: If user clicked a suggested action
    """
    
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.String(100), db.ForeignKey('chat_sessions.conversation_id'), 
                                nullable=False, index=True)
    
    # Message metadata (NOT full content)
    message_number = db.Column(db.Integer)  # Order in conversation
    message_type = db.Column(db.String(50))  # "user_question", "assistant_response"
    intent_category = db.Column(db.String(100))  # "documentation", "appointment_booking", "faq"
    
    # High-level summary instead of full content
    # Example: "User asked for help with documentation" instead of actual question
    interaction_summary = db.Column(db.String(500))
    
    # If user took an action
    action_triggered = db.Column(db.String(100))  # "navigate_to_records", "book_appointment"
    action_successful = db.Column(db.Boolean)
    
    # For compliance/debugging
    was_escalated = db.Column(db.Boolean, default=False)  # If passed to human agent
    resolution_status = db.Column(db.String(50))  # "resolved", "escalated", "pending"
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f"ChatMessage(conversation='{self.conversation_id}', type={self.message_type}, intent={self.intent_category})"
    
    def to_dict(self):
        """Serialize to dictionary"""
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'message_type': self.message_type,
            'intent_category': self.intent_category,
            'interaction_summary': self.interaction_summary,
            'action_triggered': self.action_triggered,
            'created_at': self.created_at.isoformat()
        }


# Additional utility models for analytics/compliance

class AIAuditLog(db.Model):
    """
    Comprehensive audit log for all AI operations.
    
    Logs WHO did WHAT with WHICH AI service WHEN.
    Does NOT store PHI or sensitive content.
    
    Fields:
    - user_id: Who used AI (hashed)
    - action: "note_interpretation_requested", "chatbot_response", etc.
    - ai_service: "note_interpreter" or "chatbot"
    - result: "success", "error", "timeout"
    - metadata: Additional context (e.g., model version, response length)
    """
    
    __tablename__ = 'ai_audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # WHO & WHEN
    user_id_hash = db.Column(db.String(100), index=True)  # Hashed user ID
    user_role = db.Column(db.String(50))  # "clinician", "patient"
    action_timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # WHAT & HOW
    action = db.Column(db.String(100), nullable=False, index=True)  # note_interpreted, chat_responded
    ai_service = db.Column(db.String(50))  # note_interpreter, chatbot
    ai_model_version = db.Column(db.String(100))
    
    # OUTCOME
    result = db.Column(db.String(50))  # success, error, timeout, rate_limited
    error_details = db.Column(db.String(500))  # If error, what happened
    
    # METADATA (no PHI)
    context = db.Column(JSON)  # {
    #   "response_length": 500,
    #   "processing_time_ms": 1250,
    #   "rate_limit_remaining": 9
    # }
    
    def __repr__(self):
        return f"AIAuditLog(action={self.action}, result={self.result}, time={self.action_timestamp})"
    
    def to_dict(self):
        """Serialize to dictionary"""
        return {
            'id': self.id,
            'user_id_hash': self.user_id_hash,
            'user_role': self.user_role,
            'action': self.action,
            'ai_service': self.ai_service,
            'result': self.result,
            'timestamp': self.action_timestamp.isoformat(),
            'context': self.context
        }
