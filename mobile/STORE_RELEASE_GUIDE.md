# Echo Store Release Guide

This guide covers the minimum steps to submit Echo to Google Play and Apple App Store.

## 1) Finalize App Identity
- Android package name: com.echojournal.app
- iOS bundle identifier: com.echojournal.app
- App name: Echo
- Version: 1.0.0

## 2) Required Assets
Create and add final assets before submission:
- App icon (1024x1024 source)
- Android adaptive icon foreground/background
- iOS AppIcon set in Xcode asset catalog
- Splash screen artwork
- Screenshots for phones (and tablets if targeting iPad)

## 3) Backend Production Setup
- Deploy backend to a production HTTPS URL
- Remove direct client-side OpenAI key usage in production
- Point mobile app to backend API endpoint
- Confirm CORS and auth settings for production domains

## 4) Android Release Build (AAB)
1. Create upload keystore:
   keytool -genkeypair -v -keystore echo-upload-key.keystore -alias echo_upload -keyalg RSA -keysize 2048 -validity 10000
2. Copy android/keystore.properties.example to android/keystore.properties and fill values.
3. Place keystore file under android/app/ (or update path).
4. Build AAB:
   npm run android:release
5. Upload android/app/build/outputs/bundle/release/app-release.aab to Play Console.

## 5) iOS Release Build (IPA)
1. Open ios/EchoNativeScaffold.xcworkspace in Xcode (macOS required).
2. Set Team and Signing for target EchoNativeScaffold.
3. Verify bundle ID com.echojournal.app.
4. Increment build number for every submission.
5. Archive and upload with Xcode Organizer to App Store Connect.

## 6) Store Compliance Checklist
- Privacy Policy URL is public and reachable
- Terms of Service URL is public and reachable
- Account deletion flow is available and documented
- Permission prompts explain microphone usage clearly
- No test/staging endpoints in release build
- No placeholder API keys in client app

## 7) Play Console Metadata
Prepare:
- Short description and full description
- Feature graphic (1024x500)
- At least 2 phone screenshots
- Data Safety form
- Content rating questionnaire

## 8) App Store Connect Metadata
Prepare:
- App description, keywords, support URL, marketing URL
- Privacy nutrition labels
- Age rating questionnaire
- Screenshots for required device sizes

## 9) Final Verification
- Install release builds on physical devices
- Test login, recording, upload, transcript, insights, share, and logout
- Test offline behavior and error states
- Validate crash-free startup and permission prompts
