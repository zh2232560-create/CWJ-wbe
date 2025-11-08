<template>
  <!-- 加载动画容器，支持自定义尺寸和颜色 -->
  <div class="loading-wrapper" :style="{ width: size, height: size }">
    <div class="cssload-main">
      <div class="cssload-heart">
        <span class="cssload-heartL" :style="{ backgroundColor: color, borderColor: color }"></span>
        <span class="cssload-heartR" :style="{ backgroundColor: color, borderColor: color }"></span>
        <span class="cssload-square" :style="{ backgroundColor: color, borderColor: color }"></span>
      </div>
      <div class="cssload-shadow"></div>
    </div>
    <!-- 可选：加载文本 -->
    <p class="loading-text" v-if="text">{{ text }}</p>
  </div>
</template>

<script setup>
// 组件Props：支持自定义尺寸、颜色、加载文本
const props = defineProps({
  // 动画尺寸（默认30px，支持px/em/rem）
  size: {
    type: String,
    default: '30px',
  },
  // 动画颜色（默认粉色，支持十六进制、rgb、颜色名）
  color: {
    type: String,
    default: 'rgb(252, 0, 101)',
  },
  // 加载提示文本（可选）
  text: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
/* 外层容器：居中对齐 */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 加载文本样式 */
.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  text-align: center;
  width: 200px;
}

/* 动画核心样式（保留原逻辑，优化定位） */
.cssload-main {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
}

.cssload-main * {
  font-size: 62px;
}

.cssload-heart {
  animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -o-animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -ms-animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -webkit-animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -moz-animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  position: relative;
}

.cssload-heartL {
  width: 1em;
  height: 1em;
  content: '';
  position: absolute;
  display: block;
  border-radius: 100%;
  animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -o-animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -ms-animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -webkit-animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -moz-animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  transform: translate(-28px, -27px);
  -o-transform: translate(-28px, -27px);
  -ms-transform: translate(-28px, -27px);
  -webkit-transform: translate(-28px, -27px);
  -moz-transform: translate(-28px, -27px);
}

.cssload-heartR {
  width: 1em;
  height: 1em;
  content: '';
  position: absolute;
  display: block;
  border-radius: 100%;
  transform: translate(28px, -27px);
  -o-transform: translate(28px, -27px);
  -ms-transform: translate(28px, -27px);
  -webkit-transform: translate(28px, -27px);
  -moz-transform: translate(28px, -27px);
  animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -o-animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -ms-animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -webkit-animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -moz-animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
}

.cssload-square {
  width: 1em;
  height: 1em;
  position: relative;
  display: block;
  content: '';
  transform: scale(1) rotate(-45deg);
  -o-transform: scale(1) rotate(-45deg);
  -ms-transform: scale(1) rotate(-45deg);
  -webkit-transform: scale(1) rotate(-45deg);
  -moz-transform: scale(1) rotate(-45deg);
  animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -o-animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -ms-animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -webkit-animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -moz-animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
}

.cssload-shadow {
  left: 50%;
  content: '';
  position: relative;
  display: block;
  bottom: -0.5em;
  width: 1em;
  height: 0.24em;
  background-color: rgb(215, 215, 215);
  border: 1px solid rgb(215, 215, 215);
  border-radius: 50%;
  animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -o-animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -ms-animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -webkit-animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  -moz-animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -moz-transform: translateX(-50%);
}

/* 动画关键帧（保留原逻辑） */
@keyframes cssload-square {
  50% {
    border-radius: 100%;
    transform: scale(0.5) rotate(-45deg);
  }
  100% {
    transform: scale(1) rotate(-45deg);
  }
}
@-o-keyframes cssload-square {
  50% {
    border-radius: 100%;
    -o-transform: scale(0.5) rotate(-45deg);
  }
  100% {
    -o-transform: scale(1) rotate(-45deg);
  }
}
@-ms-keyframes cssload-square {
  50% {
    border-radius: 100%;
    -ms-transform: scale(0.5) rotate(-45deg);
  }
  100% {
    -ms-transform: scale(1) rotate(-45deg);
  }
}
@-webkit-keyframes cssload-square {
  50% {
    border-radius: 100%;
    -webkit-transform: scale(0.5) rotate(-45deg);
  }
  100% {
    -webkit-transform: scale(1) rotate(-45deg);
  }
}
@-moz-keyframes cssload-square {
  50% {
    border-radius: 100%;
    -moz-transform: scale(0.5) rotate(-45deg);
  }
  100% {
    -moz-transform: scale(1) rotate(-45deg);
  }
}

@keyframes cssload-heart {
  50% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(720deg);
  }
}
@-o-keyframes cssload-heart {
  50% {
    -o-transform: rotate(360deg);
  }
  100% {
    -o-transform: rotate(720deg);
  }
}
@-ms-keyframes cssload-heart {
  50% {
    -ms-transform: rotate(360deg);
  }
  100% {
    -ms-transform: rotate(720deg);
  }
}
@-webkit-keyframes cssload-heart {
  50% {
    -webkit-transform: rotate(360deg);
  }
  100% {
    -webkit-transform: rotate(720deg);
  }
}
@-moz-keyframes cssload-heart {
  50% {
    -moz-transform: rotate(360deg);
  }
  100% {
    -moz-transform: rotate(720deg);
  }
}

@keyframes cssload-heartL {
  60% {
    transform: scale(0.4) translate(-28px, -27px);
  }
}
@-o-keyframes cssload-heartL {
  60% {
    -o-transform: scale(0.4) translate(-28px, -27px);
  }
}
@-ms-keyframes cssload-heartL {
  60% {
    -ms-transform: scale(0.4) translate(-28px, -27px);
  }
}
@-webkit-keyframes cssload-heartL {
  60% {
    -webkit-transform: scale(0.4) translate(-28px, -27px);
  }
}
@-moz-keyframes cssload-heartL {
  60% {
    -moz-transform: scale(0.4) translate(-28px, -27px);
  }
}

@keyframes cssload-heartR {
  40% {
    transform: scale(0.4) translate(28px, -27px);
  }
}
@-o-keyframes cssload-heartR {
  40% {
    -o-transform: scale(0.4) translate(28px, -27px);
  }
}
@-ms-keyframes cssload-heartR {
  40% {
    -ms-transform: scale(0.4) translate(28px, -27px);
  }
}
@-webkit-keyframes cssload-heartR {
  40% {
    -webkit-transform: scale(0.4) translate(28px, -27px);
  }
}
@-moz-keyframes cssload-heartR {
  40% {
    -moz-transform: scale(0.4) translate(28px, -27px);
  }
}

@keyframes cssload-shadow {
  50% {
    transform: scale(0.5) translateX(-50%);
    border-color: rgb(228, 228, 228);
  }
}
@-o-keyframes cssload-shadow {
  50% {
    -o-transform: scale(0.5) translateX(-50%);
    border-color: rgb(228, 228, 228);
  }
}
@-ms-keyframes cssload-shadow {
  50% {
    -ms-transform: scale(0.5) translateX(-50%);
    border-color: rgb(228, 228, 228);
  }
}
@-webkit-keyframes cssload-shadow {
  50% {
    -webkit-transform: scale(0.5) translateX(-50%);
    border-color: rgb(228, 228, 228);
  }
}
@-moz-keyframes cssload-shadow {
  50% {
    -moz-transform: scale(0.5) translateX(-50%);
    border-color: rgb(228, 228, 228);
  }
}
</style>
