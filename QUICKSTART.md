# Echo - Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v14.0 or higher ([Download](https://www.postgresql.org/download/))
- **React Native CLI** ([Installation Guide](https://reactnative.dev/docs/environment-setup))
- **iOS/Android Development Environment**:
  - **iOS**: Xcode 14+ (Mac only)
  - **Android**: Android Studio with SDK 33+

### External Accounts
- **OpenAI Account** with API key ([Get API Key](https://platform.openai.com/api-keys))
- **AWS Account** with S3 bucket configured ([AWS Console](https://console.aws.amazon.com/))

---

## Step 1: Clone & Install Dependencies

```bash
# Navigate to project directory
cd "c:\Users\joeki\Documents\my projects\voice journal"

# Install backend dependencies
cd backend
npm install

# Install mobile dependencies
cd ../mobile
npm install

# iOS only: Install CocoaPods dependencies
cd ios
pod install
cd ..
```

---

## Step 2: Database Setup

### Create Database
```bash
# Connect to PostgreSQL (Windows PowerShell)
psql -U postgres

# Create database
CREATE DATABASE echo_journal;

# Exit PostgreSQL
\q
```

### Run Migrations
```bash
# From backend directory
cd backend

# Run schema.sql
psql -U postgres -d echo_journal -f src/database/schema.sql

# Verify tables were created
psql -U postgres -d echo_journal -c "\dt"

# Expected output: users, journal_entries, action_items, audio_milestones, user_streaks
```

---

## Step 3: Configure Environment Variables

### Backend Configuration
Create `backend/.env` file:

```bash
# Copy example file
cd backend
Copy-Item .env.example .env

# Edit with your values (use notepad or VS Code)
```

**Required values** in `backend/.env`:
```env
NODE_ENV=development
PORT=3000

# Database - Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/echo_journal

# JWT Secret - Generate a random 32+ character string
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# OpenAI - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# AWS S3 - Get from AWS Console IAM
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# CORS - Update when deploying
CORS_ORIGIN=http://localhost:3000
```

### Mobile Configuration
Create `mobile/.env` file:

```bash
cd mobile
New-Item -Path .env -ItemType File

# Add this line with your computer's IP address
# (Find it with: ipconfig | Select-String "IPv4")
echo "API_BASE_URL=http://YOUR_LOCAL_IP:3000" > .env

# Example:
# API_BASE_URL=http://192.168.1.100:3000
```

---

## Step 4: AWS S3 Bucket Setup

### Create S3 Bucket
1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Bucket name: `echo-audio-dev-yourname`
4. Region: `us-east-1` (or your preferred region)
5. **Block all public access**: ✅ Enabled
6. **Bucket Versioning**: Disabled
7. **Encryption**: Server-side encryption with Amazon S3 managed keys (SSE-S3)
8. Click **Create bucket**

### Create IAM User
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Users → Add users
3. User name: `echo-backend-dev`
4. Access type: **Programmatic access**
5. Attach policy: **AmazonS3FullAccess** (or create custom policy)
6. Save **Access Key ID** and **Secret Access Key**
7. Add these to `backend/.env`

### Custom IAM Policy (Recommended - Least Privilege):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:GetObjectAcl"
      ],
      "Resource": "arn:aws:s3:::echo-audio-dev-yourname/*"
    }
  ]
}
```

---

## Step 5: Start Backend Server

```bash
# From backend directory
cd backend

# Start development server with hot reload
npm run dev

# Expected output:
# Server running on port 3000
# Database connected
# Press CTRL+C to stop
```

### Test Backend Health
Open browser or use curl:
```bash
curl http://localhost:3000/health

# Expected response: {"status":"ok"}
```

---

## Step 6: Start Mobile App

### iOS (Mac only)
```bash
# From mobile directory
cd mobile

# Start Metro bundler
npm start

# In a new terminal, start iOS simulator
npm run ios

# Or specify device
npm run ios -- --simulator="iPhone 15 Pro"
```

### Android
```bash
# From mobile directory
cd mobile

# Start Metro bundler
npm start

# In a new terminal, start Android emulator
npm run android

# Make sure Android emulator is running first
# (Open Android Studio → AVD Manager → Start device)
```

---

## Step 7: Test the App

### Registration Flow
1. Open app on simulator/emulator
2. Click **Sign Up** (if you see login screen)
3. Enter email: `test@example.com`
4. Enter password: `TestPass123`
5. Click **Register**
6. You should receive a JWT token and see the Home screen

### Recording Flow
1. Tap the large circular record button
2. Grant microphone permissions (first time only)
3. Speak for 10-30 seconds (e.g., "Today was a productive day. I completed three major tasks and feel great about my progress.")
4. Tap stop button
5. Wait for AI processing (5-10 seconds)
6. Review transcript and insights
7. Customize tagline and gradient
8. Tap **Save Entry**
9. Entry should appear on Home screen

### Insights Dashboard
1. Navigate to **Insights** tab (bottom navigation)
2. View weekly summary
3. Check action items
4. Toggle action item completion
5. View milestones by type

---

## Troubleshooting

### Backend Issues

**Database connection error**:
```bash
# Check PostgreSQL is running
Get-Service postgresql*

# If not running, start it
Start-Service postgresql-x64-14  # Adjust version number

# Test connection
psql -U postgres -d echo_journal -c "SELECT 1;"
```

**OpenAI API errors**:
```bash
# Verify API key is valid
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $env:OPENAI_API_KEY"

# Check billing: https://platform.openai.com/account/billing
# Ensure you have credits available
```

**S3 upload errors**:
```bash
# Test AWS credentials
npm install -g aws-cli
aws configure
aws s3 ls s3://your-bucket-name

# Check IAM permissions
# User must have PutObject permission
```

### Mobile Issues

**Metro bundler not starting**:
```bash
# Clear cache
npm start -- --reset-cache

# Or manually clear
rm -rf $env:TEMP/metro-*
```

**iOS build errors**:
```bash
# Clean build folder
cd ios
rm -rf build Pods
pod deintegrate
pod install
cd ..

# Rebuild
npm run ios
```

**Android build errors**:
```bash
# Clean Gradle cache
cd android
.\gradlew clean
cd ..

# Clear Metro cache
npm start -- --reset-cache

# Rebuild
npm run android
```

**Cannot connect to backend**:
```bash
# Find your local IP
ipconfig | Select-String "IPv4"

# Update mobile/.env with correct IP
# DO NOT use "localhost" - use actual IP address like 192.168.1.100

# Restart Metro
npm start -- --reset-cache
```

**Microphone permission denied**:
```bash
# iOS: Go to Settings → Privacy → Microphone → Echo → Enable
# Android: Go to Settings → Apps → Echo → Permissions → Microphone → Allow
```

---

## Development Workflow

### Making Changes

**Backend changes**:
```bash
# Server auto-restarts with nodemon
# Just save your files and test

# Run tests
npm test

# Check for errors
npm run lint
```

**Mobile changes**:
```bash
# Save files → Metro will hot reload
# For major changes, reload app:
# - iOS: Cmd+R in simulator
# - Android: Double-tap R key or shake device
```

### Database Changes

**Adding new migrations**:
```bash
# Create new SQL file
New-Item -Path src/database/migrations/002_add_new_feature.sql

# Run migration
psql -U postgres -d echo_journal -f src/database/migrations/002_add_new_feature.sql
```

---

## API Testing (Postman/Thunder Client)

### Register User
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123",
  "displayName": "Test User"
}

# Response: { token: "eyJhbG...", user: {...} }
```

### Create Journal Entry
```http
POST http://localhost:3000/api/journals
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

Fields:
- audio: (file) audio.m4a
- tagline: "Great day at work"
- gradient: "default"
- transcript: "Today was amazing..."
- analysis: {"actionItems": [...], "milestones": [...]}
```

### Get Insights
```http
GET http://localhost:3000/api/insights/weekly-summary
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Production Deployment Checklist

### Backend
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong JWT_SECRET (min 32 random characters)
- [ ] Configure production DATABASE_URL
- [ ] Set up SSL/TLS certificates (Let's Encrypt)
- [ ] Configure CORS_ORIGIN to production domain
- [ ] Enable rate limiting (already configured)
- [ ] Set up monitoring (PM2, DataDog, etc.)
- [ ] Configure log rotation
- [ ] Set up automated backups (database + S3)
- [ ] Use separate S3 bucket for production
- [ ] Implement health check endpoint
- [ ] Set up CI/CD pipeline (GitHub Actions)

### Mobile
- [ ] Update `API_BASE_URL` to production domain
- [ ] Configure app icons and splash screens
- [ ] Set up push notifications (Firebase/APNs)
- [ ] Configure app signing (iOS + Android)
- [ ] Enable crash reporting (Sentry, Crashlytics)
- [ ] Set up analytics (Mixpanel, Amplitude)
- [ ] Create privacy policy and terms of service
- [ ] Submit for review (App Store + Play Store)
- [ ] Test on multiple devices
- [ ] Enable ProGuard (Android) for code obfuscation

---

## Useful Commands Reference

### Backend
```bash
# Development
npm run dev          # Start with hot reload
npm start            # Start production
npm test             # Run tests
npm run lint         # Check code style

# Database
npm run migrate      # Run migrations
npm run seed         # Seed test data
npm run db:reset     # Reset database
```

### Mobile
```bash
# Development
npm start            # Start Metro bundler
npm run ios          # Run iOS simulator
npm run android      # Run Android emulator
npm test             # Run tests

# Cleanup
npm run clean        # Clear caches
npm run reset        # Full reset (node_modules + cache)
```

### Git
```bash
# Feature branch workflow
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Pull latest changes
git checkout main
git pull origin main
```

---

## Next Steps

Now that you have the app running, explore these resources:

1. **Component Details**: Read `docs/COMPONENT_EXPLANATION.md` for in-depth architecture
2. **API Reference**: Check `docs/api-documentation.md` for endpoint specs
3. **AI Integration**: Review `docs/ai-prompts.md` for OpenAI configuration
4. **Wireframes**: See `docs/wireframes.md` for UI/UX specifications
5. **Project Status**: View `PROJECT_SUMMARY.md` for deliverables checklist

---

## Getting Help

**Documentation**:
- React Native: https://reactnative.dev/docs/getting-started
- Express.js: https://expressjs.com/en/guide/routing.html
- PostgreSQL: https://www.postgresql.org/docs/
- OpenAI API: https://platform.openai.com/docs/
- AWS S3: https://docs.aws.amazon.com/s3/

**Community**:
- React Native Discord: https://discord.gg/react-native
- Stack Overflow: Tag questions with `react-native`, `express`, `postgresql`

**Issues**:
- Create GitHub issue with:
  - Environment (OS, Node version, device)
  - Steps to reproduce
  - Expected vs actual behavior
  - Logs/screenshots

---

## Success! 🎉

You should now have:
- ✅ Backend API running on http://localhost:3000
- ✅ Mobile app running on simulator/emulator
- ✅ Database with complete schema
- ✅ S3 bucket for audio storage
- ✅ OpenAI integration for AI analysis

**Test it out**: Create your first voice journal entry and watch the AI magic happen!

Happy coding! 🚀
