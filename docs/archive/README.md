# Documentation Archive

This folder contains completed implementation documents that are no longer actively referenced but are preserved for historical context.

## Purpose

When a feature/fix is completed and deployed:
1. The summary is added to `docs/IMPLEMENTATION_LOG.md`
2. The full details are preserved in `CHANGELOG.md`
3. The original implementation doc is moved here
4. Git history contains all the code changes

## Organization

```
archive/
  implementation/   - Completed fix and feature implementation docs
  README.md        - This file
```

## Finding Information

**For recent/active work:**
- See `docs/features/` for feature specifications
- See `docs/implementation/` for current implementation docs
- See `docs/status/` for project status and planning

**For completed work:**
- See `docs/IMPLEMENTATION_LOG.md` for quick reference
- See `CHANGELOG.md` for detailed entries
- See this archive for full original documentation
- Use `git log` to trace code changes

## Archive Policy

Documents are moved here when:
1. ✅ Feature/fix is complete and deployed
2. ✅ No active work is happening in that area  
3. ✅ Details are preserved in CHANGELOG
4. ✅ Code is committed to git

Documents stay in main docs when:
- 🔨 Active development is ongoing
- 📋 Planning/design phase
- 🚀 Recently deployed (< 2 weeks)
- 📖 Reference documentation (always active)
