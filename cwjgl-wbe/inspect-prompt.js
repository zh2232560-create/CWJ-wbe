#!/usr/bin/env node

/**
 * Debug script to inspect the system prompt being sent to LLM
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3000/api';

async function inspectSystemPrompt() {
  console.log('🔍 Inspecting system prompt content...\n');

  try {
    // Step 1: Check if markdown file exists and read it
    const reportPath = path.join(process.cwd(), 'data', '详细分析报告.md');
    console.log(`📁 Checking for markdown file at: ${reportPath}`);
    
    if (fs.existsSync(reportPath)) {
      const content = fs.readFileSync(reportPath, 'utf-8');
      console.log(`✅ Markdown file exists\n`);
      console.log(`📄 File content (first 500 chars):\n`);
      console.log(content.substring(0, 500));
      console.log('\n... [content truncated]\n');
    } else {
      console.log(`❌ Markdown file NOT found\n`);
      return;
    }

    // Step 2: Create session
    console.log('🔄 Creating chat session...');
    let response = await axios.post(`${API_BASE}/chat/session/create`);
    const sessionId = response.data.data.sessionId;
    console.log(`✅ Session created: ${sessionId}\n`);

    // Step 3: Send a test message and capture response
    console.log('🔄 Sending test message to capture system prompt...');
    const testQuestion = '你是谁?你有什么数据?';
    
    response = await axios.post(`${API_BASE}/chat`, {
      sessionId,
      message: testQuestion,
      context: {}
    });

    const aiReply = response.data.data.reply;
    console.log(`\n🤖 AI Response:\n${aiReply}\n`);
    
    // Check if response contains markdown data indicators
    console.log('📊 Analysis:');
    console.log(`- Contains "设备": ${aiReply.includes('设备') ? '✅' : '❌'}`);
    console.log(`- Contains "台": ${aiReply.includes('台') ? '✅' : '❌'}`);
    console.log(`- Contains "项目": ${aiReply.includes('项目') ? '✅' : '❌'}`);
    console.log(`- Contains "数据": ${aiReply.includes('数据') ? '✅' : '❌'}`);
    console.log(`- Contains "时间": ${aiReply.includes('时间') ? '✅' : '❌'}`);
    console.log(`- Response length: ${aiReply.length} characters\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

inspectSystemPrompt();
