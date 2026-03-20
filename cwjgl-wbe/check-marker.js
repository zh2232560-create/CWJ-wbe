#!/usr/bin/env node

/**
 * Debug test to check if [REPORT_LOADED_SUCCESSFULLY] marker appears in LLM requests
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function test() {
  console.log('🔍 Checking for REPORT_LOADED_SUCCESSFULLY marker...\n');

  try {
    // Create session
    const sessionRes = await axios.post(`${API_BASE}/chat/session/create`);
    const sessionId = sessionRes.data.data.sessionId;
    console.log(`📌 Session created: ${sessionId}`);

    // Send test message
    const chatRes = await axios.post(`${API_BASE}/chat`, {
      sessionId,
      message: '你好',
      context: {}
    });

    const aiResponse = chatRes.data.data.reply;
    console.log(`\n🤖 AI Response (first 200 chars):\n${aiResponse.substring(0, 200)}\n`);

    // Check for markers
    const hasLoadedMarker = aiResponse.includes('REPORT_LOADED_SUCCESSFULLY') || aiResponse.includes('[REPORT_LOADED');
    const hasFailedMarker = aiResponse.includes('REPORT_FAILED_FALLBACK_MODE') || aiResponse.includes('[REPORT_FAILED');
    const has34Devices = aiResponse.includes('34') || aiResponse.includes('三十四');
    const has591Uses = aiResponse.includes('591');
    const hasDeviceAnalysis = aiResponse.includes('设备详细分析') || aiResponse.includes('设备名称');

    console.log('📊 Analysis:\n');
    console.log(`${hasLoadedMarker ? '✅' : '❌'} Response contains [REPORT_LOADED_SUCCESSFULLY]`);
    console.log(`${hasFailedMarker ? '🔴' : '  '} Response contains [REPORT_FAILED_FALLBACK_MODE]`);
    console.log(`${has34Devices ? '✅' : '❌'} Response mentions "34" (device count)`);
    console.log(`${has591Uses ? '✅' : '❌'} Response mentions "591" (usage count)`);
    console.log(`${hasDeviceAnalysis ? '✅' : '❌'} Response mentions device details`);

    if (hasLoadedMarker) {
      console.log('\n🎉 SUCCESS: Markdown file IS being loaded into system prompt!');
    } else if (hasFailedMarker) {
      console.log('\n❌ FAILURE: Report failed to load - using fallback mode!');
    } else {
      console.log('\n❓ UNKNOWN: Neither marker found - LLM may have stripped it');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
