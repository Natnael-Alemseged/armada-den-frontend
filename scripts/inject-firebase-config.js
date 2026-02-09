#!/usr/bin/env node
/**
 * Injects Firebase config from env vars into firebase-messaging-sw.js
 * Run during postinstall and prebuild to avoid committing keys
 */
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/firebase-messaging-sw.template.js');
const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');

const vars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let content = fs.readFileSync(templatePath, 'utf8');

for (const varName of vars) {
  const placeholder = `%%${varName}%%`;
  const value = process.env[varName] || '';
  const escaped = JSON.stringify(value).slice(1, -1); // escape for use inside " "
  content = content.split(placeholder).join(escaped);
}

fs.writeFileSync(outputPath, content);
console.log('[inject-firebase-config] Generated public/firebase-messaging-sw.js');
