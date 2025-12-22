-- Echo Database Schema
-- PostgreSQL Database Structure

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  tagline VARCHAR(40) DEFAULT 'A moment of clarity',
  gradient VARCHAR(50) DEFAULT 'default',
  transcript TEXT,
  duration FLOAT,
  analysis JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action items table
CREATE TABLE IF NOT EXISTS action_items (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
  context TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audio milestones table
CREATE TABLE IF NOT EXISTS audio_milestones (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('insight', 'goal', 'emotion')),
  description TEXT NOT NULL,
  excerpt TEXT,
  significance TEXT,
  timestamp VARCHAR(10),
  timestamp_seconds FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_entry_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_action_items_entry_id ON action_items(entry_id);
CREATE INDEX IF NOT EXISTS idx_action_items_completed ON action_items(completed);
CREATE INDEX IF NOT EXISTS idx_audio_milestones_entry_id ON audio_milestones(entry_id);
CREATE INDEX IF NOT EXISTS idx_audio_milestones_type ON audio_milestones(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE journal_entries IS 'Stores audio journal entries with AI analysis';
COMMENT ON TABLE action_items IS 'Stores actionable tasks extracted from journal entries';
COMMENT ON TABLE audio_milestones IS 'Stores significant moments (insights, goals, emotions) from entries';
COMMENT ON TABLE user_streaks IS 'Tracks user journaling streaks';
