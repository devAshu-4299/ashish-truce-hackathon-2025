
-- Enable Row Level Security
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create ai_summaries table
CREATE TABLE IF NOT EXISTS ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    website_url TEXT NOT NULL,
    policy_text TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_consents table
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    website_url TEXT NOT NULL,
    consent_type TEXT NOT NULL,
    status BOOLEAN DEFAULT false,
    auto_revoke_rule JSONB,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create privacy_scores table
CREATE TABLE IF NOT EXISTS privacy_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    website_url TEXT NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_summaries
CREATE POLICY "Users can view their own summaries"
    ON ai_summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries"
    ON ai_summaries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries"
    ON ai_summaries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries"
    ON ai_summaries FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for user_consents
CREATE POLICY "Users can view their own consents"
    ON user_consents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
    ON user_consents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
    ON user_consents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consents"
    ON user_consents FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for privacy_scores
CREATE POLICY "Users can view their own privacy scores"
    ON privacy_scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy scores"
    ON privacy_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy scores"
    ON privacy_scores FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own privacy scores"
    ON privacy_scores FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_ai_summaries_user_id ON ai_summaries(user_id);
CREATE INDEX idx_ai_summaries_website_url ON ai_summaries(website_url);
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_website_url ON user_consents(website_url);
CREATE INDEX idx_privacy_scores_user_id ON privacy_scores(user_id);
CREATE INDEX idx_privacy_scores_website_url ON privacy_scores(website_url);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_summaries_updated_at
    BEFORE UPDATE ON ai_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at
    BEFORE UPDATE ON user_consents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_scores_updated_at
    BEFORE UPDATE ON privacy_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();