<template>
  <!-- 加载中显示动画 -->
  <div v-if="isLoading" class="loading-container">
    <HeartLoading size="40px" color="#1ECBE1" text="正在诊断..." />
  </div>
  <div class="disease-classification" v-else>
    <!-- 标题区域 -->
    <div class="title-section">
      <h3>病症分类选择</h3>
      <p>请选择对应的病症分类（可多选，"正常"与其他病症互斥）</p>
    </div>

    <!-- 内容区域 -->
    <div>
      <!-- 当前选中展示 -->
      <div class="selected-tags">
        <div class="tags-label">初始诊断分类：</div>
        <div class="tags-container">
          <el-tag
            v-for="item in selectedItems"
            :key="item.id"
            closable
            @close="handleTagClose(item)"
            type="primary"
            effect="light"
            class="custom-tag"
          >
            {{ item.name }}
          </el-tag>
          <span v-if="selectedItems.length === 0" class="empty-tip">未选择任何分类</span>
        </div>
      </div>

      <!-- 多选框区域 -->
      <div class="checkbox-section">
        <el-checkbox-group
          v-model="selectedIds"
          @change="handleSelectionChange"
          class="checkbox-group"
        >
          <el-checkbox
            v-for="item in classificationList"
            :key="item.id"
            :value="item.id"
            :disabled="isDisabled(item.id)"
            class="disease-checkbox"
          >
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 生成报告按钮 -->
      <el-button
        type="primary"
        class="generate-btn"
        @click="generateReport"
        :disabled="selectedItems.length === 0"
      >
        生成报告
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import zksAPI from '@/api/zks.js'
import HeartLoading from '@/components/common/vue/HeartLoading.vue'
import { useRoute } from 'vue-router' // 新增：引入路由工具

// 新增：获取路由参数
const route = useRoute()
const diagnosisId = ref('')
// 状态管理
const classificationList = ref([]) // 所有病症分类列表
const selectedIds = ref([]) // 选中的ID数组
const isLoading = ref(true) // 加载状态
// 获取正常分类的ID（用于互斥判断）
const normalId = computed(() => {
  const normalItem = classificationList.value.find((item) => item.name === '正常')
  return normalItem ? normalItem.id : null
})

// 初始化数据
onMounted(() => {
  // 新增：从路由参数中获取id
  diagnosisId.value = route.query.id || ''
  // 先获取分类列表，再获取初始诊断结果
  fetchClassificationList().then(() => {
    fetchInitialDiagnosis()
  })
})

// 计算属性：当前选中的项目
const selectedItems = computed(() => {
  return classificationList.value.filter((item) => selectedIds.value.includes(item.id))
})

// 判断是否禁用某个选项（互斥逻辑）
const isDisabled = (id) => {
  // 如果当前选项是"正常"
  if (id === normalId.value) {
    // 当有其他选项被选中时，禁用"正常"
    return selectedIds.value.length > 0 && !selectedIds.value.includes(normalId.value)
  } else {
    // 当"正常"被选中时，禁用其他选项
    return selectedIds.value.includes(normalId.value)
  }
}

// 处理选择变化
const handleSelectionChange = (values) => {
  // 如果选择了"正常"，清除其他所有选择
  if (values.includes(normalId.value)) {
    selectedIds.value = [normalId.value]
  }
  console.log('当前选中的分类ID：', values)
}

// 处理标签关闭
const handleTagClose = (item) => {
  selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
  ElMessage.info(`已移除 ${item.name}`)
}

// 生成报告
const generateReport = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请至少选择一种病症分类')
    return
  }

  // 实际应用中可调用后端接口生成报告
  const selectedNames = selectedItems.value.map((item) => item.name).join('、')
  ElMessage.success(`报告生成成功！包含分类：${selectedNames}`)

  // 打印选中的数据（实际项目中可传递给后端）
  console.log('生成报告的参数：', {
    selectedIds: selectedIds.value,
    selectedItems: selectedItems.value,
  })
}

// 获取病症分类列表接口调用
const fetchClassificationList = async () => {
  try {
    const response = await zksAPI.getCategoryList('1')
    console.log('获取病症分类列表接口返回数据：', response)
    if (response.status === 200) {
      classificationList.value = response.data.classification
      return true
    } else {
      ElMessage.error('获取病症分类列表失败')
      return false
    }
  } catch (error) {
    ElMessage.error('获取病症分类列表失败')
    return false
  }
}

// 修改：获取初始诊断结果时传递id参数
const fetchInitialDiagnosis = async () => {
  // 新增：校验id是否存在
  if (!diagnosisId.value) {
    ElMessage.error('缺少诊断记录ID，无法获取初始诊断结果')
    isLoading.value = false
    return
  }

  try {
    const startTime = Date.now()
    // 修改：传递id参数到接口
    const response = await zksAPI.getDiagnosisCategory({
      id: diagnosisId.value, // 使用路由传递的id
    })
    console.log('获取初始诊断结果：', response)

    if (
      response.status === 200 &&
      response.data.Classification &&
      response.data.Classification.length
    ) {
      const initialNames = response.data.Classification
      const matchedIds = classificationList.value
        .filter((item) => initialNames.includes(item.name))
        .map((item) => item.id)

      if (matchedIds.length) {
        selectedIds.value = matchedIds
      }

      // 确保至少显示1.5秒加载动画
      const elapsedTime = Date.now() - startTime
      const minLoadingTime = 1500
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

      setTimeout(() => {
        isLoading.value = false
      }, remainingTime)
    } else {
      // 接口返回正常但无数据的情况
      setTimeout(() => {
        isLoading.value = false
      }, 1500)
    }
  } catch (error) {
    console.error('获取初始诊断结果失败：', error)
    setTimeout(() => {
      isLoading.value = false
    }, 1500)
  }
}
</script>

<style scoped>
/* 加载动画容器：全屏居中 */
.loading-container {
  min-height: calc(100vh - 100px); /* 适配页面高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.disease-classification {
  max-width: 600px;
  margin: 20px auto;
  padding: 25px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.title-section {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.title-section h3 {
  margin: 0 0 8px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.title-section p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  margin: 20px 0;
  min-height: 50px;
}

.tags-label {
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}
.custom-tag {
  font-size: 15px !important;
  font-weight: 500 !important;
}

.empty-tip {
  color: #999;
  font-style: italic;
  font-size: 14px;
}

.checkbox-section {
  margin: 20px 0 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.disease-checkbox {
  padding: 8px 10px;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 20px !important;
  font-weight: 500 !important;
}

.disease-checkbox:hover {
  background: #f0f7ff;
}

.custom-tag .el-tag__close {
  font-size: 16px !important;
}

.generate-btn {
  display: block;
  width: 100%;
  height: 45px;
  font-size: 16px;
  transition: all 0.3s;
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
