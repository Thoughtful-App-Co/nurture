#!/usr/bin/env node

/**
 * Verify Native Module Setup
 * 
 * Checks if native modules are properly configured
 * and provides clear instructions if not.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Nurture Native Module Setup...\n');

let hasIssues = false;

// Check 1: Native directories exist
console.log('1. Checking for native directories...');
const androidDir = path.join(__dirname, '..', 'android');
const iosDir = path.join(__dirname, '..', 'ios');

if (!fs.existsSync(androidDir)) {
  console.log('   ❌ android/ directory not found');
  console.log('   → Run: npx expo prebuild');
  hasIssues = true;
} else {
  console.log('   ✅ android/ directory exists');
}

if (!fs.existsSync(iosDir)) {
  console.log('   ❌ ios/ directory not found');
  console.log('   → Run: npx expo prebuild');
  hasIssues = true;
} else {
  console.log('   ✅ ios/ directory exists');
}

// Check 2: Native module dependencies
console.log('\n2. Checking native module dependencies...');
const packageJson = require('../package.json');
const requiredModules = {
  'react-native-call-log': '^2.1.2',
  'react-native-get-sms-android': '^2.1.0',
  'expo-contacts': '^15.0.10',
  'expo-local-authentication': '^17.0.7'
};

for (const [module, expectedVersion] of Object.entries(requiredModules)) {
  const installed = packageJson.dependencies[module];
  if (!installed) {
    console.log(`   ❌ ${module} not installed`);
    console.log(`   → Run: npm install ${module}`);
    hasIssues = true;
  } else {
    console.log(`   ✅ ${module} installed (${installed})`);
  }
}

// Check 3: Android permissions
console.log('\n3. Checking Android permissions...');
const appJsonPath = path.join(__dirname, '..', 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = require(appJsonPath);
  const androidPermissions = appJson.expo?.android?.permissions || [];
  
  const requiredPermissions = [
    'READ_CONTACTS',
    'READ_CALL_LOG',
    'READ_SMS'
  ];
  
  for (const perm of requiredPermissions) {
    if (androidPermissions.includes(perm) || androidPermissions.includes(`android.permission.${perm}`)) {
      console.log(`   ✅ ${perm} permission configured`);
    } else {
      console.log(`   ❌ ${perm} permission missing`);
      console.log(`   → Add to app.json: expo.android.permissions`);
      hasIssues = true;
    }
  }
} else {
  console.log('   ❌ app.json not found');
  hasIssues = true;
}

// Check 4: Node modules
console.log('\n4. Checking node_modules...');
const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  console.log('   ❌ node_modules not found');
  console.log('   → Run: npm install');
  hasIssues = true;
} else {
  console.log('   ✅ node_modules exists');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasIssues) {
  console.log('❌ SETUP INCOMPLETE');
  console.log('='.repeat(60));
  console.log('\n🔧 TO FIX:');
  console.log('   1. npm install');
  console.log('   2. npx expo prebuild --clean');
  console.log('   3. npx expo run:android');
  console.log('\nWithout these steps, you will get ZERO interaction data.');
  console.log('The app will only import contact names.');
  console.log('\n"Behavioral reality, not wishful thinking" - we need the data!');
} else {
  console.log('✅ SETUP LOOKS GOOD!');
  console.log('='.repeat(60));
  console.log('\n🚀 NEXT STEPS:');
  console.log('   1. Connect Android device via USB');
  console.log('   2. npx expo run:android');
  console.log('   3. Grant ALL permissions when prompted');
  console.log('   4. Check console for: "Fetched X call logs"');
  console.log('\nIf you see "0 calls, 0 texts" - native modules aren\'t loaded.');
}
console.log('='.repeat(60) + '\n');

process.exit(hasIssues ? 1 : 0);
