# Echo - System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         MOBILE APPLICATION                              │
│                        (React Native 0.72.6)                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    NAVIGATION LAYER                              │  │
│  │                                                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │  │   Home   │  │ Insights │  │ Settings │  │ Profile  │       │  │
│  │  │   Tab    │  │   Tab    │  │   Tab    │  │  Modal   │       │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     SCREEN COMPONENTS                            │  │
│  │                                                                  │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │  │
│  │  │  HomeScreen    │  │ PostRecording  │  │  Insights      │   │  │
│  │  │  • Recording   │  │ • Soundscape   │  │  • Weekly      │   │  │
│  │  │  • Recent      │  │ • AI Results   │  │  • Actions     │   │  │
│  │  │  • Streak      │  │ • Save Entry   │  │  • Milestones  │   │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘   │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    SHARED COMPONENTS                             │  │
│  │                                                                  │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │  │
│  │  │  Soundscape    │  │  Theme System  │  │  AIService     │   │  │
│  │  │  Visualizer    │  │  • Colors      │  │  • Whisper     │   │  │
│  │  │  • 50 Bars     │  │  • Typography  │  │  • GPT-4       │   │  │
│  │  │  • Animation   │  │  • Spacing     │  │  • Processing  │   │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘   │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │
                        ╔════════════════════════╗
                        ║   REST API (HTTPS)     ║
                        ║   JWT Authentication   ║
                        ╚════════════════════════╝
                                     │
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          BACKEND API SERVER                             │
│                       (Node.js 18+ / Express.js)                        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                        MIDDLEWARE LAYER                          │  │
│  │                                                                  │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │  │
│  │  │ Helmet │  │  CORS  │  │ Morgan │  │  Rate  │  │  Auth  │   │  │
│  │  │Security│  │ Origin │  │ Logger │  │ Limit  │  │  JWT   │   │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                         ROUTES LAYER                             │  │
│  │                                                                  │  │
│  │  /api/auth        /api/journals      /api/insights              │  │
│  │  • register       • create (POST)    • weekly-summary           │  │
│  │  • login          • list (GET)       • action-items             │  │
│  │  • refresh        • get (GET)        • milestones               │  │
│  │  • logout         • update (PUT)     • search                   │  │
│  │                   • delete (DELETE)                              │  │
│  │                                                                  │  │
│  │  /api/users       /api/audio                                    │  │
│  │  • profile        • signed-url                                  │  │
│  │  • stats                                                         │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      CONTROLLERS LAYER                           │  │
│  │                                                                  │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │  │
│  │  │ authController │  │journalController│ │insightsController│  │  │
│  │  │ • bcrypt hash  │  │ • CRUD logic   │  │ • analytics    │   │  │
│  │  │ • JWT generate │  │ • validation   │  │ • aggregations │   │  │
│  │  │ • user mgmt    │  │ • AI integrate │  │ • search       │   │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌────────────────┐                                             │  │
│  │  │ userController │                                             │  │
│  │  │ • profile      │                                             │  │
│  │  │ • statistics   │                                             │  │
│  │  └────────────────┘                                             │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                       SERVICES LAYER                             │  │
│  │                                                                  │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │  │
│  │  │ openaiService  │  │   s3Service    │  │   dbService    │   │  │
│  │  │ • transcribe   │  │ • uploadAudio  │  │ • query()      │   │  │
│  │  │ • analyze      │  │ • downloadAudio│  │ • getClient()  │   │  │
│  │  │ • prompts      │  │ • getSignedUrl │  │ • pool mgmt    │   │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘   │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                     │                 │                 │
                     │                 │                 │
                     ▼                 ▼                 ▼
        ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
        │                │  │                │  │                │
        │  OPENAI API    │  │     AWS S3     │  │  POSTGRESQL    │
        │                │  │                │  │                │
        │  ┌──────────┐  │  │  ┌──────────┐  │  │  ┌──────────┐  │
        │  │ Whisper  │  │  │  │  Audio   │  │  │  │  users   │  │
        │  │  API     │  │  │  │  Files   │  │  │  │          │  │
        │  │ Speech→  │  │  │  │ AES-256  │  │  │  │ journal_ │  │
        │  │  Text    │  │  │  │Encrypted │  │  │  │ entries  │  │
        │  └──────────┘  │  │  │          │  │  │  │          │  │
        │                │  │  │Presigned │  │  │  │ action_  │  │
        │  ┌──────────┐  │  │  │  URLs    │  │  │  │ items    │  │
        │  │  GPT-4   │  │  │  │          │  │  │  │          │  │
        │  │   API    │  │  │  │  CDN     │  │  │  │ audio_   │  │
        │  │ NLP      │  │  │  │ Ready    │  │  │  │milestones│  │
        │  │Analysis  │  │  │  │          │  │  │  │          │  │
        │  └──────────┘  │  │  └──────────┘  │  │  │ user_    │  │
        │                │  │                │  │  │ streaks  │  │
        │ $0.068/entry   │  │  50MB/file     │  │  │          │  │
        └────────────────┘  └────────────────┘  │  │ Indexes  │  │
                                                 │  │ Triggers │  │
                                                 │  └──────────┘  │
                                                 │                │
                                                 └────────────────┘


═══════════════════════════════════════════════════════════════════════════
                            DATA FLOW EXAMPLES
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                     JOURNAL ENTRY CREATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

   Mobile App                Backend API            External Services
   ──────────                ───────────            ─────────────────
       │                          │                         │
       │ 1. Record Audio          │                         │
       │─────────────────────────▶│                         │
       │                          │                         │
       │ 2. POST /api/journals    │                         │
       │   (multipart/form-data)  │                         │
       │─────────────────────────▶│                         │
       │                          │                         │
       │                          │ 3. Upload Audio         │
       │                          │────────────────────────▶│ AWS S3
       │                          │                         │
       │                          │ 4. Transcribe Audio     │
       │                          │────────────────────────▶│ Whisper API
       │                          │◀────────────────────────│ (transcript)
       │                          │                         │
       │                          │ 5. Analyze Entry        │
       │                          │────────────────────────▶│ GPT-4 API
       │                          │◀────────────────────────│ (insights)
       │                          │                         │
       │                          │ 6. Save to Database     │
       │                          │────────────────────────▶│ PostgreSQL
       │                          │   • journal_entries     │
       │                          │   • action_items        │
       │                          │   • audio_milestones    │
       │                          │   • user_streaks        │
       │                          │                         │
       │ 7. Return Entry          │                         │
       │◀─────────────────────────│                         │
       │    (with insights)       │                         │
       │                          │                         │
       │ 8. Display Results       │                         │
       │                          │                         │


┌─────────────────────────────────────────────────────────────────────────┐
│                     INSIGHTS DASHBOARD FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

   Mobile App                Backend API              Database
   ──────────                ───────────              ────────
       │                          │                      │
       │ 1. Load Dashboard        │                      │
       │─────────────────────────▶│                      │
       │                          │                      │
       │                          │ 2. Weekly Summary    │
       │                          │─────────────────────▶│
       │                          │   4 SQL queries:     │
       │                          │   • entry count      │
       │                          │   • sentiment        │
       │                          │   • themes           │
       │                          │   • streak           │
       │                          │◀─────────────────────│
       │                          │                      │
       │                          │ 3. Action Items      │
       │                          │─────────────────────▶│
       │                          │   SELECT with JOIN   │
       │                          │◀─────────────────────│
       │                          │                      │
       │                          │ 4. Milestones        │
       │                          │─────────────────────▶│
       │                          │   SELECT by type     │
       │                          │◀─────────────────────│
       │                          │                      │
       │ 5. Return Analytics      │                      │
       │◀─────────────────────────│                      │
       │                          │                      │
       │ 6. Render Charts         │                      │
       │    & Statistics          │                      │
       │                          │                      │
       │ 7. Toggle Action Item    │                      │
       │─────────────────────────▶│                      │
       │                          │ 8. UPDATE completed  │
       │                          │─────────────────────▶│
       │ 9. Confirm Update        │                      │
       │◀─────────────────────────│                      │
       │                          │                      │


═══════════════════════════════════════════════════════════════════════════
                          SECURITY ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                 │
└─────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────┐
  │  Layer 1: Transport Security                                      │
  │  ═══════════════════════════                                      │
  │  • TLS 1.2+ for all connections                                   │
  │  • HTTPS only (no HTTP fallback)                                  │
  │  • Certificate validation                                         │
  └───────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  Layer 2: API Gateway Security                                    │
  │  ══════════════════════════════                                   │
  │  • Helmet.js security headers                                     │
  │  • CORS origin whitelist                                          │
  │  • Rate limiting (100 req/15min)                                  │
  │  • Request size limits                                            │
  └───────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  Layer 3: Authentication                                          │
  │  ═══════════════════════                                          │
  │  • JWT token validation                                           │
  │  • Token expiration (7 days)                                      │
  │  • Refresh token rotation                                         │
  │  • Bcrypt password hashing (10 rounds)                            │
  └───────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  Layer 4: Input Validation                                        │
  │  ══════════════════════                                           │
  │  • Express-validator on all inputs                                │
  │  • File type & size restrictions                                  │
  │  • SQL injection prevention (parameterized)                       │
  │  • XSS protection                                                 │
  └───────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  Layer 5: Authorization                                           │
  │  ═══════════════════                                              │
  │  • User ID from JWT                                               │
  │  • Query filtering by user_id                                     │
  │  • Ownership verification                                         │
  │  • Cascade deletes                                                │
  └───────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  Layer 6: Data Protection                                         │
  │  ═════════════════════                                            │
  │  • Database encryption at rest                                    │
  │  • S3 encryption (AES-256)                                        │
  │  • Presigned URLs (time-limited)                                  │
  │  • Environment variables for secrets                              │
  └───────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                          DATABASE SCHEMA DIAGRAM
═══════════════════════════════════════════════════════════════════════════

  ┌─────────────────────────┐
  │        users            │
  ├─────────────────────────┤
  │ id (PK, UUID)           │◀────────────┐
  │ email (UNIQUE)          │             │
  │ password_hash           │             │
  │ display_name            │             │
  │ profile_image_url       │             │
  │ created_at              │             │
  │ updated_at              │             │
  └─────────────────────────┘             │
              │                           │
              │ 1:N                       │
              ▼                           │
  ┌─────────────────────────┐             │
  │   journal_entries       │             │
  ├─────────────────────────┤             │
  │ id (PK, UUID)           │             │
  │ user_id (FK) ───────────┘             │
  │ audio_url               │             │
  │ duration                │             │
  │ tagline                 │             │
  │ gradient                │             │
  │ transcript              │             │
  │ analysis (JSONB)        │             │
  │ created_at              │             │
  │ updated_at              │             │
  └─────────────────────────┘             │
              │                           │
              │ 1:N                       │
              ├──────────┬────────────────┤
              ▼          ▼                │
  ┌──────────────┐  ┌──────────────┐     │
  │ action_items │  │audio_mileston│     │
  ├──────────────┤  ├──────────────┤     │
  │id (PK, UUID) │  │id (PK, UUID) │     │
  │entry_id (FK) │  │entry_id (FK) │     │
  │task          │  │type          │     │
  │priority      │  │description   │     │
  │excerpt       │  │excerpt       │     │
  │completed     │  │timestamp     │     │
  │completed_at  │  │created_at    │     │
  │created_at    │  └──────────────┘     │
  └──────────────┘                       │
                                         │
  ┌─────────────────────────┐            │
  │     user_streaks        │            │
  ├─────────────────────────┤            │
  │ user_id (PK, FK) ───────┘            │
  │ current_streak          │
  │ longest_streak          │
  │ last_entry_date         │
  │ updated_at              │
  └─────────────────────────┘


  Indexes:
  ────────
  • users.email (UNIQUE)
  • journal_entries.user_id
  • journal_entries.created_at
  • action_items.entry_id
  • action_items.completed
  • audio_milestones.entry_id
  • audio_milestones.type


═══════════════════════════════════════════════════════════════════════════
                        TECHNOLOGY STACK SUMMARY
═══════════════════════════════════════════════════════════════════════════

  Frontend (Mobile)              Backend (API)              External
  ─────────────────              ─────────────              ────────
  React Native 0.72.6            Node.js 18+                OpenAI APIs
  React Navigation 6.x           Express.js 4.18            • Whisper
  React Native Reanimated        PostgreSQL 14+             • GPT-4
  Axios HTTP Client              JWT Authentication         
  AsyncStorage                   Bcrypt Hashing             AWS Services
  Audio Recorder Player          Multer File Upload         • S3 Storage
  Linear Gradient                Helmet Security            • CloudFront
  React Native Share             Morgan Logging             
  View Shot                      Express Validator          
  Permissions                    Rate Limiting              
  
  Development Tools              Testing Tools              DevOps
  ─────────────────              ─────────────              ──────
  Metro Bundler                  Jest                       Docker
  Nodemon                        Supertest                  GitHub Actions
  ESLint                         React Testing Library      PM2
  Prettier                                                  Nginx
  VS Code                                                   Let's Encrypt
  Git                                                       


═══════════════════════════════════════════════════════════════════════════
                          DEPLOYMENT ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════

  ┌───────────────────────────────────────────────────────────────────┐
  │                          PRODUCTION                               │
  └───────────────────────────────────────────────────────────────────┘

         ┌──────────────┐                    ┌──────────────┐
         │  App Store   │                    │  Play Store  │
         │              │                    │              │
         │  iOS App     │                    │ Android App  │
         └──────────────┘                    └──────────────┘
                │                                   │
                └───────────────┬───────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    Load Balancer      │
                    │   (HTTPS/TLS 1.2+)    │
                    └───────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  API     │    │  API     │    │  API     │
        │ Server 1 │    │ Server 2 │    │ Server 3 │
        │ (Node.js)│    │ (Node.js)│    │ (Node.js)│
        └──────────┘    └──────────┘    └──────────┘
                │               │               │
                └───────────────┼───────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │PostgreSQL│    │  AWS S3  │    │ OpenAI   │
        │  Master  │    │  Bucket  │    │   API    │
        │          │    │ (Audio)  │    │          │
        └──────────┘    └──────────┘    └──────────┘
                │
                ▼
        ┌──────────┐
        │PostgreSQL│
        │ Replica  │
        │(Read-only│
        └──────────┘


═══════════════════════════════════════════════════════════════════════════
                            COST ESTIMATION
═══════════════════════════════════════════════════════════════════════════

  Per User (Monthly - 30 entries)
  ────────────────────────────────
  OpenAI Whisper: $0.018 × 30 = $0.54
  OpenAI GPT-4:   $0.050 × 30 = $1.50
  AWS S3:         $0.023 × 30 = $0.69
  Database:       $0.001 × 30 = $0.03
  ─────────────────────────────────────
  Total per user per month: ~$2.76
  
  For 1,000 users: $2,760/month
  For 10,000 users: $27,600/month (with volume discounts)
  
  Infrastructure (Fixed Costs)
  ────────────────────────────
  API Servers (3 × $40): $120
  PostgreSQL RDS: $100
  Load Balancer: $30
  S3 Storage: Variable ($23/TB)
  Domain & SSL: $15
  ─────────────────────────────
  Fixed monthly: ~$265


═══════════════════════════════════════════════════════════════════════════
                          KEY METRICS TO MONITOR
═══════════════════════════════════════════════════════════════════════════

  Performance Metrics              Business Metrics
  ───────────────────              ────────────────
  • API Response Time (<500ms)     • Daily Active Users (DAU)
  • Database Query Time (<100ms)   • Monthly Active Users (MAU)
  • AI Processing Time (<10s)      • New User Registrations
  • Mobile App Crashes             • Entries per User per Day
  • Memory Usage                   • AI Insights Quality Rating
  • CPU Usage                      • User Retention Rate
  • Error Rate (<0.1%)             • Premium Conversions

  Security Metrics                 Cost Metrics
  ────────────────                 ────────────
  • Failed Auth Attempts           • OpenAI API Cost per User
  • Rate Limit Hits                • AWS S3 Storage Cost
  • Invalid Token Usage            • Database Cost per Query
  • SQL Injection Attempts         • Server Cost per User
  • File Upload Exploits           • Total Cost per User


═══════════════════════════════════════════════════════════════════════════
```

This diagram is now available at: `docs/ARCHITECTURE_DIAGRAM.md`
