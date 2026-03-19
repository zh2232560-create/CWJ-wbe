<template>
  <div class="loader-container" :style="{ gap: textGap + 'px' }">
    <div class="cube-container" :style="{ width: cubeSize + 'px', height: cubeSize + 'px' }">
      <div class="cube" :style="{ animationDuration: rotateDuration + 's' }">
        <div class="face front" :style="{ background: getFaceColor(0) }"></div>
        <div class="face back" :style="{ background: getFaceColor(1) }"></div>
        <div class="face right" :style="{ background: getFaceColor(2) }"></div>
        <div class="face left" :style="{ background: getFaceColor(3) }"></div>
        <div class="face top" :style="{ background: cubeTopColor }"></div>
        <div class="face bottom" :style="{ background: getFaceColor(5) }"></div>
      </div>
    </div>
    <p class="loader-text" :style="{ color: textColor, fontSize: textSize + 'px' }">
      {{ text }}
    </p>
  </div>
</template>

<script setup>
/**
 * 参数名	类型	默认值	说明
text	String	加载中...	加载提示文字
textColor	String	#333	文字颜色
textSize	Number	14	文字大小（单位：px）
textGap	Number	24	文字与立方体的间距（单位：px）
cubeSize	Number	75	立方体尺寸（单位：px，建议 30-200）
cubeMainColor	String	#00ff9d	立方体主色（荧光绿，可替换为任意颜色）
cubeTopColor	String	#000	立方体顶部颜色（默认黑色）
faceBrightness	Array	[-10, -20, 5, -5, 'ignore', -15]	6 个面的亮度偏移（'ignore' 表示直接用主色）
rotateDuration	Number	8	旋转动画时长（单位：秒）
 */
import { defineProps, computed } from 'vue'

const props = defineProps({
  // 文字相关
  text: { type: String, default: '加载中...' },
  textColor: { type: String, default: '#333' },
  textSize: { type: Number, default: 14, validator: (v) => v > 0 },
  textGap: { type: Number, default: 24, validator: (v) => v >= 12 }, // 文字与立方体间距

  // 立方体视觉相关
  cubeSize: { type: Number, default: 75, validator: (v) => v >= 30 && v <= 200 },
  cubeMainColor: { type: String, default: '#00ff9d' }, // 荧光绿主色
  cubeTopColor: { type: String, default: '#000' }, // 顶部黑色
  faceBrightness: {
    // 6个面的亮度偏移（可自定义渐变层次）
    type: Array,
    default: () => [-10, -20, 5, -5, 'ignore', -15],
    validator: (arr) => arr.length === 6,
  },

  // 动画相关
  rotateDuration: { type: Number, default: 8, validator: (v) => v > 0 },
})

const getFaceColor = (index) => {
  if (index === 4) return props.cubeTopColor // 顶部面直接用配置的颜色
  const brightness = props.faceBrightness[index]
  if (brightness === 'ignore') return props.cubeMainColor
  return adjustColor(props.cubeMainColor, brightness)
}

// 颜色亮度调整工具函数
function adjustColor(color, brightness) {
  if (color.startsWith('#')) {
    color = color.replace('#', '')
    const r = Math.max(0, Math.min(255, parseInt(color.slice(0, 2), 16) + brightness))
    const g = Math.max(0, Math.min(255, parseInt(color.slice(2, 4), 16) + brightness))
    const b = Math.max(0, Math.min(255, parseInt(color.slice(4, 6), 16) + brightness))
    return `rgb(${r},${g},${b})`
  }
  return color
}

const halfSize = computed(() => props.cubeSize / 2)
</script>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  perspective: 1200px;
  -webkit-perspective: 1200px;
}

.cube-container {
  position: relative;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  animation: rotate linear infinite;
  -webkit-animation: rotate linear infinite;
}

.face {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.9;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.front {
  transform: translateZ(v-bind('halfSize + "px"'));
  -webkit-transform: translateZ(v-bind('halfSize + "px"'));
}
.back {
  transform: rotateY(180deg) translateZ(v-bind('halfSize + "px"'));
  -webkit-transform: rotateY(180deg) translateZ(v-bind('halfSize + "px"'));
}
.right {
  transform: rotateY(90deg) translateZ(v-bind('halfSize + "px"'));
  -webkit-transform: rotateY(90deg) translateZ(v-bind('halfSize + "px"'));
}
.left {
  transform: rotateY(-90deg) translateZ(v-bind('halfSize + "px"'));
  -webkit-transform: rotateY(-90deg) translateZ(v-bind('halfSize + "px"'));
}
.top {
  transform: rotateX(90deg) translateZ(v-bind('halfSize + "px"'));
  -webkit-transform: rotateX(90deg) translateZ(v-bind('halfSize + "px"'));
}
.bottom {
  transform: rotateX(-90deg) translateZ(v-bind('halfSize + "px"'));
  -webkit-transform: rotateX(-90deg) translateZ(v-bind('halfSize + "px"'));
}

@keyframes rotate {
  0% {
    transform: rotateX(-30deg) rotateY(0deg);
  }
  100% {
    transform: rotateX(-30deg) rotateY(360deg);
  }
}
@-webkit-keyframes rotate {
  0% {
    -webkit-transform: rotateX(-30deg) rotateY(0deg);
  }
  100% {
    -webkit-transform: rotateX(-30deg) rotateY(360deg);
  }
}

.loader-text {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  font-weight: 500;
  text-align: center;
}
</style>
