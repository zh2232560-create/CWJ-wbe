#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`🔍 Testing loadBusinessReport function\n`);
console.log(`Working directory: ${process.cwd()}`);
console.log(`Script directory (__dirname): ${__dirname}\n`);

// Test 1: Check if file exists at expected path
const reportPath = path.join(__dirname, 'data', '详细分析报告.md');
console.log(`1️⃣ Testing file path: ${reportPath}`);
console.log(`   File exists: ${fs.existsSync(reportPath) ? '✅ YES' : '❌ NO'}\n`);

// Test 2: Try to read the file
if (fs.existsSync(reportPath)) {
  try {
    const content = fs.readFileSync(reportPath, 'utf-8');
    console.log(`2️⃣ File read successfully\n`);
    console.log(`   File size: ${content.length} characters`);
    console.log(`   First 300 characters:\n   ${content.substring(0, 300)}...\n`);
    
    // Test 3: Check for specific content
    console.log(`3️⃣ Checking for key data points:\n`);
    console.log(`   Contains "34 台": ${content.includes('34 台') || content.includes('34台') ? '✅' : '❌'}`);
    console.log(`   Contains "591": ${content.includes('591') ? '✅' : '❌'}`);
    console.log(`   Contains "18833": ${content.includes('18833') ? '✅' : '❌'}`);
    console.log(`   Contains "设备详细分析": ${content.includes('设备详细分析') ? '✅' : '❌'}`);
  } catch (err) {
    console.log(`❌ Error reading file: ${err.message}\n`);
  }
} else {
  console.log(`❌ File not found. Make sure the path is correct.\n`);
  
  // Try to list directory contents
  console.log(`📁 Contents of ${path.join(__dirname, 'data')}:`);
  const dataDir = path.join(__dirname, 'data');
  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir);
    files.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log(`   Directory does not exist`);
  }
}
