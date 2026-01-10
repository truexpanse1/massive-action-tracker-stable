# AI-Powered Proposal System - Implementation Guide

## 🎉 System Overview

The AI-Powered Proposal System allows you to generate hyper-targeted business proposals directly from your Hot Leads page using Dream Client Profile data. The system creates beautiful, personalized proposals with unique shareable URLs.

## ✅ What's Been Implemented

### 1. Database Schema (Supabase)
- ✅ `service_packages` table - Reusable service package templates
- ✅ `proposals` table - AI-generated proposals linked to hot leads and avatars
- ✅ `proposal_count` column added to `hot_leads` table
- ✅ Row Level Security policies configured
- ✅ Automatic triggers for updated_at timestamps
- ✅ Automatic proposal counting trigger

**Migration File:** `/migrations/add_proposals_system_v2.sql`

### 2. API Services
**File:** `/src/services/proposalService.ts`

Functions implemented:
- `generateProposalSlug()` - Creates unique URLs
- `fetchServicePackages()` - Get all service packages
- `createServicePackage()` - Create new package templates
- `generateProposalContent()` - AI-powered content generation using Gemini
- `createProposal()` - Save proposal to database
- `fetchProposalsByHotLead()` - Get proposals for a specific lead
- `fetchProposalBySlug()` - Public proposal retrieval (with view tracking)
- `updateProposalStatus()` - Update proposal status (sent, viewed, accepted)
- `fetchCompanyProposals()` - Get all proposals for a company

### 3. UI Components

#### ProposalBuilderModal
**File:** `/components/ProposalBuilderModal.tsx`

3-step wizard for generating proposals:
1. **Select Dream Client Profile** - Choose matching avatar
2. **Select Service Package** - Pick from templates
3. **Customize & Generate** - Adjust pricing and services, then generate AI content

#### Hot Leads Integration
**File:** `/pages/HotLeadsPage.tsx` (modified)

- Added purple "📄 Proposal" button next to each hot lead
- Opens ProposalBuilderModal when clicked
- Displays proposal count badge (future enhancement)

#### Public Proposal View
**File:** `/pages/ProposalViewPage.tsx`

Beautiful public-facing proposal page with:
- **The Challenge** section (AI-generated from pain points + fears)
- **Your Vision** section (AI-generated from goals + dreams + desires)
- **Our Solution** section (AI-generated addressing objections + buying triggers)
- Service cards with expandable details
- Investment/pricing display
- "Accept Proposal" and "Request More Info" buttons
- E-signature capture
- View count tracking
- Accepted status display

## 🚀 How to Use

### Step 1: Create Dream Client Profiles
1. Go to **Dream Client Studio**
2. Create buyer avatars with:
   - Pain points
   - Fears
   - Goals
   - Dreams
   - Desires
   - Buying triggers
   - Objections

### Step 2: Create Service Package Templates (Optional)
You can create reusable service package templates in the Service Library (to be built), or customize packages on-the-fly in the proposal builder.

### Step 3: Generate a Proposal
1. Go to **Hot Leads** page
2. Click the purple **"📄 Proposal"** button next to any lead
3. **Select Dream Client Profile** that matches the lead
4. **Select Service Package** template
5. **Customize** pricing and services if needed
6. Click **"Generate Proposal"**
7. AI will create personalized content based on avatar data
8. Proposal is saved with a unique URL

### Step 4: Share the Proposal
1. Copy the unique proposal URL (e.g., `massiveactiontracker.com/proposal/advanced-hvac-abc123`)
2. Send to your prospect via email or text
3. Track views in real-time
4. Get notified when they accept

### Step 5: Track & Close
- View all proposals in "My Proposals" dashboard (to be built)
- See view counts and timestamps
- Track acceptance status
- Follow up on viewed but not accepted proposals

## 🎨 AI Content Generation

The system uses Gemini AI to generate three key sections:

### 1. Problem Analysis
**Input:** Avatar's pain points + fears  
**Output:** 2-3 persuasive paragraphs acknowledging challenges and creating urgency

### 2. Goals Content
**Input:** Avatar's goals + dreams + desires  
**Output:** 2-3 inspiring paragraphs painting a vision of success

### 3. Solution Narrative
**Input:** Service details + buying triggers + objections  
**Output:** 3-4 confident paragraphs explaining how services solve problems

## 📊 Database Schema

### service_packages
```sql
id                UUID PRIMARY KEY
company_id        UUID (references companies)
user_id           UUID (references users)
package_name      TEXT
description       TEXT
category          TEXT (e.g., 'coaching', 'marketing', 'hvac')
industry          TEXT
pricing_model     TEXT ('monthly', 'one-time', 'annual')
price             DECIMAL(10, 2)
services          JSONB (array of service objects)
is_template       BOOLEAN
is_active         BOOLEAN
usage_count       INTEGER
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
```

### proposals
```sql
id                      UUID PRIMARY KEY
company_id              UUID (references companies)
user_id                 UUID (references users)
hot_lead_id             BIGINT (references hot_leads)
avatar_id               UUID (references buyer_avatars)
service_package_id      UUID (references service_packages)
company_name            TEXT
contact_name            TEXT
contact_email           TEXT
contact_phone           TEXT
industry                TEXT
ai_problem_analysis     TEXT (AI-generated)
ai_goals_content        TEXT (AI-generated)
ai_solution_narrative   TEXT (AI-generated)
services                JSONB
pricing_model           TEXT
price                   DECIMAL(10, 2)
slug                    TEXT UNIQUE (for public URL)
status                  TEXT ('draft', 'sent', 'viewed', 'accepted', 'rejected')
view_count              INTEGER
last_viewed_at          TIMESTAMPTZ
sent_at                 TIMESTAMPTZ
accepted_at             TIMESTAMPTZ
acceptance_notes        TEXT
acceptance_signature    TEXT
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```

## 🔧 Next Steps (Future Enhancements)

### Phase 1: Core Functionality (COMPLETED ✅)
- [x] Database migration
- [x] API service functions
- [x] Proposal builder modal
- [x] Hot Leads integration
- [x] Public proposal view page

### Phase 2: Service Library (TODO)
- [ ] Create Service Library page
- [ ] Add CRUD operations for service packages
- [ ] Pre-populate with 10 industry templates
- [ ] Add AI-enhanced service descriptions

### Phase 3: Proposal Management (TODO)
- [ ] Create "My Proposals" dashboard
- [ ] Display all proposals with filters
- [ ] Show analytics (views, acceptance rate)
- [ ] Add email notification system
- [ ] Add proposal editing capability

### Phase 4: Advanced Features (TODO)
- [ ] Proposal templates with custom branding
- [ ] PDF export functionality
- [ ] Payment integration (Stripe)
- [ ] Analytics dashboard
- [ ] A/B testing for proposal variations

## 🐛 Troubleshooting

### Proposal Builder Not Opening
- Check that user object is being passed correctly
- Verify Supabase connection
- Check browser console for errors

### AI Content Not Generating
- Verify Gemini API key is set in environment variables
- Check that avatar has required fields (pain_points, goals, etc.)
- Review geminiService.ts for API errors

### Proposal Not Found (404)
- Verify slug is correct
- Check RLS policies in Supabase
- Ensure proposal status allows public viewing

### View Count Not Incrementing
- Check that fetchProposalBySlug() is being called
- Verify database trigger is working
- Check Supabase logs for errors

## 📝 Notes

- **Schema Compatibility:** The system uses BIGINT for `hot_leads.id` and UUID for all other tables
- **RLS Policies:** Public can view proposals by slug, but only company members can create/edit
- **AI Cost:** Each proposal generation makes 3 Gemini API calls (~$0.01 per proposal)
- **View Tracking:** Views are tracked automatically when proposal is loaded via slug
- **Acceptance Flow:** Requires signature before acceptance is recorded

## 🎯 Example Use Case

**Scenario:** Advanced Heating & Cooling (HVAC company)

1. **Create Avatar:** "Homeowner Hank" - 45-55, owns home, fears high energy bills, desires comfort
2. **Create Package:** "HVAC Marketing Package" - $850/month
3. **Generate Proposal:**
   - Select "Homeowner Hank" avatar
   - Choose "HVAC Marketing Package"
   - AI generates content addressing Hank's fears and goals
   - Creates unique URL: `mat.com/proposal/advanced-hvac-a3f9b2`
4. **Share & Close:**
   - Email proposal link to prospect
   - Track 3 views over 2 days
   - Prospect accepts with e-signature
   - Status updates to "accepted"
   - Follow up to onboard new client

## 🔐 Security Considerations

- ✅ Row Level Security enabled on all tables
- ✅ Public proposals accessible only via slug (not enumerable)
- ✅ User authentication required for creation/editing
- ✅ Company isolation enforced at database level
- ✅ Input validation on all forms
- ⚠️ TODO: Rate limiting on proposal generation
- ⚠️ TODO: CAPTCHA on proposal acceptance form

## 📚 Related Files

- `/migrations/add_proposals_system_v2.sql` - Database migration
- `/src/services/proposalService.ts` - API functions
- `/src/services/geminiService.ts` - AI integration
- `/components/ProposalBuilderModal.tsx` - Builder UI
- `/pages/HotLeadsPage.tsx` - Integration point
- `/pages/ProposalViewPage.tsx` - Public view
- `/src/marketingTypes.ts` - TypeScript interfaces

---

**Created:** January 10, 2026  
**Status:** Core functionality complete, ready for testing  
**Next:** Build Service Library and My Proposals dashboard
