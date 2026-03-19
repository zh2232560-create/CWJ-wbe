<template>
  <div class="chat-wrapper">
    <!-- 左侧历史记录 -->
    <aside class="chat-sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header">
        <button class="btn-new-chat" @click="startNewChat">+ 新建对话</button>
      </div>
      <div class="history-list">
        <div v-for="(chat, index) in historyChats" :key="index" class="history-item" :class="{ active: currentChatIndex === index }">
          <span class="icon">💬</span>
          <span class="title">{{ chat.title }}</span>
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
        <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.role]">
          <div class="avatar">{{ msg.role === 'user' ? '👤' : '蔡' }}</div>
          <div class="content">
            <div v-if="msg.role === 'ai'" class="markdown-body" v-html="msg.content"></div>
            <div v-else>{{ msg.content }}</div>
            
            <!-- 如果 AI 回复包含图表 -->
            <div v-if="msg.chart" class="chart-container" :id="'chart-' + index"></div>
            
            <!-- 深度链接按钮 -->
            <div v-if="msg.links" class="deep-links">
              <button v-for="link in msg.links" :key="link.label" class="btn-link" @click="$router.push(link.path)">
                👉 前往【{{ link.label }}】查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部交互区 -->
      <footer class="chat-footer">
        <div class="suggestion-chips">
          <button v-for="chip in suggestions" :key="chip" class="chip" @click="sendQuery(chip)">
            {{ chip }}
          </button>
        </div>
        <div class="input-area">
          <textarea 
            v-model="userInput" 
            placeholder="问问蔡文姬：哪个门店使用量最多？"
            @keydown.enter.prevent="handleEnter"
            rows="1"
          ></textarea>
          <button class="btn-send" :disabled="!userInput.trim()" @click="sendQuery()">发送</button>
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
      currentChatIndex: 0,
      userInput: '',
      historyChats: [
        { title: '昨天：关于华东区设备的排查' },
        { title: '上周：深圳门店客流分析' }
      ],
      messages: [],
      suggestions: [
        '💡 大悦城的运营情况？',
        '📈 目前哪个门店使用量最多？',
        '📍 南部大区有多少家门店？',
        '🔥 睡眠调理项目的平均温度？'
      ],
      mockResponses: {
        '📈 目前哪个门店使用量最多？': {
          content: '根据本周实时统计，<strong>深圳万象城店</strong>目前设备使用量最高，日均活跃时长达 12 小时。',
          chart: true,
          links: [{ label: '多维分析', path: '/analysis' }]
        }
      }
    };
  },
  methods: {
    startNewChat() {
      this.messages = [];
    },
    handleEnter(e) {
      if (!e.shiftKey) {
        this.sendQuery();
      }
    },
    async sendQuery(query) {
      const text = query || this.userInput;
      if (!text.trim()) return;

      this.messages.push({ role: 'user', content: text });
      this.userInput = '';
      this.scrollToBottom();

      // 模拟 AI 思考动画/延迟
      setTimeout(() => {
        this.handleAIResponse(text);
      }, 800);
    },
    handleAIResponse(query) {
      let responseMsg = { role: 'ai', content: '我正在为您分析全国门店的数据，请稍等...' };
      
      if (this.mockResponses[query]) {
        responseMsg = { role: 'ai', ...this.mockResponses[query] };
      } else {
        responseMsg = { role: 'ai', content: `收到您的提问：“${query}”。当前蔡文姬后端 API 正在接入中，目前已识别到：大悦城门店昨日运行平稳，异常率为 0%。` };
      }

      this.messages.push(responseMsg);
      this.scrollToBottom();

      // 如果有图表，等待 DOM 渲染后初始化
      if (responseMsg.chart) {
        this.$nextTick(() => {
          this.initMiniChart(this.messages.length - 1);
        });
      }
    },
    initMiniChart(index) {
      const chartDom = document.getElementById('chart-' + index);
      if (!chartDom) return;
      const myChart = echarts.init(chartDom);
      myChart.setOption({
        title: { text: '今日 TOP 5 门店排名', textStyle: { fontSize: 12 } },
        grid: { left: '15%', right: '5%', bottom: '20%', top: '25%' },
        xAxis: { type: 'category', data: ['深圳', '杭州', '上海', '北京', '广州'] },
        yAxis: { type: 'value' },
        series: [{ data: [120, 110, 95, 88, 70], type: 'bar', color: '#00ffff' }]
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        container.scrollTop = container.scrollHeight;
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
}

.chat-sidebar.collapsed { width: 0; overflow: hidden; }

.btn-new-chat {
  margin: 20px;
  padding: 12px;
  background: transparent;
  border: 1px dashed rgba(255,255,255,0.3);
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
}

.history-list { flex: 1; padding: 10px; }
.history-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  font-size: 14px;
}
.history-item:hover, .history-item.active { background: rgba(255,255,255,0.1); }

.chat-main { flex: 1; display: flex; flex-direction: column; position: relative; }

.chat-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
}

.chat-header h2 { font-size: 18px; flex: 1; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 40px 20% 20px;
}

.welcome-screen {
  text-align: center;
  margin-top: 10vh;
}

.avatar-large {
  width: 80px; height: 80px; background: #00ffff; color: #151932;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 40px; font-weight: bold; margin: 0 auto 20px;
}

.message-bubble {
  display: flex; gap: 15px; margin-bottom: 30px;
}

.message-bubble.user { flex-direction: row-reverse; }

.avatar {
  width: 36px; height: 36px; background: #eee; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}

.ai .avatar { background: #00ffff; color: #151932; font-weight: bold; font-size: 18px; }

.content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  line-height: 1.6;
}

.user .content { background: #007bff; color: #fff; }

.chart-container {
  height: 200px; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;
}

.deep-links { margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px; }
.btn-link {
  background: transparent; border: 1px solid #007bff; color: #007bff;
  padding: 5px 10px; border-radius: 15px; cursor: pointer; font-size: 12px;
}

.chat-footer {
  padding: 20px 20%;
  background: #fff;
  border-top: 1px solid #ddd;
}

.suggestion-chips {
  display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;
}

.chip {
  padding: 6px 12px; background: #f0f2f5; border: 1px solid #ddd;
  border-radius: 20px; font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.chip:hover { border-color: #007bff; color: #007bff; }

.input-area {
  display: flex; gap: 10px; background: #f8f9fa; padding: 10px; border-radius: 8px;
  border: 1px solid #ddd;
}

.input-area textarea {
  flex: 1; border: none; background: transparent; resize: none; outline: none; padding: 5px;
}

.btn-send {
  background: #007bff; color: #fff; border: none; padding: 0 20px; border-radius: 4px;
  cursor: pointer;
}
.btn-send:disabled { background: #ccc; }

.btn-close {
  padding: 5px 15px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;
}

@media (max-width: 1024px) {
  .chat-messages, .chat-footer { padding-left: 5%; padding-right: 5%; }
}
</style>
