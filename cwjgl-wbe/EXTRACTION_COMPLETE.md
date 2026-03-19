# 🎉 cwjgl-wbe 独立项目迁移完成

## 📊 项目提取总结

### ✅ 完成内容

| 任务 | 状态 | 说明 |
|------|------|------|
| 创建独立项目目录结构 | ✅ | `d:\softsave\vscode\py_project\cwj\meeting-system\cwjgl-wbe` |
| 复制四个核心页面 | ✅ | adminpage / purchasepage / shippingpage / receiptpage |
| 配置 Vite (base: /cwjgl/) | ✅ | 独立的 base 路径，支持与 meeting-system 并行运行 |
| 独立路由配置 | ✅ | 只包含蔡文姬平台的四个页面 + 404 |
| 环境配置 (.env) | ✅ | development / production / test |
| npm 依赖管理 | ✅ | 341 个依赖包，0 个安全漏洞 |
| 开发服务器启动 | ✅ | 运行地址：`http://localhost:5173/cwjgl/` |

---

## 🗂️ 项目结构

```
cwjgl-wbe/
├── public/                      # 静态资源
│   ├── favicon.ico
│   └── static/
├── src/
│   ├── views/cwj/              # 四个核心页面 ⭐
│   │   ├── adminpage.vue       # 管理员平台 - 部署监控
│   │   ├── purchasepage.vue    # 采购平台 - 提交采购需求
│   │   ├── shippingpage.vue    # 发货平台 - 物流管理
│   │   └── receiptpage.vue     # 签收平台 - 设备签收
│   ├── api/
│   │   └── cwj.js              # 蔡文姬 API 模块
│   ├── components/             # 共享组件
│   │   ├── common/
│   │   ├── form/
│   │   └── ...
│   ├── router/
│   │   └── index.js            # 独立路由配置 ⭐
│   ├── stores/                 # Pinia 数据存储
│   ├── utils/
│   │   ├── auth.js             # Token 管理
│   │   ├── request.js          # HTTP 请求封装
│   │   └── ...
│   ├── styles/                 # 全局样式
│   ├── assets/                 # 图片等资源
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 入口文件
│   └── setting.js              # 全局配置
├── index.html                  # HTML 入口
├── package.json                # 项目依赖 ⭐
├── vite.config.js              # Vite 配置 (base: /cwjgl/) ⭐
├── .env.development            # 开发环境配置
├── .env.production             # 生产环境配置
├── .env.test                   # 测试环境配置
├── tsconfig.json               # TypeScript 配置
├── README.md                   # 项目说明
└── MIGRATION.md                # 迁移文档
```

---

## 🚀 启动和运行

### 开发模式

```bash
# 进入项目目录
cd d:\softsave\vscode\py_project\cwj\meeting-system\cwjgl-wbe

# 安装依赖 (如果还没装的话)
npm install

# 启动开发服务器
npm run dev

# 在浏览器中访问
http://localhost:5173/cwjgl/
```

**默认进入页面**: `/cwjgl/admin` (管理员平台)

### 生产构建

```bash
npm run build
```

输出目录: `dist/`

### 预览构建结果

```bash
npm run preview
```

---

## 🔌 API 配置

### 开发环境 (.env.development)
```env
VITE_API_BASE_URL=http://crmebapi.com/
VITE_API_BASE_TITLE=测试环境
```

### 生产环境 (.env.production)
```env
VITE_API_BASE_URL=https://youfangai.com/
VITE_API_BASE_TITLE=生产环境
```

### API 代理
- **本地代理**: `/api` → `/api/v2` (Vite proxy)
- **生产环境**: 直接请求后端绝对地址

---

## 📑 路由映射

| 路径 | 名称 | 页面 | 功能 |
|------|------|------|------|
| `/` | 首页 | → `/admin` | 重定向到管理员平台 |
| `/admin` | 管理员平台 | adminpage.vue | 部署监控、统计分析、筛选查询 |
| `/purchase` | 采购平台 | purchasepage.vue | 采购需求表单、草稿保存 |
| `/shipping` | 发货平台 | shippingpage.vue | 物流信息、设备关联、发货管理 |
| `/receipt` | 签收平台 | receiptpage.vue | 设备签收、质检记录 |
| `*` | 404 | NotFound.vue | 页面未找到 |

### 导航流程
```
管理员平台 (主入口)
├─ 点击"订单数" → 采购平台
├─ 点击"待发货" → 发货平台
└─ 点击"已部署" → 签收平台
```

---

## 🛠️ 核心技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 6
- **路由**: Vue Router 4
- **状态管理**: Pinia 3
- **UI 组件库**: Element Plus 2
- **HTTP 请求**: Axios
- **数据可视化**: ECharts + Chart.js
- **拖拽组件**: vuedraggable
- **样式预处理**: Sass

---

## 📋 可用的 npm 脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run preview      # 预览构建结果
npm run test         # 测试模式运行
npm run lint         # 运行 ESLint 检查并修复
npm run format       # 用 Prettier 格式化代码
```

---

## 🔒 认证与 Token

### Token 获取和存储
```javascript
import { getToken, setToken, removeToken } from '@/utils/auth'

// 获取 token
const token = getToken()

// 保存 token
setToken('Bearer xxx')

// 清除 token
removeToken()
```

### 请求自动增加 Authorization header
```javascript
// 在 src/utils/request.js 中自动处理
if (token) {
  config.headers.Authorization = `Bearer ${token}`
}
```

---

## 📊 关键 API 列表

所有 API 通过 `cwjAPI` 对象调用：

```javascript
import cwjAPI from '@/api/cwj'

// 获取产品列表
await cwjAPI.getproductlist({ page, limit, keyword })

// 获取门店列表
await cwjAPI.getstorelist({ page, limit, keyword })

// 获取设备列表
await cwjAPI.getdevicelist({ page, limit, store_id, product_status })

// 提交采购需求
await cwjAPI.submitpurchaserequest(data)

// 提交发货信息
await cwjAPI.addlogisticsinfo(data)

// 提交签收信息
await cwjAPI.signinfo(data)

// 获取待发货门店列表
await cwjAPI.getpendingstores({ days, status })

// 获取厂商列表
await cwjAPI.getmanufacturerlist({ page, limit })

// 更新订单状态
await cwjAPI.updateorderdetail({ item_id, product_status })
```

详见 [src/api/cwj.js](src/api/cwj.js)

---

## 🔍 与原 meeting-system 项目的区别

| 方面 | meeting-system | cwjgl-wbe |
|------|-----------------|-----------|
| 项目范围 | 多个系统（会议、蔡文姬、足康树、智能枕头） | 只有蔡文姬平台 |
| Base 路径 | `/meeting/` | `/cwjgl/` |
| 独立性 | 依赖统一的根项目 | 完全独立，可并行运行 |
| 首页路由 | 多个模块入口 | `/cwjgl/admin` 管理员平台 |
| 维护方式 | 统一维护多模块 | 专注蔡文姬功能迭代 |

---

## 💡 开发建议

### 1. 本地并行运行两个项目
```bash
# 终端1：运行 meeting-system (端口 5173)
cd d:\softsave\vscode\py_project\cwj\meeting-system
npm run dev

# 终端2：运行 cwjgl-wbe (端口 5174)
cd d:\softsave\vscode\py_project\cwj\meeting-system\cwjgl-wbe
npm run dev -- --port 5174
```

访问地址：
- meeting-system: `http://localhost:5173/meeting/`
- cwjgl-wbe: `http://localhost:5174/cwjgl/`

### 2. 环境变量管理
- 开发：修改 `.env.development`
- 生产前：更新 `.env.production` 中的后端 API 地址
- 构建：`npm run build` 会自动使用 `.env.production`

### 3. 代码规范
```bash
# 检查代码问题
npm run lint

# 格式化代码
npm run format
```

### 4. 部署到服务器
```bash
# 1. 构建项目
npm run build

# 2. 上传 dist 文件夹到服务器根目录
# 3. 配置 Nginx/Apache 指向 dist 文件夹
# 4. 配置 API 反向代理指向后端服务器
```

---

## 🐛 常见问题

**Q: 如何修改 API 地址？**  
A: 修改 `.env.development` (开发) 或 `.env.production` (生产) 中的 `VITE_API_BASE_URL`

**Q: 页面访问 404？**  
A: 确认浏览器地址是 `http://localhost:5173/cwjgl/...` (注意 `/cwjgl/` 前缀)

**Q: Token 过期如何处理？**  
A: 响应拦截器自动检测 401 状态，清除 token 并跳转登录

**Q: 如何并行运行两个项目？**  
A: 使用 `npm run dev -- --port 5174` 指定不同的端口

---

## 📝 项目信息

- **项目名称**: cwjgl-wbe (蔡文姬企业管理系统 - 前端)
- **版本**: 1.0.0
- **提取日期**: 2026-03-16
- **源项目**: meeting-system
- **开发框架**: Vue 3 + Vite 6
- **状态**: ✅ 可独立运行

---

## 📞 技术支持

如有问题，请检查：
1. Node.js 版本 >= 16.0
2. npm 依赖是否完整 (`npm install`)
3. 后端 API 地址是否正确
4. Network tab 查看 API 请求状态
5. Console 检查控制台错误信息

---
