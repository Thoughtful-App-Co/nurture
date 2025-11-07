# Documentation Index

Welcome to the Nurture documentation! This guide helps you navigate the documentation structure.

## 📂 Documentation Structure

```
docs/
├── README.md                    # This file - navigation hub
├── IMPLEMENTATION_LOG.md        # Concise log of completed work
├── CHANGELOG.md                 # Detailed changelog with full context
├── GETTING_STARTED.md          # Quick start guide
├── PRD.md                      # Product Requirements Document
├── CORE_TENETS.md             # App philosophy and principles
│
├── features/                   # Feature specifications
│   ├── CULTIVATION_RANKING.md
│   ├── DEMO_AUTH_FEATURE_FLAG.md
│   ├── DEV_TOOLS.md
│   ├── FAMILY_DETECTION.md
│   ├── GRAVEYARD.md
│   ├── HARVEST_MODULE.md
│   ├── INTERACTION_DATA.md
│   ├── RECURRING_INTERACTIONS.md
│   ├── SCALABLE_SORTING.md
│   ├── SORTING_SYSTEMS.md
│   ├── TEND_GARDEN.md
│   └── ...
│
├── implementation/            # Active implementation docs
│   ├── CONTACTLIST_PERSISTENCE_FIX.md  # Recent fix (2025-11-07)
│   ├── DATA_PERSISTENCE_FIX.md        # Recent fix (2025-11-07)
│   ├── ZOD_VALIDATION_IMPLEMENTATION.md # Recent feature (2025-11-07)
│   ├── DATA_LIMITATIONS.md
│   ├── RECURRING_PATTERNS_ROADMAP.md
│   ├── RECURRING_PATTERNS_TECH_SPEC.md
│   └── ...
│
├── architecture/              # System architecture
│   ├── AUTHENTICATION.md
│   └── JAZZ_INTEGRATION.md
│
├── setup/                     # Build and deployment
│   ├── BUILD_INSTRUCTIONS.md
│   ├── EAS_BUILD_SETUP.md
│   ├── GET_REAL_DATA.md
│   ├── QUICK_START.md
│   └── REBUILD_REQUIRED.md
│
├── status/                    # Project status tracking
│   ├── FINAL_STATUS.md
│   ├── IMPLEMENTATION_STATUS.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── MVP_AUTH_STATUS.md
│
└── archive/                   # Completed work (historical)
    ├── README.md             # Archive policy
    └── implementation/       # Old implementation docs
        ├── DATA_MINING_FIX.md
        ├── FIX_SMS_CALLLOG.md
        ├── NETINFO_FIX.md
        └── ...
```

## 🎯 Quick Navigation

### I want to...

**Understand the project:**
- 📖 Read [CORE_TENETS.md](CORE_TENETS.md) for philosophy
- 📋 Read [PRD.md](PRD.md) for product vision
- 🚀 Read [GETTING_STARTED.md](GETTING_STARTED.md) to run the app

**Find recent changes:**
- 📝 Read [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) for quick reference
- 📰 Read [CHANGELOG.md](CHANGELOG.md) for detailed entries
- 🔍 Check `docs/implementation/` for recent work

**Implement a feature:**
- 📱 Check `docs/features/` for feature specs
- 🔧 Check `docs/implementation/` for technical guides
- 🏗️ Check `docs/architecture/` for system design

**Build and deploy:**
- 🛠️ Read `docs/setup/BUILD_INSTRUCTIONS.md`
- ☁️ Read `docs/setup/EAS_BUILD_SETUP.md`
- ✅ Run verification: `npm run verify`

**Track project status:**
- 📊 Check `docs/status/IMPLEMENTATION_STATUS.md`
- ✅ Check `docs/status/MVP_AUTH_STATUS.md`

**Find old implementation details:**
- 📚 Check [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) first
- 🗄️ Check `docs/archive/implementation/` for full docs
- 💾 Use `git log` to trace code changes

## 📋 Documentation Types

### Feature Specifications (`features/`)
Product-level documentation describing WHAT we're building and WHY.
- User stories and use cases
- UX/UI specifications
- Business requirements

### Implementation Docs (`implementation/`)
Technical documentation describing HOW to build features.
- Technical specifications
- Implementation guides
- API designs
- Active work in progress

### Architecture (`architecture/`)
System-level documentation describing overall design.
- Authentication patterns
- Data models
- Integration guides

### Setup (`setup/`)
Build, deployment, and environment setup.
- Build instructions
- EAS configuration
- Development setup

### Archive (`archive/`)
Historical documentation for completed work.
- Moved here after completion
- Preserved for context
- Linked from IMPLEMENTATION_LOG

## 🔄 Documentation Workflow

1. **Planning Phase**
   - Create feature spec in `features/`
   - Add to PRD.md
   - Discuss and iterate

2. **Implementation Phase**
   - Create implementation doc in `implementation/`
   - Write code
   - Update status docs

3. **Completion Phase**
   - Add entry to IMPLEMENTATION_LOG.md
   - Add detailed entry to CHANGELOG.md
   - Move implementation doc to `archive/`
   - Code committed to git

4. **Reference Phase**
   - Use IMPLEMENTATION_LOG for quick lookup
   - Use CHANGELOG for detailed context
   - Use git history for code changes
   - Use archive for full original docs

## 📊 Key Documents

### Always Active
- [PRD.md](PRD.md) - Product vision and roadmap
- [CORE_TENETS.md](CORE_TENETS.md) - Philosophy
- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup guide
- [CHANGELOG.md](CHANGELOG.md) - Detailed history
- [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) - Quick reference

### Currently Active Work (2025-11-07)
- `implementation/ZOD_VALIDATION_IMPLEMENTATION.md` - New validation system
- `implementation/CONTACTLIST_PERSISTENCE_FIX.md` - Data persistence fix
- `implementation/RECURRING_PATTERNS_*.md` - Upcoming feature

## 🤝 Contributing

When adding documentation:
1. Choose the right location (see structure above)
2. Follow the existing format
3. Link to related docs
4. Update this index if adding new categories

When completing work:
1. Update IMPLEMENTATION_LOG.md
2. Update CHANGELOG.md with details
3. Move implementation docs to archive/
4. Commit code changes
