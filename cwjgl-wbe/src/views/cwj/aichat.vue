<template>
  <div class="chat-wrapper">
    <!-- 左侧历史记录 -->
    <aside class="chat-sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header">
        <button class="btn-new-chat" @click="createNewSession">+ 新建对话</button>
      </div>
      <div class="history-list">
        <div 
          v-for="session in historySessions" 
          :key="session.id" 
          class="history-item" 
          :class="{ active: sessionId === session.id }"
          @click="switchSession(session.id)"
        >
          <span class="icon">💬</span>
          <span class="title">{{ session.title }}</span>
        </div>
      </div>
    </aside>

    <!-- 主对话区 -->
    <main class="chat-main">
      <header class="chat-header">
        <button class="toggle-sidebar" @click="isSidebarCollapsed = !isSidebarCollapsed">☰</button>
        <h2>蔡文姬 AI 运营助手</h2>
        <button class="btn-close" @click="$router.back()">退出</button>
      </header>

      <div class="chat-messages" ref="messageContainer">
        <!-- 欢迎界面 -->
        <div v-if="messages.length === 0" class="welcome-screen">
          <div class="avatar-large">蔡</div>
          <h1>您好，我是蔡文姬运营数据助理</h1>
          <p>我已经掌握了全国所有设备的实时运行情况与历史服务记录，您可以随时向我提问。</p>
        </div>

        <!-- 对话流 -->
        <div v-for="(msg, index) in messages" :key="msg.id" :class="['message-bubble', msg.role]">
          <div class="avatar">{{ msg.role === 'user' ? '👤' : '蔡' }}</div>
          <div class="content">
            <!-- 加载状态 -->
            <div v-if="msg.status === 'loading'" class="loading-text">
              <span class="spinner"></span> AI 正在生成中...
            </div>
            <!-- 错误状态 -->
            <div v-else-if="msg.status === 'error'" class="error-text">
              <span>❌ 请求失败：{{ msg.content }}</span>
              <button class="btn-retry" @click="retryMessage(index)">重试</button>
            </div>
            <!-- 正常内容 -->
            <div v-else>
              <div v-if="msg.role === 'ai'" class="markdown-body" v-html="msg.content"></div>
              <div v-else>{{ msg.content }}</div>
              
              <!-- 如果 AI 回复包含图表 -->
              <div v-if="msg.chart && msg.status === 'success'" class="chart-container" :id="'chart-' + msg.id"></div>
              
              <!-- 深度链接按钮 -->
              <div v-if="msg.links && msg.role === 'ai'" class="deep-links">
                <button v-for="link in msg.links" :key="link.label" class="btn-link" @click="$router.push(link.path)">
                  👉 前往【{{ link.label }}】查看详情
                </button>
              </div>

              <!-- 数据来源 -->
              <div v-if="msg.sources && msg.sources.length > 0" class="data-sources">
                <span class="source-label">数据来源：</span>
                <span v-for="(source, i) in msg.sources" :key="i" class="source-tag">{{ source }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部交互区 -->
      <footer class="chat-footer">
        <div class="suggestion-chips">
          <button v-for="chip in suggestions" :key="chip" class="chip" @click="sendQuery(chip)" :disabled="loading">
            {{ chip }}
          </button>
        </div>
        <div class="input-area">
          <textarea 
            v-model="userInput" 
            placeholder="问问蔡文姬：哪个门店使用量最多？"
            @keydown.enter.prevent="handleEnter"
            rows="1"
            :disabled="loading"
          ></textarea>
          <button class="btn-send" :disabled="!userInput.trim() || loading" @click="sendQuery()">
            {{ loading ? '发送中...' : '发送' }}
          </button>
        </div>
      </footer>
    </main>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'AIChat',
  data() {
    return {
      isSidebarCollapsed: false,
      sessionId: null,
      userInput: '',
      messages: [],
      loading: false,
      historySessions: [],
      suggestions: [
        '💡 大悦城的运营情况？',
        '📈 目前哪个门店使用量最多？',
        '📍 南部大区有多少家门店？',
        '🔥 睡眠调理项目的平均温度？'
      ],
      charts: {}
    };
  },

  async mounted() {
    // 创建新会话或读取历史会话
    await this.initSession();
    this.loadHistorySessions();
  },

  beforeUnmount() {
    // 销毁所有ECharts实例
    Object.values(this.charts).forEach(chart => chart?.dispose());
  },

  methods: {
    async initSession() {
      try {
        // 创建新会话
        const response = await fetch('/api/chat/session/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.code === 0) {
          this.sessionId = data.data.sessionId;
        }
      } catch (err) {
        console.error('Failed to create session:', err);
        // 降级处理：生成本地 sessionId
        this.sessionId = 'session_' + Date.now();
      }
    },

    async createNewSession() {
      await this.initSession();
      this.messages = [];
      this.userInput = '';
      this.loadHistorySessions();
    },

    async switchSession(sessionId) {
      this.sessionId = sessionId;
      await this.loadSessionMessages(sessionId);
    },

    async loadHistorySessions() {
      try {
        const response = await fetch('/api/chat/sessions', {
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.code === 0) {
          this.historySessions = data.data.sessions || [];
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
      }
    },

    async loadSessionMessages(sessionId) {
      try {
        const response = await fetch(`/api/chat/history?sessionId=${sessionId}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.code === 0) {
          this.messages = data.data.messages || [];
          this.scrollToBottom();
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    },

    handleEnter(e) {
      if (!e.shiftKey && !this.loading) {
        this.sendQuery();
      }
    },

    async sendQuery(query) {
      const text = query || this.userInput;
      if (!text.trim() || this.loading) return;

      // 添加用户消息
      const userMsg = {
        id: 'msg_' + Date.now() + '_user',
        role: 'user',
        content: text,
        status: 'success',
        timestamp: new Date().toLocaleTimeString()
      };
      this.messages.push(userMsg);
      this.userInput = '';
      this.scrollToBottom();

      // 添加 AI 占位消息
      const aiMsg = {
        id: 'msg_' + Date.now() + '_assistant',
        role: 'assistant',  // 标准化使用 'assistant' 角色
        content: '🤖 蔡文姬正在思考...',
        status: 'loading',
        sources: [],
        timestamp: new Date().toLocaleTimeString()
      };
      this.messages.push(aiMsg);
      this.loading = true;

      try {
        console.log(`📤 Sending chat request: "${text}"`);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            message: text,
            context: {
              page: 'aichat',
              timestamp: new Date().toISOString()
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`📥 Response received:`, data);

        if (data.code === 0 && data.data) {
          // 更新 AI 消息 - 使用最后一条消息
          const lastMsg = this.messages[this.messages.length - 1];
          lastMsg.content = data.data.reply || '（无响应）';
          lastMsg.status = 'success';
          lastMsg.sources = data.data.sources || [];
          lastMsg.timestamp = new Date().toLocaleTimeString();
          
          // 记录token使用（用于后续统计）
          if (data.data.usage) {
            console.log(`✅ Tokens used: ${data.data.usage.total_tokens || '未知'}`);
          }

          // 刷新会话历史列表
          await this.loadHistorySessions();
          console.log('✅ Chat completed successfully');
        } else {
          // API返回错误
          const lastMsg = this.messages[this.messages.length - 1];
          lastMsg.status = 'error';
          lastMsg.content = `❌ ${data.msg || '请求失败'}`;
          console.error('API Error:', data.msg);
        }
      } catch (err) {
        console.error('❌ Chat request error:', err);
        const lastMsg = this.messages[this.messages.length - 1];
        lastMsg.status = 'error';
        lastMsg.content = `❌ 请求失败: ${err.message}`;
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    async retryMessage(index) {
      // 获取倒数第二条消息（应当是用户的提问）
      if (index > 0) {
        const userMsg = this.messages[index - 1];
        if (userMsg && userMsg.role === 'user') {
          // 移除失败的消息
          this.messages.splice(index, 1);
          // 重新发送
          await this.sendQuery(userMsg.content);
        }
      }
    },

    initMiniChart(msgId, chartData) {
      return; // 图表功能可选，暂不实现
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }
};
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  color: #333;
}

.chat-sidebar {
  width: 260px;
  background: #151932;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-sidebar.collapsed {
  width: 0;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-new-chat {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-new-chat:hover {
  border-color: #00ffff;
  color: #00ffff;
}

.history-list {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  font-size: 13px;
  margin-bottom: 5px;
  transition: background 0.2s;
}

.history-item:hover,
.history-item.active {
  background: rgba(0, 255, 255, 0.2);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.toggle-sidebar {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;
}

.chat-header h2 {
  font-size: 18px;
  margin: 0;
  flex: 1;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 40px 15%;
  padding-bottom: 20px;
}

.welcome-screen {
  text-align: center;
  margin-top: 10vh;
}

.avatar-large {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #00ffff, #0080ff);
  color: #151932;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  margin: 0 auto 20px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
}

.message-bubble {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in;
}

.message-bubble.user {
  flex-direction: row-reverse;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.avatar {
  width: 40px;
  height: 40px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-bubble.ai .avatar {
  background: linear-gradient(135deg, #00ffff, #0080ff);
  color: #151932;
  font-weight: bold;
  font-size: 18px;
}

.content {
  max-width: 65%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  line-height: 1.6;
  word-break: break-word;
}

.message-bubble.user .content {
  background: #007bff;
  color: #fff;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-text {
  color: #dc3545;
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-retry {
  padding: 4px 12px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.chart-container {
  height: 250px;
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.deep-links {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-link {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-link:hover {
  background: #007bff;
  color: #fff;
}

.data-sources {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.source-label {
  font-weight: bold;
}

.source-tag {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 12px;
}

.chat-footer {
  padding: 20px 15%;
  background: #fff;
  border-top: 1px solid #ddd;
}

.suggestion-chips {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 12px;
  background: #f0f2f5;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  border-color: #007bff;
  color: #007bff;
}

.chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-area {
  display: flex;
  gap: 10px;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.input-area textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  padding: 5px;
  font-family: inherit;
  font-size: 14px;
  max-height: 100px;
}

.input-area textarea:disabled {
  opacity: 0.6;
}

.btn-send {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-send:hover:not(:disabled) {
  background: #0056b3;
}

.btn-send:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-close {
  padding: 6px 15px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e9ecef;
}

@media (max-width: 1200px) {
  .chat-messages {
    padding-left: 8%;
    padding-right: 8%;
  }
  .chat-footer {
    padding-left: 8%;
    padding-right: 8%;
  }
}

@media (max-width: 768px) {
  .chat-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  }
  .chat-sidebar.collapsed {
    transform: translateX(-100%);
  }
  .content {
    max-width: 85%;
  }
}
</style>
