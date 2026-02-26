"""
ai_routes.py - API Endpoints for AI Features

NEW Flask routes for AI-powered features:
- POST /api/ai/notes - Interpret and summarize clinical notes
- POST /api/ai/chat - Chatbot for guided assistance
# API Endpoints registered:
# POST /api/ai/notes          → Interpret note
# POST /api/ai/chat           → Chat response
# GET /api/ai/notes/{id}      → Retrieve interpretation
# POST /api/ai/notes/{id}/approve → Clinician approval
# GET /api/ai/health          → Health check


These routes are additive and do NOT modify existing endpoints.

Security:
- All endpoints require authentication (JWT Bearer token)
- Role-based access control
- Rate limiting per user
- Structured error handling
- Audit logging
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import json
from typing import Dict, Tuple, Optional

from ai_service import NoteInterpreter, ValidationError, RateLimitError, AIServiceError
from chatbot_service import AfyaclickChatbot, ChatbotError
from ai_models import NoteInterpretation, ChatSession, ChatMessage, AIAuditLog
from models import db
from ai_config import (
    AIConfig, SecurityUtils, RateLimiter, CircuitBreaker,
    require_ai_enabled, require_auth_token, require_role
)

# Create Blueprint
ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')
logger = logging.getLogger(__name__)

# Initialize services
note_interpreter = NoteInterpreter()
chatbot = AfyaclickChatbot()
rate_limiter = RateLimiter(
    user_limit=AIConfig.MAX_REQUESTS_PER_HOUR,
    window_seconds=AIConfig.RATE_LIMIT_WINDOW_SECONDS
)
circuit_breaker = CircuitBreaker()


# ============================================================================
# ENDPOINT 1: POST /api/ai/notes - Interpret & Summarize Clinical Notes
# ============================================================================

@ai_bp.route('/notes', methods=['POST'])
@require_auth_token
@require_role('clinician', 'admin')
@require_ai_enabled
def interpret_note():
    """
    Interpret and summarize a clinical note.
    
    Request Body:
    {
        "note_id": "string",
        "raw_note_text": "string",
        "patient_id": "int",
        "doctor_id": "string"
    }
    
    Response (200 OK):
    {
        "success": true,
        "note_interpretation": {
            "id": 1001,
            "note_id": "...",
            "formatted_note": "...",
            "clinical_summary": "...",
            "patient_friendly_summary": "...",
            "extracted_entities": {...},
            "ai_metadata": {...},
            "disclaimer": "..."
        }
    }
    
    Error Responses:
    - 400: Bad Request (invalid input)
    - 401: Unauthorized (missing auth)
    - 403: Forbidden (insufficient role)
    - 429: Too Many Requests (rate limit)
    - 503: Service Unavailable (AI service down)
    """
    try:
        # Extract user info from headers
        user_id = request.headers.get('X-User-ID', 'unknown')
        user_role = request.headers.get('X-User-Role', 'unknown')
        
        # Parse request
        data = request.get_json()
        if not data:
            return _error_response('Invalid JSON', 400)
        
        # Extract fields
        note_id = data.get('note_id', '').strip()
        raw_note_text = data.get('raw_note_text', '').strip()
        patient_id = data.get('patient_id')
        doctor_id = data.get('doctor_id', '').strip()
        
        # Validate required fields
        if not note_id or not raw_note_text or not patient_id or not doctor_id:
            return _error_response(
                'Missing required fields: note_id, raw_note_text, patient_id, doctor_id',
                400
            )
        
        # Check rate limit
        allowed, remaining = rate_limiter.is_allowed(doctor_id)
        if not allowed:
            _audit_log_action(doctor_id, 'rate_limit_exceeded', 'note_interpreter')
            reset_time = rate_limiter.get_reset_time(doctor_id)
            return jsonify({
                'success': False,
                'error': 'Rate limit exceeded',
                'message': f'Maximum {AIConfig.MAX_REQUESTS_PER_HOUR} requests per hour',
                'reset_at': reset_time.isoformat() if reset_time else None
            }), 429
        
        # Check if note already interpreted
        existing = NoteInterpretation.query.filter_by(
            note_id=note_id, is_deleted=False
        ).first()
        
        if existing and existing.clinician_approved:
            logger.info(f"Returning cached interpretation | note_id={note_id}")
            return jsonify({
                'success': True,
                'note_interpretation': existing.to_dict(include_original=False),
                'message': 'Cached interpretation (already approved)'
            }), 200
        
        # Call AI service through circuit breaker
        logger.info(f"Interpreting note | note_id={note_id} | doctor={doctor_id}")
        
        ai_result = circuit_breaker.call(
            note_interpreter.interpret_note,
            note_id, raw_note_text, patient_id, doctor_id
        )
        
        # Store interpretation in database
        interpretation = NoteInterpretation(
            note_id=note_id,
            patient_id=patient_id,
            doctor_id=doctor_id,
            original_note_text=raw_note_text,
            formatted_note=ai_result['formatted_note'],
            clinical_summary=ai_result['clinical_summary'],
            patient_friendly_summary=ai_result['patient_friendly_summary'],
            extracted_symptoms=ai_result['extracted_entities'].get('symptoms'),
            extracted_diagnoses=ai_result['extracted_entities'].get('diagnoses'),
            extracted_medications=ai_result['extracted_entities'].get('medications'),
            extracted_vitals=ai_result['extracted_entities'].get('vitals'),
            ai_model_version=ai_result['ai_metadata']['model_version'],
            ai_provider=ai_result['ai_metadata']['ai_provider'],
            ai_processing_timestamp=datetime.utcnow()
        )
        
        db.session.add(interpretation)
        db.session.commit()
        
        logger.info(f"Interpretation stored | interpretation_id={interpretation.id}")
        
        # Audit log
        _audit_log_action(
            doctor_id, 'note_interpretation_completed', 'note_interpreter',
            result='success',
            metadata={
                'note_length': len(raw_note_text),
                'patient_id_hash': SecurityUtils.hash_user_id(patient_id)
            }
        )
        
        # Return response
        response = {
            'success': True,
            'note_interpretation': {
                'id': interpretation.id,
                'note_id': interpretation.note_id,
                'formatted_note': interpretation.formatted_note,
                'clinical_summary': interpretation.clinical_summary,
                'patient_friendly_summary': interpretation.patient_friendly_summary,
                'extracted_entities': ai_result['extracted_entities'],
                'ai_metadata': ai_result['ai_metadata'],
                'disclaimer': '⚠ AI-generated content — requires clinical verification before use.'
            }
        }
        
        return jsonify(response), 200
    
    except ValidationError as e:
        logger.warning(f"Validation error | error={str(e)}")
        _audit_log_action(
            request.headers.get('X-User-ID', 'unknown'),
            'validation_error', 'note_interpreter',
            result='error', metadata={'error': str(e)}
        )
        return _error_response(f'Invalid input: {str(e)}', 400)
    
    except RateLimitError as e:
        logger.warning(f"Rate limit | error={str(e)}")
        return _error_response(str(e), 429)
    
    except AIServiceError as e:
        logger.error(f"AI service error | error={str(e)}")
        _audit_log_action(
            request.headers.get('X-User-ID', 'unknown'),
            'ai_service_error', 'note_interpreter',
            result='error', metadata={'error': str(e)}
        )
        return jsonify({
            'success': False,
            'error': 'AI service temporarily unavailable',
            'message': 'Please try again in a few moments',
            'fallback': 'You can save the raw note for manual review'
        }), 503
    
    except Exception as e:
        logger.exception(f"Unexpected error in interpret_note")
        return _error_response('Internal server error', 500)


# ============================================================================
# ENDPOINT 2: POST /api/ai/chat - Guided Chatbot
# ============================================================================

@ai_bp.route('/chat', methods=['POST'])
@require_auth_token
@require_ai_enabled
def chat():
    """
    Get chatbot response for workflow guidance.
    
    Request Body:
    {
        "user_role": "clinician | patient | admin",
        "user_id": "int",
        "message": "string",
        "conversation_id": "string"
    }
    
    Response (200 OK):
    {
        "success": true,
        "reply": "...",
        "suggested_actions": [...],
        "disclaimer": "..."
    }
    
    Error Responses:
    - 400: Bad Request (invalid input)
    - 401: Unauthorized
    - 503: Service Unavailable
    """
    try:
        # Extract user info
        user_role = request.headers.get('X-User-Role', '').lower()
        user_id = request.headers.get('X-User-ID')
        
        # Parse request
        data = request.get_json()
        if not data:
            return _error_response('Invalid JSON', 400)
        
        # Extract fields
        message = data.get('message', '').strip()
        conversation_id = data.get('conversation_id', '').strip()
        
        # Override with request body if provided
        if data.get('user_role'):
            user_role = data.get('user_role', '').lower()
        if data.get('user_id'):
            user_id = data.get('user_id')
        
        # Validate
        if not user_role or user_role not in ['clinician', 'patient', 'admin']:
            return _error_response('Invalid user_role', 400)
        if not message:
            return _error_response('Missing message field', 400)
        if not conversation_id:
            return _error_response('Missing conversation_id field', 400)
        if not user_id:
            return _error_response('Missing user_id or X-User-ID header', 400)
        
        logger.info(f"Chat request | conversation={conversation_id} | role={user_role}")
        
        # Get or create chat session
        session = ChatSession.query.filter_by(conversation_id=conversation_id).first()
        
        if not session:
            session = ChatSession(
                conversation_id=conversation_id,
                user_id=user_id,
                user_role=user_role,
                started_at=datetime.utcnow()
            )
            db.session.add(session)
            db.session.commit()
        
        # Call chatbot
        chatbot_response = circuit_breaker.call(
            chatbot.respond,
            user_role, message, conversation_id, user_id
        )
        
        # Update session
        session.message_count += 1
        session.updated_at = datetime.utcnow()
        
        # Store message metadata (NOT full content)
        from ai_service import IntentClassifier  # Reuse for consistency
        intent = IntentClassifier.classify(message, user_role) if hasattr(IntentClassifier, 'classify') else 'general'
        
        chat_msg = ChatMessage(
            conversation_id=conversation_id,
            message_number=session.message_count,
            message_type='user_question',
            intent_category=intent,
            interaction_summary=f"User asked: {message[:100]}..."
        )
        db.session.add(chat_msg)
        db.session.commit()
        
        # Audit log
        _audit_log_action(
            user_id, 'chatbot_response', 'chatbot',
            result='success',
            metadata={
                'intent': intent,
                'user_role': user_role,
                'response_length': len(chatbot_response['reply'])
            }
        )
        
        # Return response
        response = {
            'success': True,
            'reply': chatbot_response['reply'],
            'suggested_actions': chatbot_response.get('suggested_actions', []),
            'disclaimer': chatbot_response.get('disclaimer', '')
        }
        
        return jsonify(response), 200
    
    except ChatbotError as e:
        logger.error(f"Chatbot error | error={str(e)}")
        return _error_response(str(e), 400)
    
    except Exception as e:
        logger.exception(f"Unexpected error in chat endpoint")
        return _error_response('Internal server error', 500)


# ============================================================================
# ENDPOINT 3: GET /api/ai/notes/{note_id} - Retrieve Interpretation
# ============================================================================

@ai_bp.route('/notes/<string:note_id>', methods=['GET'])
@require_auth_token
def get_note_interpretation(note_id):
    """
    Retrieve stored interpretation of a note.
    
    Query Params:
    - include_original: boolean, include original note text (default: false)
    
    Response (200 OK):
    {
        "success": true,
        "note_interpretation": {...}
    }
    
    Response (404 Not Found):
    {
        "success": false,
        "error": "Note interpretation not found"
    }
    """
    try:
        interpretation = NoteInterpretation.query.filter_by(
            note_id=note_id, is_deleted=False
        ).first()
        
        if not interpretation:
            return jsonify({
                'success': False,
                'error': 'Note interpretation not found'
            }), 404
        
        include_original = request.args.get('include_original', 'false').lower() == 'true'
        
        return jsonify({
            'success': True,
            'note_interpretation': interpretation.to_dict(include_original=include_original)
        }), 200
    
    except Exception as e:
        logger.exception("Error retrieving interpretation")
        return _error_response('Internal server error', 500)


# ============================================================================
# ENDPOINT 4: POST /api/ai/notes/{note_id}/approve - Clinician Approval
# ============================================================================

@ai_bp.route('/notes/<int:interpretation_id>/approve', methods=['POST'])
@require_auth_token
@require_role('clinician', 'admin')
def approve_note_interpretation(interpretation_id):
    """
    Clinician approves and optionally edits AI interpretation.
    
    Request Body:
    {
        "approved": true,
        "edits": {
            "formatted_note": "...",
            "clinical_summary": "...",
            "patient_friendly_summary": "..."
        }
    }
    
    Response (200 OK):
    {
        "success": true,
        "message": "Interpretation approved"
    }
    """
    try:
        doctor_id = request.headers.get('X-User-ID', 'unknown')
        data = request.get_json() or {}
        
        interpretation = NoteInterpretation.query.get(interpretation_id)
        
        if not interpretation:
            return jsonify({
                'success': False,
                'error': 'Interpretation not found'
            }), 404
        
        # Check authorization (doctor who created interpretation)
        if interpretation.doctor_id != doctor_id and doctor_id != 'admin':
            return jsonify({
                'success': False,
                'error': 'Not authorized to approve this interpretation'
            }), 403
        
        # Apply edits if provided
        edits = data.get('edits', {})
        if edits:
            if 'formatted_note' in edits:
                interpretation.formatted_note = edits['formatted_note']
            if 'clinical_summary' in edits:
                interpretation.clinical_summary = edits['clinical_summary']
            if 'patient_friendly_summary' in edits:
                interpretation.patient_friendly_summary = edits['patient_friendly_summary']
            
            interpretation.clinician_edited = True
            interpretation.clinician_edits_summary = f"Edited {len(edits)} fields at {datetime.utcnow()}"
        
        # Mark as approved
        approved = data.get('approved', True)
        if approved:
            interpretation.clinician_approved = True
            interpretation.clinician_approved_by = doctor_id
            interpretation.clinician_approved_at = datetime.utcnow()
        
        db.session.commit()
        
        # Audit log
        _audit_log_action(
            doctor_id, 'interpretation_approved', 'note_interpreter',
            result='success',
            metadata={
                'interpretation_id': interpretation_id,
                'edits_made': interpretation.clinician_edited
            }
        )
        
        return jsonify({
            'success': True,
            'message': 'Interpretation approved and saved',
            'interpretation': interpretation.to_dict(include_original=False)
        }), 200
    
    except Exception as e:
        logger.exception("Error approving interpretation")
        return _error_response('Internal server error', 500)


# ============================================================================
# ENDPOINT 5: GET /api/ai/health - Health Check
# ============================================================================

@ai_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for AI services.
    
    Response:
    {
        "status": "healthy" | "degraded" | "unhealthy",
        "timestamp": "ISO8601",
        "services": {
            "note_interpreter": "healthy",
            "chatbot": "healthy",
            "circuit_breaker": {...}
        }
    }
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'note_interpreter': 'healthy',
            'chatbot': 'healthy',
            'ai_provider': 'openai' if AIConfig.AI_FEATURES_ENABLED else 'disabled'
        },
        'circuit_breaker': circuit_breaker.get_status()
    }), 200


# ============================================================================
# Helper Functions
# ============================================================================

def _error_response(message: str, status_code: int) -> Tuple[Dict, int]:
    """Helper: return error response"""
    return jsonify({
        'success': False,
        'error': message
    }), status_code


def _audit_log_action(user_id: str, action: str, service: str,
                      result: str = 'unknown', metadata: Optional[Dict] = None):
    """Helper: log action for audit trail"""
    if not AIConfig.AUDIT_LOGGING_ENABLED:
        return
    
    try:
        audit_log = AIAuditLog(
            user_id_hash=SecurityUtils.hash_user_id(int(user_id)) if isinstance(user_id, (int, str)) and str(user_id).isdigit() else user_id,
            action=action,
            ai_service=service,
            result=result,
            context=metadata or {}
        )
        db.session.add(audit_log)
        db.session.commit()
    except Exception as e:
        logger.warning(f"Failed to log audit action | error={str(e)}")


# ============================================================================
# Error Handlers (Flask error handlers specific to AI routes)
# ============================================================================

@ai_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@ai_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.exception("Internal server error")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# Export blueprint
__all__ = ['ai_bp']
