# Consent Data Structure Documentation

## Overview
This document describes the data structure used for managing user consents in the ConsentLens application. The structure supports various types of consents, granular permissions, and automated consent management features.

## Core Structure
Each consent object contains the following key properties:

### Basic Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | String | Unique identifier for the consent | `"1"` |
| `website_url` | String | URL of the website for which consent is given | `"https://www.amazon.com"` |
| `consent_type` | String | Type of consent | `"cookie"`, `"privacy_policy"`, `"terms"` |
| `status` | Boolean | Whether consent is currently active | `true`/`false` |

### Timestamps
| Field | Type | Description |
|-------|------|-------------|
| `created_at` | ISO DateTime | When the consent was first given |
| `updated_at` | ISO DateTime | When the consent was last modified |
| `expiry_date` | ISO DateTime | (Optional) When the consent will expire |

### Auto-Revoke Configuration
```json
{
  "auto_revoke_rule": {
    "enabled": boolean,
    "duration": string,
    "conditions": string[]
  }
}
```

#### Auto-Revoke Properties
- `enabled`: Whether auto-revoke is active
- `duration`: Time period after which consent expires (e.g., "30d", "90d")
- `conditions`: Array of triggers for auto-revoke
  - `"after_duration"`: Revoke after specified duration
  - `"policy_change"`: Revoke when policy changes

### Consent Details
The `consent_details` object varies based on the consent type:

#### Cookie Consent Details
```json
{
  "consent_details": {
    "necessary": true,    // Required cookies (always true)
    "functional": true,   // Features & preferences
    "analytics": true,    // Usage tracking
    "advertising": false  // Ad targeting
  }
}
```

#### Privacy Policy Consent Details
```json
{
  "consent_details": {
    "data_collection": true,      // Allow data collection
    "third_party_sharing": false, // Allow sharing with third parties
    "marketing": false           // Allow marketing communications
  }
}
```

## Complete Example
```json
{
  "id": "1",
  "website_url": "https://www.amazon.com",
  "consent_type": "cookie",
  "status": true,
  "auto_revoke_rule": {
    "enabled": true,
    "duration": "30d",
    "conditions": ["after_duration"]
  },
  "expiry_date": "2025-06-19T10:00:00Z",
  "created_at": "2025-05-19T10:00:00Z",
  "updated_at": "2025-05-19T10:00:00Z",
  "consent_details": {
    "necessary": true,
    "functional": true,
    "analytics": true,
    "advertising": false
  }
}
```

## Features Supported
1. **Multiple Consent Types**: Support for different types of consents (cookies, privacy policies, terms)
2. **Granular Control**: Detailed permissions for different aspects of each consent type
3. **Automated Management**: Auto-revoke rules and expiry dates
4. **Audit Trail**: Tracking of consent creation and modifications
5. **Website-specific**: Individual consent management for each website

## Usage Notes
- All timestamps are in ISO 8601 format with UTC timezone
- Auto-revoke durations are specified in days with 'd' suffix
- The `necessary` field in cookie consents should always be true
- The `status` field represents the overall consent state
- Individual permissions can be controlled via the `consent_details` object
