# DISHA Frontend Feature and Architecture Documentation

This document explains the frontend architecture and all major AI/voice features implemented in `disha-ui`, including STT, TTS, API integrations, and feature-level component flow.

## 1. Frontend Architecture Overview

### Core stack
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS for styling
- Axios (`lib/api.ts`) as centralized API client
- React Query provider (`components/providers/AppQueryProvider.tsx`)
- Zustand (persisted state in `stores/jobDiscoveryPreferencesStore.ts`)
- Framer Motion, React Hot Toast, next-themes

### Application structure
- `app/`: route-based pages and layouts
- `components/`: reusable UI and feature components
- `hooks/`: feature hooks (auth, interview session, speech, resume AI)
- `lib/`: API client, config, helpers
- `services/`: focused service clients (interview, communication, etc.)
- `types/`: shared TS contracts

### Global providers and bootstrapping
In `app/layout.tsx`, the app is wrapped by:
- `ThemeProvider`
- `AppQueryProvider`
- `LocaleProvider`
- `LoadingProvider`
- Global toast provider

## 2. Frontend Routing and Feature Surfaces

### Main AI student routes
- AI Interview Session: `app/dashboard/student/career-align/page.tsx`
- AI Communication Assessment: `app/dashboard/student/ai-communication/page.tsx`
- AI Resume Builder (voice + text): `app/dashboard/student/resume/ai/page.tsx`
- AI Suggested Courses: `app/dashboard/student/courses/page.tsx`

### Supporting routes
- `app/ai-communication/page.tsx` redirects to dashboard student path
- `app/courses/page.tsx` redirects to dashboard student path
- Local route handlers exist in `app/api/*` for selected AI flows

## 3. API and Data Flow Architecture

### API client (`lib/api.ts`)
- Uses one Axios instance with base URL from config
- Request interceptors attach:
  - Bearer token
  - `Accept-Language`
- Response interceptors handle:
  - 401 detection
  - refresh-token attempt
  - request retry

### Auth/session model
- Tokens are stored in localStorage (`access_token`, `refresh_token`)
- `hooks/useAuth.ts` loads current user and handles auth redirects
- `app/dashboard/layout.tsx` performs client-side token presence checks

### State strategy
- Feature pages rely mostly on local state + hooks
- Interview lifecycle is managed in `hooks/useInterviewSession.ts`
- Resume AI lifecycle is managed in `hooks/useResumeAI.ts`
- Persisted preference state in Zustand store

## 4. Voice and Speech System (STT/TTS)

### STT (Speech-to-Text)
- Browser Speech Recognition for real-time voice input
- Reusable helper/hook:
  - `utils/stt.ts`
  - `hooks/useSpeechToText.ts`
- `useSpeechToText.ts` also supports backend transcription endpoint usage for file-based flows

### TTS (Text-to-Speech)
- Browser speech synthesis (`speechSynthesis`) via `hooks/useTextToSpeech.ts`
- Some AI flows also call backend TTS endpoints as fallback

### Vapi voice-to-voice provider
- Reusable Vapi wrapper hook: `hooks/useVapiCall.ts`
- Env-driven config helpers: `lib/vapi.ts`
- SDK: `@vapi-ai/web`
- Feature mapping:
  - AI Interview Session uses `feature: "interview"`
  - AI Communication Assessment uses `feature: "communication"`
- Assistant resolution order:
  1. `NEXT_PUBLIC_VAPI_INTERVIEW_ASSISTANT_ID` or `NEXT_PUBLIC_VAPI_COMMUNICATION_ASSISTANT_ID`
  2. fallback to shared `NEXT_PUBLIC_VAPI_ASSISTANT_ID`
- Vapi is optional; features continue with built-in speech if Vapi is disabled or unavailable.

### Typical voice fallback pattern
1. Try browser speech APIs
2. If browser speech fails/unsupported, call backend STT/TTS endpoints
3. If backend AI fails, show deterministic fallback response/content
4. If Vapi is enabled, attempt Vapi call first for supported features; on Vapi start/runtime error, fallback to built-in browser/backend voice chain

## 5. Feature Deep Dive

## 5.1 Voice-Supported Registration / Onboarding

### UI components
- `components/signup/FieldVoiceButton.tsx`
- `components/signup/VoiceInput.tsx`
- Used across signup step pages (for example `app/signup/step-1/page.tsx`)

### Flow
1. User taps microphone icon for a field
2. Browser STT captures speech
3. Transcript is inserted into form field
4. Form submits through existing onboarding/auth APIs

### Value
- Lowers typing barrier for first-time users
- Useful for multilingual and mobile-first onboarding

## 5.2 AI Resume Builder Through Voice Command

### Main frontend files
- `components/resume-builder/AIResumeBuilderPage.tsx`
- `hooks/useResumeAI.ts`
- Route wrapper: `app/dashboard/student/resume/ai/page.tsx`

### Voice + AI flow
1. User provides spoken or typed career details
2. Speech recognition captures live transcript
3. Input quality checks run (minimum length and validity)
4. Non-English text can be translated to English (frontend helper path)
5. Request is sent to backend resume AI endpoint
6. UI renders:
  - generated resume output
  - ATS guidance/suggestions
  - edit + save actions
7. Finalized profile sections are synced through student profile APIs

### Output modes handled
- Structured JSON-style resume output
- Plain text fallback output

## 5.3 AI Interview Session

### Main frontend files
- `app/dashboard/student/career-align/page.tsx`
- `components/interview/InterviewRoom.tsx`
- `components/interview/LanguageSelector.tsx`
- `components/interview/PermissionGate.tsx`
- `hooks/useInterviewSession.ts`

### Interview flow
1. User selects language, role, and interview context
2. PermissionGate requests microphone/camera permissions
3. Session starts and first prompt is fetched
4. If Vapi is configured, connect Vapi call using interview assistant id
5. If Vapi is unavailable, AI question is spoken via TTS and user response is captured via STT
6. Answer is sent to backend for next prompt and evaluation updates
7. Session ends with score + feedback rendering

### UX resilience
- Browser and backend TTS fallback chain
- Local fallback messaging/scoring when API interruptions occur
- Vapi runtime error fallback automatically re-enters built-in interview voice loop

## 5.4 AI Communication Assessments

### Main frontend files
- `app/dashboard/student/ai-communication/page.tsx`
- `components/communication/AICommunicationRoom.tsx`
- API methods in `lib/api.ts`

### Flow
1. User chooses mode and language
2. Start AI communication session
3. If Vapi is configured, connect Vapi call for voice-to-voice
4. If Vapi is unavailable, user speaks response via STT
5. Backend returns conversational AI reply
6. Reply is played by TTS
7. Final evaluation endpoint returns metrics (fluency/confidence/etc.)
8. User can download transcript

### Fallback behavior
- If evaluation times out/fails, frontend generates local approximate scoring and suggestions
- If Vapi fails, UI falls back to built-in speech mode (`Speak`/`Stop`) without blocking assessment session

## 5.5 AI Suggested Courses

### Main frontend files
- `app/dashboard/student/courses/page.tsx`
- `components/courses/CoursesPage.tsx`
- `components/courses/VoiceInput.tsx`
- Local route call path: `app/api/recommend-courses/route.ts`

### Flow
1. User enters goal by voice or text
2. Client parser extracts profile cues
3. Recommendation endpoint is called
4. Response courses are rendered as actionable suggestions
5. Search history persists in localStorage

### Behavior under provider failure
- Route returns default curated/fallback course suggestions

## 6. Frontend-Backend Integration Map (High-Level)

- Auth + onboarding forms -> `/api/v1/auth/*` and onboarding endpoints
- Resume AI builder -> backend `/resume/generate-ai`
- AI interview -> backend `/interview-session/*`
- AI communication -> backend `/ai-communication/*`
- Course recommendation -> frontend API route + provider call pattern

## 7. Project Architecture Diagram (Logical)

1. **Presentation Layer**: Next.js pages + feature components  
2. **Interaction Layer**: Hooks for auth, speech, interview, resume generation  
3. **Integration Layer**: `lib/api.ts` + feature services  
4. **AI/Voice Layer**: Browser STT/TTS + backend STT/TTS fallback  
5. **Persistence Layer (client side)**: localStorage/sessionStorage/Zustand persisted store

## 8. Important Operational Notes

- `README.md` has older references that do not fully reflect current routing and env variable naming.
- Route handling includes both Next.js local `app/api` handlers and backend proxy-style API usage; this should stay documented to avoid confusion.
- Client-side dashboard gating is for UX only; backend authorization remains authoritative.
- Vapi setup must use a valid Vapi public key and assistant id(s). Misconfigured assistant id (placeholder values) causes call creation errors from `api.vapi.ai/call/web`.

## 9. Recommended Documentation Maintenance Process

Whenever a feature changes:
1. Update route path and owning components in this file
2. Update endpoint names in `lib/api.ts` section
3. Update STT/TTS flow notes if fallback order changes
4. Add/remove dependencies in tech stack section

