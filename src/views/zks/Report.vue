<template>
  <!-- 加载中显示动画 -->
  <div v-if="isLoading" class="loading-container">
    <!-- <HeartLoading size="40px" color="#e74c3c" text="加载报告中..." /> -->
    <CubeLoader
      text="加载报告中..."
      textColor="#00ff9d"
      textSize="16"
      textGap="30"
      cubeSize="50"
      cubeMainColor="#00ff9d"
      cubeTopColor="#000"
      faceBrightness="[-20, -10, 10, 0, -20, -10]"
      rotateDuration="6"
    />
  </div>

  <div class="health-report" v-else>
    <!-- 顶部导航 -->
    <header class="report-header">
      <button class="back-btn" @click="backhome()">
        <el-icon><arrow-left /></el-icon>
      </button>
      <h1 class="report-title">报告详情</h1>
      <button class="share-btn" @click="shareReport()">
        <el-icon><share /></el-icon>
      </button>
    </header>
    <!-- 使用圆环进度条组件 -->
    <!-- <div class="diagnosis-right">
      <CircularProgress :score="score" :colors="progressColors" size="200px" />
    </div> -->
    <!-- 自定义文字和颜色 -->
    <!-- <div class="loading-container">
      <CubeLoader
        text="加载报告中..."
        textColor="#00ff9d"
        textSize="16"
        textGap="30"
        cubeSize="50"
        cubeMainColor="#00ff9d"
        cubeTopColor="#000"
        faceBrightness="[0, -10, 10, 0, 'ignore', -10]"
        rotateDuration="6"
      />
    </div> -->

    <!-- 主要内容区 -->
    <main class="report-content">
      <div>
        <!-- 诊断结果和基本信息：左右布局，左文字右圆环 -->
        <section class="diagnosis-section">
          <div class="diagnosis-row">
            <div class="diagnosis-left">
              <div class="diagnosis-result">
                <h2>
                  诊断结果:
                  <span class="result-text">
                    {{ apiData.overall_result.diagnosis.join('，') }}
                  </span>
                </h2>
              </div>
              <div class="basic-info">
                <div class="info-item">
                  <span class="info-label">年龄:</span>
                  <span class="info-value">{{ apiData.age }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">性别:</span>
                  <span class="info-value">{{ apiData.gender == 1 ? '男' : '女' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">风险指数:</span>
                  <span class="info-value risk-level-7">
                    {{ apiData.health_analysis.risks.risk_index }}
                  </span>
                </div>
                <div class="info-item">
                  <!-- <span class="info-label" style="font-size: 10px">诊断时间:</span> -->
                  <span class="info-value" style="font-size: 13px">{{ apiData.add_time }}</span>
                </div>
              </div>
            </div>

            <div class="diagnosis-right">
              <!-- 健康评分圆环区域 -->
              <div class="health-score">
                <div class="outer-circle"></div>

                <div class="diagnosis-right">
                  <CircularProgress :score="apiData.overall_result.health_score" size="180px" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. 健康分析（标签切换交互+动态渲染） -->
        <section class="analysis-section">
          <h2 class="section-title">健康分析</h2>
          <div class="analysis-tabs">
            <button
              class="tab-btn"
              :class="{ active: healthAnalysisTab === 'cause' }"
              @click="healthAnalysisTab = 'cause'"
            >
              病症原因
            </button>
            <button
              class="tab-btn"
              :class="{ active: healthAnalysisTab === 'symptoms' }"
              @click="healthAnalysisTab = 'symptoms'"
            >
              具体症状
            </button>
            <button
              class="tab-btn"
              :class="{ active: healthAnalysisTab === 'risks' }"
              @click="healthAnalysisTab = 'risks'"
            >
              并发症风险
            </button>
            <button
              class="tab-btn"
              :class="{ active: healthAnalysisTab === 'dailyImpact' }"
              @click="healthAnalysisTab = 'dailyImpact'"
            >
              日常影响程度
            </button>
          </div>

          <!-- 动态切换内容 -->
          <div class="analysis-content">
            <!-- 病原原因 -->
            <div v-if="healthAnalysisTab === 'cause'">
              <p>{{ apiData.overall_result.cause }}</p>
            </div>
            <!-- 具体症状（循环渲染） -->
            <div v-else-if="healthAnalysisTab === 'symptoms'">
              <ul class="symptoms-list">
                <li v-for="(symptom, idx) in apiData.health_analysis.symptoms" :key="idx">
                  {{ symptom }}
                </li>
              </ul>
            </div>
            <!-- 并发症风险 -->
            <div v-else-if="healthAnalysisTab === 'risks'">
              <p>{{ apiData.health_analysis.risks.complication_risk }}</p>
            </div>
            <!-- 日常影响程度 -->
            <div v-else-if="healthAnalysisTab === 'dailyImpact'">
              <p>{{ apiData.health_analysis.risks.daily_impact }}</p>
            </div>
          </div>
        </section>

        <!-- 3. 个性化调理建议（标签切换+动态渲染） -->
        <section class="suggestion-section">
          <h2 class="section-title">个性化调理建议</h2>
          <div class="suggestion-tabs">
            <button
              class="tab-btn"
              :class="{ active: suggestionTab === 'products' }"
              @click="suggestionTab = 'products'"
            >
              产品推荐
            </button>
            <button
              class="tab-btn"
              :class="{ active: suggestionTab === 'projects' }"
              @click="suggestionTab = 'projects'"
            >
              项目推荐
            </button>
            <button
              class="tab-btn"
              :class="{ active: suggestionTab === 'diet' }"
              @click="suggestionTab = 'diet'"
            >
              饮食调理
            </button>
            <!-- <button
              class="tab-btn"
              :class="{ active: suggestionTab === 'acupoints' }"
              @click="suggestionTab = 'acupoints'"
            >
              穴位保健
            </button> -->
            <button
              class="tab-btn"
              :class="{ active: suggestionTab === 'DailyCare' }"
              @click="suggestionTab = 'DailyCare'"
            >
              日常护理
            </button>
          </div>

          <!-- 动态切换内容 -->
          <div class="suggestion-content">
            <!-- 产品推荐（循环渲染+展开详情交互） -->
            <div v-if="suggestionTab === 'products'" class="products-container">
              <div
                class="product-card"
                v-for="(product, idx) in apiData.recommendations.products"
                :key="idx"
              >
                <div class="product-img">
                  <!-- 图片占位符兜底 -->
                  <img
                    :src="product.image_url"
                    :alt="product.name"
                    @error="handleImgError($event, 'product')"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <!-- <div class="product-price">{{ product.price }}</div> -->
                  <div class="project-price">
                    {{ product.price }}
                    <span style="color: rgb(135 135 135); font-weight: 500">{{
                      product.Specification
                    }}</span>
                  </div>
                  <div class="product-desc">
                    <p><strong>功效:</strong> {{ product.efficacy }}</p>
                    <!-- 展开/收起详情 -->
                    <div class="product-detail">
                      <p><strong>使用周期:</strong> {{ product.use_cycle }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 项目推荐（循环渲染+展开详情） -->
            <div v-else-if="suggestionTab === 'projects'" class="products-container">
              <div
                class="product-card"
                v-for="(project, idx) in apiData.recommendations.projects"
                :key="idx"
                @click="toggleProjectExpand(idx)"
              >
                <div class="product-img">
                  <img
                    :src="project.image_url || defaultProjectImg"
                    :alt="project.name"
                    @error="handleImgError($event)"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ project.name }}</h3>
                  <div class="product-meta">
                    <span class="project-price">
                      {{ project.price }}
                      <span style="color: rgb(135 135 135); font-weight: 500">{{
                        project.service_time
                      }}</span>
                    </span>
                  </div>
                  <div class="product-desc">
                    <p><strong>功效:</strong> {{ project.efficacy }}</p>
                    <div class="product-detail">
                      <p><strong>建议周期:</strong> {{ project.suggest_cycle }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 饮食调理 -->
            <div v-else-if="suggestionTab === 'diet'" class="diet-content">
              <div class="diet-card">
                <h3 class="diet-title">推荐食材</h3>
                <p class="diet-food">{{ apiData.recommendations.diet.recommended_food }}</p>
                <h3 class="diet-title">调理功效</h3>
                <p class="diet-efficacy">{{ apiData.recommendations.diet.efficacy }}</p>
              </div>
            </div>

            <!-- 穴位保健（循环渲染） -->
            <div v-else-if="suggestionTab === 'acupoints'" class="acupoints-container">
              <div
                class="acupoint-card"
                v-for="(point, idx) in apiData.recommendations.acupoints"
                :key="idx"
              >
                <h3 class="acupoint-name">{{ idx + 1 + '. ' + point.acupoint_name }}</h3>
                <p class="acupoint-position"><strong>位置:</strong> {{ point.position }}</p>
                <p class="acupoint-method"><strong>保健方法:</strong> {{ point.health_method }}</p>
              </div>
            </div>
          </div>

          <!-- 日常护理建议（补充动态渲染） -->
          <div class="daily-care-section" v-if="suggestionTab === 'DailyCare'">
            <h3 class="daily-care-title">日常护理注意事项</h3>
            <ul class="daily-care-list">
              <li v-for="(item, idx) in apiData.recommendations.daily_care" :key="idx">
                {{ item }}
              </li>
            </ul>
          </div>
        </section>

        <!-- 4. 病症发展解读（动态渲染） -->
        <section class="development-section">
          <h2 class="section-title">脚疾隐患解读</h2>
          <div class="development-content-wrapper">
            <div class="development-content">
              <div class="development-item">
                <h3 class="development-title">发展程度:</h3>
                <p>{{ apiData.disease_detail.severity_level }}</p>
              </div>
              <div class="development-item">
                <h3 class="development-title">发展阶段:</h3>
                <p>{{ apiData.disease_detail.disease_stage }}</p>
              </div>
              <div class="development-item">
                <h3 class="development-title">影响范围:</h3>
                <p>{{ apiData.disease_detail.affected_range }}</p>
              </div>
            </div>
            <!-- 足部图解（保留默认图，可替换为API图片） -->
            <div class="foot-illustration">
              <img src="@/assets/zksstatic/foot.png" alt="足部病症位置图解" />
            </div>
          </div>
        </section>

        <!-- 5. 底部提示（动态渲染） -->
        <div class="bottom-note">
          <p>
            {{ apiData.final_diagnosis }}
          </p>
        </div>
        <div class="disclaimer">
          <p>
            感谢使用足康树检测系统，本分析仅为参考，不能替代医生的诊断和治疗建议。祝您早日康复！。
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// 导入依赖
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import CircularProgress from '@/components/common/CircularProgress.vue'
import zksAPI from '@/api/zks.js'
import HeartLoading from '@/components/common/vue/HeartLoading.vue'
import CubeLoader from '@/components/common/vue/CubeLoading.vue'
import router from '@/router'

// 路由实例
const route = useRoute()

// 1. 标签切换状态（ref 声明简单响应式数据）
const healthAnalysisTab = ref('cause') // 健康分析默认选中「病原原因」
const suggestionTab = ref('products') // 调理建议默认选中「产品推荐」

// 2. 展开/收起状态（reactive 声明复杂响应式对象）
const productExpanded = reactive({}) // {0: true, 1: false} 格式
const projectExpanded = reactive({})

// 3. 默认图片（普通常量，无需响应式）
const defaultProductImg = 'http://crmebapi.com//statics/images/zks_default_product.png' // 产品默认图
const defaultProjectImg = 'http://crmebapi.com//statics/images/zks_default_project.png' // 项目默认图
// 4. 接口数据（reactive 声明复杂响应式对象）
const apiData = reactive({
  age: '',
  gender: '',
  add_time: '',
  final_diagnosis: '',
  overall_result: {
    health_score: 0,
    health_status: '',
    diagnosis: [],
    cause: '',
  },
  health_analysis: {
    symptoms: [],
    risks: {
      risk_index: '',
      complication_risk: '',
      daily_impact: '',
    },
  },
  disease_detail: {
    disease_stage: '',
    affected_range: '',
    severity_level: '',
  },
  recommendations: {
    products: [
      {
        name: '',
        image_url: '',
        price: '',
        Specification: '',
        efficacy: '',
        use_cycle: '',
      },
      {
        name: '',
        image_url: '',
        price: '',
        Specification: '',
        efficacy: '',
        use_cycle: '',
      },
    ],
    projects: [],
    diet: {
      recommended_food: '',
      efficacy: '',
    },
    acupoints: [],
    daily_care: [],
  },
})
const isLoading = ref(true)

// 获取报告详情的方法
const fetchReportDetail = (id) => {
  console.log('apiData初始值', apiData)
  console.log('请求的报告ID', id)

  // 记录开始时间
  const startTime = Date.now()

  // 调用接口获取报告详情（Vue3 直接使用导入的 API 模块，无 this）
  zksAPI
    .getReportDetail(id)
    .then((response) => {
      // 计算已用时间
      const elapsed = Date.now() - startTime
      // 确保至少3秒加载时间
      const minLoadingTime = 1500
      const remainingTime = Math.max(0, minLoadingTime - elapsed)

      // 延迟更新数据和隐藏加载动画
      setTimeout(() => {
        // 响应式对象直接赋值更新
        Object.assign(apiData, response.data)
        console.log('接口返回的apiData', apiData)
        isLoading.value = false // 加载完成，隐藏动画
      }, remainingTime)
    })
    .catch((err) => {
      console.error('获取报告失败:', err)
      // 即使出错也要确保最少显示3秒加载动画
      const elapsed = Date.now() - startTime
      const minLoadingTime = 3000
      const remainingTime = Math.max(0, minLoadingTime - elapsed)

      setTimeout(() => {
        ElMessage.error('加载报告失败，请稍后重试')
        isLoading.value = false // 失败也隐藏动画
      }, remainingTime)
    })
}

// 生命周期：组件挂载后执行
onMounted(() => {
  // 获取路由参数 id
  const id = route.query.reportId || '6'
  fetchReportDetail(id)
})

// 监听路由变化，当reportId改变时重新获取数据
watch(
  () => route.query.reportId,
  (newId, oldId) => {
    if (newId !== oldId) {
      isLoading.value = true
      fetchReportDetail(newId || '6')
    }
  }
)

// 页面方法（直接声明函数，无需放在 methods 中）
const backhome = () => {
  router.replace('/zks') // Vue3 用 useRouter 获取的路由实例跳转
}
const shareReport = () => {
  ElMessage.info('分享功能正在开发中，敬请期待！')
  // router.push('/zks?share=true')
}
const image_restart_count = ref(0)
const handleImgError = (event, type = 'product') => {
  // 最多重试3次
  if (image_restart_count.value < 3) {
    // 获取当前图片元素
    const img = event.target
    // 初始化重试次数（存放在元素自定义属性中）
    img.retryCount = img.retryCount || 0
    image_restart_count.value++
    // 设置默认图
    setTimeout(() => {
      img.src = type === 'product' ? defaultProductImg : defaultProjectImg
    }, 15000) // 15秒后重试加载图片
  } else {
    console.log('图片加载失败，使用默认图')
    // // 超过3次，使用本地占位图（需提前在assets文件夹放置）
    // img.src = '@/assets/zksstatic/default-placeholder.png'
    // 或直接隐藏图片
    // img.style.display = 'none';
  }
}
</script>
<style lang="scss" scoped>
body {
  margin: 0px;
}
/* 加载动画容器：全屏居中 */
.loading-container {
  min-height: calc(100vh - 100px); /* 适配页面高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 样式部分无任何修改，完全保留原逻辑 */
.health-report {
  min-height: 100vh;
  background-color: #f4f6fb;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(180deg, #f0f2fd 0%, #eaedf5 100%);
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #eff1fc;
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;

  .back-btn,
  .share-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    font-size: 25px;
    cursor: pointer;
    color: #000000;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f0f0f0;
    }
  }

  .report-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.report-content {
  padding: 10px;
}

.diagnosis-section {
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 18px;
  // box-shadow: 0 6px 18px rgba(10, 22, 50, 0.06);
  position: relative;
  top: 10px;

  .diagnosis-result {
    margin-bottom: 10px;

    h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0;

      .result-text {
        color: #e74c3c;
        font-weight: 700;
        margin-left: 6px;
      }
    }
  }

  .diagnosis-row {
    display: flex;
    gap: 12px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .diagnosis-left {
      flex: 1 0 45%;

      .basic-info {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 12px;
        margin-top: 12px;

        .info-item {
          display: flex;
          align-items: center;
          width: 100%;

          .info-label {
            color: #7f8c8d;
            margin-right: 6px;
            font-size: 14px;
          }

          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #2c3e50;
          }

          .risk-level-7 {
            color: #d35400;
          }
        }
      }
    }

    .diagnosis-right {
      flex: 0 0 42%;
      display: flex;
      justify-content: center;

      .health-score {
        position: relative;

        .outer-circle {
          position: absolute;
          width: 100%;
          height: 0;
          padding-top: 100%;
          border-radius: 50%;
          background-color: #fff;
          // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          z-index: 0;
        }

        .score-circle.semi-circle {
          position: relative;
          width: 200px;
          height: auto;
          z-index: 2;

          .score-ring {
            .progress-circle {
              transition: stroke-dashoffset 1s ease-in-out;
              animation: progressAnimation 1s ease-in-out;
            }

            @keyframes progressAnimation {
              from {
                stroke-dashoffset: 565.48;
              }
              to {
                stroke-dashoffset: var(dashOffset);
              }
            }
          }

          .score-text {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -30%);
            text-align: center;

            .score-bg {
              position: absolute;
              top: 45%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background: url(#textBgGradient);
              z-index: -1;
            }

            .score-value {
              font-size: 44px;
              font-weight: 800;
              color: #2c3e50;
              line-height: 1;
              position: relative;
              z-index: 2;
            }

            .score-status {
              font-size: 14px;
              color: #95a5a6;
              margin-top: 6px;
              position: relative;
              z-index: 2;
            }
          }
        }
      }
    }
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background-color: #3498db;
    border-radius: 2px;
    margin-right: 8px;
  }
}

.analysis-section .section-title::before {
  background-color: #27ae60;
}

.suggestion-section .section-title::before {
  background-color: #8e44ad;
}

.analysis-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  // box-shadow: 0 4px 10px rgba(98, 102, 97, 0.62);

  .analysis-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
    overflow-x: auto;
    padding-bottom: 4px;
    border-bottom: 1px solid #eee;

    // 隐藏 WebKit 滚动条
    ::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    .tab-btn {
      padding: 8px 8px;
      background: none;
      border: none;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      transition: color 0.3s ease;

      &.active {
        color: #057e0f;
        font-weight: 700;
        background: rgb(188 255 216 / 71%);
        border-radius: 18px;
        padding: 6px 12px;
      }

      &:not(:last-child) {
        margin-right: 8px;
      }

      &:hover {
        color: #057e0f;
      }
    }
  }

  .analysis-content {
    font-size: 15px;
    line-height: 1.6;
    color: #2c3e50;
    padding: 8px 0;
  }
}

.suggestion-section {
  background-color: #fbf5ff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  // box-shadow: 0 4px 10px rgba(98, 102, 97, 0.62);

  .suggestion-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    margin-bottom: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
    // 不显示进度杆
    ::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      padding: 8px 8px;
      background: none;
      border: none;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      transition: color 0.3s ease;

      &.active {
        color: #8e44ad;
        font-weight: 700;
        background: rgba(142, 68, 173, 0.08);
        border-radius: 18px;
        padding: 6px 12px;
      }

      &:not(:last-child) {
        margin-right: 8px;
      }

      &:hover {
        color: #9b59b6;
      }
    }
  }

  .products-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .product-card {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    flex-direction: row;
    background: linear-gradient(90deg, #f3fbff 0%, #f7fdff 100%);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(30, 100, 120, 0.06);
    }

    .product-img {
      width: 90px;
      height: 90px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        max-width: 300px;
        max-height: 300px;
        object-fit: contain;
        background: #fff;
        padding: 6px;
      }
    }

    .product-info {
      flex-grow: 1;

      .product-name {
        font-size: 16px;
        font-weight: 700;
        margin: 0 0 6px 0;
        color: #2c3e50;
        // 字体放在左边
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }

      .product-price {
        color: #e74c3c;
        font-weight: 800;
        margin-bottom: 8px;
        font-size: 15px;
      }
      .project-price {
        color: #e74c3c;
        font-weight: 800;
        font-size: 15px;
        display: flex;
        justify-content: space-between;
        padding-right: 10px;
      }

      .product-desc {
        font-size: 13px;
        color: #5b6b6b;
        line-height: 1.5;

        p {
          margin: 0 0 4px 0;
        }

        strong {
          color: #2c3e50;
        }
      }
    }
  }
}

.development-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  // box-shadow: 0 4px 10px rgba(98, 102, 97, 0.62);
  .development-content-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .development-content {
    display: flex;
    flex-direction: column;
    flex: 1 0 60%;
    .development-item {
      margin-bottom: 16px;

      .development-title {
        font-size: 15px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: #333;
      }

      p {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin: 0;
      }
    }
  }
  .foot-illustration {
    display: flex;
    justify-content: flex-start;
    margin-top: 16px;
    flex: 1 1 40%;
    align-self: flex-start;
    transform: translateY(-50px);

    img {
      width: 100%;
      height: auto;
      max-width: 300px;
      max-height: 300px;
      border-radius: 8px;
      // max-height: 400px;
      object-fit: contain;
    }
  }
}

.bottom-note {
  background-color: #e8f4fd;
  border-left: 4px solid #3498db;
  border-radius: 0 8px 8px 0;
  padding: 16px;
  font-size: 14px;
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 30px;
}
.disclaimer {
  padding: 15px;
  //居中
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  color: #666;
}

@media (max-width: 375px) {
  .report-content {
    padding: 15px;
  }

  .product-card {
    flex-direction: row;
    align-items: flex-start;
    text-align: flex-start;
  }

  .basic-info {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

@media (max-width: 420px) {
  .diagnosis-row {
    flex-direction: column;
    align-items: flex-start;

    .diagnosis-right {
      width: 100%;
      display: flex;
      justify-content: flex-start;

      .score-circle.large {
        width: 120px;
        height: 120px;

        .score-text .score-value {
          font-size: 28px;
        }
      }
    }
  }

  .product-card {
    width: 100%;
    box-sizing: border-box;
  }

  .basic-info .info-item {
    width: 100%;
  }
}
</style>
