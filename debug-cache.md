# Debug Steps for Campaign Leads Issue

## Current Status
✅ Component is properly implemented
✅ Database is seeded with data
✅ API routes are working
✅ No placeholder text in codebase

## What You Should See Now

When you navigate to **Campaign → Just Herbs → Leads tab**, you should see:

1. **Green box** with campaign ID and timestamp
2. **Blue box** saying "Test component is working!"
3. **Yellow box** saying "About to render CampaignLeads component..."
4. **Actual leads table** with data

## If You Still See Placeholder Text

### Step 1: Hard Refresh Browser
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Step 2: Clear Browser Cache
- Open Developer Tools (`F12`)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

### Step 3: Check Console
- Open Developer Tools (`F12`)
- Go to Console tab
- Look for these messages:
  - `🎯 CampaignDetailsPage rendered with campaignId: [ID]`
  - `CampaignLeads component rendered with campaignId: [ID]`

### Step 4: Verify URL
Make sure you're on the correct URL:
- Should be: `http://localhost:3000/campaigns/[campaign-id]`
- Campaign ID should be: `7731d903-e713-4324-9ef5-28dea165fbfc`

### Step 5: Check Network Tab
- Open Developer Tools (`F12`)
- Go to Network tab
- Refresh the page
- Look for API call to `/api/campaigns/[id]/leads`

## Expected Console Output
```
🎯 CampaignDetailsPage rendered with campaignId: 7731d903-e713-4324-9ef5-28dea165fbfc
CampaignLeads component rendered with campaignId: 7731d903-e713-4324-9ef5-28dea165fbfc
Fetching leads from: /api/campaigns/7731d903-e713-4324-9ef5-28dea165fbfc/leads?limit=20
Response status: 200
API Response: {leads: [...], nextCursor: "...", hasMore: true}
```

## If Still Not Working
1. Check if development server is running on `http://localhost:3000`
2. Try opening in incognito/private mode
3. Check if you're logged in (authentication required)
4. Share any console errors you see

