# Auto-Revoke Feature Guide

## Overview
The Auto-Revoke feature allows users to automatically revoke consents based on specific conditions. This guide provides detailed information about implementing and using the auto-revoke functionality in ConsentLens.

## Rule Types Overview

### 1. Time-based Rules
Time-based rules automatically revoke consent after a specified duration has elapsed from the consent creation date.

**Key Features:**
- Fixed duration periods
- Predictable expiry dates
- Automatic renewal options
- Notification support before expiry

**Available Durations:**
- 1 week
- 1 month
- 3 months
- 6 months
- 1 year

**Best For:**
- Marketing consents
- Cookie preferences
- Newsletter subscriptions
- GDPR compliance
- Standard data processing

**Example Use Case:**
```json
{
  "type": "time_based",
  "value": "3 months",
  "website": "newsletter.example.com",
  "description": "Newsletter subscription consent"
}
```

### 2. Inactivity-based Rules
Inactivity rules revoke consent after a specified period of user inactivity, measured by the last interaction with the service.

**Key Features:**
- Activity tracking
- Flexible inactivity thresholds
- Grace period options
- Re-engagement notifications

**Available Durations:**
- 1 month
- 3 months
- 6 months

**Activity Tracking:**
- Website visits
- Account logins
- Feature usage
- Content interaction

**Best For:**
- User accounts
- Analytics tracking
- Personalization features
- Behavioral tracking

**Example Use Case:**
```json
{
  "type": "inactivity",
  "value": "3 months",
  "website": "analytics.example.com",
  "description": "Analytics tracking consent",
  "grace_period": "7 days"
}
```

### 3. Scheduled Rules
Scheduled rules revoke consent at a specific date and time, regardless of when the consent was given or last used.

**Key Features:**
- Exact date/time scheduling
- Timezone support
- Pre-expiry notifications
- Batch processing

**Use Cases:**
- Seasonal campaigns
- Limited-time promotions
- Event-based consents
- Regulatory deadlines

**Configuration Options:**
- Start date/time
- End date/time
- Notification schedule
- Grace period

**Example Use Case:**
```json
{
  "type": "scheduled",
  "start_date": "2025-11-25T00:00:00Z",
  "end_date": "2025-12-26T00:00:00Z",
  "website": "promotion.example.com",
  "description": "Holiday season promotional consent"
}
```

### Rule Type Comparison

| Feature | Time-based | Inactivity | Scheduled |
|---------|------------|------------|-----------|
| Trigger | Duration from start | No activity period | Specific date/time |
| Flexibility | Fixed periods | Dynamic | Exact scheduling |
| Use Case | Regular consent | User engagement | Campaigns |
| Complexity | Low | Medium | Low |
| Monitoring | Simple | Requires tracking | Date-based |
| Renewal | Automatic option | On activity | Manual |

### Choosing the Right Rule Type

1. **Choose Time-based when:**
   - You need fixed consent durations
   - Compliance requires specific timeframes
   - Regular renewal is needed
   - Predictable expiry dates are important

2. **Choose Inactivity-based when:**
   - User engagement is important
   - Consent depends on active usage
   - You want to clean inactive consents
   - Privacy requirements need activity tracking

3. **Choose Scheduled when:**
   - Running time-limited campaigns
   - Planning seasonal promotions
   - Coordinating with events
   - Managing temporary consents

## Table of Contents
1. [Feature Components](#feature-components)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Use Cases](#use-cases)
5. [Implementation Examples](#implementation-examples)
6. [Template Documentation](#template-documentation)

## Feature Components

### AutoRevokePage
The main interface for managing auto-revoke rules. Users can:
- View existing rules
- Create new rules
- Delete rules
- Monitor rule status and expiry dates

### AutoRevokeService
Handles the business logic for:
- CRUD operations on rules
- Rule execution
- Activity tracking
- Expiry calculations

## Database Schema

### auto_revoke_rules Table
```sql
CREATE TABLE auto_revoke_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  website TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('time_based', 'inactivity', 'scheduled')),
  value TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed')),
  description TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE auto_revoke_rules ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own rules
CREATE POLICY "Users can manage their own rules"
  ON auto_revoke_rules
  FOR ALL
  USING (auth.uid() = user_id);
```

### user_activities Table (for inactivity tracking)
```sql
CREATE TABLE user_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  website TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activity_type TEXT NOT NULL
);
```

## API Reference

### AutoRevokeService Methods

#### getRules()
```javascript
// Get all auto-revoke rules for the current user
const rules = await autoRevokeService.getRules();
```

#### addRule(rule)
```javascript
// Add a new auto-revoke rule
const rule = {
  website: 'example.com',
  type: 'time_based',
  value: '1 month',
  description: 'Automatically revoke after 1 month'
};
await autoRevokeService.addRule(rule);
```

#### deleteRule(ruleId)
```javascript
// Delete an existing rule
await autoRevokeService.deleteRule('rule-uuid');
```

#### updateRuleStatus(ruleId, status)
```javascript
// Update rule status
await autoRevokeService.updateRuleStatus('rule-uuid', 'completed');
```

## Use Cases

### 1. Time-based Auto-Revoke

```javascript
// Example: Create a rule to revoke consent after 3 months
const timeBasedRule = {
  website: 'analytics.example.com',
  type: 'time_based',
  value: '3 months',
  description: 'Revoke analytics consent after 3 months'
};

try {
  await autoRevokeService.addRule(timeBasedRule);
  console.log('Time-based rule created successfully');
} catch (error) {
  console.error('Failed to create rule:', error);
}
```

### 2. Inactivity-based Auto-Revoke

```javascript
// Example: Create a rule to revoke consent after 1 month of inactivity
const inactivityRule = {
  website: 'shop.example.com',
  type: 'inactivity',
  value: '1 month',
  description: 'Revoke shopping consent after 1 month of inactivity'
};

try {
  await autoRevokeService.addRule(inactivityRule);
  console.log('Inactivity rule created successfully');
} catch (error) {
  console.error('Failed to create rule:', error);
}
```

### 3. Scheduled Auto-Revoke

```javascript
// Example: Create a rule to revoke consent on a specific date
const scheduledRule = {
  website: 'subscription.example.com',
  type: 'scheduled',
  value: '2025-12-31T23:59:59Z',
  description: 'Revoke subscription consent at year end'
};

try {
  await autoRevokeService.addRule(scheduledRule);
  console.log('Scheduled rule created successfully');
} catch (error) {
  console.error('Failed to create rule:', error);
}
```

## Implementation Examples

### 1. Creating the Auto-Revoke Page

```jsx
// Example implementation of the main auto-revoke page
import React from 'react';
import { AutoRevokeService } from '@/services/AutoRevokeService';

const AutoRevokePage = () => {
  const [rules, setRules] = useState([]);
  
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    const rules = await autoRevokeService.getRules();
    setRules(rules);
  };

  return (
    <div>
      <h1>Auto-Revoke Rules</h1>
      {/* Rule list and management UI */}
    </div>
  );
};
```

### 2. Rule Execution Logic

```javascript
// Example of how rules are executed
const executeRules = async () => {
  const rules = await autoRevokeService.getRules();
  
  for (const rule of rules) {
    if (autoRevokeService.shouldExecuteRule(rule)) {
      await autoRevokeService.revokeConsent(rule);
      await autoRevokeService.updateRuleStatus(rule.id, 'completed');
    }
  }
};
```

### 3. Activity Tracking

```javascript
// Example of tracking user activity for inactivity-based rules
const trackActivity = async (website) => {
  try {
    await supabase
      .from('user_activities')
      .insert({
        website,
        activity_type: 'page_visit'
      });
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
};
```

## Template Documentation

### Pre-defined Templates

ConsentLens provides several pre-defined templates to help you quickly set up common auto-revoke scenarios:

### 1. GDPR Compliance Template
- **Type**: Time-based
- **Duration**: 1 year
- **Purpose**: Standard GDPR-compliant consent duration
- **Tags**: compliance, gdpr
- **Best for**: Standard data processing agreements and general data collection
- **Description**: Ensures compliance with GDPR requirements for consent duration

### 2. Marketing Consent Template
- **Type**: Time-based
- **Duration**: 3 months
- **Purpose**: Short-term marketing permissions
- **Tags**: marketing, promotional
- **Best for**: Email marketing campaigns, promotional communications
- **Description**: Automatically revokes marketing permissions after a short period

### 3. Analytics Tracking Template
- **Type**: Inactivity-based
- **Duration**: 3 months of inactivity
- **Purpose**: Website analytics and tracking consent
- **Tags**: analytics, tracking
- **Best for**: User behavior tracking, analytics tools
- **Description**: Revokes tracking consent if user becomes inactive

### 4. Seasonal Campaign Template
- **Type**: Scheduled
- **Duration**: Custom date (user-defined)
- **Purpose**: Time-limited promotional activities
- **Tags**: marketing, promotional, seasonal
- **Best for**: Holiday campaigns, seasonal promotions
- **Description**: Automatically ends promotional consent on a specific date

### 5. Minimal Data Collection Template
- **Type**: Time-based
- **Duration**: 1 month
- **Purpose**: Basic data collection with privacy focus
- **Tags**: privacy, minimal
- **Best for**: Essential services, privacy-conscious implementations
- **Description**: Short duration consent for minimal data collection

## Using Templates

1. Navigate to the Auto-Revoke page
2. Click "Add Rule"
3. Switch to the "Use Template" tab
4. Select your desired template from the dropdown
5. Enter the website URL
6. Customize any settings if needed (e.g., specific date for scheduled templates)
7. Click "Add Rule" to create the rule

## Template Benefits

- **Consistency**: Ensure consistent consent management across your application
- **Best Practices**: Templates are designed following privacy best practices
- **Efficiency**: Quickly set up common consent scenarios
- **Compliance**: Pre-configured options for regulatory compliance
- **Flexibility**: Customize template settings as needed

## Custom Rules

While templates provide quick setup for common scenarios, you can always create custom rules:

1. Click "Add Rule"
2. Stay on the "Manual Setup" tab
3. Choose the rule type (time-based, inactivity, or scheduled)
4. Configure your specific settings
5. Add the rule

## Managing Rules

- View all active rules in the Auto-Revoke dashboard
- Edit existing rules by clicking on them
- Delete rules that are no longer needed
- Monitor rule status and upcoming revocations
- Filter rules by type, status, or tags

## Best Practices

1. **Regular Review**: Periodically review your auto-revoke rules
2. **Documentation**: Keep track of why each rule was created
3. **Testing**: Test rules with shorter durations before implementing long-term rules
4. **User Communication**: Inform users about auto-revoke policies
5. **Compliance**: Ensure rules align with privacy regulations

## Technical Details

Rules are stored in the following format:
```json
{
  "id": "unique_id",
  "website": "example.com",
  "type": "time_based",
  "value": "3 months",
  "created_at": "2025-05-20T00:00:00Z",
  "expiry_date": "2025-08-20T00:00:00Z",
  "status": "active",
  "description": "Rule description"
}
```
