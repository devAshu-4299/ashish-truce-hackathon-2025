# ConsentLens Backend

## Overview
The ConsentLens backend is built with FastAPI and provides a robust API for privacy policy analysis, consent management, and AI-powered summaries. It uses Supabase for data storage and OpenAI's GPT-4 for AI analysis.

## Table of Contents
1. [Setup](#setup)
2. [Project Structure](#project-structure)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Authentication](#authentication)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Setup

### Prerequisites
- Python 3.9+
- Supabase account
- OpenAI API key

### Installation
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Start development server
uvicorn app.main:app --reload
```

### Environment Variables
```env
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

## Project Structure
```
backend/
├── app/
│   ├── core/
│   │   ├── config.py      # Configuration settings
│   │   └── auth.py        # Authentication utilities
│   ├── routers/
│   │   └── ai_summaries.py # API routes
│   ├── schemas/
│   │   └── ai_summary.py   # Data models
│   ├── services/
│   │   ├── ai_service.py   # OpenAI integration
│   │   └── supabase_service.py # Database operations
│   └── main.py            # Application entry
├── tests/                 # Test suite
├── migrations/            # Database migrations
├── requirements.txt       # Dependencies
└── .env.example          # Environment template
```

## API Endpoints

### AI Summaries
- `POST /api/ai-summaries/analyze`
  - Analyze privacy policy text
  - Body: `{ "website_url": "string", "policy_text": "string" }`

- `GET /api/ai-summaries/list`
  - List all summaries for current user
  - Auth required

- `GET /api/ai-summaries/{summary_id}`
  - Get specific summary
  - Auth required

- `DELETE /api/ai-summaries/{summary_id}`
  - Delete a summary
  - Auth required

### Authentication
- `POST /api/auth/register`
  - Register new user
  - Body: `{ "email": "string", "password": "string" }`

- `POST /api/auth/login`
  - Login user
  - Body: `{ "email": "string", "password": "string" }`

- `POST /api/auth/refresh`
  - Refresh access token
  - Auth required

## Database Schema

### Users Table
```sql
create table users (
  id uuid references auth.users primary key,
  email text unique,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### AI Summaries Table
```sql
create table ai_summaries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  website_url text,
  policy_text text,
  summary jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

## Authentication

### JWT Token Structure
```json
{
  "sub": "user_id",
  "exp": "expiration_time",
  "iat": "issued_at"
}
```

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation

## Testing

### Running Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_ai_summaries.py

# Run with coverage
pytest --cov=app tests/
```

### Test Structure
```
tests/
├── conftest.py           # Test configuration and fixtures
├── test_ai_summaries.py  # AI summaries tests
├── test_auth.py          # Authentication tests
└── test_services.py      # Service layer tests
```

## Deployment

### Production Setup
1. Build requirements:
```bash
pip install -r requirements.txt
```

2. Set environment variables
3. Run with gunicorn:
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

### Deployment Options

#### 1. Railway.app
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### 2. Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create consentlens-api

# Deploy
git push heroku main
```

## Future Enhancements

### Planned Features
1. **Enhanced AI Analysis**
   - Sentiment analysis
   - Compliance scoring
   - Risk assessment

2. **Advanced Authentication**
   - OAuth2 providers
   - Two-factor authentication
   - Session management

3. **Performance Optimizations**
   - Response caching
   - Background tasks
   - Rate limiting

### Database Migrations
- Version control for schema changes
- Rollback capability
- Data seeding

### Testing Infrastructure
- Integration tests
- Load testing
- API documentation tests
- Mock services

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
MIT License