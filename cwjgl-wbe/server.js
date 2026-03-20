import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import sqlite3Module from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite3 = sqlite3Module.verbose();

// Global variable to store markdown business data
let MARKDOWN_BUSINESS_DATA = null;

// Function to load markdown data on startup
function loadMarkdownBusinessData() {
  try {
    const reportPath = path.join(__dirname, 'data', '详细分析报告.md');
    if (fs.existsSync(reportPath)) {
      MARKDOWN_BUSINESS_DATA = fs.readFileSync(reportPath, 'utf-8');
      console.log(`📄 Markdown business data loaded: ${MARKDOWN_BUSINESS_DATA.length} characters`);
      return true;
    } else {
      console.warn(`⚠️ Markdown file not found at: ${reportPath}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error loading markdown data: ${err.message}`);
    return false;
  }
}

// Simple logging helper
function debugLog(msg) {
  console.log(msg);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Database initialization
const dbPath = path.join(__dirname, 'db', 'chat.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ SQLite Database connected');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Chat sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_session (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chat messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_message (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT,
        role TEXT NOT NULL,
        content TEXT,
        sources TEXT,
        status TEXT DEFAULT 'success',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(session_id) REFERENCES chat_session(id)
      )
    `);

    console.log('✅ Database tables initialized');
  });
}

// Doubao API configuration (Updated based on official Ark SDK example)
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || process.env.ARK_API_KEY || '227a1eb8-cc13-4b8b-a2b8-b1745d94a59a';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const DOUBAO_MODEL_ID = 'doubao-seed-1-6-251015';  // Updated: correct model ID from official example

// Business API endpoints (mock data source)
const CWJ_API_BASE = 'http://localhost:8080/api'; // Replace with actual API base

// Helper: Get business context data
async function getBusinessContext() {
  const context = {
    devices: [],
    stores: [],
    projects: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Get device list
    try {
      const deviceRes = await axios.get(`${CWJ_API_BASE}/device/list`, { timeout: 5000 });
      if (deviceRes.data && deviceRes.data.data) {
        context.devices = deviceRes.data.data.slice(0, 10); // Limit to 10
      }
    } catch (e) {
      console.warn('Failed to fetch devices:', e.message);
      context.devices = [];
    }

    // Get store list
    try {
      const storeRes = await axios.get(`${CWJ_API_BASE}/store/list`, { timeout: 5000 });
      if (storeRes.data && storeRes.data.data) {
        context.stores = storeRes.data.data.slice(0, 10);
      }
    } catch (e) {
      console.warn('Failed to fetch stores:', e.message);
      context.stores = [];
    }

    return context;
  } catch (err) {
    console.error('Error fetching business context:', err.message);
    return context;
  }
}

// Helper: Call Doubao LLM API (Updated for latest Ark SDK)
async function callDoubaoAPI(messages) {
  try {
    // Ark SDK expects 'messages' parameter with specific format
    const formattedMessages = messages.map(msg => ({
      role: msg.role,  // Keep role as-is (user, assistant, system)
      content: msg.content
    }));

    const requestBody = {
      model: DOUBAO_MODEL_ID,
      messages: formattedMessages  // Use 'messages' not 'input'
    };

    console.log(`📤 Request to Ark API:`, JSON.stringify({
      url: `${DOUBAO_API_URL}/chat/completions`,
      model: DOUBAO_MODEL_ID,
      messagesCount: formattedMessages.length
    }));

    const response = await axios.post(
      `${DOUBAO_API_URL}/chat/completions`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${DOUBAO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );

    if (response.data) {
      // Handle response format
      let content = '';
      if (response.data.choices && response.data.choices[0]) {
        if (response.data.choices[0].message?.content) {
          content = response.data.choices[0].message.content;
        } else if (response.data.choices[0].text) {
          content = response.data.choices[0].text;
        }
      }

      return {
        success: true,
        content: content || 'Empty response from LLM',
        usage: response.data.usage
      };
    }
    return { success: false, error: 'Invalid response format' };
  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Unknown error';
    console.error('❌ Doubao API error:', errorMsg);
    return {
      success: false,
      error: errorMsg
    };
  }
}

// Helper: Escape markdown special characters
function formatResponse(text) {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

// Helper: Database promise wrapper
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Routes

// Create new chat session
app.post('/api/chat/session/create', async (req, res) => {
  try {
    const sessionId = 'session_' + Date.now();
    const title = '新建对话';
    
    await dbRun(
      'INSERT INTO chat_session (id, title) VALUES (?, ?)',
      [sessionId, title]
    );

    res.json({
      code: 0,
      msg: 'Session created',
      data: { sessionId, title }
    });
  } catch (err) {
    console.error('Session creation error:', err);
    res.status(500).json({
      code: -1,
      msg: err.message,
      data: null
    });
  }
});

// Get session list
app.get('/api/chat/sessions', async (req, res) => {
  try {
    const sessions = await dbAll(`
      SELECT id, title, updated_at FROM chat_session
      ORDER BY updated_at DESC
      LIMIT 20
    `);

    res.json({
      code: 0,
      msg: 'Sessions retrieved',
      data: { sessions }
    });
  } catch (err) {
    console.error('Session list error:', err);
    res.status(500).json({
      code: -1,
      msg: err.message,
      data: null
    });
  }
});

// Get chat history
app.get('/api/chat/history', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({
        code: -1,
        msg: 'sessionId required',
        data: null
      });
    }

    const messages = await dbAll(`
      SELECT id, role, content, sources, status, created_at FROM chat_message
      WHERE session_id = ?
      ORDER BY created_at ASC
    `, [sessionId]);

    // Parse JSON sources field
    const parsedMessages = messages.map(msg => ({
      ...msg,
      sources: msg.sources ? JSON.parse(msg.sources) : []
    }));

    res.json({
      code: 0,
      msg: 'History retrieved',
      data: { messages: parsedMessages }
    });
  } catch (err) {
    console.error('History retrieval error:', err);
    res.status(500).json({
      code: -1,
      msg: err.message,
      data: null
    });
  }
});

// Helper: Build system prompt with real business data from markdown file
async function buildSystemPrompt(sessionId, businessContext) {
  // Write to file for debugging
  const debugFile = path.join(__dirname, 'debug-prompt.txt');
  fs.appendFileSync(debugFile, `\n=== buildSystemPrompt called at ${new Date().toISOString()} ===\n`);
  fs.appendFileSync(debugFile, `MARKDOWN_BUSINESS_DATA is ${MARKDOWN_BUSINESS_DATA ? 'LOADED' : 'NULL'}\n`);
  if (MARKDOWN_BUSINESS_DATA) {
    fs.appendFileSync(debugFile, `Data length: ${MARKDOWN_BUSINESS_DATA.length}\n`);
    fs.appendFileSync(debugFile, `First 100 chars: ${MARKDOWN_BUSINESS_DATA.substring(0, 100)}\n`);
  }
  
  console.log(`[buildSystemPrompt] Called with sessionId=${sessionId}`);
  console.log(`[buildSystemPrompt] MARKDOWN_BUSINESS_DATA is ${MARKDOWN_BUSINESS_DATA ? 'LOADED' : 'NULL'}`);
  if (MARKDOWN_BUSINESS_DATA) {
    console.log(`[buildSystemPrompt] Data length: ${MARKDOWN_BUSINESS_DATA.length}`);
    console.log(`[buildSystemPrompt] First 50 chars: ${MARKDOWN_BUSINESS_DATA.substring(0, 50)}`);
  }
  
  // Use globally loaded markdown data - it's loaded on startup
  const systemPrompt = `你是一个企业数据分析助手，请根据以下用户的真实业务数据回答问题。

用户数据（用户数据从./data/详细分析报告.md文件查询）：

${MARKDOWN_BUSINESS_DATA || '【错误】无法加载详细分析报告。'}

【专业能力定位】
1. 分析设备运营数据和性能指标
2. 提供门店业务优化建议  
3. 解读项目运营报告
4. 用户行为分析和趋势预测

【必须遵守的核心规则】
- ✅ 所有答案必须严格基于已提供的真实业务数据回答
- ✅ 禁止脱离数据凭空编造或猜测
- ✅ 如果数据不足以回答问题，明确说明："根据当前可用数据，暂时无法准确回答该问题"
- ✅ 数据答案要加粗显示，关键指标突出
- ✅ 保持专业、客观、实事求是的分析态度

【使用说明】
- 用户提出的任何问题，都必须基于上述数据进行回答
- 遇到数据缺失的问题，直接告知"当前数据不足"
- 重要数据点用"**加粗**"标记以便突出关键信息`;

  fs.appendFileSync(debugFile, `Generated prompt length: ${systemPrompt.length}\n`);
  fs.appendFileSync(debugFile, `Prompt content (first 200 chars): ${systemPrompt.substring(0, 200)}\n`);
  
  console.log(`[buildSystemPrompt] Generated prompt length=${systemPrompt.length}`);
  console.log(`[buildSystemPrompt] Prompt content (first 500 chars):\n${systemPrompt.substring(0, 500)}\n...`);
  return systemPrompt;
}

// Helper: Build detailed context from message content (智能提取问题中的关键词)
function extractBusinessContext(message) {
  const keywords = {
    device: ['设备', '机器', '设施', '运营'],
    store: ['门店', '店铺', '分店', '区域'],
    sales: ['销售', '营收', '收入', '订单'],
    usage: ['使用', '时长', '次数', '频率'],
    performance: ['性能', '效率', '故障', '问题']
  };
  
  let context = [];
  
  for (const [key, words] of Object.entries(keywords)) {
    if (words.some(w => message.includes(w))) {
      context.push(key);
    }
  }
  
  return context;
}

// Helper: Get recent chat history for context
async function getChatHistoryForContext(sessionId, maxMessages = 5) {
  try {
    const messages = await dbAll(`
      SELECT role, content FROM chat_message
      WHERE session_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [sessionId, maxMessages]);

    // Reverse to get chronological order and map roles for LLM
    return messages.reverse().map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : msg.role,  // Map 'ai' to 'assistant' for LLM
      content: msg.content
    }));
  } catch (err) {
    console.warn('Failed to fetch chat history:', err.message);
    return [];
  }
}

// Main chat endpoint - Complete implementation
app.post('/api/chat', async (req, res) => {
  // FORCE WRITE TO FILE - bypass any logging issues
  const traceFile = path.join(__dirname, 'trace.txt');
  fs.appendFileSync(traceFile, new Date().toISOString() + ' [CHAT ENDPOINT CALLED]\n');
  
  const { sessionId, message, context = {} } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({
      code: -1,
      msg: 'sessionId and message required',
      data: null
    });
  }

  try {
    debugLog(`\n🟡 [CHAT REQUEST] sessionId=${sessionId}`);
    debugLog(`📝 User message: "${message}"`);
    debugLog(`🟡 [DEBUG] Chat endpoint called`);

    // Step 1: 校验用户身份 (Authentication)
    // Currently using sessionId as user identification
    // In production: Extract from JWT token or session
    const userId = sessionId; // Simplified for now
    console.log(`👤 User identified: ${userId}`);

    // Step 2: 获取用户问题
    console.log('Step 1/7: User message received ✓');

    // Step 3: 查询用户自己的数据 / 业务数据 / 知识库
    console.log('Step 2/7: Fetching business data...');
    const businessContext = await getBusinessContext();
    console.log(`   ✓ Business context: ${businessContext.devices.length} devices, ${businessContext.stores.length} stores`);

    // Step 4: 获取会话历史
    console.log('Step 3/7: Retrieving chat history...');
    const chatHistory = await getChatHistoryForContext(sessionId, 5);
    console.log(`   ✓ Found ${chatHistory.length} previous messages in session`);

    // Step 5: 组装 prompt
    console.log('Step 4/7: Building enriched prompt...');
    debugLog(`🟡 [DEBUG] About to call buildSystemPrompt`);
    const systemPrompt = await buildSystemPrompt(sessionId, businessContext);
    debugLog(`🟡 [DEBUG] buildSystemPrompt returned, prompt length=${systemPrompt.length}`);

    // Construct LLM messages with context
    const llmMessages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add historical context if available
    if (chatHistory.length > 0) {
      console.log(`   ✓ Adding ${chatHistory.length} historical messages to context`);
      llmMessages.push(...chatHistory.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content
      })));
    }

    // Add current user message
    llmMessages.push({
      role: 'user',
      content: message
    });

    console.log(`   ✓ Built prompt with ${llmMessages.length} messages`);

    // Step 6: 保存用户消息到数据库 (Save before LLM call)
    console.log('Step 5/7: Saving user message to database...');
    const userMsgId = 'msg_' + Date.now() + '_u';
    await dbRun(
      'INSERT INTO chat_message (id, session_id, user_id, role, content, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userMsgId, sessionId, userId, 'user', message, 'success']
    );
    console.log(`   ✓ User message saved: ${userMsgId}`);

    // Step 7: 调用大模型接口
    console.log('Step 6/7: Calling Doubao LLM API...');
    const llmStartTime = Date.now();
    const llmResult = await callDoubaoAPI(llmMessages);
    const llmDuration = Date.now() - llmStartTime;

    if (!llmResult.success) {
      console.error('❌ LLM call failed:', llmResult.error);
      throw new Error(llmResult.error || 'LLM service error');
    }

    console.log(`   ✓ LLM response received (${llmDuration}ms)`);
    console.log(`   ✓ Response length: ${llmResult.content.length} chars`);

    const aiReply = formatResponse(llmResult.content);
    const sources = [
      { type: 'database', name: '蔡文姬运营数据库' },
      { type: 'monitoring', name: '实时设备监控系统' },
      { type: 'report', name: '运营分析报告' }
    ];

    // Step 8: 保存AI消息到数据库
    console.log('Step 7/7: Saving AI response to database...');
    const aiMsgId = 'msg_' + Date.now() + '_ai';
    await dbRun(
      'INSERT INTO chat_message (id, session_id, user_id, role, content, sources, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [aiMsgId, sessionId, userId, 'ai', aiReply, JSON.stringify(sources), 'success']
    );
    console.log(`   ✓ AI message saved: ${aiMsgId}`);

    // Update session timestamp and title
    const sessionTitle = message.substring(0, 30) + (message.length > 30 ? '...' : '');
    await dbRun(
      'UPDATE chat_session SET updated_at = CURRENT_TIMESTAMP, title = ? WHERE id = ?',
      [sessionTitle, sessionId]
    );
    console.log(`   ✓ Session updated`);

    console.log(`\n✅ [CHAT COMPLETE] Processed in ${Date.now() - llmStartTime}ms`);
    console.log(`   Tokens used: ${llmResult.usage?.total_tokens || 'unknown'}`);

    res.json({
      code: 0,
      msg: 'success',
      data: {
        messageId: aiMsgId,
        reply: aiReply,
        sources: sources,
        usage: llmResult.usage || { total_tokens: 0 },
        sessionId: sessionId
      }
    });

  } catch (err) {
    console.error('\n❌ [CHAT ERROR]:', err.message);

    // Log failed message
    try {
      const aiMsgId = 'msg_' + Date.now() + '_err';
      await dbRun(
        'INSERT INTO chat_message (id, session_id, role, content, status) VALUES (?, ?, ?, ?, ?)',
        [aiMsgId, sessionId, 'error', `Error: ${err.message}`, 'error']
      );
    } catch (e) {
      console.error('Failed to log error message:', e.message);
    }

    res.status(500).json({
      code: -1,
      msg: err.message || 'Chat processing failed',
      data: null
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    msg: 'Server running',
    timestamp: new Date().toISOString(),
    doubao_key: DOUBAO_API_KEY ? '✅ configured' : '❌ missing'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    code: -1,
    msg: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  // Load markdown business data on startup
  loadMarkdownBusinessData();
  
  console.log(`
==================================================
   CaiWenjI AI Assistant - Backend Server Started
   Port: ${PORT}
   Doubao: ${DOUBAO_API_KEY ? 'READY' : 'MISSING'}
==================================================
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  db.close((err) => {
    if (err) console.error('Database close error:', err);
    process.exit(0);
  });
});
