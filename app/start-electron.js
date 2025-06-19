#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Electron Application...');

// Check if app directory exists
const appDir = path.join(__dirname, 'app');
if (!fs.existsSync(appDir)) {
  console.error('❌ App directory not found!');
  process.exit(1);
}

// Change to app directory and start electron
const electronProcess = spawn('npm', ['start'], {
  cwd: appDir,
  stdio: 'inherit',
  shell: true
});

electronProcess.on('close', (code) => {
  console.log(`\n📱 Electron process exited with code ${code}`);
});

electronProcess.on('error', (err) => {
  console.error('❌ Failed to start Electron:', err);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Electron application...');
  electronProcess.kill('SIGINT');
});