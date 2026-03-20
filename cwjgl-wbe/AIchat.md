AI 会话页面 UI/UX 布局设计
页面整体采用类似 ChatGPT / 钉钉AI / 飞书智能助手的极简对话流设计，分为左侧历史记录区、主对话区和底部交互区。

1. 空白状态 / 欢迎界面 (Welcome Screen)
当用户首次进入或开启新对话时，主屏幕中央显示：

AI 虚拟形象： 蔡文姬机器人的科技感拟人化 Avatar，或者带有品牌色彩的 AI 图标。
欢迎语： “您好，我是蔡文姬运营数据助理。我已经掌握了全国所有设备的实时运行情况与历史服务记录，您可以随时向我提问。”
2. 底部交互区 (Input & Suggestions) - 核心设计
这是用户提问的控制中心，分为上下两层：

上层：快捷提问标签 (Prompt Chips)
在输入框的正上方，横向排列一组胶囊状的快捷按钮。用户只需点击即可一键发送（满足您的需求）。
💡 大悦城的运营情况？
📈 目前哪个门店使用量最多？
📍 南部大区有多少家门店？
🔥 睡眠调理项目的平均温度是多少？
（系统可根据用户角色或近期热点自动刷新这些标签）
下层：对话输入框 (Chat Input)
支持多行文本输入的宽大输入框。
左侧/内部附带：【新对话 (清除上下文)】图标、【语音输入】图标（若支持）。
右侧：【发送】按钮。
3. 主对话流 (Chat History Area)
对话开始后，信息呈瀑布流自下而上滚动：

用户气泡 (User Bubble)： 靠右，展示用户的文字提问。
AI 气泡 (AI Bubble)： 靠左，支持富文本与轻量级图表渲染 (Markdown + ECharts)。
文字回复： 提炼核心结论，关键数据加粗。
数据表格： 遇到排名类问题（如门店使用量最多），直接在气泡内渲染一个迷你排行榜表格。
图表插件 (卡片)： 遇到趋势类问题，气泡内可直接嵌入一个小折线图。
深度链接 (Deep Link)： 回复末尾可附带按钮 👉前往【多维分析】查看详情。
4. 左侧边栏 (Chat Sessions) - 可折叠
【+ 新建对话】按钮。
历史会话列表（例如：“昨天：关于华东区设备的排查”、“上周：深圳门店客流分析”），方便运营人员找回之前的分析思路。

**AI 对话页面的完整逻辑方案**：

> **每一次发送信息，通过 POST 请求调用大模型，并且要求模型结合“自己的数据信息”进行回复。**

# 一、核心目标

你这个页面本质上是一个：

- **聊天输入框**
- **消息列表展示**
- **发送消息时 POST 到后端**
- **后端再去调用大模型**
- **大模型回复时必须参考你自己的业务数据/知识库/用户数据**

# 二、整体架构设计

推荐架构如下：

```text
前端聊天页面
   ↓ POST /api/chat
后端服务
   ├─ 1. 校验用户身份
   ├─ 2. 获取用户问题
   ├─ 3. 查询用户自己的数据 / 业务数据 / 知识库
   ├─ 4. 组装 prompt
   ├─ 5. 调用大模型接口
   ├─ 6. 保存对话记录
   └─ 7. 返回结果给前端
```

# 三、页面逻辑设计
## 1. 页面模块
一个完整 AI 对话页面建议包含：

### （1）消息展示区
展示：

- 用户消息
- AI 回复
- 加载中状态
- 失败重试状态

### （2）输入区
包含：

- 输入框
- 发送按钮
- 回车发送
- 禁止空消息发送

### （3）会话管理
包含：

- 新建会话
- 切换历史会话
- 清空当前会话

### （4）状态提示
例如：

- “AI 正在思考...”
- “请求失败，请重试”
- “当前回复基于你的专属数据生成”

---

# 四、一次发送消息的完整流程

## 前端流程

### Step 1：用户输入问题
例如：

> “帮我总结一下我本月的销售情况”

### Step 2：前端先把用户消息插入页面
页面立即显示：

- 用户消息气泡
- AI 占位消息：“正在生成...”

这样用户体验更好。

### Step 3：前端发送 POST 请求
请求内容建议带上：

- 当前会话ID
- 用户问题
- 历史消息
- 用户身份token
- 业务参数（如当前页面上下文）

### Step 4：后端处理
后端不能直接调用模型，而是要先：

- 查这个用户是谁
- 查这个用户有哪些自己的数据
- 从数据库/知识库取出相关内容
- 组装成模型上下文

### Step 5：后端返回结果
前端收到后：

- 用真实回复替换“正在生成...”
- 保存这轮消息
- 支持继续追问

---

# 五、为什么要“针对自己的数据信息回复”

这是最关键的点。

如果你只是直接请求大模型：

```json
{
  "message": "帮我总结一下我本月的销售情况"
}
```

模型根本不知道：

- 你是谁
- 你本月销售数据是什么
- 哪些数据是你的专属数据

所以必须在后端补充数据。

---

# 六、实现“基于自己的数据回复”的方案

---

## 方案一：后端直接拼接业务数据到 Prompt

适合：

- 用户自己的数据量不大
- 数据结构清晰
- 不需要复杂知识检索

### 逻辑
后端收到问题后，先查数据（从./data/详细分析报告.md文件查询）：

- 用户本月销售额
- 订单数
- Top商品
- 退货率

然后拼到 prompt 里：

```text
你是一个企业数据分析助手，请根据以下用户的真实业务数据回答问题。
用户数据（用户数据从./data/详细分析报告.md文件查询）：

生成时间: 2026-03-19 11:48:32
过滤设置: 忽略持续时间小于 10.0 分钟或大于 65.0 分钟的项目
排除项目: 包含关键词 ['理疗机器人'] 的项目

## 📊 总体统计

- **设备数量**: 34 台
- **总使用次数**: 591 次
- **总使用时长**: 18833 分钟 (313.9 小时)
- **平均每台设备使用次数**: 17.4 次
- **平均每台设备使用时长**: 553.9 分钟

## 📱 设备详细分析

### 设备: 8cfca02cd07a (H3IRNN-1016 - 杭州城西银泰店 - 艾灸 - 第一批第1次发货)
- **使用次数**: 15 次
- **使用时长**: 446 分钟
- **项目数量**: 7 个

用户问题：
帮我总结一下我本月的销售情况
```

然后再调用模型。

### 优点
- 简单
- 可控
- 易落地

### 缺点
- 数据太大时 prompt 会很长
- 不适合文档知识库

---

# 七、推荐的后端接口设计

---

## 1. 聊天接口

### `POST /api/chat`

请求体：

```json
{
  "sessionId": "abc123",
  "message": "帮我总结一下我本月的销售情况",
  "context": {
    "page": "sales_dashboard"
  }
}
```

请求头：

```http
Authorization: Bearer xxx
Content-Type: application/json
```

响应体：

```json
{
  "code": 0,
  "data": {
    "sessionId": "abc123",
    "reply": "根据你本月的数据，你的销售额为128000元，较上月增长12%。订单总数为356单，其中A产品和B产品表现最好。",
    "sources": [
      {
        "type": "db",
        "name": "sales_month_report"
      }
    ],
    "messageId": "msg_002"
  },
  "msg": "success"
}
```

---

## 2. 历史会话接口

### `GET /api/chat/history?sessionId=abc123`

返回当前会话历史消息。

---

## 3. 新建会话接口

### `POST /api/chat/session/create`

返回一个新的 sessionId。

---

# 八、前端页面数据结构设计

前端建议维护下面这些状态：

```js
{
  sessionId: "abc123",
  messages: [
    {
      id: "1",
      role: "user",
      content: "帮我总结一下我本月的销售情况",
      status: "success"
    },
    {
      id: "2",
      role: "assistant",
      content: "根据你本月的数据...",
      status: "success",
      sources: []
    }
  ],
  inputValue: "",
  loading: false
}
```

---

# 九、前端发送消息逻辑

---

## 1. 基本逻辑

```js
async function sendMessage() {
  const text = inputValue.trim();
  if (!text || loading) return;

  const userMsg = {
    id: Date.now() + "_user",
    role: "user",
    content: text,
    status: "success"
  };

  const aiPlaceholder = {
    id: Date.now() + "_ai",
    role: "assistant",
    content: "正在生成...",
    status: "loading"
  };

  setMessages(prev => [...prev, userMsg, aiPlaceholder]);
  setInputValue("");
  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        sessionId,
        message: text,
        context: {
          page: "sales_dashboard"
        }
      })
    });

    const data = await res.json();

    setMessages(prev =>
      prev.map(msg =>
        msg.id === aiPlaceholder.id
          ? {
              ...msg,
              content: data.data.reply,
              status: "success",
              sources: data.data.sources || []
            }
          : msg
      )
    );
  } catch (e) {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === aiPlaceholder.id
          ? {
              ...msg,
              content: "请求失败，请重试",
              status: "error"
            }
          : msg
      )
    );
  } finally {
    setLoading(false);
  }
}
```

---

# 十、后端核心处理逻辑

后端不是简单“转发消息”，而是要做增强。

---

## 1. 后端处理步骤

### 第一步：鉴权
识别当前用户是谁，例如 userId。

### 第二步：获取会话历史
查询数据库中当前 `sessionId` 的历史消息。

### 第三步：查询用户专属数据
例如：

- 当前用户的销售数据
- 当前用户的订单数据
- 当前用户的知识文档
- 当前企业内部规则

### 第四步：抽取与问题相关的数据
不要把所有数据都给模型，要做筛选。

比如用户问“销售情况”，那就只取销售数据，不取库存数据。

### 第五步：构建 Prompt
例如：

```text
你是企业智能助手，请根据提供的真实数据回答用户问题。
要求：
1. 只能基于提供的数据回答
2. 若数据中没有答案，明确说明“暂无相关数据”
3. 回答尽量清晰、简洁、专业

用户信息：
- 用户ID: 10086
- 当前页面: sales_dashboard

相关业务数据：
- 本月销售额：128000元
- 上月销售额：114000元
- 增长率：12%
- 订单数：356
- 热销商品：A产品、B产品

历史对话：
用户：...
助手：...

当前问题：
帮我总结一下我本月的销售情况
```

### 第六步：调用大模型接口
用 POST 方式调用模型服务。

### 第七步：保存消息
存储：

- 用户消息
- AI回复
- 数据来源
- 时间戳

### 第八步：返回前端

---

# 十一、后端伪代码示例

下面是 Node.js 风格伪代码：

```js
app.post('/api/chat', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { sessionId, message, context } = req.body;

    // 1. 获取历史会话
    const history = await getChatHistory(sessionId, userId);

    // 2. 获取用户专属业务数据
    const userBusinessData = await getBusinessData(userId, message, context);

    // 3. 构造 prompt
    const prompt = buildPrompt({
      message,
      history,
      userBusinessData,
      context
    });

    // 4. 调用大模型
    const llmResp = await fetch("https://llm-api.xxx.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer LLM_KEY"
      },
      body: JSON.stringify({
        model: "your-model-name",
        messages: prompt
      })
    });

    const llmData = await llmResp.json();
    const reply = llmData.output_text;

    // 5. 保存记录
    await saveChatMessage(sessionId, userId, "user", message);
    await saveChatMessage(sessionId, userId, "assistant", reply);

    res.json({
      code: 0,
      data: {
        sessionId,
        reply,
        sources: userBusinessData.sources || []
      },
      msg: "success"
    });

  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: "chat request failed"
    });
  }
});
```

---

# 十二、Prompt 设计建议

为了让 AI 一定“针对自己的数据回复”，系统提示词很关键。

建议加入强约束：

```text
你是一个企业专属AI助手。
你必须严格依据系统提供的用户业务数据进行回答。
禁止脱离数据凭空编造。
如果提供的数据不足以回答问题，请直接说明“根据当前可用数据，暂时无法准确回答该问题”。
如果涉及数字，请优先引用给定数据。
```

这样可以减少幻觉。

---

# 十三、上下文管理逻辑

聊天不能无限带全部历史，否则：

- token 太长
- 成本高
- 速度慢

所以建议做上下文裁剪。

## 推荐方式

### 方式1：只带最近 N 轮对话
例如最近 5~10 轮。

### 方式2：历史摘要 + 最近对话
如果会话很长，先生成一个摘要，再加最近几轮。

结构：

```text
历史对话摘要：
用户一直在询问销售和订单情况，重点关注本月业绩变化。

最近对话：
用户：上周订单量怎么样？
助手：...
用户：那退款率呢？
助手：...

当前问题：
帮我总结一下我本月的销售情况
```

---

# 十四、页面交互细节建议

## 1. 发送中禁止重复点击
避免并发重复请求。

## 2. 支持回车发送，Shift+Enter换行

## 3. AI消息流式输出（可选）
如果体验要更好，可以做 SSE / WebSocket 流式返回。

这样 AI 不是一次性返回，而是边生成边显示。

### 普通模式
- 用户等待 2~5 秒后看到完整结果

### 流式模式
- 用户立刻看到文字逐步出现

如果现在先做基础版，建议先普通 POST，同步返回即可。

---

# 十五、数据库表设计建议

---

## 1. 会话表 `chat_session`

字段：

- id
- user_id
- title
- created_at
- updated_at

---

## 2. 消息表 `chat_message`

字段：

- id
- session_id
- user_id
- role (`user` / `assistant`)
- content
- sources
- status
- created_at

---

# 十六、“自己的数据”具体可以有哪些

你提到“针对自己的数据信息回复”，这里通常包括：

- 当前登录用户的个人信息
- 用户所属企业信息
- 用户自己的订单/销售/报表
- 用户上传的文档
- 企业内部知识库
- 当前页面上下文数据
- 用户权限范围内的数据

注意：

## 必须做权限控制
用户A不能问到用户B的数据。

所以后端查询数据时必须带上：

- `userId`
- `companyId`
- `role`
- 数据权限条件

---

# 十七、推荐的最小可落地方案

如果你现在要先快速上线，我建议你这样做：

## 第一版（最快）
- 前端聊天页面
- `POST /api/chat`
- 后端根据用户问题查询数据库
- 把相关数据拼到 prompt
- 调用模型返回结果
- 保存对话记录

这是最实用的。

---

## 第二版（增强）
- 支持历史会话
- 支持上下文裁剪
- 支持“数据来源”展示
- 支持失败重试

---

## 第三版（高级）
- 引入知识库/RAG
- 支持文档问答
- 支持流式输出
- 支持多轮推理和工具调用

---

# 十八、你这个场景的标准逻辑总结

我帮你浓缩成一句产品逻辑：

> **用户在 AI 对话页面输入问题后，前端通过 POST 将消息和会话ID提交给后端；后端基于当前登录用户身份，查询其专属业务数据/知识库内容，并结合历史会话构造 Prompt 调用大模型；模型返回结果后，后端保存消息记录并将最终回复返回前端展示。**

