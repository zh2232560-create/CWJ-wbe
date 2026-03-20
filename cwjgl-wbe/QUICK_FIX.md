# ⚡ 快速修复指南 - API 请求失败

## 问题
前端向后端发送 API 请求时返回："Cannot POST/GET /api/*"

## 原因
[vite.config.js](vite.config.js) 的代理配置指向了错误的服务器端口

## 修复 ✅ 已完成

**文件**: [vite.config.js](vite.config.js#L33)

```diff
  server: {
    proxy: {
      '/api': {
-       target: 'http://127.0.0.1:5000',
+       target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
```

## 重启步骤（3个命令）

```bash
# 1️⃣ 停止现有 Vite 服务（如果运行中）
Ctrl+C

# 2️⃣ 启动后端（终端 1）
npm run server

# 3️⃣ 启动前端（终端 2）
npm run dev
```

## 验证

访问: `http://localhost:5173/aichat`

✅ **预期结果**:
- ✓ 页面加载成功
- ✓ 点击"新建对话"创建新会话
- ✓ 输入消息后点击发送，显示 "AI 正在生成中..."
- ✓ 收到 AI 的回复

❌ **如果仍失败**:
- [ ] 检查浏览器 F12 → Console 中是否有错误
- [ ] 检查 Network 标签中 `/api/chat` 的响应
- [ ] 确保后端服务在运行 (`npm run server`)
- [ ] 查看详细分析: [API_REQUEST_FAILURE_ANALYSIS.md](API_REQUEST_FAILURE_ANALYSIS.md)

---

完成！现在应该可以正常使用 AI 助手了。
