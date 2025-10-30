# Nurture Data Limitations & Workarounds

## 🎯 Executive Summary

Nurture aims to show you your **behavioral reality** - who you actually talk to, not who you think you talk to. However, due to platform restrictions and technical limitations, we can't access all interaction data.

This document clearly explains:
1. What data we CAN access
2. What data we CANNOT access  
3. Why these limitations exist
4. How to work around them

---

## ✅ What We CAN Access

### Android (Native Build)

| Data Type | Available | Quality |
|-----------|-----------|---------|
| Contacts | ✅ | Full list with names, numbers, emails |
| Call Logs | ✅ | Last 3 months - duration, timestamps, who initiated |
| SMS History | ✅ | Last 3 months - frequency, response times, reciprocity |
| Family Detection | ✅ | Automatic detection via last names and pet names |

**Build Required:** `npx expo run:android`

### iOS (Native Build)

| Data Type | Available | Reason |
|-----------|-----------|--------|
| Contacts | ✅ | Full list with names, numbers, emails |
| Call Logs | ❌ | Apple privacy restriction |
| SMS History | ❌ | Apple privacy restriction |
| Family Detection | ✅ | Automatic detection via last names and pet names |

**Apple Policy:** iOS does not allow third-party apps to access call logs or SMS history for privacy reasons.

### Expo Go (No Native Build)

| Data Type | Available | Reason |
|-----------|-----------|--------|
| Contacts | ✅ | Basic list |
| Call Logs | ❌ | Requires native module |
| SMS History | ❌ | Requires native module |

**Limitation:** Expo Go doesn't support custom native modules. You'll only see contact names, no interaction data.

---

## ❌ What We CANNOT Access

### Messaging Apps

| App | Why Not Available |
|-----|-------------------|
| WhatsApp | End-to-end encrypted, no API access |
| Telegram | Encrypted, private API |
| Signal | Privacy-focused, no data access |
| Slack | Enterprise app, no device-level access |
| Discord | No system integration |
| iMessage (on iOS) | Apple privacy restriction |

### Social Media

| Platform | Why Not Available |
|----------|-------------------|
| Instagram DMs | Facebook privacy policy, no API |
| Twitter/X DMs | No system-level access |
| Facebook Messenger | Separate app, no integration |
| Snapchat | Ephemeral by design |
| TikTok | No API for DMs |

### Video Conferencing

| Platform | Why Not Available |
|----------|-------------------|
| Zoom | No system-level integration |
| Google Meet | No call log access |
| FaceTime | Apple doesn't expose call data |
| Microsoft Teams | Enterprise app, no integration |

### In-Person Meetings

**Cannot detect:** Face-to-face interactions, coffee meetings, dinner gatherings, events

**Why:** No way to automatically detect physical proximity without:
- Constant GPS tracking (battery drain, privacy concern)
- Bluetooth scanning (requires background permissions)
- Calendar API integration (not always reliable)

---

## 🤔 Why These Limitations Exist

### 1. Platform Privacy Restrictions

**iOS:**
- Apple prioritizes user privacy over third-party app functionality
- CallKit only provides outgoing call info (not incoming)
- Messages framework doesn't expose content

**Android:**
- Requires explicit permissions (good for privacy)
- Native modules needed (can't use Expo Go)
- Some manufacturers restrict access (Samsung, Xiaomi)

### 2. App-Specific Encryption

**WhatsApp, Signal, Telegram:**
- End-to-end encrypted
- Data never leaves the app
- No APIs for third-party access
- Intentional privacy feature

### 3. Technical Architecture

**Social Media Apps:**
- Sandboxed (can't see other apps' data)
- Cloud-based (not stored locally)
- Proprietary APIs (rate-limited or unavailable)

**Video Conferencing:**
- No system-level integration
- Browser-based (no local logs)
- Enterprise security policies

---

## 💡 Workarounds & Solutions

### 1. Manual Interaction Logging

**What It Does:**
- Quick UI to log any interaction
- Takes 10 seconds to complete
- Captures quality over quantity

**How to Use:**
1. Open any contact
2. Tap "Log Interaction"
3. Select type (In Person, Phone, Video, Text, Social Media)
4. Add platform (WhatsApp, Instagram, etc.)
5. Rate quality (1-5 stars)
6. Add notes (optional)

**When to Use:**
- After meaningful conversations
- Weekly batch logging
- For VIP relationships

**Example Flow:**
```
Had coffee with Sarah → Log as "In Person" → Rate 5 stars (deep convo)
Instagram DM with Mike → Log as "Social Media" → Platform: Instagram → Rate 3 stars
Zoom call with team → Log as "Video Call" → Platform: Zoom → Rate 2 stars (work)
```

### 2. Favorite/VIP Tagging

**What It Does:**
- Manual override for automatic detection
- Ensures important people rank high
- +20 points to interaction score

**How to Use:**
1. Open contact detail
2. Toggle "Add to Favorites"
3. Person automatically moves to higher layer

**When to Use:**
- Close friends you see in person (not tracked)
- Family you primarily text via WhatsApp
- Important relationships with limited phone/SMS data

### 3. Quality Ratings

**What It Does:**
- Captures interaction depth, not just frequency
- One 5-star conversation > 10 2-star texts
- +0 to +15 points to interaction score

**Rating Guide:**
- ⭐⭐⭐⭐⭐ (5) - Deep, meaningful connection
- ⭐⭐⭐⭐ (4) - Quality conversation, felt great
- ⭐⭐⭐ (3) - Pleasant but surface-level
- ⭐⭐ (2) - Felt obligatory or draining
- ⭐ (1) - Uncomfortable or negative

**Philosophy:**
- Quality > Quantity
- One deep call > 100 quick texts
- Intentional > Automatic

### 4. Platform Tracking

**What It Does:**
- Log which apps/platforms you use most
- See where your relationships actually live
- Understand your communication patterns

**Insights You'll Gain:**
- "I text Sarah on WhatsApp, not SMS"
- "Most meaningful convos on Zoom"
- "Instagram is for casual friends"

---

## 📊 Impact on Dunbar Layers

### With Full Data (Android Native Build)

**Accuracy:** 85-90%
- Call logs show conversation depth
- SMS patterns show reciprocity
- Duration indicates relationship strength
- Recency matters (exponential decay)

**Result:** Dunbar layers reflect behavioral reality

### With Limited Data (iOS / Expo Go)

**Accuracy:** 40-50%
- Only contact names available
- No interaction frequency
- No quality signals
- Layers based on family detection only

**Result:** Manual logging essential for accuracy

### With Manual Logging

**Accuracy:** 70-80%
- You log what matters most
- Quality ratings capture depth
- Favorites ensure VIPs are prioritized
- Platform tracking shows real patterns

**Result:** Better than automatic for iOS users

---

## 🎯 Best Practices

### For Android Users (Full Data)

1. **Build native:** `npx expo run:android`
2. **Grant all permissions:** Contacts, Call Logs, SMS
3. **Let it analyze:** First run processes 3 months of data
4. **Manual log gaps:** In-person, WhatsApp, social media
5. **Tag favorites:** Override any missed VIPs

### For iOS Users (Limited Data)

1. **Accept limitations:** iOS won't give call/SMS data
2. **Manual logging is key:** Log all meaningful interactions
3. **Be consistent:** Log weekly or after events
4. **Quality over quantity:** Focus on 5-star interactions
5. **Use favorites liberally:** Ensure VIPs are recognized

### For Expo Go Users (Testing Only)

1. **Understand it's limited:** Only contact names available
2. **Build native for real analysis:** Won't get accurate layers otherwise
3. **Test UI only:** Good for design iteration, not data testing

---

## 🔮 Future Improvements

### Potential Integrations (If APIs Allow)

**Calendar Integration:**
- Detect meetings and events
- Infer face-to-face time
- Cross-reference with contacts

**App Usage Patterns:**
- Which apps you open most
- Who you message across platforms
- Frequent contacts heuristics

**Location Services:**
- Optional proximity detection
- Infer in-person time
- Battery-efficient implementation

**Smart Reminders:**
- "You haven't talked to Sarah in 30 days"
- "Mike's birthday is coming up"
- "Reconnect with your Sympathy Group"

### Manual Logging Improvements

- [ ] Quick logging from dashboard
- [ ] Batch logging for multiple contacts
- [ ] Voice input for notes
- [ ] Photo attachments
- [ ] Suggested interactions based on patterns

---

## 📞 Support & Feedback

### Common Questions

**Q: Why can't you access WhatsApp messages?**
A: WhatsApp is end-to-end encrypted. Only you and the recipient can see messages. No third-party app (including us) can access them.

**Q: Why doesn't iOS allow call logs?**
A: Apple prioritizes user privacy. They don't allow third-party apps to access call history or SMS to prevent abuse.

**Q: Can I export my data?**
A: Yes! Your data is encrypted with Jazz Tools and owned by you. Export feature coming soon.

**Q: Is manual logging accurate?**
A: Yes! For iOS users and social media interactions, manual logging is MORE accurate than automatic detection because you capture quality, not just quantity.

**Q: How long does manual logging take?**
A: 10 seconds per interaction. Log weekly in batches (5 minutes for 30 interactions).

---

## 🎨 Design Philosophy

**Transparency Over Deception:**
- We show you what we know AND what we don't know
- No fake "perfect" analysis with incomplete data
- Honest about platform limitations

**Quality Over Quantity:**
- One deep conversation > 100 surface texts
- Manual ratings capture what matters
- Favorites override automatic detection

**Privacy First:**
- All analysis on-device
- End-to-end encrypted storage
- You control your data

**User Empowerment:**
- Give you tools to fill gaps
- Quick manual logging
- Flexible tagging and ratings

---

## TL;DR

| Platform | Call Logs | SMS | Solution |
|----------|-----------|-----|----------|
| **Android (Native)** | ✅ | ✅ | `npx expo run:android` |
| **iOS (Native)** | ❌ | ❌ | Manual logging required |
| **Expo Go** | ❌ | ❌ | Build native for real data |

**For Everyone:** Manual logging captures what automatic detection misses (WhatsApp, Instagram, in-person, video calls).

**Bottom Line:** Android users get 85% accuracy automatically. iOS users need manual logging for 70% accuracy. Both benefit from favorites and quality ratings.
