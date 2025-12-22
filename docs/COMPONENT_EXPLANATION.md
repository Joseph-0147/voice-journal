# Echo - Detailed Component Explanation

## Overview
This document provides comprehensive explanations of all major components in the Echo voice journaling application, including their purpose, architecture, key functions, data flow, and interactions.

---

## Table of Contents
1. [Mobile Application Components](#mobile-application-components)
2. [Backend Components](#backend-components)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Integration Points](#integration-points)

---

## Mobile Application Components

### 1. HomeScreen.js
**Purpose**: Main entry point for users to create new voice journal entries

**Key Features**:
- One-tap voice recording with permission handling
- Visual feedback through pulsing animation during recording
- Real-time recording duration display
- Recent entries preview with swipe gestures
- Current streak display for motivation

**Architecture**:
```
State Management:
├── isRecording (boolean) - Recording status
├── recordingDuration (number) - Duration in seconds
├── recentEntries (array) - Last 5 journal entries
└── pulseAnimation (Animated.Value) - Recording button animation

Key Functions:
├── startRecording() - Initialize audio capture
├── stopRecording() - End recording & navigate to post-processing
├── startPulseAnimation() - Create visual feedback loop
├── loadRecentEntries() - Fetch user's latest entries
└── renderRecentEntry() - Display entry cards with thumbnails
```

**Data Flow**:
1. User taps record button → Request microphone permissions
2. Permissions granted → Initialize AudioRecorderPlayer
3. Recording starts → Start pulse animation & duration timer
4. User stops recording → Save audio file locally
5. Navigate to PostRecordingScreen with audio path, duration, timestamp

**External Dependencies**:
- `react-native-audio-recorder-player` - Audio capture
- `react-native-permissions` - Microphone access
- `@react-navigation/native` - Screen navigation

---

### 2. PostRecordingScreen.js
**Purpose**: Process recorded audio with AI and allow customization before saving

**Key Features**:
- Real-time soundscape visualization with animated waveforms
- AI transcription and analysis with loading states
- Theme/gradient picker (8 preset options)
- Quick insights preview (action items, goals, sentiment)
- Share functionality with image export
- Save to backend with full metadata

**Architecture**:
```
State Management:
├── isProcessing (boolean) - AI processing status
├── transcript (string) - Whisper API output
├── insights (object) - GPT-4 analysis results
│   ├── actionItems[] - Extracted tasks
│   ├── milestones[] - Insights, goals, emotions
│   ├── sentiment{} - Overall & detailed sentiment
│   └── themes[] - Detected topics
├── selectedGradient (string) - Chosen visual theme
├── tagline (string) - User-entered title
└── showThemePicker (boolean) - Modal visibility

Key Functions:
├── processAudio() - Send to AIService for transcription + analysis
├── handleThemeSelect() - Update gradient selection
├── handleShare() - Capture view as image & trigger share sheet
├── handleSaveEntry() - POST to backend with full payload
└── renderQuickInsights() - Display summary cards
```

**Data Flow**:
1. Component mounts → Automatically call `processAudio()`
2. AIService.processJournalEntry() → Returns transcript + insights
3. User customizes tagline & gradient
4. Save button → API call to `/api/journals` with:
   - Audio file (multipart form)
   - Transcript
   - Analysis JSON
   - Tagline
   - Gradient name
5. Success → Navigate back to Home with refresh

**AI Integration**:
- Whisper API: Speech-to-text with word-level timestamps
- GPT-4 API: Structured analysis with JSON schema enforcement
- Local caching: Store results to avoid re-processing

---

### 3. InsightsDashboardScreen.js
**Purpose**: Analytics hub displaying aggregated insights and progress tracking

**Key Features**:
- Weekly summary card (entries, minutes, sentiment, streak)
- Interactive action items with checkbox completion
- Milestone cards categorized by type (insight/goal/emotion)
- Theme distribution bar chart
- Pull-to-refresh functionality
- Filtering options (completed items, milestone types)

**Architecture**:
```
State Management:
├── weeklySummary (object) - Aggregated statistics
│   ├── entryCount (number)
│   ├── totalMinutes (number)
│   ├── sentiment (string)
│   └── streak (number)
├── actionItems (array) - Pending & completed tasks
├── milestones (array) - Recent insights/goals/emotions
├── themes (array) - Theme distribution with percentages
└── isRefreshing (boolean) - Pull-to-refresh state

Key Functions:
├── loadInsightsData() - Fetch all dashboard data from API
├── toggleActionItem(id) - Update completion status
├── filterActionItems(status) - Show pending/completed/all
├── renderMilestone(item) - Type-specific card rendering
└── renderThemeBar(theme) - Horizontal bar chart visualization
```

**Data Flow**:
1. Component mounts → Call `loadInsightsData()`
2. Parallel API calls:
   - `/api/insights/weekly-summary`
   - `/api/insights/action-items`
   - `/api/insights/milestones?limit=20`
3. User toggles action item → PUT `/api/insights/action-items/:id/toggle`
4. Optimistic UI update → Checkbox animates immediately
5. API confirms → Update local state

**Visual Design**:
- Linear gradient header for summary card
- Color-coded milestones (yellow=insight, green=goal, red=emotion)
- Horizontal bar charts with percentage labels
- Smooth animations for checkboxes and refreshes

---

### 4. SoundscapeVisualizer.js
**Purpose**: Animated waveform visualization representing journal entry audio

**Key Features**:
- 50 animated bars with varying heights
- Continuous flowing animation (never stops)
- Organic feel with randomized timing
- Gradient color overlay support
- Responsive to container dimensions
- Lightweight performance (uses native driver)

**Architecture**:
```
State Management:
├── barAnimations (array) - 50 Animated.Value instances
└── animationLoops (array) - 50 Animated.loop references

Key Functions:
├── startFlowingAnimation() - Initialize 50 staggered loops
├── createBarAnimation(animValue) - Single bar animation definition
│   ├── Random height: 0.2 to 1.0
│   ├── Random duration: 1000-2000ms
│   └── Easing: easeInOut
└── renderWaveformBars() - Map animValues to Animated.View components
```

**Animation Logic**:
```javascript
Each bar:
1. Starts at random height (0.2-1.0)
2. Animates to new random height over 1-2 seconds
3. Loops infinitely with easeInOut easing
4. 50ms stagger between bars creates wave effect
5. Uses native driver for 60fps performance
```

**Props**:
- `audioPath` (string): Path to audio file (currently decorative)
- `gradient` (array): Color stops for linear gradient overlay
- `style` (object): Custom container styles

**Performance Optimization**:
- Native driver enabled (`useNativeDriver: true`)
- Limited to 50 bars (balance between visual appeal & performance)
- Animations run on UI thread, not JS thread

---

### 5. AIService.js (Mobile)
**Purpose**: Client-side OpenAI API integration for audio processing

**Key Features**:
- Audio transcription with Whisper API
- Natural language analysis with GPT-4
- Timestamp synchronization between audio and text
- Structured JSON response with validation
- Error handling and retry logic

**Architecture**:
```
Core Methods:
├── transcribeAudio(audioPath)
│   ├── Convert file to FormData
│   ├── POST to Whisper API with timestamp_granularities
│   └── Return transcript + word-level timestamps
│
├── analyzeJournalEntry(transcript)
│   ├── Build structured analysis prompt
│   ├── POST to GPT-4 with JSON schema
│   └── Parse and validate response
│
├── processJournalEntry(audioPath)
│   ├── Call transcribeAudio()
│   ├── Call analyzeJournalEntry()
│   ├── Merge results with addTimestampsToMilestones()
│   └── Return complete entry object
│
└── addTimestampsToMilestones(milestones, words)
    ├── Match milestone excerpts to word timestamps
    ├── Use fuzzy matching (calculateMatchScore)
    └── Format timestamps as MM:SS
```

**AI Prompt Template** (60+ lines):
```
System Context:
- Voice journal entry analysis role
- Professional yet empathetic tone

Analysis Requirements:
1. Action Items (0-5)
   - Specific, actionable tasks
   - Priority: high/medium/low
   - Direct quotes as excerpts

2. Milestones (2-10)
   - Type: insight/goal/emotion
   - Brief descriptions (10-20 words)
   - Relevant excerpts (5-15 words)

3. Sentiment
   - Overall: positive/negative/neutral/mixed
   - Confidence: 0.0-1.0
   - Specific emotions array

4. Themes (1-5)
   - Name & description
   - Relevant excerpts

Guidelines:
- Professional tone
- Specific over generic
- Honor user's language
```

**Response Schema**:
```json
{
  "actionItems": [
    {"task": "string", "priority": "high|medium|low", "excerpt": "string"}
  ],
  "milestones": [
    {"type": "insight|goal|emotion", "description": "string", "excerpt": "string"}
  ],
  "sentiment": {
    "overall": "positive|negative|neutral|mixed",
    "confidence": 0.0-1.0,
    "specificEmotions": ["string"]
  },
  "themes": [
    {"name": "string", "description": "string", "excerpt": "string"}
  ]
}
```

**Error Handling**:
- Network timeouts with retry logic
- Invalid JSON fallback parsing
- API rate limiting detection
- User-friendly error messages

---

### 6. AppNavigator.js
**Purpose**: Navigation structure and routing for the entire application

**Architecture**:
```
Navigation Hierarchy:
Root (NavigationContainer)
└── Stack Navigator
    ├── MainTabs (Bottom Tab Navigator)
    │   ├── Home Tab
    │   │   └── Stack Navigator
    │   │       ├── HomeMain (HomeScreen)
    │   │       └── PostRecording (PostRecordingScreen)
    │   ├── Insights Tab (InsightsDashboardScreen)
    │   └── Settings Tab (SettingsScreen)
    └── Profile (Modal Stack - ProfileScreen)
```

**Navigation Patterns**:
1. **Tab Navigation**: Persistent bottom tabs for main sections
2. **Stack Navigation**: Push/pop for hierarchical flows (Home → PostRecording)
3. **Modal Navigation**: Overlay for profile/settings

**Configuration**:
```javascript
Tab Bar Styling:
- Active color: colors.primary
- Inactive color: colors.textSecondary
- Height: 60px with safe area padding
- Icon size: 24px emoji icons
- Label size: 12px

Stack Options:
- headerShown: false (custom headers in screens)
- cardStyle: { backgroundColor: colors.background }
- gestureEnabled: true (iOS swipe back)
```

**Navigation Methods** (available in all screens):
```javascript
navigation.navigate('ScreenName', params)
navigation.goBack()
navigation.push('ScreenName')
navigation.replace('ScreenName')
navigation.reset({ routes: [...] })
```

---

### 7. SettingsScreen.js & ProfileScreen.js
**Purpose**: User preferences and profile management

**Settings Features**:
- Account management (password, email preferences)
- Notification toggles (push notifications, daily reminders)
- Recording preferences (auto-transcribe, audio quality)
- Privacy controls (local storage only, delete account)
- Support links (help center, privacy policy, terms)

**Profile Features**:
- Avatar display with edit capability
- User statistics grid (entries, minutes, streak, longest streak)
- Achievement system with dates
- Premium upgrade banner
- Join date and member info

**State Management**:
```
Settings:
├── notificationsEnabled (boolean)
├── reminderEnabled (boolean)
├── autoTranscribe (boolean)
└── localStorageOnly (boolean)

Profile:
├── user (object)
│   ├── displayName
│   ├── email
│   ├── profileImage
│   └── joinDate
└── stats (object)
    ├── totalEntries
    ├── totalMinutes
    ├── currentStreak
    └── longestStreak
```

---

### 8. Theme System (theme/index.js)
**Purpose**: Centralized design system for consistent UI/UX

**Structure**:
```javascript
colors: {
  primary: '#6B7FD7',
  background: '#F8F9FB',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  
  gradients: {
    default: ['#6B7FD7', '#9BA3EB'],
    sunset: ['#FF6B9D', '#FFA07A'],
    ocean: ['#4A90E2', '#67E8F9'],
    forest: ['#10B981', '#34D399'],
    twilight: ['#8B5CF6', '#A78BFA'],
    peach: ['#FBBF24', '#F59E0B'],
    mint: ['#34D399', '#6EE7B7'],
    lavenderDream: ['#C084FC', '#E0B3FF']
  }
}

typography: {
  sizes: { h1: 28, h2: 22, h3: 18, body: 16, caption: 14, label: 12 },
  weights: { regular: '400', medium: '500', semiBold: '600', bold: '700' }
}

spacing: {
  xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32
}

borderRadius: {
  small: 8, medium: 12, large: 16, extraLarge: 24, full: 9999
}

shadows: {
  small: { shadowOffset: {width:0, height:2}, shadowOpacity:0.1, shadowRadius:4 },
  medium: { shadowOffset: {width:0, height:4}, shadowOpacity:0.1, shadowRadius:8 },
  heavy: { shadowOffset: {width:0, height:8}, shadowOpacity:0.15, shadowRadius:24 }
}

animations: {
  duration: { fast: 200, normal: 300, slow: 500 },
  easing: { standard: Easing.bezier(0.4, 0.0, 0.2, 1) }
}
```

---

## Backend Components

### 1. Authentication System (authController.js + auth.js)

**Purpose**: Handle user registration, login, token management, and session security

**Key Operations**:

#### **Registration Flow**:
```
1. Validate input (email format, password strength)
2. Check for existing user
3. Hash password with bcrypt (10 salt rounds)
4. Create user record in database
5. Initialize user_streaks record
6. Generate JWT token (7-day expiration)
7. Return token + user object
```

#### **Login Flow**:
```
1. Validate credentials
2. Fetch user from database by email
3. Compare password with bcrypt.compare()
4. Generate new JWT token
5. Return token + user data
```

#### **Token Structure**:
```javascript
JWT Payload:
{
  userId: "uuid",
  email: "string",
  iat: timestamp,
  exp: timestamp (7 days from issue)
}

Signing: HMAC-SHA256 with JWT_SECRET
```

#### **Auth Middleware** (auth.js):
```javascript
Function: Protect routes requiring authentication

Process:
1. Extract token from Authorization header (Bearer scheme)
2. Verify JWT signature and expiration
3. Attach decoded user data to request object (req.user)
4. Next() if valid, 401 response if invalid
5. Handle specific errors:
   - JsonWebTokenError → "Invalid token"
   - TokenExpiredError → "Token expired"
```

**Security Features**:
- Password requirements: 8+ chars, uppercase, lowercase, number
- Bcrypt salt rounds: 10 (2^10 = 1024 iterations)
- JWT expiration: 7 days (configurable via env)
- Token refresh endpoint to extend sessions
- Email normalization to prevent duplicates

**Database Schema Integration**:
```sql
users table:
- id (UUID, primary key)
- email (UNIQUE, NOT NULL)
- password_hash (TEXT, NOT NULL)
- display_name (VARCHAR(100))
- profile_image_url (TEXT)
- created_at, updated_at (TIMESTAMP)

user_streaks table:
- user_id (FK to users.id)
- current_streak (INTEGER, default 0)
- longest_streak (INTEGER, default 0)
- last_entry_date (DATE)
- updated_at (TIMESTAMP)
```

---

### 2. Journal Operations (journalController.js + journals.js)

**Purpose**: CRUD operations for journal entries with AI processing integration

**Key Operations**:

#### **Create Entry** (`POST /api/journals`):
```
Input:
- audio file (multipart/form-data)
- tagline (max 40 chars)
- gradient name
- transcript (from AI)
- analysis JSON (from AI)

Process:
1. Validate file (type, size ≤ 50MB)
2. Upload audio to S3 with AES256 encryption
3. Process with OpenAI if not provided:
   - transcribeAudio() → Get transcript + timestamps
   - analyzeJournalEntry() → Get insights
4. Insert journal_entries record
5. Batch insert action_items records
6. Batch insert audio_milestones records
7. Update user_streaks (check consecutive days)
8. Return entry with related records

Database Transaction:
BEGIN;
  INSERT INTO journal_entries;
  INSERT INTO action_items (multiple rows);
  INSERT INTO audio_milestones (multiple rows);
  UPDATE user_streaks;
COMMIT;
```

#### **Get Entries** (`GET /api/journals`):
```
Query Parameters:
- limit (default 20, max 100)
- offset (default 0)
- order (default 'desc', options: 'asc'/'desc')

Response:
- Array of entries with:
  - Basic info (id, tagline, duration, gradient)
  - Metadata (created_at, updated_at)
  - Presigned S3 URL (1-hour expiration)
  - Action items count
  - Milestones count
- Total count for pagination
```

#### **Get Single Entry** (`GET /api/journals/:id`):
```
Response:
- Full entry object
- All action items (with completion status)
- All milestones (with timestamps)
- Complete transcript
- Full analysis JSON
```

#### **Delete Entry** (`DELETE /api/journals/:id`):
```
Process:
1. Verify ownership (user_id match)
2. Delete audio from S3
3. Delete database record (cascade deletes action_items & milestones)
4. Return success confirmation
```

**Multer Configuration**:
```javascript
Storage: memoryStorage (buffer in RAM)
Limits: 50MB file size
Filter: Accept only audio MIME types
  - audio/mpeg
  - audio/mp4
  - audio/x-m4a
  - audio/wav
  - audio/webm
```

---

### 3. Insights Analytics (insightsController.js + insights.js)

**Purpose**: Aggregate and analyze journal data for meaningful insights

**Key Operations**:

#### **Weekly Summary** (`GET /api/insights/weekly-summary`):
```sql
Metrics Calculated:
1. Entry Count
   SELECT COUNT(*) FROM journal_entries
   WHERE created_at >= NOW() - INTERVAL '7 days'

2. Total & Average Duration
   SELECT SUM(duration), AVG(duration)

3. Sentiment Breakdown
   SELECT analysis->'sentiment'->>'overall', COUNT(*)
   GROUP BY sentiment

4. Top Themes
   SELECT theme->>'name', COUNT(*)
   FROM jsonb_array_elements(analysis->'themes')
   GROUP BY theme->>'name'
   ORDER BY COUNT(*) DESC LIMIT 5

5. Streak Information
   SELECT current_streak, longest_streak
   FROM user_streaks
```

Response Format:
```json
{
  "entryCount": 12,
  "totalMinutes": 54,
  "averageDuration": 4.5,
  "sentiment": {
    "overall": "Mostly Positive",
    "breakdown": {
      "positive": 8,
      "neutral": 3,
      "mixed": 1
    }
  },
  "topThemes": [
    {"name": "Work", "count": 5, "percentage": 42},
    {"name": "Relationships", "count": 3, "percentage": 25}
  ],
  "streak": 5,
  "longestStreak": 12
}
```

#### **Monthly Analytics** (`GET /api/insights/monthly-analytics`):
```
Parameters: year, month

Aggregations:
- Daily entry count
- Daily sentiment trend
- Theme distribution for entire month
- Action items completion rate
- Total minutes recorded
```

#### **Action Items Management**:
```
GET /api/insights/action-items
- Filter by completion status
- Order by: incomplete first, then by date

PUT /api/insights/action-items/:id/toggle
- Verify ownership
- Toggle completed boolean
- Set completed_at timestamp
- Return updated item
```

#### **Transcript Search** (`GET /api/insights/search`):
```sql
-- PostgreSQL Full-Text Search
SELECT 
  id,
  transcript,
  ts_rank(to_tsvector('english', transcript), 
          plainto_tsquery('english', $query)) as rank
FROM journal_entries
WHERE to_tsvector('english', transcript) @@ plainto_tsquery('english', $query)
ORDER BY rank DESC, created_at DESC
LIMIT 20
```

Features:
- Full-text search with ranking
- Excerpt extraction (50 chars before/after match)
- Date range filtering
- Relevance scoring

---

### 4. User Profile Management (userController.js + users.js)

**Purpose**: User account information and statistics

#### **Get Profile** (`GET /api/users/profile`):
```javascript
Returns:
{
  user: {
    id, email, displayName, profileImageUrl, createdAt
  },
  stats: {
    totalEntries: COUNT(*) FROM journal_entries,
    totalMinutes: SUM(duration),
    currentStreak: FROM user_streaks,
    longestStreak: FROM user_streaks
  }
}
```

#### **Update Profile** (`PUT /api/users/profile`):
```
Updatable Fields:
- display_name (VARCHAR 100)
- profile_image_url (TEXT)

Validation:
- At least one field required
- Automatic updated_at timestamp
```

#### **Get Statistics** (`GET /api/users/stats`):
```
Comprehensive Statistics:
1. Overall Stats
   - Total entries
   - Total & average duration
   - First/last entry dates

2. Streak Information
   - Current streak days
   - Longest streak days
   - Last entry date

3. Action Items
   - Total created
   - Total completed
   - Completion rate percentage

4. Top Themes (lifetime)
   - Name & count for top 10

5. Sentiment Distribution
   - Count by sentiment category
```

---

### 5. OpenAI Service (openaiService.js)

**Purpose**: Server-side AI processing for journal entries

**Architecture**:
```
Methods:
├── transcribeAudio(audioBuffer)
│   ├── Create FormData with buffer
│   ├── POST to Whisper API
│   ├── Model: whisper-1
│   ├── Response format: verbose_json
│   └── Return: { text, words: [{word, start, end}] }
│
├── analyzeJournalEntry(transcript)
│   ├── Build structured analysis prompt
│   ├── POST to GPT-4 API
│   ├── Model: gpt-4
│   ├── Temperature: 0.7 (balanced creativity)
│   ├── Max tokens: 2000
│   ├── Response format: json_object (enforced)
│   └── Return parsed JSON with validation
│
└── buildAnalysisPrompt(transcript)
    ├── System message: Role definition
    ├── User message: Transcript + instructions
    └── JSON schema: Strict structure enforcement
```

**Whisper API Configuration**:
```javascript
{
  model: 'whisper-1',
  file: audioBuffer,
  response_format: 'verbose_json',
  timestamp_granularities: ['word'],
  language: 'en' // Optional, auto-detect if omitted
}
```

**GPT-4 API Configuration**:
```javascript
{
  model: 'gpt-4',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.7,
  max_tokens: 2000,
  response_format: { type: 'json_object' }
}
```

**Cost Optimization**:
```
Per Entry Cost (average 3-minute recording):
- Whisper: $0.006 per minute → $0.018
- GPT-4: ~500 tokens in + 1500 out → $0.05
- Total: ~$0.068 per entry

Monthly Cost (30 entries): ~$2.04
```

---

### 6. S3 Storage Service (s3Service.js)

**Purpose**: Secure audio file storage in AWS S3

**Operations**:

#### **Upload Audio**:
```javascript
Function: uploadAudio(buffer, filename, mimeType)

S3 PutObject Parameters:
{
  Bucket: AWS_S3_BUCKET,
  Key: `audio/${userId}/${uuid}-${filename}`,
  Body: buffer,
  ContentType: mimeType,
  ServerSideEncryption: 'AES256',
  CacheControl: 'max-age=31536000', // 1 year
  Metadata: {
    userId: string,
    uploadDate: ISO8601
  }
}

Returns: S3 URL (s3://bucket/key)
```

#### **Download Audio**:
```javascript
Function: downloadAudio(s3Url)

Process:
1. Parse S3 URL to extract bucket & key
2. Call S3.getObject()
3. Return buffer for processing

Use Cases:
- Reprocessing entries with updated AI
- Downloading for offline access
- Backup operations
```

#### **Get Signed URL**:
```javascript
Function: getSignedUrl(s3Url, expiresIn = 3600)

Purpose: Temporary authenticated access without exposing credentials

Parameters:
- expiresIn: Seconds until expiration (default 1 hour)

Returns: Presigned URL valid for specified duration

Security:
- URL includes signature verification
- Cannot be modified without invalidation
- Automatic expiration
```

#### **Delete Audio**:
```javascript
Function: deleteAudio(s3Url)

Process:
1. Extract key from URL
2. Call S3.deleteObject()
3. Return confirmation

Called During:
- Journal entry deletion
- User account deletion (cascade)
```

**S3 Configuration**:
```javascript
Region: process.env.AWS_REGION
Bucket: process.env.AWS_S3_BUCKET
Credentials: 
  - Access Key ID: process.env.AWS_ACCESS_KEY_ID
  - Secret Access Key: process.env.AWS_SECRET_ACCESS_KEY

Security:
- Encryption at rest: AES256
- Encryption in transit: TLS 1.2+
- IAM policy: Least privilege access
- Bucket policy: No public access
```

---

### 7. Database Layer (db.js + schema.sql)

**Purpose**: PostgreSQL connection management and schema definition

**Connection Pooling**:
```javascript
Configuration:
- connectionString: DATABASE_URL from environment
- max: 20 connections (adjustable for scale)
- idleTimeoutMillis: 30000 (30 seconds)
- connectionTimeoutMillis: 5000 (5 seconds)

SSL:
- Production: { rejectUnauthorized: false }
- Development: false

Helper Methods:
- query(text, params) → Execute SQL with parameter binding
- getClient() → Checkout connection from pool
- end() → Gracefully close all connections
```

**Database Schema** (5 tables):

#### **1. users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(100),
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

Indexes:
- PRIMARY KEY on id
- UNIQUE INDEX on email
```

#### **2. journal_entries**
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration DECIMAL(10,2) NOT NULL, -- seconds
  tagline VARCHAR(40),
  gradient VARCHAR(50),
  transcript TEXT,
  analysis JSONB, -- Flexible JSON storage
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

Indexes:
- PRIMARY KEY on id
- INDEX on user_id (frequent filtering)
- INDEX on created_at (sorting/range queries)

JSONB Structure:
{
  "actionItems": [...],
  "milestones": [...],
  "sentiment": {...},
  "themes": [...]
}
```

#### **3. action_items**
```sql
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  priority VARCHAR(10) CHECK (priority IN ('high','medium','low')),
  excerpt TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

Indexes:
- PRIMARY KEY on id
- INDEX on entry_id (join performance)
- INDEX on completed (filtering)
```

#### **4. audio_milestones**
```sql
CREATE TABLE audio_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('insight','goal','emotion')),
  description TEXT NOT NULL,
  excerpt TEXT,
  timestamp VARCHAR(10), -- MM:SS format
  created_at TIMESTAMP DEFAULT NOW()
);

Indexes:
- PRIMARY KEY on id
- INDEX on entry_id (join performance)
- INDEX on type (filtering by category)
```

#### **5. user_streaks**
```sql
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_entry_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

Indexes:
- PRIMARY KEY on user_id (1:1 relationship)
```

**Database Triggers**:
```sql
-- Automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Data Flow Architecture

### Complete Entry Creation Flow

```
Mobile App                    Backend API                  External Services
-----------                   -----------                  -----------------

1. User Records Audio
   ↓
2. Stop Recording
   ↓
3. Navigate to PostRecordingScreen
   ↓
4. AIService.processJournalEntry()
   ↓
   ├─→ transcribeAudio(audioPath) ────────→ OpenAI Whisper API
   │                                            ↓
   │                                     Returns transcript + timestamps
   │                                            ↓
   ├─→ analyzeJournalEntry(transcript) ───────→ OpenAI GPT-4 API
   │                                            ↓
   │                                     Returns JSON analysis
   │                                            ↓
   └─→ addTimestampsToMilestones()
       ↓
   Returns: {transcript, insights}
   
5. Display Results + Allow Customization
   ↓
6. User Saves Entry
   ↓
7. POST /api/journals
   FormData: {
     audio: File,
     tagline: String,
     gradient: String,
     transcript: String,
     analysis: JSON
   }
   ────────────────────────────────────→ journalController.createEntry()
                                             ↓
                                         s3Service.uploadAudio() ─→ AWS S3
                                             ↓                        (Store audio)
                                         Database Transaction:
                                         BEGIN;
                                           INSERT journal_entries
                                           INSERT action_items (bulk)
                                           INSERT audio_milestones (bulk)
                                           UPDATE user_streaks
                                         COMMIT;
                                             ↓
                                         Returns: {success, entry}
   ←────────────────────────────────────
8. Navigate to HomeScreen
   ↓
9. Refresh Entry List
```

### Insights Dashboard Data Flow

```
Mobile App                    Backend API                  Database
-----------                   -----------                  ---------

1. InsightsDashboardScreen Mount
   ↓
2. loadInsightsData()
   ↓
   ├─→ GET /api/insights/weekly-summary ────→ insightsController
   │                                              ↓
   │                                          4 SQL Queries:
   │                                          - Entry count/duration
   │                                          - Sentiment breakdown
   │                                          - Top themes
   │                                          - Streak info
   │   ←──────────────────────────────────
   │
   ├─→ GET /api/insights/action-items ───────→ insightsController
   │                                              ↓
   │                                          SELECT with JOIN
   │   ←──────────────────────────────────
   │
   └─→ GET /api/insights/milestones ──────────→ insightsController
                                                  ↓
                                              SELECT with filtering
       ←──────────────────────────────────

3. Render Dashboard Components
   ↓
4. User Toggles Action Item
   ↓
5. Optimistic UI Update (checkbox animates)
   ↓
6. PUT /api/insights/action-items/:id/toggle ─→ insightsController
                                                  ↓
                                              UPDATE action_items
                                              SET completed = !completed
       ←──────────────────────────────────
7. Confirm State Update
```

---

## Integration Points

### 1. Mobile ↔ Backend API
```
Authentication:
- All requests include: Authorization: Bearer <JWT>
- Token validated by auth middleware
- User ID extracted for query filtering

Endpoints Used by Mobile:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/journals
- POST /api/journals (with multipart file)
- GET /api/journals/:id
- DELETE /api/journals/:id
- GET /api/insights/weekly-summary
- GET /api/insights/action-items
- PUT /api/insights/action-items/:id/toggle
- GET /api/insights/milestones
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/audio/signed-url/:entryId
```

### 2. Backend ↔ OpenAI APIs
```
Whisper API:
- Endpoint: https://api.openai.com/v1/audio/transcriptions
- Method: POST
- Content-Type: multipart/form-data
- Authentication: Bearer <OPENAI_API_KEY>
- Rate Limit: 50 requests/minute (adjustable)

GPT-4 API:
- Endpoint: https://api.openai.com/v1/chat/completions
- Method: POST
- Content-Type: application/json
- Authentication: Bearer <OPENAI_API_KEY>
- Rate Limit: 10,000 tokens/minute (tier-based)
```

### 3. Backend ↔ AWS S3
```
Operations:
- PutObject: Upload audio files
- GetObject: Download for reprocessing
- DeleteObject: Remove on entry deletion
- GetSignedUrl: Generate temporary access URLs

Authentication:
- AWS Access Key ID + Secret Access Key
- IAM role with limited permissions:
  - s3:PutObject
  - s3:GetObject
  - s3:DeleteObject
  - s3:GetObjectAcl

Bucket Policy:
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:*",
  "Resource": "arn:aws:s3:::bucket/*",
  "Condition": {
    "Bool": {
      "aws:SecureTransport": "false"
    }
  }
}
```

### 4. Backend ↔ PostgreSQL
```
Connection:
- URL: postgres://user:password@host:port/database
- SSL: Required in production
- Pool size: 20 connections

Query Patterns:
- Prepared statements for security (SQL injection prevention)
- Transactions for multi-table operations
- Indexes on foreign keys and filter columns
- JSONB for flexible schema evolution
```

---

## Performance Considerations

### Mobile App Optimization:
1. **Lazy Loading**: Recent entries paginated (20 per page)
2. **Image Caching**: React Native Fast Image for avatars
3. **Animation**: Native driver for 60fps
4. **Memory Management**: Audio files cleared after upload
5. **API Caching**: Weekly summary cached for 5 minutes

### Backend Optimization:
1. **Database Connection Pooling**: Reuse connections
2. **Query Optimization**: Strategic indexes on filter/join columns
3. **Rate Limiting**: Prevent API abuse (100 req/15min per user)
4. **S3 Presigned URLs**: Offload file serving from backend
5. **JSONB Indexing**: GIN indexes for fast JSON queries

### Cost Optimization:
1. **OpenAI Usage**:
   - Cache transcripts (avoid re-processing)
   - Batch analysis when possible
   - Use GPT-3.5-turbo for summaries (cheaper)

2. **AWS S3**:
   - Lifecycle policies (archive old entries to Glacier)
   - Compression for audio files
   - CDN for frequent access files

3. **Database**:
   - Archive old entries to cold storage
   - Regular VACUUM and ANALYZE
   - Partitioning for large tables

---

## Security Best Practices

### Authentication & Authorization:
- Bcrypt password hashing (10 salt rounds)
- JWT tokens with expiration (7 days)
- Refresh token rotation
- Secure HTTP-only cookies for web
- OAuth integration ready (future)

### Data Protection:
- TLS 1.2+ for all API communication
- S3 encryption at rest (AES256)
- Database encryption at rest
- Sensitive data in environment variables (never in code)
- Input validation with express-validator

### API Security:
- Rate limiting (100 requests/15min)
- Helmet.js security headers
- CORS configuration (whitelist origins)
- Content-Type validation
- File type and size restrictions

### Privacy:
- User data isolation (queries filtered by user_id)
- Cascade deletes (complete data removal)
- Audit logs for sensitive operations
- GDPR compliance (data export/deletion endpoints)
- Privacy policy and terms of service

---

## Testing Strategy

### Mobile Tests (Jest + React Native Testing Library):
```javascript
HomeScreen.test.js:
- Recording button tap initiates recording
- Permission denied shows error message
- Recent entries load on mount
- Navigation to PostRecording with correct params

AIService.test.js:
- transcribeAudio returns valid transcript
- analyzeJournalEntry returns structured JSON
- Error handling for API failures
- Timestamp matching algorithm accuracy
```

### Backend Tests (Jest + Supertest):
```javascript
auth.test.js:
- Registration creates user and returns token
- Login with valid credentials succeeds
- Login with invalid credentials fails
- Token verification middleware protects routes

journals.test.js:
- POST /api/journals creates entry with relations
- GET /api/journals returns paginated results
- DELETE /api/journals removes S3 file and DB record
- Ownership verification prevents unauthorized access

insights.test.js:
- Weekly summary calculates correct metrics
- Action item toggle updates completion status
- Search returns relevant results with ranking
```

### Integration Tests:
```javascript
Full Flow:
1. Register user → Login → Receive token
2. Upload audio → AI processing → Save entry
3. Fetch insights → Toggle action item → Verify update
4. Delete entry → Confirm S3 and DB cleanup
```

---

## Deployment Guide

### Mobile App (React Native):
```bash
iOS:
1. cd mobile/ios && pod install
2. Open Echo.xcworkspace in Xcode
3. Configure signing & capabilities
4. Archive & upload to App Store Connect
5. TestFlight distribution for beta testing

Android:
1. cd mobile/android
2. ./gradlew assembleRelease
3. Sign APK with keystore
4. Upload to Google Play Console
5. Internal testing → Production rollout
```

### Backend (Node.js + PostgreSQL):
```bash
Option 1: Traditional VPS (DigitalOcean, AWS EC2):
1. Provision Ubuntu 22.04 server
2. Install Node.js 18+, PostgreSQL 14+, Nginx
3. Clone repository
4. npm install --production
5. Configure environment variables
6. Set up PM2 for process management
7. Nginx reverse proxy for SSL (Let's Encrypt)
8. Database migrations: npm run migrate

Option 2: Container (Docker):
1. Build image: docker build -t echo-backend .
2. Push to registry: docker push registry/echo-backend
3. Deploy to Kubernetes/ECS/Cloud Run
4. Configure secrets and environment variables
5. Set up database connection (RDS/Cloud SQL)
6. Auto-scaling policies

Option 3: Serverless (AWS Lambda + API Gateway):
1. Install Serverless Framework
2. Configure serverless.yml
3. Deploy: serverless deploy
4. Use Aurora Serverless for database
5. S3 for audio storage
6. CloudFront for CDN
```

### Environment Variables:
```bash
# Backend .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://...
JWT_SECRET=your-secret-key (min 32 chars)
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
AWS_REGION=us-east-1
AWS_S3_BUCKET=echo-audio-prod
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
CORS_ORIGIN=https://echo.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## Future Enhancements

### Phase 2 Features:
1. **Social Features**:
   - Friend connections
   - Shared journals (with privacy controls)
   - Community challenges

2. **Advanced Analytics**:
   - Mood tracking over time (trend graphs)
   - Correlation analysis (sleep, exercise, mood)
   - Personalized insights with ML

3. **Premium Features**:
   - Unlimited entries
   - Advanced AI models (GPT-4 Turbo)
   - Custom themes and soundscapes
   - Export to PDF/audio formats

4. **Integrations**:
   - Google Calendar (schedule reflections)
   - Spotify (mood-based playlists)
   - Notion/Evernote (export insights)

5. **Accessibility**:
   - Multiple language support (i18n)
   - Screen reader optimization
   - High contrast themes
   - Voice commands

---

## Conclusion

The Echo application is built with a robust, scalable architecture that separates concerns between mobile frontend, backend API, and external services. Each component is designed with security, performance, and user experience in mind.

**Key Strengths**:
- ✅ Clean separation of concerns (mobile/backend/services)
- ✅ Comprehensive error handling and validation
- ✅ Security-first approach (auth, encryption, rate limiting)
- ✅ Scalable database schema with JSONB flexibility
- ✅ Beautiful UI with consistent design system
- ✅ AI-powered insights with structured prompts
- ✅ Production-ready with monitoring and logging

**Next Steps**:
1. Initialize development environment
2. Run database migrations
3. Configure API keys (OpenAI, AWS)
4. Start mobile app with `npm start`
5. Start backend with `npm run dev`
6. Test core flows end-to-end
7. Deploy to staging environment
8. User acceptance testing
9. Production rollout with gradual ramp-up
10. Monitor metrics and iterate

For questions or issues, refer to:
- README.md (setup instructions)
- docs/api-documentation.md (API reference)
- docs/ai-prompts.md (AI integration guide)
- PROJECT_SUMMARY.md (deliverables checklist)
