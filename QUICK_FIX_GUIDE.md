# 📋 错误诊断快速参考

## 问题原因 (按严重性)

### 🔴 问题 1: setting.js 缺少换行符
```
位置: src/setting.js 第 12-13 行
症状: 代码解析错误
修复: ✅ 已添加换行符
位置:
  - cwjgl-wbe/src/setting.js
  - meeting-system/src/setting.js
```

### 🔴 问题 2: vite.config.js 代理重复改写
```
位置: vite.config.js server.proxy.rewrite
症状: API 路径错误 /api/v2 → /api/v2/v2
修复: ✅ 已移除重复的 rewrite
位置:
  - cwjgl-wbe/vite.config.js
  - meeting-system/vite.config.js
```

### 🔴 问题 3: 后端 API 不可达 ⏳
```
错误: Error: connect ECONNREFUSED 127.0.0.1:80
原因: 后端 API 服务未响应
解决: 需确认后端地址和运行状态

可能原因:
  a) 后端服务未启动
  b) http://crmebapi.com 无法访问
  c) 防火墙/网络隔离
  d) .env 配置的地址有误
```

---

## 快速检查清单

```
[ ] 两个 setting.js 已修复 (换行符)
[ ] 两个 vite.config.js 已修复 (rewrite 移除)
[ ] 开发服务器已重启
[ ] 后端 API 地址: __________ (需填入)
[ ] 后端服务已启动: ✅ / ❌
[ ] 网络连接正常: ✅ / ❌
```

---

## 一句话总结

**代码问题已修复 ✅，当前卡在后端 API 不可达 🔴 - 需确认后端地址和运行状态**

---

## 如何验证修复成功

1. **查看终端日志** - 应该看到 "server restarted"
2. **打开浏览器** - http://localhost:5173/cwjgl/ 应该加载
3. **查看网络错误** - 应该不再有重复的 `/api/v2/v2/` 错误

---

## 如何修复 API 不可达问题

### 方案 A: 确认后端地址正确
```bash
# 尝试访问后端
curl http://crmebapi.com/api/v2/health
ping crmebapi.com
nslookup crmebapi.com
```

### 方案 B: 更新 API 地址
```env
# 编辑 .env.development
VITE_API_BASE_URL=http://localhost:3000/
# 或其他正确的地址
```

### 方案 C: 使用 Mock 数据 (临时方案)
```js
// 在 src/utils/request.js 中添加
if (process.env.NODE_ENV === 'development') {
  // 返回 mock 数据
}
```

---

## 文件修改记录

| 文件 | 修改 | 状态 |
|------|------|------|
| cwjgl-wbe/src/setting.js | 添加换行符 | ✅ |
| meeting-system/src/setting.js | 添加换行符 | ✅ |
| cwjgl-wbe/vite.config.js | 移除 rewrite | ✅ |
| meeting-system/vite.config.js | 移除 rewrite | ✅ |

---

## 📞 需要信息

如果问题解决不了，请提供：
1. 后端 API 的实际地址是什么？
2. 后端 API 现在是否在运行？
3. 如何访问后端 API (用户名/密码/Token)?

---

**最后更新**: 2026-03-16  
**修复者**: GitHub Copilot  
**状态**: ⏳ 等待后端确认
