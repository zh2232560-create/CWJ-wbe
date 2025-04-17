<template>
  <div class="meeting-container">
    <img src="@/assets/static/logo.png" alt="" />
    <h1 class="page-title">会议管理系统</h1>

    <div
      class="particle-container"
      @mousedown="startDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @mousemove="handleDrag"
      @touchstart="startDrag"
      @touchend="endDrag"
      @touchmove="handleDrag"
      @click="navigateToCreatePage"
    >
      <div class="particle-sphere" ref="sphere">
        <!-- 移除旋转相关的 transform 样式 -->
        <span
          class="sphere-text"
          :style="{
            transform: `translate(-50%, -50%)`,
          }"
          @click.stop="navigateToCreatePage"
        >
          创建新会议
        </span>
        <div
          v-for="(particle, index) in visibleParticles"
          :key="index"
          class="particle"
          :style="{
            transform: `rotateY(${particle.rotateY}deg) rotateX(${particle.rotateX}deg) translateZ(${sphereRadius}px)`,
            backgroundColor: `hsl(${180 + (index % 60)}, 80%, 70%)`,
            opacity: getParticleOpacity(particle),
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { onBeforeUnmount } from 'vue'

const router = useRouter()
const sphere = ref(null)

// 粒子配置
const totalParticles = 750
const sphereRadius = 120
const baseRotationSpeed = 0.3
const dragRotationSpeed = 2
const decelerationRate = 0.95

// 状态管理
const particles = ref([])
const visibleParticles = computed(() =>
  particles.value.slice(0, Math.min(particles.value.length, 1000)),
)
const rotationAngle = ref(0)
const rotationSpeed = ref(baseRotationSpeed)
const isDragging = ref(false)
const lastDragX = ref(0)
const animationFrameId = ref(null)
const momentum = ref(0)

// 初始化粒子
const initParticles = () => {
  const newParticles = []

  for (let i = 0; i < totalParticles; i++) {
    // 修改为真正的斐波那契球体分布算法，覆盖整个球体
    const y = 1 - (i / (totalParticles - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const theta = 2 * Math.PI * (3 - Math.sqrt(5)) * i

    const phi = Math.acos(y)
    const x = Math.cos(theta) * radius
    const z = Math.sin(theta) * radius

    newParticles.push({
      x,
      y,
      z,
      rotateX: (phi * 180) / Math.PI,
      rotateY: (theta * 180) / Math.PI,
      opacity: 0.6 + Math.random() * 0.4,
    })
  }

  particles.value = newParticles
}

// 获取粒子透明度（文字前面的降低透明度）
const getParticleOpacity = (particle) => {
  // 计算粒子在Z轴的位置（0-1）
  const zPos = (particle.z + 1) / 2
  // 文字区域（中心区域）的粒子降低透明度
  const isNearText = Math.abs(particle.x) < 0.3 && Math.abs(particle.y) < 0.3
  return isNearText ? particle.opacity * 0.3 : particle.opacity
}

// 动画循环
const animate = () => {
  rotationAngle.value += rotationSpeed.value
  if (sphere.value) {
    sphere.value.style.transform = `rotateY(${rotationAngle.value}deg)`
  }

  // 动量减速
  if (!isDragging.value && Math.abs(rotationSpeed.value) > baseRotationSpeed) {
    rotationSpeed.value *= decelerationRate
    if (Math.abs(rotationSpeed.value) < baseRotationSpeed) {
      rotationSpeed.value = rotationSpeed.value > 0 ? baseRotationSpeed : -baseRotationSpeed
    }
  }

  animationFrameId.value = requestAnimationFrame(animate)
}

// 拖拽交互
const startDrag = (e) => {
  isDragging.value = true
  lastDragX.value = e.clientX || e.touches[0].clientX
  momentum.value = 0
}

const endDrag = () => {
  isDragging.value = false
  // 应用动量
  rotationSpeed.value += momentum.value / 5
  momentum.value = 0
}

const handleDrag = (e) => {
  if (!isDragging.value) return

  const currentX = e.clientX || e.touches[0].clientX
  const deltaX = currentX - lastDragX.value
  lastDragX.value = currentX

  // 计算旋转速度
  rotationSpeed.value = baseRotationSpeed + deltaX * 0.1
  // 累积动量
  momentum.value = deltaX * 0.5
}

// 跳转到创建页面的方法
const navigateToCreatePage = () => {
  // 根据实际路由配置修改跳转路径
  router.push('/create')
}

// 生命周期
onMounted(() => {
  initParticles()
  animate()
})

onBeforeUnmount(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<style scoped>
.meeting-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px);
  background-color: #ffffff;
  padding: 20px;
  overflow: hidden;
}

.page-title {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 50px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.particle-container {
  cursor: grab;
  perspective: 1000px;
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.particle-container:active {
  cursor: grabbing;
}

.particle-sphere {
  position: relative;
  width: 200px;
  height: 200px;
  transform-style: preserve-3d;
  transition: transform 0.1s linear;
}

.sphere-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(255, 252, 252);
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
  pointer-events: none;
  width: 100%;
  text-align: center;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  backface-visibility: hidden;
  pointer-events: none;
}

/* 上下两端固定不动的粒子 */
.particle[style*='rotateX(0deg)'],
.particle[style*='rotateX(180deg)'] {
  animation: none !important;
  transform: rotateY(var(--ry)) rotateX(var(--rx)) translateZ(120px) !important;
}
</style>
