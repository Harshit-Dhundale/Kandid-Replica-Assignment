# LinkBird Clone - Short Demo Script (3 minutes)

## [0:00-0:10] Personal Introduction
**[Your intro here — 8–12s]**

*[On-screen: Show terminal with `npm run dev` starting, then switch to browser showing localhost:3000]*

## [0:10-0:30] Task Requirements Summary
"Today I'll be demonstrating my implementation of the LinkBird.ai platform replication assignment. The task required building a full-stack Next.js application with authentication, leads management, campaigns management, and a comprehensive database schema using modern technologies like Better Auth, Drizzle ORM, and TanStack Query."

*[On-screen: Show assignment requirements document or bullet points highlighting key features]*

## [0:30-1:20] Code Structure & Implementation
"Let me walk you through the key architectural decisions and implementation details."

*[On-screen: Show file tree in IDE, highlight key directories]*

"First, the authentication system using Better Auth with both email/password and Google OAuth integration."

*[On-screen: Open `lib/auth.ts` lines 24-48, then `app/login/page.tsx` lines 52-65]*

"The leads management features infinite scroll with TanStack Query, comprehensive filtering, and a detailed side sheet for lead interactions."

*[On-screen: Open `app/(app)/leads/page.tsx` lines 91-108, then `components/leads/lead-sheet.tsx` lines 78-97]*

"The campaigns section includes status tracking, progress indicators, and detailed campaign management with tabbed interfaces."

*[On-screen: Open `app/(app)/campaigns/page.tsx` lines 200-280, then `components/campaigns/campaign-actions.tsx` lines 35-62]*

"State management is handled with Zustand for UI state and TanStack Query for server state, with proper persistence and optimistic updates."

*[On-screen: Open `stores/ui.ts` lines 76-130]*

## [1:20-2:30] Live Application Demo
"Now let's see the application in action."

*[On-screen: Switch to browser, navigate to localhost:3000]*

"Starting with authentication - I can sign in with email/password or Google OAuth."

*[On-screen: Click login, show form, demonstrate Google OAuth button]*

"The dashboard provides an overview with campaign metrics, recent activity, and LinkedIn account management."

*[On-screen: Show dashboard, highlight metrics cards, recent activity feed]*

"The leads page features infinite scroll, real-time search, and comprehensive filtering. Clicking any lead opens a detailed side sheet."

*[On-screen: Navigate to leads page, demonstrate search, click on a lead to open side sheet, show status updates]*

"The campaigns page shows all campaigns with progress indicators, status badges, and action menus for management."

*[On-screen: Navigate to campaigns page, show campaign table, click on a campaign for details]*

"Campaign details include overview statistics, filtered leads, message sequence editor, and settings management."

*[On-screen: Show campaign detail tabs, demonstrate each section]*

## [2:30-3:00] Closing & Next Steps
"This implementation demonstrates proficiency in modern React patterns, full-stack development, and production-ready code architecture. The application is fully functional with all required features implemented according to the assignment specifications."

*[On-screen: Show final dashboard view, highlight key features]*

"Key technical highlights include cursor-based pagination for performance, optimistic updates for better UX, comprehensive error handling, and a scalable component architecture that follows React best practices."

*[On-screen: Show code snippets of key implementations]*

---

## Speaker Notes
- **Pace**: Speak clearly at ~150 WPM
- **Pauses**: 1-second pause between major sections
- **Emphasis**: Highlight technical decisions and user experience improvements
- **Pointer**: Use cursor to guide attention to specific UI elements and code sections
- **Timing**: Keep each section within allocated time slots