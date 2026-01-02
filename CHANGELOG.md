# MAT Changelog

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

### 🐛 Fixes in This Version
- Fixed: Lead Converter now works with localStorage data structure
- Fixed: Flame button enabled for company-only prospects
- Fixed: User prop passed to ProspectingPage
- Fixed: Targets now save to Supabase (not localStorage)
- Fixed: Targets persist across logout/login

### 📦 Restore Instructions

If anything breaks, restore this version:

```bash
git fetch --tags
git checkout v1.0-stable
npm install
npm run build
```

Or rollback in Netlify to commit: 17c0b10e

---

## Future Development

**v1.1 (In Development)**
- Feature: "Move to Next Day" button for prospects
- Feature: Auto-rollover uncontacted prospects at midnight
- Feature: Hybrid manual + automatic prospect management

---

**⚠️ IMPORTANT:** This is the GOLDEN MASTER version. All future changes must be:
1. Developed in a separate branch (e.g., feature/move-to-next-day)
2. Tested thoroughly
3. Reviewed before merging to main
4. Tagged with a new version number

Never modify or delete the v1.0-stable tag.
