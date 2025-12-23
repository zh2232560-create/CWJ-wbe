<template>
  <div class="container mx-auto max-w-7xl px-4 py-8">
    <!-- 动态背景 -->
    <div class="wave-bg">
      <div class="wave" style="top: -50%; left: -50%"></div>
      <div class="wave" style="top: -70%; left: -30%; animation-delay: -5s"></div>
      <div class="wave" style="top: -20%; left: -80%; animation-delay: -10s"></div>
    </div>

    <!-- 粒子效果 -->
    <div class="particles" ref="particlesContainer"></div>

    <!-- 标题区域 -->
    <header class="text-center mb-10 animate-in">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">智能睡眠健康报告</h1>
      <p class="text-white/80 text-lg">基于AI深度分析的个性化健康方案</p>
    </header>

    <!-- 核心指标卡片 - 修改为左右布局 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 健康评分 -->
      <div class="glass-card p-6 text-center animate-in delay-100">
        <div class="score-container mb-4">
          <div class="score-ring">
            <svg viewBox="0 0 180 180">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#667eea" />
                  <stop offset="100%" stop-color="#764ba2" />
                </linearGradient>
              </defs>
              <circle cx="90" cy="90" r="80" class="score-ring-circle score-ring-bg"></circle>
              <circle
                cx="90"
                cy="90"
                r="80"
                class="score-ring-circle score-ring-progress"
                :style="`--progress: ${scoreProgress}`"
              ></circle>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span
                class="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 counter"
                >{{ displayScore }}</span
              >
              <span class="text-gray-500 text-sm mt-1">{{ scoreLabel }}</span>
            </div>
          </div>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 breathing">健康评分</h3>
      </div>

      <!-- 合并的诊断与成因卡片 -->
      <div class="lg:col-span-2 glass-card p-6 animate-in delay-200">
        <div class="space-y-4">
          <!-- 诊断结果 -->
          <div>
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              诊断结果 DIAGNOSIS
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(diagnosis, index) in reportData.overall_result.diagnosis"
                :key="index"
                class="diagnosis-tag"
                :style="`animation-delay: ${0.1 * index}s`"
              >
                {{ diagnosis }}
              </span>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="border-t border-gray-200"></div>

          <!-- 成因分析 -->
          <div>
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              成因分析 ROOT CAUSE
            </h3>
            <p class="text-gray-700 leading-relaxed text-base lg:text-lg">
              {{ reportData.overall_result.cause }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据分析区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 睡眠结构图表 -->
      <div class="glass-card p-6 animate-in delay-300">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">
          <i class="fas fa-bed text-indigo-500 mr-2"></i>睡眠结构分析
        </h3>
        <div class="h-64 relative">
          <canvas ref="sleepChartCanvas"></canvas>
        </div>
        <div class="grid grid-cols-4 gap-2 mt-4">
          <div
            v-for="stat in sleepStats"
            :key="stat.label"
            class="text-center p-2 bg-gray-50 rounded-lg"
          >
            <div class="text-xs text-gray-500">{{ stat.label }}</div>
            <div class="text-lg font-bold" :class="stat.color">{{ stat.value }}</div>
          </div>
        </div>
      </div>

      <!-- 风险评估 -->
      <div class="glass-card p-6 animate-in delay-400">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">
          <i class="fas fa-heartbeat text-red-500 mr-2"></i>健康风险评估
        </h3>

        <!-- AHI指标 -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600">呼吸暂停指数 (AHI)</span>
            <span class="font-semibold text-lg">{{ ahiValue }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="`width: ${ahiPercent}%`"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>正常</span>
            <span>轻度</span>
            <span>中度</span>
            <span>重度</span>
          </div>
        </div>

        <!-- 风险指标网格 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div
            class="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200"
          >
            <div class="text-sm text-gray-600">心血管风险</div>
            <div class="text-xl font-bold text-orange-600">
              {{ reportData.health_analysis.risks.cardiovascular_risk }}
            </div>
          </div>
          <div
            class="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200"
          >
            <div class="text-sm text-gray-600">日间功能</div>
            <div class="text-xl font-bold text-yellow-600">
              {{ reportData.health_analysis.risks.daytime_function }}
            </div>
          </div>
        </div>

        <!-- 症状列表 -->
        <div>
          <div class="text-sm text-gray-600 mb-2">主要症状</div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(symptom, index) in reportData.health_analysis.symptoms"
              :key="index"
              class="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full border border-red-200"
            >
              {{ symptom }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 个性化建议 - 新样式 -->
    <section class="animate-in delay-500">
      <h3 class="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-cyan-500">
        个性化干预方案
      </h3>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 理疗方案 (带背景 + 横向滚动产品卡) -->
        <div class="recommendation-card">
          <img
            src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            class="bg-image"
            alt="massage"
          />
          <div class="overlay"></div>
          <div class="content">
            <h4 class="text-white font-bold text-xl mb-2">
              <i class="fas fa-spa text-cyan-300 mr-2"></i>理疗推荐
            </h4>
            <p class="text-gray-300 text-sm mb-auto">针对肌肉紧张与气道阻塞的专业理疗</p>

            <!-- 横向滚动产品列表 -->
            <div class="horizontal-scroll mt-4">
              <div
                v-for="(product, index) in reportData.recommendations.massage"
                :key="index"
                class="product-mini-card"
              >
                <img :src="product.image" :alt="product.name" />
                <div class="name">{{ product.name }}</div>
                <div class="desc">{{ product.effect }}</div>
                <div class="price">{{ product.price }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 食疗方案 (带背景 + 横向滚动产品卡) -->
        <div class="recommendation-card">
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            class="bg-image"
            alt="diet"
          />
          <div class="overlay"></div>
          <div class="content">
            <h4 class="text-white font-bold text-xl mb-2">
              <i class="fas fa-utensils text-green-300 mr-2"></i>饮食保健
            </h4>
            <p class="text-gray-300 text-sm mb-auto">补气养血，助眠安神的营养搭配</p>

            <!-- 横向滚动产品列表 -->
            <div class="horizontal-scroll mt-4">
              <div
                v-for="(product, index) in reportData.recommendations.diet.products"
                :key="index"
                class="product-mini-card"
              >
                <img :src="product.image" :alt="product.name" />
                <div class="name">{{ product.name }}</div>
                <div class="desc">{{ product.effect }}</div>
                <div class="price">{{ product.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐食材 -->
      <div class="glass-card p-4 mb-6">
        <p class="text-sm text-gray-600 mb-2">日常推荐食材</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(food, index) in reportData.recommendations.diet.food"
            :key="index"
            class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
          >
            {{ food }}
          </span>
        </div>
      </div>

      <!-- 其他建议网格 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 穴位按摩 -->
        <div class="glass-card p-5">
          <h4 class="text-lg font-bold text-gray-800 mb-4">
            <i class="fas fa-hand-sparkles text-purple-500 mr-2"></i>穴位按摩
          </h4>
          <div class="space-y-2">
            <div
              v-for="(point, index) in reportData.recommendations.acupoints"
              :key="index"
              class="flex items-center p-2 bg-purple-50 rounded-lg text-sm"
            >
              <i class="fas fa-map-marker-alt text-purple-500 mr-2"></i>{{ point }}
            </div>
          </div>
        </div>

        <!-- 运动建议 -->
        <div class="glass-card p-5">
          <h4 class="text-lg font-bold text-gray-800 mb-4">
            <i class="fas fa-running text-orange-500 mr-2"></i>运动建议
          </h4>
          <ul class="space-y-2 text-gray-700">
            <li
              v-for="(exercise, index) in reportData.recommendations.exercise"
              :key="index"
              class="flex items-center"
            >
              <i class="fas fa-chevron-right text-orange-500 mr-2 text-xs"></i>{{ exercise }}
            </li>
          </ul>
        </div>

        <!-- 生活方式 -->
        <div class="glass-card p-5">
          <h4 class="text-lg font-bold text-gray-800 mb-4">
            <i class="fas fa-sun text-yellow-500 mr-2"></i>生活方式
          </h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li
              v-for="(lifestyle, index) in reportData.recommendations.lifestyle"
              :key="index"
              class="flex items-start"
            >
              <i class="fas fa-circle text-yellow-500 mr-2 text-[6px] mt-1.5"></i>
              <span>{{ lifestyle }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 医生建议 -->
    <div class="glass-card p-6 mt-8 border-l-4 border-yellow-500 animate-in delay-500">
      <div class="flex items-start">
        <div
          class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0"
        >
          <i class="fas fa-user-md text-yellow-600"></i>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">医生建议</h3>
          <p class="text-gray-600">
            {{ reportData.diagnosis }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'
// 动态加载 CDN
onMounted(() => {
  // 检查是否已经加载了 Tailwind CSS
  if (!document.querySelector('link[href*="tailwindcss.com"]')) {
    // 加载 Tailwind CSS CDN
    const tailwindLink = document.createElement('link')
    tailwindLink.rel = 'stylesheet'
    tailwindLink.href = 'https://cdn.tailwindcss.com'
    document.head.appendChild(tailwindLink)
  }

  // 加载 Font Awesome
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement('link')
    faLink.rel = 'stylesheet'
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    document.head.appendChild(faLink)
  }

  createParticles()
  renderHealthScore()
  renderCharts()
})

// 数据源
const reportData = {
  overall_result: {
    health_score: '82（正常）',
    diagnosis: ['轻度睡眠呼吸暂停', '睡眠结构紊乱'],
    cause: '上气道阻塞导致呼吸中断，深睡眠与REM睡眠不足影响身体恢复功能。',
  },
  health_analysis: {
    symptoms: [
      '夜间打鼾伴呼吸暂停',
      '晨起口干、头痛',
      '日间困倦、注意力不集中',
      '夜间频繁觉醒',
      '深睡眠时间不足',
      'REM睡眠占比偏低',
    ],
    risks: {
      ahi_index: '22.5次/小时（中度）',
      cardiovascular_risk: '中度风险',
      daytime_function: '显著受损',
    },
  },
  sleep_architecture: {
    sleep_efficiency: '78%',
    deep_sleep_ratio: '8%（偏低）',
    rem_sleep_ratio: '15%（偏低）',
    wake_times: '18次',
  },
  recommendations: {
    massage: [
      {
        name: '元气满满肩颈疏通',
        store: '奈晚门店',
        price: '¥298',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=300',
        effect: '改善上气道周围肌肉紧张',
      },
      {
        name: '深度睡眠按摩',
        store: '奈晚门店',
        price: '¥388',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300',
        effect: '放松神经，提升睡眠质量',
      },
      {
        name: '头部舒压理疗',
        store: '奈晚门店',
        price: '¥168',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300',
        effect: '缓解头痛，促进血液循环',
      },
    ],
    diet: {
      food: ['山药', '莲子', '白扁豆', '红枣', '桂圆', '枸杞'],
      products: [
        {
          name: '雪花膏',
          brand: '三两小方',
          price: '¥168',
          image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=300',
          effect: '滋阴养颜，改善睡眠',
        },
        {
          name: '养心安神茶',
          brand: '三两小方',
          price: '¥98',
          image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300',
          effect: '安神助眠，缓解焦虑',
        },
        {
          name: '百合莲子粉',
          brand: '三两小方',
          price: '¥128',
          image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300',
          effect: '润肺清心，宁神助眠',
        },
        {
          name: '野生黑枸杞',
          brand: '三两小方',
          price: '¥238',
          image: 'https://images.unsplash.com/photo-1596525737222-793540b648c6?w=300',
          effect: '抗氧化，增强免疫力',
        },
      ],
    },
    acupoints: ['足三里（ST36）', '中脘（CV12）', '神门（HT7）', '太冲（LR3）'],
    exercise: ['太极、八段锦', '慢跑、快走、游泳'],
    lifestyle: [
      '规律作息（23点前入睡）',
      '避免焦虑忧思，保持心境平和',
      '少处湿冷环境',
      '适度社交，保持积极愉快的心态',
    ],
  },
  diagnosis:
    '初步判断为普通感冒，建议多饮温水、休息，可服用复方氨酚烷胺片缓解症状。若发烧超过3天或咳嗽加重，请及时就医。',
}

// 响应式数据
const displayScore = ref(0)
const scoreProgress = ref(0)
const particlesContainer = ref(null)
const sleepChartCanvas = ref(null)
let sleepChart = null
let scoreInterval = null

// 计算属性
const scoreLabel = computed(() => {
  const scoreStr = reportData.overall_result.health_score
  return scoreStr.replace(/\d+/, '').replace(/[（）]/g, '')
})

const ahiValue = computed(() => {
  return reportData.health_analysis.risks.ahi_index
})

const ahiPercent = computed(() => {
  const ahiStr = reportData.health_analysis.risks.ahi_index
  const ahiValue = parseFloat(ahiStr)
  // 计算AHI进度条（假设60为最大值）
  return Math.min((ahiValue / 60) * 100, 100)
})

const sleepStats = computed(() => {
  const deep = parseInt(reportData.sleep_architecture.deep_sleep_ratio)
  const rem = parseInt(reportData.sleep_architecture.rem_sleep_ratio)

  return [
    {
      label: '睡眠效率',
      value: reportData.sleep_architecture.sleep_efficiency,
      color: 'text-green-600',
    },
    { label: '深睡眠', value: deep + '%', color: 'text-indigo-600' },
    { label: 'REM睡眠', value: rem + '%', color: 'text-purple-600' },
    { label: '觉醒次数', value: reportData.sleep_architecture.wake_times, color: 'text-red-600' },
  ]
})

onUnmounted(() => {
  if (scoreInterval) {
    clearInterval(scoreInterval)
  }
  if (sleepChart) {
    sleepChart.destroy()
  }
})

// 方法
function createParticles() {
  if (!particlesContainer.value) return

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.left = Math.random() * 100 + '%'
    particle.style.animationDelay = Math.random() * 20 + 's'
    particle.style.animationDuration = 20 + Math.random() * 10 + 's'
    particlesContainer.value.appendChild(particle)
  }
}

function renderHealthScore() {
  const scoreStr = reportData.overall_result.health_score
  const score = parseInt(scoreStr.match(/\d+/)[0])

  // 计算环形进度
  const circumference = 2 * Math.PI * 80
  scoreProgress.value = (score / 100) * circumference

  // 数字动画
  let currentScore = 0
  const increment = score / 50

  scoreInterval = setInterval(() => {
    currentScore += increment
    if (currentScore >= score) {
      currentScore = score
      clearInterval(scoreInterval)
    }
    displayScore.value = Math.round(currentScore)
  }, 30)
}

function renderCharts() {
  if (!sleepChartCanvas.value) return

  const deep = parseInt(reportData.sleep_architecture.deep_sleep_ratio)
  const rem = parseInt(reportData.sleep_architecture.rem_sleep_ratio)
  const light = 100 - deep - rem

  // 睡眠结构饼图
  const ctx = sleepChartCanvas.value.getContext('2d')
  sleepChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['深睡眠', '浅睡眠', 'REM睡眠'],
      datasets: [
        {
          data: [deep, light, rem],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(147, 197, 253, 0.8)',
            'rgba(196, 181, 253, 0.8)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(147, 197, 253, 1)',
            'rgba(196, 181, 253, 1)',
          ],
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.label + ': ' + context.parsed + '%'
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    },
  })
}
</script>

<style>
/* 全局样式 - 添加这个组件需要的全局样式 */
:root {
  --progress: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 容器样式 */
.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: 1rem;
  padding-left: 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-right: 1.5rem;
    padding-left: 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding-right: 2rem;
    padding-left: 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding-right: 3rem;
    padding-left: 3rem;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
    padding-right: 4rem;
    padding-left: 4rem;
  }
}
</style>

<style scoped>
/* 动态波浪背景 */
.wave-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(147, 197, 253, 0.3) 0%,
    rgba(196, 181, 253, 0.3) 50%,
    rgba(251, 207, 232, 0.3) 100%
  );
  z-index: -2;
}

.wave {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: wave 15s linear infinite;
}

@keyframes wave {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 粒子背景 */
.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: float 20s infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(100px);
    opacity: 0;
  }
}

/* 玻璃卡片效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 15px 40px 0 rgba(31, 38, 135, 0.2),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.8);
}

/* 产品横向滚动 */
.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
}

.horizontal-scroll::-webkit-scrollbar {
  height: 6px;
}

.horizontal-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.product-mini-card {
  flex: 0 0 160px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  cursor: pointer;
}

.product-mini-card:hover {
  transform: scale(1.05);
}

.product-mini-card img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.product-mini-card .name {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-mini-card .desc {
  font-size: 10px;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-mini-card .price {
  font-size: 14px;
  font-weight: bold;
  color: #dc2626;
  margin-top: auto;
}

/* 带背景的推荐卡片 */
.recommendation-card {
  position: relative;
  height: 320px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.recommendation-card:hover .bg-image {
  transform: scale(1.1);
}

.recommendation-card .bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.recommendation-card .overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(15, 23, 42, 0.7) 40%,
    rgba(15, 23, 42, 0.3) 100%
  );
}

.recommendation-card .content {
  position: relative;
  z-index: 10;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

/* 入场动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: slideInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  opacity: 0;
}

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}
.delay-400 {
  animation-delay: 0.4s;
}
.delay-500 {
  animation-delay: 0.5s;
}

/* 响应式健康分数环 */
.score-container {
  position: relative;
  width: 100%;
  max-width: 180px;
  margin: 0 auto;
}

.score-container::before {
  content: '';
  display: block;
  padding-bottom: 100%;
}

.score-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.score-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-ring-circle {
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dasharray 1.5s ease-in-out;
}

.score-ring-bg {
  stroke: rgba(147, 197, 253, 0.2);
}

.score-ring-progress {
  stroke: url(#gradient);
  stroke-dasharray: 0 565;
  animation: fillRing 2s ease-out forwards;
}

@keyframes fillRing {
  to {
    stroke-dasharray: var(--progress) 565;
  }
}

/* 数字滚动效果 */
.counter {
  font-variant-numeric: tabular-nums;
  animation: countUp 2s ease-out;
}

@keyframes countUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 脉冲效果 */
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* 呼吸灯效果 */
.breathing {
  animation: breathing 3s ease-in-out infinite;
}

@keyframes breathing {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(147, 197, 253, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(147, 197, 253, 0.8);
  }
}

/* 诊断标签渐变色 */
.diagnosis-tag {
  background: linear-gradient(135deg, #22d3ee, #06b6d4);
  color: white;
  padding: 8px 20px;
  border-radius: 25px;
  font-weight: 500;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
  transition: all 0.3s;
}

.diagnosis-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
}

/* 进度条动画 */
.progress-bar {
  height: 8px;
  background: rgba(147, 197, 253, 0.2);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform-origin: left;
  animation: fillBar 1.5s ease-out forwards;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes fillBar {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .score-container {
    max-width: 140px;
  }
}
</style>
