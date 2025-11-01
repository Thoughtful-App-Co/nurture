# Nurture Documentation Cleanup Plan

## Executive Summary

The Nurture app uses **EAS Build** for cloud-based compilation of native modules. Local Android SDK installation is unnecessary and creates confusion in the documentation. This plan consolidates and simplifies the documentation to reflect the actual development workflow.

---

## Phase 1: Remove Local Android SDK

### 1.1 Remove Android SDK Directory

```bash
# Remove the entire Android SDK directory
rm -rf ~/Android/Sdk

# Optional: Remove Android Studio if installed
# rm -rf ~/Android  # Only if you don't need Android Studio for other projects
```

**Size to be freed:** ~5-10 GB

### 1.2 Clean Up .bashrc

Edit `~/.bashrc` and remove these lines (lines 121-124):

```bash
# Open .bashrc in editor
nano ~/.bashrc

# Delete these lines:
# export ANDROID_HOME=$HOME/Android/Sdk
# export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
# export PATH=$PATH:$ANDROID_HOME/platform-tools
# export PATH=$PATH:$ANDROID_HOME/emulator
```

Or use this automated command:

```bash
# Backup .bashrc first
cp ~/.bashrc ~/.bashrc.backup

# Remove Android SDK lines
sed -i '/ANDROID_HOME/d; /cmdline-tools/d; /platform-tools/d; /emulator/d' ~/.bashrc

# Reload shell
source ~/.bashrc
```

### 1.3 Verify Cleanup

```bash
# Verify directory is gone
ls ~/Android/Sdk  # Should show "No such file or directory"

# Verify environment variables are gone
echo $ANDROID_HOME  # Should be empty

# Verify PATH is cleaned
echo $PATH | grep -i android  # Should return nothing
```

---

## Phase 2: Documentation Consolidation

### 2.1 Files to Update

| File | Action | Priority |
|------|--------|----------|
| `README.md` | **Major update** - Simplify Quick Start section | 🔴 High |
| `docs/setup/BUILD_INSTRUCTIONS.md` | **Delete** - Outdated, confusing | 🔴 High |
| `docs/setup/QUICK_START.md` | **Delete** - Superseded by root QUICK_START.md | 🟡 Medium |
| `docs/setup/EAS_BUILD_SETUP.md` | **Update** - Remove local build references | 🟢 Low |
| `QUICK_START.md` | **Keep as-is** - Already correct ✅ | ✅ Done |
| `docs/TESTING_GUIDE.md` | **Keep as-is** - Already correct ✅ | ✅ Done |

### 2.2 Files to Keep (Already Good)

- ✅ `QUICK_START.md` (root) - Correctly emphasizes EAS Build
- ✅ `docs/TESTING_GUIDE.md` - Clear decision tree for testing options
- ✅ `docs/setup/REBUILD_REQUIRED.md` - Good reference
- ✅ All other docs in `docs/architecture/`, `docs/features/`, etc.

---

## Phase 3: New README.md Content

### Current Issues with README.md (lines 15-70)

1. ❌ Lines 23-40: Describes `npx expo run:android` (local build)
2. ❌ Lines 53-69: Mentions "Android Studio + physical device" as prerequisite
3. ❌ Lines 138-147: Development commands include local builds
4. ⚠️ Lines 161-163: EAS build mentioned but buried

### Proposed New Quick Start Section (README.md lines 15-70)

```markdown
## Quick Start

### 🚨 CRITICAL: You Need Real Data

Nurture analyzes your **actual behavior** - call logs, SMS history, interaction patterns. Without this data, you'll just see a list of names with random layers.

**"Behavioral reality, not wishful thinking"** - this requires native modules.

### Two Testing Options

#### Option 1: Quick Testing (Expo Go - Instant)

Test UI and flow without native data:

```bash
npm install
npx expo start
# Scan QR code with Expo Go app
```

**Works:** ✅ UI, onboarding, contact names
**Doesn't work:** ❌ Call logs, SMS, real interaction data

#### Option 2: Full Testing (EAS Build - 20 minutes)

Get real call logs and SMS data:

```bash
npm install
eas build --profile development --platform android
# Download APK when build completes (~20 min)
# Install on Android device
npx expo start --dev-client
```

**Works:** ✅ Everything including call logs, SMS, accurate Dunbar layers

### iOS Limitations

```bash
npm install
eas build --profile development --platform ios
```

**⚠️ iOS Restriction:** Apple doesn't allow third-party apps to access call logs or SMS history. You'll only get contact names.

**Solution:** Use the built-in manual logging to track WhatsApp, Instagram, video calls, and in-person meetings.

### Prerequisites

- **Node.js** v20+
- **EAS Account** (free tier available)
- **Physical Android device** (for full testing)
- **Expo Go app** (for quick testing)

**You DON'T need:**
- ❌ Android Studio
- ❌ Local Android SDK
- ❌ Java/JDK
- ❌ Emulators
```

### Proposed New Development Section (README.md lines 136-164)

```markdown
## Development

### Quick Testing (Expo Go)

```bash
# Start development server
npm start

# Scan QR code with Expo Go app
# Hot reload works automatically
```

**Use for:** UI changes, flow testing, rapid iteration

### Full Testing (EAS Build)

```bash
# Build development client with native modules
eas build --profile development --platform android

# After installing APK, start metro bundler
npx expo start --dev-client
```

**Rebuild when:**
- Adding new native modules
- Changing app.json plugins
- Updating native dependencies

### Key Commands

```bash
# Install dependencies
npm install

# Quick test (no native features)
npx expo start

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production
```
```

---

## Phase 4: Specific File Actions

### 4.1 Delete docs/setup/BUILD_INSTRUCTIONS.md

**Reason:** Entire file describes local Android SDK setup, which is not the recommended approach.

```bash
rm docs/setup/BUILD_INSTRUCTIONS.md
```

**Content to preserve:** None - all useful info is in EAS_BUILD_SETUP.md

### 4.2 Delete docs/setup/QUICK_START.md

**Reason:** Duplicate of root QUICK_START.md and contains outdated info about local builds.

```bash
rm docs/setup/QUICK_START.md
```

**Content to preserve:** None - root QUICK_START.md is already up-to-date

### 4.3 Update docs/setup/EAS_BUILD_SETUP.md

**Changes needed:**
- Remove references to "Option 2: Local Android Build" (lines 40-59)
- Remove "Quick Reference: EAS vs Expo Go vs Local" table (lines 315-325)
- Simplify to focus only on EAS Build workflow

### 4.4 Update README.md

**Changes:**
1. Replace Quick Start section (lines 15-70) with proposed content above
2. Update Development section (lines 136-164) with proposed content above
3. Update Prerequisites section to remove Android Studio mention

---

## Phase 5: New Simplified Documentation Structure

### Recommended File Structure

```
nurture/
├── README.md                          # Main entry point (UPDATED)
├── QUICK_START.md                     # Quick reference (already good ✅)
│
├── docs/
│   ├── CORE_TENETS.md                # Philosophy (no changes)
│   ├── PRD.md                        # Product requirements (no changes)
│   ├── GETTING_STARTED.md            # Developer onboarding (no changes)
│   ├── TESTING_GUIDE.md              # Testing decision tree (already good ✅)
│   │
│   ├── setup/
│   │   ├── EAS_BUILD_SETUP.md        # Cloud build guide (UPDATE)
│   │   ├── REBUILD_REQUIRED.md       # When to rebuild (no changes)
│   │   └── GET_REAL_DATA.md          # How to get real data (no changes)
│   │
│   ├── architecture/
│   │   ├── AUTHENTICATION.md
│   │   └── JAZZ_INTEGRATION.md
│   │
│   └── features/
│       └── [all feature docs]
```

**Deleted:**
- ~~docs/setup/BUILD_INSTRUCTIONS.md~~ (local SDK setup - not needed)
- ~~docs/setup/QUICK_START.md~~ (duplicate - use root QUICK_START.md)

---

## Phase 6: Implementation Steps

### Step 1: Clean Local Environment (5 minutes)

```bash
# Backup first
cp ~/.bashrc ~/.bashrc.backup

# Remove Android SDK
rm -rf ~/Android/Sdk

# Clean .bashrc
sed -i '/ANDROID_HOME/d; /cmdline-tools/d; /platform-tools/d; /emulator/d' ~/.bashrc

# Reload
source ~/.bashrc

# Verify
ls ~/Android/Sdk  # Should fail
echo $ANDROID_HOME  # Should be empty
```

### Step 2: Delete Outdated Docs (1 minute)

```bash
cd /home/shuppdev/daemon/nurture

# Delete confusing docs
rm docs/setup/BUILD_INSTRUCTIONS.md
rm docs/setup/QUICK_START.md

# Verify deletion
git status
```

### Step 3: Update README.md (10 minutes)

1. Open `README.md`
2. Replace lines 15-70 with new Quick Start section
3. Replace lines 136-164 with new Development section
4. Update Prerequisites section (lines 65-69)

### Step 4: Update EAS_BUILD_SETUP.md (5 minutes)

1. Remove "Option 2: Local Android Build" section
2. Remove comparison table that includes local builds
3. Simplify focus to cloud builds only

### Step 5: Add Migration Note (Optional)

Create `docs/MIGRATION.md` to explain the cleanup:

```markdown
# Migration from Local to Cloud Builds

## What Changed

We've simplified our build process to use **EAS Build exclusively**.

### Before (Confusing)
- Multiple build options (local, EAS, Expo Go)
- Required Android SDK installation (~10GB)
- Complex documentation across multiple files

### After (Simple)
- Two clear options: Expo Go (quick) or EAS Build (full)
- No local SDK needed
- Single source of truth in README.md

### If You Had Local Setup

1. Delete Android SDK: `rm -rf ~/Android/Sdk`
2. Clean .bashrc: Remove ANDROID_HOME exports
3. Use `eas build` instead of `npx expo run:android`

See CLEANUP_PLAN.md for details.
```

---

## Phase 7: Verification Checklist

After completing all steps:

- [ ] `~/Android/Sdk` directory deleted
- [ ] `.bashrc` cleaned of Android SDK exports
- [ ] `echo $ANDROID_HOME` returns empty
- [ ] `docs/setup/BUILD_INSTRUCTIONS.md` deleted
- [ ] `docs/setup/QUICK_START.md` deleted
- [ ] `README.md` Quick Start emphasizes EAS Build
- [ ] `README.md` Prerequisites doesn't mention Android Studio
- [ ] `docs/setup/EAS_BUILD_SETUP.md` only shows cloud build
- [ ] `git status` shows changes ready to commit
- [ ] New developer can follow README.md without confusion

---

## Phase 8: Communication & Documentation

### New Developer Onboarding Flow

1. **First stop:** `README.md` → Quick Start section
2. **Quick test:** `npx expo start` (Expo Go)
3. **Full test:** `eas build --profile development --platform android`
4. **Reference:** `QUICK_START.md` for command quick reference
5. **Deep dive:** `docs/TESTING_GUIDE.md` for testing strategy

### Single Source of Truth

| Question | Answer Location |
|----------|----------------|
| How do I start? | `README.md` Quick Start |
| What commands do I run? | `QUICK_START.md` |
| How do I test? | `docs/TESTING_GUIDE.md` |
| How do EAS builds work? | `docs/setup/EAS_BUILD_SETUP.md` |
| Do I need Android SDK? | **No** - stated clearly in README.md |

---

## Expected Outcomes

### Before Cleanup
- 😕 Confusion about local vs cloud builds
- 😕 Unnecessary 10GB Android SDK installation
- 😕 Scattered documentation across multiple files
- 😕 Conflicting instructions (README says one thing, BUILD_INSTRUCTIONS says another)

### After Cleanup
- ✅ Clear choice: Expo Go (quick) or EAS Build (full)
- ✅ No wasted disk space on unused SDK
- ✅ Single source of truth in README.md
- ✅ Consistent messaging across all docs
- ✅ New developers can start in 30 seconds (Expo Go) or 20 minutes (EAS Build)

---

## Rollback Plan

If something goes wrong:

```bash
# Restore .bashrc
cp ~/.bashrc.backup ~/.bashrc
source ~/.bashrc

# Restore deleted files from git
git restore docs/setup/BUILD_INSTRUCTIONS.md
git restore docs/setup/QUICK_START.md

# Restore README.md
git restore README.md
```

---

## Timeline

- **Step 1-2:** 5 minutes (clean environment)
- **Step 3-4:** 15 minutes (update documentation)
- **Step 5:** 5 minutes (optional migration note)
- **Step 6:** 5 minutes (verification)

**Total:** ~30 minutes

---

## Success Metrics

1. ✅ New developer reads README.md and knows exactly what to do
2. ✅ Zero mentions of "Android SDK" or "Android Studio" in main docs
3. ✅ All docs point to either Expo Go or EAS Build (no local builds)
4. ✅ `~/Android` directory freed up (~10GB)
5. ✅ Can test app in 30 seconds (Expo Go) or 20 minutes (EAS Build)

---

## Questions & Answers

**Q: What if I want to do local builds in the future?**
A: The capability still exists, but it's not the recommended or documented path. If needed, refer to Expo's official docs for local build setup.

**Q: Will this break existing development?**
A: No. The app code doesn't change. Only documentation and local environment cleanup.

**Q: What about other team members with local SDK installed?**
A: They can keep their setup if they prefer, but new docs will guide them to EAS Build. Local setup is no longer supported in our docs.

**Q: Can I still use emulators?**
A: Technically yes with local builds, but emulators don't have call/SMS history. Physical devices with EAS Build is the recommended approach.

---

## Final Recommendation

**Implement this plan immediately.** The current state creates unnecessary confusion and wastes disk space. The simplified documentation will:

1. Reduce onboarding friction for new developers
2. Eliminate "it doesn't work" issues from incorrect local setup
3. Make the codebase more maintainable
4. Align documentation with actual development workflow

The EAS Build approach is the correct architecture for this app, and the documentation should reflect that clearly and consistently.
