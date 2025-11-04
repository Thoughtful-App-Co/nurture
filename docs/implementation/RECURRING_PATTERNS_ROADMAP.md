# Recurring Patterns - Implementation Roadmap

**Feature**: STORY-021 - Recurring Interaction Patterns  
**Priority**: P0 - Critical for MVP  
**Timeline**: 4-6 weeks  
**Status**: Planning Phase

---

## Executive Summary

This roadmap outlines the 8-phase implementation plan for recurring interaction patterns. The feature is broken into incremental deliverables to allow for testing and iteration while maintaining development velocity.

**Total Estimated Time**: 160-240 hours (4-6 weeks with 1-2 engineers)

---

## Phase 1: Foundation (Week 1)

**Goal**: Core schema and data structures

**Duration**: 2-3 days

**Tasks**:
- [ ] Create `RecurringPattern` schema in `/jazz/schema.ts`
- [ ] Add `RecurringPatternList` to `UserProfile`
- [ ] Add `recurringPatternIds` and `totalRecurringHoursPerWeek` to `Contact`
- [ ] Write migration logic for existing users
- [ ] Unit tests for schema validation
- [ ] Test Jazz persistence and retrieval

**Deliverable**: Schema changes merged, migration tested

**Success Criteria**:
- RecurringPattern model can be created and persisted
- UserProfile.recurringPatterns list works correctly
- Migration runs successfully for existing users
- All unit tests pass

---

## Phase 2: Algorithm Integration (Week 1-2)

**Goal**: Make recurring patterns affect Dunbar calculations

**Duration**: 3-4 days

**Tasks**:
- [ ] Update `calculateInteractionScore()` in `/services/dataMining.ts`
  - Add recurringHoursPerWeek, recurringQuality, recurringIntensity parameters
  - Implement logarithmic time scoring
  - Apply quality and intensity multipliers
  - Add 2x weight for physical presence
- [ ] Create `aggregateRecurringPatternData()` helper in `/services/dunbarCalculator.ts`
  - Aggregate hours/week from multiple patterns
  - Calculate average quality
  - Determine highest intensity
- [ ] Update `calculateDunbarLayers()` to use recurring data
  - Call aggregateRecurringPatternData() for each contact
  - Pass recurring metrics to calculateInteractionScore()
  - Update totalRecurringHoursPerWeek on contact
- [ ] Write comprehensive unit tests
  - Roommate scenario (8 hrs/day → Layer 0)
  - Coworker scenario (40 hrs/week → Layer 1-2)
  - Sports team scenario (3 hrs/week → Layer 2-3)
  - Distant coworker (LOW quality/intensity → Layer 3-4)
  - Multiple pattern aggregation
- [ ] Integration tests for end-to-end flow

**Deliverable**: Algorithm correctly scores contacts with recurring patterns

**Success Criteria**:
- All unit tests pass with expected layer assignments
- Integration tests verify full flow (create pattern → recalculate layers)
- Performance: Recalculate 100 contacts in <1 second

---

## Phase 3: Contact-Level UI (Week 2)

**Goal**: Users can add standing patterns to individual contacts

**Duration**: 4-5 days

**Tasks**:
- [ ] Create `/components/relationships/StandingPatternSelector.tsx`
  - Template cards (Living Together, Work Colleagues, Regular Family Time, Custom)
  - Pattern configuration screen (hours slider, quality rating, intensity selector)
  - Date picker for start date
  - Notes input field
- [ ] Design and implement template cards with icons and descriptions
- [ ] Build hours slider with smart defaults (8 hrs/day, 40 hrs/week, etc.)
- [ ] Implement quality rating UI (1-5 stars with descriptions)
- [ ] Add intensity selector (LOW/MEDIUM/HIGH with explanations)
- [ ] Integrate with Contact Detail Modal
  - Add "Add Standing Pattern" button
  - Show active patterns as badges
  - Make pattern badges tappable (navigate to pattern detail)
- [ ] Implement edit pattern flow
- [ ] Implement delete pattern flow (with confirmation)
- [ ] Add confirmation screen showing layer changes after pattern creation
- [ ] Handle edge cases (hours = 0, future start date, etc.)

**Deliverable**: Users can mark roommates/coworkers from contact detail

**Success Criteria**:
- User can create pattern in <15 seconds
- Pattern immediately recalculates contact's layer
- Confirmation screen shows accurate layer change
- Pattern badge appears on contact card
- Edit/delete flows work correctly

---

## Phase 4: Group Activity UI (Week 3)

**Goal**: Users can create group activities with multiple contacts

**Duration**: 5-6 days

**Tasks**:
- [ ] Create `/components/relationships/GroupActivityScheduler.tsx`
  - Step 1: Contact search with multi-select
  - Step 2: Activity configuration
  - Step 3: Confirmation with impact summary
- [ ] Build multi-select contact search
  - Search bar with real-time filtering
  - Checkbox selection for multiple contacts
  - "Select All" for tag-based groups (#soccer, #work, etc.)
  - Selected count indicator
  - Remove button for each selected contact
- [ ] Create activity configuration screen
  - Activity name input
  - Activity type selector (Sports, Hobby, Work, Family, Social, Custom)
  - Frequency dropdown (Daily, Weekly, Biweekly, Monthly, Custom)
  - Days of week selector (for weekly patterns)
  - Time picker
  - Duration slider (hours)
  - Quality rating (1-5)
  - Intensity selector (LOW/MEDIUM/HIGH)
  - Auto-generate logs toggle (with explanation)
  - Start date picker
- [ ] Implement bulk contact update logic
  - Create pattern
  - Add pattern.id to all contactIds' recurringPatternIds arrays
  - Recalculate all affected contacts in batch
  - Update totalRecurringHoursPerWeek for each
- [ ] Build confirmation screen
  - Pattern created success message
  - Impact summary (X contacts updated, Y moved layers)
  - List of layer changes
  - Next occurrence date/time
  - "View Pattern" and "Close" buttons
- [ ] Add "Add Group Activity" entry point on dashboard
- [ ] Test with 10+ contacts in one pattern (performance)
- [ ] Handle edge cases (no contacts selected, overlapping patterns, etc.)

**Deliverable**: Users can create sports teams, work groups, etc.

**Success Criteria**:
- User can create group activity with 10 contacts in <60 seconds
- All 10 contacts update correctly
- Confirmation shows accurate impact summary
- Performance: Create pattern + recalculate 10 contacts in <500ms
- Overlapping pattern warning works

---

## Phase 5: Management UI (Week 3-4)

**Goal**: Users can view and manage all patterns

**Duration**: 3-4 days

**Tasks**:
- [ ] Create `/components/relationships/RecurringPatternsView.tsx`
  - List all active patterns (sorted by creation date)
  - Show ended/archived patterns in separate section
  - Pattern cards with summary info (title, hours, contacts count, schedule)
  - Tap to expand pattern detail
- [ ] Implement pattern detail view
  - Full pattern information
  - List of all contacts in pattern (with avatars)
  - Schedule details
  - Quality and intensity display
  - Statistics (total hours, duration, start date)
  - Edit and End buttons
- [ ] Add bulk edit functionality
  - Edit pattern → All contacts recalculate automatically
  - Show loading state during recalculation
  - Confirmation message after save
- [ ] Create "End Pattern" flow
  - Modal with date picker ("When did this pattern end?")
  - Explanation of what happens (stops auto-generation, recalculates scores)
  - Confirmation button
  - Retroactive score adjustment if end date is in past
- [ ] Add pattern deletion (with confirmation)
  - Warning: "This will remove pattern data from all contacts"
  - Two-step confirmation (type pattern name to confirm)
  - Hard delete (not recoverable)
- [ ] Show analytics
  - Total time commitment per week (all patterns)
  - Contacts affected count
  - Pattern longevity (how long it's been active)
  - Auto-generated interaction count
- [ ] Add navigation to this view from Dashboard

**Deliverable**: Complete pattern management interface

**Success Criteria**:
- User can view all active and ended patterns
- Pattern detail shows accurate information
- Bulk edit recalculates all contacts correctly
- End pattern flow retroactively adjusts scores
- Delete pattern removes all references from contacts
- Performance: Load 20 patterns in <300ms

---

## Phase 6: Auto-Generation (Week 4)

**Goal**: Recurring patterns auto-create interaction logs

**Duration**: 3-4 days

**Tasks**:
- [ ] Create `/services/recurringPatternService.ts`
  - `generateInteractionLogsFromPatterns()` function
  - `checkIfPatternOccursToday()` helper
  - Logic for each frequency type (DAILY, WEEKLY, BIWEEKLY, MONTHLY)
- [ ] Implement background task to run daily
  - Check all active patterns
  - Generate Interaction records for today's occurrences
  - Mark source as "automatic"
  - Update lastGeneratedDate on pattern
  - Log generation count for debugging
- [ ] Add user setting to enable/disable auto-generation (per pattern)
- [ ] Create UI indicator for auto-generated logs
  - Badge or icon on interaction card
  - Different color or style
  - Tooltip explaining it was auto-generated
- [ ] Allow users to edit auto-generated logs
  - Change quality rating
  - Add notes
  - Adjust duration
  - Delete if incorrect
- [ ] Handle edge cases
  - Pattern ended mid-week (don't generate for past days)
  - User timezone changes (adjust schedule)
  - First occurrence (don't generate for past dates)
- [ ] Test auto-generation with various schedules
  - Daily pattern
  - Weekly pattern (multiple days)
  - Biweekly pattern
  - Monthly pattern

**Deliverable**: Weekly soccer game auto-creates interaction logs

**Success Criteria**:
- Auto-generation runs daily without user intervention
- Correct occurrences generated based on schedule
- Auto-generated logs marked with source="automatic"
- Users can edit/delete auto-generated logs
- No duplicate logs generated
- Performance: Generate logs for 50 patterns in <2 seconds

---

## Phase 7: Polish & Testing (Week 4)

**Goal**: Production-ready feature

**Duration**: 3-4 days

**Tasks**:
- [ ] End-to-end testing
  - Test all 4 user flows (create contact-level, create group, edit, end)
  - Test with real-world scenarios (roommate, coworker, sports team)
  - Test edge cases (zero hours, future start, overlapping patterns)
  - Test performance with 100+ contacts, 20+ patterns
- [ ] Error handling and validation
  - Input validation (min hours, required fields)
  - Error messages (user-friendly, actionable)
  - Network error handling (Jazz sync failures)
  - Recovery from partial failures (pattern created but contacts not updated)
- [ ] Loading states and animations
  - Loading spinner during recalculation
  - Skeleton screens for pattern list
  - Progress indicators for bulk operations
  - Smooth transitions between screens
- [ ] Accessibility
  - Screen reader support (VoiceOver, TalkBack)
  - Keyboard navigation (for accessibility tools)
  - High contrast mode support
  - Focus indicators on interactive elements
  - ARIA labels for all buttons and inputs
- [ ] User documentation
  - Help text explaining each field
  - Tooltips for complex concepts (intensity, quality)
  - In-app tutorial (optional, dismissible)
  - Link to full documentation
- [ ] Analytics tracking
  - Pattern creation events (with type, frequency)
  - Edit and delete events
  - User flow abandonment (where do users drop off?)
  - Error events (validation failures, crashes)
  - Performance metrics (time to create, time to recalculate)
- [ ] Bug fixes and refinements
  - Fix any issues found during testing
  - Polish UI based on feedback
  - Optimize performance bottlenecks
  - Improve error messages

**Deliverable**: Feature ready for beta testing

**Success Criteria**:
- All user flows tested end-to-end without errors
- All edge cases handled gracefully
- Loading states and error messages clear and helpful
- Accessibility score >90 (via automated tools)
- Analytics events firing correctly
- No known critical bugs

---

## Phase 8: Beta & Iteration (Week 5-6)

**Goal**: Real-world validation and refinement

**Duration**: 1-2 weeks

**Tasks**:
- [ ] Deploy to beta users (50-100 users)
  - Feature flag: `ENABLE_RECURRING_PATTERNS`
  - Select diverse user base (roommates, coworkers, hobby groups)
  - Provide clear instructions and support channel
- [ ] Collect feedback
  - In-app survey after first pattern creation
  - Follow-up survey after 1 week of use
  - Direct feedback via support channel
  - Monitor analytics for adoption and engagement
- [ ] Monitor analytics
  - Adoption rate (% of users who create pattern)
  - Patterns per user (average)
  - Pattern types distribution (cohabitation, work, hobby, etc.)
  - Layer changes (% of contacts that moved layers)
  - Edit/delete rates
  - Auto-generation usage (% who enable it)
  - Time to create (average)
  - Drop-off points in user flows
- [ ] Identify pain points
  - Where are users getting stuck?
  - Which flows are confusing?
  - What errors are common?
  - What features are users requesting?
- [ ] Iterate on UI/UX
  - Simplify confusing flows
  - Add missing features (from user requests)
  - Improve error messages
  - Refine templates and defaults
  - Add smart suggestions (e.g., "We noticed you text Alex every day - do you live together?")
- [ ] Fix bugs
  - Address all critical bugs immediately
  - Prioritize bugs by frequency and severity
  - Re-test after each fix
- [ ] Optimize performance
  - Profile slow operations (using React DevTools, Jazz logs)
  - Optimize database queries
  - Add caching where appropriate
  - Reduce re-renders
- [ ] Prepare for full rollout
  - Document learnings from beta
  - Update user documentation based on feedback
  - Create rollout plan (gradual rollout vs big bang)
  - Prepare support team with FAQs
  - Write release notes and changelog

**Deliverable**: Validated, polished feature ready for all users

**Success Criteria**:
- 60% adoption rate among beta users (within 30 days)
- Average 2-3 patterns per active user
- User satisfaction rating >7/10 (from survey)
- Dunbar accuracy improvement reported by 70%+ of users
- <5% critical bug rate
- All beta feedback addressed or documented for future iteration
- Performance meets targets from Phase 7
- Ready for production deployment

---

## Post-Launch: Monitoring & Enhancement

**Ongoing Tasks**:
- [ ] Monitor production metrics
  - Weekly: Adoption rate, patterns per user, layer changes
  - Monthly: User satisfaction, retention, feature usage
  - Quarterly: Impact on Dunbar accuracy, long-term engagement
- [ ] Collect ongoing feedback
  - In-app feedback button
  - Support channel (email, chat)
  - User interviews (monthly, 5-10 users)
  - Community forum discussions
- [ ] Plan Phase 2 enhancements
  - Calendar integration (auto-detect recurring meetings)
  - Location-based detection (opt-in, privacy-first)
  - Smart suggestions (ML-based pattern detection)
  - Pattern templates library (user-submitted)
  - Intensity auto-adjustment (based on quality ratings over time)
  - Group pattern voting (for shared activities)

---

## Risk Mitigation

### Risk 1: Algorithm Tuning

**Risk**: Score thresholds may not work for all users  
**Mitigation**: 
- Extensive testing with diverse beta users
- A/B test different threshold values
- Allow manual layer override (with warning)
- Collect feedback on layer accuracy

### Risk 2: Performance at Scale

**Risk**: Recalculating 100+ contacts may be slow  
**Mitigation**:
- Batch operations in single Jazz transaction
- Debounce rapid changes (500ms delay)
- Cache aggregated hours/week per contact
- Background processing for non-critical updates
- Performance testing with large datasets

### Risk 3: User Confusion

**Risk**: Users may not understand quality vs intensity  
**Mitigation**:
- Clear in-app explanations and tooltips
- Examples for each level ("HIGH intensity = living together")
- Default values that work for most cases
- Smart templates with pre-configured settings
- User testing to validate clarity

### Risk 4: Data Integrity

**Risk**: Contacts deleted from device but still in pattern  
**Mitigation**:
- Cleanup function to remove invalid contactIds
- Warning in UI when contacts are missing
- Option to remove contacts from pattern
- Deactivate pattern if all contacts gone

### Risk 5: Auto-Generation Errors

**Risk**: Logs generated on wrong dates  
**Mitigation**:
- Extensive testing of schedule logic for each frequency
- Allow users to disable auto-generation per pattern
- Make auto-generated logs editable/deletable
- Clearly mark auto-generated logs (badge, color)
- Log generation errors for debugging

---

## Dependencies

### External Dependencies
- Jazz CoValues (schema support, list operations)
- React Native (UI components)
- Expo (date picker, slider components)
- TypeScript (type checking)

### Internal Dependencies
- `/services/dataMining.ts` (interaction scoring)
- `/services/dunbarCalculator.ts` (layer calculation)
- `/jazz/schema.ts` (data models)
- Contact Detail Modal (integration point)
- Dashboard (integration point)

### Team Dependencies
- Design team: UI mockups for all screens (needed by Phase 3)
- Product team: Approval of feature spec and roadmap
- QA team: Testing support during Phase 7
- Support team: Prepared for beta user feedback during Phase 8

---

## Success Criteria (Overall)

### Adoption Metrics
- ✅ 60% of active users create at least 1 recurring pattern (within 30 days)
- ✅ Average 2-3 patterns per active user
- ✅ 80% of patterns still active after 3 months

### Accuracy Metrics
- ✅ User-reported Dunbar accuracy improves from 70% → 85%
- ✅ Layer correction rate decreases by 50%
- ✅ 30% of contacts in patterns move up at least 1 layer

### Performance Metrics
- ✅ Create pattern (10 contacts) in <500ms
- ✅ Load recurring patterns dashboard in <300ms
- ✅ Auto-generate logs (50 patterns) in <2s

### Quality Metrics
- ✅ User satisfaction rating >7/10
- ✅ <5% critical bug rate
- ✅ Feature complete (all user flows working)

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Foundation | 2-3 days | Schema changes merged |
| Phase 2: Algorithm | 3-4 days | Algorithm correctly scores patterns |
| Phase 3: Contact UI | 4-5 days | Contact-level pattern selector |
| Phase 4: Group UI | 5-6 days | Group activity scheduler |
| Phase 5: Management UI | 3-4 days | Pattern management dashboard |
| Phase 6: Auto-Generation | 3-4 days | Auto-create interaction logs |
| Phase 7: Polish & Testing | 3-4 days | Production-ready feature |
| Phase 8: Beta & Iteration | 1-2 weeks | Validated, polished feature |
| **TOTAL** | **4-6 weeks** | **Ready for production** |

---

## Next Steps

1. ✅ Review and approve this roadmap
2. ⏳ Assign engineers to phases
3. ⏳ Create Jira tickets for each phase
4. ⏳ Schedule kickoff meeting
5. ⏳ Begin Phase 1 (schema changes)
6. ⏳ Weekly check-ins to track progress
7. ⏳ Demo after each phase (internal)
8. ⏳ Beta launch after Phase 7
9. ⏳ Full launch after Phase 8

---

**Questions? Contact the engineering team or product owner.**
