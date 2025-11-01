# Bump Algorithm Implementation

## Problem
The Dunbar layer algorithm had score-based ranges, but when there's **zero or minimal conversation data** (texts/calls), too many contacts were falling into Layer 5 (Social Nebula), even if they had strong signals like:
- Family relationships
- High manual quality ratings

## Solution: 4-Stage Bump Algorithm

### Stage 1: Signal-Based Bumps
Contacts with zero interaction data but strong signals get bumped to appropriate layers:

1. **Nuclear Family** (no data) → Score 85 → Layer 0-1
2. **Secondary Family** (no data) → Score 60 → Layer 2  
3. **Extended Family** (no data) → Score 40 → Layer 3
4. **High Quality (4-5★)** → Score 50 minimum → Layer 2
5. **Everyone else with no data** → Score 5 → Layer 4 baseline

### Stage 2: Score-Based Placement
After bumps, contacts are placed in layers based on their bumped scores using the existing threshold system:
- Layer 0 (Loved Ones): Score 90+
- Layer 1 (Inner Circle): Score 70+
- Layer 2 (Clan): Score 50+
- Layer 3 (Tribe): Score 30+
- Layer 4 (Acquaintances): Score 10+
- Layer 5 (Social Nebula): Score 0-9

### Stage 3: Family Override
Even after placement, special contacts get priority:
- Nuclear family capped at Layer 1 (even if score says lower)
- Secondary family capped at Layer 2
- High quality (4-5★) capped at Layer 2

### Stage 4: Smart Redistribution
If >50% of contacts end up in Layer 5 (Social Nebula), the algorithm redistributes them top-to-bottom:

1. Sort Layer 5 by: Family > Quality Rating > Alphabetical
2. Fill layers in order: 4 (Acquaintances) → 3 (Tribe) → 2 (Clan)
3. Respect layer capacity limits (maxCount)

This ensures a natural distribution even with minimal data.

## Key Benefits

1. **Family members never lost** - They get bumped to appropriate layers even with zero texts
2. **Top-to-bottom fill** - Prevents overcrowding in Layer 5
3. **Data-driven when available** - Real interaction data still trumps everything
4. **Graceful degradation** - Works with zero data, better with some data, best with full data

## Example Scenarios

### Scenario 1: Zero conversation data scraped
- Nuclear family (Mom, Dad) → Layer 0-1
- High quality ratings → Layer 2
- Rest distributed across Layers 2-4
- Layer 5 only for truly unknown contacts

### Scenario 2: Some conversation data
- Interactions score naturally
- Bumps only apply where needed
- Family still gets priority

### Scenario 3: Full conversation data
- Behavioral scoring dominates
- Bumps rarely needed
- Natural Dunbar distribution

## Code Changes

**File**: `services/dunbarCalculator.ts`

**Lines 161-210**: Bump algorithm implementation  
**Lines 266-320**: Smart redistribution logic  
**Line 141**: Updated function comment to reflect bump algorithms
