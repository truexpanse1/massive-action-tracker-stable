# Adopt Plan Feature - User Guide

**Feature:** Daily Plan Adoption & Commitment System
**Date:** January 6, 2026
**Version:** 1.0

## Overview

The **Adopt Plan** feature transforms your calculated sales targets from the Massive Action Targets page into a persistent, visible commitment on your Prospecting Page. This creates a powerful accountability mechanism that keeps your daily goals front and center every time you work.

## How It Works

### Step 1: Calculate Your Targets

1. Navigate to **Massive Action Targets** page
2. Fill in your inputs:
   - Annual revenue goal
   - Average deal size
   - Working days per year
   - Sales cycle length
   - Conversion rates
   - Activity ratios
3. Click **"📊 Calculate My Plan"**
4. Review your daily, weekly, monthly, and annual targets

### Step 2: Adopt Your Plan

Once you see your calculated plan:

1. Scroll to the bottom of the results
2. Find the **"🎯 Ready to Commit?"** section
3. Click the **"🚀 Adopt This Plan"** button
4. Wait for confirmation: **"✅ Plan Adopted!"**
5. You'll see a success message confirming your plan is active

**What Happens:**
- Your daily targets are saved to the database
- The adoption date is recorded
- The button turns green and shows "✅ Plan Adopted!"
- Your plan is now visible on the Prospecting Page

### Step 3: See Your Plan Every Day

1. Navigate to **Prospecting** page
2. Look for the **"📋 YOUR DAILY PLAN"** section
3. You'll see:
   - Your daily targets for Calls, Talks, Meetings, Demos
   - Real-time progress bars showing how you're doing today
   - The date you adopted this plan
   - A "⚙️ Change Plan" button if you need to adjust

**Your plan stays visible every day until you change it.**

## Key Features

### Commitment Device
- Clicking "Adopt Plan" is a psychological commitment
- Makes your goals visible and concrete
- Creates accountability to yourself

### Persistent Visibility
- Your plan shows up every day on the Prospecting Page
- No need to remember or recalculate
- Always know what you need to do today

### Easy Updates
- Recalculate anytime on Massive Action Targets page
- Click "Adopt This Plan" again to update
- Old plan is replaced with new plan
- New adoption date is recorded

### Progress Tracking
- Real-time progress bars show completion percentage
- Green bars when you hit your target
- Lime green bars while you're working toward it
- Clear visual feedback on your performance

## User Journey Example

**Monday Morning:**
1. Calculate targets: $500K goal → 20 calls/day needed
2. Click "Adopt This Plan"
3. Go to Prospecting Page
4. See: "📋 YOUR DAILY PLAN (Adopted Jan 6, 2026)"
5. Start making calls, watch progress bars fill up

**Tuesday - Friday:**
1. Open Prospecting Page
2. Your plan is still there (no recalculation needed)
3. Track progress against your committed targets
4. Build consistency and momentum

**Next Month:**
1. Your conversion rate improved!
2. Recalculate: Now only need 15 calls/day
3. Click "Adopt This Plan" again
4. New plan replaces old plan
5. Keep building on your success

## Benefits

### For Individual Users
- ✅ Clear daily checklist
- ✅ No more guessing what to do
- ✅ Visual progress tracking
- ✅ Builds consistency over time
- ✅ Psychological commitment boost

### For Sales Managers
- ✅ See which reps have adopted plans
- ✅ Track plan adherence rates
- ✅ Know who needs coaching
- ✅ Accountability without micromanagement
- ✅ Data-driven performance reviews

## Technical Details

### What Gets Saved
- Daily calls target
- Daily contacts (talks) target
- Daily appointments target
- Daily demos target
- Daily deals target
- Daily revenue target
- Daily emails target
- Daily texts target
- Daily leads target
- Daily opportunities target
- Adoption date (timestamp)

### Where It's Stored
- Database table: `user_targets`
- Associated with your user ID
- Persists across sessions
- Updates when you adopt a new plan

### Data Flow
1. **Calculate** → Targets calculated in browser
2. **Adopt** → Targets saved to database with adoption date
3. **Display** → Prospecting Page loads targets from database
4. **Track** → Real-time progress calculated against saved targets

## Tips for Success

### Do This:
- ✅ Adopt a plan on Monday morning
- ✅ Check your progress throughout the day
- ✅ Recalculate monthly as your skills improve
- ✅ Use the plan as your daily checklist
- ✅ Celebrate when you hit your targets

### Don't Do This:
- ❌ Adopt a plan and never look at it
- ❌ Recalculate every day (creates confusion)
- ❌ Set unrealistic targets to impress others
- ❌ Ignore the plan when it gets hard
- ❌ Forget to update when your conversion rates change

## Frequently Asked Questions

**Q: Can I have multiple plans?**
A: Currently, you can have one active plan at a time. Adopting a new plan replaces the old one.

**Q: What if I want to change my plan?**
A: Go back to Massive Action Targets page, recalculate, and click "Adopt This Plan" again.

**Q: Does my plan expire?**
A: No, your plan stays active until you adopt a new one. It's designed for long-term consistency.

**Q: Can my manager see my plan?**
A: Your plan is associated with your user account. Manager visibility depends on your system permissions.

**Q: What if I don't hit my targets?**
A: That's okay! The plan helps you see where you are vs. where you need to be. Use it to improve over time.

**Q: Can I save multiple scenarios?**
A: Not yet, but this feature is planned for a future update (Phase 2).

## Future Enhancements (Planned)

### Phase 2
- Save multiple plan scenarios
- Choose plan duration (30/90/365 days)
- Plan expiration reminders
- Plan performance tracking
- Historical plan comparison

### Phase 3
- Auto-suggestions based on performance
- Plan templates for different goals
- Team benchmarking
- Manager dashboard for team plans

## Support

If you encounter any issues with the Adopt Plan feature:
1. Check that you've filled in all required fields on the calculator
2. Ensure you're logged in with a valid user account
3. Try refreshing the page and adopting again
4. Contact support at https://help.manus.im

## Summary

The Adopt Plan feature is simple but powerful:
1. **Calculate** your targets based on your revenue goal
2. **Adopt** the plan with one click
3. **See** your plan every day on the Prospecting Page
4. **Track** your progress in real-time
5. **Hit** your goals with consistency and accountability

**This is the difference between having a plan and being committed to a plan.**

Start using it today and watch your consistency improve! 🚀
