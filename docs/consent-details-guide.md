# Understanding Consent Details

## Overview
Consent details provide granular control over different aspects of user consent. The structure varies based on the type of consent (cookie, privacy policy, or terms).

## Cookie Consent Details

### Structure
```json
{
  "consent_details": {
    "necessary": true,
    "functional": true,
    "analytics": false,
    "advertising": false
  }
}
```

### Real-world Examples

1. **Minimal Cookie Consent** (Essential Only)
```json
{
  "website_url": "https://www.banking-app.com",
  "consent_type": "cookie",
  "status": true,
  "consent_details": {
    "necessary": true,     // Required for site functionality
    "functional": false,   // No preference cookies
    "analytics": false,    // No analytics tracking
    "advertising": false   // No ad targeting
  }
}
```
*Use case: A user who only accepts essential cookies on a banking website*

2. **Analytics-friendly Consent**
```json
{
  "website_url": "https://www.news-site.com",
  "consent_type": "cookie",
  "status": true,
  "consent_details": {
    "necessary": true,     // Required cookies
    "functional": true,    // Remember user preferences
    "analytics": true,     // Allow usage tracking
    "advertising": false   // No personalized ads
  }
}
```
*Use case: A user who wants personalized content but no ads*

## Privacy Policy Consent Details

### Structure
```json
{
  "consent_details": {
    "data_collection": true,
    "third_party_sharing": false,
    "marketing": false
  }
}
```

### Real-world Examples

1. **Minimal Data Collection**
```json
{
  "website_url": "https://www.email-service.com",
  "consent_type": "privacy_policy",
  "status": true,
  "consent_details": {
    "data_collection": true,       // Basic account info only
    "third_party_sharing": false,  // No data sharing
    "marketing": false             // No marketing emails
  }
}
```
*Use case: A privacy-conscious user signing up for an email service*

2. **Full Marketing Consent**
```json
{
  "website_url": "https://www.e-commerce.com",
  "consent_type": "privacy_policy",
  "status": true,
  "consent_details": {
    "data_collection": true,      // Allow collecting shopping preferences
    "third_party_sharing": true,  // Allow sharing with partners
    "marketing": true             // Allow promotional emails
  }
}
```
*Use case: A user who wants personalized shopping recommendations*

## Common Scenarios

### E-commerce Website
```json
{
  "cookie_consent": {
    "necessary": true,     // Session management
    "functional": true,    // Shopping cart, language preference
    "analytics": true,     // Product popularity tracking
    "advertising": true    // Product recommendations
  },
  "privacy_policy": {
    "data_collection": true,       // Purchase history
    "third_party_sharing": true,   // Payment processors
    "marketing": true              // Deal notifications
  }
}
```

### Social Media Platform
```json
{
  "cookie_consent": {
    "necessary": true,     // Login session
    "functional": true,    // User preferences
    "analytics": true,     // Feature usage tracking
    "advertising": true    // Personalized content
  },
  "privacy_policy": {
    "data_collection": true,       // Profile information
    "third_party_sharing": true,   // API integrations
    "marketing": false             // No promotional emails
  }
}
```

## Best Practices

1. **Cookie Consent**
   - `necessary` should always be true (required for basic functionality)
   - `functional` affects user experience features
   - `analytics` controls usage tracking
   - `advertising` manages personalized ads

2. **Privacy Policy Consent**
   - `data_collection` specifies what data can be collected
   - `third_party_sharing` controls data sharing with partners
   - `marketing` manages promotional communications

## Impact of Consent Details

### When Cookie Consent is Limited
```javascript
if (!consentDetails.analytics) {
  // Disable Google Analytics
  // Use anonymous tracking only
}

if (!consentDetails.advertising) {
  // Disable ad personalization
  // Show generic ads only
}
```

### When Privacy Policy Consent is Limited
```javascript
if (!consentDetails.marketing) {
  // Remove from marketing email lists
  // Don't show personalized offers
}

if (!consentDetails.third_party_sharing) {
  // Limit API integrations
  // Use local data processing only
}
```
