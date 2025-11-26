<template>
  <div class="health-monitor-container">
    <div class="container">
      <header>
        <h1>🌙 智能枕头健康监控系统</h1>
        <div class="status-bar">
          <div class="status-item">
            <div class="status-dot" :class="{ 'status-dot-active': isRunning }"></div>
            <span>{{ isRunning ? '设备在线' : '设备离线' }}</span>
          </div>
          <div class="status-item">
            <!-- <span>{{ dataTime }}</span> -->
          </div>
          <div class="status-item">
            <!-- <span>运行时间: {{ elapsedTime }}</span> -->
          </div>
          <div class="status-item">
            <!-- <span>剩余时间: {{ remainingTime }}</span> -->
          </div>
        </div>
      </header>

      <div class="metrics-grid">
        <!-- 指标卡片保持不变 -->
        <div
          class="metric-card"
          style="--glow-color: #ff6b6b; --value-color-1: #ff6b6b; --value-color-2: #ff8e8e"
        >
          <div class="metric-label">心率</div>
          <div class="metric-value">
            <span>{{ heartRate }}</span>
            <span class="metric-unit">BPM</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${heartRateProgress}%` }"></div>
          </div>
        </div>

        <div
          class="metric-card"
          style="--glow-color: #4ecdc4; --value-color-1: #4ecdc4; --value-color-2: #44a8a0"
        >
          <div class="metric-label">呼吸频率</div>
          <div class="metric-value">
            <span>{{ breathRate }}</span>
            <span class="metric-unit">次/分</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${breathRateProgress}%` }"></div>
          </div>
        </div>

        <div
          class="metric-card"
          style="--glow-color: #a29bfe; --value-color-1: #a29bfe; --value-color-2: #6c5ce7"
        >
          <div class="metric-label">睡眠质量</div>
          <div class="metric-value">
            <span>{{ sleepQuality }}</span>
            <span class="metric-unit">分</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${sleepQualityProgress}%` }"></div>
          </div>
        </div>

        <div
          class="metric-card"
          style="--glow-color: #00d4ff; --value-color-1: #00d4ff; --value-color-2: #7b2ff7"
        >
          <div class="metric-label">睡眠阶段</div>
          <div class="metric-value" style="font-size: 1.8em">
            <span>{{ sleepStage }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${signalQualityProgress}%` }"></div>
          </div>
        </div>

        <div
          class="metric-card"
          style="--glow-color: #ffeaa7; --value-color-1: #ffeaa7; --value-color-2: #fdcb6e"
        >
          <div class="metric-label">呼吸振幅</div>
          <div class="metric-value">
            <span>{{ breathAmplitude }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${breathAmplitudeProgress}%` }"></div>
          </div>
        </div>

        <div
          class="metric-card"
          style="--glow-color: #fd79a8; --value-color-1: #fd79a8; --value-color-2: #e84393"
        >
          <div class="metric-label">运动强度</div>
          <div class="metric-value">
            <span>{{ movement }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${movementProgress}%` }"></div>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-title">📊 心率与呼吸监测</div>
        <div id="vitalSignsChart" class="chart" ref="vitalSignsChart"></div>
      </div>

      <div class="charts-row">
        <div class="chart-container">
          <div class="chart-title">💤 睡眠质量趋势</div>
          <div id="sleepQualityChart" class="chart" ref="sleepQualityChart"></div>
        </div>

        <div class="chart-container">
          <div class="chart-title">📈 信号质量与置信度</div>
          <div id="confidenceChart" class="chart" ref="confidenceChart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'HealthMonitor',
  setup() {
    // ========== 可配置参数 ==========
    const CONFIG = {
      // 数据采集总时长（分钟）- 修改这个值来调整运行时间
      TOTAL_DURATION: 10,

      // 数据更新频率（毫秒）- 修改这个值来调整数据更新速度
      UPDATE_INTERVAL: 1000,

      // 图表显示的数据点数 - 修改这个值来调整图表显示的数据量
      MAX_DATA_POINTS: 60,

      // 初始数据范围
      DATA_RANGE: {
        heartRate: { min: 40, max: 100 },
        breathRate: { min: 12, max: 30 },
        sleepQuality: { min: 70, max: 99 },
        breathAmplitude: { min: 150, max: 300 },
        movement: { min: 0, max: 20 },
      },
    }

    // 响应式数据
    const dataTime = ref('数据采集中...')
    const heartRate = ref(0)
    const heartRateProgress = ref(0)
    const breathRate = ref(0)
    const breathRateProgress = ref(0)
    const sleepQuality = ref(0)
    const sleepQualityProgress = ref(0)
    const sleepStage = ref('检测中')
    const signalQualityProgress = ref(0)
    const breathAmplitude = ref(0)
    const breathAmplitudeProgress = ref(0)
    const movement = ref(0)
    const movementProgress = ref(0)

    // 控制参数
    const isRunning = ref(false)
    const elapsedTime = ref('00:00')
    const remainingTime = ref('00:00')
    const startTime = ref(null)
    const totalDurationMs = CONFIG.TOTAL_DURATION * 60 * 1000

    // 图表引用
    const vitalSignsChart = ref(null)
    const sleepQualityChart = ref(null)
    const confidenceChart = ref(null)

    // 图表实例
    let vitalSignsChartInstance = null
    let sleepQualityChartInstance = null
    let confidenceChartInstance = null

    // 定时器ID
    let intervalId = null
    let timerId = null

    // 数据存储
    const healthData = ref([])

    // 睡眠阶段映射
    const sleepStageMap = {
      deep: '深度睡眠',
      light: '浅度睡眠',
      rem: '快速眼动',
      awake: '清醒',
    }

    // 睡眠阶段权重（用于更真实地模拟睡眠阶段变化）
    const sleepStageWeights = {
      deep: 0.25,
      light: 0.55,
      rem: 0.15,
      awake: 0.05,
    }

    // 生成单个数据点
    function generateDataPoint(timestamp, timeInMinutes) {
      const baseVariance = Math.random() * 0.3 - 0.15 // ±15% 基础变化
      const trendVariance = Math.sin(timestamp / 60000) * 0.1 // 基于时间的趋势变化
      const totalVariance = baseVariance + trendVariance

      // 根据时间模拟更真实的睡眠阶段
      let sleepStageProbabilities = { ...sleepStageWeights }

      // 随时间调整睡眠阶段概率
      if (timeInMinutes < 5) {
        // 前5分钟更可能清醒或浅睡
        sleepStageProbabilities = { deep: 0.1, light: 0.6, rem: 0.1, awake: 0.2 }
      } else if (timeInMinutes < 20) {
        // 进入深度睡眠阶段
        sleepStageProbabilities = { deep: 0.4, light: 0.5, rem: 0.08, awake: 0.02 }
      } else if (timeInMinutes < 40) {
        // REM睡眠阶段
        sleepStageProbabilities = { deep: 0.2, light: 0.5, rem: 0.25, awake: 0.05 }
      } else {
        // 浅睡和REM交替
        sleepStageProbabilities = { deep: 0.15, light: 0.6, rem: 0.2, awake: 0.05 }
      }

      // 根据概率选择睡眠阶段
      const rand = Math.random()
      let cumulative = 0
      let selectedStage = 'light'
      for (const [stage, prob] of Object.entries(sleepStageProbabilities)) {
        cumulative += prob
        if (rand <= cumulative) {
          selectedStage = stage
          break
        }
      }

      return {
        timestamp: timestamp,
        breathing_rate: Math.round(
          CONFIG.DATA_RANGE.breathRate.min +
            (CONFIG.DATA_RANGE.breathRate.max - CONFIG.DATA_RANGE.breathRate.min) *
              (0.5 + totalVariance * 0.5),
        ),
        heart_rate: Math.round(
          CONFIG.DATA_RANGE.heartRate.min +
            (CONFIG.DATA_RANGE.heartRate.max - CONFIG.DATA_RANGE.heartRate.min) *
              (0.5 + totalVariance * 0.5),
        ),
        movement: Math.random() > 0.9,
        movement_intensity:
          CONFIG.DATA_RANGE.movement.min +
          (CONFIG.DATA_RANGE.movement.max - CONFIG.DATA_RANGE.movement.min) * Math.random(),
        sleep_stage: selectedStage,
        signal_quality: Math.round(6 + totalVariance * 6),
        vibration_count: 0,
        breath_amplitude:
          CONFIG.DATA_RANGE.breathAmplitude.min +
          (CONFIG.DATA_RANGE.breathAmplitude.max - CONFIG.DATA_RANGE.breathAmplitude.min) *
            (0.5 + totalVariance * 0.5),
        breath_regularity: Math.max(0.8, 1 - Math.abs(totalVariance) * 0.5),
        sleep_quality_score:
          CONFIG.DATA_RANGE.sleepQuality.min +
          (CONFIG.DATA_RANGE.sleepQuality.max - CONFIG.DATA_RANGE.sleepQuality.min) *
            (0.8 - Math.abs(totalVariance) * 0.3),
        heart_rate_confidence: Math.round(30 + totalVariance * 30),
        breath_rate_confidence: Math.round(20 + totalVariance * 20),
      }
    }

    // 配置图表
    const commonOption = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
        },
      },
    }

    // 初始化图表
    function initCharts() {
      vitalSignsChartInstance = echarts.init(vitalSignsChart.value)
      sleepQualityChartInstance = echarts.init(sleepQualityChart.value)
      confidenceChartInstance = echarts.init(confidenceChart.value)

      vitalSignsChartInstance.setOption({
        ...commonOption,
        legend: {
          data: ['心率', '呼吸频率'],
          textStyle: { color: '#fff' },
          top: 0,
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
          axisLabel: {
            color: '#fff',
            formatter: function (value) {
              // 将秒数转换为更友好的时间格式
              const seconds = parseInt(value)
              if (seconds < 60) return `${seconds}s`
              const minutes = Math.floor(seconds / 60)
              const remainingSeconds = seconds % 60
              return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
          axisLabel: { color: '#fff' },
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
        },
        series: [
          {
            name: '心率',
            type: 'line',
            smooth: true,
            data: [],
            lineStyle: {
              color: '#ff6b6b',
              width: 3,
              shadowColor: 'rgba(255, 107, 107, 0.5)',
              shadowBlur: 10,
            },
            itemStyle: { color: '#ff6b6b' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
                  { offset: 1, color: 'rgba(255, 107, 107, 0)' },
                ],
              },
            },
          },
          {
            name: '呼吸频率',
            type: 'line',
            smooth: true,
            data: [],
            lineStyle: {
              color: '#4ecdc4',
              width: 3,
              shadowColor: 'rgba(78, 205, 196, 0.5)',
              shadowBlur: 10,
            },
            itemStyle: { color: '#4ecdc4' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(78, 205, 196, 0.3)' },
                  { offset: 1, color: 'rgba(78, 205, 196, 0)' },
                ],
              },
            },
          },
        ],
      })

      sleepQualityChartInstance.setOption({
        ...commonOption,
        legend: {
          data: ['睡眠质量', '呼吸规律性'],
          textStyle: { color: '#fff' },
          top: 0,
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
          axisLabel: {
            color: '#fff',
            formatter: function (value) {
              // 将秒数转换为更友好的时间格式
              const seconds = parseInt(value)
              if (seconds < 60) return `${seconds}s`
              const minutes = Math.floor(seconds / 60)
              const remainingSeconds = seconds % 60
              return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
            },
          },
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
          axisLabel: { color: '#fff' },
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
        },
        series: [
          {
            name: '睡眠质量',
            type: 'line',
            smooth: true,
            data: [],
            lineStyle: {
              color: '#a29bfe',
              width: 3,
              shadowColor: 'rgba(162, 155, 254, 0.5)',
              shadowBlur: 10,
            },
            itemStyle: { color: '#a29bfe' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(162, 155, 254, 0.3)' },
                  { offset: 1, color: 'rgba(162, 155, 254, 0)' },
                ],
              },
            },
          },
          {
            name: '呼吸规律性',
            type: 'line',
            smooth: true,
            data: [],
            lineStyle: {
              color: '#00d4ff',
              width: 3,
              shadowColor: 'rgba(0, 212, 255, 0.5)',
              shadowBlur: 10,
            },
            itemStyle: { color: '#00d4ff' },
          },
        ],
      })

      confidenceChartInstance.setOption({
        ...commonOption,
        legend: {
          data: ['心率置信度', '呼吸置信度', '信号质量'],
          textStyle: { color: '#fff' },
          top: 0,
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
          axisLabel: {
            color: '#fff',
            formatter: function (value) {
              // 将秒数转换为更友好的时间格式
              const seconds = parseInt(value)
              if (seconds < 60) return `${seconds}s`
              const minutes = Math.floor(seconds / 60)
              const remainingSeconds = seconds % 60
              return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
          axisLabel: { color: '#fff' },
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
        },
        series: [
          {
            name: '心率置信度',
            type: 'bar',
            data: [],
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#ff6b6b' },
                  { offset: 1, color: '#ff8e8e' },
                ],
              },
            },
          },
          {
            name: '呼吸置信度',
            type: 'bar',
            data: [],
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#4ecdc4' },
                  { offset: 1, color: '#44a8a0' },
                ],
              },
            },
          },
          {
            name: '信号质量',
            type: 'line',
            smooth: true,
            data: [],
            lineStyle: { color: '#ffeaa7', width: 3 },
            itemStyle: { color: '#ffeaa7' },
          },
        ],
      })
    }

    // 生成时间标签
    function generateTimeLabels(startTime, count) {
      const labels = []
      for (let i = 0; i < count; i++) {
        labels.push(`${startTime + i}s`)
      }
      return labels
    }

    // 更新仪表板
    function updateDashboard() {
      const currentTimestamp = Date.now()
      const timeInMinutes = (currentTimestamp - startTime.value) / 60000
      const data = generateDataPoint(currentTimestamp, timeInMinutes)

      // 添加新数据点
      healthData.value.push(data)

      // 如果数据点超过最大值，移除最旧的数据
      if (healthData.value.length > CONFIG.MAX_DATA_POINTS) {
        healthData.value.shift()
      }

      // 更新指标卡片
      heartRate.value = data.heart_rate
      heartRateProgress.value =
        ((data.heart_rate - CONFIG.DATA_RANGE.heartRate.min) /
          (CONFIG.DATA_RANGE.heartRate.max - CONFIG.DATA_RANGE.heartRate.min)) *
        100

      breathRate.value = data.breathing_rate
      breathRateProgress.value =
        ((data.breathing_rate - CONFIG.DATA_RANGE.breathRate.min) /
          (CONFIG.DATA_RANGE.breathRate.max - CONFIG.DATA_RANGE.breathRate.min)) *
        100

      sleepQuality.value = data.sleep_quality_score.toFixed(1)
      sleepQualityProgress.value =
        ((data.sleep_quality_score - CONFIG.DATA_RANGE.sleepQuality.min) /
          (CONFIG.DATA_RANGE.sleepQuality.max - CONFIG.DATA_RANGE.sleepQuality.min)) *
        100

      sleepStage.value = sleepStageMap[data.sleep_stage]
      signalQualityProgress.value = (data.signal_quality / 10) * 100

      breathAmplitude.value = data.breath_amplitude.toFixed(1)
      breathAmplitudeProgress.value =
        ((data.breath_amplitude - CONFIG.DATA_RANGE.breathAmplitude.min) /
          (CONFIG.DATA_RANGE.breathAmplitude.max - CONFIG.DATA_RANGE.breathAmplitude.min)) *
        100

      movement.value = data.movement_intensity.toFixed(1)
      movementProgress.value =
        ((data.movement_intensity - CONFIG.DATA_RANGE.movement.min) /
          (CONFIG.DATA_RANGE.movement.max - CONFIG.DATA_RANGE.movement.min)) *
        100

      dataTime.value = `已采集 ${healthData.value.length} 个数据点`

      // 计算当前时间窗口的起始时间
      const elapsedSeconds = Math.floor((currentTimestamp - startTime.value) / 1000)
      const startSecond = Math.max(0, elapsedSeconds - CONFIG.MAX_DATA_POINTS + 1)

      // 生成时间标签 - 始终显示最近60个时间点
      const timeLabels = generateTimeLabels(startSecond, healthData.value.length)

      // 更新生命体征图表
      vitalSignsChartInstance.setOption({
        xAxis: {
          data: timeLabels,
        },
        series: [
          {
            data: healthData.value.map((d) => d.heart_rate),
          },
          {
            data: healthData.value.map((d) => d.breathing_rate),
          },
        ],
      })

      // 更新睡眠质量图表
      sleepQualityChartInstance.setOption({
        xAxis: {
          data: timeLabels,
        },
        series: [
          {
            data: healthData.value.map((d) => d.sleep_quality_score),
          },
          {
            data: healthData.value.map((d) => d.breath_regularity * 100),
          },
        ],
      })

      // 更新置信度图表
      confidenceChartInstance.setOption({
        xAxis: {
          data: timeLabels,
        },
        series: [
          {
            data: healthData.value.map((d) => d.heart_rate_confidence),
          },
          {
            data: healthData.value.map((d) => d.breath_rate_confidence),
          },
          {
            data: healthData.value.map((d) => d.signal_quality * 10),
          },
        ],
      })
    }

    // 开始数据采集
    function startDataCollection() {
      if (isRunning.value) return

      // 重置数据
      healthData.value = []
      isRunning.value = true
      startTime.value = Date.now()

      // 开始定时器
      intervalId = setInterval(updateDashboard, CONFIG.UPDATE_INTERVAL)

      // 设置停止定时器
      setTimeout(() => {
        stopDataCollection()
        dataTime.value = `数据采集完成，共运行 ${CONFIG.TOTAL_DURATION} 分钟`
      }, totalDurationMs)

      // 更新运行时间显示
      timerId = setInterval(() => {
        const elapsed = Date.now() - startTime.value
        const remaining = Math.max(0, totalDurationMs - elapsed)

        // 更新已运行时间
        const minutesElapsed = Math.floor(elapsed / 60000)
        const secondsElapsed = Math.floor((elapsed % 60000) / 1000)
        elapsedTime.value = `${minutesElapsed.toString().padStart(2, '0')}:${secondsElapsed.toString().padStart(2, '0')}`

        // 更新剩余时间
        const minutesRemaining = Math.floor(remaining / 60000)
        const secondsRemaining = Math.floor((remaining % 60000) / 1000)
        remainingTime.value = `${minutesRemaining.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`
      }, 1000)
    }

    // 停止数据采集
    function stopDataCollection() {
      isRunning.value = false
      clearInterval(intervalId)
      clearInterval(timerId)
    }

    // 响应式图表
    function handleResize() {
      vitalSignsChartInstance.resize()
      sleepQualityChartInstance.resize()
      confidenceChartInstance.resize()
    }

    onMounted(() => {
      // 确保echarts已加载
      if (typeof echarts === 'undefined') {
        console.error('ECharts not loaded')
        return
      }

      initCharts()

      // 自动开始数据采集
      setTimeout(() => {
        startDataCollection()
      }, 1000)

      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      // 清除定时器
      stopDataCollection()

      // 移除事件监听
      window.removeEventListener('resize', handleResize)

      // 销毁图表实例
      if (vitalSignsChartInstance) {
        vitalSignsChartInstance.dispose()
      }
      if (sleepQualityChartInstance) {
        sleepQualityChartInstance.dispose()
      }
      if (confidenceChartInstance) {
        confidenceChartInstance.dispose()
      }
    })

    return {
      dataTime,
      heartRate,
      heartRateProgress,
      breathRate,
      breathRateProgress,
      sleepQuality,
      sleepQualityProgress,
      sleepStage,
      signalQualityProgress,
      breathAmplitude,
      breathAmplitudeProgress,
      movement,
      movementProgress,
      vitalSignsChart,
      sleepQualityChart,
      confidenceChart,
      isRunning,
      elapsedTime,
      remainingTime,
    }
  },
}
</script>

<style scoped>
/* 样式保持不变 */
.health-monitor-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  color: #fff;
  overflow-x: hidden;
  min-height: 100vh;
  padding: 20px;
  margin: 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

header {
  text-align: center;
  padding: 30px 0;
  position: relative;
}

h1 {
  font-size: 2.5em;
  background: linear-gradient(45deg, #00d4ff, #7b2ff7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
  }
  to {
    filter: drop-shadow(0 0 20px rgba(123, 47, 247, 0.8));
  }
}

.status-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  opacity: 0.8;
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #666;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-dot-active {
  background: #00ff88;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow:
      0 0 5px #00ff88,
      0 0 10px #00ff88;
  }
  50% {
    box-shadow:
      0 0 10px #00ff88,
      0 0 20px #00ff88;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--glow-color), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
  border-color: rgba(0, 212, 255, 0.5);
}

.metric-label {
  font-size: 0.85em;
  opacity: 0.7;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.metric-value {
  font-size: 2.5em;
  font-weight: bold;
  background: linear-gradient(45deg, var(--value-color-1), var(--value-color-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-unit {
  font-size: 0.5em;
  opacity: 0.6;
}

.chart-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  position: relative;
}

.chart-title {
  font-size: 1.2em;
  margin-bottom: 20px;
  color: #00d4ff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #00d4ff, #7b2ff7);
  border-radius: 2px;
}

.chart {
  height: 300px;
  width: 100%;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  border-radius: 3px;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.8em;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
