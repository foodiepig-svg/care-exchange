# Care Exchange — Detailed Use Cases

---

## Use Case 1: Send a Secure Referral (Participant)

### Actor
Priya Sharma, NDIS participant with self-managed plan

### Trigger
Priya wants to refer her new Occupational Therapist to her existing Support Coordinator

### Preconditions
- Priya has an active Care Exchange account
- OT provider is registered on the platform
- Priya has an active care record with goals and history

### Steps
1. Priya logs into Care Exchange dashboard
2. Clicks "Send Referral"
3. Selects "My Occupational Therapist" from provider directory
4. Chooses which sections of her care record to share:
   - Goals: checked
   - Progress notes: checked
   - Equipment: unchecked
   - Medical history: unchecked
5. Sets link expiry: 7 days
6. Sets access level: "Active care team"
7. Adds personal note: "Please see my current goals — working on fine motor skills for keyboarding"
8. Selects delivery method: Email + SMS
9. Confirms and sends
10. Receives confirmation: "Referral link sent to Apex Allied Health"

### Postconditions
- OT receives secure link via email and SMS
- OT account is automatically linked as "Active" on Priya's care record
- Priya's care team view updates to show OT as active
- All future updates from OT will be visible to Priya

### Extensions
- **4a.** Priya accidentally unchecked goals → edits referral before OT accepts
- **6a.** Priya wants to limit to "View only" → changes access level
- **8a.** OT not registered → referral sent to OT's email as a guest invitation

---

## Use Case 2: Accept a Referral (Provider)

### Actor
Rachel O'Connor, Operations Manager at Apex Allied Health

### Trigger
Rachel's intake team receives a referral link notification for a new participant

### Preconditions
- Provider organisation is registered on Care Exchange
- Provider has received referral link (email/SMS)

### Steps
1. Rachel's intake team clicks the secure link in the email
2. Directed to Care Exchange login/registration page
3. Intake coordinator logs in with organisation credentials
4. Reviews referral contents:
   - Participant goals
   - Current provider notes
   - Plan details and remaining hours
   - Consent permissions
5. Clicks "Accept Referral"
6. System prompts to assign a therapist: selects "Sarah Wellington, Physio"
7. Sarah receives in-app notification and email
8. Rachel confirms to Priya: "Referral accepted — Sarah will be in touch within 48 hours"

### Postconditions
- Referral status changes to "Accepted"
- Therapist (Sarah) is linked to participant's care record
- Participant (Priya) receives notification that referral was accepted
- Therapist has access to shared care record per consent settings

### Extensions
- **4a.** Incomplete information → intake coordinator requests additional info via platform
- **6a.** Wrong therapist assigned → Rachel reassigns before first session
- **7a.** Provider declines referral → selects reason: "Outside our service area"

---

## Use Case 3: Submit a Structured Progress Update (Therapist)

### Actor
Sarah Wellington, Physiotherapist

### Trigger
Sarah has just finished a session with participant Jay Tan and needs to document progress

### Preconditions
- Sarah has an active Care Exchange provider account
- Jay Tan is an active participant on her caseload
- Jay's goals are loaded in the platform with progress tracking enabled

### Steps
1. Sarah opens Care Exchange provider dashboard
2. Selects "Update" next to Jay Tan's name
3. System shows Jay's active goals:
   - Goal 1: Standing tolerance (current: 8 min, target: 20 min)
   - Goal 2: Walking distance (current: 50m, target: 200m)
4. Sarah selects update category: "Progress Update"
5. System presents structured format:
   - What's working: [free text]
   - What's not working: [free text]
   - Goal 1 progress: [slider 0-100%]
   - Goal 2 progress: [slider 0-100%]
   - Next session focus: [free text]
6. Sarah fills:
   - What's working: "Hip stability improving, participant tolerating 8 min standing with minimal support"
   - What's not working: "Fatigue at end of session reduces quality of last 5 min"
   - Goal 1: moves slider to 40% (was 35%)
   - Goal 2: moves slider to 25% (was 22%)
   - Next session: "Introduce walker for longer distance practice"
7. Clicks "Submit Update"
8. System notifies: Jay's care team (family + coordinator)

### Postconditions
- Progress update is saved to Jay's care record
- Jay's goal progress timeline is updated with new data point
- Jay's family and Support Coordinator receive notification
- Update appears in Jay's care timeline view

### Extensions
- **5a.** Sarah needs to log an incident → selects "Incident Report" category instead
- **6a.** Goal achieved → Sarah marks goal as "Achieved" with final measurement
- **7a.** Jay's plan has ended → system warns Sarah, prompts plan review flag

---

## Use Case 4: Review Care Team Activity (Support Coordinator)

### Actor
David Chen, Support Coordinator with 22-participant caseload

### Trigger
David starts his week and wants to review his caseload for any issues

### Preconditions
- David has an active Care Exchange coordinator account
- His 22 participants are all on the platform with active care teams

### Steps
1. David logs in Monday morning
2. Opens "Caseload Overview" dashboard
3. System displays each participant with status indicators:
   - Green: All active providers submitted update in last 14 days
   - Amber: No update in 15-30 days
   - Red: No update in 30+ days OR referral pending response
4. David sees 3 amber alerts, 0 red alerts
5. Clicks first amber: "Mia Santos — OT update overdue (19 days)"
6. System shows: Last update was OT session on [date], no progress note submitted
7. David clicks "Request Update" — sends nudge to OT
8. Repeats for other amber cases
9. Reviews weekly digest email (sent automatically Sunday night)

### Postconditions
- Requested providers receive nudge notification
- David's caseload health score updates
- All activity is logged for compliance/audit purposes

### Extensions
- **3a.** Red alert — provider declined referral → David calls participant to discuss alternatives
- **7a.** OT has left the organisation → David reassigns to new OT and notifies participant
- **9a.** David's leave is approved → delegates caseload access to colleague with read-only access

---

## Use Case 5: NDIS Plan Review Preparation (Provider Manager)

### Actor
Rachel O'Connor, preparing for participant plan review

### Trigger
NDIS has scheduled a plan review for participant Priya Sharma in 3 weeks

### Preconditions
- Apex Allied Health has been providing services to Priya for 6 months
- Care Exchange has 6 months of structured updates stored

### Steps
1. Rachel opens Care Exchange provider dashboard
2. Selects "Plan Review Prep" for Priya Sharma
3. System generates Plan Review Report containing:
   - All goals set at last plan review with progress percentages
   - Goal-by-goal analysis: start date, current status, trajectory
   - Service utilisation: sessions attended vs plan hours used
   - Key achievements documented across all providers
   - Provider recommendations for continued funding
4. Rachel reviews and adds her professional summary: "Priya has made significant progress on her OT goals. Recommend continued Core Supports at current level."
5. Clicks "Finalise and Share"
6. System generates PDF report
7. Rachel sends to Priya for review and approval
8. Priya approves — report is locked and timestamped
9. Priya shares with Support Coordinator and NDIS planner

### Postconditions
- Report is generated with cryptographic timestamp
- All contributing providers are listed with their contributions
- Report cannot be altered after Priya's approval
- Audit trail confirms report was generated on [date]

### Extensions
- **4a.** One provider hasn't submitted updates → system highlights gap, Rachel contacts provider
- **8a.** Priya disagrees with a measurement → can add participant comment to report
- **9a.** NDIS requests raw data → providers can export their individual updates

---

## Use Case 6: Transition from Pediatric to Adult Services (Family + Coordinator)

### Actor
Michael Tan (father) and David Chen (Support Coordinator) transitioning Jay Tan

### Trigger
Jay turns 18 and must transition from pediatric to adult disability services

### Preconditions
- Jay is turning 18 in 3 months
- Pediatric services are active on Care Exchange
- Adult service providers have been identified

### Steps
1. David Chen reviews Jay's transition plan in Care Exchange
2. Flags 3 months before transition date: "Transition: Pediatric → Adult"
3. David creates "Transition Record" in platform
4. Adds all pediatric provider final summaries to the record
5. Creates referral to adult OT, physio, and support coordinator
6. Sends transition record + referrals to adult services
7. Michael Tan reviews and approves the shared information
8. Adult providers accept referrals and review history
9. Pediatric services are marked "Completed" with final notes
10. Adult services marked "Active" on Jay's care record

### Postconditions
- Complete care history is transferred with participant consent
- Jay's new care team has full context without gaps
- Transition is documented with timestamps for NDIS records
- Both Jay and Michael have ongoing read access to history

### Extensions
- **5a.** One adult provider is not on the platform → PDF export generated for manual handover
- **7a.** Michael wants to redact some pediatric notes → exercises right to limit shared information
- **9a.** Adult services discover gaps in information → coordinators can request specific records

---

## Use Case 7: Incident Reporting (Therapist)

### Actor
Sarah Wellington needs to report a participant fall during a session

### Trigger
Jay Tan falls during a physiotherapy session at the clinic

### Preconditions
- Sarah has an active session logged with Jay
- Incident reporting is enabled for Jay's care team

### Steps
1. Sarah clicks "Log Incident" on Jay's care record
2. Selects incident type: "Participant Fall"
3. System shows structured incident report form:
   - Date/time: pre-filled from session log
   - Location: pre-filled
   - Severity: [Minor / Moderate / Severe]
   - Description: [free text]
   - Immediate action taken: [free text]
   - Medical attention required: [Yes/No]
   - NDIS Commission reportable: [Auto-assessed based on answers]
4. Sarah fills:
   - Severity: "Minor"
   - Description: "Participant lost balance while reaching for gait aid, control led to seated position. No impact, no visible injury."
   - Immediate action: "Assisted to seated position, monitored for 10 minutes, no symptoms of concussion."
   - Medical attention: "Not required"
5. System auto-assesses: "Not NDIS Commission reportable (minor, no injury)"
6. Sarah submits
7. System notifies: Jay's care team + Support Coordinator David
8. Incident is flagged on Jay's record with amber indicator

### Postconditions
- Incident is logged with full audit trail (timestamp, author, content)
- Jay's care team is notified immediately
- Medical history updated with incident record
- Incident appears in future plan reviews as context

### Extensions
- **4a.** Moderate injury → system flags as "Potentially NDIS Commission reportable" with guidance
- **4b.** Severe injury → system immediately flags "NDIS Commission reportable — see guidance"
- **7a.** Jay's family wants to add their account → they receive notification and can view

---

## Use Case 8: Manage Family Access Permissions (Participant)

### Actor
Michael Tan wants to give his wife partial access to Jay's care record

### Trigger
Michael's wife (Lisa) wants to see updates but Michael wants to limit her access

### Preconditions
- Michael is listed as Jay's primary family contact on Care Exchange
- Lisa is not yet linked to Jay's care record

### Steps
1. Michael logs into Care Exchange
2. Opens Jay's care record → "Manage Access"
3. Clicks "Add Family Member"
4. Enters Lisa's email and name
5. Sets permission level: "Read-only"
6. Sets scope: "Progress updates and goal progress only"
7. Excludes: "Incident reports", "Financial information", "Full care plan"
8. Sets expiry: "12 months" (auto-renew)
9. Lisa receives email: "Michael Tan has invited you to view Jay's care updates"
10. Lisa clicks link, creates account, sees only permitted content

### Postconditions
- Lisa has read-only access to permitted sections
- Michael can revoke access at any time
- Lisa does not see incidents, financial data, or full medical notes
- Access is logged in audit trail

### Extensions
- **6a.** Michael wants Lisa to also receive notifications → enables "Email updates"
- **8a.** Jay (18) has capacity and approves → Jay must consent to Lisa's access
- **10a.** Lisa's access expires → Michael receives notification to review and renew

---

## Use Case 9: Verify Service Delivery for Plan Management (Plan Manager)

### Actor
James Blackwood, Plan Manager, needs to reconcile invoices against actual service delivery

### Trigger
Apex Allied Health submits a monthly invoice for services to Jay Tan

### Preconditions
- Jay's NDIS plan is plan-managed by Blackwood Plan Management
- Apex Allied Health is registered as a provider on Care Exchange
- Jay has active consent linking his care record to plan management

### Steps
1. James receives invoice from Apex Allied Health via Care Exchange
2. Invoice line items are pre-linked to service records:
   - Physiotherapy Session 2024-03-15 → matched to Progress Update submitted by Sarah
   - Physiotherapy Session 2024-03-22 → matched to Progress Update submitted by Sarah
3. James reviews each line:
   - Date, duration, provider name, goal addressed
   - All match corresponding progress updates in Jay's care record
4. James approves payment
5. System records: Invoice #1234 paid on [date]
6. Participant (Jay) receives statement notification: "Physiotherapy — Apex Allied Health — $185.00"

### Postconditions
- Invoice is matched to service delivery records
- Payment record is logged in Jay's care record audit trail
- Jay has full visibility of claimed services
- Audit trail is complete for NDIS Commission

### Extensions
- **3a.** Invoice line has no matching service record → flagged for James to query with provider
- **5a.** James identifies underspend → flagged in plan management dashboard for proactive contact

---

## Use Case 10: Provider Joins via Invitation Link (New Provider Onboarding)

### Actor
A new allied health provider (Complete Care Psychology) wants to join Care Exchange

### Trigger
Rachel O'Connor sends an invitation to Complete Care Psychology to join the platform

### Preconditions
- Apex Allied Health (Rachel) is a registered Care Exchange organisation
- Complete Care Psychology is not yet on the platform

### Steps
1. Rachel enters Complete Care Psychology's email in Care Exchange
2. Selects role: "Provider"
3. Adds organisation details: name, ABN, service type
4. Clicks "Send Invitation"
5. Complete Care receives email: "Apex Allied Health invites you to join Care Exchange"
6. Practice Manager clicks link, registers organisation
7. Verifies ABN and NDIS registration
8. Creates provider admin account
9. System confirms to Rachel: "Complete Care Psychology has joined"
10. Rachel can now send referrals to Complete Care via the platform

### Postconditions
- Complete Care Psychology is now a verified provider on Care Exchange
- Organisation appears in directory for all participants
- Can receive and accept referrals from any participant

### Extensions
- **6a.** Provider already registered → email contains "Already a member? Link your organisations"
- **7a.** ABN verification fails → provider must complete manual verification

---

## Use Case 11: Goal Setting with Participant (Collaborative)

### Actor
Priya Sharma and her Support Coordinator David set new goals together

### Trigger
Priya's NDIS plan has been updated and she has new funding for capacity-building goals

### Preconditions
- Priya has an active Care Exchange account
- Priya and David are linked as participant-coordinator pair
- NDIS plan shows new capacity-building funding

### Steps
1. David initiates "Goal Setting Session" in Care Exchange
2. Selects participant: Priya Sharma
3. System shows Priya's existing goals and progress
4. David adds new goal framework based on plan:
   - Category: Capacity Building
   - Timeframe: 12 months
   - Measures: participant-defined with guided prompts
5. Priya adds her goal: "I want to use public transport independently"
6. System suggests breakdown into measurable steps:
   - Step 1: Identify route (1 week)
   - Step 2: Practice with support (4 weeks)
   - Step 3: Solo practice (6 weeks)
   - Step 4: Independent use (1 week)
7. David and Priya refine steps together
8. Priya sets the goal as "Active"
9. David assigns provider responsibility: "Travel training — Support Worker"
10. Assigned provider receives notification with goal details

### Postconditions
- Goal is set with participant at centre of definition
- Goal has measurable steps and timeline
- All linked providers can see goal and their role in it
- Progress tracking will be enabled on this goal

### Extensions
- **6a.** Priya's goal is unrealistic → system suggests scaling with guidance
- **9a.** No current provider for that service → flagged for David to source

---

## Use Case 12: Consent Revocation (Participant)

### Actor
Priya Sharma decides to revoke a provider's access to her care record

### Trigger
Priya has finished sessions with a psychologist and no longer wants them to have access

### Preconditions
- Psychologist is listed as an active provider on Priya's care record
- Consent was given when referral was originally sent

### Steps
1. Priya logs into Care Exchange
2. Opens "Care Team" view
3. Sees psychologist listed as "Active — Access until revoked"
4. Clicks "Manage Access" next to psychologist's name
5. Selects "Revoke Access"
6. System shows what will be revoked:
   - Access to all care record sections
   - Ability to submit updates
   - History of submitted updates will remain in record
7. Priya confirms: "Revoke access"
8. System notifies psychologist: "Priya Sharma has revoked your access"
9. Psychologist's account shows "Access Revoked" — can no longer view or update

### Postconditions
- Provider access is immediately terminated
- All previously submitted updates remain in record (as they were part of care delivery)
- Participant can re-grant access at any time via referral
- Audit trail logs revocation with timestamp

### Extensions
- **6a.** Priya wants provider to keep read access only → changes to "Read-only" instead of revoking
- **6b.** Priya wants to revoke access from ALL providers → bulk action available

---

## Cross-Functional Flows

### Happy Path: New Participant Onboarding
```
Create Account → Set Goals (with Coordinator) → Invite Providers →
Providers Accept → First Sessions → Structured Updates →
Progress Review → Plan Review Prep → Ongoing Care
```

### Happy Path: Provider Receiving New Participant
```
Referral Received → Review Care Record → Accept Referral →
Assign Therapist → First Session → Ongoing Updates →
Goal Progress Tracking → Plan Review Contribution
```

### Consent-Driven Information Sharing
```
Participant Creates Referral → Selects Data to Share →
Sets Access Level & Expiry → Sends to Provider →
Provider Accepts → Access Granted → Updates Flow to Participant →
Participant Can Revoke Anytime
```

### Plan Review Cycle
```
Provider Submits Updates → Coordinator Reviews Caseload →
Plan Review Date Approaches → Report Generated →
Participant Reviews & Approves → Report Shared with NDIS →
New Plan Goals Set → Cycle Repeats
```

---

## Error Handling Summary

| Error | Handling |
|-------|----------|
| Provider doesn't respond to referral | Auto-remind at 48h, 5 days; escalate to coordinator |
| Progress update overdue (30+ days) | Amber alert on caseload; coordinator notified at 7-day mark |
| Participant revokes consent mid-service | Provider notified; record of past updates retained |
| NDIS Commission reportable incident | System flags immediately; provides reporting guidance link |
| Plan expires with unused funds | Plan manager notified 8 weeks out; coordinator alerted |
| Provider not on platform | Guest invitation; limited functionality until registered |
| Data breach or unauthorised access | Immediate access revocation; incident logged; NDIS Commission notification |
