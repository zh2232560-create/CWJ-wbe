<template>
  <div class="login-container">
    <!-- 简单下拉刷新提示 -->
    <div class="refresh-tip" v-if="showRefreshTip">
      <el-icon class="refresh-icon"><Refresh /></el-icon>
      <span>释放刷新页面</span>
    </div>
  </div>
</template>
<script setup>
import { Refresh } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
// 下拉刷新相关状态
const showRefreshTip = ref(false)
let startY = 0
// 下拉刷新方法
const handleTouchStart = (e) => {
  // 只有当页面在顶部时才触发下拉刷新
  if (window.scrollY === 0) {
    startY = e.touches[0].pageY
  }
}
const handleTouchMove = (e) => {
  // 如果不在页面顶部，不处理
  if (window.scrollY > 0) return

  const touchY = e.touches[0].pageY
  const deltaY = touchY - startY

  // 只有下拉时才显示提示
  if (deltaY > 50) {
    showRefreshTip.value = true
    e.preventDefault() // 阻止默认滚动行为
  }
}

const handleTouchEnd = () => {
  if (showRefreshTip.value) {
    showRefreshTip.value = false
    // 刷新页面
    window.location.reload()
  }
}
</script>
<style scoped lang="scss">
.refresh-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  color: var(--el-color-primary);
  font-size: 14px;

  .refresh-icon {
    margin-right: 8px;
    animation: rotating 1s linear infinite;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
