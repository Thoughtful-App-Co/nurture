/**
 * Authentication Screen
 * 
 * Entry point for authentication - shows the onboarding flow
 * NOTE: This file is deprecated - use app/index.tsx instead
 */

import React from "react";
import { OnboardingFlow } from "./onboarding-flow";

export function AuthScreen() {
  return <OnboardingFlow onComplete={() => {}} />;
}
