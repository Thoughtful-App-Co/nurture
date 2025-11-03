/**
 * Diagnostic script to check for hidden contacts in Jazz database
 * Run this to see if contacts are actually being saved with quickSortStatus: "hidden"
 */

console.log(`
🪦 GRAVEYARD DIAGNOSTIC TOOL
============================

This script helps diagnose why the graveyard feature might not be showing.

TO USE:
1. Make sure you've hidden some contacts in "Tend Your Garden"
2. Run this from the app's DevTools console or add it to a component
3. Check the output to see if contacts have quickSortStatus: "hidden"

EXPECTED OUTPUT:
- Total contacts: X
- Hidden contacts: Y
- List of hidden contact names

COMMON ISSUES:
- If hidden count is 0: Contacts aren't being saved as "hidden"
- If count is > 0 but graveyard doesn't show: Animation or render issue
- If contacts show but card doesn't appear: Check hiddenContactsCount > 0 condition

COPY THIS CODE INTO DevTools OR A COMPONENT:
--------------------------------------------
const root = me?.root as any;
const contacts = root?.contacts || [];
const allContacts = Array.from(contacts);

const hiddenContacts = allContacts.filter((c: any) => c?.quickSortStatus === "hidden");

console.log('🪦 Diagnostic Results:');
console.log('Total contacts:', allContacts.length);
console.log('Hidden contacts:', hiddenContacts.length);
console.log('Hidden contact details:', hiddenContacts.map((c: any) => ({
  name: c?.name,
  quickSortStatus: c?.quickSortStatus,
  quickSortedAt: c?.quickSortedAt,
  dunbarLayer: c?.dunbarLayer
})));

if (hiddenContacts.length === 0) {
  console.warn('⚠️  NO HIDDEN CONTACTS FOUND');
  console.log('Check:');
  console.log('1. Did you hide contacts using the "Hide" button (👻)?');
  console.log('2. Check console for "Contact sorted: X → Hidden" logs');
  console.log('3. Verify QuickSortModal is saving quickSortStatus: "hidden"');
} else {
  console.log('✅ Hidden contacts found! Graveyard should be accessible.');
  console.log('Try:');
  console.log('1. Scroll to top of Dashboard');
  console.log('2. Pull down (overscroll) ~80px');
  console.log('3. Look for graveyard card to appear');
}
--------------------------------------------
`);

export {}; // Make this a module
