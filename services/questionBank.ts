/**
 * Question Bank for "Would You Rather" Pairwise Comparisons
 * 
 * Uses Acts of Service framing to make difficult decisions easier.
 * Cross-category friendly (works for family vs friends comparisons).
 * 
 * Based on universal human values: loyalty, reciprocity, trust, energy, intent.
 */

export interface Question {
  id: string;
  text: string;
  category: 'emergency' | 'time' | 'emotional' | 'reciprocity' | 'loyalty' | 'intent' | 'energy' | 'trust';
  crossCategoryFriendly: boolean; // Can compare family vs friends
}

export const QUESTION_BANK: Question[] = [
  // ===== EMERGENCY SUPPORT (Universal) =====
  {
    id: 'q1',
    text: 'Who would you call first in an emergency?',
    category: 'emergency',
    crossCategoryFriendly: true,
  },
  {
    id: 'q2',
    text: 'Who would you want by your side during a crisis?',
    category: 'emergency',
    crossCategoryFriendly: true,
  },
  {
    id: 'q3',
    text: 'Who would you trust to handle things if you were hospitalized?',
    category: 'emergency',
    crossCategoryFriendly: true,
  },
  
  // ===== TIME INVESTMENT =====
  {
    id: 'q4',
    text: 'Who would you help move apartments on a Saturday?',
    category: 'time',
    crossCategoryFriendly: true,
  },
  {
    id: 'q5',
    text: 'Who would you drive 2 hours to help?',
    category: 'time',
    crossCategoryFriendly: true,
  },
  {
    id: 'q6',
    text: 'Who would you cancel plans to spend time with?',
    category: 'time',
    crossCategoryFriendly: true,
  },
  {
    id: 'q7',
    text: 'Who do you actually make time for?',
    category: 'time',
    crossCategoryFriendly: true,
  },
  
  // ===== EMOTIONAL LABOR =====
  {
    id: 'q8',
    text: 'Whose birthday would you never want to miss?',
    category: 'emotional',
    crossCategoryFriendly: true,
  },
  {
    id: 'q9',
    text: 'Who would you want to share good news with first?',
    category: 'emotional',
    crossCategoryFriendly: true,
  },
  {
    id: 'q10',
    text: 'Whose opinion matters most when making big decisions?',
    category: 'emotional',
    crossCategoryFriendly: true,
  },
  {
    id: 'q11',
    text: 'Who would you want to talk to after a hard day?',
    category: 'emotional',
    crossCategoryFriendly: true,
  },
  
  // ===== RECIPROCITY =====
  {
    id: 'q12',
    text: 'Who has shown up for you when you needed them?',
    category: 'reciprocity',
    crossCategoryFriendly: true,
  },
  {
    id: 'q13',
    text: 'Who has proven themselves trustworthy over time?',
    category: 'reciprocity',
    crossCategoryFriendly: true,
  },
  {
    id: 'q14',
    text: 'Who has been there through your hardest times?',
    category: 'reciprocity',
    crossCategoryFriendly: true,
  },
  {
    id: 'q15',
    text: 'Who have you actually called in the last month?',
    category: 'reciprocity',
    crossCategoryFriendly: true,
  },
  
  // ===== LOYALTY =====
  {
    id: 'q16',
    text: 'Who has been consistently there through ups and downs?',
    category: 'loyalty',
    crossCategoryFriendly: true,
  },
  {
    id: 'q17',
    text: 'Who would you defend without question?',
    category: 'loyalty',
    crossCategoryFriendly: true,
  },
  {
    id: 'q18',
    text: 'Who has never let you down when it mattered?',
    category: 'loyalty',
    crossCategoryFriendly: true,
  },
  
  // ===== INTENT & FUTURE =====
  {
    id: 'q19',
    text: 'Who do you genuinely want to spend more time with?',
    category: 'intent',
    crossCategoryFriendly: true,
  },
  {
    id: 'q20',
    text: 'Who do you want in your life 5 years from now?',
    category: 'intent',
    crossCategoryFriendly: true,
  },
  {
    id: 'q21',
    text: 'Who would you miss if they moved away?',
    category: 'intent',
    crossCategoryFriendly: true,
  },
  {
    id: 'q22',
    text: 'Who do you think about reaching out to?',
    category: 'intent',
    crossCategoryFriendly: true,
  },
  
  // ===== ENERGY & MUTUAL BENEFIT =====
  {
    id: 'q23',
    text: 'After spending time with this person, do you feel energized?',
    category: 'energy',
    crossCategoryFriendly: true,
  },
  {
    id: 'q24',
    text: 'Who brings out the best in you?',
    category: 'energy',
    crossCategoryFriendly: true,
  },
  {
    id: 'q25',
    text: 'Who makes you feel most like yourself?',
    category: 'energy',
    crossCategoryFriendly: true,
  },
  {
    id: 'q26',
    text: 'Whose company do you genuinely enjoy?',
    category: 'energy',
    crossCategoryFriendly: true,
  },
  
  // ===== TRUST =====
  {
    id: 'q27',
    text: 'Who would you trust with your deepest secret?',
    category: 'trust',
    crossCategoryFriendly: true,
  },
  {
    id: 'q28',
    text: 'Who would you trust to make decisions for you if you could not?',
    category: 'trust',
    crossCategoryFriendly: true,
  },
  {
    id: 'q29',
    text: 'Who do you trust to give you honest feedback?',
    category: 'trust',
    crossCategoryFriendly: true,
  },
];

/**
 * Get a rotated question based on comparison index
 * Ensures variety by cycling through categories
 * Uses seeded randomization for consistency within a session
 */
export function getRotatedQuestion(
  comparisonIndex: number,
  seed: number,
  usedQuestionIds: string[] = []
): Question {
  // Category rotation pattern
  const categories: Question['category'][] = [
    'emergency', 
    'time', 
    'emotional', 
    'reciprocity', 
    'loyalty', 
    'intent', 
    'energy', 
    'trust'
  ];
  
  const categoryIndex = comparisonIndex % categories.length;
  const targetCategory = categories[categoryIndex];
  
  // Get questions from target category that haven't been used
  const categoryQuestions = QUESTION_BANK.filter(
    q => q.category === targetCategory && !usedQuestionIds.includes(q.id)
  );
  
  // Fallback: if all category questions used, get any unused question
  if (categoryQuestions.length === 0) {
    const unusedQuestions = QUESTION_BANK.filter(q => !usedQuestionIds.includes(q.id));
    
    if (unusedQuestions.length === 0) {
      // All questions used - reset and start over
      return getRandomQuestion(seed + comparisonIndex, []);
    }
    
    return getRandomQuestion(seed + comparisonIndex, usedQuestionIds);
  }
  
  // Select random question from category using seeded randomization
  const random = ((seed + comparisonIndex) * 9301 + 49297) % 233280;
  const index = Math.floor((random / 233280) * categoryQuestions.length);
  
  return categoryQuestions[index];
}

/**
 * Get a random question from the bank
 * Uses seeded randomization for consistency within a session
 */
export function getRandomQuestion(seed: number, excludeIds: string[] = []): Question {
  // Simple LCG (Linear Congruential Generator) for seeded randomization
  const random = (seed * 9301 + 49297) % 233280;
  
  const availableQuestions = QUESTION_BANK.filter(q => !excludeIds.includes(q.id));
  
  if (availableQuestions.length === 0) {
    // No questions available, return first one (shouldn't happen)
    return QUESTION_BANK[0];
  }
  
  const index = Math.floor((random / 233280) * availableQuestions.length);
  return availableQuestions[index];
}

/**
 * Get a question appropriate for comparing family vs friends
 * All questions in our bank are cross-category friendly
 */
export function getCrossCategoryQuestion(
  comparisonIndex: number,
  seed: number,
  usedQuestionIds: string[] = []
): Question {
  // Filter for cross-category friendly questions (all of them in our bank)
  const crossCategoryQuestions = QUESTION_BANK.filter(
    q => q.crossCategoryFriendly && !usedQuestionIds.includes(q.id)
  );
  
  if (crossCategoryQuestions.length === 0) {
    return getRandomQuestion(seed + comparisonIndex, []);
  }
  
  // Use rotation for consistency
  return getRotatedQuestion(comparisonIndex, seed, usedQuestionIds);
}

/**
 * Get statistics about question usage in a session
 */
export function getQuestionStats(usedQuestionIds: string[]): {
  totalUsed: number;
  percentageUsed: number;
  categoryCounts: Record<Question['category'], number>;
  mostUsedCategory: Question['category'];
} {
  const totalQuestions = QUESTION_BANK.length;
  const usedQuestions = QUESTION_BANK.filter(q => usedQuestionIds.includes(q.id));
  
  const categoryCounts: Record<Question['category'], number> = {
    emergency: 0,
    time: 0,
    emotional: 0,
    reciprocity: 0,
    loyalty: 0,
    intent: 0,
    energy: 0,
    trust: 0,
  };
  
  usedQuestions.forEach(q => {
    categoryCounts[q.category]++;
  });
  
  const mostUsedCategory = Object.entries(categoryCounts).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0] as Question['category'];
  
  return {
    totalUsed: usedQuestions.length,
    percentageUsed: (usedQuestions.length / totalQuestions) * 100,
    categoryCounts,
    mostUsedCategory,
  };
}
