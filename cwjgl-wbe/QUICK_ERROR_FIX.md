# ⚡ 快速修复清单 - 3 个关键问题

## 问题概览

你遇到的 4 个错误其实由 **3 个根本原因** 引起：

| # | 问题 | 原因| 修复 |
|---|------|------|------|
| 1 | `POST /api/chat 500` | Vite 代理没有生效 | 重启 npm run dev |
| 2 | `SyntaxError: <!DOCTYPE` | 后端返回 HTML 而非 JSON | 同上 + 验证后端 |
| 3 | `Doubao-Seed-1.6 不存在` | API 模型配置错误 | 更新模型 ID 或禁用 LLM |

---

## 🔧 立即执行的 5 个步骤

### 步骤 1: 停止所有进程
```
Ctrl+C
```

### 步骤 2: 清除缓存并安装依赖
```powershell
npm install
npm run db:init
```

### 步骤 3: 启动后端（终端 1）
```powershell
npm run server
```

**等待显示**:
```
✅ SQLite Database connected
✅ Database tables initialized
```

### 步骤 4: 清除 Vite 缓存并启动前端（终端 2）
```powershell
Remove-Item -Path node_modules\.vite -Force -Recurse -ErrorAction SilentlyContinue
npm run dev
```

**查看日志**，应该显示代理配置:
```
➜  Proxies:
    /api -> http://localhost:3000
```

### 步骤 5: 测试
访问: `http://localhost:5173/aichat`

F12 → Network → 发送消息，检查:
- ✅ `/api/chat` 请求状态为 200（或有 JSON 响应）
- ✅ 不是返回 HTML 错误页面

---

## 🎯 问题 1: Vite 代理（优先级：最高）

**症状**: `POST http://localhost:5173/api/chat` ← 注意端口是 5173，不是 3000

**原因**: Vite 没有正确转发 `/api` 请求到后端

**修复**:
```bash
# 关闭 Vite
Ctrl+C

# 清空缓存（很重要！）
Remove-Item node_modules\.vite -Force -Recurse -ErrorAction SilentlyContinue

# 重启（会重新加载配置）
npm run dev
```

**验证**: 检查 npm run dev 的输出中是否有:
```
➜  Proxies:
    /api -> http://localhost:3000
```

---

## 🎯 问题 2: Doubao API 错误（优先级：中）

**症状**: `Doubao-Seed-1.6 does not exist or you do not have access to it`

**原因**: 可能是:
- 模型 ID 错误
- API Key 过期或无效
- 用户权限问题

**快速修复 A: 更改模型 ID**

编辑 `server.js` 第 68 行:

```javascript
// 尝试这些模型名称之一
const DOUBAO_MODEL_ID = 'doubao-pro';  // 改这里
```

其他可能的模型:
- `doubao-pro-4k`
- `doubao-lite-4k`
- 查询火山引擎官方文档获取最新模型列表

**快速修复 B: 禁用 LLM 进行测试（推荐先做这个）**

编辑 `server.js` 的 `callDoubaoAPI` 函数（约第 140 行）:

```javascript
// 改成这样（临时禁用 LLM，用模拟回复测试）
async function callDoubaoAPI(messages) {
  return {
    success: true,
    content: '这是蔡文姬的测试回复。如果你看到这条消息，说明前后端连接正常！',
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
  };
}
```

这样做可以:
- ✅ 快速测试前后端是否连接
- ✅ 验证数据库保存功能
- ✅ 一旦 LLM 问题解决，再恢复真实配置

---

## 🎯 问题 3: HTML 错误响应（优先级：中）

**症状**: `Unexpected token '<', "<!DOCTYPE"`

**原因**: 后端返回了错误页面而不是 JSON

**修复**: 这会在问题 1 解决后自动修复

如果仍然有问题，确保:
1. 后端正常运行 (`npm run server` 显示成功消息)
2. 检查 server.js 中的路由定义
3. 使用模拟模式（问题 2 的修复 B）进行测试

---

## ⏱️ 预计时间

| 步骤 | 时间 |
|------|------|
| 停止进程 | 1 分钟 |
| 安装依赖和初始化 | 2 分钟 |
| 启动后端 | 1 分钟 |
| 启动前端 | 2 分钟 |
| **总计** | **~6 分钟** |

---

## 📊 最终检查清单

- [ ] `npm run dev` 启动时显示代理配置 `Proxies: /api -> http://localhost:3000`
- [ ] `npm run server` 显示 `✅ Database tables initialized`
- [ ] 访问 http://localhost:5173/aichat 页面加载成功
- [ ] F12 Network 中 `/api/*` 请求返回 JSON（不是 HTML）
- [ ] 发送消息后看到回复（可能是真实 LLM 或模拟测试响应）

---

## 🚨 还有问题？

查看详细分析文档:
- **完整分析**: [ERROR_ANALYSIS_AND_FIXES.md](ERROR_ANALYSIS_AND_FIXES.md)
- **原始文档**: [API_REQUEST_FAILURE_ANALYSIS.md](API_REQUEST_FAILURE_ANALYSIS.md)
- **技术指南**: [AI_CHAT_IMPLEMENTATION.md](AI_CHAT_IMPLEMENTATION.md)

---

现在开始修复吧！从**步骤 1** 开始，一个接一个地执行。
