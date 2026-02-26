# Afyaclick AI Features - Dependencies & Requirements

## Backend Requirements

Update your `Backend/requirements.txt` with:

```
# Core Flask & Database
Flask==2.3.0
Flask-SQLAlchemy==3.0.0
Flask-Migrate==4.0.0
Flask-CORS==4.0.0
Flask-Bcrypt==1.0.1
SQLAlchemy==2.0.0
SQLAlchemy-Serializer==1.4.1

# AI & LLM Integration
openai>=0.27.0                  # For OpenAI API (GPT-4, GPT-4-turbo)
anthropic>=0.3.0                # For Anthropic Claude (optional, if using)
requests>=2.28.0                # HTTP client for API calls

# Security & Encryption
cryptography>=40.0.0            # For encryption at rest
python-jose>=3.3.0              # JWT handling (if needed)
PyJWT>=2.6.0                    # JWT tokens

# Utilities
python-dotenv>=0.19.0           # Load environment variables
python-dateutil>=2.8.0          # Date/time utilities
Werkzeug>=2.3.0                 # WSGI utilities

# Logging & Monitoring
python-json-logger>=2.0.0       # Structured JSON logging (optional)

# Testing (for test suite)
pytest>=7.0.0
pytest-cov>=4.0.0
pytest-flask>=1.2.0
Faker>=18.0.0                   # Generate test data

# Production Server
gunicorn>=20.1.0                # Production WSGI server
python-dotenv>=0.19.0

# Optional: Database drivers
psycopg2-binary>=2.9.0          # For PostgreSQL (production)
# SQLite is built-in, for development
```

## Frontend Requirements

Update your `Frontend/package.json` dependencies:

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "@tailwindcss/vite": "^4.1.17",
    "lucide-react": "^0.544.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7",
    "@eslint/js": "^9.36.0",
    "eslint": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.22",
    "tailwindcss": "^4.1.17",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.22"
  }
}
```

## Installation Instructions

### Backend

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Verify AI dependencies
python -c "import openai; print(f'OpenAI version: {openai.__version__}')"
```

### Frontend

```bash
cd Frontend

# Install Node.js dependencies
npm install

# Verify components are available
npm run lint  # Should not show import errors for AI components
```

## Environment Setup

### Backend `.env` File

```bash
# Backend/.env (DO NOT commit to git)

# ===== AI CONFIGURATION =====
AI_PROVIDER=openai                    # or "anthropic"
AI_API_KEY=sk-...                     # Your OpenAI API key (from https://platform.openai.com/api-keys)
AI_MODEL_VERSION=gpt-4-turbo-2024-04  # Model version
AI_API_TIMEOUT=15                     # Timeout in seconds (5-60)

# ===== RATE LIMITING =====
MAX_REQUESTS_PER_HOUR=10              # Per user per hour

# ===== FEATURES =====
AI_FEATURES_ENABLED=true              # Toggle AI features on/off
AUDIT_LOGGING_ENABLED=true            # Enable audit logging

# ===== DATABASE =====
DATABASE_URL=sqlite:///Afyyaclick.db  # Development
# For production, use PostgreSQL:
# DATABASE_URL=postgresql://user:pass@host/dbname
SQLALCHEMY_TRACK_MODIFICATIONS=false

# ===== SECURITY =====
SECRET_KEY=dev-secret-key-change-in-production
FLASK_ENV=development  # Change to "production" for deployment
DEBUG=false

# ===== LOGGING =====
LOG_LEVEL=INFO
```

### Add to `.gitignore`

```gitignore
# Environment
.env
.env.local
.env.*.local

# AI/Dependencies
venv/
node_modules/
__pycache__/

# Logs
logs/
*.log

# Build outputs
dist/
build/
*.egg-info/
```

## Verification Checklist

### Backend Setup ✓

```bash
cd Backend

# 1. Check imports work
python -c "
import ai_service
import chatbot_service
import ai_models
import ai_config
print('✓ All AI modules import successfully')
"

# 2. Verify AI config
python -c "
from ai_config import AIConfig
AIConfig.validate()
print('✓ AI configuration valid')
"

# 3. Check Flask app loads with AI routes
python -c "
from app import app
from ai_routes import ai_bp
if ai_bp in [rule.blueprint for rule in app.url_map.iter_rules()]:
    print('✓ AI Blueprint registered')
"
```

### Frontend Setup ✓

```bash
cd Frontend

# 1. Verify components exist
ls -la src/components/NoteAISummaryPanel.jsx
ls -la src/components/AfyaclickAssistantWidget.jsx
# Both should exist

# 2. Check imports work (no linting errors)
npm run lint
# Should not show import errors for AI components

# 3. Build test
npm run build
# Should complete without errors
```

## Database Migration

```bash
cd Backend

# Create migration for AI tables
flask db migrate -m "Add AI feature tables"

# Review the migration
# migrations/versions/xxxx_add_ai_feature_tables.py

# Apply migration
flask db upgrade

# Verify tables exist
python -c "
from app import app
from ai_models import db, NoteInterpretation, ChatSession
with app.app_context():
    tables = db.metadata.tables
    required = {'note_interpretations', 'chat_sessions', 'chat_messages', 'ai_audit_logs'}
    existing = set(tables.keys())
    if required.issubset(existing):
        print('✓ All AI tables created successfully')
    else:
        print('✗ Missing tables:', required - existing)
"
```

## Cost Estimation

### OpenAI API Costs

```
GPT-4-turbo:
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens

Typical usage:
- Note interpretation: 300-500 input tokens + 400-800 output = ~$0.025 per request
- Chatbot response: 100-200 input tokens + 200-400 output = ~$0.008 per request

If 100 clinicians × 5 interpretations/day:
  500 interpretations/day × $0.025 = $12.50/day ≈ $375/month (notes only)

If 1000 patients × 2 chatbot messages/day:
  2000 chats/day × $0.008 = $16/day ≈ $480/month (chats only)

Total estimate: **$800-1200/month** (with heavy usage)
```

Consider:
- Set up API key with spending limits on OpenAI Dashboard
- Monitor usage weekly
- Optimize prompts to reduce token usage
- Cache common responses

---

## Production Deployment Packages

For production deployment, you may also need:

```
# Background jobs (optional)
celery>=5.2.0
redis>=4.5.0

# API Documentation
flask-restx>=0.5.1
flasgger>=0.9.7.1

# Performance
flask-caching>=2.0.0

# Monitoring (optional)
sentry-sdk>=1.20.0

# Database connection pooling
SQLAlchemy[postgresql_psycopg2binary]>=2.0
```

---

## Quick Start Command Summary

```bash
# Backend setup
cd Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "AI_PROVIDER=openai" > .env
echo "AI_API_KEY=sk-your-key" >> .env
flask db upgrade
python app.py

# Frontend setup
cd Frontend
npm install
npm run dev
```

Then:
- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`
- Visit `http://localhost:5173` in browser

---

**Last Updated:** February 26, 2026
