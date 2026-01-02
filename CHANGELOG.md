# MAT Changelog

## v1.1-stable (2026-01-02) - Move to Next Day Feature 🚀

**Commit:** 462c3602  
**Deployed:** https://truexpansemat.com  
**Status:** LOCKED - FULLY TESTED

### ✨ New Feature: Move to Next Day

**Green ">" Button** - Replaces SA (Set Appointment)
- One-click move prospect to tomorrow
- Keeps all data: company, phone, email
- Keeps all codes: SW, NA, LM, ST, EP
- Moves to first empty slot in next day's list
- Shows success message with date
- Does NOT count as new prospect collected (honest KPI tracking)

**Why This Feature Matters:**
- No more lost leads - every prospect gets follow-up
- Maintains momentum on uncontacted prospects
- One click vs multiple steps (speed wins)
- Keeps full context (you see "I left a message yesterday")
- SA was redundant (flame button → hot leads → set appointment)

**Button Order:** SW | NA | LM | ST | EP | **>**

### ✅ All v1.0 Features Still Working

- Lead Converter (Excel/CSV + Google Maps)
- Flame Button (Hot Leads)
- Delete Button
- Massive Action Targets (persists across sessions)
- Progress Bars
- All core MAT functionality

---

## v1.0-stable (2026-01-02) - GOLDEN MASTER 🔒

**Commit:** 17c0b10e  
**Deployed:** https://truexpansemat.com  
**Status:** LOCKED - FULLY TESTED

### ✅ Confirmed Working Features

#### Lead Converter
- Imports prospects from Excel/CSV (tab-separated format)
- Imports prospects from Google Maps (multi-line format)
- Auto-detects format and parses correctly
- Extracts: Company name, Phone number, Email address
- Filters out junk data (directions, reviews, etc.)
- Preview table shows all extracted data before import
- Adds prospects to empty slots in prospecting list

#### Flame Button (Hot Leads)
- Marks prospects as Hot Leads
- Works with company-only prospects (no contact name required)
- Uses company name as contact name if missing
- Adds win notification when marking as hot lead
- Disabled only if both name AND company are empty

#### Delete Button
- Red X button on each prospect row
- Confirms deletion before removing
- Clears prospect data but keeps row structure
- Works on all prospects

#### Massive Action Targets
- Calculator for daily/weekly targets
- Progress bars for: Calls, Talks, Meetings, Demos, Deals
- Real-time progress tracking
- **Persists across logout/login sessions** (Supabase storage)
- Displays above Code Legend
- Syncs across devices

#### Core Functionality
- Prospecting page with editable table
- Calendar date selection
- KPI tracking
- Code buttons (SW, NA, LM, ST, EP, SA)
- Hot lead conversion
- All data persists in Supabase

### 🔧 Technical Details
- Framework: React + TypeScript
- Styling: Tailwind CSS
- Storage: Supabase (targets, day data, hot leads)
- Deployment: Netlify
- Repository: https://github.com/truexpanse1/massive-action-tracker-stable

### 🐛 Fixes in v1.0
- Fixed: Lead Converter now works with localStorage data structure
- Fixed: Flame button enabled for company-only prospects
- Fixed: User prop passed to ProspectingPage
- Fixed: Targets now save to Supabase (not localStorage)
- Fixed: Targets persist across logout/login

### 📦 Restore Instructions

To restore v1.1:
```bash
git fetch --tags
git checkout v1.1-stable
npm install
npm run build
```

To restore v1.0:
```bash
git fetch --tags
git checkout v1.0-stable
npm install
npm run build
```

Or rollback in Netlify to specific commit.

---

## Future Development

**Potential v1.2 Features:**
- Auto-rollover uncontacted prospects at midnight (optional)
- Bulk select and move multiple prospects
- Custom prospect priority levels
- Follow-up reminders

---

**⚠️ IMPORTANT:** These are GOLDEN MASTER versions. All future changes must be:
1. Developed in a separate branch (e.g., feature/feature-name)
2. Tested thoroughly
3. Reviewed before merging to main
4. Tagged with a new version number

Never modify or delete stable tags.
