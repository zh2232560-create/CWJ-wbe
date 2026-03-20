# 🔍 前端项目错误诊断分析报告

## 问题总结

**cwjgl-wbe** 项目启动后在加载页面数据时出现以下错误：

```
Error: connect ECONNREFUSED 127.0.0.1:80
```

---

## 发现的问题 & 修复清单

### ✅ 问题 #1: src/setting.js 语法错误
**错误类型**: 代码缺失换行符  
**位置**: src/setting.js 第 12-13 行  
**原因**: 
```javascript
export const baseURL = ...
const Setting = {    // ❌ 缺失分隔符
```

**修复**: ✅ 已添加换行符分隔
- cwjgl-wbe/src/setting.js
- meeting-system/src/setting.js

---

### ✅ 问题 #2: vite.config.js API 代理配置错误
**错误类型**: 代理 rewrite 规则重复  
**位置**: vite.config.js 的 server.proxy 配置  
**原因**:
```javascript
rewrite: (path) => path.replace(/^\/api/, '/api/v2')
// 请求: /api/v2/cwj/... 
// 改写后: /api/v2/v2/cwj/... ❌ (双倍路径)
```

**修复**: ✅ 已移除重复的 rewrite 规则
- cwjgl-wbe/vite.config.js
- meeting-system/vite.config.js

修改后：
```javascript
proxy: {
  '/api': {
    target: 'http://crmebapi.com',
    changeOrigin: true,
    // rewrite 已移除，直接转发请求
  },
}
```

---

### 🔴 **当前问题 #3: 后端 API 服务不可达**
**错误信息**:
```
Error: connect ECONNREFUSED 127.0.0.1:80
```

**错误含义**:
- Vite 代理试图连接到 `127.0.0.1:80` (本地 localhost 端口 80)
- 连接被拒绝（没有服务在监听该端口）
- 后端 API 服务 (http://crmebapi.com) 要么未运行，要么不可达

**根本原因分析**:

| 场景 | 症状 | 原因 |
|------|------|------|
| 后端服务未启动 | 连接拒绝，立即超时 | API 服务器没有运行 |
| 网络不通 | 连接超时，缓慢 | 防火墙/网络隔离 |
| DNS 解析失败 | 指向 127.0.0.1 | 域名无法解析 |
| 错误 API 地址 | 连接到本地而非远端 | `.env` 配置有误 |

---

## ✅ 已完成的代码修复

### 1. setting.js (两处修复)
```diff
export const baseURL = import.meta.env.DEV
  ? '/api'
  : `${normalizeBaseUrl(BASE_URL)}/api/v2`
+ 
const Setting = {
```

### 2. vite.config.js (两处修复)  
```diff
server: {
  proxy: {
    '/api': {
      target: 'http://crmebapi.com',
      changeOrigin: true,
-     rewrite: (path) => path.replace(/^\/api/, '/api/v2'),
    }
  }
}
```

---

## 🔧 下一步解决方案

### 方案 A: 验证后端 API 服务（推荐）

**1. 检查后端是否运行**
```bash
# 尝试访问后端 API
curl http://crmebapi.com/api/v2/health
# 或
curl http://crmebapi.com/api/v2/cwj/getProductList
```

**2. 检查网络连接**
```bash
# 尝试 ping 域名
ping crmebapi.com

# 测试 DNS 解析
nslookup crmebapi.com
```

**3. 检查防火墙/代理设置**
- 确保本地没有代理阻止出站
- 检查 Windows 防火墙是否允许 Node.js 出站连接

---

### 方案 B: 修改开发环境配置

如果后端地址不同，更新 `.env.development`：

```bash
# 编辑 .env.development
VITE_API_BASE_URL=http://localhost:3000/  # 如果后端在本地
# 或
VITE_API_BASE_URL=https://api.example.com/  # 如果后端在远端
```

然后重启开发服务器。

---

### 方案 C: 使用 Mock API（开发时绕过）

如果后端暂时不可用，可以在 `src/utils/request.js` 添加 mock 拦截：

```javascript
// 在请求拦截器中添加
service.interceptors.request.use((config) => {
  if (config.url.includes('/cwj/')) {
    // 返回 mock 数据，不实际发送请求
    return Promise.reject({ response: { status: 200, data: { ... } } })
  }
  return config
})
```

---

## 📋 项目启动检查清单

- [x] 代码语法错误已修复（src/setting.js）
- [x] API 代理配置已修复（vite.config.js）
- [ ] **后端 API 服务运行状态 ← 需要检查**
- [ ] 网络连接畅通 ← 需要验证
- [ ] API 地址正确配置 ← 可能需要调整

---

## 核心配置参考

### .env.development
```env
VITE_API_BASE_URL=http://crmebapi.com/
VITE_API_BASE_TITLE=蔡文姬开发环境
```

### vite.config.js 中 Vite 代理工作流程

```
浏览器请求: http://localhost:5173/api/cwj/getProductList
         ↓
Vite 代理拦截 (/api 路径)
         ↓
转发到后端: http://crmebapi.com/api/cwj/getProductList
         ↓
[后端处理...]
         ↓
返回响应到浏览器
```

---

## 预期行为修复后

修复成功后，浏览器应该显示：
- ✅ 管理员平台首页加载
- ✅ 统计数据卡片显示数据（而非空白）
- ✅ 设备列表、门店列表正常加载
- ✅ 无 HTTP 代理错误信息

---

## 文件修改总结

| 文件 | 项目 | 修复内容 |
|------|------|---------|
| src/setting.js | cwjgl-wbe | 添加行分隔符 |
| src/setting.js | meeting-system | 添加行分隔符 |
| vite.config.js | cwjgl-wbe | 移除重复 rewrite |
| vite.config.js | meeting-system | 移除重复 rewrite |

---

## 联系信息

如果后端 API 地址需要调整，请提供：
1. 后端 API 的实际地址（如: http://api.example.com）
2. 后端是否已启动运行
3. 防火墙/网络隔离情况

---

**诊断时间**: 2026-03-16  
**报告版本**: 1.0  
**状态**: ⏳ 等待后端确认
