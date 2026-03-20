#!/usr/bin/env node

/**
 * Direct test of system prompt content
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function test() {
  console.log('🔍 Direct test of system prompt in API...\n');

  try {
    // Create session
    let response = await axios.post(`${API_BASE}/chat/session/create`);
    const sessionId = response.data.data.sessionId;
    console.log(`✅ Session created: ${sessionId}\n`);

    // Send a very specific question about devices
    const question = '请告诉我详细的设备信息，包括设备总数、使用次数和时长。';
    console.log(`💬 Question: ${question}\n`);
    
    response = await axios.post(`${API_BASE}/chat`, {
      sessionId,
      message: question,
      context: {}
    });

    const reply = response.data.data.reply;
    console.log(`🤖 AI Response:\n${reply}\n`);
    
    // Check for specific device data from the markdown
    console.log(`📊 Analysis:\n`);
    console.log(`- Contains "34 台": ${reply.includes('34') && reply.includes('台') ? '✅' : '❌'}`);
    console.log(`- Contains "591": ${reply.includes('591') ? '✅' : '❌'}`);
    console.log(`- Contains "18833": ${reply.includes('18833') ? '✅' : '❌'}`);
    console.log(`- Contains "H3IRNN": ${reply.includes('H3IRNN') ? '✅' : '❌'}`);
    console.log(`- Contains "0台": ${reply.includes('0') && reply.includes('台') ? '⚠️ 问题！系统仍在使用默认数据' : '✅'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

test();
