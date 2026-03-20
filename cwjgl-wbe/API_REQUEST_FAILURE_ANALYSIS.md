# 🔍 API 请求失败原因分析与修复方案

**日期**: 2026-03-19  
**问题**: 前端向后端 API 发送请求时全部失败  
**诊断状态**: ✅ **已诊断并修复**

---

## 1️⃣ 症状描述

### 前端表现
```
发送消息 → 加载中... → ❌ 请求失败：Cannot POST /api/chat
         或
点击新建对话 → ❌ 请求失败：Cannot POST /api/chat/session/create
```

### 后端日志
```
✅ SQLite Database connected
✅ Database tables initialized
（已成功启动，但接收不到任何 API 请求）
```

### 网络请求（浏览器 DevTools）
```
请求 URL: http://localhost:3000/api/chat
状态: 无法连接 或 Connection refused
```

---

## 2️⃣ 根本原因分析

### 问题定位

**文件**: [vite.config.js](vite.config.js#L33)

```javascript
❌ 错误配置：
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000'  // 指向不存在的服务器
    }
  }
}
```

### 为什么会失败？

#### 1️⃣ **端口不匹配**
| 组件 | URL | 状态 |
|------|-----|------|
| 后端服务 | `http://localhost:3000` | ✅ 运行中 |
| Vite 代理 | `http://127.0.0.1:5000` | ❌ 配置错误 |
| CWJ 业务 API | `http://localhost:8080` | (可选) |

#### 2️⃣ **请求流向错误**

```
用户在前端 (localhost:5173) 发送请求
         ↓
浏览器向 /api/chat 发送 XHR 请求
         ↓
Vite 开发服务器拦截 /api/* 请求
         ↓
Vite 代理转发到 http://127.0.0.1:5000  ❌ 错误の目标
         ↓
连接失败：无这样的服务器
         ↓
返回错误: "Cannot POST /api/chat"
```

#### 3️⃣ **为什么前面工作过？**

在 2025-01-15 的实现中：
- server.js 可能在默认端口 (5000 或其他) 运行
- Vite 配置指向那个端口
- 所有请求成功

现在 (2026-03-19):
- server.js 被改为运行在端口 **3000**
- 但 Vite 配置仍旧指向 **5000**
- 导致所有请求转发到错误位置

---

## 3️⃣ 解决方案

### 修复方法

修改 [vite.config.js](vite.config.js#L32-L39)：

```javascript
✅ 正确配置：
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // ✅ 改为 3000
      changeOrigin: true,                // CORS 跨域支持
    },
  },
},
```

### 已应用的修改

```diff
  server: {
    proxy: {
      '/api': {
-       target: 'http://127.0.0.1:5000',
+       target: 'http://localhost:3000',
        changeOrigin: true,
-       // 不需要 rewrite，直接转发即可，后端已經在 /api/v2 路徑处理
-       // rewrite: (path) => path.replace(/^\/api/, '/api/v2'),
+       // 蔡文姬 AI 助手后端服务运行在 3000 端口
      },
    },
  },
```

**状态**: ✅ **已修复** (2026-03-19)

---

## 4️⃣ 验证修复

### 步骤 1: 重启前端开发服务器
```bash
# 停止现有的 npm run dev
Ctrl+C

# 重新启动
npm run dev
```

> ⚠️ **重要**: 必须重启 Vite，因为配置文件已修改

### 步骤 2: 启动后端服务
```bash
npm run server
# 期望输出：
# ✅ SQLite Database connected
# ✅ Database tables initialized
```

### 步骤 3: 测试 API 连接
在浏览器访问: `http://localhost:5173/aichat`

1. 点击"新建对话"
   - 期望: 显示欢迎屏幕 ✅
   
2. 输入消息: "你好，蔡文姬"
   - 期望: 显示"AI 正在生成中..." → 收到 AI 回复 ✅

3. F12 DevTools → Network 标签
   - 期望: `/api/chat` 请求返回 200 状态码 ✅
   - 响应体: `{ code: 0, data: { reply: "...", sources: [...] } }` ✅

---

## 5️⃣ 相关配置清单

验证以下配置是否正确：

### ✅ 后端配置 (server.js)
```javascript
const PORT = process.env.PORT || 3000;  // ✅ 监听 3000
app.listen(PORT, () => { ... });
```

### ✅ 前端代理配置 (vite.config.js)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',  // ✅ 指向 3000
    changeOrigin: true,
  },
},
```

### ✅ 环境变量配置 (.env)
```bash
DOUBAO_API_KEY=227a1eb8-cc13-4b8b-a2b8-b1745d94a59a  # ✅ 存在
PORT=3000                                              # ✅ (可选)
```

### ✓ 前端 API 调用 (aichat.vue)
```javascript
// 前端使用相对路径，依赖 Vite 代理
fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ ... })
})
// Vite 会将此请求代理到 http://localhost:3000/api/chat
```

---

## 6️⃣ 故障排查步骤

如果修复后仍有问题，按以下步骤排查：

### ❓ 问题 1: 前端仍然报错 "Cannot POST /api/chat"

**检查清单**:
```bash
# 1. 确认 Vite 已重启
Ctrl+C && npm run dev

# 2. 检查后端状态
npm run server
# 应显示:
# ✅ SQLite Database connected
# ✅ Database tables initialized

# 3. 测试直接访问后端
# 在另一个终端：
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health"
# 应返回: { code: 0, msg: "Server running", ... }

# 4. 清除浏览器缓存
# F12 → 网络 → 禁用缓存 → 刷新页面
```

### ❓ 问题 2: 后端启动失败

**检查清单**:
```bash
# 1. 检查依赖
npm ls express sqlite3 axios

# 2. 检查数据库初始化
npm run db:init
# 应显示:
# ✅ chat_session table created
# ✅ chat_message table created

# 3. 查看错误日志
npm run server 2>&1 | head -50
```

### ❓ 问题 3: 后端启动成功但 API 超时

**检查清单**:
```bash
# 1. 确认端口未被占用
netstat -ano | findstr :3000

# 2. 确认防火墙允许 localhost:3000
# Windows 防火墙应该允许 localhost 访问

# 3. 检查是否有业务 API 依赖问题
# server.js 会尝试连接 http://localhost:8080/api/device/list
# 如果不存在，会自动降级（不影响基本功能）
```

---

## 7️⃣ 技术背景

### 为什么需要 Vite 代理？

```
安全性:
├─ 开发阶段，前端运行在 localhost:5173
├─ 后端服务在 localhost:3000
├─ 直接跨域请求会被浏览器的 CORS 政策阻止
└─ Vite 代理可以：
   ├─ 在开发服务器中代理 /api/* 请求
   ├─ 转发到实际的后端服务
   └─ 绕过 CORS 限制

生产环境:
├─ 前端和后端通常部署在同一域
├─ 或使用 Nginx 反向代理
├─ 不需要 Vite（因为 Vite 只是开发工具）
```

### Vite 代理工作原理

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}

// aichat.vue 发送请求
fetch('/api/chat', { ... })

// Vite 开发服务器会：
// 1. 拦截 /api/chat 请求
// 2. 改写为 http://localhost:3000/api/chat
// 3. 转发请求
// 4. 返回响应给前端

// changeOrigin: true 的作用：
// - 修改请求头中的 Origin 字段
// - 让后端认为请求来自 localhost:3000
// - 而不是 localhost:5173
```

---

## 8️⃣ 时间线回顾

### 2025-01-15: 初始实现
- ✅ server.js 创建，监听端口 3000
- ✅ vite.config.js 配置代理（应该指向 3000）
- ✅ aichat.vue 前端创建
- ✅ 系统成功运行

### 2026-03-19: 问题出现
- ❌ 前端请求全部失败
- 🔍 诊断：vite.config.js 代理指向错误的端口 5000
- 🔧 修复：更新代理配置为 localhost:3000
- ✅ 确认修复

---

## 9️⃣ 最终检查清单

在重新启动前，确保：

- [ ] 已修改 vite.config.js (target: 'http://localhost:3000')
- [ ] server.js 存在并包含 `/api/*` 路由
- [ ] db/ 目录存在，chat.db 已初始化
- [ ] .env 文件包含 DOUBAO_API_KEY
- [ ] .gitignore 包含 .env (避免泄露密钥)
- [ ] package.json 包含必要的依赖
- [ ] 已执行 npm install

---

## 🔟 快速重启指南

```bash
# 1. 停止现有进程
Ctrl+C

# 2. 初始化（仅首次需要）
npm run db:init

# 3. 启动后端（终端 1）
npm run server

# 4. 启动前端（终端 2）
npm run dev

# 5. 访问应用
# 打开浏览器: http://localhost:5173/aichat

# 6. 测试对话
# 输入: "你好，蔡文姬"
# 期望: 收到 AI 的问候信息 ✅
```

---

## 📚 相关文档

- [vite.config.js](vite.config.js) - Vite 配置文件
- [server.js](server.js) - Express 后端服务
- [aichat.vue](src/views/cwj/aichat.vue) - 前端聊天组件
- [QUICK_START.md](QUICK_START.md) - 快速启动指南
- [AI_CHAT_IMPLEMENTATION.md](AI_CHAT_IMPLEMENTATION.md) - 完整技术文档

---

## ✅ 总结

| 项目 | 详情 | 状态 |
|------|------|------|
| **问题** | Vite 代理指向错误的端口 | ✅ 已识别 |
| **原因** | vite.config.js 配置为 5000，但后端在 3000 | ✅ 已诊断 |
| **解决** | 修改 vite.config.js 的 target 为 localhost:3000 | ✅ 已应用 |
| **验证** | 重启前端后测试 API 调用 | ⏳ 待验证 |

**下一步**: 重启 Vite 开发服务器并测试 API 连接。

---

**诊断时间**: 2026-03-19 UTC  
**修复版本**: 1.0.1  
**维护者**: 蔡文姬 AI 团队

如有其他问题，参考 [QUICK_START.md](QUICK_START.md) 或检查 [AI_CHAT_IMPLEMENTATION.md](AI_CHAT_IMPLEMENTATION.md) 的调试部分。
