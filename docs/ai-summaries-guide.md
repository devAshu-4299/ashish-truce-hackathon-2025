# Understanding AI Summaries

## Overview
AI summaries provide concise, analyzed versions of privacy policies and terms of service. Each summary includes key points, privacy scores, and risk assessments.

## Basic Structure
```json
{
  "id": "string",
  "website_url": "string",
  "summary": "string",
  "key_points": ["string"],
  "privacy_score": number,
  "risk_factors": ["string"],
  "created_at": "ISO DateTime",
  "updated_at": "ISO DateTime"
}
```

## Real-world Examples

### 1. E-commerce Privacy Policy
```json
{
  "id": "1",
  "website_url": "https://www.amazon.com",
  "summary": "Amazon's privacy policy outlines extensive data collection practices for personalized shopping. They collect purchase history, browsing behavior, and device information. Data is shared with third-party sellers and used for targeted advertising.",
  "key_points": [
    "Collects purchase history and browsing data",
    "Shares data with third-party sellers",
    "Uses data for personalized recommendations",
    "Retains data until account deletion",
    "Allows opt-out from marketing communications"
  ],
  "privacy_score": 65,
  "risk_factors": [
    "Extensive data collection",
    "Third-party data sharing",
    "Long data retention period"
  ],
  "created_at": "2025-05-19T10:00:00Z",
  "updated_at": "2025-05-19T10:00:00Z"
}
```
*Use case: Helping users understand e-commerce data practices*

### 2. Social Media Terms of Service
```json
{
  "id": "2",
  "website_url": "https://www.facebook.com",
  "summary": "Facebook's terms grant them broad rights to user content and data. They can use your content for advertising, share it with partners, and retain it even after account deletion. The policy includes mandatory arbitration for disputes.",
  "key_points": [
    "Platform owns license to user content",
    "Data shared with advertisers and partners",
    "Content used for targeted advertising",
    "Mandatory arbitration clause",
    "30-day notice for terms changes"
  ],
  "privacy_score": 45,
  "risk_factors": [
    "Broad content rights",
    "Limited user control over data",
    "Mandatory arbitration",
    "Complex data sharing network"
  ],
  "created_at": "2025-05-18T15:30:00Z",
  "updated_at": "2025-05-18T15:30:00Z"
}
```
*Use case: Highlighting important terms in social media policies*

### 3. Banking App Privacy Policy
```json
{
  "id": "3",
  "website_url": "https://www.chase.com",
  "summary": "Chase's privacy policy emphasizes security and regulatory compliance. They collect financial data for service provision and fraud prevention. Data sharing is limited to essential partners and regulatory requirements.",
  "key_points": [
    "Strict data security measures",
    "Limited third-party sharing",
    "Clear fraud prevention protocols",
    "Regulatory compliance focus",
    "Optional marketing communications"
  ],
  "privacy_score": 85,
  "risk_factors": [
    "Necessary financial data collection",
    "Required regulatory reporting"
  ],
  "created_at": "2025-05-17T09:15:00Z",
  "updated_at": "2025-05-17T09:15:00Z"
}
```
*Use case: Understanding financial service data practices*

## Privacy Score Components

### Score Calculation (0-100)
- **90-100**: Exceptional privacy practices
- **70-89**: Good privacy practices with minor concerns
- **50-69**: Average practices with some risks
- **30-49**: Significant privacy concerns
- **0-29**: Major privacy risks

### Factors Affecting Score
1. **Data Collection** (25 points)
   - Minimal collection (+25)
   - Moderate collection (+15)
   - Extensive collection (+5)

2. **Data Sharing** (25 points)
   - Limited sharing (+25)
   - Moderate sharing (+15)
   - Extensive sharing (+5)

3. **User Control** (25 points)
   - Full control (+25)
   - Partial control (+15)
   - Limited control (+5)

4. **Security Measures** (25 points)
   - Strong measures (+25)
   - Standard measures (+15)
   - Basic measures (+5)

## Best Practices for Using Summaries

### Display Guidelines
```javascript
// Color-coding privacy scores
const getScoreColor = (score) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
};

// Prioritizing key points
const displayKeyPoints = (points) => {
  const critical = points.filter(p => p.includes('data') || p.includes('privacy'));
  const general = points.filter(p => !critical.includes(p));
  return [...critical, ...general];
};
```

### Usage Examples
```javascript
// Risk assessment
const assessRisk = (summary) => {
  const highRisk = summary.risk_factors.length > 3;
  const lowScore = summary.privacy_score < 50;
  return {
    needsAttention: highRisk || lowScore,
    recommendations: generateRecommendations(summary)
  };
};

// Consent recommendations
const recommendConsents = (summary) => {
  return {
    cookies: summary.privacy_score < 70 ? 'minimal' : 'standard',
    marketing: summary.privacy_score < 60 ? false : true,
    dataSharing: summary.privacy_score < 80 ? false : true
  };
};
```
