"""
ai_config.py - Configuration & Security Utilities for AI Features

Environment configuration, rate limiting, and security utilities.

Configuration (from environment variables):
- AI_PROVIDER: "openai" or "anthropic"
- AI_API_KEY: API key for external AI provider
- AI_MODEL_VERSION: Model version (e.g., "gpt-4-turbo-2024-04")
- AI_API_TIMEOUT: Timeout in seconds (default: 15)
- MAX_REQUESTS_PER_HOUR: Rate limit per user (default: 10)
- AUDIT_LOGGING_ENABLED: Whether to enable audit logging (default: true)
"""

import os
import hashlib
import logging
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Tuple, Optional
from flask import request, jsonify

logger = logging.getLogger(__name__)


class AIConfig:
    """Configuration for AI features"""
    
    
    # AI Provider Settings
    AI_PROVIDER = os.getenv('AI_PROVIDER', 'openai')
    AI_API_KEY = os.getenv('AI_API_KEY', '')
    AI_MODEL_VERSION = os.getenv('AI_MODEL_VERSION', 'gpt-4-turbo-2024-04')
    AI_API_TIMEOUT = int(os.getenv('AI_API_TIMEOUT', '15'))
    
    # Rate Limiting
    MAX_REQUESTS_PER_HOUR = int(os.getenv('MAX_REQUESTS_PER_HOUR', '10'))
    RATE_LIMIT_WINDOW_SECONDS = 3600
    
    # Input Constraints
    MIN_NOTE_LENGTH = 20  # minimum characters
    MAX_NOTE_LENGTH = 5000  # maximum characters
    MIN_MESSAGE_LENGTH = 3  # minimum characters for chat
    MAX_MESSAGE_LENGTH = 1000  # maximum characters for chat
    
    # Features
    AUDIT_LOGGING_ENABLED = os.getenv('AUDIT_LOGGING_ENABLED', 'true').lower() == 'true'
    AI_FEATURES_ENABLED = bool(AI_API_KEY)
    
    # Security
    REQUIRE_AUTHENTICATION = True
    REQUIRE_ROLE_CHECK = True
    ENCRYPT_STORED_INTERPRETATIONS = True
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    @classmethod
    def validate(cls):
        """Validate configuration on startup"""
        errors = []
        
        if not cls.AI_API_KEY:
            logger.warning("AI_API_KEY not set. AI features will be disabled.")
        
        if cls.AI_PROVIDER not in ['openai', 'anthropic']:
            errors.append(f"Invalid AI_PROVIDER: {cls.AI_PROVIDER}")
        
        if cls.AI_API_TIMEOUT < 5 or cls.AI_API_TIMEOUT > 60:
            errors.append(f"AI_API_TIMEOUT must be between 5 and 60 seconds")
        
        if errors:
            for error in errors:
                logger.error(f"Config error: {error}")
            raise ValueError(f"Configuration errors: {', '.join(errors)}")
        
        logger.info(
            f"AI Configuration validated | "
            f"provider={cls.AI_PROVIDER} | "
            f"model={cls.AI_MODEL_VERSION} | "
            f"enabled={cls.AI_FEATURES_ENABLED}"
        )
    
    @classmethod
    def to_dict(cls):
        """Export non-sensitive config for logging"""
        return {
            'ai_provider': cls.AI_PROVIDER,
            'model_version': cls.AI_MODEL_VERSION,
            'is_enabled': cls.AI_FEATURES_ENABLED,
            'rate_limit': cls.MAX_REQUESTS_PER_HOUR,
            'timeout': cls.AI_API_TIMEOUT,
            'audit_logging': cls.AUDIT_LOGGING_ENABLED
        }


class SecurityUtils:
    """Security utilities: authentication, encryption, de-identification"""
    
    @staticmethod
    def hash_user_id(user_id: int) -> str:
        """
        Hash user ID for audit logs.
        
        One-way hash allows correlation without storing actual IDs.
        SHA256 (first 8 chars) sufficient for audit purposes.
        
        Args:
            user_id: Numeric user ID
        
        Returns:
            First 8 chars of hex SHA256 hash
        """
        hash_obj = hashlib.sha256(str(user_id).encode())
        return hash_obj.hexdigest()[:8]
    
    @staticmethod
    def hash_note_id(note_id: str) -> str:
        """Hash note ID for audit logs"""
        hash_obj = hashlib.sha256(note_id.encode())
        return hash_obj.hexdigest()[:8]
    
    @staticmethod
    def encrypt_text(text: str, key: Optional[str] = None) -> str:
        """
        Encrypt sensitive text at rest.
        
        In production:
        - Use proper encryption library (cryptography.fernet)
        - Store key securely (AWS KMS, HashiCorp Vault)
        - Implement key rotation
        
        For now: placeholder that indicates where encryption should happen
        
        Args:
            text: Plaintext to encrypt
            key: Encryption key (uses env var if not provided)
        
        Returns:
            Encrypted text
        """
        # STUB: In production, use:
        # from cryptography.fernet import Fernet
        # cipher = Fernet(key)
        # return cipher.encrypt(text.encode()).decode()
        
        logger.warning("Text encryption not implemented (stub)")
        return text
    
    @staticmethod
    def decrypt_text(encrypted_text: str, key: Optional[str] = None) -> str:
        """
        Decrypt text at rest.
        
        STUB: In production, use cryptography library
        """
        logger.warning("Text decryption not implemented (stub)")
        return encrypted_text


class RateLimiter:
    """
    In-memory rate limiter for AI requests.
    
    Production recommendation:
    - Use Redis for distributed rate limiting across multiple servers
    - Implement sliding window algorithm
    - Add global rate limits (per service, per hour)
    
    Current implementation:
    - Per-user limits (10 requests/hour per clinician)
    - In-memory storage (works for single-server deployments)
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
    
    def is_allowed(self, user_id: str) -> Tuple[bool, int]:
        """
        Check if user is within rate limit.
        
        Args:
            user_id: Unique identifier (doctor_id, patient_id)
        
        Returns:
            Tuple: (is_allowed: bool, remaining_requests: int)
        """
        now = datetime.utcnow().timestamp()
        window_start = now - self.window_seconds
        
        # Initialize user if needed
        if user_id not in self.requests:
            self.requests[user_id] = []
        
        # Remove old requests outside window
        self.requests[user_id] = [
            ts for ts in self.requests[user_id] if ts > window_start
        ]
        
        # Count current requests
        current_count = len(self.requests[user_id])
        remaining = self.user_limit - current_count
        
        if current_count < self.user_limit:
            # Under limit, record this request
            self.requests[user_id].append(now)
            return True, remaining - 1
        
        # Over limit
        return False, 0
    
    def get_reset_time(self, user_id: str) -> Optional[datetime]:
        """Get when rate limit will reset for user"""
        if user_id not in self.requests or not self.requests[user_id]:
            return None
        
        oldest_request = min(self.requests[user_id])
        reset_time = datetime.utcfromtimestamp(oldest_request + self.window_seconds)
        return reset_time


class CircuitBreaker:
    """
    Circuit breaker pattern for AI service calls.
    
    Prevents cascading failures if AI service is down.
    
    States:
    - CLOSED: Normal operation, calls go through
    - OPEN: Too many failures, requests fail fast
    - HALF_OPEN: Testing if service recovered
    
    Transition:
    CLOSED → OPEN: After 5 failures
    OPEN → HALF_OPEN: After timeout (5 minutes)
    HALF_OPEN → CLOSED: If test call succeeds
    HALF_OPEN → OPEN: If test call fails
    """
    
    CLOSED = 'CLOSED'
    OPEN = 'OPEN'
    HALF_OPEN = 'HALF_OPEN'
    
    def __init__(self, failure_threshold: int = 5, timeout_seconds: int = 300):
        """
        Initialize circuit breaker.
        
        Args:
            failure_threshold: Failures before opening circuit
            timeout_seconds: Time before attempting recovery
        """
        self.failure_threshold = failure_threshold
        self.timeout_seconds = timeout_seconds
        
        self.state = self.CLOSED
        self.failure_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.success_count = 0
    
    def call(self, func, *args, **kwargs):
        """
        Execute function through circuit breaker.
        
        Args:
            func: Function to call
            *args, **kwargs: Arguments for function
        
        Returns:
            Function result
        
        Raises:
            Exception: Original exception if circuit fails
            RuntimeError: If circuit is OPEN
        """
        if self.state == self.OPEN:
            if self._should_attempt_reset():
                self.state = self.HALF_OPEN
                self.success_count = 0
            else:
                raise RuntimeError(
                    f"Circuit breaker is OPEN. AI service unavailable. "
                    f"Try again in {self._seconds_until_retry()}s"
                )
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    def _on_success(self):
        """Handle successful call"""
        self.failure_count = 0
        if self.state == self.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= 2:  # 2 successes = full recovery
                self.state = self.CLOSED
                logger.info("Circuit breaker CLOSED (service recovered)")
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()
        
        if self.failure_count >= self.failure_threshold and self.state != self.OPEN:
            self.state = self.OPEN
            logger.warning(
                f"Circuit breaker OPEN (failures: {self.failure_count}). "
                f"AI service calls will fail fast for {self.timeout_seconds}s"
            )
        
        if self.state == self.HALF_OPEN:
            self.state = self.OPEN  # Recovery failed
            logger.warning("Circuit breaker OPEN (recovery failed)")
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time passed to attempt recovery"""
        if not self.last_failure_time:
            return True
        elapsed = (datetime.utcnow() - self.last_failure_time).total_seconds()
        return elapsed >= self.timeout_seconds
    
    def _seconds_until_retry(self) -> int:
        """Seconds until circuit can retry"""
        if not self.last_failure_time:
            return 0
        elapsed = (datetime.utcnow() - self.last_failure_time).total_seconds()
        return max(0, int(self.timeout_seconds - elapsed))
    
    def get_status(self) -> Dict:
        """Get circuit breaker status"""
        return {
            'state': self.state,
            'failure_count': self.failure_count,
            'seconds_until_retry': self._seconds_until_retry()
        }


# Flask decorators for API endpoints

def require_ai_enabled(f):
    """Decorator: Check if AI features are enabled"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not AIConfig.AI_FEATURES_ENABLED:
            return jsonify({
                'error': 'AI features not available',
                'message': 'AI services are not configured. Please configure AI_API_KEY.'
            }), 503
        return f(*args, **kwargs)
    return decorated_function


def require_auth_token(f):
    """Decorator: Verify JWT auth token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'error': 'Missing or invalid auth token'
            }), 401
        
        # In production: validate JWT token
        # token = auth_header.split(' ')[1]
        # user = validate_jwt_token(token)
        # if not user:
        #     return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function


def require_role(*allowed_roles):
    """Decorator: Check if user has required role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_role = request.headers.get('X-User-Role')
            
            if not user_role or user_role not in allowed_roles:
                return jsonify({
                    'error': f'Requires role: {", ".join(allowed_roles)}'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def rate_limit_check(rate_limiter: RateLimiter, user_id_header: str = 'X-User-ID'):
    """Decorator: Check rate limit"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = request.headers.get(user_id_header)
            
            if not user_id:
                return jsonify({
                    'error': f'Missing {user_id_header} header'
                }), 400
            
            allowed, remaining = rate_limiter.is_allowed(user_id)
            
            if not allowed:
                reset_time = rate_limiter.get_reset_time(user_id)
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Max {rate_limiter.user_limit} requests per hour',
                    'reset_at': reset_time.isoformat() if reset_time else None
                }), 429
            
            # Add remaining to response headers
            response = make_response(f(*args, **kwargs))
            response.headers['X-RateLimit-Remaining'] = str(remaining)
            return response
        
        return decorated_function
    return decorator


# Logging configuration

def setup_audit_logging():
    """Setup audit logging for AI operations"""
    if not AIConfig.AUDIT_LOGGING_ENABLED:
        return
    
    audit_logger = logging.getLogger('audit')
    audit_logger.setLevel(logging.INFO)
    
    # File handler for audit logs
    audit_handler = logging.FileHandler('logs/ai_audit.log')
    audit_handler.setFormatter(
        logging.Formatter('%(asctime)s | %(message)s')
    )
    audit_logger.addHandler(audit_handler)
    
    logger.info("Audit logging configured")


# Export commonly used items
__all__ = [
    'AIConfig',
    'SecurityUtils',
    'RateLimiter',
    'CircuitBreaker',
    'require_ai_enabled',
    'require_auth_token',
    'require_role',
    'rate_limit_check',
    'setup_audit_logging'
]
