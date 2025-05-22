# ConsentLens Database Schema Documentation

## Overview
This document describes the database schema for the ConsentLens application, which manages privacy policies, user consents, and cookie preferences.

## Table Structure

### Policies Table
Stores privacy policies and their analysis.
```sql
create table policies (
  id uuid default uuid_generate_v4() primary key,
  title text not null,                    -- Policy title
  content text not null,                  -- Full policy content
  summary text,                           -- AI-generated summary
  website_url text,                       -- Associated website
  version text,                           -- Policy version
  ai_analysis jsonb,                      -- Structured AI analysis results
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_policy_version unique(website_url, version)
);
```

### Cookie Categories Table
Defines standard cookie categories and their descriptions.
```sql
create table cookie_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,              -- Category name (e.g., 'necessary', 'analytics')
  description text not null,              -- Category description
  is_required boolean default false,      -- Whether this category is mandatory
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### User Consents Table
Main table for tracking user consent decisions.
```sql
create table user_consents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  website_url text not null,
  policy_id uuid references policies,
  consent_type text,                      -- Type of consent (e.g., 'cookie', 'privacy_policy')
  cookie_preferences jsonb,               -- Structured cookie preferences
  banner_text text,                       -- Original consent banner text
  status boolean default true,            -- Overall consent status
  auto_revoke_rule jsonb,                -- Auto-revocation rules
  expiry_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Consent History Table
Tracks changes to user consents.
```sql
create table consent_history (
  id uuid default uuid_generate_v4() primary key,
  consent_id uuid references user_consents on delete cascade not null,
  policy_id uuid references policies not null,
  cookie_preferences jsonb not null,
  status boolean not null,
  change_reason text,                     -- Reason for consent change
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Performance Optimizations

### Indexes
```sql
create index idx_policies_website_url on policies(website_url);
create index idx_user_consents_user_id on user_consents(user_id);
create index idx_user_consents_website_url on user_consents(website_url);
create index idx_consent_history_consent_id on consent_history(consent_id);
```

### Automatic Timestamp Updates
```sql
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Applied to policies and user_consents tables
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled:
- policies
- cookie_categories
- user_consents
- consent_history

### RLS Policies
1. User Consents:
   ```sql
   create policy "Users can view their own consents"
     on user_consents for select using (auth.uid() = user_id);
   
   create policy "Users can insert their own consents"
     on user_consents for insert with check (auth.uid() = user_id);
   
   create policy "Users can update their own consents"
     on user_consents for update using (auth.uid() = user_id);
   
   create policy "Users can delete their own consents"
     on user_consents for delete using (auth.uid() = user_id);
   ```

2. Cookie Categories:
   ```sql
   create policy "Cookie categories are viewable by all authenticated users"
     on cookie_categories for select using (auth.role() = 'authenticated');
   ```

3. Consent History:
   ```sql
   create policy "Users can view history of their consents"
     on consent_history for select
     using (exists (
       select 1 from user_consents
       where user_consents.id = consent_history.consent_id
       and user_consents.user_id = auth.uid()
     ));
   ```

## Default Data

### Cookie Categories
Default categories are inserted if they don't exist:
1. necessary (required) - Essential cookies for basic site functionality
2. functional - Enhanced functionality cookies
3. analytics - Usage and performance analysis cookies
4. marketing - Marketing and advertising cookies
5. preferences - User preference cookies

## JSON Structures

### cookie_preferences (jsonb)
```json
{
  "necessary": true,
  "functional": false,
  "analytics": true,
  "marketing": false,
  "preferences": true
}
```

### auto_revoke_rule (jsonb)
```json
{
  "type": "time_based",
  "duration": "30d",
  "conditions": {
    "policy_change": true,
    "cookie_expiry": true
  }
}
```

### ai_analysis (jsonb)
```json
{
  "readability_score": 85,
  "risk_factors": ["data_sharing", "third_party_cookies"],
  "key_points": ["Data retention period: 30 days", "No data selling"],
  "compliance": {
    "gdpr": true,
    "ccpa": false
  }
}
```

## Relationships
- user_consents.policy_id → policies.id
- user_consents.user_id → auth.users.id
- consent_history.consent_id → user_consents.id
- consent_history.policy_id → policies.id

## Notes
1. All timestamps are in UTC
2. UUIDs are used for all primary keys
3. Soft deletes are not implemented - records are hard deleted
4. All tables have created_at timestamps
5. Modified tables have updated_at timestamps with automatic updates