<template>
  <div class="dashboard-body">
    <!-- 背景动画 -->
    <div class="bg-grid"></div>

    <div class="dashboard-container">
      <!-- 顶部栏 -->
      <div class="dashboard-header">
        <div class="header-left">
          <div class="time-display">{{ currentTime }}</div>
        </div>
        <div class="header-center">
          <h1>蔡文姬监控大屏 (Dashboard)</h1>
        </div>
        <div class="header-right">
          <div class="filter-controls">
            <select v-model="filters.region" @change="fetchData">
              <option value="">全部地区</option>
              <option value="east">东部大区</option>
              <option value="west">西部大区</option>
              <option value="north">北部大区</option>
              <option value="south">南部大区</option>
            </select>
            <button class="btn-analysis" @click="$router.push('/analysis')">智能报告</button>
            <button class="btn-back" @click="$router.push('/admin')">返回管理后台</button>
          </div>
        </div>
      </div>

      <!-- 核心 KPI 指标卡 -->
      <div class="kpi-container">
        <div class="kpi-card">
          <div class="kpi-label">累计服务总单量</div>
          <div class="kpi-value">{{ kpi.totalOrders }}</div>
          <div class="kpi-trend up">↑ 12.5%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">设备总台数</div>
          <div class="kpi-value">{{ stats.total_device_count }}</div>
          <div class="kpi-sub-label">在线率: {{ activationRate }}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">平均服务时长</div>
          <div class="kpi-value">{{ kpi.avgDuration }}<span class="unit">min</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">本周最受欢迎</div>
          <div class="kpi-value" style="font-size: 1.5rem">{{ kpi.popularProject }}</div>
        </div>
      </div>

      <!-- 可视化图表区 -->
      <div class="charts-grid">
        <div class="chart-box main-chart">
          <div class="chart-title">24小时服务趋势</div>
          <div ref="trendChart" class="chart-content"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">地区使用排行 (TOP 5)</div>
          <div ref="rankChart" class="chart-content"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">理疗项目偏好占比</div>
          <div ref="pieChart" class="chart-content"></div>
        </div>
      </div>

      <!-- 底部监控看板 -->
      <div class="bottom-container">
        <div class="monitor-box heatmap-gallery">
          <div class="chart-title">实时热力图画廊</div>
          <div class="heatmap-list">
            <div v-for="i in 4" :key="i" class="heatmap-item">
              <div class="heatmap-placeholder">
                <div class="thermal-sim"></div>
              </div>
              <div class="heatmap-info">项目: {{ ['睡眠调理', '肩颈放松', '腰部舒缓', '全身按摩'][i-1] }}</div>
              <div class="heatmap-device">设备: CWJ-00{{ i }}</div>
            </div>
          </div>
        </div>
        <div class="monitor-box status-carousel">
          <div class="chart-title">物流与状态轮播</div>
          <div class="carousel-content">
            <div class="carousel-list" :style="{ transform: `translateY(-${carouselIndex * 40}px)` }">
              <div v-for="(log, index) in statusLogs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-msg">{{ log.msg }}</span>
                <span :class="['log-status', log.type]">{{ log.statusText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 助手悬浮球 -->
    <div class="ai-fab-dashboard" @click="$router.push('/aichat')" title="蔡文姬 AI 助手">
      <div class="ai-icon">蔡</div>
      <div class="pulsing-ring"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import cwjAPI from '@/api/cwj'

export default {
  name: 'Dashboard',
  data() {
    return {
      currentTime: '',
      timer: null,
      carouselIndex: 0,
      carouselTimer: null,
      stats: {
        total_device_count: 0,
        pending: 0,
        shipping: 0,
        deployed: 0,
        error: 0,
      },
      kpi: {
        totalOrders: 12840,
        avgDuration: 45,
        popularProject: '睡眠调理',
      },
      filters: {
        region: '',
      },
      statusLogs: [
        { time: '10:25:30', msg: '设备 CWJ-8821 已成功部署于 杭州万达店', statusText: '已部署', type: 'success' },
        { time: '10:20:15', msg: '设备 CWJ-7732 正在从 深圳仓 发往 上海南京路店', statusText: '运输中', type: 'info' },
        { time: '10:15:00', msg: '设备 CWJ-9910 维修申请已受理', statusText: '返修', type: 'warning' },
        { time: '10:10:45', msg: '设备 CWJ-6654 环境检测异常，请留意', statusText: '巡查', type: 'error' },
        { time: '10:05:22', msg: '设备 CWJ-5501 已签收完毕', statusText: '已部署', type: 'success' },
      ],
      charts: {
        trend: null,
        rank: null,
        pie: null,
      },
    }
  },
  computed: {
    activationRate() {
      if (!this.stats.total_device_count) return 0
      return ((this.stats.deployed / this.stats.total_device_count) * 100).toFixed(1)
    },
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
    this.fetchData()
    this.initCharts()
    this.startCarousel()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    clearInterval(this.timer)
    clearInterval(this.carouselTimer)
    window.removeEventListener('resize', this.handleResize)
    Object.values(this.charts).forEach(chart => chart?.dispose())
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString()
    },
    async fetchData() {
      try {
        const response = await cwjAPI.getdevicelist({ limit: 100 })
        if (response.status === 200) {
          const statsSource = response.data.statistics || {}
          this.stats.total_device_count = statsSource.total_device_count || 0
          this.stats.pending = statsSource.pending_shipment_count ?? 0
          this.stats.shipping = statsSource.shipped_not_received_count ?? 0
          this.stats.deployed = statsSource.deployed_count ?? 0
          this.stats.error = statsSource.exception_count ?? 0
        }
      } catch (err) {
        console.error('Fetch statistics failed', err)
      }
    },
    startCarousel() {
      this.carouselTimer = setInterval(() => {
        this.carouselIndex = (this.carouselIndex + 1) % this.statusLogs.length
      }, 3000)
    },
    initCharts() {
      // 24小时趋势图
      this.charts.trend = echarts.init(this.$refs.trendChart)
      this.charts.trend.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(15, 20, 35, 0.9)',
          borderColor: '#00ffff',
          textStyle: { color: '#e0e6ed' },
          axisPointer: {
            type: 'cross',
            label: { backgroundColor: '#6a7985' }
          }
        },
        legend: {
          data: ['订单量', '满载率'],
          textStyle: { color: '#e0e6ed' },
          top: '5%'
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          axisLine: { lineStyle: { color: '#8b92a9' } },
          axisLabel: {
            interval: 1, // 隔一个显示一个标签，避免拥挤
            color: '#8b92a9'
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '订单量',
            nameTextStyle: { color: '#00ffff' },
            position: 'left',
            axisLine: { show: true, lineStyle: { color: '#00ffff' } },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } }
          },
          {
            type: 'value',
            name: '满载率',
            nameTextStyle: { color: '#0080ff' },
            min: 0,
            max: 100,
            position: 'right',
            axisLine: { show: true, lineStyle: { color: '#0080ff' } },
            axisLabel: { formatter: '{value}%' },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: '订单量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 255, 255, 0.3)' },
                { offset: 1, color: 'rgba(0, 255, 255, 0)' }
              ])
            },
            data: [
              120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330, 310, 201, 154, 190, 330,
              410, 350, 280, 250, 180, 150, 130
            ],
            itemStyle: { color: '#00ffff' }
          },
          {
            name: '满载率',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'diamond',
            symbolSize: 8,
            lineStyle: { width: 3, type: 'dashed' },
            data: [
              45, 48, 40, 52, 38, 70, 65, 58, 60, 68, 75, 82, 80, 55, 48, 55, 80, 92, 85, 75, 70, 60,
              50, 48
            ],
            itemStyle: { color: '#0080ff' }
          }
        ]
      })

      // 地区排行
      this.charts.rank = echarts.init(this.$refs.rankChart)
      this.charts.rank.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', axisLine: { lineStyle: { color: '#8b92a9' } } },
        yAxis: {
          type: 'category',
          data: ['杭州', '上海', '深圳', '北京', '广州'],
          axisLine: { lineStyle: { color: '#e0e6ed' } }
        },
        series: [
          {
            name: '利用率',
            type: 'bar',
            data: [85, 82, 78, 75, 72],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#0080ff' },
                { offset: 1, color: '#00ffff' }
              ])
            }
          }
        ]
      })

      // 饼图
      this.charts.pie = echarts.init(this.$refs.pieChart)
      this.charts.pie.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '5%', textStyle: { color: '#e0e6ed' } },
        series: [
          {
            name: '项目占比',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#151932', borderWidth: 2 },
            label: { show: false },
            data: [
              { value: 1048, name: '睡眠调理' },
              { value: 735, name: '肩颈放松' },
              { value: 580, name: '腰部舒缓' },
              { value: 484, name: '全身按摩' },
              { value: 300, name: '新客体验' }
            ]
          }
        ]
      })
    },
    handleResize() {
      Object.values(this.charts).forEach(chart => chart?.resize())
    }
  }
}
</script>

<style scoped>
.dashboard-body {
  background: #0a0e27;
  color: #e0e6ed;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  position: relative;
}

.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 0;
}

.dashboard-container {
  padding: 20px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.2);
  padding-bottom: 10px;
}

.header-center h1 {
  font-size: 2rem;
  background: linear-gradient(to right, #00ffff, #0080ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.time-display {
  font-family: 'Courier New', Courier, monospace;
  color: #00ffff;
  font-size: 1.2rem;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-controls select {
  background: rgba(0, 255, 255, 0.1);
  color: #fff;
  border: 1px solid #00ffff;
  padding: 5px 10px;
  border-radius: 4px;
}

.btn-back {
  background: linear-gradient(135deg, #0080ff, #00ffff);
  border: none;
  color: white;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-analysis {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-analysis:hover {
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.kpi-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.kpi-card {
  background: rgba(25, 30, 50, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

.kpi-label {
  color: #8b92a9;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #00ffff;
}

.kpi-trend.up { color: #00ff00; font-size: 0.8rem; }

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.chart-box {
  background: rgba(25, 30, 50, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.chart-title {
  padding: 10px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  color: #00ffff;
  font-weight: bold;
}

.chart-content {
  flex: 1;
  min-height: 200px;
}

.bottom-container {
  display: grid;
  grid-template-columns: 2fr 1.5fr;
  gap: 20px;
  margin-top: 20px;
  height: 200px;
}

.monitor-box {
  background: rgba(25, 30, 50, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
}

.heatmap-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px;
}

.heatmap-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 5px;
  border-radius: 4px;
}

.heatmap-placeholder {
  height: 80px;
  background: #000;
  margin-bottom: 5px;
  position: relative;
  overflow: hidden;
}

.thermal-sim {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #ff0000 0%, #ffff00 30%, #00ff00 60%, #0000ff 100%);
  opacity: 0.6;
}

.heatmap-info, .heatmap-device {
  font-size: 0.7rem;
  color: #8b92a9;
}

.carousel-content {
  height: 150px;
  overflow: hidden;
  padding: 10px;
}

.carousel-list {
  transition: transform 0.5s ease-in-out;
}

.log-item {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
}

.log-time { color: #8b92a9; }
.log-msg { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log-status { padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; }
.log-status.success { background: #00ff0033; color: #00ff00; }
.log-status.info { background: #0080ff33; color: #0080ff; }
.log-status.warning { background: #ffa50033; color: #ffa500; }
.log-status.error { background: #ff444433; color: #ff4444; }

@media (max-width: 1200px) {
  .charts-grid { grid-template-columns: 1fr 1fr; }
  .main-chart { grid-column: span 2; }
}

/* AI 悬浮球样式 (针对大屏界面优化) */
.ai-fab-dashboard {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 60px;
  height: 60px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid #00ffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s;
}

.ai-fab-dashboard .ai-icon {
  font-size: 24px;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.ai-fab-dashboard:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: scale(1.1);
}

.pulsing-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid #00ffff;
  border-radius: 50%;
  animation: ripple 2s infinite ease-out;
  opacity: 0;
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2); opacity: 0; }
}
</style>
