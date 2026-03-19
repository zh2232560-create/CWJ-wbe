# 蔡文姬智能管理系统 (CWJGL-WBE)

> 有方智能企业管理系统前端独立项目

## 📋 项目简介

**cwjgl-wbe** 是从 meeting-system 项目中提取出来的蔡文姬（有方智能）企业管理系统独立前端项目。项目采用 **Vue 3 + Vite** 技术栈，专注于设备管理、采购、发货、签收等企业管理功能。

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0
- npm >= 7.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问：`http://localhost:5173/cwjgl/`
Base: http://localhost:5173/cwjgl/
Admin: http://localhost:5173/cwjgl/admin
采购: http://localhost:5173/cwjgl/purchase
发货: http://localhost:5173/cwjgl/shipping
签收: http://localhost:5173/cwjgl/receipt

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

## 🔧 路由配置

| 路由 | 名称 | 组件 | 描述 |
|------|------|------|------|
| `/` | - | - | 重定向到 `/admin` |
| `/admin` | cwjAdmin | adminpage.vue | 部署监控管理平台 |
| `/purchase` | purchasepage | purchasepage.vue | 采购平台 |
| `/shipping` | shippingpage | shippingpage.vue | 发货平台 |
| `/receipt` | receiptpage | receiptpage.vue | 签收平台 |

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
