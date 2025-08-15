#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = {
  build: {
    desc: 'Build web assets and sync with mobile',
    cmd: 'npm run build && npx cap sync'
  },
  android: {
    desc: 'Open Android Studio',
    cmd: 'npx cap open android'
  },
  run: {
    desc: 'Build and run on Android device/emulator',
    cmd: 'npm run build && npx cap run android'
  },
  sync: {
    desc: 'Sync changes to mobile project',
    cmd: 'npx cap sync'
  },
  clean: {
    desc: 'Clean build and sync fresh',
    cmd: 'rimraf dist && npm run build && npx cap sync --inline'
  },
  status: {
    desc: 'Check Capacitor project status',
    cmd: 'npx cap doctor'
  }
};

function showHelp() {
  console.log('\n🔰 EEU Mobile App Development Helper\n');
  console.log('Available commands:\n');
  
  Object.entries(commands).forEach(([cmd, { desc }]) => {
    console.log(`  ${cmd.padEnd(10)} - ${desc}`);
  });
  
  console.log('\nUsage:');
  console.log('  node mobile-dev.js <command>');
  console.log('  npm run mobile:build');
  console.log('  npm run mobile:android\n');
}

function runCommand(commandName) {
  const command = commands[commandName];
  
  if (!command) {
    console.error(`❌ Unknown command: ${commandName}`);
    showHelp();
    process.exit(1);
  }
  
  console.log(`🚀 Running: ${command.desc}`);
  console.log(`📝 Command: ${command.cmd}\n`);
  
  try {
    execSync(command.cmd, { stdio: 'inherit', shell: true });
    console.log(`\n✅ ${command.desc} completed successfully!`);
  } catch (error) {
    console.error(`\n❌ ${command.desc} failed:`, error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  const checks = [
    { name: 'Node.js', cmd: 'node --version' },
    { name: 'npm', cmd: 'npm --version' },
    { name: 'Capacitor CLI', cmd: 'npx cap --version' },
  ];
  
  let allGood = true;
  
  checks.forEach(({ name, cmd }) => {
    try {
      const version = execSync(cmd, { encoding: 'utf8' }).trim();
      console.log(`✅ ${name}: ${version}`);
    } catch (error) {
      console.log(`❌ ${name}: Not found`);
      allGood = false;
    }
  });
  
  // Check if Android project exists
  if (fs.existsSync(path.join(__dirname, 'android'))) {
    console.log('✅ Android project: Found');
  } else {
    console.log('❌ Android project: Not found');
    allGood = false;
  }
  
  // Check if dist exists
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('✅ Build output: Found');
  } else {
    console.log('⚠️  Build output: Not found (run npm run build)');
  }
  
  console.log(allGood ? '\n🎉 All prerequisites met!' : '\n⚠️  Some prerequisites missing');
  
  return allGood;
}

// Main execution
const [,, commandName] = process.argv;

if (!commandName) {
  showHelp();
  process.exit(0);
}

if (commandName === 'check') {
  checkPrerequisites();
  process.exit(0);
}

runCommand(commandName);