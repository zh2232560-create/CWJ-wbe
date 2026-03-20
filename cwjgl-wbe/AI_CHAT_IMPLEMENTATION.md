# 蔡文姬 AI 助手 - 完整实现指南

## 📋 项目概述

蔡文姬 AI 助手是一个全栈应用，集积了以下核心功能：
- **前端**: Vue 3 + ECharts 的现代化聊天界面
- **后端**: Node.js/Express REST API 服务
- **LLM**: 火山引擎 Doubao-Seed-1.6 大语言模型
- **数据库**: SQLite3 持久化存储

---

## 🚀 快速启动

### 1. 环境配置

```bash
# 安装依赖（已配置在 package.json）
npm install

# 初始化数据库
npm run db:init
```

### 2. 启动服务

**终端 1 - 前端开发服务器**:
```bash
npm run dev
# Vite 将在 http://localhost:5173 启动
```

**终端 2 - 后端 API 服务器**:
```bash
npm run server
# Express 将在 http://localhost:3000 启动
```

### 3. 访问应用

打开浏览器访问: `http://localhost:5173/aichat`

---

## 📂 文件结构

```
├── src/
│   ├── views/cwj/
│   │   └── aichat.vue          # 主聊天页面 (前端)
│   ├── router/index.js          # 路由配置
│   └── ...
├── server.js                    # Express 后端服务 (ESM)
├── scripts/
│   └── init-db.cjs              # 数据库初始化脚本 (CommonJS)
├── db/
│   └── chat.db                  # SQLite3 数据库文件
├── .env                         # 环境变量配置
└── package.json                 # 项目依赖和脚本
```

---

## 🔌 API 端点详解

### 1. 创建聊天会话
**POST** `/api/chat/session/create`

**请求**:
```json
{}
```

**响应**:
```json
{
  "code": 0,
  "msg": "Session created",
  "data": {
    "sessionId": "session_1234567890",
    "title": "新建对话"
  }
}
```

---

### 2. 主对话端点（核心）
**POST** `/api/chat`

**请求**:
```json
{
  "sessionId": "session_1234567890",
  "message": "南部大区有多少家门店？",
  "context": {
    "page": "aichat"
  }
}
```

**后端处理流程**:
```
1. 将用户消息存入 chat_message 表
2. 调用 getBusinessContext() 获取实时业务数据
   - 从 /api/device/list 获取设备清单
   - 从 /api/store/list 获取门店信息
3. 组装 system prompt (包含业务数据背景)
4. 构建 messages 数组:
   - system: "你是蔡文姬，数据来自: ...实时业务数据..."
   - user: "南部大区有多少家门店？"
5. POST 请求到 Doubao API
6. 解析 LLM 响应
7. 将 AI 回复存入 chat_message 表 (role='ai')
8. 返回前端
```

**响应**:
```json
{
  "code": 0,
  "msg": "Chat processed",
  "data": {
    "messageId": "msg_1234567890_ai",
    "reply": "根据我们的门店数据，南部大区包括...",
    "sources": ["蔡文姬数据库", "实时监控系统", "运营报告"],
    "usage": {
      "prompt_tokens": 450,
      "completion_tokens": 280,
      "total_tokens": 730
    }
  }
}
```

---

### 3. 获取会话列表
**GET** `/api/chat/sessions`

**响应**:
```json
{
  "code": 0,
  "msg": "Sessions retrieved",
  "data": {
    "sessions": [
      {
        "id": "session_1234567890",
        "title": "新建对话",
        "updated_at": "2025-01-15 10:30:45"
      }
    ]
  }
}
```

---

### 4. 获取会话消息历史
**GET** `/api/chat/history?sessionId=session_1234567890`

**响应**:
```json
{
  "code": 0,
  "msg": "History retrieved",
  "data": {
    "messages": [
      {
        "id": "msg_1234567890_u",
        "role": "user",
        "content": "南部大区有多少家门店？",
        "status": "success",
        "created_at": "2025-01-15 10:30:10"
      },
      {
        "id": "msg_1234567890_ai",
        "role": "ai",
        "content": "根据我们的门店数据，南部大区包括...",
        "sources": ["蔡文姬数据库"],
        "status": "success",
        "created_at": "2025-01-15 10:30:45"
      }
    ]
  }
}
```

---

### 5. 健康检查
**GET** `/api/health`

**响应**:
```json
{
  "code": 0,
  "msg": "Server running",
  "timestamp": "2025-01-15T10:30:45.000Z",
  "doubao_key": "✅ configured"
}
```

---

## 💾 数据库架构

### chat_session 表
```sql
CREATE TABLE chat_session (
  id TEXT PRIMARY KEY,              -- 会话唯一ID (session_timestamp)
  user_id TEXT,                      -- 用户ID (可选)
  title TEXT,                        -- 会话标题
  created_at DATETIME,               -- 创建时间 (自动)
  updated_at DATETIME                -- 最后更新时间 (自动)
)
```

### chat_message 表
```sql
CREATE TABLE chat_message (
  id TEXT PRIMARY KEY,               -- 消息唯一ID
  session_id TEXT NOT NULL,          -- 父会话ID (外键)
  user_id TEXT,                      -- 用户ID
  role TEXT NOT NULL,                -- 'user' | 'ai' | 'system'
  content TEXT,                      -- 消息内容
  sources TEXT,                      -- JSON格式的数据来源数组
  status TEXT DEFAULT 'success',     -- 'success' | 'error' | 'loading'
  created_at DATETIME,               -- 创建时间
  FOREIGN KEY(session_id) REFERENCES chat_session(id) ON DELETE CASCADE
)
```

### 关键索引
```sql
CREATE INDEX idx_chat_message_session_id ON chat_message(session_id);
CREATE INDEX idx_chat_message_created_at ON chat_message(created_at);
CREATE INDEX idx_chat_session_updated_at ON chat_session(updated_at);
```

---

## 🤖 LLM 集成详解

### Doubao API 配置

**API 端点**: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`

**认证方式**: Bearer Token (从 .env 读取)

**模型**: `doubao-lite` (轻量级模型，速度快)

### Prompt 设计原则

```javascript
// system prompt 动态组装示例
const systemPrompt = `你是蔡文姬，一个专业的运营数据分析助手。你具备以下能力：
- 分析设备运营数据和性能指标
- 提供门店业务建议
- 解读项目运营报告

重要规则：
1. 所有答案必须严格基于已有的业务数据
2. 如果数据不足，说明数据范围
3. 避免猜测或编造数据
4. 使用数据支持所有观点

当前可用数据：
- 设备数: ${businessContext.devices.length}
- 门店数: ${businessContext.stores.length}
- 数据时间: ${businessContext.timestamp}`;
```

**关键特性**:
- ✅ 实时业务数据嵌入 (防止 hallucination)
- ✅ 清晰的 role 角色定义
- ✅ 明确的约束边界
- ✅ 多轮对话支持

---

## 🎨 前端 aichat.vue 核心功能

### 组件架构

```vue
<template>
  <div class="chat-wrapper">
    <!-- 侧边栏：历史会话 -->
    <aside class="chat-sidebar">
      <button @click="createNewSession">+ 新建对话</button>
      <div v-for="session in historySessions" @click="switchSession(session.id)">
        {{ session.title }}
      </div>
    </aside>

    <!-- 主区域：聊天 -->
    <main class="chat-main">
      <div class="chat-messages">
        <!-- 欢迎屏 -->
        <div v-if="messages.length === 0" class="welcome-screen">...</div>
        
        <!-- 消息气泡 -->
        <div v-for="msg in messages" :class="['message-bubble', msg.role]">
          <div class="content">
            <!-- 加载态 -->
            <div v-if="msg.status === 'loading'">
              <span class="spinner"></span> AI 正在生成中...
            </div>
            <!-- 错误态 -->
            <div v-else-if="msg.status === 'error'">
              ❌ {{ msg.content }}
              <button @click="retryMessage(index)">重试</button>
            </div>
            <!-- 成功显示 -->
            <div v-else v-html="msg.content"></div>
            
            <!-- 数据来源标签 -->
            <div v-if="msg.sources" class="data-sources">
              <span v-for="source in msg.sources">{{ source }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部输入 -->
      <footer class="chat-footer">
        <div class="suggestion-chips">
          <button v-for="chip in suggestions" @click="sendQuery(chip)">
            {{ chip }}
          </button>
        </div>
        <textarea v-model="userInput" @keydown.enter="sendQuery()"></textarea>
        <button :disabled="!userInput.trim() || loading" @click="sendQuery()">
          {{ loading ? '发送中...' : '发送' }}
        </button>
      </footer>
    </main>
  </div>
</template>
```

### 关键方法

```javascript
// 1. 初始化会话
async initSession() {
  try {
    const response = await fetch('/api/chat/session/create', {
      method: 'POST'
    });
    const data = await response.json();
    this.sessionId = data.data.sessionId;
  } catch (err) {
    this.sessionId = 'session_' + Date.now(); // 降级处理
  }
}

// 2. 发送消息（核心方法）
async sendQuery(query) {
  const text = query || this.userInput;
  
  // 添加用户消息
  this.messages.push({
    id: 'msg_' + Date.now() + '_user',
    role: 'user',
    content: text,
    status: 'success'
  });
  
  // 添加占位符
  const aiMsg = {
    id: 'msg_' + Date.now() + '_ai',
    role: 'ai',
    content: '',
    status: 'loading'
  };
  this.messages.push(aiMsg);
  this.loading = true;

  try {
    // POST 到后端
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        message: text,
        context: { page: 'aichat' }
      })
    });

    const data = await response.json();

    if (data.code === 0) {
      // 更新消息
      const lastMsg = this.messages[this.messages.length - 1];
      lastMsg.content = data.data.reply;
      lastMsg.status = 'success';
      lastMsg.sources = data.data.sources;
    } else {
      throw new Error(data.msg);
    }
  } catch (err) {
    // 错误处理
    const lastMsg = this.messages[this.messages.length - 1];
    lastMsg.status = 'error';
    lastMsg.content = err.message;
  } finally {
    this.loading = false;
  }
}

// 3. 加载会话历史
async loadSessionMessages(sessionId) {
  const response = await fetch(`/api/chat/history?sessionId=${sessionId}`);
  const data = await response.json();
  this.messages = data.data.messages;
}

// 4. 重试消息
async retryMessage(index) {
  const userMsg = this.messages[index - 1];
  this.messages.splice(index, 1);
  await this.sendQuery(userMsg.content);
}
```

---

## 🔐 环境变量配置

创建 `.env` 文件:
```env
# Doubao API Configuration
DOUBAO_API_KEY=227a1eb8-cc13-4b8b-a2b8-b1745d94a59a

# Server Configuration
PORT=3000
NODE_ENV=development

# Business API (可选，用于数据联动)
CWJ_API_BASE=http://localhost:8080/api
```

⚠️ **安全提示**: 
- 不要将 `.env` 提交到 Git
- 生产环境使用密钥管理服务 (如 AWS Secrets Manager)

---

## 📊 业务数据集成

### 数据流向

```
用户提问
    ↓
前端 aichat.vue
    ↓ (POST /api/chat)
后端 server.js
    ├─→ 保存用户消息到 chat_message
    ├─→ getBusinessContext()
    │   ├─→ GET /api/device/list (获取设备数据)
    │   ├─→ GET /api/store/list (获取门店数据)
    │   └─→ 返回业务上下文
    ├─→ 组装 system prompt (包含实时业务数据)
    ├─→ 构建 messages 数组
    ├─→ callDoubaoAPI(messages)
    │   └─→ POST https://ark.cn-beijing.volces.com/api/v3/chat/completions
    ├─→ 解析 LLM 响应
    ├─→ 保存 AI 回复到 chat_message
    └─→ 返回前端
        ↓
    前端展示消息 + 数据来源
```

### 常用查询示例

**示例 1: 获取设备列表**
```bash
curl -X GET "http://localhost:8080/api/device/list"
```

**响应格式**:
```json
{
  "data": [
    {
      "id": "dev_001",
      "name": "大悦城 - 睡眠舱 01",
      "status": "online",
      "location": "北京朝阳区",
      "usage_today": 12
    }
  ]
}
```

**示例 2: 获取门店列表**
```bash
curl -X GET "http://localhost:8080/api/store/list"
```

**响应格式**:
```json
{
  "data": [
    {
      "id": "store_001",
      "name": "大悦城",
      "region": "中部大区",
      "devices": 5,
      "revenue_today": 2500.00
    }
  ]
}
```

---

## 🐛 调试与日志

### 后端日志示例

```
╔════════════════════════════════════════════════╗
║       蔡文姬 AI 助手 - 后端服务已启动            ║
║       Port: 3000                            ║
║       Doubao: ✅ configured                  ║
╚════════════════════════════════════════════════╝

✅ SQLite Database connected
✅ Database tables initialized

🟡 Processing chat: sessionId=session_1234567890, message="南部大区有多少家门店？"
📊 Business context fetched: 15 devices, 8 stores
🤖 Calling Doubao LLM...
✅ Chat completed: 250 chars, tokens: 730
```

### 常见问题排查

**问题 1: "DOUBAO_API_KEY not found"**
```bash
# 解决方案
echo "DOUBAO_API_KEY=your_key_here" > .env
```

**问题 2: "Cannot GET /api/device/list"**
```bash
# 后端无法连接业务 API，降级处理
# 服务器会继续运行，只是业务数据为空
```

**问题 3: "Database locked"**
```bash
# SQLite 并发问题，建议：
# 1. 重启服务器
# 2. 检查是否有其他进程访问 db/chat.db
```

---

## 📈 性能优化

### 1. 数据库查询优化
```javascript
// ❌ 低效：每次都全表扫描
db.all('SELECT * FROM chat_message WHERE session_id = ?', [sessionId])

// ✅ 高效：使用索引
// 已创建: CREATE INDEX idx_chat_message_session_id ON chat_message(session_id)
```

### 2. 前端缓存策略
```javascript
// 本地缓存会话列表，减少 API 调用
const cachedSessions = localStorage.getItem('chatSessions');
```

### 3. 异步加载
```javascript
// 消息历史在后台加载，不阻塞UI
this.loadSessionMessages(sessionId); // 不 await
```

---

## 🚢 部署指南

### Docker 部署示例

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js .
COPY scripts/ ./scripts/
COPY db/ ./db/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
```

**构建和运行**:
```bash
docker build -t caiweng-ai .
docker run -p 3000:3000 -e DOUBAO_API_KEY=your_key caiweng-ai
```

---

## ✅ 测试清单

- [ ] 前端访问 `/aichat` 路由不报错
- [ ] 点击"新建对话"成功创建会话
- [ ] 发送文本消息，收到 AI 回复
- [ ] 切换会话，消息历史正确加载
- [ ] 重试失败消息，重新发送成功
- [ ] 数据来源标签正确显示
- [ ] `/api/health` 端点返回正常
- [ ] 数据库文件 `db/chat.db` 存在且包含数据
- [ ] 退出聊天后重新进入，消息历史保留

---

## 📚 相关文档

- [Doubao API 文档](https://console.volcengine.com)
- [SQLite 数据库指南](https://www.sqlite.org/docs.html)
- [Express.js 官方文档](https://expressjs.com/)
- [Vue 3 聊天组件最佳实践](https://vue3docs.cn/)

---

## 📞 技术支持

如遇问题，请检查:
1. Doubao API 密钥是否正确
2. Node.js 版本是否 >= 16
3. SQLite 数据库文件权限
4. 防火墙是否阻止 3000 端口
5. 后端业务 API 是否可访问

---

**最后更新**: 2025-01-15  
**版本**: 1.0.0  
**维护者**: 蔡文姬团队
