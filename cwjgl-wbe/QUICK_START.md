# 蔡文姬 AI 助手 - 快速启动指南 ⚡

## 一、环境检查 (60秒)

```bash
cd d:\softsave\vscode\py_project\cwj\meeting-system\cwjgl-wbe

# 检查 Node.js 版本 (需要 >= 16)
node --version

# 检查所需的依赖已安装
npm ls express axios sqlite3 cors body-parser
```

✅ 预期输出: `express@5.2.1`, `sqlite3@6.0.1`, 等等

---

## 二、初始化数据库 (10秒)

```bash
npm run db:init
```

✅ 预期输出:
```
✅ Connected to database: ...chat.db
✅ chat_session table created
✅ chat_message table created
✅ Index created: idx_chat_message_session_id
...
```

---

## 三、启动后端服务 (分窗口1)

```bash
npm run server
```

✅ 预期输出:
```
╔════════════════════════════════════════════════╗
║       蔡文姬 AI 助手 - 后端服务已启动            ║
║       Port: 3000                            ║
║       Doubao: ✅ configured                  ║
╚════════════════════════════════════════════════╝

✅ SQLite Database connected
✅ Database tables initialized
```

⚠️ **关键**: 保持此窗口运行，不要关闭！

---

## 四、启动前端服务 (分窗口2)

```bash
npm run dev
```

✅ 预期输出:
```
VITE v... ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Press h + enter to show help
```

---

## 五、访问应用

在浏览器打开:
```
http://localhost:5173/aichat
```

✅ 你应该看到:
- 左侧侧边栏（新建对话 + 历史列表）
- 中间聊天区域（欢迎屏 + 消息输入）
- 蔡文姬头像和建议问题

---

## 六、首次测试对话

1. **输入示例问题**:
   ```
   请介绍一下蔡文姬服务
   ```

2. **观察以下流程**:
   ```
   用户消息 → 后端接收 → 获取业务数据 → 调用LLM → AI回复 → 显示数据来源
   ```

3. **验证成功标志**:
   - [ ] 消息气泡出现且排列正确
   - [ ] AI 响应包含来自 Doubao 的内容
   - [ ] 数据来源标签显示
   - [ ] 消息历史被保存

---

## 七、测试 API (可选)

### 创建会话
```bash
curl -X POST http://localhost:3000/api/chat/session/create
```

### 发送消息
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_1234567890",
    "message": "你好，蔡文姬！"
  }'
```

### 获取会话列表
```bash
curl http://localhost:3000/api/chat/sessions
```

### 健康检查
```bash
curl http://localhost:3000/api/health
```

✅ 所有端点应返回 `"code": 0` 的 JSON

---

## 八、常见问题排查

### ❌ "EADDRINUSE: address already in use :::3000"
```bash
# 端口 3000 被占用
# 方案1: 杀死占用端口的进程
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill

# 方案2: 修改端口
PORT=3001 npm run server
```

### ❌ "Cannot find module 'express'"
```bash
# 依赖未安装
npm install
npm run db:init
```

### ❌ "Database connection error"
```bash
# db 目录不存在或权限问题
mkdir -p db
npm run db:init
```

### ❌ "DOUBAO_API_KEY not found"
```bash
# 确保 .env 文件存在并包含正确的密钥
cat .env
# 应该显示: DOUBAO_API_KEY=227a1eb8-cc13-4b8b-a2b8-b1745d94a59a
```

### ❌ 后端连接 /api/device/list 失败
```bash
# 如果你的业务 API 不存在，服务器会降级处理
# AI 将继续工作，但不会包含实时业务数据
# 这是正常的！

# 如果想启用业务数据集成：
# 1. 修改 .env 中的 CWJ_API_BASE
# 2. 确保你的业务 API 服务正在运行
```

---

## 九、文件验证清单

运行以下命令检查所有必要文件是否存在:

```bash
# 前端
ls src/views/cwj/aichat.vue              # ✅ 应显示文件

# 后端
ls server.js                             # ✅ 应显示文件

# 数据库脚本
ls scripts/init-db.cjs                   # ✅ 应显示文件

# 配置文件
cat .env | grep DOUBAO_API_KEY          # ✅ 应显示密钥

# 数据库
ls -lh db/chat.db                        # ✅ 应显示文件大小
```

---

## 十、生产部署 (可选)

### 使用 PM2 进程管理

```bash
npm install -g pm2

# 启动后端服务（后台运行）
pm2 start server.js --name "caiweng-api"

# 看日志
pm2 logs caiweng-api

# 停止
pm2 stop caiweng-api
```

### 使用 Docker

```bash
# 构建镜像
docker build -t caiweng-ai-chat .

# 运行容器
docker run -d -p 3000:3000 \
  -e DOUBAO_API_KEY=your_key \
  --name caiweng-api \
  caiweng-ai-chat

# 查看日志
docker logs -f caiweng-api
```

---

## 十一、性能监控

### 查看数据库大小
```bash
ls -lh db/chat.db
# 如果文件 > 100MB，考虑清理旧消息
```

### 查看消息数量
```bash
# 需要 sqlite3 命令行工具
sqlite3 db/chat.db "SELECT COUNT(*) FROM chat_message;"
```

### 检查连接数
```bash
# 查看占用 3000 端口的连接
netstat -an | grep 3000
```

---

## 十二、增强功能 (可选)

### 启用多语言支持
在 `server.js` 中修改 system prompt:
```javascript
const systemPrompt = `你是蔡文姬，一个多语言AI助手。
根据用户问题的语言自动切换：中文、英文、日文...`;
```

### 添加消息导出
```javascript
// 新增 POST /api/chat/export 端点
// 导出格式: PDF、Word、JSON
```

### 启用图表显示
在 `aichat.vue` 的 `initMiniChart()` 方法中实现
```javascript
const chart = echarts.init(document.getElementById('chart-' + msgId));
chart.setOption({ /* 图表配置 */ });
```

---

## 十三、调试技巧

### 启用详细日志
```bash
DEBUG=* npm run server
```

### 监听网络请求
在浏览器 F12 中:
1. 打开 Network 标签
2. 发送聊天消息
3. 查看 `/api/chat` 的请求和响应

### 查看数据库内容
```bash
sqlite3 db/chat.db
sqlite> .tables           # 显示所有表
sqlite> SELECT * FROM chat_session;  # 查询会话
sqlite> SELECT * FROM chat_message;  # 查询消息
sqlite> .quit             # 退出
```

---

## 十四、安全建议

- ✅ 不要在 Git 中提交 `.env` 文件
- ✅ 生产环境使用强密钥加密
- ✅ 限制 API 请求频率 (添加 rate-limiter)
- ✅ 定期备份 `db/chat.db`
- ✅ 使用 HTTPS 在生产环境

---

## 十五、获取帮助

如果卡住，按以下顺序检查:

1. **查看完整文档**:
   ```bash
   cat AI_CHAT_IMPLEMENTATION.md
   ```

2. **检查后端日志**:
   ```bash
   # 后端窗口会显示详细的处理日志
   # 包括 LLM 调用、数据库操作等
   ```

3. **测试 API 连接**:
   ```bash
   curl http://localhost:3000/api/health
   # 应返回 {"code": 0, ...}
   ```

4. **查看浏览器控制台**:
   - F12 → Console 标签
   - 查看红色错误信息

5. **检查数据库**:
   ```bash
   sqlite3 db/chat.db ".tables"
   # 应显示: chat_message chat_session
   ```

---

## ✨ 你已经完成了！

现在你拥有一个完整的 AI 助手系统：
- ✅ 前端聊天界面
- ✅ 后端 REST API
- ✅ SQLite 持久化存储
- ✅ Doubao LLM 集成
- ✅ 消息历史管理
- ✅ 错误处理和重试

**下一步**:
- 自定义 system prompt 以符合你的业务
- 集成你的业务 API 数据源
- 部署到生产环境
- 监控性能和用户反馈

---

**最后更新**: 2025-01-15  
**建议时间**: 5-10 分钟从零到运行
