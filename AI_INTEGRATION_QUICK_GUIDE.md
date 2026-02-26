# Afyaclick AI Integration Guide

**Complete Implementation & Deployment Guide**  
**Version:** 1.0  
**Date:** February 26, 2026

---

## Quick Start for Integration

### 1. Backend Integration (*30 minutes*)

#### 1A. Update `app.py` to include AI routes

Add these imports and configuration at the top of your Flask app:

```python
# app.py - ADD THESE IMPORTS

from ai_routes import ai_bp
from ai_config import AIConfig, setup_audit_logging
from ai_models import db

# ... existing imports and app setup ...

# Initialize AI configuration
AIConfig.validate()
setup_audit_logging()

# Register AI Blueprint AFTER CORS and other middleware
app.register_blueprint(ai_bp)

logger = logging.getLogger(__name__)
logger.info(f"Afyaclick AI Features loaded | config: {AIConfig.to_dict()}")
```

#### 1B. Update database models (`models.py`)

Add this import to use AI models:

```python
# In your models.py or in a separate place where you initialize db

from ai_models import NoteInterpretation, ChatSession, ChatMessage, AIAuditLog
```

Or, if you prefer to keep models separate, just ensure the `ai_models.py` file is in the same directory.

#### 1C. Create database migration

```bash
cd Backend

# Create migration for new AI tables
flask db migrate -m "Add AI feature tables (notes, chat, audit)"

# Review migration file in migrations/versions/
# Ensure it includes: NoteInterpretation, ChatSession, ChatMessage, AIAuditLog

# Apply migration
flask db upgrade
```

#### 1D. Set environment variables

Create a `.env` file in the Backend directory:

```bash
# Backend/.env

# AI Provider Configuration
AI_PROVIDER=openai                    # or "anthropic"
AI_API_KEY=sk-...                     # Your OpenAI API key
AI_MODEL_VERSION=gpt-4-turbo-2024-04  # Model to use
AI_API_TIMEOUT=15                     # Seconds (5-60)

# Rate Limiting
MAX_REQUESTS_PER_HOUR=10              # Per clinician

# Features
AUDIT_LOGGING_ENABLED=true
AI_FEATURES_ENABLED=true

# Database
DATABASE_URL=sqlite:///Afyyaclick.db  # Or your production DB
SQLALCHEMY_TRACK_MODIFICATIONS=false

# Security
SECRET_KEY=your-secret-key-here
DEBUG=false
FLASK_ENV=production
```

Then load these in your Flask app:

```python
# In app.py, after Flask() initialization
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

app.config.from_mapping(
    SECRET_KEY=os.getenv('SECRET_KEY', 'dev-key'),
    # ... other config
)
```

#### 1E. Install dependencies

```bash
# Backend/requirements.txt - ADD THESE LINES

# AI/LLM
openai>=0.27.0          # For OpenAI API
anthropic>=0.3.0        # For Anthropic Claude (optional)

# Security & encryption
cryptography>=40.0.0    # For encryption at rest

# Additional utilities (already likely present)
python-dotenv>=0.19.0
requests>=2.28.0
```

Then install:

```bash
pip install -r requirements.txt
```

---

### 2. Frontend Integration (*20 minutes*)

#### 2A. Add components to your React app

The two new components are ready to use:

- **`NoteAISummaryPanel.jsx`** — For clinicians to summarize notes
- **`AfyaclickAssistantWidget.jsx`** — Floating chatbot widget

#### 2B. Import and use in your pages

**For Clinician's Medical Records / Add Note page:**

```jsx
// MedicalRecords.jsx or AddRecord.jsx
import NoteAISummaryPanel from './components/NoteAISummaryPanel';

function AddRecordPage() {
  const [rawNote, setRawNote] = useState('');
  const [noteId] = useState(`NOTE-${Date.now()}`);
  const [patientId] = useState(/* from route params or context */);
  const [doctorId] = useState(/* from auth context */);
  
  return (
    <div>
      <textarea
        value={rawNote}
        onChange={(e) => setRawNote(e.target.value)}
        placeholder="Type your clinical note here..."
        rows={8}
      />
      
      {/* AI Summary Tool */}
      <NoteAISummaryPanel
        rawNote={rawNote}
        noteId={noteId}
        patientId={patientId}
        doctorId={doctorId}
        onApproved={(interpretation) => {
          console.log('Note approved:', interpretation);
          // Save to patient's record
        }}
      />
    </div>
  );
}
```

**For the Chatbot widget (add to App or Dashboard):**

```jsx
// App.jsx or Dashboard.jsx
import AfyaclickAssistantWidget from './components/AfyaclickAssistantWidget';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  return (
    <div>
      {/* ... existing content ... */}
      
      {/* Add the floating chatbot widget */}
      <AfyaclickAssistantWidget 
        userRole={currentUser?.role || 'patient'}
        userId={currentUser?.id}
      />
    </div>
  );
}
```

#### 2C. Update API service (if needed)

If you're using a custom `api.jsx` service, ensure it includes the AI endpoints:

```javascript
// Frontend/src/services/api.jsx - ADD THESE

export const api = {
  // ... existing methods ...
  
  // AI Note Interpretation
  async interpretNote(noteId, rawText, patientId, doctorId) {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/ai/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-ID': doctorId,
        'X-User-Role': 'clinician'
      },
      body: JSON.stringify({
        note_id: noteId,
        raw_note_text: rawText,
        patient_id: patientId,
        doctor_id: doctorId
      })
    });
    return response.json();
  },
  
  // AI Chatbot
  async chat(userRole, userId, message, conversationId) {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-ID': userId,
        'X-User-Role': userRole
      },
      body: JSON.stringify({
        user_role: userRole,
        user_id: userId,
        message,
        conversation_id: conversationId
      })
    });
    return response.json();
  }
};
```

---

## Security & Privacy Implementation

### De-Identification Before AI

The system automatically de-identifies notes before sending to external AI:

```
BEFORE (raw note):
"Patient John Doe (DOB 5/15/1990) with SSN 123-45-6789 called about severe chest pain..."

AFTER (sent to AI):
"Patient [NAME] (DOB [DATE]) with SSN [SSN] called about severe chest pain..."
```

**What gets de-identified:**
- Names → `[NAME]`
- Dates of birth → `[DATE]`
- Phone numbers → `[PHONE]`
- Social Security Numbers → `[SSN]`
- Email addresses → `[EMAIL]`
- Medical Record Numbers → `[ID]`

### Authentication & Authorization

All AI endpoints require:

1. **JWT Bearer Token** in `Authorization` header:
   ```
   Authorization: Bearer <jwt_token>
   ```

2. **Role Check** via `X-User-Role` header:
   - `/api/ai/notes` requires `clinician` or `admin`
   - `/api/ai/chat` works for `patient`, `clinician`, or `admin`

3. **Rate Limiting**: 10 requests per hour per user

### Audit Logging

Every AI operation is logged with:
- **User ID Hash** (not actual ID)
- **Action** (note_interpreted, chat_responded, etc.)
- **Service** (note_interpreter, chatbot)
- **Timestamp**
- **Result** (success, error, timeout)
- **Metadata** (response length, processing time)

**What is NOT logged:**
- Full patient names
- Medical record numbers
- Actual note content
- Full API responses

### Data Retention

| Data | Retention | Purpose |
|------|-----------|---------|
| NoteInterpretation | Indefinite | Patient records |
| ChatSession metadata | 90 days | Compliance |
| ChatMessage summaries | 30 days | Audit trail |
| Audit logs | 1 year | Compliance tracking |
| Raw AI prompts | Never | Never stored |

---

## Testing Strategy

### Unit Tests

```bash
# Backend/tests/test_ai_service.py

pytest tests/test_ai_service.py -v
```

Key tests:
- ✅ Input validation (min/max length)
- ✅ De-identification removes PII
- ✅ Rate limiting works
- ✅ Error handling for AI timeout
- ✅ Entity extraction accuracy

### Integration Tests

```bash
# Backend/tests/test_ai_routes.py

pytest tests/test_ai_routes.py -v
```

Key tests:
- ✅ POST /api/ai/notes requires auth
- ✅ Returns proper JSON structure
- ✅ Stores interpretation in DB
- ✅ Clinician can approve
- ✅ No regressions in existing endpoints

### Manual Testing Checklist

**Test Note Interpretation:**
- [ ] Clinician opens AddRecord page
- [ ] Writes a note and clicks "Generate AI Summary"
- [ ] See loading spinner
- [ ] Get 3 summaries (formatted, clinical, patient-friendly)
- [ ] Can edit each summary
- [ ] Can approve and save
- [ ] Check database has NoteInterpretation record

**Test Chatbot - Clinician:**
- [ ] Click chatbot button (bottom right)
- [ ] Ask "How do I add a note?"
- [ ] Get workflow guidance
- [ ] See "Go to Patient Records" button
- [ ] Click button → navigates to /patient-records
- [ ] Ask medical question → gets disclaimer

**Test Chatbot - Patient:**
- [ ] Log in as patient
- [ ] Click chatbot
- [ ] Ask "Book appointment"
- [ ] Get booking instructions
- [ ] Ask "Do I have COVID?"
- [ ] Get "I can't diagnose" response + medical disclaimer

**Test Error Handling:**
- [ ] Unplug internet → "AI service unavailable"
- [ ] Send 11 notes in 1 hour → "Rate limit exceeded"
- [ ] Send malformed JSON → "Invalid input"

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit + integration)
- [ ] Code reviewed by security team
- [ ] No hardcoded API keys or secrets
- [ ] Environment variables defined
- [ ] Database migration tested in staging
- [ ] SSL/TLS certificate configured
- [ ] CORS origins whitelist updated
- [ ] Monitoring/alerting configured

### Environment Configuration

```bash
# Production .env
AI_PROVIDER=openai
AI_API_KEY=<PRODUCTION_KEY>  # From AWS Secrets Manager / HashiCorp Vault
AI_MODEL_VERSION=gpt-4-turbo-2024-04
DEBUG=false
FLASK_ENV=production
SECRET_KEY=<LONG_RANDOM_STRING>
DATABASE_URL=<PRODUCTION_DB_URL>
AUDIT_LOGGING_ENABLED=true
```

### Database Deployment

```bash
# On production server
flask db upgrade

# Verify new tables exist
flask shell
>>> from ai_models import NoteInterpretation, ChatSession
>>> NoteInterpretation.query.count()  # Should return 0 (new table)
```

### Frontend Deployment

```bash
# Frontend build (Vite)
cd Frontend
npm run build

# Deploys to 'dist/' folder
# Configure your CI/CD (GitHub Actions, GitLab CI, etc.) to deploy

# Verify AI components are included
grep -r "NoteAISummaryPanel\|AfyaclickAssistantWidget" dist/
```

### Monitoring & Alerts

**Health Check Endpoint:**
```bash
curl https://api.afyaclick.com/api/ai/health
# Should return 200 with status "healthy"
```

**Alert Thresholds:**
- [ ] AI API error rate > 5% → Page on-call
- [ ] AI response time > 20s → Alert
- [ ] Rate limit hits > 100/hour → Alert
- [ ] Circuit breaker OPEN → Critical alert

### Rollback Plan

If issues occur:

```bash
# 1. Disable AI features
# In .env: AI_FEATURES_ENABLED=false

# 2. Users still have access to app, shows "AI unavailable"

# 3. Rollback database migration (if schema issue)
flask db downgrade

# 4. Revert code to previous version
git revert <commit_hash>

# 5. Redeploy
```

---

## Production Monitoring

### Logging

Check AI operation logs:

```bash
# Audit logs (metadata only)
tail -f logs/ai_audit.log

# Example:
# 2026-02-26 14:32:15 | action=note_interpretation_completed | doctor=DOC-001 | patient_hash=a1b2c3d4 | timestamp=2026-02-26T14:32:15 | metadata={'model': 'gpt-4-turbo-2024-04', 'response_length': 500}
```

### Metrics to Track

1. **AI Service Usage:**
   - Requests per hour
   - Average response time
   - Error rate

2. **Rate Limiting:**
   - Unique users hitting limits
   - Peak usage times
   - Patterns

3. **Clinical Usage:**
   - Notes interpreted per day
   - Approval rate (% approved)
   - Average edits per interpretation
   - Chatbot messages per user

4. **Cost:**
   - API calls to OpenAI/Anthropic
   - Estimated monthly cost

### Sample Dashboard Query (Prometheus/Grafana)

```prometheus
# AI requests per minute
rate(ai_requests_total[1m])

# Average response time
histogram_quantile(0.95, rate(ai_response_time_seconds_bucket[5m]))

# Errors per minute
rate(ai_errors_total[1m])
```

---

## Troubleshooting

### "AI features not available"

**Cause:** `AI_API_KEY` not set or empty  
**Fix:** Set `AI_API_KEY` environment variable

```bash
export AI_API_KEY=sk-your-actual-key
```

### "Rate limit exceeded"

**Cause:** User made >10 requests in 1 hour  
**Fix:** Wait for reset or increase `MAX_REQUESTS_PER_HOUR` in config

### "Circuit breaker is OPEN"

**Cause:** AI service failed 5+ times  
**Fix:** Wait 5 minutes for automatic recovery or restart app

### "Invalid input: Note too short"

**Cause:** Note < 20 characters  
**Fix:** User should write a more substantive note

### Database migration fails

**Cause:** Conflict with existing tables  
**Fix:**
```bash
# Check current migration state
flask db current

# If stuck, manually resolve conflict in migration file
# Then retry
flask db upgrade
```

---

## FAQ

**Q: Does AI store patient data?**  
A: No. De-identified content is only sent to AI, and interpretations are stored locally in your database, not with AI providers.

**Q: Can patients see AI interpretations?**  
A: Only if the clinician explicitly saves the patient-friendly summary as part of the record. AI outputs are separate until approved.

**Q: What if AI halluccinates incorrect information?**  
A: The UI prominently warns "AI-generated content — requires clinical verification." Clinicians must review and edit before approval.

**Q: Can I disable AI for certain users?**  
A: Yes, through role-based access control. Modify `@require_role` decorator on routes.

**Q: Can I use a different AI provider?**  
A: Yes. Update `AI_PROVIDER` env var and implement the `_call_<provider>` method in `ai_service.py`.

**Q: What about HIPAA compliance?**  
A: 
- ✅ De-identification before sending to AI
- ✅ Data Processing Agreement with AI vendor
- ✅ Audit logging of all operations
- ✅ Encryption in transit (TLS)
- ✅ No PHI stored in logs
- ⚠️ Check with your legal/compliance team before production

---

## Next Steps

1. **Review & Approval:**
   - [ ] Security team reviews code
   - [ ] Compliance team approves approach
   - [ ] Clinical team tests with sample data

2. **Implementation:**
   - [ ] Integrate backend code into `app.py`
   - [ ] Run database migration
   - [ ] Integrate frontend components
   - [ ] Configure environment variables

3. **Testing:**
   - [ ] Run unit tests
   - [ ] Manual testing checklist
   - [ ] Load testing (50+ concurrent users)
   - [ ] Security testing (penetration test optional)

4. **Deployment:**
   - [ ] Deploy to staging first
   - [ ] UAT with selected clinicians (1-2 weeks)
   - [ ] Deploy to production
   - [ ] Monitor for issues (24-48 hours)

5. **Post-Launch:**
   - [ ] Gather user feedback
   - [ ] Monitor costs and usage
   - [ ] Optimize prompts based on feedback
   - [ ] Plan v2 improvements

---

## Support & Escalation

**For issues with AI features:**
1. Check logs: `tail -f logs/ai_audit.log`
2. Test health endpoint: `/api/ai/health`
3. Check rate limit status
4. Review `ChatSession` and `NoteInterpretation` tables for patterns

Contact: [Your AI Engineering Team]

---

**Document Version:** 1.0  
**Last Updated:** February 26, 2026  
**Status:** Ready for Implementation
