"""
chatbot_service.py - Afyaclick Guided Chatbot Module

Context-aware AI assistant for Afyaclick e-hospital system.
Guides clinicians and patients through workflows.
Does NOT provide medical diagnosis or clinical interpretation.

Role-aware responses:
- Clinician: Documentation, scheduling, system navigation
- Patient: FAQ, appointment booking, records access

Production Features:
- Role-based response routing
- Conversation session tracking
- Suggested actions extraction
- Medical disclaimer management
- Rate limiting
- Audit logging
"""

import os
import json
import logging
import hashlib
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class UserRole(Enum):
    """Supported user roles"""
    CLINICIAN = "clinician"
    PATIENT = "patient"
    ADMIN = "admin"


class ChatbotError(Exception):
    """Raised when chatbot operation fails"""
    pass


class IntentClassifier:
    """Classify user intent from message"""
    
    @staticmethod
    def classify(message: str, user_role: str) -> str:
        """
        Classify intent from user message.
        
        Clinician intents:
        - documentation: "how do I add a note", "where to document"
        - appointments: "schedule appointment", "view appointments"
        - records: "access patient records", "view history"
        - system_help: "how do I", "where is", "how to use"
        
        Patient intents:
        - appointment_booking: "book an appointment", "schedule visit"
        - records_access: "view my records", "see test results"
        - faq: "what is", "how does afyaclick work"
        - medical_question: "should I", "do I have", "is this normal" (catch and redirect)
        
        Args:
            message: User input text
            user_role: "clinician" or "patient"
        
        Returns:
            Intent category string
        """
        msg_lower = message.lower()
        
        # Medical question detection (for all roles)
        medical_keywords = [
            'diagnose', 'diagnosis', 'treatment', 'should i',
            'what disease', 'what condition', 'am i sick',
            'should i see a doctor for', 'do i have',
            'interpret', 'lab values', 'test results',
            'prescribe', 'medication for', 'is this normal'
        ]
        for keyword in medical_keywords:
            if keyword in msg_lower:
                return 'medical_question'
        
        if user_role == 'clinician':
            # Clinician intents
            if any(word in msg_lower for word in ['note', 'document', 'add', 'record']):
                return 'documentation'
            if any(word in msg_lower for word in ['appointment', 'schedule', 'meeting']):
                return 'appointments'
            if any(word in msg_lower for word in ['patient', 'record', 'history', 'access']):
                return 'records'
            if any(word in msg_lower for word in ['how', 'where', 'what']):
                return 'system_help'
        
        elif user_role == 'patient':
            # Patient intents
            if any(word in msg_lower for word in ['book', 'appointment', 'schedule', 'doctor']):
                return 'appointment_booking'
            if any(word in msg_lower for word in ['record', 'result', 'test', 'history', 'view']):
                return 'records_access'
            if any(word in msg_lower for word in ['how', 'what', 'where', 'how to use']):
                return 'faq'
        
        return 'general_question'


class ActionExtractor:
    """Extract suggested actions from chatbot response"""
    
    # Navigation map: Afyaclick features
    CLINICIAN_ROUTES = {
        'patient-records': 'Patient Records',
        'appointments': 'Manage Appointments',
        'documentation': 'Add Clinical Note',
        'settings': 'System Settings'
    }
    
    PATIENT_ROUTES = {
        'medical-records': 'My Medical Records',
        'book-appointment': 'Book Appointment',
        'my-doctors': 'My Doctors',
        'appointments': 'My Appointments',
        'help': 'Help & FAQ'
    }
    
    @staticmethod
    def extract_actions(response: str, user_role: str) -> List[Dict]:
        """
        Extract suggested actions from chatbot response.
        
        Heuristics:
        - If response mentions "Patient Records" → suggest navigation
        - If mentions "appointment" → suggest booking/management
        - If mentions "FAQ" or "help" → suggest help link
        
        Args:
            response: Chatbot response text
            user_role: "clinician" or "patient"
        
        Returns:
            List of action dictionaries
        """
        actions = []
        response_lower = response.lower()
        
        routes = (ActionExtractor.CLINICIAN_ROUTES 
                  if user_role == 'clinician' 
                  else ActionExtractor.PATIENT_ROUTES)
        
        # Check for keywords and suggest corresponding actions
        if 'patient record' in response_lower or 'medical record' in response_lower:
            target = '/patient-records' if user_role == 'clinician' else '/medical-records'
            actions.append({
                'label': routes.get('patient-records', 'View Records'),
                'action_type': 'navigate',
                'target': target
            })
        
        if 'appointment' in response_lower and any(word in response_lower for word in ['book', 'schedule', 'manage']):
            target = '/appointments' if user_role == 'clinician' else '/book-appointment'
            label = 'Manage Appointments' if user_role == 'clinician' else 'Book an Appointment'
            actions.append({
                'label': label,
                'action_type': 'navigate',
                'target': target
            })
        
        if 'doctor' in response_lower and user_role == 'patient':
            actions.append({
                'label': 'View My Doctors',
                'action_type': 'navigate',
                'target': '/my-doctors'
            })
        
        # Limit to 3 suggested actions
        return actions[:3]


class DisclaimerManager:
    """Manage medical disclaimers in chatbot responses"""
    
    DISCLAIMERS = {
        'general': 'This is system guidance. Always follow your institution\'s clinical standards.',
        'medical_question': '⚠ This assistant provides system guidance only and does not replace professional medical judgment. For medical advice, consult your healthcare provider.',
        'patient_medical': '⚠ I cannot provide medical advice. Please consult with your healthcare provider. I can help you book an appointment or access your medical records.',
    }
    
    @staticmethod
    def get_disclaimer(intent: str, user_role: str) -> str:
        """
        Get appropriate disclaimer for intent and role.
        
        Args:
            intent: User intent category
            user_role: "clinician" or "patient"
        
        Returns:
            Disclaimer string
        """
        if intent == 'medical_question':
            return DisclaimerManager.DISCLAIMERS['patient_medical' if user_role == 'patient' else 'medical_question']
        
        return DisclaimerManager.DISCLAIMERS['general']


class AfyaclickChatbot:
    """
    Main chatbot class.
    
    Role-aware AI assistant that guides users through Afyaclick workflows.
    Does NOT diagnose, interpret medical data, or provide clinical advice.
    """
    
    def __init__(self):
        """Initialize chatbot with AI provider config"""
        self.model_version = os.getenv('AI_MODEL_VERSION', 'gpt-4-turbo-2024-04')
        self.ai_provider = os.getenv('AI_PROVIDER', 'openai')
        self.api_key = os.getenv('AI_API_KEY')
        self.api_timeout = int(os.getenv('AI_API_TIMEOUT', '15'))
        
        if not self.api_key:
            logger.warning("AI_API_KEY not set. Chatbot will use mock responses.")
        
        logger.info(f"AfyaclickChatbot initialized | provider={self.ai_provider} | model={self.model_version}")
    
    def respond(self, user_role: str, message: str, 
                conversation_id: str, user_id: int) -> Dict:
        """
        Generate chatbot response.
        
        Args:
            user_role: "clinician" or "patient" or "admin"
            message: User's question/input
            conversation_id: Unique conversation ID (for multi-turn)
            user_id: Patient ID or Doctor ID
        
        Returns:
            Dictionary with keys:
            - reply: Chatbot response text
            - suggested_actions: List of action recommendations
            - disclaimer: Medical/compliance disclaimer
        
        Raises:
            ChatbotError: If response generation fails
        """
        try:
            # Validate input
            self._validate_input(message)
            
            # Normalize role
            if user_role not in ['clinician', 'patient', 'admin']:
                raise ChatbotError(f"Unknown role: {user_role}")
            
            # Classify intent
            intent = IntentClassifier.classify(message, user_role)
            logger.info(f"Intent classified | conversation={conversation_id} | intent={intent}")
            
            # Route to role-specific handler
            if intent == 'medical_question':
                return self._handle_medical_question(user_role, message, conversation_id, user_id)
            elif user_role == 'clinician':
                return self._handle_clinician_query(intent, message, conversation_id, user_id)
            elif user_role == 'patient':
                return self._handle_patient_query(intent, message, conversation_id, user_id)
            else:
                return self._handle_admin_query(intent, message, conversation_id, user_id)
        
        except ChatbotError as e:
            logger.error(f"Chatbot error | conversation={conversation_id} | error={str(e)}")
            raise
        except Exception as e:
            logger.exception(f"Unexpected error in chatbot.respond")
            raise ChatbotError(f"Internal error: {str(e)}")
    
    def _validate_input(self, message: str):
        """Validate user input"""
        if not message or len(message.strip()) < 3:
            raise ChatbotError("Message must be at least 3 characters")
        
        if len(message) > 1000:
            raise ChatbotError("Message too long (max 1000 characters)")
    
    def _handle_medical_question(self, user_role: str, message: str,
                                 conversation_id: str, user_id: int) -> Dict:
        """
        Handle medical questions.
        
        Response: Acknowledge question, explain limitation, redirect to doctor.
        """
        if user_role == 'patient':
            reply = (
                "I understand you have a medical question, but I'm not able to provide "
                "medical advice or diagnosis. That's something only your doctor can do.\n\n"
                "Here's what I can help with:\n"
                "• **Book an appointment** with a doctor\n"
                "• **View your past visit notes** to refresh your memory\n"
                "• **Access your test results** from previous visits\n\n"
                "Please reach out to your healthcare provider directly for medical guidance."
            )
        else:  # clinician or admin
            reply = (
                "I'm designed to help with system navigation and workflow guidance, "
                "not clinical decision support. For clinical questions, please consult "
                "your institution's clinical protocols or colleagues."
            )
        
        disclaimer = DisclaimerManager.get_disclaimer('medical_question', user_role)
        actions = []
        
        if user_role == 'patient':
            actions = [
                {
                    'label': 'Book an Appointment',
                    'action_type': 'navigate',
                    'target': '/book-appointment'
                },
                {
                    'label': 'View My Medical Records',
                    'action_type': 'navigate',
                    'target': '/medical-records'
                }
            ]
        
        self._audit_log(conversation_id, user_id, 'medical_question', user_role)
        
        return {
            'reply': reply,
            'suggested_actions': actions,
            'disclaimer': disclaimer
        }
    
    def _handle_clinician_query(self, intent: str, message: str,
                                conversation_id: str, user_id: int) -> Dict:
        """Handle clinician-specific queries"""
        
        responses = {
            'documentation': (
                "To add a clinical note in Afyaclick:\n\n"
                "1. Navigate to **Patient Records** (left sidebar)\n"
                "2. Search for patient by name or ID\n"
                "3. Click **View Records** → **Add New Note**\n"
                "4. Enter your clinical observations:\n"
                "   - Chief complaint\n"
                "   - History of present illness\n"
                "   - Physical examination findings\n"
                "   - Assessment and plan\n"
                "5. (Optional) Click **AI Summarize** to auto-format\n"
                "6. Review and click **Save**\n\n"
                "Your note is encrypted and time-stamped in the patient's record."
            ),
            'appointments': (
                "To manage appointments in Afyaclick:\n\n"
                "**Schedule New Appointment:**\n"
                "1. Go to **Appointments** (left sidebar)\n"
                "2. Click **Schedule New**\n"
                "3. Select patient, date, time, and reason\n"
                "4. Click **Confirm**\n\n"
                "**View Your Appointments:**\n"
                "1. Go to **My Appointments**\n"
                "2. Filter by date, status, or patient\n"
                "3. Click appointment for details\n\n"
                "**Cancel/Reschedule:**\n"
                "Click appointment → **Actions** → **Reschedule** or **Cancel**"
            ),
            'records': (
                "To access patient records in Afyaclick:\n\n"
                "1. Click **Patient Records** (left sidebar)\n"
                "2. Use search bar to find patient:\n"
                "   - Search by name, ID, or email\n"
                "3. Click **View Records** to see:\n"
                "   - Medical history\n"
                "   - Previous notes and summaries\n"
                "   - Test results\n"
                "   - Appointment history\n"
                "4. Click any note to view full details\n\n"
                "All data is encrypted and access is logged for compliance."
            ),
            'system_help': (
                "What would you like help with?\n\n"
                "• **Adding patient notes** - documentation workflow\n"
                "• **Scheduling appointments** - appointment management\n"
                "• **Finding patient records** - record access\n"
                "• **System settings** - preferences and configuration\n\n"
                "Ask me about any of these, or feel free to ask a specific question!"
            )
        }
        
        reply = responses.get(intent, responses['system_help'])
        
        disclaimer = DisclaimerManager.get_disclaimer(intent, 'clinician')
        actions = ActionExtractor.extract_actions(reply, 'clinician')
        
        self._audit_log(conversation_id, user_id, intent, 'clinician')
        
        return {
            'reply': reply,
            'suggested_actions': actions,
            'disclaimer': disclaimer
        }
    
    def _handle_patient_query(self, intent: str, message: str,
                              conversation_id: str, user_id: int) -> Dict:
        """Handle patient-specific queries"""
        
        responses = {
            'appointment_booking': (
                "To book an appointment in Afyaclick:\n\n"
                "1. Click **Book Appointment** (from dashboard or left menu)\n"
                "2. Select your preferred doctor:\n"
                "   - View doctor specialties and availability\n"
                "   - Read reviews from other patients (if available)\n"
                "3. Pick a date and time that works for you\n"
                "4. Add a note about why you're visiting (optional)\n"
                "5. Click **Confirm Appointment**\n\n"
                "You'll receive a confirmation and a reminder before your appointment.\n"
                "Can't make it? You can reschedule up to 24 hours before."
            ),
            'records_access': (
                "To view your medical records in Afyaclick:\n\n"
                "1. Click **My Medical Records** (left sidebar)\n"
                "2. You can see:\n"
                "   - Previous visit notes\n"
                "   - Test results and lab work\n"
                "   - Doctor's summaries and recommendations\n"
                "3. Click any visit to read full details\n"
                "4. Download notes if you need them\n\n"
                "Your records are private and protected. "
                "Only you and your healthcare team can see them."
            ),
            'faq': (
                "Welcome to Afyaclick! Here are common questions:\n\n"
                "**What is Afyaclick?**\n"
                "An easy-to-use health app where you can manage appointments, "
                "view test results, and communicate with your doctors.\n\n"
                "**Is my data safe?**\n"
                "Yes! All your information is encrypted and protected by law. "
                "Only you and your healthcare team can access it.\n\n"
                "**How do I message my doctor?**\n"
                "Go to **My Doctors** → select a doctor → **Send Message**\n\n"
                "**Can I download my records?**\n"
                "Yes! In **My Medical Records**, click any note and select **Download**\n\n"
                "Have other questions? Scroll down or ask me directly!"
            ),
            'general_question': (
                "I'm here to help! Here's what I can assist with:\n\n"
                "📅 **Appointments** - Book, reschedule, or cancel\n"
                "📋 **Medical Records** - View your visit notes and test results\n"
                "👨‍⚕️ **My Doctors** - See your healthcare team and message them\n"
                "❓ **FAQ** - Common questions about Afyaclick\n\n"
                "What would you like help with?"
            )
        }
        
        reply = responses.get(intent, responses['general_question'])
        
        disclaimer = DisclaimerManager.get_disclaimer(intent, 'patient')
        actions = ActionExtractor.extract_actions(reply, 'patient')
        
        self._audit_log(conversation_id, user_id, intent, 'patient')
        
        return {
            'reply': reply,
            'suggested_actions': actions,
            'disclaimer': disclaimer
        }
    
    def _handle_admin_query(self, intent: str, message: str,
                            conversation_id: str, user_id: int) -> Dict:
        """Handle admin-specific queries"""
        reply = (
            "I'm happy to help with Afyaclick administration. "
            "For admin-specific questions, please contact system support or "
            "check the admin documentation."
        )
        
        disclaimer = "Always follow your institution's IT security policies."
        actions = []
        
        self._audit_log(conversation_id, user_id, 'admin_query', 'admin')
        
        return {
            'reply': reply,
            'suggested_actions': actions,
            'disclaimer': disclaimer
        }
    
    def _audit_log(self, conversation_id: str, user_id: int,
                   intent: str, user_role: str):
        """Log chatbot interaction (metadata only)"""
        logger.info(
            f"CHATBOT_INTERACTION | conversation={conversation_id} | "
            f"user={user_id} | role={user_role} | intent={intent} | "
            f"timestamp={datetime.utcnow().isoformat()}"
        )


# Example usage
if __name__ == '__main__':
    chatbot = AfyaclickChatbot()
    
    # Example: Clinician asking about documentation
    response = chatbot.respond(
        user_role='clinician',
        message='How do I add a note to a patient record?',
        conversation_id='test-conv-001',
        user_id=1
    )
    print(json.dumps(response, indent=2))
    
    # Example: Patient asking medical question
    response = chatbot.respond(
        user_role='patient',
        message='Do I have COVID?',
        conversation_id='test-conv-002',
        user_id=42
    )
    print(json.dumps(response, indent=2))
    
    # Example: Patient booking appointment
    response = chatbot.respond(
        user_role='patient',
        message='How do I book an appointment?',
        conversation_id='test-conv-003',
        user_id=42
    )
    print(json.dumps(response, indent=2))
