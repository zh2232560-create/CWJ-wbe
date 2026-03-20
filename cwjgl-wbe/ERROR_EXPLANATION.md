# 🔴 你遇到的问题详解

## 问题 1: POST http://localhost:5173/api/chat 500

### 症状
```
POST http://localhost:5173/api/chat 500 (Internal Server Error)
```

### 是什么意思？
- 你的前端代码向 `http://localhost:5173` 发送了请求
- 但应该向 `http://localhost:3000` 发送
- **5173 是 Vite 前端服务器，3000 是 Node.js 后端服务器**

### 原因
Vite 的代理配置没有生效。虽然 `vite.config.js` 中配置了代理，但你需要**重启** Vite 才能让配置生效。

### 解决方案
```bash
# 1. 关闭 Vite（如果在运行）
Ctrl+C

# 2. 清除 Vite 缓存
Remove-Item node_modules\.vite -Force -Recurse -ErrorAction SilentlyContinue

# 3. 重新启动 Vite
npm run dev

# 4. 检查日志中是否显示：
# ➜  Proxies:
#     /api -> http://localhost:3000
```

---

## 问题 2: SyntaxError: Unexpected token '<', "<!DOCTYPE"

### 症状
```
Failed to create session: SyntaxError: Unexpected token '<', "<!DOCTYPE "...
Failed to load resource: status 404
```

### 是什么意思？
前端收到了一个 HTML 页面，而不是 JSON 数据。这通常是后端发回了错误页面。

```
期望响应:
{ 
  code: 0, 
  data: { sessionId: "..." } 
}

实际响应:
<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
...
```

### 原因
1. 请求没有通过代理到达后端（问题 1）
2. 或者后端的路由定义有问题
3. 或者后端没有运行

### 解决方案
- 一旦问题 1 解决，这个问题也会自动解决
- 但还要确保后端运行正常

---

## 问题 3: Doubao-Seed-1.6 does not exist

### 症状
```
请求失败：模型调用失败: The model or endpoint Doubao-Seed-1.6 does not exist 
or you do not have access to it. Request id: ...
```

### 是什么意思？
火山引擎拒绝了你的请求，说：
- 模型 "Doubao-Seed-1.6" 不存在
- 或你没有权限访问

### 原因
可能有多个原因：

| 原因 | 说明 |
|------|------|
| 模型名称错误 | server.js 中配置的 `doubao-lite` 可能不是正确的模型 ID |
| API Key 过期 | `DOUBAO_API_KEY` 可能已失效 |
| User 没有权限 | 用户账号可能没有访问某个模型的权限 |
| API 端点错误 | 可能是 API URL 或请求格式不对 |

### 解决方案

#### 方案 A: 更新模型 ID（推荐）

编辑 `server.js` 第 68 行，尝试使用其他模型名称：

```javascript
// 当前配置
const DOUBAO_MODEL_ID = 'doubao-lite';

// 尝试改成以下其中一个
const DOUBAO_MODEL_ID = 'doubao-pro';
const DOUBAO_MODEL_ID = 'doubao-pro-4k';
const DOUBAO_MODEL_ID = 'doubao-lite-4k';
```

**如何知道正确的模型名？**
- 登录火山引擎官方控制台
- 查看 API 文档或已购买的模型列表
- 使用正确的模型 ID

#### 方案 B: 检查 API Key

```bash
# 查看当前配置
cat .env | grep DOUBAO_API_KEY

# 如果 Key 过期，就需要生成新的：
# 1. 登录火山引擎控制台
# 2. 生成新的 API Key
# 3. 更新 .env 文件
# 4. 重启后端：npm run server
```

#### 方案 C: 临时禁用 LLM（快速测试）

如果你只想验证前后端是否正常连接，可以临时禁用 LLM：

编辑 `server.js` 的 `callDoubaoAPI` 函数（约第 140 行）：

```javascript
async function callDoubaoAPI(messages) {
  // 临时返回模拟响应，用于测试
  return {
    success: true,
    content: '这是蔡文姬的测试回复。如果看到这条消息，说明前后端连接正常！',
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    }
  };
}
```

这样做的好处：
- ✅ 立即验证系统是否工作
- ✅ 不受 LLM API 问题影响
- ✅ 测试消息保存、数据库等功能
- ✅ 一旦 LLM 问题解决，再恢复真实配置

---

## 问题 4: Failed to load resource: 404/500

### 症状
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

### 是什么意思？
- **404**: 找不到这个 API 端点
- **500**: 服务器内部错误

### 原因
1. 请求没有到达正确的服务器（问题 1）
2. 后端没有定义某些路由
3. 后端代码有错误

### 解决方案

#### 第一步：确保后端运行
```bash
npm run server

# 应该显示：
# ✅ SQLite Database connected
# ✅ Database tables initialized
```

#### 第二步：测试后端健康检查
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get
Write-Host $response.Content
```

应该返回：
```json
{
  "code": 0,
  "msg": "Server running",
  "timestamp": "...",
  "doubao_key": "✅ configured"
}
```

#### 第三步：确保代理正常
在 Vite 日志中应该看到：
```
➜  Proxies:
    /api -> http://localhost:3000
```

---

## 🎯 快速诊断：你现在需要做什么？

### 立即执行（5 分钟）

```bash
# 1. 关闭所有進程
Ctrl+C

# 2. 启动后端（终端 1）
npm run server

# 等待显示:
# ✅ SQLite Database connected
# ✅ Database tables initialized

# 3. 清除缓存并启动前端（终端 2）
Remove-Item node_modules\.vite -Force -Recurse -ErrorAction SilentlyContinue
npm run dev

# 检查是否看到:
# ➜  Proxies:
#     /api -> http://localhost:3000
```

### 然后测试

打开浏览器: `http://localhost:5173/aichat`

F12 → Network 标签 → 发送聊天消息

检查：
- ✅ 请求发送到 `/api/chat`
- ✅ 状态是 200（成功）或包含 JSON 错误（也比 HTML 好）
- ✅ 响应是 JSON，不是 HTML

### 如果仍有 Doubao 错误

使用**方案 C**: 临時禁用 LLM（在 server.js 中）

---

## 📊 问题关联图

```
你的错误们其实来自 2 个根本问题：

问题 A: Vite 代理没生效
  ├─ 导致 → 请求发送到 5173 而不是 3000
  ├─ 导致 → POST /api/chat 500
  ├─ 导致 → SyntaxError <!DOCTYPE
  └─ 导致 → 404/500 Not Found

问题 B: Doubao API 配置错误
  └─ 导致 → Doubao-Seed-1.6 does not exist

解决方案：
1. 修问题 A (重启 Vite)
2. 修問題 B (更新模型或 API Key)
```

---

## 💡 为什么会这样？

### Vite 代理
在开发环境中：
- 前端运行在 `localhost:5173`
- 后端运行在 `localhost:3000`
- 浏览器不允许不同端口之间的直接通信（跨域）
- Vite 开发服务器可以充当代理，转发请求

当你修改 `vite.config.js` 时，必须**重启** Vite 才能生效。关闭后重新启动会重新加载配置文件。

### Doubao API
火山引擎的 Doubao API 需要：
1. 正确的模型 ID（可能一直在变化）
2. 有效的 API Key
3. 用户有权访问该模型

如果任何一个有问题，API 就会拒绝请求。

---

## 🚀 总结

你需要做的就是：

1. **重启 Vite** (清除缓存后重新启动)
2. **更新 Doubao 配置** (模型 ID、API Key，或临时禁用)
3. **验证** 前后端连接是否正常

预计 5-10 分钟就能解决！

---

**最后更新**: 2026-03-19  
**完整文档**: 查看 [ERROR_ANALYSIS_AND_FIXES.md](ERROR_ANALYSIS_AND_FIXES.md)
