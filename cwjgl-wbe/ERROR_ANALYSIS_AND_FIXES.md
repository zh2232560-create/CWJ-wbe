# 🔴 错误分析与修复方案

**问题时间**: 2026-03-19  
**错误类型**: 多个互相关联的问题  
**严重程度**: ⚠️ **高**

---

## 🎯 错误清单

### 1. ❌ Doubao 模型错误
```
错误信息: "The model or endpoint Doubao-Seed-1.6 does not exist 
or you do not have access to it"
```

**原因**: 
- 使用的模型 ID 可能错误或已过期
- API Key 可能无效或失效
- 用户权限问题

**当前配置** (server.js):
```javascript
const DOUBAO_MODEL_ID = 'doubao-lite';  // 使用的是这个
const DOUBAO_API_KEY = '227a1eb8-cc13-4b8b-a2b8-b1745d94a59a';  // 可能已过期
```

---

### 2. ❌ API 代理问题
```
错误信息: "POST http://localhost:5173/api/chat 500 (Internal Server Error)"
```

**问题分析**:
- 请求發送到 **localhost:5173** (Vite 开发服务器)
- 而不是代理到 **localhost:3000** (后端服务器)
- 说明:
  1. Vite 服务器没有重启，配置没生效
  2. 或者 Vite 配置文件有其他问题

**Vite 代理配置** (vite.config.js L33):
```javascript
'/api': {
  target: 'http://localhost:3000',  // ✅ 配置正确
  changeOrigin: true,
}
```

但代理没有生效 → **需要重启 Vite**

---

### 3. ❌ SyntaxError - HTML 响应
```
错误信息: "Unexpected token '<', "<!DOCTYPE"... is not valid JSON"
```

**原因**:
- 后端返回了 HTML 错误页面而不是 JSON
- 说明后端的 `/api/*` 路由可能:
  1. 没有正确定义
  2. 返回了 404 或 500 错误
  3. 返回了 Express 的错误页面

**症状**:
- `/api/chat/sessions` → 404 HTML 页面
- `/api/chat/session/create` → 404 HTML 页面  
- `/api/chat` → 500 HTML 错误页面

---

### 4. ❌ 多个 API 路由返回 404

```
Failed to load resource: status 404
  - /api/chat/sessions
  - /api/chat/session/create
```

**可能原因**:
1. 后端 server.js 没有正确启动
2. 路由没有正确定义
3. 后端进程崩溃了

---

## 🔧 逐步修复方案

### 问题 1: Vite 代理没有生效

**解決方案**:

```bash
# 1. 停止 npm run dev (如果正在运行)
Ctrl+C

# 2. 完全清除 npm 缓存和 Vite 缓存
rm -Force -Recurse node_modules\.vite

# 3. 重新启动 Vite（重新加载配置）
npm run dev
```

**验证**: 检查 Vite 启动日志中是否显示代理信息
```
VITE v... dev server running at:

➜  Local:   http://localhost:5173/
➜  Proxies:
    /api -> http://localhost:3000
```

如果看到代理信息，说明配置正确。

---

### 问题 2: Doubao API 配置

**检查清单**:

```bash
# 1. 验证 API Key 是否有效
cat .env | grep DOUBAO

# 预期输出: DOUBAO_API_KEY=227a1eb8-cc13-4b8b-a2b8-b1745d94a59a
```

**可能的修复**:

#### 选项 A: 更新模型名称

查阅火山引擎官方文档，正确的模型 ID 可能是:
- `doubao-pro` 
- `doubao-pro-4k`
- `doubao-lite-4k`
- 其他

**修改** server.js 的第 68 行:

```javascript
const DOUBAO_MODEL_ID = 'doubao-pro';  // 尝试使用这个
```

#### 选项 B: 使用新的 API Key

如果 API Key 过期，需要:
1. 登录火山引擎控制台
2. 生成新的 API Key
3. 更新 .env 文件:

```bash
DOUBAO_API_KEY=your_new_api_key_here
```

#### 选项 C: 降级到模拟模式

临时禁用 LLM，使用模拟响应进行测试（不修改 Doubao）:

**修改** server.js 的 `callDoubaoAPI` 函数:

```javascript
// 临时使用模拟响应
async function callDoubaoAPI(messages) {
  // 注释掉原来的代码，返回模拟响应
  return {
    success: true,
    content: '这是来自蔡文姬 AI 的模拟回复。实际的 LLM 集成已禁用以进行调试。',
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    }
  };
}
```

---

### 问题 3: 后端路由返回 404

**最可能的原因**: 后端服务器没有完全启动或有其他问题

**诊断步骤**:

```bash
# 1. 启动后端并观察日志
npm run server

# 预期输出:
# ✅ SQLite Database connected
# ✅ Database tables initialized
# （后端应该监听 3000）

# 2. 测试后端 health 端点
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -OutFile response.json
cat response.json

# 预期: { code: 0, msg: "Server running", ... }

# 3. 如果 health 端点失败，说明后端有问题
```

**修复步骤**:

```bash
# 1. 检查依赖是否完整
npm install

# 2. 重新初始化数据库
npm run db:init

# 3. 再次启动后端
npm run server

# 4. 检查是否有错误输出
```

---

### 问题 4: SyntaxError 修复

这个错误会在上面的问题 1-3 都修复后自动消失。

如果仍然出现 HTML 响应，说明后端没有正确处理请求。

---

## 📋 完整修复步骤

按以下顺序执行:

### 步骤 1️⃣: 停止所有运行的进程
```bash
Ctrl+C  # 停止所有 npm 进程
```

### 步骤 2️⃣: 检查和修复依赖
```bash
npm install
npm run db:init  # 重新初始化数据库
```

### 步骤 3️⃣: 启动后端（终端 1）
```bash
npm run server

# 等待显示:
# ✅ SQLite Database connected
# ✅ Database tables initialized
```

### 步骤 4️⃣: 清除 Vite 缓存并启动前端（终端 2）
```bash
# PowerShell 的方式清除缓存
Remove-Item -Path node_modules\.vite -Force -Recurse -ErrorAction SilentlyContinue

# 启动前端
npm run dev

# 检查日志，应该显示:
# VITE v... dev server running at:
# ➜  Local: http://localhost:5173/
```

### 步骤 5️⃣: 验证配置
```bash
# 在前端日志中查看是否看到代理信息:
# ➜  Proxies:
#     /api -> http://localhost:3000
```

### 步骤 6️⃣: 测试 API 연接

打开浏览器: `http://localhost:5173/aichat`

1. 打开 F12 → Network 标签
2. 点击"发送消息"
3. 观察 Network 中的请求:
   - 应该看到 `/api/chat` 的请求
   - 状态应该是 200（或看到具体的 JSON 错误，而不是 HTML）
   - 响应体应该是 JSON（而不是 HTML）

---

## 🎯 优先级排序

这些问题的修复优先级：

1. **高优先级 (必须先修复)**:
   - [ ] 重启 Vite 清除缓存（使代理生效）
   - [ ] 验证后端启动正常

2. **中优先级 (影响功能)**:
   - [ ] 修复 Doubao API 配置（模型名称或 Key）
   - [ ] 确保 `/api/*` 路由正常响应 JSON

3. **低优先级 (可选优化)**:
   - [ ] 启用模拟模式进行测试
   - [ ] 性能优化和错误处理改进

---

## 🧪 最小化测试

如果不想等待 LLM 响应，可以使用模拟模式快速测试：

**临时改动** server.js:

```javascript
// 在 callDoubaoAPI 函数前添加模拟逻辑
async function callDoubaoAPI(messages) {
  // 快速返回，用于测试
  return {
    success: true,
    content: '测试回复：这是蔡文姬的模拟响应。',
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
  };
}
```

这样可以:
- 跳过 LLM 等待（快速反馈）
- 测试前后端连接是否正常
- 验证数据库保存功能
- 一旦确认连接正常，再恢复真实 LLM 配置

---

## 📊 故障排查决策树

```
问题: POST http://localhost:5173/api/chat 500
  ├─ 请求发送到了 5173（错误）
  │  ├─ 原因 A: Vite 代理没有启动
  │  │  └─ 解决: 重启 npm run dev
  │  └─ 原因 B: 代理配置错误
  │     └─ 解决: 检查 vite.config.js
  │
  └─ 后端返回 500 错误
     ├─ 原因 A: Doubao API 配置错误
     │  └─ 解决: 更新模型 ID 或 API Key
     ├─ 原因 B: 路由处理错误
     │  └─ 解决: 使用模拟模式测试
     └─ 原因 C: 数据库问题
        └─ 解决: 重新初始化数据库
```

---

## ✅ 成功标志

完成修复后，应该看到:

- ✅ npm run dev 启动时显示代理配置
- ✅ npm run server 显示数据库连接成功
- ✅ 浏览器能访问 http://localhost:5173/aichat
- ✅ F12 Network 中 `/api/chat` 返回 JSON（不是 HTML）
- ✅ 发送消息后收到回复（可能是真实 LLM 或模拟）
- ✅ 消息保存到数据库

---

## 📞 具体命令速查

```bash
# 重来一遍的完整序列
Ctrl+C                                    # 停止所有进程

# 终端 1
npm run server                            # 启动后端

# 等待 "✅ Database tables initialized"

# 终端 2
Remove-Item node_modules\.vite -Force -Recurse -ErrorAction SilentlyContinue
npm run dev                               # 启动前端

# 浏览器
http://localhost:5173/aichat              # 打开应用
```

**建议**: 前后端分别打开不同终端，便于观察日志。

---

**诊断完成**: 2026-03-19  
**预期解决时间**: 5-10 分钟  
**所有问题均可修复**: ✅ 是
