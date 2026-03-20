# 蔡文姬平台完整梳理

## 📋 项目概述

蔡文姬是一个**多功能企业管理系统**，涵盖设备采购、发货、监控、签收等全流程管理。系统采用 **Vue 3 + Element Plus** 前端框架，通过 RESTful API 与后端通信。

---

## 🏗️ 系统架构

```
蔡文姬企业管理系统
├── 采购平台 (Purchase)
├── 发货平台 (Shipping)  
├── 管理员平台 (Admin)
└── 签收平台 (Receipt)
```

### 导航流程
```
管理员平台 (主入口) 
    │
    ├─→ 点击"订单数" → 采购平台
    ├─→ 点击"待发货" → 发货平台
    └─→ 点击"已部署" → 签收平台
```

---

## 📑 各模块详细说明

### 1️⃣ 管理员平台 (Admin)

**路由**: `/cwj/admin`  
**文件**: [src/views/cwj/adminpage.vue](src/views/cwj/adminpage.vue)

#### 功能概述
- **部署监控管理平台** - 设备全生命周期可视化管理
- **实时数据统计** - 显示关键业务指标
- **多维度筛选** - 支持按地区、门店、产品、时间等维度查询
- **部署状态看板** - 展示设备从待处理→已部署的全流程

#### 核心数据结构

**统计数据 (Stats)**
```javascript
{
  total_device_count: Number,    // 总订单数
  pending: Number,               // 待发货数量
  shipping: Number,              // 运输中数量
  deployed: Number,              // 已部署数量
  error: Number                  // 异常数量
}
```

**设备状态映射**
```javascript
0 → "待处理（待发货）"
1 → "处理中（待发货）"
2 → "已发货（运输中）"
5 → "已部署"
6 → "异常"
```

#### 筛选条件
| 维度 | 选项 | 说明 |
|------|------|------|
| 时间 | 全部、近一周、近半年 | 按时间范围筛选 |
| 地区 | 门店 | 选择特定门店 |
| 地区 | 大区 | 东部、西部、南部、北部 |
| 地区 | 省份 | 浙江、北京、上海 等 |
| 设备 | 状态 | 待处理、待发货、已发货、已部署、异常 |
| 设备 | 类型 | 产品类型（产品名称） |

#### 关键功能
- ✅ **发货操作** - 更新订单状态从待处理→待发货
- ✅ **设备调拨** - 将设备分配到新的门店
- ✅ **设备回收** - 回收异常或闲置设备
- ✅ **信息修正** - 修正部署信息错误
- ✅ **报表导出** - 导出部署统计、异常情况等报告

#### 关键 API 调用
```javascript
// 获取设备列表
cwjAPI.getdevicelist({ limit: 100 })

// 获取门店列表
cwjAPI.getstorelist({ limit: 100 })

// 获取产品列表（用于提取产品类型）
cwjAPI.getproductlist({ limit: 100 })

// 更新订单状态
cwjAPI.updateorderdetail({ item_id, product_status })
```

---

### 2️⃣ 采购平台 (Purchase)

**路由**: `/cwj/purchase`  
**文件**: [src/views/cwj/purchasepage.vue](src/views/cwj/purchasepage.vue)

#### 功能概述
- **采购需求提交系统** - 门店提交设备采购需求
- **表单字段验证** - 实时验证表单数据有效性
- **设备清单管理** - 动态添加/移除采购设备
- **草稿保存** - 本地保存未提交的采购单

#### 表单结构

**1. 门店信息块**
```javascript
{
  storeName: String,         // 门店名称 (必填)
  storeAddress: String,      // 门店地址 (必填)
  contactName: String,       // 联系人 (必填)
  contactPhone: String       // 手机号 (必填，格式 ^1[3-9]\d{9}$)
}
```

**2. 设备需求块**
```javascript
selectedDevices: [
  {
    productId: Number,       // 产品ID
    name: String,            // 产品名称
    specs: String,           // 规格 (型号 + 功能)
    quantity: Number         // 数量
  }
]
```

**3. 时间计划块**
```javascript
{
  openingDate: String,       // 开业时间 (必填，YYYY-MM-DD)
  expectedDate: String       // 预期到店时间 (必填，should < openingDate)
}
```

**4. 企业信息块**
```javascript
{
  companyName: String,       // 公司名称 (必填)
  taxNumber: String          // 纳税人识别号 (必填，^[A-Z0-9]{15,20}$)
}
```

**5. 备注信息块**
```javascript
{
  remarks: String            // 特殊要求或说明 (可选)
}
```

#### 数据验证规则
```javascript
// 类型验证
- storeName      → 非空字符串
- storeAddress   → 非空字符串
- contactName    → 非空字符串
- contactPhone   → 手机号格式 (^1[3-9]\d{9}$)
- taxNumber      → 纳税人识别号格式 (^[A-Z0-9]{15,20}$)
- openingDate    → 日期格式，不能为空
- expectedDate   → 日期格式，不能为空，且应 <= openingDate

// 业务逻辑验证
- 必须选择至少一个设备
- expectedDate 不能晚于 openingDate
```

#### 提交流程
```
1. 表单验证
   ↓
2. 构建提交数据 (API 格式)
   {
     store_name: string
     store_address: string
     store_manager: string
     store_phone: string
     company_name: string
     tax_identification_number: string
     opening_time: Unix时间戳 (秒)
     expected_arrival_time: Unix时间戳 (秒)
     remark: string
     items: [{ product_id, quantity }]
     delivery_address: string
   }
   ↓
3. 调用 API: cwjAPI.submitpurchaserequest(data)
   ↓
4. 显示成功模态框
   ↓
5. 重置表单
```

#### 关键功能
- ✅ **动态设备列表** - 从产品库中选择，支持数量调整
- ✅ **字段实时验证** - blur 事件触发验证，显示错误提示
- ✅ **本地草稿** - localStorage 保存草稿，页面加载时恢复
- ✅ **粒子动画背景** - 创意背景增强视觉效果
- ✅ **提交进度条** - 显示表单提交进度

#### 关键 API 调用
```javascript
// 获取产品列表
cwjAPI.getproductlist({ page: 1, limit: 100 })

// 提交采购需求
cwjAPI.submitpurchaserequest(submissionData)
```

---

### 3️⃣ 发货平台 (Shipping)

**路由**: `/cwj/shipping`  
**文件**: [src/views/cwj/shippingpage.vue](src/views/cwj/shippingpage.vue)

#### 功能概述
- **发货信息管理** - 厂商向门店发货时填写运输信息
- **设备批量关联** - 将多个设备序列号与发货单绑定
- **收货方/发货方信息维护** - 自динамically填充联系信息

#### 表单结构

**1. 收货方信息块**
```javascript
{
  store: Number,             // 门店ID (必填，下拉选择)
  address: String,           // 地址 (readonly，根据门店自动填充)
  manager: String,           // 负责人 (readonly，根据门店自动填充)
  managerPhone: String       // 负责人电话 (readonly)
}
```

**2. 发货信息块**
```javascript
{
  shipTime: String,          // 发货时间 (必填，YYYY-MM-DD HH:mm:ss)
  trackingNumber: String,    // 快递单号 (必填)
  batch: String              // 批次编号 (应为格式: 日期-序号，如 20251120-001)
}
```

**3. 发货方信息块**
```javascript
{
  manufacturer: Number,      // 厂家ID (下拉选择)
  manufacturerContact: String,  // 厂商联系人 (readonly)
  manufacturerPhone: String  // 联系电话 (readonly)
}
```

**4. 设备信息块 (表格)**
```javascript
devices: [
  {
    productType: Number,     // 产品ID (必填)
    serialNumber: String     // 厂商SN (必填，长度>=5)
  }
]
```

#### 设备选择逻辑
```
特点：
- 同一产品类型设备可能有多个，需要逐个选择
- 已选择过的设备不能再被选择（下拉中显示为不可用）
- 设备选择提示：显示每种产品已选/总共数量

例如：
ProductA: 已选 2 / 总共 3
ProductB: 已选 1 / 总共 1
ProductC: 已选 0 / 总共 2
```

#### 提交数据格式
```javascript
{
  store_id: Number,
  sender_type: "manufacturer",
  sender_id: Number,         // 厂家ID
  ship_time: String,         // 发货时间
  tracking_number: String,
  logistics_batch: String,   // 批次
  logistics_company: String,
  ship_status: "shipped",
  actual_arrival_time: String,
  receiver: String,
  receive_time: String,
  remark: String,
  items: [
    {
      order_item_id: Number, // 设备ID
      manufacturer_sn: String // 厂商SN
    }
  ]
}
```

#### 验证规则
| 字段 | 规则 | 触发时机 |
|------|------|--------|
| store | 必填 | change 事件 |
| shipTime | 必填 | change 事件 |
| trackingNumber | 必填 | blur 事件 |
| productType | 必填（表格中每行） | change 事件 |
| serialNumber | 必填，长度>=5 | blur 事件 |

#### 关键功能
- ✅ **动态表格** - 支持添加/删除设备行
- ✅ **联动填充** - 选择门店/厂家后自动填充联系信息
- ✅ **设备去重** - 防止同一设备被多次选择
- ✅ **移动端适配** - 通过 `mobile` 标志调整表格宽度

#### 关键 API 调用
```javascript
// 获取门店列表（待发货）
cwjAPI.getpendingstores({ days: 50, status: '待发货' })

// 获取设备列表
cwjAPI.getdevicelist({ store_id, product_status: 1, limit: 50 })

// 获取厂家列表
cwjAPI.getmanufacturerlist({ limit: 50 })

// 提交发货信息
cwjAPI.addlogisticsinfo(submitData)
```

---

### 4️⃣ 签收平台 (Receipt)

**路由**: `/cwj/receipt`  
**文件**: [src/views/cwj/receiptpage.vue](src/views/cwj/receiptpage.vue)

#### 功能概述
- **设备签收管理系统** - 门店/仓库员工确认收货
- **质检信息记录** - 记录配件完整度、功能状态
- **设备SN绑定** - 将YF-SN与接收确认关联
- **签收证明生成** - 生成YF-SN作为签收凭证

#### 表单结构

**1. 签收基础信息块**
```javascript
{
  store: Number,             // 门店/仓库 ID (必填)
  receiveTime: String,       // 收货时间 (必填，datetime-local)
  operator: String           // 操作员 (disabled，默认值)
}
```

**2. 质检信息块**

**配件完整性**
```javascript
{
  accessoryComplete: String, // 'yes' | 'no' (必填)
  accessoryIssueText: String // 缺失配件详情 (当选'no'时出现)
}
```

**功能状态**
```javascript
{
  functionNormal: String,    // 'yes' | 'no' (必填)
  functionIssueText: String  // 功能问题描述 (当选'no'时出现)
}
```

**3. 责任人信息块**
```javascript
{
  responsiblePerson: String, // 签收人 (必填)
  responsiblePhone: String   // 签收人电话 (必填)
}
```

**4. 设备选择块 (右侧边栏)**
```javascript
snList: [
  {
    id: Number,
    youfang_sn: String,       // YF-SN
    manufacturer_sn: String,  // 厂商SN
    product_type: String,
    status: String,           // 'shipped' 等
    create_time: String
  }
]

selectedSNs: Number[]         // 已选择的SN数组
```

#### SN 列表特性
```
- 动态加载：选择门店后调用 loadSNList() 获取该门店的待签收设备
- 状态过滤：只显示状态为 'shipped' 的设备（运输中）
- 点击选择：支持多选，选中项显示绿色勾选标记
- 信息展示：卡片中显示 SN、产品类型、创建时间等关键信息
```

#### 提交数据格式
```javascript
{
  store_id: Number,
  items: Number[],           // 选中的SN ID 数组
  receiver_time: String,     // 签收时间 (ISO 格式)
  receiver_name: String,
  receiver_phone: String,
  operator: String,
  accessory_status: Number,  // 1=完整，0=缺失
  missing_reason: String,    // 缺失原因
  function_status: Number,   // 1=正常，0=异常
  function_issue_desc: String // 功能问题描述
}
```

#### 签收流程
```
1. 选择门店
   ↓ (触发 loadSNList 加载待签收设备)
2. 显示该门店的设备清单（SN卡片列表）
   ↓
3. 填写基本信息和质检信息
   ↓
4. 勾选要签收的设备
   ↓ (支持多选)
5. 点击"提交签收"
   ↓
6. 生成 YF-SN 作为签收凭证
   ↓
7. 显示成功模态框
   ↓
8. 重置表单
```

#### 关键功能
- ✅ **动态SN加载** - 选择门店时异步加载该门店的待签收设备
- ✅ **多选管理** - 支持批量签收多个设备
- ✅ **质检两维度** - 分别记录配件和功能状态
- ✅ **条件显示** - 选择"否"时动态显示详情输入框
- ✅ **自动时间填充** - 初始化为当前时间 (从设置 minDate 开始)

#### 验证规则
```javascript
store          → 必填
receiveTime    → 必填
accessoryComplete → 必填
functionNormal → 必填
responsiblePerson → 必填
responsiblePhone  → 必填
selectedSNs    → 必须至少选一个设备
```

#### 关键 API 调用
```javascript
// 获取门店列表
cwjAPI.getstorelist({ limit: 100 })

// 根据门店加载待签收设备列表
// (通过 store_id 参数过滤，获取 status='shipped' 的设备)
cwjAPI.getstoredetailbyinfo({
  product_status: -1,
  youfang_sn: '',
  start_time: '',
  end_time: '',
  page: 1,
  limit: 100
})

// 提交签收信息
cwjAPI.signinfo(submitData)
```

---

## 🔌 API 接口汇总

### 基础配置
```javascript
// 文件: src/api/cwj.js
// 导入方式: import cwjAPI from '@/api/cwj'
// 所有请求都会自动加上 Bearer Token (如存在)
```

### 接口列表

| 方法名 | HTTP方法 | 端点 | 用途 | 参数格式 |
|--------|---------|------|------|---------|
| `getproductlist` | GET | `/cwj/getProductList` | 获取产品列表 | `{ page, limit, keyword }` |
| `getstorelist` | GET | `/cwj/getStoreList` | 获取门店列表 | `{ page, limit, keyword }` |
| `getmanufacturerlist` | GET | `/cwj/getManufacturerList` | 获取厂商列表 | `{ page, limit, keyword }` |
| `getdevicelist` | GET | `/cwj/device/statistics-list` | 获取设备列表 | `{ page, limit, store_id, product_status, ... }` |
| `getpendingstores` | GET | `/cwj/order/stores-by-arrival-days` | 获取待发货门店 | `{ days, status }` |
| `getstoredetailbyinfo` | GET | `/cwj/order/stores-by-item-status` | 按条件获取门店详情 | `{ product_status, youfang_sn, start_time, end_time, page, limit }` |
| `submitpurchaserequest` | POST | `/cwj/addOrderDemand` | 提交采购需求 | 详见采购平台 |
| `addlogisticsinfo` | POST | `/cwj/addLogisticsInfo` | 提交发货信息 | 详见发货平台 |
| `signinfo` | POST | `/cwj/device/sign` | 提交签收信息 | 详见签收平台 |
| `updateorderdetail` | POST | `/cwj/updateOrderItemStatus` | 更新订单明细状态 | `{ item_id, product_status }` |
| `addmanufacturer` | POST | `/cwj/addManufacturer` | 添加厂商 | `{ ... }` |
| `addstore` | POST | `/cwj/addStore` | 添加门店 | `{ ... }` |
| `addproduct` | POST | `/cwj/addProduct` | 添加产品 | `{ ... }` |

### 响应格式
```javascript
// 成功响应 (HTTP 200)
{
  status: 200,
  data: {
    list: Array,           // 列表数据
    statistics: Object,    // 统计数据 (可选)
    ...
  },
  message: "success"
}

// 失败响应
{
  status: 非200,
  message: "错误信息"
}
```

---

## 🔐 认证与权限

### Token 管理
```javascript
// 文件: src/utils/auth.js
import { getToken, setToken, removeToken, hasToken } from '@/utils/auth'

// 获取当前token
const token = getToken()

// 保存token（通常在登录后调用）
setToken('Bearer xxx')

// 清除token（通常在登出时调用）
removeToken()

// 检查是否有token
if (hasToken()) { ... }
```

### 请求中的 Token 处理
```javascript
// 文件: src/utils/request.js
// 在请求拦截器中自动添加 Authorization header
if (token) {
  config.headers.Authorization = `Bearer ${token}`
}
```

---

## 🛠️ 开发指南

### 本地运行
```bash
# 进入项目目录
cd d:\softsave\vscode\py_project\cwj\meeting-system

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址
http://localhost:5173/meeting/cwj/admin
```

### 项目结构
```
src/
├── views/cwj/
│   ├── adminpage.vue        # 管理员平台
│   ├── purchasepage.vue     # 采购平台
│   ├── shippingpage.vue     # 发货平台
│   └── receiptpage.vue      # 签收平台
├── api/
│   └── cwj.js               # 蔡文姬 API 模块
├── utils/
│   ├── auth.js              # 认证工具
│   └── request.js           # HTTP 请求封装
├── router/
│   └── index.js             # 路由配置
└── setting.js               # 全局设置
```

### 关键配置文件
```javascript
// vite.config.js
// API 代理配置
'/api' → {
  target: 开发环境地址,
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api/, '/api/v2')
}

// .env.development
VITE_API_BASE_URL=http://crmebapi.com/
```

---

## 📊 常见问题

### Q1: 如何联调 API？
```javascript
// 确保 .env.development 中的 API 地址正确
// 检查浏览器 DevTools 的 Network 标签，确认请求是否正确
// 查看响应状态码和返回数据
```

### Q2: Token 过期如何处理？
```javascript
// 响应拦截器中 401 错误处理
if (status === 401) {
  // 清除本地 token
  removeToken()
  // 跳转到登录页
  router.push('/login')
}
```

### Q3: 如何添加新的 API 接口？
```javascript
// 在 src/api/cwj.js 中添加新方法
export default {
  newMethod(data) {
    return request.post('/path/to/endpoint', data)
  }
}

// 在组件中调用
import cwjAPI from '@/api/cwj'
const result = await cwjAPI.newMethod(data)
```

---

## 📝 最后更新

- **更新日期**: 2026-03-16
- **系统版本**: 1.0
- **维护人员**: 开发团队
- **联系方式**: 内部协作

---

## 🎯 下一步工作建议

1. **完善权限控制** - 根据用户角色限制模块访问
2. **优化大数据列表** - 添加虚滚动、分页等性能优化
3. **增强离线功能** - PWA 支持，允许离线操作
4. **完善错误处理** - 更详细的错误消息和重试机制
5. **性能监控** - 添加埋点，监控关键业务指标
6. **国际化支持** - 支持多语言界面

---
