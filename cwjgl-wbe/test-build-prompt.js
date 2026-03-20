#!/usr/bin/env node

/**
 * Direct test of buildSystemPrompt function
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`🔍 Testing buildSystemPrompt function\n`);

// Copy the loadBusinessReport and buildSystemPrompt functions from server.js
let cachedBusinessReport = null;

function loadBusinessReport() {
  if (cachedBusinessReport) {
    console.log(`   📄 [loadBusinessReport] Using cached report`);
    return cachedBusinessReport;
  }

  try {
    const reportPath = path.join(__dirname, 'data', '详细分析报告.md');
    console.log(`   🔍 [loadBusinessReport] Attempting to load from: ${reportPath}`);
    
    if (fs.existsSync(reportPath)) {
      console.log(`   ✓ [loadBusinessReport] File exists, reading...`);
      cachedBusinessReport = fs.readFileSync(reportPath, 'utf-8');
      console.log(`   ✓ [loadBusinessReport] Report loaded successfully: ${cachedBusinessReport.length} characters`);
      return cachedBusinessReport;
    } else {
      console.warn(`   ❌ [loadBusinessReport] Report file not found at: ${reportPath}`);
      return null;
    }
  } catch (err) {
    console.error(`   ❌ [loadBusinessReport] Error loading report: ${err.message}`);
    return null;
  }
}

async function buildSystemPrompt(sessionId, businessContext) {
  console.log(`\n📋 [buildSystemPrompt] Building system prompt...`);
  
  // Load real data from markdown file
  const businessReport = loadBusinessReport();
  console.log(`📋 [buildSystemPrompt] businessReport is ${businessReport ? 'PRESENT' : 'NULL/UNDEFINED'}`);
  
  if (businessReport) {
    console.log(`📋 [buildSystemPrompt] businessReport length: ${businessReport.length} characters`);
    console.log(`📋 [buildSystemPrompt] First 100 chars: ${businessReport.substring(0, 100)}`);
  }

  // Build system prompt with real business data
  // If markdown report is loaded, use it directly; otherwise use fallback with context data
  const systemPrompt = businessReport 
    ? `你是一个企业数据分析助手，请根据以下用户的真实业务数据回答问题。

用户数据（用户数据从./data/详细分析报告.md文件查询）：

${businessReport}

【专业能力定位】...`
    : `你是一个企业数据分析助手，请根据以下用户的真实业务数据回答问题。

用户数据（用户数据从./data/详细分析报告.md文件查询）：

【警告】无法加载详细分析报告，使用默认数据：
- 设备总数: ${businessContext?.devices?.length || 0} 台
- 门店总数: ${businessContext?.stores?.length || 0} 家`;

  console.log(`\n✅ [buildSystemPrompt] Complete system prompt (first 500 chars):\n---\n${systemPrompt.substring(0, 500)}\n---\n`);
  
  return systemPrompt;
}

// Test it
async function test() {
  const sessionId = 'test_session';
  const businessContext = {
    devices: [],
    stores: [],
    projects: [],
    timestamp: new Date().toISOString()
  };
  
  const prompt = await buildSystemPrompt(sessionId, businessContext);
  
  console.log(`\n📊 Analysis:\n`);
  console.log(`- Prompt contains "34 台": ${prompt.includes('34 台') || prompt.includes('34台') ? '✅' : '❌'}`);
  console.log(`- Prompt contains "591": ${prompt.includes('591') ? '✅' : '❌'}`);
  console.log(`- Prompt contains markdown content: ${prompt.includes('## 📊') || prompt.includes('--- 📊') ? '✅' : '❌'}`);
  console.log(`- Total prompt length: ${prompt.length} characters`);
  
  if (prompt.includes('【警告】')) {
    console.log(`\n⚠️ WARNING: Prompt is using FALLBACK data, not markdown!`);
  } else {
    console.log(`\n✅ SUCCESS: Prompt is using markdown data!`);
  }
}

test().catch(console.error);
