<template>
  <div class="circular-progress">
    <div class="progress-container">
      <svg class="score-ring" :width="size" :height="size" viewBox="0 0 200 200">
        <!-- 白色背景圆 -->
        <circle cx="100" cy="100" :r="radius" fill="white" v-if="!showBackground" />

        <!-- 底层灰色背景圆环 -->
        <circle
          cx="100"
          cy="100"
          :r="radius"
          fill="none"
          stroke="rgba(0, 0, 0, 0.1)"
          :stroke-width="strokeWidth"
          :stroke-dasharray="dashArray"
          stroke-dashoffset="0"
          stroke-linecap="round"
        />

        <!-- 单色进度条圆环 -->
        <circle
          cx="100"
          cy="100"
          :r="radius"
          fill="none"
          :stroke="currentColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="dashArray"
          :stroke-dashoffset="dashOffset"
          stroke-linecap="round"
          class="progress-circle"
          transform="rotate(-90 100 100)"
        />
      </svg>

      <!-- 分数显示 - 颜色与进度条同步 -->
      <div class="score-text">
        <div class="score-value" :style="{ color: currentColor }">{{ animatedScore }}</div>
        <div class="score-status" v-if="showStatus" :style="{ color: currentColor }">
          {{ getStatusText() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircularProgress',
  props: {
    // 分数（必需）
    score: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100,
    },
    // 颜色配置（可选）
    colors: {
      type: Object,
      default: () => ({
        red: '#FF4A4A',
        orange: '#FCCE36',
        green: '#6AFF41',
      }),
    },
    // 尺寸（可选）
    size: {
      type: [String, Number],
      default: '200px',
    },
    // 是否显示健康状态文字
    showStatus: {
      type: Boolean,
      default: true,
    },
    // 圆环半径
    radius: {
      type: Number,
      default: 85,
    },
    // 圆环宽度
    strokeWidth: {
      type: Number,
      default: 10,
    },
    // 动画持续时间（毫秒）
    animationDuration: {
      type: Number,
      default: 1500,
    },
    // 是否显示白色背景圆
    showBackground: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      animatedScore: 0,
      animationStartTime: null,
      animationFrame: null,
    }
  },
  computed: {
    // 计算圆环周长
    dashArray() {
      return 2 * Math.PI * this.radius
    },
    // 计算进度条偏移量
    dashOffset() {
      return this.dashArray * (1 - this.animatedScore / 100)
    },
    // 根据当前动画分数计算颜色
    currentColor() {
      if (this.animatedScore < 30) {
        return this.colors.red
      } else if (this.animatedScore >= 30 && this.animatedScore < 60) {
        return this.colors.orange
      } else {
        return this.colors.green
      }
    },
  },
  methods: {
    // 根据分数获取健康状态文字
    getStatusText() {
      if (this.animatedScore < 30) {
        return '健康风险'
      } else if (this.animatedScore >= 30 && this.animatedScore < 60) {
        return '需改善'
      } else if (this.animatedScore >= 60 && this.animatedScore < 80) {
        return '亚健康'
      } else {
        return '正常'
      }
    },
    // 动画函数
    animateScore(timestamp) {
      if (!this.animationStartTime) {
        this.animationStartTime = timestamp
      }

      const elapsed = timestamp - this.animationStartTime
      const progress = Math.min(elapsed / this.animationDuration, 1)

      // 使用缓动函数让动画更自然
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      this.animatedScore = Math.floor(this.score * easeOutQuart)

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(this.animateScore)
      } else {
        this.animatedScore = this.score
      }
    },
    // 开始动画
    startAnimation() {
      this.animatedScore = 0
      this.animationStartTime = null
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
      this.animationFrame = requestAnimationFrame(this.animateScore)
    },
  },
  mounted() {
    this.startAnimation()
  },
  beforeUnmount() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  },
  watch: {
    score() {
      this.startAnimation()
    },
  },
}
</script>

<style lang="scss" scoped>
.circular-progress {
  display: inline-block;

  .progress-container {
    position: relative;
    display: inline-block;
  }

  .score-ring {
    display: block;

    .progress-circle {
      transition:
        stroke-dashoffset 0.1s linear,
        stroke 0.5s ease;
    }
  }

  .score-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    .score-value {
      font-size: 44px;
      font-weight: 800;
      line-height: 1;
      transition: all 0.5s ease;
    }

    .score-status {
      font-size: 14px;
      margin-top: 6px;
      transition: all 0.5s ease;
    }
  }
}
</style>
