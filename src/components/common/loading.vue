<template>
  <!-- 加载蒙版组件 -->
  <div class="loading-mask" v-if="visible">
    <div class="loading-content">
      <!-- 旋转动画图标 -->
      <el-icon class="loading-spin" :color="color" :size="size">
        <Loading />
      </el-icon>
      <!-- 提示文字 -->
      <p class="loading-text" :style="{ color: textColor }">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Loading } from '@element-plus/icons-vue'

// 定义组件属性（支持自定义配置）
const props = defineProps({
  // 控制显示/隐藏
  visible: {
    type: Boolean,
    default: false,
  },
  // 提示文本
  text: {
    type: String,
    default: '正在加载，请等待...',
  },
  // 图标颜色
  color: {
    type: String,
    default: '#1989fa',
  },
  // 图标大小
  size: {
    type: Number,
    default: 48,
  },
  // 文本颜色
  textColor: {
    type: String,
    default: '#303133',
  },
})
</script>

<style scoped>
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95); /* 白色半透明蒙版 */
  z-index: 9999; /* 确保覆盖所有内容 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 关键样式：阻止用户交互 */
  pointer-events: auto; /* 让蒙版接收所有点击事件 */
  touch-action: none; /* 阻止触摸设备上的滑动、缩放等操作 */
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px; /* 图标与文字间距 */
}

/* 旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-spin {
  animation: spin 1s linear infinite; /* 匀速旋转，无限循环 */
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
}
</style>
