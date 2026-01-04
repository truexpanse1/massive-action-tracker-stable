# Coaching Page Redesign - TODO

## Phase 2: Header Cleanup
- [ ] Remove "Join Community" button from header
- [ ] Compact header navigation

## Phase 3: Layout Restructure
- [ ] Rebuild CoachingPage.tsx with new layout:
  - [ ] Compact header (top)
  - [ ] Calendar + sidebar (left)
  - [ ] Content area (right)
- [ ] Create sidebar tabs: "Coaching Notes" | "Assignments"
- [ ] Implement tab switching logic

## Phase 4: Assignments Tab
- [ ] Create AssignmentsTab component
- [ ] Show Pending assignments
- [ ] Show In Progress assignments
- [ ] Show Completed assignments (only when tab selected)
- [ ] Each assignment clickable → detail popup

## Phase 5: Calendar Sync
- [ ] Add dots to calendar for dates with notes
- [ ] Add dots to calendar for dates with assignments
- [ ] Add dots to calendar for dates with completed assignments
- [ ] Click date → filter notes/assignments to that date

## Phase 6: Implement Now - Remove 3-Item Limit
- [ ] Make Implement Now scrollable container
- [ ] Remove max-height: 3 items restriction
- [ ] Show all active targets
- [ ] Keep compact styling

## Phase 7: Coach Notes Integration
- [ ] When coach note received, show in sidebar
- [ ] Option 1: "Save to Coaching Notes" → merges into journal
- [ ] Option 2: "Dismiss" → removes from view
- [ ] Sync with calendar (show dot on date)

## Phase 8: Testing & Deployment
- [ ] Test as team member (see "Coaching Notes & Assignments" title)
- [ ] Test as individual user (see "Coaching Notes & Journal" title)
- [ ] Test calendar sync with all three types (notes/assignments/completed)
- [ ] Test Implement Now with many items
- [ ] Deploy to production
# Coaching Page Redesign Complete
