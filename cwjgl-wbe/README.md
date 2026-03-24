# 蔡文姬智能管理系统 (CWJGL-WBE)

> 有方智能企业管理系统前端独立项目 + **🤖 AI 助手服务**

## 📋 项目简介

**cwjgl-wbe** 是从 meeting-system 项目中提取出来的蔡文姬（有方智能）企业管理系统独立前端项目。项目采用 **Vue 3 + Vite** 技术栈，专注于设备管理、采购、发货、签收等企业管理功能，并集成了**火山引擎 Doubao LLM 大语言模型**，提供 AI 助手服务。

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0
- npm >= 7.0

### 安装依赖
```bash
npm install
```

### 初始化数据库（首次运行）
```bash
npm run db:init
```

### 开发模式

**终端 1 - 启动后端 AI 服务**:
```bash
npm run server
# 后端 API 监听: http://localhost:3000
```

**终端 2 - 启动前端开发服务**:
```bash
npm run dev
```

### 访问应用
- 主应用: `http://localhost:5173/cwjgl/`
- AI 助手: `http://localhost:5173/aichat` ⭐ **新增**
- Admin 页: `http://localhost:5173/cwjgl/admin`
- Dashboard: `http://localhost:5173/dashboard` 📊
- 采购页: `http://localhost:5173/cwjgl/purchase`
- 发货页: `http://localhost:5173/cwjgl/shipping`
- 签收页: `http://localhost:5173/cwjgl/receipt`

### 生产构建
```bash
npm run build
```

## 📁 项目结构

```
cwjgl-wbe/
├── src/
│   ├── views/cwj/
│   │   ├── adminpage.vue        # 部署监控管理平台
│   │   ├── purchasepage.vue     # 采购平台
│   │   ├── shippingpage.vue     # 发货平台
│   │   └── receiptpage.vue      # 签收平台
│   ├── api/
│   │   ├── cwj.js              # 蔡文姬 API 模块
│   │   └── common.js           # 通用 API 方法
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── utils/
│   │   ├── auth.js             # 认证工具
│   │   ├── request.js          # HTTP 请求封装
│   │   └── ...                 # 其他工具
│   ├── components/
│   ├── stores/                 # Pinia 状态管理
│   ├── assets/                 # 静态资源和样式
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 应用入口
│   └── setting.js              # 全局设置
├── public/                      # 公共资源
├── index.html                   # HTML 模板
├── package.json
├── vite.config.js              # Vite 配置
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .env.test                   # 测试环境变量
└── README.md                    # 本文件
```

## 🤖 AI 助手功能 ⭐ 新增

项目集成了**火山引擎 Doubao-Seed-1.6 大语言模型**，提供智能对话和数据分析服务。

### 核心特性
- 💬 实时 AI 对话 - 基于 LLM 的自然语言交互
- 📊 业务数据入注 - 自动加载实时设备、门店数据
- 💾 对话持久化 - 所有聊天记录保存到 SQLite3
- 🔄 会话管理 - 支持多个独立对话会话
- ⚡ 快速响应 - 优化的后端 API 处理
- 🛡️ 错误恢复 - 完善的重试和降级机制

### 快速使用

1. **访问 AI 助手**:
   ```
   http://localhost:5173/aichat
   ```

2. **提问示例**:
   - "南部大区有多少家门店？"
   - "哪个门店使用量最多？"
   - "帮我总结最近的业务数据"

3. **功能**:
   - 左侧侧栏: 新建对话 + 历史会话列表
   - 主区域: 消息展示 + 快速建议 + 数据来源
   - 底部: 消息输入框 + 发送按钮

### 技术架构

```
前端 (Vue 3)          ↔  后端 (Node.js/Express)  ↔  LLM API (Doubao)
  aichat.vue              server.js                 Doubao-Seed-1.6
  聊天界面                 REST API                  大语言模型
  消息管理                 业务数据获取
                         数据库持久化
```

### 后端 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | 发送消息 (核心) |
| `/api/chat/session/create` | POST | 创建新会话 |
| `/api/chat/sessions` | GET | 获取会话列表 |
| `/api/chat/history` | GET | 获取会话历史 |
| `/api/health` | GET | 健康检查 |

### 详细文档

详见以下文件:
- **[AI_CHAT_IMPLEMENTATION.md](./AI_CHAT_IMPLEMENTATION.md)** - 完整技术实现文档 (3000+ 字)
- **[QUICK_START.md](./QUICK_START.md)** - 快速启动指南
- **[PROJECT_COMPLETION_SUMMARY.md](./PROJECT_COMPLETION_SUMMARY.md)** - 项目完成总结

---

## 📁 项目结构

```
cwjgl-wbe/
├── src/
│   ├── views/cwj/
│   │   ├── adminpage.vue        # 部署监控管理平台
│   │   ├── purchasepage.vue     # 采购平台
│   │   ├── shippingpage.vue     # 发货平台
│   │   ├── receiptpage.vue      # 签收平台
│   │   ├── aichat.vue           # 🤖 AI 助手聊天页面(新增)
│   │   └── dashboard.vue        # 📊 数据仪表盘(新增)
│   ├── api/
│   │   ├── cwj.js              # 蔡文姬 API 模块
│   │   └── common.js           # 通用 API 方法
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── utils/
│   │   ├── auth.js             # 认证工具
│   │   ├── request.js          # HTTP 请求封装
│   │   └── ...                 # 其他工具
│   ├── components/
│   ├── stores/                 # Pinia 状态管理
│   ├── assets/                 # 静态资源和样式
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 应用入口
│   └── setting.js              # 全局设置
├── server.js                    # 🚀 Express 后端服务(新增)
├── scripts/
│   └── init-db.cjs             # 数据库初始化脚本(新增)
├── db/                          # SQLite3 数据库目录(新增)
│   └── chat.db                 # 数据库文件(自动生成)
├── public/                      # 公共资源
├── index.html                   # HTML 模板
├── package.json
├── vite.config.js              # Vite 配置
├── .env                        # AI 助手环境变量(新增)
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .env.test                   # 测试环境变量
├── AI_CHAT_IMPLEMENTATION.md   # AI 实现文档(新增)
├── QUICK_START.md              # 快速启动指南(新增)
├── PROJECT_COMPLETION_SUMMARY.md # 完成总结(新增)
└── README.md                    # 本文件
```

| 路由 | 名称 | 组件 | 描述 |
|------|------|------|------|
| `/` | - | - | 重定向到 `/admin` |
| `/admin` | cwjAdmin | adminpage.vue | 部署监控管理平台 |
| `/purchase` | purchasepage | purchasepage.vue | 采购平台 |
| `/shipping` | shippingpage | shippingpage.vue | 发货平台 |
| `/receipt` | receiptpage | receiptpage.vue | 签收平台 |
| `/dashboard` | Dashboard | dashboard.vue | 📊 数据仪表盘 (新增) |
| `/analysis` | Analysis | analysis.vue | 📈 分析报告 (新增) |
| `/aichat` | AIChat | aichat.vue | 🤖 AI 助手 (新增) |

## 🔌 API 配置

### 环境变量
```bash
# .env.development (开发)
VITE_API_BASE_URL=http://crmebapi.com/

# .env.production (生产)
VITE_API_BASE_URL=https://youfangai.com/

# .env.test (测试)
VITE_API_BASE_URL=http://121.40.65.238:8080/
```

### API 代理
所有 `/api` 请求会自动代理到后端服务，URL 重写为 `/api/v2`：
```
http://localhost:5173/cwjgl/api/xxx → http://crmebapi.com/api/v2/xxx
```

## 📚 核心模块说明

### 1. 管理员平台 (/admin)
- 设备全生命周期监控
- 实时统计展示
- 多维度筛选和查询
- 设备调拨、回收、信息修正

### 2. 采购平台 (/purchase)
- 采购需求表单提交
- 实时字段验证
- 本地草稿保存
- 设备清单动态管理

### 3. 发货平台 (/shipping)
- 发货信息管理
- 设备序列号批量绑定
- 联动填充联系信息
- 发货单提交

### 4. 签收平台 (/receipt)
- 设备签收确认
- 质检信息记录
- 多选设备处理
- 签收凭证生成

## 🔐 认证与权限

使用 localStorage 存储 Token，自动在请求头添加 `Authorization: Bearer <token>`

```javascript
import { getToken, setToken, removeToken } from '@/utils/auth'

// 保存 token
setToken('your-token')

// 获取 token
const token = getToken()

// 清除 token
removeToken()
```

## 🔄 状态管理

使用 **Pinia** 进行状态管理，支持模块化和热更新。

## 🎯 开发建议

1. **完善权限控制** - 根据用户角色限制模块访问
2. **优化列表性能** - 添加虚滚动、分页加载等
3. **增强错误处理** - 更详细的错误提示和重试机制
4. **离线支持** - 考虑 PWA 或离线缓存
5. **国际化** - 支持多语言界面

## 📝 构建和部署

### 构建
```bash
npm run build
# 输出到 dist/ 目录
```

## 🐳 Docker 容器化部署（推荐）

Docker 是最推荐的部署方式，提供一致的运行环境、自动化部署和灵活的扩展。

### 快速开始

#### 前置要求
- Docker >= 20.10
- Docker Compose >= 2.0

#### 1️⃣ 配置环境变量

```bash
# 复制 Docker 环境变量范例
cp .env.docker .env

# 编辑 .env 文件，设置必要的配置
vi .env
# 至少需要设置：
# DOUBAO_API_KEY=your_api_key_here
# CWJ_API_BASE=http://host.docker.internal:8080/api
```

如果外部业务接口不是运行在宿主机默认地址，请把 `CWJ_API_BASE` 改成实际可访问的地址。
Windows 和 macOS 通常可以直接使用 `host.docker.internal`，Linux 下建议改成宿主机 IP，或者在 Compose 中显式配置可访问的网关地址。

#### 2️⃣ 启动服务

在启动容器前，请先确认前端静态资源已生成，避免 Nginx 挂载 `./dist` 时找不到文件：

```bash
npm run build
```

**Linux/macOS**:
```bash
# 给脚本添加执行权限
chmod +x docker-start.sh

# 快速启动
./docker-start.sh
```

**Windows**:
```batch
# 双击运行或在 PowerShell 中执行
docker-start.bat
```

**手动启动**:
```bash
# 构建镜像
docker-compose build

# 启动容器
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

#### 3️⃣ 验证部署

```bash
# 检查服务健康状态
curl http://localhost:3000/health

# 访问应用
# 前端: http://localhost
# 后端 API: http://localhost:3000
```

如果前端页面空白或静态资源 404，优先检查宿主机是否已生成 `dist/` 目录，以及 `docker-compose.yml` 中的 `./dist:/usr/share/nginx/html:ro` 挂载路径是否正确。

### 💡 Docker 部署优势

✅ **一致的环境** - 开发、测试、生产环境完全一致  
✅ **快速部署** - 无需复杂配置，一键启动  
✅ **自动化** - docker-compose 自动管理依赖关系  
✅ **隔离运行** - 容器对主机系统无污染  
✅ **灵活扩展** - 轻松添加缓存、数据库等服务  
✅ **内置监控** - 健康检查、日志管理等功能  

### 📋 项目包含的 Docker 文件

| 文件 | 描述 |
|------|------|
| `Dockerfile` | 多阶段构建，优化镜像大小 |
| `docker-compose.yml` | 完整的服务编排配置 |
| `.dockerignore` | 排除不必要的文件，加快构建 |
| `nginx.conf` | Nginx 反向代理配置 |
| `conf.d/proxy_headers.conf` | 代理头配置 |
| `.env.docker` | Docker 环境变量范例 |
| `docker-start.sh` | Linux/macOS 快速启动脚本 |
| `docker-start.bat` | Windows 快速启动脚本 |

当前 Docker 方案的关键前提：

1. 后端容器通过 `CWJ_API_BASE` 访问外部业务接口，不再硬编码 `localhost`。
2. `backend` 不再依赖 `nginx`，避免循环启动依赖。
3. 启动前需要有可用的 `dist/`，否则 Nginx 只能启动但无法提供前端静态资源。

### 🛠️ 常用 Docker 命令

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs backend      # 仅看后端日志
docker-compose logs -f           # 持续显示所有日志

# 进入容器执行命令
docker-compose exec backend sh   # 进入后端容器
docker-compose exec backend npm run db:init  # 在容器内初始化数据库

# 重启服务
docker-compose restart           # 重启所有服务
docker-compose restart backend   # 仅重启后端

# 停止服务
docker-compose stop              # 停止（保留数据）
docker-compose down              # 停止并删除容器

# 完全清理（删除所有数据）
docker-compose down -v

# 查看镜像大小
docker images

# 查看容器资源使用情况
docker stats

# 查看网络
docker network ls
docker network inspect cwj-network
```

### 📊 Docker Compose 服务

默认配置包含以下服务：

| 服务 | 端口 | 描述 |
|------|------|------|
| `backend` | 3000 | Node.js AI 助手后端 |
| `nginx` | 80/443 | 前端静态文件 + API 代理 |

**可选服务**（取消注释 docker-compose.yml 中的相应部分）：
- `redis` - 缓存和会话存储
- `postgres` - PostgreSQL 数据库（替代 SQLite）
- `prometheus` - 监控和指标收集

### 🔐 生产环境优化

#### 1️⃣ 启用 HTTPS

```bash
# 使用 Let's Encrypt 获取免费证书
sudo certbot certonly --standalone -d your.domain.com

# 配置 nginx.conf 中的 SSL 部分
# 证书路径：/etc/letsencrypt/live/your.domain.com/
```

#### 2️⃣ 数据库备份和恢复

```bash
# 备份 SQLite 数据库
docker-compose exec backend sqlite3 /app/db/chat.db ".backup '/backup/chat_$(date +%Y%m%d_%H%M%S).db'"

# 或使用宿主机备份
docker cp cwj-backend:/app/db/chat.db ./backups/chat_backup.db

# 恢复数据库
docker cp ./backups/chat_backup.db cwj-backend:/app/db/chat.db
docker-compose restart backend
```

#### 3️⃣ 日志管理

```bash
# 查看容器日志大小
docker exec cwj-backend du -sh /app/logs

# 清理日志
docker exec cwj-backend rm -f /app/logs/*.log

# 配置日志轮转（在 docker-compose.yml 中已配置）
# 日志文件：100MB，保留 10 个文件
```

### 🔧 故障排查

| 问题 | 症状 | 解决方案 |
|------|------|--------|
| 容器无法启动 | `docker-compose ps` 显示 Exit | 查看日志 `docker-compose logs backend` |
| API 502 错误 | 请求返回 502 | 检查后端是否运行 `docker-compose ps` |
| 数据更新后没有刷新 | 旧数据仍然显示 | 重启容器 `docker-compose restart backend` |
| 磁盘空间满 | Docker 无法启动 | 清理日志和镜像 `docker system prune -a` |
| 网络连接失败 | 容器间无法通信 | 检查网络 `docker network inspect cwj-network` |
| 权限拒绝错误 | Permission denied | 检查文件夹权限，重建镜像 `docker-compose build --no-cache` |

### 📈 性能优化

#### 1️⃣ 镜像优化

```bash
# 查看构建过程中的缓存
docker-compose build --progress=plain

# 清理未使用的镜像
docker image prune -a

# 检查镜像大小
docker images | grep cwj
```

#### 2️⃣ 容器资源限制

已在 `docker-compose.yml` 中配置：
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
    reservations:
      cpus: '1'
      memory: 512M
```

## 📦 服务器部署指南

### 前置要求
- Linux 服务器（推荐 Ubuntu 20.04+ 或 CentOS 7+）
- Node.js >= 16.0
- npm >= 7.0
- Nginx（用于反向代理）
- PM2（用于进程管理，可选但推荐）

### 1️⃣ 服务器环境准备

#### 1.1 安装 Node.js
```bash
# 使用 NVM（Node Version Manager）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18   # 推荐使用 Node 18
nvm use 18
node --version   # 验证
npm --version
```

#### 1.2 安装 PM2（进程管理工具）
```bash
npm install -g pm2
pm2 --version

# 启用开机自启
pm2 startup
pm2 save
```

#### 1.3 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx   # 开机自启
sudo systemctl status nginx   # 检查状态
```

### 2️⃣ 部署后端服务

#### 2.1 上传项目文件
```bash
# 在本地执行
scp -r ./cwjgl-wbe/ user@your_server_ip:/home/user/

# 或使用 Git
ssh user@your_server_ip
cd /home/user/
git clone https://your-git-repo/cwjgl-wbe.git
cd cwjgl-wbe
```

#### 2.2 配置环境变量
```bash
# 在服务器上
cd /home/user/cwjgl-wbe
cp .env.example .env  # 或 vi .env 手动编辑

# .env 文件内容（需根据实际情况修改）
DOUBAO_API_KEY=your_api_key_here
DOUBAO_MODEL_ID=doubao-seed-1-6-251015
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3
NODE_ENV=production
PORT=3000
DB_PATH=./db/chat.db
```

#### 2.3 安装依赖并初始化数据库
```bash
npm install --production  # 仅安装生产依赖
npm run db:init          # 初始化 SQLite 数据库
```

#### 2.4 使用 PM2 启动后端服务
```bash
# 启动
pm2 start server.js --name cwj-backend

# 查看日志
pm2 logs cwj-backend

# 列出所有进程
pm2 list

# 重启
pm2 restart cwj-backend

# 停止
pm2 stop cwj-backend
```

#### 2.5 PM2 配置文件（推荐）
创建 `ecosystem.config.js` 文件：
```javascript
module.exports = {
  apps: [
    {
      name: 'cwj-backend',
      script: './server.js',
      instances: 'max',  // 自动选择 CPU 核心数
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      watch: false,
      ignore_watch: ['node_modules', 'db', 'logs'],
      max_memory_restart: '500M'
    }
  ]
};
```

启动：
```bash
pm2 start ecosystem.config.js
pm2 save
```

### 3️⃣ 部署前端应用

#### 3.1 构建前端
```bash
# 在本地或服务器上都可以
npm run build      # 生成 dist/ 目录
```

#### 3.2 上传前端文件
```bash
# 方式 1：直接上传 dist 目录
scp -r ./dist/ user@your_server_ip:/home/user/cwj-frontend/

# 方式 2：在服务器上构建
ssh user@your_server_ip
cd /home/user/cwjgl-wbe
npm run build
```

#### 3.3 配置 Nginx
编辑 Nginx 配置文件：
```bash
sudo vi /etc/nginx/sites-available/default
# 或 CentOS: sudo vi /etc/nginx/conf.d/default.conf
```

添加以下配置：
```nginx
upstream cwj_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your.domain.com;  # 改为你的域名或 IP
    
    # 重定向 HTTP 到 HTTPS（可选）
    # return 301 https://$server_name$request_uri;
    
    # 前端静态文件
    location / {
        root /home/user/cwj-frontend;  # 改为实际 dist 目录路径
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://cwj_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 增加超时时间（支持长连接）
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://cwj_backend;
    }
    
    # 日志
    access_log /var/log/nginx/cwj-access.log;
    error_log /var/log/nginx/cwj-error.log;
}
```

#### 3.4 验证并重启 Nginx
```bash
# 测试配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx

# 或完全重启
sudo systemctl restart nginx
```

### 4️⃣ SSL/HTTPS 配置（重要）

#### 4.1 使用 Let's Encrypt 获取免费证书
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 自动获取和配置证书
sudo certbot --nginx -d your.domain.com

# 自动续期（证书在 /etc/letsencrypt/live/ 目录）
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### 4.2 手动 SSL 配置
```nginx
server {
    listen 443 ssl http2;
    server_name your.domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... 其他配置同上 ...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your.domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 5️⃣ 数据库备份和恢复

#### 5.1 备份数据库
```bash
# 定期备份脚本 (backup.sh)
#!/bin/bash
BACKUP_DIR="/home/user/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
sqlite3 /home/user/cwjgl-wbe/db/chat.db ".backup '${BACKUP_DIR}/chat_${TIMESTAMP}.db'"
echo "Backup completed: chat_${TIMESTAMP}.db"

# 设置定时备份（每天凌晨 2 点）
crontab -e
# 添加: 0 2 * * * /home/user/cwjgl-wbe/backup.sh
```

#### 5.2 恢复数据库
```bash
# 恢复最新备份
cp /home/user/backups/chat_TIMESTAMP.db /home/user/cwjgl-wbe/db/chat.db
pm2 restart cwj-backend
```

### 6️⃣ 监控和维护

#### 6.1 查看服务状态
```bash
# 查看后端服务
pm2 list
pm2 logs cwj-backend

# 查看 Nginx 状态
sudo systemctl status nginx
sudo tail -f /var/log/nginx/cwj-access.log
sudo tail -f /var/log/nginx/cwj-error.log

# 查看数据库
sqlite3 /home/user/cwjgl-wbe/db/chat.db ".tables"
```

#### 6.2 性能监控
```bash
# 安装 PM2 监控
pm2 install pm2-auto-pull
pm2 start ecosystem.config.js

# 使用 PM2 Plus（可选联网服务）
pm2 link
```

#### 6.3 日志轮转（防止日志文件过大）
```bash
# 安装日志轮转
sudo apt install logrotate

# 创建配置 /etc/logrotate.d/cwj
/home/user/cwjgl-wbe/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nobody nobody
    sharedscripts
    postrotate
        pm2 reload cwj-backend > /dev/null 2>&1 || true
    endscript
}
```

### 7️⃣ 完整部署检查清单

部署完成后，按照以下清单验证：

- [ ] Node.js 已安装 (`node -v`)
- [ ] PM2 已安装且后端服务正在运行 (`pm2 list`)
- [ ] 数据库已初始化 (`ls -la db/chat.db`)
- [ ] .env 文件已配置（包含 API Key）
- [ ] Nginx 已启动且配置正确 (`sudo nginx -t`)
- [ ] 前端可以访问 (`curl http://your.domain.com`)
- [ ] 后端 API 可以响应 (`curl http://your.domain.com/health`)
- [ ] SSL 证书已配置并有效（HTTPS 可访问）
- [ ] 日志文件位置正确
- [ ] 备份脚本已设置
- [ ] 开机自启已配置 (`pm2 startup` 和 `pm2 save`)

### 8️⃣ 常见问题排查

| 问题 | 症状 | 解决方案 |
|------|------|--------|
| 后端无法启动 | PM2 显示 error | 检查 .env 文件，查看日志 `pm2 logs` |
| API 502 Bad Gateway | Nginx 错误 | 检查后端是否运行，检查代理地址 |
| 前端加载失败 | 404 Not Found | 确认 dist 目录路径，检查 Nginx 配置 |
| 数据库锁定 | SQLite locked error | 重启后端服务，检查其他进程占用 |
| SSL 证书过期 | HTTPS 警告 | 运行 `sudo certbot renew --dry-run` |

### 9️⃣ 更新部署

当代码有更新时：
```bash
# 方法 1：使用 Git 更新
cd /home/user/cwjgl-wbe
git pull origin main
npm install --production
npm run build
sudo systemctl reload nginx
pm2 restart cwj-backend

# 方法 2：使用 PM2 自动拉取（需要配置）
pm2 install pm2-auto-pull
```

### 🔟 性能优化建议

#### 10.1 Nginx 优化
```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
client_max_body_size 20M;

gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

#### 10.2 Node.js 优化
```bash
# 增加文件句柄限制
ulimit -n 65536

# 配置 /etc/security/limits.conf
* soft nofile 65536
* hard nofile 65536

# PM2 配置中增加实例数
instances: 'max'  # 自动使用所有 CPU 核心
```
### 部署建议
```
nginx 配置示例：
location /cwjgl/ {
    alias /path/to/dist/;
    try_files $uri $uri/ /cwjgl/index.html;
}
```

## 🤝 相关文档

详见父项目 `meeting-system` 中的 `CWJ_PLATFORM_GUIDE.md`，包含：
- 详细的四个模块功能说明
- API 接口完整列表
- 数据结构和验证规则
- 常见问题解答

## 📄 许可证

Internal Project - All Rights Reserved

## 👥 维护团队

- 前端开发：开发团队
- 项目管理：产品团队
- 联系方式：内部协作

---

**最后更新**: 2026-03-16  
**版本**: 1.0.0  
**状态**: Active Development
