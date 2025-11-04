/**
 * Volition Explanations - Detailed motives and explanations for each volition
 * 
 * Each volition has different psychological motives and use cases.
 * This config explains WHAT, WHY, HOW, and WHO for each strategy.
 */

export interface VolitionExplanation {
  // What it is
  tagline: string;
  description: string;
  
  // Why it matters (motive/psychology)
  motive: string;
  psychologicalBasis: string;
  
  // How it works
  dailyActions: string[];
  weeklyCommitment: string;
  duration: string;
  
  // Who it's for
  bestFor: string[];
  notFor: string[];
  
  // Expected outcomes
  outcomes: string[];
  
  // Checklist preview
  checklist: {
    item: string;
    frequency: string;
  }[];
}

export const VOLITION_EXPLANATIONS: Record<string, VolitionExplanation> = {
  // Existing algorithm-based volitions
  TEND_AND_BEFRIEND: {
    tagline: "Nurture your closest relationships",
    description: "Focus on deepening emotional bonds with your intimate core and close friends through consistent, supportive interactions.",
    
    motive: "Build a strong support network for emotional resilience",
    psychologicalBasis: "Based on Taylor's (2006) 'tend-and-befriend' stress response theory. Close relationships provide emotional support during stress and contribute to long-term wellbeing.",
    
    dailyActions: [
      "Review suggestions for close contacts who need attention",
      "Reach out with supportive check-ins",
      "Respond thoughtfully to relationship cues",
    ],
    
    weeklyCommitment: "30-60 minutes",
    duration: "Ongoing practice",
    
    bestFor: [
      "People who value depth over breadth",
      "Those going through stressful times",
      "Users with strong existing close relationships",
      "Introverts who prefer fewer, deeper connections",
    ],
    
    notFor: [
      "People wanting to expand their network",
      "Those with very small existing social circles",
      "Users focused on professional networking",
    ],
    
    outcomes: [
      "Stronger emotional support network",
      "Deeper intimate relationships",
      "Better stress resilience",
      "More meaningful interactions",
    ],
    
    checklist: [
      { item: "Check daily suggestions for close contacts", frequency: "Daily (1-2 min)" },
      { item: "Reach out to 1-2 close friends/family", frequency: "2-3x per week" },
      { item: "Have deeper, longer conversations", frequency: "Weekly" },
      { item: "Review relationship health metrics", frequency: "Weekly" },
    ],
  },
  
  PLANT_AND_PRUNE: {
    tagline: "Strategic social energy allocation",
    description: "Prune weak connections and invest energy in promising relationships. Focus on your Tribe and Acquaintances with intentional cultivation.",
    
    motive: "Optimize limited social energy for maximum impact",
    psychologicalBasis: "Based on Dunbar's (1998) cognitive limit research. We have finite social energy; strategic allocation strengthens valuable mid-tier relationships.",
    
    dailyActions: [
      "Identify relationships worth deepening",
      "Prune energy drains and one-sided connections",
      "Invest in promising weak ties",
    ],
    
    weeklyCommitment: "45-90 minutes",
    duration: "Ongoing practice",
    
    bestFor: [
      "Career-focused individuals",
      "Professional networkers",
      "Those with limited time for social maintenance",
      "People wanting to strengthen mid-tier connections",
    ],
    
    notFor: [
      "Those wanting to maintain all existing relationships",
      "People uncomfortable letting connections fade",
      "Users with very small social circles",
    ],
    
    outcomes: [
      "More strategic relationship portfolio",
      "Stronger professional network",
      "Less energy on draining relationships",
      "Clearer relationship priorities",
    ],
    
    checklist: [
      { item: "Review Tribe and Acquaintance layers", frequency: "Weekly" },
      { item: "Reach out to 2-3 strategic contacts", frequency: "Weekly" },
      { item: "Evaluate relationship reciprocity", frequency: "Bi-weekly" },
      { item: "Let go of 1-2 energy drains", frequency: "Monthly" },
    ],
  },
  
  CULTIVATE: {
    tagline: "Balanced maintenance across all layers",
    description: "Consistent attention to all relationship layers. No one gets neglected, from intimate core to acquaintances.",
    
    motive: "Maintain holistic relationship health and balance",
    psychologicalBasis: "Based on Reis & Shaver's (1988) intimacy model. Consistent interaction builds and maintains intimacy across all relationship types.",
    
    dailyActions: [
      "Check in with contacts across all layers",
      "Rotate attention between different relationship types",
      "Maintain baseline contact frequency for all tiers",
    ],
    
    weeklyCommitment: "60-90 minutes",
    duration: "Ongoing practice",
    
    bestFor: [
      "People who want holistic relationship health",
      "Those with good time management",
      "Users who don't want anyone neglected",
      "Balanced personality types",
    ],
    
    notFor: [
      "Those with very limited time",
      "People wanting focused, targeted cultivation",
      "Users needing to prioritize specific layers",
    ],
    
    outcomes: [
      "No neglected relationships",
      "Balanced social portfolio",
      "Consistent maintenance habits",
      "Reduced relationship decay",
    ],
    
    checklist: [
      { item: "Contact someone in each layer", frequency: "Weekly" },
      { item: "Respond to all messages within 48h", frequency: "Daily" },
      { item: "Review all layer health metrics", frequency: "Weekly" },
      { item: "Address any layer violations", frequency: "As needed" },
    ],
  },
  
  INNER_CIRCLE: {
    tagline: "Intense focus on your intimate core",
    description: "Deep over wide. Pour energy into your 1-5 closest relationships. Ignore outer layers entirely.",
    
    motive: "Maximize depth and intimacy with your core support circle",
    psychologicalBasis: "Based on Marsden's (1987) core discussion network research. Most people have 2-3 truly intimate relationships that provide primary emotional support.",
    
    dailyActions: [
      "Daily check-ins with core circle",
      "Respond immediately to intimate contacts",
      "Prioritize face-to-face time with core people",
    ],
    
    weeklyCommitment: "120+ minutes",
    duration: "Ongoing practice",
    
    bestFor: [
      "Introverts who prefer few deep connections",
      "People in crisis needing support circle",
      "Those consciously limiting social obligations",
      "Users with small but strong networks",
    ],
    
    notFor: [
      "People needing to maintain broad networks",
      "Those with professional networking needs",
      "Users wanting to expand their social circle",
    ],
    
    outcomes: [
      "Extremely deep intimate relationships",
      "Strong emotional support",
      "Clear social priorities",
      "Reduced social overwhelm",
    ],
    
    checklist: [
      { item: "Contact each core person", frequency: "Every 2-3 days" },
      { item: "Have meaningful conversations", frequency: "2-3x per week" },
      { item: "Schedule face-to-face time", frequency: "Weekly" },
      { item: "Ignore outer layer contacts (guilt-free)", frequency: "Ongoing" },
    ],
  },
  
  EXPAND_HORIZONS: {
    tagline: "Meet new people and deepen acquaintances",
    description: "Focus on outer layers. Move acquaintances to closer circles. Build new connections.",
    
    motive: "Access new opportunities and broaden your social world",
    psychologicalBasis: "Based on Granovetter's (1973) 'strength of weak ties' theory. Acquaintances provide access to new information, opportunities, and perspectives.",
    
    dailyActions: [
      "Reach out to distant acquaintances",
      "Follow up with new connections",
      "Attend social events and meetups",
    ],
    
    weeklyCommitment: "90-120 minutes",
    duration: "Ongoing practice",
    
    bestFor: [
      "People new to a city",
      "Career changers building new networks",
      "Those feeling socially isolated",
      "Extroverts seeking variety",
    ],
    
    notFor: [
      "Those wanting to deepen existing bonds",
      "People with limited social energy",
      "Users feeling socially overwhelmed",
    ],
    
    outcomes: [
      "Larger, more diverse social network",
      "New opportunities and perspectives",
      "Reduced social isolation",
      "More varied social experiences",
    ],
    
    checklist: [
      { item: "Reach out to 2-3 distant contacts", frequency: "Weekly" },
      { item: "Follow up with recent acquaintances", frequency: "Weekly" },
      { item: "Attend 1 social event", frequency: "Bi-weekly" },
      { item: "Move 1-2 people to closer layers", frequency: "Monthly" },
    ],
  },
  
  REKINDLE: {
    tagline: "Reconnect with people you've drifted from",
    description: "Revive old friendships and meaningful connections that have lapsed. Reach out to people you haven't contacted in 90+ days.",
    
    motive: "Restore valuable relationships before they're permanently lost",
    psychologicalBasis: "Based on Ledbetter et al.'s (2011) reconnection maintenance research. Dormant ties retain value and can be reactivated with intentional effort.",
    
    dailyActions: [
      "Review lapsed contacts (90+ days)",
      "Send thoughtful reconnection messages",
      "Follow up on reconnection attempts",
    ],
    
    weeklyCommitment: "60-90 minutes",
    duration: "3-6 month focused effort",
    
    bestFor: [
      "People who've moved cities",
      "Those who've let friendships lapse",
      "Users feeling nostalgic",
      "Life transitions (post-graduation, new job, etc.)",
    ],
    
    notFor: [
      "Those wanting to meet new people",
      "People with active, maintained networks",
      "Users uncomfortable reaching out first",
    ],
    
    outcomes: [
      "Restored valuable friendships",
      "Reduced relationship regret",
      "Expanded active network",
      "Renewed meaningful connections",
    ],
    
    checklist: [
      { item: "Review contacts not contacted in 90+ days", frequency: "Weekly" },
      { item: "Send 1-2 thoughtful reconnection messages", frequency: "Weekly" },
      { item: "Follow up on responses", frequency: "Within 48h" },
      { item: "Schedule catch-up calls/meetings", frequency: "As opportunities arise" },
    ],
  },
  
  BALANCE: {
    tagline: "Maintain equilibrium across all layers",
    description: "The 'set it and forget it' approach. Trust the algorithm to balance attention across all relationship types with equal weighting.",
    
    motive: "Comprehensive relationship health without overthinking",
    psychologicalBasis: "Based on Dunbar's (2018) layer theory. Different layers serve different psychological needs; balanced attention ensures all needs are met.",
    
    dailyActions: [
      "Follow algorithm suggestions",
      "Maintain baseline contact across all layers",
      "Trust the balanced approach",
    ],
    
    weeklyCommitment: "45-75 minutes",
    duration: "Ongoing practice",
    
    bestFor: [
      "People who want 'set it and forget it'",
      "Those with varied social needs",
      "Users who trust the algorithm",
      "Balanced personality types",
    ],
    
    notFor: [
      "Those wanting focused, targeted cultivation",
      "People with specific relationship goals",
      "Users needing intensive work on one layer",
    ],
    
    outcomes: [
      "Balanced relationship portfolio",
      "All layers adequately maintained",
      "Reduced decision fatigue",
      "Comprehensive social health",
    ],
    
    checklist: [
      { item: "Review daily suggestions", frequency: "Daily (2 min)" },
      { item: "Act on 3-5 suggestions per week", frequency: "Weekly" },
      { item: "Maintain baseline contact frequencies", frequency: "Ongoing" },
      { item: "Trust the balanced approach", frequency: "Ongoing" },
    ],
  },
  
  // New ranking-focused volitions
  KNOW_YOUR_CIRCLE: {
    tagline: "Build intuitive understanding through daily comparisons",
    description: "Answer 2-3 simple comparison questions each day. Reveal your true relationship priorities through quick choices.",
    
    motive: "Discover who truly matters most to you",
    psychologicalBasis: "Based on revealed preference theory and comparative judgment. We understand our priorities better through choices than through abstract ratings.",
    
    dailyActions: [
      "Answer 2-3 'Who would you rather...' questions",
      "Takes ~20 seconds per comparison",
      "Build ranking data gradually",
    ],
    
    weeklyCommitment: "5 minutes",
    duration: "30-45 days (100 comparisons)",
    
    bestFor: [
      "New users building initial data",
      "Anyone wanting clarity on priorities",
      "Those who find rating systems artificial",
      "People comfortable with quick judgments",
    ],
    
    notFor: [
      "Those uncomfortable comparing loved ones",
      "People wanting immediate complete rankings",
      "Users with very small networks (<10 people)",
    ],
    
    outcomes: [
      "Clear understanding of relationship priorities",
      "Data for personalized insights",
      "More accurate algorithm suggestions",
      "'Circle Clarity' badge",
    ],
    
    checklist: [
      { item: "Answer 2-3 comparison questions", frequency: "Daily" },
      { item: "Takes 20 seconds per question", frequency: "~1 minute total" },
      { item: "Build to 100 total comparisons", frequency: "Over 30-45 days" },
      { item: "Unlock advanced insights", frequency: "Upon completion" },
    ],
  },
  
  COMPLETE_TRIBE_RANKING: {
    tagline: "Rank all contacts in your Tribe layer",
    description: "Complete comprehensive ranking of your 50-person Tribe. Know exactly where everyone stands in this critical layer.",
    
    motive: "Gain complete clarity on your 50-person support network",
    psychologicalBasis: "Based on Dunbar's Tribe layer (50 people). This is your broader support network - people you'd invite to a group dinner. Ranking reveals who truly belongs here.",
    
    dailyActions: [
      "Answer 5 comparison questions daily",
      "Focus specifically on Tribe members",
      "Build complete layer ranking",
    ],
    
    weeklyCommitment: "12 minutes",
    duration: "Until layer complete (varies)",
    
    bestFor: [
      "Users with full or overflowing Tribe layers",
      "Those needing to identify who to cultivate vs. prune",
      "People working on strategic social allocation",
    ],
    
    notFor: [
      "Those with very small Tribe layers",
      "Users uncomfortable with layer-specific rankings",
      "People just starting with the app",
    ],
    
    outcomes: [
      "Complete Tribe layer clarity",
      "Identify who to move to Close Group",
      "Know who should move to Acquaintances",
      "'Tribe Ranker' badge",
    ],
    
    checklist: [
      { item: "Answer 5 comparison questions", frequency: "Daily" },
      { item: "Focus on Tribe layer members only", frequency: "All questions" },
      { item: "Complete full layer ranking", frequency: "Goal: 100%" },
      { item: "Unlock Tribe-specific insights", frequency: "Upon completion" },
    ],
  },
  
  WEEKLY_CHECKIN: {
    tagline: "Build a habit of consistent relationship maintenance",
    description: "Reach out to someone every week for 4 weeks. Build the muscle of proactive relationship cultivation.",
    
    motive: "Establish sustainable relationship maintenance habits",
    psychologicalBasis: "Based on habit formation research. 28 days (4 weeks) is sufficient to establish new behavioral patterns. Consistent practice builds lasting habits.",
    
    dailyActions: [
      "Review suggested contacts for outreach",
      "Choose communication method (call, text, meet)",
      "Complete one meaningful interaction",
    ],
    
    weeklyCommitment: "60 minutes",
    duration: "4 weeks (28 days)",
    
    bestFor: [
      "Those wanting to build maintenance habits",
      "People who let relationships drift",
      "Users needing structure for outreach",
      "Anyone building consistency",
    ],
    
    notFor: [
      "Those already maintaining contacts well",
      "People with severe social anxiety",
      "Users with extremely limited time",
    ],
    
    outcomes: [
      "Established weekly maintenance habit",
      "28 meaningful interactions completed",
      "Stronger relationship health",
      "'Steady Gardener' badge",
    ],
    
    checklist: [
      { item: "Reach out to 1 suggested contact", frequency: "Weekly (4 weeks)" },
      { item: "Choose: call, text, or meet", frequency: "Your choice" },
      { item: "Mark interaction complete", frequency: "After each" },
      { item: "Build 28-day streak", frequency: "Goal" },
    ],
  },
  
  REKINDLE_CONNECTIONS: {
    tagline: "Restore 5 lapsed friendships before they're gone",
    description: "Reconnect with 5 people you haven't talked to in 90+ days. Send thoughtful messages that revive dormant relationships.",
    
    motive: "Prevent relationship regret by acting before it's too late",
    psychologicalBasis: "Based on relationship maintenance theory. Relationships have a 'half-life' - the longer they lapse, the harder to revive. 90+ days is a critical threshold.",
    
    dailyActions: [
      "Review contacts lapsed 90+ days",
      "Craft thoughtful reconnection message",
      "Follow up on responses",
    ],
    
    weeklyCommitment: "90 minutes",
    duration: "5-10 weeks (5 reconnections)",
    
    bestFor: [
      "Those who've moved cities or changed jobs",
      "People who've let friendships drift",
      "Users feeling nostalgic",
      "Anyone with relationship regret",
    ],
    
    notFor: [
      "Those wanting to meet new people",
      "People with fully active networks",
      "Users uncomfortable reaching out cold",
    ],
    
    outcomes: [
      "5 restored friendships",
      "Reduced relationship regret",
      "Reactivated dormant connections",
      "'Rekindler' badge",
    ],
    
    checklist: [
      { item: "Identify 5 lapsed contacts (90+ days)", frequency: "Week 1" },
      { item: "Send thoughtful reconnection message", frequency: "1 per week" },
      { item: "Follow up on responses", frequency: "Within 48h" },
      { item: "Complete 5 successful reconnections", frequency: "Goal" },
    ],
  },
  
  RATE_INTERACTIONS: {
    tagline: "Reflect on interaction quality to improve insights",
    description: "Rate 20 recent interactions with quality scores. Help the algorithm understand what 'good' interactions look like for you.",
    
    motive: "Teach the system your personal interaction preferences",
    psychologicalBasis: "Based on machine learning personalization. Quality ratings train the algorithm to suggest contacts that lead to satisfying interactions for YOUR preferences.",
    
    dailyActions: [
      "Rate 2 recent calls or texts",
      "Reflect on interaction quality",
      "Takes ~30 seconds per rating",
    ],
    
    weeklyCommitment: "10 minutes",
    duration: "1-2 weeks (20 ratings)",
    
    bestFor: [
      "Users wanting better personalization",
      "Those comfortable with reflection",
      "People wanting to understand interaction patterns",
      "Anyone seeking algorithm improvement",
    ],
    
    notFor: [
      "Those uncomfortable judging interactions",
      "Users wanting purely objective data",
      "People with few recent interactions",
    ],
    
    outcomes: [
      "Better algorithm personalization",
      "Understanding of what makes good interactions",
      "More accurate contact suggestions",
      "'Reflective' badge",
    ],
    
    checklist: [
      { item: "Rate 2 recent interactions", frequency: "Daily" },
      { item: "Reflect: Was it energizing or draining?", frequency: "Each rating" },
      { item: "Complete 20 total ratings", frequency: "Goal: 1-2 weeks" },
      { item: "Unlock quality-based insights", frequency: "Upon completion" },
    ],
  },
  
  EXPLORE_GARDEN: {
    tagline: "Learn about each Dunbar layer and the science behind your garden",
    description: "Interactive walkthrough of all 6 Dunbar layers. Understand the psychology and purpose of each relationship tier.",
    
    motive: "Understand the framework organizing your social world",
    psychologicalBasis: "Based on Dunbar's (1992) social brain hypothesis. Understanding the cognitive limits and purposes of each layer helps you allocate energy wisely.",
    
    dailyActions: [
      "Review one layer per session",
      "Learn the science and psychology",
      "Understand your own layer distribution",
    ],
    
    weeklyCommitment: "15 minutes",
    duration: "1-2 weeks (6 layers)",
    
    bestFor: [
      "New users learning the system",
      "Those interested in relationship science",
      "People wanting to understand the framework",
      "Anyone optimizing layer allocation",
    ],
    
    notFor: [
      "Users wanting immediate action items",
      "Those not interested in theory",
      "People already familiar with Dunbar numbers",
    ],
    
    outcomes: [
      "Deep understanding of layer framework",
      "Science-backed relationship knowledge",
      "Better layer allocation decisions",
      "'Gardener' badge",
    ],
    
    checklist: [
      { item: "Review one Dunbar layer", frequency: "Daily or every few days" },
      { item: "Learn the psychology and limits", frequency: "Each layer" },
      { item: "Complete all 6 layers", frequency: "Goal: 1-2 weeks" },
      { item: "Apply knowledge to your garden", frequency: "Ongoing" },
    ],
  },
};
