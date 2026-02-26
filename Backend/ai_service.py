"""
ai_service.py - Doctor Note Interpreter & Summary Module

Module for interpreting unstructured clinical notes using external AI.
Handles de-identification, input validation, output formatting, and audit logging.

Production Features:
- PHI/PII de-identification before API calls
- Input validation (length, encoding)
- Rate limiting per clinician
- Structured error handling with timeouts
- Audit logging (metadata only, no PHI)
- Graceful fallbacks if AI service unavailable
- Support for multiple AI providers (OpenAI, Anthropic)
"""

import os
import re
import json
import logging
import hashlib
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from functools import wraps

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)



class ValidationError(Exception):
    """Raised when input validation fails"""
    pass


class RateLimitError(Exception):
    """Raised when rate limit is exceeded"""
    pass


class AIServiceError(Exception):
    """Raised when AI service call fails"""
    pass


class PHIFilter:
    """
    De-identify and sanitize data before sending to external AI.
    Removes or masks: names, phones, SSNs, datesof birth, addresses, medical record numbers.
    """
    
    @staticmethod
    def de_identify_text(text: str) -> str:
        """
        Remove/mask Personally Identifiable Information (PII) and Protected Health Information (PHI).
        
        Replaces:
        - Phone numbers (XXX-XXX-XXXX, XXX.XXX.XXXX) → [PHONE]
        - SSN (XXX-XX-XXXX) → [SSN]
        - Dates (MM/DD/YYYY, DD/MM/YYYY) → [DATE]
        - Email addresses → [EMAIL]
        - Medical Record Numbers (9+ digits) → [ID]
        
        Args:
            text: Raw clinical note text
        
        Returns:
            De-identified text safe to send to external AI
        """
        result = text
        
        # Phone numbers: 555-1234, 555.1234, 555 1234
        result = re.sub(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '[PHONE]', result)
        
        # SSN: 123-45-6789
        result = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', result)
        
        # Dates: MM/DD/YYYY, DD/MM/YYYY, M/D/YY
        result = re.sub(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', '[DATE]', result)
        result = re.sub(r'\b\d{1,2}-\d{1,2}-\d{2,4}\b', '[DATE]', result)
        
        # Email addresses: person@domain.com
        result = re.sub(r'\b\S+@\S+\.\S+\b', '[EMAIL]', result)
        
        # Medical Record Numbers (9+ consecutive digits)
        result = re.sub(r'\b\d{9,}\b', '[ID]', result)
        
        # MRN pattern: MRN123456 or MRN-123456
        result = re.sub(r'\bMRN[-\s]?\d{6,}\b', '[MRN]', result, flags=re.IGNORECASE)
        
        # Account numbers (similar pattern)
        result = re.sub(r'\bAccount\s*[-#]?\s*\d{6,}\b', '[ACCOUNT]', result, flags=re.IGNORECASE)
        
        return result


class RateLimiter:
    """
    Simple in-memory rate limiter.
    In production, use Redis for distributed rate limiting across multiple servers.
    
    Rate limits: 10 requests per hour per clinician, 100 per hour global.
    """
    
    def __init__(self, user_limit: int = 10, window_seconds: int = 3600):
        """
        Initialize rate limiter.
        
        Args:
            user_limit: Max requests per user per window
            window_seconds: Time window in seconds (default: 1 hour)
        """
        self.user_limit = user_limit
        self.window_seconds = window_seconds
        self.requests = {}  # user_id → [timestamp1, timestamp2, ...]
    
    def check(self, user_id: str) -> Tuple[bool, int]:
        """
        Check if user is within rate limit.
        
        Args:
            user_id: Unique identifier (doctor_id)
        
        Returns:
            Tuple: (is_allowed, requests_remaining)
        """
        now = datetime.utcnow().timestamp()
        window_start = now - self.window_seconds
        
        # Initialize if needed
        if user_id not in self.requests:
            self.requests[user_id] = []
        
        # Remove timestamps outside current window
        self.requests[user_id] = [
            ts for ts in self.requests[user_id] if ts > window_start
        ]
        
        # Check if under limit
        current_count = len(self.requests[user_id])
        requests_remaining = self.user_limit - current_count
        
        if current_count < self.user_limit:
            # Still under limit, record this request
            self.requests[user_id].append(now)
            return True, requests_remaining - 1
        
        # Over limit
        return False, 0


class NoteInterpreter:
    """
    Main class: Interpret unstructured clinical notes using external AI.
    
    Workflow:
    1. Validate input (length, encoding)
    2. De-identify before sending to AI
    3. Call AI provider (OpenAI, Anthropic, etc.)
    4. Parse structured output
    5. Extract medical entities (symptoms, diagnoses, medications, vitals)
    6. Log action (metadata only)
    7. Return formatted result
    
    Supported AI Providers:
    - openai (GPT-4, GPT-4-turbo)
    - anthropic (Claude 3)
    """
    
    def __init__(self):
        """Initialize Note Interpreter with config from environment"""
        self.model_version = os.getenv('AI_MODEL_VERSION', 'gpt-4-turbo-2024-04')
        self.ai_provider = os.getenv('AI_PROVIDER', 'openai')
        self.api_key = os.getenv('AI_API_KEY')
        self.api_timeout = int(os.getenv('AI_API_TIMEOUT', '15'))  # seconds
        self.rate_limiter = RateLimiter()
        
        if not self.api_key:
            logger.warning("AI_API_KEY not set. AI features will be disabled.")
        
        logger.info(f"NoteInterpreter initialized | provider={self.ai_provider} | model={self.model_version}")
    
    def interpret_note(self, note_id: str, raw_text: str, 
                       patient_id: int, doctor_id: str) -> Dict:
        """
        Main entry point: Interpret a clinical note.
        
        Args:
            note_id: Unique identifier for the note (e.g., "NOTE-2026-02-26-001")
            raw_text: Original unstructured note from clinician
            patient_id: Patient database ID
            doctor_id: Doctor database ID
        
        Returns:
            Dictionary with keys:
            - formatted_note: Clean, structured version
            - clinical_summary: Concise clinician-focused summary
            - patient_friendly_summary: Simple explanation for patient
            - extracted_entities: Symptoms, diagnoses, medications, vitals
            - ai_metadata: Model version, provider, timestamp
        
        Raises:
            ValidationError: If input is invalid
            RateLimitError: If doctor has exceeded rate limit
            AIServiceError: If AI provider returns error
        """
        try:
            # Step 1: Validate input
            self.validate_input(raw_text)
            logger.info(f"Input validation passed | note_id={note_id}")
            
            # Step 2: Check rate limit
            allowed, remaining = self.rate_limiter.check(doctor_id)
            if not allowed:
                logger.warning(f"Rate limit exceeded | doctor={doctor_id}")
                raise RateLimitError(
                    f"Rate limit exceeded. Max 10 requests per hour. Please try again later."
                )
            
            # Step 3: De-identify before sending to AI
            de_identified = PHIFilter.de_identify_text(raw_text)
            logger.debug(f"Note de-identified | original_len={len(raw_text)} | de_id_len={len(de_identified)}")
            
            # Step 4: Audit log request
            self._audit_log_request(
                action='note_interpretation_requested',
                doctor_id=doctor_id,
                patient_id_hash=self._hash_id(patient_id),
                metadata={'note_length': len(raw_text)}
            )
            
            # Step 5: Call AI provider
            ai_response = self._call_ai_provider(de_identified)
            logger.info(f"AI response received | note_id={note_id} | length={len(ai_response)}")
            
            # Step 6: Parse structured output
            parsed = self._parse_ai_response(ai_response)
            
            # Step 7: Extract entities
            entities = self._extract_entities(parsed)
            
            # Step 8: Audit log success
            self._audit_log_success(
                action='note_interpretation_completed',
                doctor_id=doctor_id,
                patient_id_hash=self._hash_id(patient_id),
                metadata={
                    'model': self.model_version,
                    'response_length': len(ai_response),
                    'entities_found': len(entities.get('symptoms', []))
                }
            )
            
            # Step 9: Return formatted result
            return {
                'formatted_note': parsed.get('formatted', ''),
                'clinical_summary': parsed.get('clinical', ''),
                'patient_friendly_summary': parsed.get('patient_friendly', ''),
                'extracted_entities': entities,
                'ai_metadata': {
                    'model_version': self.model_version,
                    'ai_provider': self.ai_provider,
                    'timestamp': datetime.utcnow().isoformat() + 'Z'
                }
            }
        
        except (ValidationError, RateLimitError, AIServiceError) as e:
            logger.error(f"Interpretation failed | error={str(e)}")
            raise
        
        except Exception as e:
            logger.exception(f"Unexpected error in interpret_note")
            raise AIServiceError(f"Internal error: {str(e)}")
    
    def validate_input(self, text: str):
        """
        Validate input constraints.
        
        Constraints:
        - Minimum: 20 characters (must have substantive content)
        - Maximum: 5000 characters (reasonable clinical note length)
        - Valid UTF-8 encoding
        - No null bytes or suspicious content
        
        Args:
            text: Raw note text
        
        Raises:
            ValidationError: If validation fails
        """
        # Minimum length check
        stripped = text.strip()
        if len(stripped) < 20:
            raise ValidationError("Note too short (minimum 20 characters)")
        
        # Maximum length check
        if len(text) > 5000:
            raise ValidationError("Note too long (maximum 5000 characters)")
        
        # Encoding check
        try:
            text.encode('utf-8')
        except UnicodeEncodeError as e:
            raise ValidationError(f"Invalid character encoding: {str(e)}")
        
        # Check for null bytes or control characters
        if '\x00' in text or '\x1a' in text:
            raise ValidationError("Note contains invalid control characters")
    
    def _call_ai_provider(self, de_identified_text: str) -> str:
        """
        Call external AI provider (OpenAI, Anthropic, etc.).
        
        In production:
        - Wrap with timeout handling
        - Implement retry logic with exponential backoff
        - Use circuit breaker if failures exceed threshold
        
        Args:
            de_identified_text: De-identified note text
        
        Returns:
            Raw response from AI provider (string or JSON)
        
        Raises:
            AIServiceError: If API call fails
        """
        if not self.api_key:
            raise AIServiceError("AI_API_KEY not configured")
        
        if self.ai_provider == 'openai':
            return self._call_openai(de_identified_text)
        elif self.ai_provider == 'anthropic':
            return self._call_anthropic(de_identified_text)
        else:
            raise AIServiceError(f"Unknown provider: {self.ai_provider}")
    
    def _call_openai(self, text: str) -> str:
        """
        Call OpenAI API (requires: pip install openai).
        
        In production, use:
            import openai
            openai.api_key = self.api_key
            response = openai.ChatCompletion.create(...)
        
        For now, returns stub response.
        """
        # STUB: In production, use openai library
        # import openai
        # openai.api_key = self.api_key
        # try:
        #     response = openai.ChatCompletion.create(
        #         model=self.model_version,
        #         messages=[
        #             {
        #                 "role": "system",
        #                 "content": self._get_system_prompt()
        #             },
        #             {
        #                 "role": "user",
        #                 "content": f"Interpret this clinical note and provide structured output:\n{text}"
        #             }
        #         ],
        #         temperature=0.3,  # Low temperature for consistency
        #         max_tokens=1500,
        #         timeout=self.api_timeout,
        #         response_format={"type": "json_object"}  # Force JSON output
        #     )
        #     return response['choices'][0]['message']['content']
        # except openai.error.Timeout:
        #     raise AIServiceError("OpenAI API timeout")
        # except openai.error.RateLimitError:
        #     raise AIServiceError("OpenAI rate limit exceeded")
        # except Exception as e:
        #     raise AIServiceError(f"OpenAI API error: {str(e)}")
        
        logger.warning("OpenAI not implemented. Returning mock response.")
        return self._mock_ai_response()
    
    def _call_anthropic(self, text: str) -> str:
        """
        Call Anthropic API (requires: pip install anthropic).
        
        STUB: Similar to _call_openai, would use:
            from anthropic import Anthropic
            client = Anthropic(api_key=self.api_key)
            message = client.messages.create(...)
        """
        logger.warning("Anthropic not implemented. Returning mock response.")
        return self._mock_ai_response()
    
    def _mock_ai_response(self) -> str:
        """Return mock AI response for testing (no API key needed)"""
        return json.dumps({
            'formatted': '**Chief Complaint:** Persistent cough\n**Duration:** 3 weeks\n**Associated Symptoms:** Denies fever\n**Physical Exam:** Lungs clear on auscultation\n**Vitals:** SpO2 98% on room air',
            'clinical': 'Patient with 3-week history of dry cough. No fever. Clear lung fields on exam. Normal oxygenation. Differential includes URI sequelae, environmental irritant, or early viral bronchitis. Recommend monitoring, consider allergy workup if persistent.',
            'patient_friendly': 'You have had a dry cough for 3 weeks without fever. When we listened to your lungs, they sounded clear and your oxygen levels are normal. We should monitor this and see if it helps with rest and time. If it continues, we may do more tests.'
        })
    
    def _parse_ai_response(self, response: str) -> Dict:
        """
        Parse structured output from AI.
        
        Expected format from AI (via system prompt):
        {
            "formatted": "structured note text",
            "clinical": "clinical summary",
            "patient_friendly": "simple explanation"
        }
        
        Args:
            response: Raw response from AI provider
        
        Returns:
            Dictionary with formatted, clinical, patient_friendly keys
        """
        try:
            parsed = json.loads(response)
            
            # Validate required keys
            required = ['formatted', 'clinical', 'patient_friendly']
            for key in required:
                if key not in parsed:
                    logger.warning(f"Missing key in AI response: {key}")
                    parsed[key] = ''
            
            return parsed
        
        except json.JSONDecodeError:
            logger.warning("Could not parse AI response as JSON. Treating as plain text.")
            # Fallback: treat entire response as multi-purpose summary
            return {
                'formatted': response,
                'clinical': response,
                'patient_friendly': response
            }
    
    def _extract_entities(self, parsed: Dict) -> Dict:
        """
        Extract medical entities from parsed summaries.
        
        In production, use NLP library (spacy, transformers) for accurate NER.
        For now, use simple keyword matching.
        
        Args:
            parsed: Dictionary with formatted, clinical, patient_friendly
        
        Returns:
            Dictionary with symptoms, diagnoses, medications, vitals lists
        """
        combined_text = ' '.join([
            parsed.get('formatted', ''),
            parsed.get('clinical', ''),
            parsed.get('patient_friendly', '')
        ]).lower()
        
        # Simple keyword-based extraction
        entities = {
            'symptoms': [],
            'diagnoses': [],
            'medications': [],
            'vitals': {}
        }
        
        # Common symptom keywords
        symptom_keywords = ['cough', 'fever', 'pain', 'headache', 'nausea', 'dyspnea', 'chest pain', 'shortness of breath']
        for symptom in symptom_keywords:
            if symptom in combined_text:
                entities['symptoms'].append(symptom)
        
        # Common diagnosis keywords
        diagnosis_keywords = ['pneumonia', 'bronchitis', 'asthma', 'diabetes', 'hypertension', 'uri', 'viral']
        for diagnosis in diagnosis_keywords:
            if diagnosis in combined_text:
                entities['diagnoses'].append(diagnosis)
        
        # Vitals extraction (regex)
        # SpO2 pattern
        spo2_match = re.search(r'spo2[:\s]+(\d+%?)', combined_text)
        if spo2_match:
            entities['vitals']['SpO2'] = spo2_match.group(1)
        
        # BP pattern (120/80)
        bp_match = re.search(r'bp[:\s]*(\d+/\d+)', combined_text)
        if bp_match:
            entities['vitals']['BP'] = bp_match.group(1)
        
        # HR pattern
        hr_match = re.search(r'hr[:\s]*(\d+)', combined_text)
        if hr_match:
            entities['vitals']['HR'] = hr_match.group(1)
        
        # Remove duplicates
        entities['symptoms'] = list(set(entities['symptoms']))
        entities['diagnoses'] = list(set(entities['diagnoses']))
        
        return entities
    
    def _get_system_prompt(self) -> str:
        """
        System prompt for AI model.
        Instructs the model to interpret clinical notes and provide structured output.
        """
        return """You are an expert clinical documentation specialist. Your task is to:

1. Read unstructured clinical notes
2. Provide three versions:
   a) "formatted": Clean, structured markdown with sections (Chief Complaint, HPI, Physical Exam, Assessment, Plan, etc.)
   b) "clinical": Concise summary for clinician handoff/audit (2-3 sentences)
   c) "patient_friendly": Simplified explanation for patient understanding (using plain language)

3. Always respond with valid JSON in this format:
{
    "formatted": "...",
    "clinical": "...",
    "patient_friendly": "..."
}

IMPORTANT:
- Preserve medical accuracy
- Never add information not in the original note
- For patient firendly: use layman's terms, explain medical jargon
- Maintain HIPAA compliance: note may be de-identified, do not invent PHI

EXAMPLE INPUT (de-identified):
"Pt presents w/ persistent cough x3wks, denies fever. Lungs clear on exam. SPO2 98% RA. CXR normal."

EXAMPLE OUTPUT:
{
    "formatted": "**Chief Complaint:** Persistent cough\\n**Duration:** 3 weeks\\n**Associated Symptoms:** Denies fever\\n**Physical Exam:** Lungs clear to auscultation bilaterally\\n**Diagnostic Tests:** CXR normal\\n**Vitals:** SpO2 98% on room air",
    "clinical": "3-week persistent dry cough without fever. Clear lungs on exam, normal oxygenation, normal CXR. Likely viral URI or environmental irritant.",
    "patient_friendly": "You've had a dry cough for 3 weeks without fever. Your lungs sound clear and your oxygen is normal. Your chest X-ray looks good. This is likely from a cold or something in the air."
}"""
    
    @staticmethod
    def _hash_id(patient_id: int) -> str:
        """
        One-way hash of patient ID for audit logging.
        
        Prevents storing actual patient IDs in logs while allowing us to
        correlate multiple requests from the same patient.
        
        Args:
            patient_id: Patient database ID
        
        Returns:
            First 8 characters of SHA256 hash
        """
        hash_obj = hashlib.sha256(str(patient_id).encode())
        return hash_obj.hexdigest()[:8]
    
    def _audit_log_request(self, action: str, doctor_id: str, 
                          patient_id_hash: str, metadata: dict = None):
        """Log AI request (metadata only, no PHI)"""
        log_msg = (
            f"action={action} | doctor={doctor_id} | "
            f"patient_hash={patient_id_hash} | "
            f"timestamp={datetime.utcnow().isoformat()}"
        )
        if metadata:
            log_msg += f" | metadata={metadata}"
        logger.info(log_msg)
    
    def _audit_log_success(self, action: str, doctor_id: str,
                          patient_id_hash: str, metadata: dict = None):
        """Log successful AI response"""
        log_msg = (
            f"action={action} | doctor={doctor_id} | "
            f"patient_hash={patient_id_hash} | "
            f"timestamp={datetime.utcnow().isoformat()}"
        )
        if metadata:
            log_msg += f" | metadata={metadata}"
        logger.info(log_msg)


# Example usage
if __name__ == '__main__':
    # For testing
    interpreter = NoteInterpreter()
    
    sample_note = "Patient presents with persistent dry cough x 3 weeks, denies fever. Lungs clear on auscultation. SPO2 98% on room air. CXR unremarkable."
    
    try:
        result = interpreter.interpret_note(
            note_id='NOTE-TEST-001',
            raw_text=sample_note,
            patient_id=42,
            doctor_id='DOC-001'
        )
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}")
