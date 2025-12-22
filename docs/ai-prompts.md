# AI Prompts Documentation - Echo App

This document contains the exact API prompts and expected responses for the Echo application's AI features.

---

## Overview

Echo uses two primary OpenAI services:
1. **Whisper API** - For speech-to-text transcription
2. **GPT-4 API** - For natural language analysis and insight extraction

---

## 1. Whisper API - Audio Transcription

### Endpoint
```
POST https://api.openai.com/v1/audio/transcriptions
```

### Request Format

```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('model', 'whisper-1');
formData.append('language', 'en'); // Optional
formData.append('timestamp_granularities[]', 'word'); // For milestone timestamps
formData.append('response_format', 'verbose_json');
```

### Headers
```javascript
{
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'multipart/form-data'
}
```

### Response Example

```json
{
  "text": "Today was a productive day. I finally finished the project proposal that I've been working on for weeks. I feel a sense of accomplishment, but also a bit anxious about the presentation tomorrow. I need to remember to breathe and trust in my preparation. Tomorrow morning, I should review the slides one more time and maybe practice in front of the mirror. I also want to call my mom this weekend, it's been too long since we talked.",
  "duration": 34.5,
  "language": "en",
  "words": [
    { "word": "Today", "start": 0.0, "end": 0.3 },
    { "word": "was", "start": 0.3, "end": 0.5 },
    { "word": "a", "start": 0.5, "end": 0.6 },
    { "word": "productive", "start": 0.6, "end": 1.1 },
    { "word": "day", "start": 1.1, "end": 1.4 },
    ...
  ]
}
```

---

## 2. GPT-4 API - Journal Entry Analysis

### Endpoint
```
POST https://api.openai.com/v1/chat/completions
```

### System Prompt

```
You are an AI assistant specialized in analyzing personal journal entries. You help users extract actionable insights, identify key moments, and understand emotional patterns in their reflections. Always respond with valid JSON in the exact format requested.
```

### User Prompt Template

```
Analyze the following personal journal entry transcript and provide structured insights in JSON format.

Journal Entry Transcript:
"{TRANSCRIPT_TEXT}"

Please analyze this entry and return a JSON object with the following structure:

{
  "actionItems": [
    {
      "task": "string - the actionable task mentioned",
      "priority": "string - high, medium, or low",
      "context": "string - relevant context or notes"
    }
  ],
  "audioMilestones": [
    {
      "type": "string - insight, goal, or emotion",
      "description": "string - brief summary of the milestone",
      "excerpt": "string - relevant quote from the transcript (keep it short, 10-20 words)",
      "significance": "string - why this moment is important"
    }
  ],
  "sentiment": {
    "overall": "string - positive, negative, neutral, or mixed",
    "confidence": "number - 0 to 1",
    "emotionalTone": "string - describe the emotional tone in 2-3 words"
  },
  "themes": [
    {
      "name": "string - theme name (e.g., work, relationships, health)",
      "relevance": "number - 0 to 1, how prominent this theme is",
      "keywords": ["array of relevant keywords"]
    }
  ],
  "summary": "string - a one-sentence summary of the entry"
}

Guidelines:
1. **Action Items**: Only extract clear, actionable tasks. Don't create tasks if none are mentioned.
2. **Audio Milestones**: Identify moments of insight (💡), goal-setting (🎯), or strong emotion (❤️). Limit to 3-5 most significant moments.
3. **Sentiment**: Be nuanced in your analysis. Consider subtle emotions and mixed feelings.
4. **Themes**: Categorize into common life areas. Limit to top 3-5 themes.
5. **Summary**: Capture the essence in one clear sentence.
6. **Excerpts**: Keep quotes brief and impactful. They should be exact quotes from the transcript.

Return ONLY the JSON object, no additional text or markdown formatting.
```

### Request Body

```json
{
  "model": "gpt-4-turbo-preview",
  "messages": [
    {
      "role": "system",
      "content": "You are an AI assistant specialized in analyzing personal journal entries..."
    },
    {
      "role": "user",
      "content": "Analyze the following personal journal entry transcript..."
    }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### Headers
```javascript
{
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}
```

---

## 3. Expected Response Examples

### Example 1: Productive Work Day

**Sample Transcript:**
```
"Today was a productive day. I finally finished the project proposal that I've been working on for weeks. I feel a sense of accomplishment, but also a bit anxious about the presentation tomorrow. I need to remember to breathe and trust in my preparation. Tomorrow morning, I should review the slides one more time and maybe practice in front of the mirror. I also want to call my mom this weekend, it's been too long since we talked."
```

**Expected GPT-4 Response:**

```json
{
  "actionItems": [
    {
      "task": "Review presentation slides",
      "priority": "high",
      "context": "Final review before tomorrow's presentation"
    },
    {
      "task": "Practice presentation in front of mirror",
      "priority": "high",
      "context": "Prepare for tomorrow's presentation"
    },
    {
      "task": "Call mom this weekend",
      "priority": "medium",
      "context": "Haven't talked in a while, need to reconnect"
    }
  ],
  "audioMilestones": [
    {
      "type": "insight",
      "description": "Recognizing the need for self-calming strategies",
      "excerpt": "I need to remember to breathe and trust in my preparation",
      "significance": "Shows self-awareness and emotional regulation strategies"
    },
    {
      "type": "emotion",
      "description": "Mixed feelings of accomplishment and anxiety",
      "excerpt": "I feel a sense of accomplishment, but also a bit anxious",
      "significance": "Complex emotional state around professional achievement"
    },
    {
      "type": "goal",
      "description": "Commitment to family connection",
      "excerpt": "I want to call my mom this weekend",
      "significance": "Recognition of the importance of family relationships"
    }
  ],
  "sentiment": {
    "overall": "mixed",
    "confidence": 0.85,
    "emotionalTone": "accomplished yet anxious"
  },
  "themes": [
    {
      "name": "work",
      "relevance": 0.8,
      "keywords": ["project", "proposal", "presentation", "productive"]
    },
    {
      "name": "relationships",
      "relevance": 0.5,
      "keywords": ["mom", "call", "family"]
    },
    {
      "name": "mental-health",
      "relevance": 0.6,
      "keywords": ["anxious", "breathe", "preparation", "accomplishment"]
    }
  ],
  "summary": "A productive day completing a project proposal, feeling accomplished yet anxious about tomorrow's presentation, with reminders for preparation and family connection."
}
```

---

### Example 2: Reflective Evening Entry

**Sample Transcript:**
```
"I've been thinking a lot about my career lately. I'm not sure if I'm on the right path. Sometimes I wonder if I should have pursued design instead of engineering. But then I remember why I chose this field in the first place. I love solving complex problems. I just wish I had more creative freedom in my current role. Maybe I should start looking for new opportunities, or perhaps I could propose a new project to my manager. Either way, I need to make a change."
```

**Expected GPT-4 Response:**

```json
{
  "actionItems": [
    {
      "task": "Research new job opportunities",
      "priority": "medium",
      "context": "Exploring options for more creative freedom"
    },
    {
      "task": "Prepare project proposal for manager",
      "priority": "medium",
      "context": "Alternative to job change, seeking creative freedom in current role"
    }
  ],
  "audioMilestones": [
    {
      "type": "insight",
      "description": "Reconnecting with core passion",
      "excerpt": "I remember why I chose this field, I love solving complex problems",
      "significance": "Rediscovering intrinsic motivation despite current dissatisfaction"
    },
    {
      "type": "emotion",
      "description": "Career uncertainty and self-doubt",
      "excerpt": "I'm not sure if I'm on the right path",
      "significance": "Expressing vulnerability and questioning life choices"
    },
    {
      "type": "goal",
      "description": "Commitment to making a change",
      "excerpt": "I need to make a change",
      "significance": "Decisive moment recognizing the need for action"
    }
  ],
  "sentiment": {
    "overall": "mixed",
    "confidence": 0.75,
    "emotionalTone": "reflective and uncertain"
  },
  "themes": [
    {
      "name": "career",
      "relevance": 0.95,
      "keywords": ["career", "path", "engineering", "design", "role", "opportunities"]
    },
    {
      "name": "self-discovery",
      "relevance": 0.7,
      "keywords": ["thinking", "wonder", "remember", "chose"]
    },
    {
      "name": "work",
      "relevance": 0.8,
      "keywords": ["manager", "project", "role", "creative freedom"]
    }
  ],
  "summary": "Deep reflection on career satisfaction, questioning the current path while reconnecting with core motivations, and recognizing the need for change through new opportunities or internal proposals."
}
```

---

### Example 3: Personal Growth Moment

**Sample Transcript:**
```
"I had a really tough conversation with my friend today. We've been growing apart, and I finally had the courage to address it. It was uncomfortable, but necessary. I realized that I've been avoiding difficult conversations for too long. This is something I want to work on. I want to be more direct and honest in my relationships. It's scary, but I think it's the right thing to do. I'm proud of myself for taking this step."
```

**Expected GPT-4 Response:**

```json
{
  "actionItems": [
    {
      "task": "Practice being more direct in relationships",
      "priority": "medium",
      "context": "Personal growth goal around communication"
    }
  ],
  "audioMilestones": [
    {
      "type": "insight",
      "description": "Pattern recognition in conflict avoidance",
      "excerpt": "I realized that I've been avoiding difficult conversations for too long",
      "significance": "Major self-awareness breakthrough about communication patterns"
    },
    {
      "type": "goal",
      "description": "Commitment to authentic communication",
      "excerpt": "I want to be more direct and honest in my relationships",
      "significance": "Clear personal development goal with long-term impact"
    },
    {
      "type": "emotion",
      "description": "Pride in personal courage",
      "excerpt": "I'm proud of myself for taking this step",
      "significance": "Positive self-recognition and validation of growth"
    }
  ],
  "sentiment": {
    "overall": "positive",
    "confidence": 0.9,
    "emotionalTone": "proud and empowered"
  },
  "themes": [
    {
      "name": "relationships",
      "relevance": 0.9,
      "keywords": ["friend", "conversation", "honest", "direct", "relationships"]
    },
    {
      "name": "personal-growth",
      "relevance": 0.95,
      "keywords": ["courage", "realized", "work on", "growth", "proud"]
    },
    {
      "name": "communication",
      "relevance": 0.85,
      "keywords": ["conversation", "address", "direct", "honest", "uncomfortable"]
    }
  ],
  "summary": "A breakthrough moment of personal growth after having a difficult but necessary conversation, recognizing patterns of avoidance, and committing to more authentic communication."
}
```

---

## 4. Integration Flow

### Complete Processing Pipeline

```javascript
// 1. User records audio
const audioFile = await recordAudio();

// 2. Upload to backend
const uploadResponse = await uploadAudio(audioFile);

// 3. Transcribe with Whisper
const transcription = await whisperAPI.transcribe({
  file: uploadResponse.url,
  model: 'whisper-1',
  timestamp_granularities: ['word'],
  response_format: 'verbose_json'
});

// 4. Analyze with GPT-4
const analysis = await gpt4API.analyze({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildPrompt(transcription.text) }
  ],
  response_format: { type: 'json_object' }
});

// 5. Enhance milestones with timestamps
const enhancedAnalysis = addTimestamps(
  analysis.audioMilestones,
  transcription.words
);

// 6. Save to database
await saveJournalEntry({
  userId,
  audioUrl: uploadResponse.url,
  transcript: transcription.text,
  duration: transcription.duration,
  analysis: enhancedAnalysis,
  timestamp: new Date()
});

// 7. Return to client
return {
  success: true,
  transcript: transcription.text,
  analysis: enhancedAnalysis
};
```

---

## 5. Error Handling

### Common Errors and Responses

**Transcription Errors:**
```json
{
  "success": false,
  "error": "transcription_failed",
  "message": "Audio file could not be transcribed",
  "details": {
    "code": "invalid_audio_format",
    "supportedFormats": ["m4a", "mp3", "mp4", "wav", "webm"]
  }
}
```

**Analysis Errors:**
```json
{
  "success": false,
  "error": "analysis_failed",
  "message": "Could not analyze transcript",
  "transcript": "...", // Still return transcript even if analysis fails
  "details": {
    "code": "invalid_json_response",
    "rawResponse": "..."
  }
}
```

---

## 6. Cost Optimization Tips

1. **Whisper API**: ~$0.006 per minute of audio
   - Average 3-minute entry = $0.018
   - 1000 entries = $18

2. **GPT-4 API**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
   - Average transcript (500 words) ≈ 650 tokens input
   - Average analysis ≈ 500 tokens output
   - Cost per entry ≈ $0.05
   - 1000 entries = $50

3. **Total**: ~$0.068 per journal entry

**Optimization Strategies:**
- Cache transcriptions to avoid re-processing
- Use GPT-3.5-turbo for simpler analyses ($10x cheaper)
- Implement user-based rate limiting
- Offer premium tier for unlimited AI processing

---

## 7. Testing & Validation

### Sample Test Cases

```javascript
// Test Case 1: Empty/Silent Audio
expect(transcription).toHaveProperty('text');
expect(transcription.text.length).toBeGreaterThan(0);

// Test Case 2: Valid JSON Response
const analysis = JSON.parse(response);
expect(analysis).toHaveProperty('actionItems');
expect(analysis).toHaveProperty('audioMilestones');
expect(analysis).toHaveProperty('sentiment');
expect(analysis).toHaveProperty('themes');

// Test Case 3: Timestamp Accuracy
const milestone = analysis.audioMilestones[0];
expect(milestone.timestamp).toMatch(/^\d+:\d{2}$/);
expect(milestone.timestampSeconds).toBeGreaterThanOrEqual(0);

// Test Case 4: No Action Items
const noActionAnalysis = await analyze("Just reflecting on my day.");
expect(noActionAnalysis.actionItems).toHaveLength(0);
```

---

## 8. Privacy & Security Considerations

1. **Data Encryption**: Encrypt audio files at rest and in transit
2. **Anonymization**: Remove personally identifiable information before analysis
3. **Retention**: Delete audio files after transcription (optional user setting)
4. **Opt-out**: Allow users to disable AI analysis
5. **Local Processing**: Consider on-device transcription for premium privacy

---

This documentation provides the complete specification for integrating OpenAI's APIs into the Echo application. All prompts are production-ready and optimized for consistent, high-quality results.
