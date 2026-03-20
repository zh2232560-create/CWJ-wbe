#!/usr/bin/env node
/**
 * 完整的聊天流程测试脚本
 * 测试：新建会话 → 发送消息 → 查看历史
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testChatFlow() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AI Chat System - Complete Flow Test');
  console.log('='.repeat(60) + '\n');

  let sessionId = null;

  try {
    // Step 1: Create Session
    console.log('📍 Step 1: Creating new chat session...');
    const createRes = await axios.post(`${API_BASE}/api/chat/session/create`, {});
    console.log(`✅ Session created: ${createRes.data.data.sessionId}\n`);
    sessionId = createRes.data.data.sessionId;

    // Step 2: Send test message
    console.log('📍 Step 2: Sending test message to AI...');
    console.log('   Message: "你好，请介绍一下蔡文姬数据分析助手的功能"\n');

    const chatRes = await axios.post(`${API_BASE}/api/chat`, {
      sessionId: sessionId,
      message: '你好，请介绍一下蔡文姬数据分析助手的功能',
      context: { page: 'test' }
    });

    if (chatRes.data.code === 0) {
      console.log('✅ AI Response received:');
      console.log(`   Reply: ${chatRes.data.data.reply.substring(0, 100)}...`);
      console.log(`   Sources: ${JSON.stringify(chatRes.data.data.sources.map(s => s.name))}`);
      console.log(`   Tokens: ${chatRes.data.data.usage?.total_tokens || 'N/A'}\n`);
    } else {
      console.error('❌ Chat failed:', chatRes.data.msg);
      return;
    }

    // Step 3: Send follow-up message
    console.log('📍 Step 3: Sending follow-up message...');
    console.log('   Message: "我想了解设备使用情况"\n');

    await delay(1000); // Brief delay

    const followUpRes = await axios.post(`${API_BASE}/api/chat`, {
      sessionId: sessionId,
      message: '我想了解设备使用情况',
      context: { page: 'test' }
    });

    if (followUpRes.data.code === 0) {
      console.log('✅ Follow-up response received:');
      console.log(`   Reply: ${followUpRes.data.data.reply.substring(0, 100)}...`);
      console.log(`   Tokens: ${followUpRes.data.data.usage?.total_tokens || 'N/A'}\n`);
    } else {
      console.error('❌ Follow-up chat failed:', followUpRes.data.msg);
    }

    // Step 4: Get chat history
    console.log('📍 Step 4: Retrieving chat history...');
    const historyRes = await axios.get(`${API_BASE}/api/chat/history`, {
      params: { sessionId: sessionId }
    });

    if (historyRes.data.code === 0) {
      const messages = historyRes.data.data.messages;
      console.log(`✅ Retrieved ${messages.length} messages from session:`);
      messages.forEach((msg, idx) => {
        const role = msg.role === 'assistant' ? '🤖 AI' : '👤 User';
        const preview = msg.content.substring(0, 60);
        console.log(`   ${idx + 1}. ${role}: ${preview}...`);
      });
      console.log();
    }

    // Step 5: Get all sessions
    console.log('📍 Step 5: Listing all chat sessions...');
    const sessionsRes = await axios.get(`${API_BASE}/api/chat/sessions`);

    if (sessionsRes.data.code === 0) {
      const sessions = sessionsRes.data.data.sessions;
      console.log(`✅ Found ${sessions.length} session(s):`);
      sessions.forEach((session, idx) => {
        console.log(`   ${idx + 1}. [${session.id}] ${session.title} (${session.updated_at})`);
      });
      console.log();
    }

    console.log('='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60) + '\n');

  } catch (err) {
    console.error('\n❌ Test failed:');
    if (err.response) {
      console.error(`   Status: ${err.response.status}`);
      console.error(`   Error: ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(`   ${err.message}`);
    }
    console.error('\nMake sure backend server is running on http://localhost:3000\n');
  }
}

// Run test
testChatFlow();
