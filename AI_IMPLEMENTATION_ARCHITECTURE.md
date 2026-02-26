# Afyaclick AI Integration Architecture

**Version:** 1.0  
**Date:** February 26, 2026  
**Status:** Design Specification & Implementation Plan  
**Scope:** Two new healthcare AI features—additive, non-disruptive, modular

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Feature 1: Doctor Note Interpreter & Summary](#feature-1-doctor-note-interpreter--summary)
4. [Feature 2: Afyaclick Guided Chatbot](#feature-2-afyaclick-guided-chatbot)
5. [BackendDesign](#backend-design)
6. [Frontend Integration](#frontend-integration)
7. [API Contracts](#api-contracts)
8. [Security & Privacy](#security--privacy)
9. [Error Handling & Resilience](#error-handling--resilience)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)

---

## Executive Summary

This document specifies the integration of two AI-powered features into the Afyaclick e-hospital system without modifying existing APIs or breaking current functionality.

### Key Principles
- **Preservation First:** All existing endpoints and features remain unchanged
- **Modular Addition:** AI features are self-contained service layers
- **Security-First:** De-identification, encryption, audit logging standard
- **Healthcare Compliant:** Disclaimers, audit trails, clinician review workflow
- **Graceful Degradation:** System functions if AI service unavailable

### Deployment Model
```
┌─────────────────────────────────────────┐
│  React Frontend (Vite)                  │
│  ├─ NoteAISummaryPanel                  │
│  └─ AfyaclickAssistantWidget            │
└────────────┬────────────────────────────┘
             │ HTTPS/JWT
             ↓
┌─────────────────────────────────────────┐
│  Flask Backend (Production)             │
│  ├─ Existing Endpoints (unchanged)      │
│  ├─ /api/auth/* (unchanged)             │
│  ├─ /api/patients/* (unchanged)         │
│  ├─ /api/doctors/* (unchanged)          │
│  ├─ /api/appointments/* (unchanged)     │
│  │                                      │
│  └─ NEW: AI Integration Layer          │
│     ├─ /api/ai/notes (POST)            │
│     │   └─ ai_service.py               │
│     └─ /api/ai/chat (POST)             │
│         └─ chatbot_service.py          │
└────────────┬────────────────────────────┘
             │ API Keys (env vars)
             ↓
┌─────────────────────────────────────────┐
│  External AI Provider (e.g., OpenAI)    │
│  - Input de-identified                  │
│  - Output reviewed by clinician         │
│  - No PHI shared                        │
└─────────────────────────────────────────┘
```

---

## System Architecture Overview

### Client-Side Architecture
```
React App
├─ Existing Components (unchanged)
│  ├─ LoginPage, Dashboard, MedicalRecords, etc.
│
└─ NEW AI Components
   ├─ NoteAISummaryPanel
   │  ├─ RawNoteInput
   │  ├─ AIProcessing (loading state)
   │  ├─ OutputDisplay (formatted, clinical, patient-friendly)
   │  └─ ClinicalReviewPanel (edit/save)
   │
   └─ AfyaclickAssistantWidget
      ├─ ConversationThread
      ├─ MessageInput
      ├─ DisclaimerBar
      └─ SuggestedActions
```

### Backend Architecture
```
Flask App (app.py)
├─ Existing Routes (unchanged)
│  └─ /patients, /doctors, /appointments, /auth, etc.
│
├─ NEW AI Routes
│  ├─ POST /api/ai/notes → ai_service.py
│  └─ POST /api/ai/chat → chatbot_service.py
│
├─ Service Layer (NEW)
│  ├─ ai_service.py
│  │  ├─ NoteInterpreter class
│  │  ├─ InputValidator
│  │  ├─ OutputFormatter
│  │  └─ PHIFilter
│  │
│  └─ chatbot_service.py
│     ├─ ChatbotEngine class
│     ├─ ContextManager
│     ├─ RoleAwareRouter
│     └─ DisclaimerManager
│
├─ Models (extended)
│  ├─ NoteInterpretation (NEW)
│  ├─ ChatSession (NEW)
│  └─ ChatMessage (NEW)
│
└─ Utilities (NEW)
   ├─ security.py
   │  ├─ de_identify()
   │  ├─ audit_log()
   │  └─ rate_limit_check()
   │
   └─ ai_config.py
      ├─ AI_PROVIDER config
      ├─ MODEL_VERSION
      └─ SAFETY_THRESHOLDS
```

---

## Feature 1: Doctor Note Interpreter & Summary

### Purpose
Convert unstructured clinical notes written by doctors into:
1. **Formatted Note** — Clean, structured markdown
2. **Clinical Summary** — Concise clinician-focused summary (for handoff, audit)
3. **Patient-Friendly Summary** — Simplified explanation for patient understanding

### Workflow

```
Doctor writes raw note in Afyaclick
         ↓
Clicks "AI Summarize" button
         ↓
Frontend sends note_id + text to /api/ai/notes
         ↓
Backend validates input (de-identifies, length, format)
         ↓
AI Service calls external LLM
         ↓
Parse + format output
         ↓
Store result as NoteInterpretation record
         ↓
Frontend displays 3 versions + Disclaimer
         ↓
Doctor can edit any summary before approval
         ↓
Save approved summaries linked to original note
```

### Database Schema (NEW)

```python
class NoteInterpretation(db.Model):
    """Stores AI interpretation of clinical notes"""
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.String(100), nullable=False)  # Reference to original note
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.String(50), db.ForeignKey('doctors.doctor_id'), nullable=False)
    
    # Original note (preserved)
    original_note_text = db.Column(db.Text, nullable=False)
    
    # AI outputs
    formatted_note = db.Column(db.Text)
    clinical_summary = db.Column(db.Text)
    patient_friendly_summary = db.Column(db.Text)
    
    # Extracted entities
    extracted_symptoms = db.Column(db.JSON)  # ["symptom1", "symptom2"]
    extracted_diagnoses = db.Column(db.JSON)  # ["diagnosis1"]
    extracted_medications = db.Column(db.JSON)  # ["med1", "med2"]
    extracted_vitals = db.Column(db.JSON)  # {"BP": "120/80", "HR": "72"}
    
    # AI metadata
    ai_model_version = db.Column(db.String(50))
    ai_provider = db.Column(db.String(50))  # "openai", "anthropic", etc.
    processing_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Clinician review
    clinician_approved = db.Column(db.Boolean, default=False)
    clinician_approved_at = db.Column(db.DateTime)
    clinician_edited = db.Column(db.Boolean, default=False)
    clinician_edits_summary = db.Column(db.Text)
    
    # Audit
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Input & Output Contracts

**Request:**
```json
{
  "note_id": "NOTE-2026-02-26-001",
  "raw_note_text": "Patient presents with persistent dry cough x 3 weeks, denies fever. Lungs clear on auscultation. SPO2 98% on room air.",
  "patient_id": 42,
  "doctor_id": "DOC-001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "note_interpretation": {
    "id": 1001,
    "note_id": "NOTE-2026-02-26-001",
    "formatted_note": "**Chief Complaint:** Persistent dry cough\n**Duration:** 3 weeks\n**Associated Symptoms:** Denies fever\n**Physical Exam:** Lungs clear to auscultation bilaterally\n**Vitals:** SpO2 98% on room air",
    "clinical_summary": "45-year-old patient with 3-week history of dry cough. No fever. Clear lung fields on exam. Normal oxygenation. Differential includes URI sequelae, environmental irritant, or early bronchitis.",
    "patient_friendly_summary": "You have had a dry cough for 3 weeks without fever. Your lung sounds are clear and oxygen levels are normal. We should monitor this and consider allergy or environmental causes.",
    "extracted_entities": {
      "symptoms": ["dry cough", "duration 3 weeks"],
      "diagnoses": [],
      "medications": [],
      "vitals": {"SpO2": "98% on room air"}
    },
    "ai_metadata": {
      "model_version": "gpt-4-turbo-2024-04",
      "ai_provider": "openai",
      "timestamp": "2026-02-26T14:32:15Z"
    },
    "disclaimer": "⚠ AI-generated content — requires clinical verification by licensed clinician before use."
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid input",
  "details": "Note text exceeds maximum length (5000 chars)"
}
```

**Response (503 Service Unavailable):**
```json
{
  "success": false,
  "error": "AI service temporarily unavailable",
  "fallback": "Please try again in 60 seconds, or save the raw note for manual review."
}
```

---

## Feature 2: Afyaclick Guided Chatbot

### Purpose
Role-aware AI assistant that:
- **Clinician Mode:** Guides through clinical workflows, appointment management, documentation
- **Patient Mode:** Explains features, guides appointment booking, FAQ
- Does NOT diagnose, interpret labs, or provide medical advice

### Workflow

```
User opens chat widget
         ↓
Widget sends user_role + message to /api/ai/chat
         ↓
Backend validates role + authentication
         ↓
Chatbot service routes based on role
         ↓
Generate context-aware response + suggested actions
         ↓
Include medical disclaimer if needed
         ↓
Frontend displays reply + buttons for actions
         ↓
Continue conversation with conversation_id
```

### Database Schema (NEW)

```python
class ChatSession(db.Model):
    """Tracks chatbot conversation sessions"""
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.String(100), unique=True, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)  # patient_id or doctor_id
    user_role = db.Column(db.String(50), nullable=False)  # "patient" or "clinician"
    
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime)
    message_count = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    """Stores individual chat messages (metadata only, no full PHI)"""
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.String(100), db.ForeignKey('chat_session.conversation_id'), nullable=False)
    
    # High-level message type, not full content
    message_type = db.Column(db.String(50))  # "question", "affirmation", "navigation_request"
    intent_category = db.Column(db.String(100))  # "appointment_booking", "documentation_help", "faq"
    
    ai_response_summary = db.Column(db.String(500))  # Summary, not full response
    
    # Suggested actions taken
    action_triggered = db.Column(db.String(100))  # null or "navigate_to_records", "book_appointment"
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

### Input & Output Contracts

**Request (Clinician):**
```json
{
  "user_role": "clinician",
  "user_id": "DOC-002",
  "message": "How do I add a note to a patient's record?",
  "conversation_id": "conv-26feb2026-001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "reply": "To document a patient note in Afyaclick:\n\n1. Navigate to **Patient Records** from the left menu\n2. Search for the patient by name or ID\n3. Click **View Records** → **Add New Note**\n4. Enter your clinical note (chief complaint, exam, assessment, plan)\n5. Select **AI Summarize** (optional) to generate formatted summary\n6. Review and approve, then click **Save**\n\nThe note is encrypted and stored in the patient's timeline.",
  "suggested_actions": [
    {
      "label": "Go to Patient Records",
      "action_type": "navigate",
      "target": "/patient-records"
    },
    {
      "label": "Watch Documentation Video",
      "action_type": "link",
      "target": "https://help.afyaclick.local/docs/documentation"
    }
  ],
  "disclaimer": "This is system guidance. Always follow your institution's clinical documentation standards."
}
```

**Request (Patient):**
```json
{
  "user_role": "patient",
  "user_id": 42,
  "message": "When should I see a doctor for a cold?",
  "conversation_id": "conv-26feb2026-002"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "reply": "This is a common health question, but I can't provide medical advice. Here's what Afyaclick can help with:\n\n✓ **Book an appointment** with a doctor through **My Appointments**\n✓ **View appointment history** to see past visit notes\n✓ **Message your doctor** for clinical guidance\n\nFor medical questions like when to seek care for a cold, please consult your doctor directly. They can assess your specific situation.",
  "suggested_actions": [
    {
      "label": "Book an Appointment",
      "action_type": "navigate",
      "target": "/book-appointment"
    },
    {
      "label": "View My Doctors",
      "action_type": "navigate",
      "target": "/my-doctors"
    }
  ],
  "disclaimer": "⚠ This assistant provides system guidance only and does not replace professional medical judgment. For medical advice, consult your healthcare provider."
}
```

---

## Backend Design

### Service Layer Architecture

#### `ai_service.py` (Note Interpreter)

```python
from typing import Dict, List, Optional
from datetime import datetime
import os
import logging
import hashlib

class NoteInterpreter:
    """
    Interprets unstructured clinical notes using external AI.
    Handles de-identification, validation, formatting, and audit logging.
    """
    
    def __init__(self):
        self.model_version = os.getenv('AI_MODEL_VERSION', 'gpt-4-turbo-2024-04')
        self.ai_provider = os.getenv('AI_PROVIDER', 'openai')
        self.api_key = os.getenv('AI_API_KEY')
        self.rate_limiter = RateLimiter()
        self.logger = logging.getLogger(__name__)
    
    def interpret_note(self, note_id: str, raw_text: str, 
                       patient_id: int, doctor_id: str) -> Dict:
        """
        Main entry point: interpret a clinical note.
        
        Args:
            note_id: Unique identifier for the note
            raw_text: Original unstructured note
            patient_id: Patient database ID
            doctor_id: Doctor database ID
        
        Returns:
            Dictionary with formatted_note, clinical_summary, 
            patient_friendly_summary, extracted_entities, ai_metadata
        """
        
        # Validate input
        self.validate_input(raw_text)
        
        # Check rate limits
        if not self.rate_limiter.check(doctor_id):
            raise RateLimitError("Too many requests. Limit: 10 per hour")
        
        # De-identify before sending to AI
        de_identified = self.de_identify(raw_text)
        
        # Call AI
        ai_response = self.call_ai_provider(de_identified)
        
        # Parse output
        parsed = self.parse_ai_response(ai_response)
        
        # Audit log
        self.audit_log(action='note_interpreted', 
                       doctor_id=doctor_id, 
                       patient_id_hash=self.hash_id(patient_id))
        
        return {
            'formatted_note': parsed['formatted'],
            'clinical_summary': parsed['clinical'],
            'patient_friendly_summary': parsed['patient_friendly'],
            'extracted_entities': self.extract_entities(parsed),
            'ai_metadata': {
                'model_version': self.model_version,
                'ai_provider': self.ai_provider,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
        }
    
    def validate_input(self, text: str):
        """Validate input constraints"""
        # Min 20 chars
        if len(text.strip()) < 20:
            raise ValueError("Note too short (min 20 characters)")
        
        # Max 5000 chars
        if len(text) > 5000:
            raise ValueError("Note too long (max 5000 characters)")
        
        # No binary/suspicious content
        try:
            text.encode('utf-8')
        except UnicodeEncodeError:
            raise ValueError("Invalid character encoding")
    
    def de_identify(self, text: str) -> str:
        """
        Remove/mask patient identifiers before sending to AI.
        De-identifies: names, DOBs, phone, addresses, IDs
        """
        # This is a simplified example. Production would use
        # regex patterns, NLP, or specialized PHI detection library
        import re
        
        de_id = text
        # Example: Replace likely phone numbers
        de_id = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', de_id)
        # Example: Replace dates (simplified)
        de_id = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}', '[DATE]', de_id)
        
        return de_id
    
    def call_ai_provider(self, de_identified_text: str) -> str:
        """Call external AI (simulated here, real version uses API)"""
        
        if self.ai_provider == 'openai':
            return self._call_openai(de_identified_text)
        elif self.ai_provider == 'anthropic':
            return self._call_anthropic(de_identified_text)
        else:
            raise ValueError(f"Unknown AI provider: {self.ai_provider}")
    
    def _call_openai(self, text: str) -> str:
        """Call OpenAI API (requires: import openai)"""
        # Pseudo-code; real implementation requires openai SDK
        # import openai
        # openai.api_key = self.api_key
        # response = openai.ChatCompletion.create(
        #     model=self.model_version,
        #     messages=[{
        #         "role": "system",
        #         "content": SYSTEM_PROMPT_NOTE_INTERPRETER,
        #     }, {
        #         "role": "user",
        #         "content": f"Interpret this note:\n{text}"
        #     }],
        #     temperature=0.3,
        #     timeout=30
        # )
        # return response['choices'][0]['message']['content']
        pass
    
    def parse_ai_response(self, response: str) -> Dict:
        """Parse structured output from AI"""
        # In production, use JSON mode from API or 
        # force structured output via prompt engineering
        import json
        
        # Expected format from AI:
        # {
        #   "formatted": "...",
        #   "clinical": "...",
        #   "patient_friendly": "..."
        # }
        
        try:
            parsed = json.loads(response)
            return parsed
        except json.JSONDecodeError:
            # Fallback: simple parsing
            return {
                'formatted': response,
                'clinical': response,
                'patient_friendly': response
            }
    
    def extract_entities(self, parsed: Dict) -> Dict:
        """Extract medical entities from summary"""
        # In production: use NLP library (spacy, transformers)
        # For now: simple keyword matching
        
        return {
            'symptoms': [],
            'diagnoses': [],
            'medications': [],
            'vitals': {}
        }
    
    def audit_log(self, action: str, doctor_id: str, patient_id_hash: str):
        """Log AI action without storing PHI"""
        self.logger.info(
            f"AI_ACTION | action={action} | doctor={doctor_id} | "
            f"patient_hash={patient_id_hash} | timestamp={datetime.utcnow()}"
        )
    
    @staticmethod
    def hash_id(patient_id: int) -> str:
        """Hash ID for logging (one-way, non-reversible)"""
        return hashlib.sha256(str(patient_id).encode()).hexdigest()[:8]
```

#### `chatbot_service.py` (Guided Assistant)

```python
from typing import Dict, List
from datetime import datetime
import os
import logging

class AfyaclickChatbot:
    """
    Context-aware AI assistant for Afyaclick.
    Role-aware: guides clinicians and patients separately.
    Does NOT diagnose or interpret medical data.
    """
    
    def __init__(self):
        self.model_version = os.getenv('AI_MODEL_VERSION', 'gpt-4-turbo-2024-04')
        self.ai_provider = os.getenv('AI_PROVIDER', 'openai')
        self.api_key = os.getenv('AI_API_KEY')
        self.logger = logging.getLogger(__name__)
    
    def respond(self, user_role: str, message: str, 
                conversation_id: str, user_id: int) -> Dict:
        """
        Generate chatbot response.
        
        Args:
            user_role: "clinician" or "patient"
            message: User's question/input
            conversation_id: Unique conversation ID
            user_id: Patient ID or Doctor ID
        
        Returns:
            reply, suggested_actions, disclaimer
        """
        
        # Validate input
        if len(message.strip()) < 3:
            raise ValueError("Message too short")
        
        # Route by role
        if user_role == 'clinician':
            return self._respond_to_clinician(message, conversation_id, user_id)
        elif user_role == 'patient':
            return self._respond_to_patient(message, conversation_id, user_id)
        else:
            raise ValueError(f"Unknown role: {user_role}")
    
    def _respond_to_clinician(self, message: str, 
                              conversation_id: str, user_id: int) -> Dict:
        """Clinician context: documentation, workflow, appointments"""
        
        system_prompt = """You are an experienced hospital IT specialist helping clinicians use Afyaclick.
        
        You can guide on:
        - How to document patient notes
        - How to schedule/manage appointments
        - How to access patient records
        - System features and settings
        
        You CANNOT:
        - Diagnose patients
        - Interpret lab results or vitals
        - Provide medical advice
        
        Be concise and action-oriented."""
        
        # Call AI with system prompt
        ai_response = self._call_ai(system_prompt, message)
        
        # Parse suggested actions
        actions = self._extract_actions_from_response(ai_response, 'clinician')
        
        # Log interaction
        self._log_chat(conversation_id, user_id, 'clinician', message)
        
        return {
            'reply': ai_response,
            'suggested_actions': actions,
            'disclaimer': 'This is system guidance. Always follow your institution\'s clinical standards.'
        }
    
    def _respond_to_patient(self, message: str, 
                            conversation_id: str, user_id: int) -> Dict:
        """Patient context: FAQ, appointment booking, records access"""
        
        system_prompt = """You are a helpful assistant for Afyaclick patient portal.
        
        You can help with:
        - Booking appointments
        - Accessing test results
        - Viewing medical history
        - System navigation
        - FAQ about features
        
        You CANNOT:
        - Diagnose medical conditions
        - Recommend treatments
        - Interpret medical results
        - Replace doctor's advice
        
        If patient asks medical questions, politely redirect to their doctor.
        Be warm and encouraging."""
        
        ai_response = self._call_ai(system_prompt, message)
        actions = self._extract_actions_from_response(ai_response, 'patient')
        
        self._log_chat(conversation_id, user_id, 'patient', message)
        
        disclaimer = """⚠ This assistant provides system guidance only and does not replace professional medical judgment. For medical advice, consult your healthcare provider."""
        
        return {
            'reply': ai_response,
            'suggested_actions': actions,
            'disclaimer': disclaimer
        }
    
    def _call_ai(self, system_prompt: str, user_message: str) -> str:
        """Call external AI (pseudo-code)"""
        # import openai
        # response = openai.ChatCompletion.create(
        #     model=self.model_version,
        #     messages=[
        #         {"role": "system", "content": system_prompt},
        #         {"role": "user", "content": user_message}
        #     ],
        #     temperature=0.7,
        #     max_tokens=500,
        #     timeout=15
        # )
        # return response['choices'][0]['message']['content']
        pass
    
    def _extract_actions_from_response(self, response: str, 
                                       user_role: str) -> List[Dict]:
        """
        Extract suggested actions from AI response.
        Examples: navigate, link, book_appointment, view_records
        """
        
        actions = []
        
        # Simple heuristic: if response mentions "Patient Records", 
        # suggest navigation
        if 'Patient Records' in response or 'patient record' in response.lower():
            actions.append({
                'label': 'Go to Patient Records',
                'action_type': 'navigate',
                'target': '/patient-records' if user_role == 'clinician' else '/medical-records'
            })
        
        if 'appointment' in response.lower():
            actions.append({
                'label': 'Book an Appointment',
                'action_type': 'navigate',
                'target': '/book-appointment'
            })
        
        return actions
    
    def _log_chat(self, conversation_id: str, user_id: int, 
                  user_role: str, message_type: str):
        """Log chat interaction (metadata only, no PHI)"""
        self.logger.info(
            f"CHAT | conversation={conversation_id} | user={user_id} | "
            f"role={user_role} | timestamp={datetime.utcnow()}"
        )
```

#### `security.py` (De-identification & Audit)

```python
import hashlib
import logging
from datetime import datetime
from functools import wraps
from flask import request, jsonify

class PHIFilter:
    """De-identify and sanitize data before sending to external AI"""
    
    @staticmethod
    def de_identify_text(text: str) -> str:
        """Remove/mask PII and PHI"""
        import re
        
        result = text
        # Phone: 555-1234 → [PHONE]
        result = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', result)
        # SSN: 123-45-6789 → [SSN]
        result = re.sub(r'\d{3}-\d{2}-\d{4}', '[SSN]', result)
        # Dates (simplified): MM/DD/YYYY → [DATE]
        result = re.sub(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', '[DATE]', result)
        # Email: person@domain.com → [EMAIL]
        result = re.sub(r'\S+@\S+', '[EMAIL]', result)
        
        return result

class AuditLogger:
    """Log AI operations for compliance"""
    
    def __init__(self):
        self.logger = logging.getLogger('audit')
    
    def log_ai_request(self, user_id: int, action: str, 
                       ai_service: str, metadata: dict = None):
        """
        Log AI request.
        Important: Never log full prompts or PHI.
        """
        self.logger.info(
            f"user_id={user_id} | action={action} | service={ai_service} | "
            f"timestamp={datetime.utcnow().isoformat()} | metadata={metadata}"
        )
    
    def log_ai_response_generated(self, user_id: int, action: str,
                                   response_length: int, 
                                   ai_service: str, model_version: str):
        """Log successful AI response"""
        self.logger.info(
            f"user_id={user_id} | action=response_generated | "
            f"service={ai_service} | model={model_version} | "
            f"response_length={response_length}"
        )
    
    def log_clinician_approval(self, user_id: int, note_id: str, 
                               approved: bool, edits: bool = False):
        """Log clinician's review and approval of AI output"""
        self.logger.info(
            f"clinician_id={user_id} | action=approval | "
            f"note_id={note_id} | approved={approved} | "
            f"edited={edits}"
        )

class RateLimiter:
    """Simple rate limiting (in production: use Redis)"""
    
    def __init__(self, max_requests: int = 10, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}  # user_id → [(timestamp, count)]
    
    def check(self, user_id: str) -> bool:
        """Check if user is within rate limit"""
        now = datetime.utcnow().timestamp()
        window_start = now - self.window_seconds
        
        if user_id not in self.requests:
            self.requests[user_id] = []
        
        # Filter old requests
        self.requests[user_id] = [
            ts for ts in self.requests[user_id] if ts > window_start
        ]
        
        # Check count
        if len(self.requests[user_id]) < self.max_requests:
            self.requests[user_id].append(now)
            return True
        
        return False

def require_auth(f):
    """Decorator: ensure user is authenticated"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Missing auth token'}), 401
        
        # Validate token (pseudo-code)
        # user_id = validate_jwt_token(token)
        # if not user_id:
        #     return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def require_role(*roles):
    """Decorator: ensure user has required role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_role = request.headers.get('X-User-Role')
            if user_role not in roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
```

---

## Frontend Integration

### Component: `NoteAISummaryPanel.jsx`

```jsx
import React, { useState } from 'react';
import { AlertCircle, Loader, CheckCircle } from 'lucide-react';

const NoteAISummaryPanel = ({ rawNote, noteId, patientId, doctorId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [approved, setApproved] = useState(false);
  const [edits, setEdits] = useState({});

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          note_id: noteId,
          raw_note_text: rawNote,
          patient_id: patientId,
          doctor_id: doctorId
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setSummary(data.note_interpretation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setApproved(true);
    // Send approval to backend
    fetch(`/api/notes/${noteId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ edits: edits || {} })
    });
  };

  return (
    <div className="note-ai-panel border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold mb-4">AI Summary Tool</h3>

      {!summary ? (
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? <Loader className="inline mr-2" /> : 'Generate AI Summary'}
        </button>
      ) : null}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mt-3 flex items-start">
          <AlertCircle className="mr-3 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div className="flex items-center mt-4">
          <Loader className="animate-spin mr-3" />
          <p>Processing note with AI...</p>
        </div>
      )}

      {summary && (
        <div className="mt-6 space-y-4">
          {/* Disclaimer */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            ⚠ <strong>AI-generated content</strong> — requires clinical verification.
          </div>

          {/* Formatted Note */}
          <div>
            <h4 className="font-semibold text-sm">Formatted Note</h4>
            <div className="bg-gray-50 p-3 rounded text-sm mt-1 whitespace-pre-wrap">
              {edits.formatted !== undefined ? edits.formatted : summary.formatted_note}
            </div>
            <textarea
              value={edits.formatted !== undefined ? edits.formatted : summary.formatted_note}
              onChange={(e) => setEdits({ ...edits, formatted: e.target.value })}
              className="w-full mt-2 p-2 border rounded text-sm"
              rows="4"
              placeholder="Edit if needed..."
            />
          </div>

          {/* Clinical Summary */}
          <div>
            <h4 className="font-semibold text-sm">Clinical Summary</h4>
            <div className="bg-blue-50 p-3 rounded text-sm mt-1">
              {edits.clinical !== undefined ? edits.clinical : summary.clinical_summary}
            </div>
            <textarea
              value={edits.clinical !== undefined ? edits.clinical : summary.clinical_summary}
              onChange={(e) => setEdits({ ...edits, clinical: e.target.value })}
              className="w-full mt-2 p-2 border rounded text-sm"
              rows="3"
              placeholder="Edit if needed..."
            />
          </div>

          {/* Patient-Friendly Summary */}
          <div>
            <h4 className="font-semibold text-sm">Patient-Friendly Summary</h4>
            <div className="bg-green-50 p-3 rounded text-sm mt-1">
              {edits.patient !== undefined ? edits.patient : summary.patient_friendly_summary}
            </div>
            <textarea
              value={edits.patient !== undefined ? edits.patient : summary.patient_friendly_summary}
              onChange={(e) => setEdits({ ...edits, patient: e.target.value })}
              className="w-full mt-2 p-2 border rounded text-sm"
              rows="3"
              placeholder="Edit if needed..."
            />
          </div>

          {/* Extracted Entities */}
          <div>
            <h4 className="font-semibold text-sm">Extracted Entities</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(summary.extracted_entities, null, 2)}
            </pre>
          </div>

          {/* Approval Button */}
          {!approved ? (
            <button
              onClick={handleApprove}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve & Save
            </button>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle className="mr-2" /> Approved
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteAISummaryPanel;
```

### Component: `AfyaclickAssistantWidget.jsx`

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';

const AfyaclickAssistantWidget = ({ userRole, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(`conv-${Date.now()}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      { type: 'user', content: inputMessage }
    ]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_role: userRole,
          user_id: userId,
          message: inputMessage,
          conversation_id: conversationId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        { 
          type: 'assistant',
          content: data.reply,
          actions: data.suggested_actions,
          disclaimer: data.disclaimer
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: 'error', content: error.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.action_type === 'navigate') {
      window.location.href = action.target;
    } else if (action.action_type === 'link') {
      window.open(action.target, '_blank');
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40"
        aria-label="Open Afyaclick Assistant"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
            <h3 className="font-semibold">Afyaclick Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 p-1 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm">
                Hi! I'm here to help with {userRole === 'clinician' ? 'documentation and workflow' : 'navigation and FAQ'} questions.
              </p>
            )}

            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.type === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded-lg max-w-xs">
                      {msg.content}
                    </div>
                  </div>
                )}

                {msg.type === 'assistant' && (
                  <div className="space-y-2">
                    <div className="bg-white text-gray-900 px-3 py-2 rounded-lg max-w-xs border">
                      {msg.content}
                    </div>

                    {/* Disclaimer */}
                    {msg.disclaimer && (
                      <p className="text-xs text-gray-600 border-l-2 border-yellow-400 pl-2 italic">
                        {msg.disclaimer}
                      </p>
                    )}

                    {/* Suggested Actions */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="space-y-1">
                        {msg.actions.map((action, aidx) => (
                          <button
                            key={aidx}
                            onClick={() => handleActionClick(action)}
                            className="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200"
                          >
                            → {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {msg.type === 'error' && (
                  <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-3 py-2 rounded-lg text-gray-600 text-sm">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 border rounded text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AfyaclickAssistantWidget;
```

---

## API Contracts

### Endpoint 1: POST `/api/ai/notes`

**Purpose:** Interpret and summarize a clinical note

**Authentication:** Required (JWT Bearer token)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "note_id": "NOTE-2026-02-26-001",
  "raw_note_text": "Patient presents with persistent dry cough x 3 weeks...",
  "patient_id": 42,
  "doctor_id": "DOC-001"
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "note_interpretation": {
    "id": 1001,
    "note_id": "NOTE-2026-02-26-001",
    "formatted_note": "**Chief Complaint:** Persistent dry cough\n**Duration:** 3 weeks\n...",
    "clinical_summary": "45-year-old patient with 3-week history of dry cough. Clear lungs on exam. Normal oxygenation.",
    "patient_friendly_summary": "You have had a dry cough for 3 weeks without fever. Your lung exam is normal.",
    "extracted_entities": {
      "symptoms": ["dry cough"],
      "diagnoses": [],
      "medications": [],
      "vitals": { "SpO2": "98%" }
    },
    "ai_metadata": {
      "model_version": "gpt-4-turbo-2024-04",
      "ai_provider": "openai",
      "timestamp": "2026-02-26T14:32:15Z"
    },
    "disclaimer": "⚠ AI-generated content — requires clinical verification."
  }
}
```

**Response 400 (Bad Request):**
```json
{
  "success": false,
  "error": "Invalid input",
  "details": "Note text exceeds maximum length (5000 chars)"
}
```

**Response 401 (Unauthorized):**
```json
{
  "success": false,
  "error": "Missing or invalid authentication token"
}
```

**Response 503 (Service Unavailable):**
```json
{
  "success": false,
  "error": "AI service temporarily unavailable",
  "fallback": "Please try again in 60 seconds, or save the raw note for manual review."
}
```

### Endpoint 2: POST `/api/ai/chat`

**Purpose:** Get chatbot response for workflow guidance

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "user_role": "clinician",
  "user_id": "DOC-002",
  "message": "How do I add a note to a patient's record?",
  "conversation_id": "conv-26feb2026-001"
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "reply": "To document a patient note in Afyaclick:\n\n1. Navigate to **Patient Records**...",
  "suggested_actions": [
    {
      "label": "Go to Patient Records",
      "action_type": "navigate",
      "target": "/patient-records"
    }
  ],
  "disclaimer": "This is system guidance only and does not replace professional judgment."
}
```

**Response 400 (Bad Request):**
```json
{
  "success": false,
  "error": "Invalid input",
  "details": "Message must be at least 3 characters"
}
```

---

## Security & Privacy

### De-identification Strategy

Before sending user input to external AI:

1. **Remove/Mask PII:**
   - Phone numbers → `[PHONE]`
   - SSN → `[SSN]`
   - Dates → `[DATE]`
   - Emails → `[EMAIL]`
   - Names → `[NAME]`

2. **Context Only:** Send clinical context, not patient identifiers

   **Example:**
   ```
   BEFORE: "Patient John Doe, DOB 5/15/1990, called with severe chest pain..."
   AFTER: "[NAME], age 45, presented with severe chest pain..."
   ```

3. **Environment Variables (Never hardcode API keys):**
   ```bash
   AI_PROVIDER=openai
   AI_API_KEY=sk-...
   AI_MODEL_VERSION=gpt-4-turbo-2024-04
   MAX_REQUESTS_PER_HOUR=10
   AUDIT_LOG_ENABLED=true
   ```

### Audit Logging

Log **metadata only**:
- Who: User ID (hashed for logging)
- When: Timestamp
- What: Action (note_interpreted, chat_responded)
- Service: Which AI service
- Outcome: Success/failure

**Never log:**
- Full prompts
- Full responses
- Patient names, IDs, DOBs
- Medical content detail

### Rate Limiting

- **Per-user:** 10 requests/hour per clinician
- **Global:** 100 requests/hour per API endpoint
- **Fallback:** Manual review if rate limit exceeded

### Encryption

- **In transit:** TLS 1.3 (HTTPS only)
- **At rest:** Database encryption using SQLAlchemy encryption (if sensitive)
- **API keys:** Environment variables, never in code/logs

### Access Control

```python
@require_auth  # Must have valid JWT
@require_role('clinician', 'patient')  # Only these roles
def ai_endpoint():
    pass
```

### Data Retention

- **AI Interpretations:** Stored indefinitely (linked to patient records)
- **Chat Sessions:** Metadata only, deleted after 90 days
- **Chat Messages:** High-level intent summaries, deleted after 30 days
- **Raw Prompts:** Never stored
- **Logs:** Metadata only, retained per compliance policy

---

## Error Handling & Resilience

### Timeout Handling

```python
try:
    response = openai.ChatCompletion.create(
        ...,
        timeout=15  # 15-second timeout
    )
except TimeoutError:
    # Gracefully degrade
    return {
        'error': 'AI service timeout',
        'fallback': 'Please save the note and try again.'
    }
```

### Fallback Strategies

| Failure | Frontend | Backend |
|---------|----------|---------|
| AI service down | Show error + "Try again" button | Return 503, suggest manual review |
| Rate limit hit | "Too many requests. Try in 1 hour." | Return 429, log attempt |
| Invalid input | Client-side validation + error | Reject with 400 + details |
| Timeout | Show "Thinking..." → timeout after 30s | Kill request after 15s, return 503 |

### Circuit Breaker Pattern

```python
class AIServiceCircuitBreaker:
    """Stop calling AI if it's failing"""
    
    def __init__(self, failure_threshold=5, timeout=300):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.last_failure_time = None
    
    def call(self, fn, *args, **kwargs):
        # If circuit is open, fail fast
        if self.is_open():
            raise CircuitBreakerOpen("AI service unavailable")
        
        try:
            result = fn(*args, **kwargs)
            self.reset()
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = datetime.utcnow()
            if self.failure_count >= self.failure_threshold:
                # Circuit is now open
                pass
            raise
    
    def is_open(self):
        """Check if circuit should open"""
        if self.failure_count < self.failure_threshold:
            return False
        elapsed = (datetime.utcnow() - self.last_failure_time).total_seconds()
        return elapsed < self.timeout
```

---

## Testing Strategy

### Unit Tests

```python
# tests/test_ai_service.py

def test_note_interpreter_validates_input():
    """Input validation: min/max length"""
    interpreter = NoteInterpreter()
    
    # Too short
    with pytest.raises(ValueError):
        interpreter.validate_input("too short")
    
    # Too long
    with pytest.raises(ValueError):
        interpreter.validate_input("x" * 5001)

def test_note_interpreter_de_identifies():
    """PII is removed before sending to AI"""
    interpreter = NoteInterpreter()
    
    original = "Patient DOE, John (555-1234) called..."
    de_ided = interpreter.de_identify(original)
    
    assert "DOE" not in de_ided
    assert "555-1234" not in de_ided
    assert "[PHONE]" in de_ided

def test_chatbot_refuses_diagnosis():
    """Chatbot does not diagnose"""
    chatbot = AfyaclickChatbot()
    
    response = chatbot.respond(
        user_role='patient',
        message='Do I have COVID?',
        conversation_id='test'
    )
    
    assert "cannot" in response['reply'].lower() or "diagnose" in response['reply'].lower()
    assert response['disclaimer']

def test_api_endpoint_requires_auth():
    """POST /api/ai/notes requires JWT"""
    client = app.test_client()
    
    # Without token
    response = client.post('/api/ai/notes', json={...})
    assert response.status_code == 401
    
    # With token
    response = client.post(
        '/api/ai/notes',
        json={...},
        headers={'Authorization': f'Bearer {valid_token}'}
    )
    assert response.status_code in [200, 503]  # Success or service error, not auth error
```

### Integration Tests

```python
def test_end_to_end_note_interpretation():
    """Full workflow: raw note → interpretation → clinician approval"""
    
    # 1. Create test patient/doctor
    doctor = Doctor.query.first()
    patient = Patient.query.first()
    
    # 2. Send note to AI
    response = client.post(
        '/api/ai/notes',
        json={
            'note_id': 'TEST-001',
            'raw_note_text': 'Patient has persistent cough x 2 weeks',
            'patient_id': patient.id,
            'doctor_id': doctor.doctor_id
        },
        headers={'Authorization': f'Bearer {token}'}
    )
    
    assert response.status_code == 200
    interpretation = response.json['note_interpretation']
    
    # 3. Verify structure
    assert 'formatted_note' in interpretation
    assert 'clinical_summary' in interpretation
    assert 'patient_friendly_summary' in interpretation
    assert 'disclaimer' in interpretation
    
    # 4. Clinician approves
    response = client.post(
        f'/api/notes/{interpretation["id"]}/approve',
        json={'edits': {}},
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
```

### Mock AI Responses

```python
# tests/fixtures.py

@pytest.fixture
def mock_openai_response(monkeypatch):
    """Mock OpenAI API response"""
    
    def mock_call(*args, **kwargs):
        return {
            'choices': [{
                'message': {
                    'content': json.dumps({
                        'formatted': 'Formatted note...',
                        'clinical': 'Clinical summary...',
                        'patient_friendly': 'Simple version...'
                    })
                }
            }]
        }
    
    monkeypatch.setattr('openai.ChatCompletion.create', mock_call)
```

### Performance Tests

```python
def test_note_interpretation_completes_within_timeout():
    """AI call must complete within 15 seconds"""
    interpreter = NoteInterpreter()
    note_text = "Sample clinical note..."
    
    start = time.time()
    result = interpreter.interpret_note('NOTE-001', note_text, 1, 'DOC-001')
    elapsed = time.time() - start
    
    assert elapsed < 15, f"Request took {elapsed}s, max is 15s"
```

---

## Deployment Checklist

### Before Going Live

- [ ] **Environment Variables:**
  - [ ] `AI_PROVIDER` set (openai, anthropic)
  - [ ] `AI_API_KEY` configured
  - [ ] `AI_MODEL_VERSION` specified
  - [ ] `DATABASE_URL` points to production DB
  - [ ] `FLASK_ENV=production`
  - [ ] `DEBUG=false`

- [ ] **Database Migrations:**
  - [ ] Run `flask db upgrade` to create NoteInterpretation, ChatSession, ChatMessage tables
  - [ ] Backup existing data
  - [ ] Test rollback procedure

- [ ] **Security:**
  - [ ] All endpoints behind authentication (no public /api/ai routes)
  - [ ] Rate limiting enabled
  - [ ] SSL/TLS certificate valid
  - [ ] CORS properly configured (only trusted origins)
  - [ ] Audit logging enabled

- [ ] **Testing:**
  - [ ] Unit tests pass (100% coverage of ai_service.py)
  - [ ] Integration tests pass
  - [ ] No regressions in existing endpoints (smoke tests)
  - [ ] Performance tests: <15s API response
  - [ ] Load test: 50 concurrent users

- [ ] **Monitoring:**
  - [ ] Error logging to CloudWatch / Sentry
  - [ ] Audit logging to dedicated log stream
  - [ ] Health check at `/health` endpoint
  - [ ] Alerts set for failures

- [ ] **Documentation:**
  - [ ] API docs (OpenAPI/Swagger) generated
  - [ ] Clinician guide (how to use AI features)
  - [ ] Patient FAQ
  - [ ] Troubleshooting guide

- [ ] **Compliance:**
  - [ ] HIPAA review completed
  - [ ] Data processing agreement with AI vendor
  - [ ] Privacy notice updated (notify patients AI is in use)
  - [ ] Audit trail shows who used AI features

- [ ] **Rollback Plan:**
  - [ ] Tested procedure to disable AI endpoints
  - [ ] Fallback UI (gracefully show "AI unavailable")
  - [ ] Communication plan for users

### After Deployment

- [ ] Monitor error rates (alert if >5% fail)
- [ ] Monitor AI service latency (alert if >10s average)
- [ ] Review first 10 AI interpretations manually (QA)
- [ ] Collect user feedback (usability survey)
- [ ] Weekly audit log review
- [ ] Monthly cost analysis (API usage)

---

## Conclusion

This architecture ensures:
1. ✅ **Non-disruptive:** Existing features untouched
2. ✅ **Secure:** De-identification, encryption, audit trails
3. ✅ **Compliant:** Healthcare disclaimers, clinician review, data privacy
4. ✅ **Resilient:** Timeouts, fallbacks, circuit breaker
5. ✅ **Testable:** Unit/integration/performance tests
6. ✅ **Observable:** Logging and monitoring
7. ✅ **Scalable:** Modular service layer, async patterns where possible

---

**Next Steps:**
1. Review this architecture with security/compliance team
2. Create database migration file
3. Implement `ai_service.py` and `chatbot_service.py`
4. Add API endpoints to `app.py`
5. Create Frontend components
6. Run full test suite
7. Deploy to staging environment
8. UAT with clinical staff
9. Production deployment with monitoring
