# AfyaClick Backend

AfyaClick is a high-performance e-hospital backend system designed to streamline clinical workflows through advanced AI integration, robust data modeling, and strict medical compliance standards.

## 🚀 Key Features

### 🧠 AI-Powered Note Interpretation
*   **Structured Documentation:** Automatically transforms unstructured clinical notes into structured Markdown.
*   **Dual Summaries:** Generates concise technical summaries for clinicians and simplified "plain language" explanations for patients.
*   **Entity Extraction:** Uses heuristics/NLP to extract symptoms, diagnoses, medications, and vitals (SpO2, BP, HR).
*   **Clinician-in-the-loop:** Workflow for clinicians to review, edit, and approve AI-generated interpretations.

### 🤖 Role-Aware Guided Chatbot
*   **Contextual Assistance:** Tailored responses for Clinicians (documentation, scheduling) and Patients (FAQ, appointment booking).
*   **Intent Classification:** Categorizes queries to provide relevant system navigation and suggested actions.
*   **Safety First:** Integrated medical disclaimer management and redirection for clinical queries to prevent unauthorized medical advice.

### 🛡️ Security & Compliance
*   **PHI/PII Filtering:** Automatic de-identification of Protected Health Information (phones, SSNs, dates, MRNs) before sending data to external AI providers.
*   **Audit Logging:** Comprehensive logging of all AI operations, tracking who performed what action without storing sensitive PHI.
*   **Rate Limiting:** Per-user request throttling to prevent API abuse and manage costs.
*   **Circuit Breaker:** Resilience pattern to handle external AI service outages gracefully.

## 🛠 Tech Stack
*   **Framework:** Flask
*   **Database:** PostgreSQL with SQLAlchemy ORM
*   **Migrations:** Alembic (Flask-Migrate)
*   **AI Integration:** OpenAI (GPT-4 Turbo) & Anthropic (Claude 3) support
*   **Security:** JWT Authentication, SHA256 ID Hashing, PHI Regex Scrubbing

## 📂 Project Structure

*   `ai_service.py`: Core logic for note interpretation and PHI filtering.
*   `chatbot_service.py`: Workflow guidance engine and intent classification.
*   `ai_routes.py`: Flask Blueprint for AI-specific API endpoints.
*   `ai_models.py`: Database schema for AI sessions, interpretations, and audit logs.
*   `ai_config.py`: Centralized configuration, security decorators, and rate limiting logic.

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd AfyaClick/Backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    AI_PROVIDER=openai
    AI_API_KEY=your_api_key_here
    AI_MODEL_VERSION=gpt-4-turbo-2024-04
    AI_API_TIMEOUT=15
    MAX_REQUESTS_PER_HOUR=10
    ```

5.  **Run Migrations:**
    ```bash
    flask db upgrade
    ```

## 🛣 API Endpoints (AI Module)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/notes` | Interpret & summarize a clinical note | Clinician/Admin |
| `POST` | `/api/ai/chat` | Get guided chatbot assistance | Authenticated Users |
| `GET` | `/api/ai/notes/<id>` | Retrieve stored interpretation | Authenticated Users |
| `POST` | `/api/ai/notes/<id>/approve` | Approve/Edit AI interpretation | Clinician/Admin |
| `GET` | `/api/ai/health` | Check status of AI services | Public |

## 🔒 Security Best Practices

*   **De-identification:** All clinical notes are scrubbed of PII/PHI in the `PHIFilter` class before hitting external APIs.
*   **Authentication:** All sensitive routes are protected by the `@require_auth_token` and `@require_role` decorators.
*   **Circuit Breaker:** The `CircuitBreaker` pattern prevents the application from hanging if OpenAI or Anthropic services experience latency or downtime.

## 📝 Development Utilities

*   `update_passwords.py`: A utility script to initialize default passwords for existing patient and doctor records.
    ```bash
    python update_passwords.py
    ```

---
© 2024 AfyaClick E-Hospital System.
