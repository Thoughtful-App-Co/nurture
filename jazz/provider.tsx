/**
 * Jazz Provider Configuration
 * 
 * Sets up Jazz with Expo-specific storage and sync configuration
 * Uses PasskeyAuth or PassphraseAuth for local-first, device-encrypted authentication
 * Aligns with Nurture's core tenet of privacy by design with local-first sync
 */

import React from "react";
import { JazzExpoProvider } from "jazz-tools/expo";
import { co, Group } from "jazz-tools";
import { 
  UserProfile, 
  ContactList, 
  InteractionList, 
  GoalList, 
  UserSettings 
} from "./schema";

const JAZZ_PEER_URL = "wss://cloud.jazz.tools/?key=Y29fekNudExYSnpYS0FzZWo2ZGtFQkNLeGZ1Zk1BfGNvX3pHVzFKUVdhUkQ2RW5iaTZ1NE1Ga3dwWUtrdHxjb196NXY4NWl2Q2lpYUZ4UHc5UVR6Nk1id3M3Ulo";

// Define the account schema with profile and root
export const NurtureAccount = co.account({
  root: UserProfile,
  profile: co.profile(),
}).withMigration(async (account, creationProps) => {
  // Initialize root if not exists
  if (!account.$jazz.has("root")) {
    const now = new Date().toISOString();
    
    // Create the root UserProfile with properly initialized CoValues
    // NOTE: displayName is intentionally empty - will be set during onboarding
    // hasCompletedOnboarding flag ensures user goes through proper data collection
    const root = UserProfile.create(
      {
        displayName: "", // Will be set during onboarding
        hasCompletedOnboarding: false, // User must complete onboarding
        contacts: ContactList.create([], account),
        interactions: InteractionList.create([], account),
        goals: GoalList.create([], account),
        settings: UserSettings.create({
          notificationsEnabled: true,
          darkMode: true,
          checkInReminders: true,
          weeklyReviewDay: "sunday",
          privacyLevel: "full",
        }, account),
        createdAt: now,
        lastActive: now,
      },
      account
    );
    
    account.$jazz.set("root", root);
  }

  // Initialize profile if not exists (with public permissions)
  if (!account.$jazz.has("profile")) {
    const profileGroup = Group.create(account);
    profileGroup.addMember(account, "admin");
    
    const profile = co.profile().create({
      name: creationProps?.name || "New User",
    }, profileGroup);
    
    account.$jazz.set("profile", profile);
  }
});

// Main provider - authentication happens via usePasskeyAuth or usePassphraseAuth in components
export function JazzProvider({ children }: { children: React.ReactNode }) {
  return (
    <JazzExpoProvider
      AccountSchema={NurtureAccount}
      sync={{
        peer: JAZZ_PEER_URL,
      }}
    >
      {children}
    </JazzExpoProvider>
  );
}
