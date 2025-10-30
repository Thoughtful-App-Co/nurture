# Family Detection System

## Overview

Nurture automatically detects family members using two methods:
1. **Last name matching** - Matches contacts with user-provided family surnames
2. **Pet name detection** - Identifies contacts saved as "Mom", "Dad", "Wife", etc.

This helps prioritize family relationships in Dunbar layer calculations.

---

## User Journey

### First Time Setup

**Step 1: Data Mining Introduction**
```
User sees: "Let's Look at Your Garden"
User taps: "BEGIN ANALYSIS"
```

**Step 2: Family Names Collection**
```
Screen: "Help Us Identify Family"

Fields:
- Birth last name (e.g., "Smith")
- Current last name (e.g., "Johnson") 
- Spouse's last name (e.g., "Williams")

User can:
- Fill in any/all fields
- Skip entirely ("Skip - I'll do this manually")
```

**Step 3: Analysis Runs**
```
Console output:
👨‍👩‍👧‍👦 FAMILY DETECTION
Using names: { birthLastName: "Smith", currentLastName: "Johnson" }
✅ Found 8 potential family members:
   • John Smith (SECONDARY - sibling)
   • Mary Smith (TERTIARY - cousin)
   • Mom (NUCLEAR - mother)
   • Dad (NUCLEAR - father)
   ... and 4 more
```

**Step 4: Family Names Saved**
```
Console output:
💾 SAVING FAMILY NAMES TO JAZZ
Birth last name: Smith
Current last name: Johnson
Spouse last name: Williams

✅ Saved 234 contacts to Jazz
   - 8 marked as family members
```

---

## Subsequent Analyses

**When user re-analyzes or re-opens app:**

```
Console output:
📂 LOADED SAVED FAMILY NAMES FROM JAZZ
Birth last name: Smith
Current last name: Johnson
Spouse last name: Williams
→ Will skip family name questionnaire

[Analysis runs automatically]

👨‍👩‍👧‍👦 FAMILY DETECTION
Using names: { birthLastName: "Smith", currentLastName: "Johnson" }
✅ Found 8 potential family members
```

**User does NOT see the family name form again** - it's saved in Jazz.

---

## Detection Methods

### 1. Pet Name Detection

Automatically identifies contacts saved with family relationship names:

**Nuclear Family (Tier 1 - Highest Priority)**
- Mom, Mother, Mama, Mommy
- Dad, Father, Papa, Daddy
- Wife, Husband, Spouse, Partner
- Son, Daughter, Kid

**Secondary Family (Tier 2)**
- Brother, Sister, Bro, Sis, Sibling
- Mother-in-law, Father-in-law
- Brother-in-law, Sister-in-law
- Stepmother, Stepfather

**Tertiary Family (Tier 3 - Extended)**
- Aunt, Uncle, Cousin
- Niece, Nephew
- Grandma, Grandpa, Grandmother, Grandfather
- Nana, Grammy, Granny

**Examples:**
```
Contact name: "Mom" → Detected as NUCLEAR family (mother)
Contact name: "Uncle Bob" → Detected as TERTIARY family (extended)
Contact name: "Sister Sarah" → Detected as SECONDARY family (sibling)
```

### 2. Last Name Matching

Matches contact last names with user-provided family names:

**User provides:**
- Birth last name: "Smith"
- Current last name: "Johnson"
- Spouse last name: "Williams"

**System checks each contact:**
```
Contact: "John Smith"
→ Last name: Smith
→ Matches birth last name
→ ✅ Marked as family (SECONDARY tier)

Contact: "Mary Johnson"  
→ Last name: Johnson
→ Matches current last name
→ ✅ Marked as family (SECONDARY tier)

Contact: "Bob Williams"
→ Last name: Williams
→ Matches spouse last name
→ ✅ Marked as family (SECONDARY tier - in-laws)
```

**Confidence Levels:**
- **High:** Exact last name match
- **Medium:** Partial match (hyphenated names)

**Default Tier:** SECONDARY (unless pet name overrides it)

---

## Dunbar Layer Boosts

Family members receive automatic boosts in the Dunbar algorithm:

### Interaction Score Bonuses

```javascript
// From dunbarCalculator.ts
if (contact.isFamily) {
  if (contact.familyTier === 'NUCLEAR') score += 15;
  else if (contact.familyTier === 'SECONDARY') score += 10;
  else if (contact.familyTier === 'TERTIARY') score += 5;
}
```

### Layer Placement Guarantees

```javascript
// Nuclear family forced into top 2 layers
if (contact.familyTier === 'NUCLEAR' && assignedLayer > 1) {
  assignedLayer = Math.min(assignedLayer, 1);
}

// Secondary family forced into top 3 layers
if (contact.familyTier === 'SECONDARY' && assignedLayer > 2) {
  assignedLayer = Math.min(assignedLayer, 2);
}
```

**What this means:**
- Nuclear family (Mom, Dad, Spouse) → Intimate Core or Sympathy Group
- Secondary family (Siblings, In-laws) → At least Close Group
- Tertiary family (Cousins, Aunts) → At least Tribe

**Even with zero interaction data**, family members rank high.

---

## Data Flow

### 1. User Input
```
DataMiningScreen.tsx
└─ User fills family name form
   └─ familyNames state: { birthLastName, currentLastName, spouseLastName }
```

### 2. Analysis
```
DataMiningScreen.tsx
└─ handleStartAnalysis()
   └─ aggregateContactsWithMetrics(familyNames)
      └─ services/dataMining.ts
         └─ identifyPotentialFamily(contacts, familyNames)
            ├─ detectFamilyPetName() for each contact
            └─ Match last names against family names
```

### 3. Storage
```
dashboard.tsx
└─ handleDataMiningComplete(contacts, familyNames)
   ├─ Save familyNames to Jazz (root.familyNames)
   └─ Save contacts with family flags to Jazz
      ├─ isFamily: true/false
      ├─ familyTier: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY'
      └─ familyRole: 'mother', 'sibling', 'cousin', etc.
```

### 4. Retrieval
```
dashboard.tsx
└─ On subsequent loads
   └─ Load savedFamilyNames from Jazz (root.familyNames)
   └─ Pass to DataMiningScreen
      └─ Skip family name questionnaire if already saved
```

---

## UI Indicators

### Dashboard Header
```
Your Garden
234 relationships cultivated
👨‍👩‍👧‍👦 8 family members detected
```

### Contact Detail Screen
```
John Smith
Sympathy Group

👨‍👩‍👧‍👦 Family (sibling)
```

### Layer Detail Screen
```
Sympathy Group (5-15 people)

Contacts:
- Mom 👨‍👩‍👧‍👦
- Dad 👨‍👩‍👧‍👦
- Sarah (best friend)
- John Smith 👨‍👩‍👧‍👦
```

---

## Console Logging

### During Analysis

```
👨‍👩‍👧‍👦 FAMILY DETECTION
Using names: {
  birthLastName: 'Smith',
  currentLastName: 'Johnson',
  spouseLastName: 'Williams'
}
✅ Found 8 potential family members:
   • Mom (NUCLEAR - mother)
   • Dad (NUCLEAR - father)
   • John Smith (SECONDARY - sibling)
   • Mary Smith (TERTIARY - cousin)
   • Bob Williams (SECONDARY - in-law)
   ... and 3 more
```

### When Loading Saved Names

```
📂 LOADED SAVED FAMILY NAMES FROM JAZZ
Birth last name: Smith
Current last name: Johnson
Spouse last name: Williams
→ Will skip family name questionnaire
```

### When Saving

```
💾 SAVING FAMILY NAMES TO JAZZ
Birth last name: Smith
Current last name: Johnson
Spouse last name: Williams
```

---

## Edge Cases

### No Family Names Provided

```
User skips family name form
→ Only pet name detection runs
→ Console: "⚠️ No family names provided - skipping family detection"
→ Console: "Family members can still be detected by pet names (Mom, Dad, etc.)"
```

### No Family Members Found

```
Family names provided but no matches
→ Console: "⚠️ No family members detected with provided names"
→ Console: "Check if last names match contacts in your phone"
```

### Duplicate Detection

```
Contact has both pet name AND matching last name:
- Name: "Mom Smith"
- Last name: "Smith"

→ Pet name takes priority (NUCLEAR tier)
→ Won't be downgraded to SECONDARY from last name match
```

### Contact Merging

```
Two contacts with same phone number:
- "Mom" (pet name detection → NUCLEAR)
- "Mary Smith" (last name detection → SECONDARY)

→ Merged into one contact
→ Higher interaction score kept
→ Family info from BOTH preserved (NUCLEAR tier wins)
```

---

## Testing Family Detection

### Test Case 1: Pet Names Only

```
Contacts:
- "Mom"
- "Dad" 
- "Brother"
- "Uncle Bob"

Family names provided: (none)

Expected output:
✅ Found 4 potential family members:
   • Mom (NUCLEAR - mother)
   • Dad (NUCLEAR - father)
   • Brother (SECONDARY - sibling)
   • Uncle Bob (TERTIARY - extended)
```

### Test Case 2: Last Names Only

```
Contacts:
- "John Smith"
- "Mary Smith"
- "Sarah Johnson"

Family names provided:
- birthLastName: "Smith"
- currentLastName: "Johnson"

Expected output:
✅ Found 3 potential family members:
   • John Smith (SECONDARY)
   • Mary Smith (SECONDARY)
   • Sarah Johnson (SECONDARY)
```

### Test Case 3: Mixed Detection

```
Contacts:
- "Mom" (also has last name Smith)
- "John Smith"
- "Wife Sarah"

Family names provided:
- birthLastName: "Smith"

Expected output:
✅ Found 3 potential family members:
   • Mom (NUCLEAR - mother) [pet name]
   • John Smith (SECONDARY) [last name]
   • Wife Sarah (NUCLEAR - spouse) [pet name]
```

---

## Future Enhancements

### Potential Improvements

1. **Relationship Graph**
   - "If Sarah is your sister, Sarah Johnson is likely your sister too"
   - Build family tree from connections

2. **Contact Suggestions**
   - "Found 3 contacts with last name Smith. Are they family?"
   - User confirms/denies

3. **Multiple Last Names**
   - Support hyphenated names
   - Maiden names
   - Cultural naming conventions

4. **Manual Override**
   - "Mark as family" button in contact detail
   - "Not actually family" option

5. **Family Groups**
   - Visual family tree
   - Group family members together
   - "View my family" filter

---

## Technical Details

### Schema Fields

```typescript
// jazz/schema.ts
Contact {
  isFamily: boolean,
  familyTier: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY',
  familyRole: string // 'mother', 'sibling', 'cousin', etc.
}

FamilyNames {
  birthLastName: string,
  currentLastName: string,
  spouseLastName: string,
  otherFamilyNames: string[]
}

UserProfile {
  familyNames: FamilyNames // stored at root level
}
```

### Key Functions

```typescript
// services/dataMining.ts
detectFamilyPetName(name: string): FamilyMatch | null
identifyPotentialFamily(contacts, familyNames): ContactWithMetrics[]

// services/dunbarCalculator.ts
calculateInteractionScore(contact): number // +5 to +15 for family
calculateDunbarLayers(contacts): Contact[] // Layer boosts for family
```

---

## Summary

✅ **Family names are saved** in Jazz  
✅ **Questionnaire is skipped** on subsequent analyses  
✅ **Pet name detection** works automatically  
✅ **Last name matching** works with user-provided names  
✅ **Family members get boosted** in Dunbar layers  
✅ **Console logging** shows detection results  
✅ **Dashboard shows** family member count  

**The system is fully functional!** 🎉
