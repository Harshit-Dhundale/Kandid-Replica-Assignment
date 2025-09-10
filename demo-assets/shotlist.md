# LinkBird Clone - Shot List & Storyboard

## Pre-Recording Setup
1. **Start Development Server**
   - Command: `npm run dev`
   - Wait for: "Ready - started server on 0.0.0.0:3000"
   - Screenshot: `00-server-start.png`

2. **Seed Database** (if needed)
   - Command: `npm run setup`
   - Wait for: "Database seeded successfully"
   - Screenshot: `01-db-seed.png`

3. **Open Browser**
   - URL: `http://localhost:3000`
   - Screenshot: `02-homepage.png`

## Shot Sequence

### [0:00-0:10] Title & Introduction
**Shot 1: Title Slide**
- **File**: Create title slide with "LinkBird Clone Demo"
- **Duration**: 3 seconds
- **Screenshot**: `03-title-slide.png`

**Shot 2: Terminal Starting Server**
- **File**: Terminal showing `npm run dev`
- **Duration**: 5 seconds
- **Screenshot**: `04-terminal-start.png`

**Shot 3: Browser Loading**
- **File**: Browser showing localhost:3000 loading
- **Duration**: 2 seconds
- **Screenshot**: `05-browser-loading.png`

### [0:10-0:30] Requirements Overview
**Shot 4: Assignment Requirements**
- **File**: Show assignment document or requirements list
- **Duration**: 10 seconds
- **Screenshot**: `06-requirements.png`

**Shot 5: Tech Stack**
- **File**: Show tech stack list (Next.js, Tailwind, Drizzle, etc.)
- **Duration**: 10 seconds
- **Screenshot**: `07-tech-stack.png`

### [0:30-1:20] Code Structure Walkthrough
**Shot 6: File Tree Overview**
- **File**: IDE showing project structure
- **Duration**: 8 seconds
- **Screenshot**: `08-file-tree.png`

**Shot 7: Authentication Code**
- **File**: `lib/auth.ts` lines 24-48
- **Duration**: 12 seconds
- **Screenshot**: `09-auth-config.png`

**Shot 8: Login Page Code**
- **File**: `app/login/page.tsx` lines 52-65
- **Duration**: 10 seconds
- **Screenshot**: `10-login-code.png`

**Shot 9: Database Schema**
- **File**: `drizzle/schema.ts` lines 18-57
- **Duration**: 15 seconds
- **Screenshot**: `11-db-schema.png`

**Shot 10: Leads Infinite Query**
- **File**: `app/(app)/leads/page.tsx` lines 91-108
- **Duration**: 12 seconds
- **Screenshot**: `12-leads-query.png`

**Shot 11: Lead Sheet Component**
- **File**: `components/leads/lead-sheet.tsx` lines 78-97
- **Duration**: 10 seconds
- **Screenshot**: `13-lead-sheet.png`

**Shot 12: Campaign Actions**
- **File**: `components/campaigns/campaign-actions.tsx` lines 35-62
- **Duration**: 10 seconds
- **Screenshot**: `14-campaign-actions.png`

**Shot 13: State Management**
- **File**: `stores/ui.ts` lines 76-130
- **Duration**: 8 seconds
- **Screenshot**: `15-state-management.png`

### [1:20-2:30] Live Application Demo
**Shot 14: Login Page**
- **File**: Browser showing login page
- **Duration**: 8 seconds
- **Screenshot**: `16-login-page.png`

**Shot 15: Google OAuth Button**
- **File**: Highlight "Continue with Google" button
- **Duration**: 5 seconds
- **Screenshot**: `17-google-oauth.png`

**Shot 16: Dashboard Overview**
- **File**: Dashboard with metrics cards
- **Duration**: 12 seconds
- **Screenshot**: `18-dashboard.png`

**Shot 17: Recent Activity**
- **File**: Recent activity feed
- **Duration**: 8 seconds
- **Screenshot**: `19-recent-activity.png`

**Shot 18: LinkedIn Accounts**
- **File**: LinkedIn accounts section
- **Duration**: 8 seconds
- **Screenshot**: `20-linkedin-accounts.png`

**Shot 19: Leads Page**
- **File**: Leads table with infinite scroll
- **Duration**: 10 seconds
- **Screenshot**: `21-leads-page.png`

**Shot 20: Search Functionality**
- **File**: Demonstrate search in leads
- **Duration**: 8 seconds
- **Screenshot**: `22-leads-search.png`

**Shot 21: Lead Side Sheet**
- **File**: Click lead to open side sheet
- **Duration**: 15 seconds
- **Screenshot**: `23-lead-sheet-open.png`

**Shot 22: Lead Details**
- **File**: Show lead details and interactions
- **Duration**: 12 seconds
- **Screenshot**: `24-lead-details.png`

**Shot 23: Status Update**
- **File**: Demonstrate status update
- **Duration**: 8 seconds
- **Screenshot**: `25-status-update.png`

**Shot 24: Campaigns Page**
- **File**: Campaigns table with progress bars
- **Duration**: 12 seconds
- **Screenshot**: `26-campaigns-page.png`

**Shot 25: Campaign Actions**
- **File**: Show campaign actions dropdown
- **Duration**: 8 seconds
- **Screenshot**: `27-campaign-actions.png`

**Shot 26: Campaign Details**
- **File**: Click campaign to show details
- **Duration**: 15 seconds
- **Screenshot**: `28-campaign-details.png`

**Shot 27: Campaign Tabs**
- **File**: Show overview, leads, sequence, settings tabs
- **Duration**: 12 seconds
- **Screenshot**: `29-campaign-tabs.png`

**Shot 28: Messages Page**
- **File**: Messages management page
- **Duration**: 8 seconds
- **Screenshot**: `30-messages-page.png`

**Shot 29: Settings Page**
- **File**: Settings and billing page
- **Duration**: 8 seconds
- **Screenshot**: `31-settings-page.png`

### [2:30-3:00] Technical Highlights
**Shot 30: Pagination Code**
- **File**: Show cursor-based pagination implementation
- **Duration**: 10 seconds
- **Screenshot**: `32-pagination-code.png`

**Shot 31: Error Handling**
- **File**: Show error handling examples
- **Duration**: 8 seconds
- **Screenshot**: `33-error-handling.png`

**Shot 32: Loading States**
- **File**: Show loading state implementations
- **Duration**: 8 seconds
- **Screenshot**: `34-loading-states.png`

**Shot 33: Final Dashboard**
- **File**: Final dashboard view
- **Duration**: 6 seconds
- **Screenshot**: `35-final-dashboard.png`

## Recording Commands

### Terminal Commands
```bash
# Start development server
npm run dev

# Seed database (if needed)
npm run setup

# Check server status
curl http://localhost:3000/api/health
```

### Browser Navigation
1. Open `http://localhost:3000`
2. Navigate to `/login`
3. Navigate to `/dashboard`
4. Navigate to `/leads`
5. Navigate to `/campaigns`
6. Navigate to `/messages`
7. Navigate to `/settings`

### API Testing
```bash
# Test leads API
curl "http://localhost:3000/api/leads?limit=5"

# Test campaigns API
curl "http://localhost:3000/api/campaigns"

# Test authentication
curl -X POST "http://localhost:3000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Screenshot Specifications
- **Resolution**: 1920x1080 (1080p)
- **Format**: PNG
- **Naming**: `##-description.png` (e.g., `01-server-start.png`)
- **Quality**: High (lossless)

## Recording Tips
1. **Use consistent viewport size** (1920x1080)
2. **Highlight important elements** with cursor
3. **Smooth transitions** between shots
4. **Clear audio** with minimal background noise
5. **Consistent lighting** throughout recording
6. **Test all interactions** before recording
7. **Have backup screenshots** ready