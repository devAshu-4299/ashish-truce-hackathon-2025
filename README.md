# ConsentLens 🔍

> AI-Powered Privacy & Consent Tracker

## 📋 Overview

ConsentLens is an AI-powered assistant (web platform and browser extension) that helps users and organizations track, understand, and manage digital consent. It aims to provide transparency, ensure compliance with global data protection regulations (like GDPR and CCPA), and build user trust.

### The Problem 🚫

Most users blindly accept cookie banners, terms of service, and app permissions without reading or understanding them. This results in:

- Legal risk due to lack of proper consent (GDPR, CCPA)
- Poor user trust and awareness
- No consolidated view of what data has been shared or consented to

### The Solution ✨

ConsentLens uses AI to monitor and manage consent given online by:
- Summarizing legal texts
- Storing consents securely
- Enabling consent revocations
- Assisting organizations with compliance

## 🎯 Key Features

### For Users
- AI summaries of cookie banners and privacy policies
- Unified dashboard to manage all consents
- Auto-revoke engine to withdraw consent
- Privacy score for websites/apps

### For Organizations
- Consent repository for compliance
- Audit export tools
- Policy analyzer to flag compliance issues
- Consent drift detection with alerts

## � Example Use Cases

1. **User Website Visit**
   - ConsentLens summarizes cookie policy
   - Suggests appropriate action
   - Stores consent decision

2. **Company Audit**
   - Provides full consent log
   - Tracks policy changes
   - Generates compliance reports

## 🛠️ Technical Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Framer Motion for animations
- Radix UI components
- React Router for navigation

### Backend (Supabase)
- PostgreSQL database
- Real-time subscriptions
- Row Level Security (RLS)
- Authentication system

### AI & APIs
- OpenAI GPT-3.5-turbo for:
  - Legal document summarization
  - Semantic diff between policy versions
  - Privacy scoring engine
  - Automated DSR email generation
- Supabase Auth
- Supabase Storage

### Browser Extension
- JavaScript (Manifest V3)
- Real-time policy detection
- Consent management integration

## 🧠 Core AI Capabilities

1. **Legal Document Analysis**
   - Privacy policy summarization
   - Terms of Service breakdown
   - Key points extraction
   - Risk assessment

2. **Privacy Intelligence**
   - Website privacy scoring
   - Policy change detection
   - Compliance risk analysis
   - Automated recommendations

3. **Consent Automation**
   - Smart consent suggestions
   - Auto-revoke rules
   - Compliance templates
   - Policy drift detection

## 🎨 Features & Implementation

### Web Application
- **AI-Powered Privacy Policy Analysis** 
  - Automated summarization using GPT-3.5
  - Key points extraction
  - Risk assessment
  
- **Consent Management**
  - Track cookie consents across websites
  - Manage privacy policy agreements
  - Auto-revoke capabilities
  - Consent history tracking

- **Privacy Insights**
  - Website privacy ratings
  - Consent analytics
  - Risk assessments
  - Trend analysis

- **Audit & Compliance**
  - Export consent data
  - Compliance reporting
  - Audit trail maintenance

### Chrome Extension
- Automatic cookie banner detection
- Privacy policy tracking
- Real-time consent management
- Integration with main application

## 📦 Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- Chrome browser (for extension)

### Web Application Setup
1. Clone the repository:
```bash
git clone https://github.com/devAshu-4299/ashish-truce-hackathon-2025
cd ConsentLens
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
```

### Chrome Extension Setup
1. Navigate to the extension directory:
```bash
cd extension
```

2. Install extension dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/dist` directory

## �️ Database Schema

### ai_summaries
```sql
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  website_url TEXT NOT NULL,
  policy_text TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_consents
```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  website_url TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  status BOOLEAN NOT NULL,
  auto_revoke_rule JSONB,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### privacy_scores
```sql
CREATE TABLE privacy_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  website_url TEXT NOT NULL,
  score INTEGER NOT NULL,
  factors JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Development Process

### SDLC Implementation Example
1. **Development**
   - Code backend summarization logic
   - Implement UI components
   - Integrate AI services

2. **Verification**
   - Test summaries across multiple sites
   - Validate consent management
   - Security testing

3. **Deployment**
   - Launch extension and backend
   - Monitor performance
   - Gather user feedback

## ⭐ Bonus Features

1. **Advanced AI Integration**
   - RAG-based history on policy changes
   - On-device AI for privacy-sensitive users
   - Enterprise-tier analytics

2. **Enhanced Privacy**
   - Local processing options
   - Custom consent rules
   - Advanced automation

3. **Enterprise Features**
   - Team management
   - Advanced analytics
   - Custom integrations

## � Security Features

1. **Authentication**
   - Email/password authentication
   - Password reset functionality
   - Protected routes
   - Session management

2. **Data Protection**
   - Row Level Security (RLS)
   - Encrypted data transmission
   - Secure storage practices

3. **API Security**
   - Environment variables
   - Rate limiting
   - CORS configuration
   - Input validation

## 📁 Project Structure
```
ConsentLens/
├── src/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   └── auth/        # Authentication components
│   ├── contexts/        # React contexts
│   ├── services/        # Service layer
│   ├── pages/          # Page components
│   └── lib/            # Utility functions
├── extension/          # Chrome extension
└── public/            # Static assets
```

## 🔄 Available Scripts

### Web Application
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Extension
- `npm run dev` - Watch mode for development
- `npm run build` - Build for production

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors
- Ashish Kumar Singh - [GitHub](https://github.com/devAshu-4299)

## 🙏 Acknowledgments
- OpenAI for GPT-3.5 API
- Supabase for BaaS
- Radix UI for components
- All contributors and supporters