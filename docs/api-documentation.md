# Echo API Documentation

Base URL: `http://localhost:3000/api`

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

---

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

---

### Journal Entries

#### Create Journal Entry
```http
POST /api/journals
```

**Authentication:** Required

**Request:** Multipart Form Data
```
audio: <audio file> (required)
tagline: "A moment of clarity" (optional, max 40 chars)
gradient: "default" (optional)
```

**Response:** (201 Created)
```json
{
  "success": true,
  "entry": {
    "id": 1,
    "userId": 1,
    "audioUrl": "https://s3.amazonaws.com/...",
    "tagline": "A moment of clarity",
    "gradient": "default",
    "transcript": "Today was a productive day...",
    "duration": 34.5,
    "analysis": {
      "actionItems": [...],
      "audioMilestones": [...],
      "sentiment": {...},
      "themes": [...],
      "summary": "..."
    },
    "createdAt": "2025-11-25T15:42:00Z"
  },
  "transcript": "Today was a productive day...",
  "analysis": {...}
}
```

---

#### Get All Entries
```http
GET /api/journals?limit=50&offset=0&order=DESC
```

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `order` (optional): Sort order - ASC or DESC (default: DESC)

**Response:** (200 OK)
```json
{
  "success": true,
  "entries": [
    {
      "id": 1,
      "userId": 1,
      "audioUrl": "https://...",
      "tagline": "A moment of clarity",
      "gradient": "default",
      "transcript": "...",
      "duration": 34.5,
      "createdAt": "2025-11-25T15:42:00Z"
    }
  ],
  "count": 5
}
```

---

#### Get Single Entry
```http
GET /api/journals/:id
```

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "success": true,
  "entry": {
    "id": 1,
    "userId": 1,
    "audioUrl": "https://...",
    "tagline": "A moment of clarity",
    "gradient": "default",
    "transcript": "...",
    "duration": 34.5,
    "analysis": {...},
    "createdAt": "2025-11-25T15:42:00Z"
  },
  "actionItems": [
    {
      "id": 1,
      "entryId": 1,
      "task": "Review project proposal",
      "priority": "high",
      "context": "...",
      "completed": false,
      "createdAt": "2025-11-25T15:42:00Z"
    }
  ],
  "milestones": [
    {
      "id": 1,
      "entryId": 1,
      "type": "insight",
      "description": "...",
      "excerpt": "...",
      "significance": "...",
      "timestamp": "0:34",
      "createdAt": "2025-11-25T15:42:00Z"
    }
  ]
}
```

---

#### Update Entry
```http
PUT /api/journals/:id
```

**Authentication:** Required

**Request Body:**
```json
{
  "tagline": "New tagline",
  "gradient": "sunset"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "entry": {
    "id": 1,
    "tagline": "New tagline",
    "gradient": "sunset",
    "updatedAt": "2025-11-25T16:00:00Z"
  }
}
```

---

#### Delete Entry
```http
DELETE /api/journals/:id
```

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Journal entry deleted successfully"
}
```

---

#### Process Entry (Manual AI Processing)
```http
POST /api/journals/:id/process
```

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "success": true,
  "transcript": "...",
  "analysis": {
    "actionItems": [...],
    "audioMilestones": [...],
    "sentiment": {...},
    "themes": [...]
  }
}
```

---

### Insights

#### Get Action Items
```http
GET /api/insights/action-items?completed=false
```

**Authentication:** Required

**Query Parameters:**
- `completed` (optional): Filter by completion status (true/false)

**Response:** (200 OK)
```json
{
  "success": true,
  "actionItems": [
    {
      "id": 1,
      "entryId": 1,
      "task": "Review project proposal",
      "priority": "high",
      "context": "Final review before tomorrow's presentation",
      "completed": false,
      "createdAt": "2025-11-25T15:42:00Z"
    }
  ]
}
```

---

#### Toggle Action Item Completion
```http
PUT /api/insights/action-items/:id/toggle
```

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "success": true,
  "actionItem": {
    "id": 1,
    "completed": true,
    "completedAt": "2025-11-25T16:30:00Z"
  }
}
```

---

#### Get Milestones
```http
GET /api/insights/milestones?type=insight&limit=20
```

**Authentication:** Required

**Query Parameters:**
- `type` (optional): Filter by type (insight, goal, emotion)
- `limit` (optional): Number of results (default: 20)

**Response:** (200 OK)
```json
{
  "success": true,
  "milestones": [
    {
      "id": 1,
      "entryId": 1,
      "type": "insight",
      "description": "Recognizing need for work-life balance",
      "excerpt": "I need to prioritize my mental health...",
      "significance": "Important moment of self-awareness",
      "timestamp": "0:34",
      "createdAt": "2025-11-25T15:42:00Z"
    }
  ]
}
```

---

#### Get Weekly Summary
```http
GET /api/insights/weekly-summary
```

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "success": true,
  "summary": {
    "entryCount": 5,
    "totalMinutes": 23,
    "averageDuration": 4.6,
    "sentiment": {
      "overall": "Mostly Positive",
      "breakdown": {
        "positive": 3,
        "neutral": 1,
        "mixed": 1
      }
    },
    "topThemes": [
      {
        "name": "work",
        "count": 4,
        "percentage": 45
      },
      {
        "name": "relationships",
        "count": 3,
        "percentage": 30
      }
    ],
    "streak": 5,
    "longestStreak": 12
  }
}
```

---

#### Get Monthly Analytics
```http
GET /api/insights/monthly-analytics?year=2025&month=11
```

**Authentication:** Required

**Query Parameters:**
- `year` (required): Year (YYYY)
- `month` (required): Month (1-12)

**Response:** (200 OK)
```json
{
  "success": true,
  "analytics": {
    "entryCount": 22,
    "totalMinutes": 98,
    "sentimentTrend": [
      { "date": "2025-11-01", "sentiment": "positive" },
      { "date": "2025-11-02", "sentiment": "mixed" }
    ],
    "themeDistribution": {
      "work": 35,
      "relationships": 28,
      "health": 20,
      "personal-growth": 17
    },
    "completedActionItems": 15,
    "totalActionItems": 23
  }
}
```

---

#### Search Transcripts
```http
GET /api/insights/search?q=project&startDate=2025-11-01&endDate=2025-11-30
```

**Authentication:** Required

**Query Parameters:**
- `q` (required): Search query
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Response:** (200 OK)
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "entryId": 1,
      "excerpt": "...finished the project proposal...",
      "matchScore": 0.95,
      "createdAt": "2025-11-25T15:42:00Z"
    }
  ],
  "count": 3
}
```

---

### User

#### Get User Profile
```http
GET /api/users/profile
```

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe",
    "profileImageUrl": "https://...",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "stats": {
    "totalEntries": 45,
    "totalMinutes": 198,
    "currentStreak": 5,
    "longestStreak": 12
  }
}
```

---

#### Update User Profile
```http
PUT /api/users/profile
```

**Authentication:** Required

**Request Body:**
```json
{
  "displayName": "Jane Doe",
  "profileImageUrl": "https://..."
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "user": {
    "id": 1,
    "displayName": "Jane Doe",
    "profileImageUrl": "https://...",
    "updatedAt": "2025-11-25T16:00:00Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Journal entry not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address.

When rate limit is exceeded:

```json
{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Audio File Specifications

**Supported Formats:**
- M4A (recommended)
- MP3
- MP4
- WAV
- WEBM

**Maximum File Size:** 50MB

**Recommended Quality:**
- Sample Rate: 44.1kHz or 48kHz
- Bit Rate: 128kbps or higher
- Channels: Mono or Stereo

---

## Webhooks (Future Feature)

Coming soon: Webhook support for real-time updates on:
- Entry processing completion
- New insights available
- Streak milestones reached

---

## SDKs & Client Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- Swift SDK (iOS)
- Kotlin SDK (Android)

---

## Support

For API support or questions:
- Email: api-support@echo-app.com
- Documentation: https://docs.echo-app.com
- Status Page: https://status.echo-app.com

---

**API Version:** 1.0.0  
**Last Updated:** November 25, 2025
