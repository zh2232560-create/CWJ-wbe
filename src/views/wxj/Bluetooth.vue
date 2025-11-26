<template>
  <div class="health-monitor-container">
    <div class="container">
      <header>
        <h1>🌙 智能枕头健康监控系统</h1>
        <div class="status-bar">
          <div class="status-item">
            <div class="status-dot" :class="{ 'status-dot-active': isConnected }"></div>
            <span>{{ isConnected ? '设备在线' : '设备离线' }}</span>
          </div>
          <div class="status-item">
            <span>{{ dataTime }}</span>
          </div>
          <div class="status-item">
            <span>数据点数: {{ dataPoints }}</span>
          </div>
        </div>

        <!-- 蓝牙控制按钮 -->
        <div class="bluetooth-controls">
          <button @click="connectDevice" :disabled="isConnected" class="control-btn connect-btn">
            🔗 连接设备
          </button>
          <button
            @click="disconnectDevice"
            :disabled="!isConnected"
            class="control-btn disconnect-btn"
          >
            🔌 断开连接
          </button>
          <button
            @click="startPolling"
            :disabled="!isConnected || isPolling"
            class="control-btn start-btn"
          >
            📡 开始接收
          </button>
          <button
            @click="stopPolling"
            :disabled="!isConnected || !isPolling"
            class="control-btn stop-btn"
          >
            ⏹️ 停止接收
          </button>
        </div>
      </header>

      <div class="metrics-grid">
        <!-- 指标卡片保持不变，但数据将来自蓝牙 -->
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
import bluetoothService from '@/utils/bluetooth'

export default {
  name: 'HealthMonitor',
  setup() {
    // ========== 配置参数 ==========
    const CONFIG = {
      // 图表显示的数据点数
      MAX_DATA_POINTS: 60,

      // 数据范围（用于进度条计算）
      DATA_RANGE: {
        heartRate: { min: 40, max: 100 },
        breathRate: { min: 12, max: 30 },
        sleepQuality: { min: 70, max: 99 },
        breathAmplitude: { min: 150, max: 300 },
        movement: { min: 0, max: 20 },
      },
    }

    // 响应式数据
    const dataTime = ref('等待连接设备...')
    const heartRate = ref('--')
    const heartRateProgress = ref(0)
    const breathRate = ref('--')
    const breathRateProgress = ref(0)
    const sleepQuality = ref('--')
    const sleepQualityProgress = ref(0)
    const sleepStage = ref('等待数据')
    const signalQualityProgress = ref(0)
    const breathAmplitude = ref('--')
    const breathAmplitudeProgress = ref(0)
    const movement = ref('--')
    const movementProgress = ref(0)
    const dataPoints = ref(0)

    // 控制参数
    const isConnected = ref(false)
    const isPolling = ref(false)

    // 图表引用
    const vitalSignsChart = ref(null)
    const sleepQualityChart = ref(null)
    const confidenceChart = ref(null)

    // 图表实例
    let vitalSignsChartInstance = null
    let sleepQualityChartInstance = null
    let confidenceChartInstance = null

    // 数据存储
    const healthData = ref([])

    // 睡眠阶段映射
    const sleepStageMap = {
      deep: '深度睡眠',
      light: '浅度睡眠',
      rem: '快速眼动',
      awake: '清醒',
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

      // 图表配置保持不变...
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

    // 处理蓝牙数据
    function handleBluetoothData(data) {
      if (!data) return

      // 添加时间戳
      const dataWithTimestamp = {
        ...data,
        timestamp: Date.now(),
      }

      // 添加新数据点
      healthData.value.push(dataWithTimestamp)

      // 如果数据点超过最大值，移除最旧的数据
      if (healthData.value.length > CONFIG.MAX_DATA_POINTS) {
        healthData.value.shift()
      }

      // 更新数据点数
      dataPoints.value = healthData.value.length

      // 更新指标卡片
      heartRate.value = data.heart_rate.toFixed(1)
      heartRateProgress.value =
        ((data.heart_rate - CONFIG.DATA_RANGE.heartRate.min) /
          (CONFIG.DATA_RANGE.heartRate.max - CONFIG.DATA_RANGE.heartRate.min)) *
        100

      breathRate.value = data.breathing_rate.toFixed(1)
      breathRateProgress.value =
        ((data.breathing_rate - CONFIG.DATA_RANGE.breathRate.min) /
          (CONFIG.DATA_RANGE.breathRate.max - CONFIG.DATA_RANGE.breathRate.min)) *
        100

      sleepQuality.value = data.sleep_quality_score.toFixed(1)
      sleepQualityProgress.value =
        ((data.sleep_quality_score - CONFIG.DATA_RANGE.sleepQuality.min) /
          (CONFIG.DATA_RANGE.sleepQuality.max - CONFIG.DATA_RANGE.sleepQuality.min)) *
        100

      sleepStage.value = sleepStageMap[data.sleep_stage] || data.sleep_stage
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
      const currentTimestamp = Date.now()
      const elapsedSeconds = Math.floor(
        (currentTimestamp - healthData.value[0]?.timestamp || currentTimestamp) / 1000,
      )
      const startSecond = Math.max(0, elapsedSeconds - CONFIG.MAX_DATA_POINTS + 1)

      // 生成时间标签
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

    // 连接设备
    async function connectDevice() {
      dataTime.value = '正在连接设备...'
      const success = await bluetoothService.connectDevice()
      isConnected.value = success

      if (success) {
        dataTime.value = '设备连接成功'
      } else {
        dataTime.value = '设备连接失败'
      }
    }

    // 断开连接
    function disconnectDevice() {
      bluetoothService.disconnect()
      isConnected.value = false
      isPolling.value = false
      dataTime.value = '设备已断开连接'
    }

    // 开始轮询
    function startPolling() {
      bluetoothService.startPolling(1000)
      isPolling.value = true
      dataTime.value = '开始接收数据...'
    }

    // 停止轮询
    function stopPolling() {
      bluetoothService.stopPolling()
      isPolling.value = false
      dataTime.value = '停止接收数据'
    }

    // 响应式图表
    function handleResize() {
      vitalSignsChartInstance?.resize()
      sleepQualityChartInstance?.resize()
      confidenceChartInstance?.resize()
    }

    onMounted(() => {
      // 确保echarts已加载
      if (typeof echarts === 'undefined') {
        console.error('ECharts not loaded')
        return
      }

      initCharts()

      // 注册蓝牙数据回调
      bluetoothService.addDataCallback(handleBluetoothData)

      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      // 停止蓝牙服务
      bluetoothService.stopPolling()
      bluetoothService.disconnect()
      bluetoothService.removeDataCallback(handleBluetoothData)

      // 移除事件监听
      window.removeEventListener('resize', handleResize)

      // 销毁图表实例
      vitalSignsChartInstance?.dispose()
      sleepQualityChartInstance?.dispose()
      confidenceChartInstance?.dispose()
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
      isConnected,
      isPolling,
      dataPoints,
      connectDevice,
      disconnectDevice,
      startPolling,
      stopPolling,
    }
  },
}
</script>

<style scoped>
/* 原有样式保持不变，添加蓝牙控制按钮样式 */
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

/* 蓝牙控制按钮样式 */
.bluetooth-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 12px 20px;
  font-size: 1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  min-width: 120px;
}

.connect-btn {
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  color: white;
}

.disconnect-btn {
  background: linear-gradient(90deg, #ff416c, #ff4b2b);
  color: white;
}

.start-btn {
  background: linear-gradient(90deg, #56ab2f, #a8e6cf);
  color: white;
}

.stop-btn {
  background: linear-gradient(90deg, #ffb347, #ffcc33);
  color: white;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.control-btn:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 其余样式保持不变 */
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

  .bluetooth-controls {
    flex-direction: column;
    align-items: center;
  }

  .control-btn {
    width: 200px;
  }
}
</style>
