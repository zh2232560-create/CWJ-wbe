# cwjgl-wbe 项目提取和迁移说明

## 📦 项目提取信息

**提取日期**: 2026-03-16  
**源项目**: meeting-system  
**独立项目**: cwjgl-wbe (蔡文姬企业管理系统)  
**项目路径**: `/cwjgl-wbe`  
**系统版本**: 1.0.0

---

## 🎯 提取内容

### 核心模块（4个）
- ✅ **管理员平台** (`adminpage.vue`) - 部署监控管理
- ✅ **采购平台** (`purchasepage.vue`) - 采购需求管理
- ✅ **发货平台** (`shippingpage.vue`) - 物流信息管理
- ✅ **签收平台** (`receiptpage.vue`) - 设备签收确认

### 复制的依赖
```
src/
├── views/cwj/         # 4个页面 ✅
├── api/
│   ├── cwj.js        # 蔡文姬 API 模块 ✅
│   └── common.js     # 通用方法 ✅
├── utils/
│   ├── auth.js       # Token 管理 ✅
│   ├── request.js    # HTTP 请求封装 ✅
│   ├── cache.js      # 缓存工具 ✅
│   ├── upload.js     # 上传功能 ✅
│   └── ...          # 其他工具 ✅
├── components/
│   ├── common/       # 共享组件 ✅
│   └── form/         # 表单组件 ✅
├── assets/
│   └── styles/       # 全局样式 ✅
├── stores/
│   └── user.js       # 用户状态 ✅
├── router/
│   └── index.js      # 独立路由 ✅ (新建)
├── App.vue           # 根组件 ✅ (新建)
├── main.js           # 入口 ✅ (新建)
└── setting.js        # 配置 ✅
```

### 新建配置文件
```
✅ package.json
✅ vite.config.js
✅ tsconfig.json
✅ .env.development
✅ .env.production
✅ .env.test
✅ index.html
✅ README.md
```

---

## 🚀 快速开始

### 1️⃣ 安装依赖 (已完成 ✅)
```bash
cd cwjgl-wbe
npm install
# 已安装 340 个包，0 个漏洞
```

### 2️⃣ 启动开发服务器
```bash
npm run dev
```

**访问地址**: `http://localhost:5173/cwjgl/`

### 3️⃣ 构建生产包
```bash
npm run build
# 输出到 dist/ 目录
```

---

## 🔄 路由映射

### 原项目路由 → 新项目路由
```
旧路由路径              新路由路径
/cwj/admin       →     /admin
/cwj/purchase    →     /purchase
/cwj/shipping    →     /shipping
/cwj/receipt     →     /receipt
```

### Base URL 变化
```
旧: /meeting/
新: /cwjgl/
```

---

## 🔌 API 配置变化

### Vite 代理配置
```javascript
// vite.config.js 中已配置
proxy: {
  '/api': {
    target: env.VITE_API_BASE_URL,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/api/v2'),
  }
}
```

### 环境变量管理
```
.env.development  → 开发环境 API 地址
.env.production   → 生产环境 API 地址
.env.test         → 测试环境 API 地址

当前配置：
├── 开发: http://crmebapi.com/
├── 生产: https://youfangai.com/
└── 测试: http://121.40.65.238:8080/
```

---

## ⚠️ 重要变更

### 1. 路由 Base 修改
```javascript
// vite.config.js
base: '/cwjgl/',  // 原为 '/meeting/'
```

### 2. Router Base 修改
```javascript
// src/router/index.js
history: createWebHistory('/cwjgl/'),  // 原为 '/meeting/'
```

### 3. 删除了其他模块
- ❌ 会议管理相关页面
- ❌ 足康树检测页面
- ❌ 智能枕头页面
- ❌ 其他非蔡文姬功能

### 4. 独立首页路由
```javascript
path: '/',
redirect: '/admin'  // 首页自动重定向到管理后台
```

---

## 📊 项目统计

| 项目 | 数值 |
|------|------|
| Vue 页面文件 | 4 个 |
| API 模块 | 2 个 |
| 工具函数文件 | 6 个 |
| 组件库 | 2 套 |
| NPM 依赖 | 340 个 |
| 代码行数 (页面) | ~3,879 行 |
| Base URL 路径 | `/cwjgl/` |

---

## 🔐 认证配置

Token 管理保持不变：
```javascript
import { getToken, setToken, removeToken } from '@/utils/auth'

// localStorage 中使用 'app_token' 键存储
```

HTTP 请求自动添加 Authorization 头：
```javascript
Authorization: Bearer <token>
```

---

## 📝 开发指南

### 新增 API 接口
在 `src/api/cwj.js` 中添加：
```javascript
export default {
  newMethod(data) {
    return request.post('/cwj/newEndpoint', data)
  }
}
```

### 新增页面
1. 创建 `.vue` 文件在 `src/views/cwj/` 目录
2. 在 `src/router/index.js` 中注册路由
3. 使用动态导入：`() => import('@/views/cwj/newpage.vue')`

### 样式管理
- 全局样式: `src/assets/styles/`
- 组件样式: 在 `.vue` 文件中使用 `<style scoped>`

---

## 🏗️ 部署建议

### Nginx 配置
```nginx
server {
    listen 80;
    server_name youfangai.com;

    location /cwjgl/ {
        alias /path/to/cwjgl-wbe/dist/;
        try_files $uri $uri/ /cwjgl/index.html;
    }

    location /api {
        proxy_pass http://backend-api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker 部署
```dockerfile
FROM node:16
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 📋 检查清单

项目迁移完成度检查：

- ✅ 文件夹结构创建
- ✅ 四个页面复制
- ✅ 依赖模块复制
- ✅ 路由配置更新
- ✅ package.json 创建
- ✅ Vite 配置完成
- ✅ 环境变量配置
- ✅ NPM 依赖安装
- ✅ README 文档编写
- ✅ 本迁移说明文档

---

## 🔗 相关文件

- 📄 [README.md](./README.md) - 项目说明书
- 📄 [CWJ_PLATFORM_GUIDE.md](../CWJ_PLATFORM_GUIDE.md) - 详细功能文档
- 📁 源项目: [meeting-system](../)

---

## 🎓 常见问题

### Q: 如何在原项目和新项目之间同步？
A: 
1. 修改在各自项目中进行
2. 核心 API 更新时，同步 `src/api/cwj.js`
3. 大的功能更新最好在源项目中做，再导入

### Q: 如何修改 API 地址？
A: 编辑 `.env.*` 文件中的 `VITE_API_BASE_URL` 变量

### Q: 生产构建出错怎么办？
A: 
1. 检查 Node 版本 (需 >= 16)
2. 清除 node_modules: `rm -rf node_modules`
3. 重新安装: `npm install`
4. 再次构建: `npm run build`

### Q: 如何部署到服务器？
A:
1. 本地构建: `npm run build`
2. 复制 `dist/` 文件夹到服务器
3. 配置 Web 服务器 (Nginx/Apache)
4. 配置 API 代理

---

## 📅 后续计划

- [ ] 添加单元测试
- [ ] 配置 CI/CD 流程
- [ ] 完善错误处理机制
- [ ] 优化包体积
- [ ] 添加国际化支持
- [ ] 性能监控和分析

---

**最后更新**: 2026-03-16  
**维护人**: 开发团队  
**状态**: ✅ 项目独立提取完成，可用于生产

