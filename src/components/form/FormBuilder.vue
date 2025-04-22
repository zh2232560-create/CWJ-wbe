<!-- FormBuilder.vue -->
<template>
  <el-form :model="form" label-width="auto" style="max-width: 800px">
    <!-- 会议基本信息 -->
    <el-form-item>
      <h3><span style="color: red">*</span> 会议主题</h3>
      <el-input v-model="form.title" placeholder="请输入会议主题" :disabled="isVisitor" />
    </el-form-item>
    <!-- 新增会议地点选择 -->
    <el-form-item>
      <h3><span style="color: red">*</span>会议地点</h3>
      <el-select
        v-model="form.location"
        placeholder="请选择会议地点"
        style="width: 100%"
        :disabled="isVisitor"
        loading-text="加载中..."
        :loading="locationsLoading"
      >
        <el-option
          v-for="location in meetingLocations"
          :key="location.value"
          :label="location.label"
          :value="location.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <h3><span style="color: red">*</span>会议议程</h3>
      <el-input
        v-model="form.agenda"
        :autosize="{ minRows: 2, maxRows: 7 }"
        type="textarea"
        placeholder="请输入会议议程"
        :disabled="isVisitor"
      />
    </el-form-item>

    <h4><span style="color: red">*</span>会议时间</h4>
    <!-- 修改日期和时间选择器部分 -->
    <el-form-item>
      <el-col :span="12">
        <el-date-picker
          v-model="form.meetingDate"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          :disabled="isVisitor"
          :disabled-date="disabledDate"
        />
      </el-col>
      <el-col :span="1" class="text-center">
        <span class="text-gray-500">-</span>
      </el-col>
      <el-col :span="11">
        <el-time-picker
          v-model="form.meetingTime"
          placeholder="选择时间"
          style="width: 100%"
          :disabled="isVisitor"
          format="HH:mm"
          :disabled-hours="disabledHours"
          clearable
        ></el-time-picker>
      </el-col>
    </el-form-item>

    <!-- 来访人员信息 -->
    <el-divider />
    <h3>来访信息</h3>
    <div class="visitor-type-buttons">
      <el-button type="primary" @click="addUnit">单位来访</el-button>
    </div>

    <!-- 单位来访列表 -->
    <div v-for="(unit, unitIndex) in form.units" :key="'unit-' + unitIndex" class="visitor-unit">
      <el-card shadow="hover">
        <div class="unit-header">
          <h4>单位 {{ unitIndex + 1 }}</h4>
          <el-button type="danger" size="small" circle @click="removeUnit(unitIndex)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <el-form-item label="单位名称">
          <el-input v-model="unit.name" placeholder="请输入单位名称" />
        </el-form-item>

        <div
          v-for="(member, memberIndex) in unit.members"
          :key="'member-' + memberIndex"
          class="member-item"
        >
          <el-card shadow="never" class="member-card">
            <div class="member-header">
              <span>人员 {{ memberIndex + 1 }}</span>
              <el-button
                type="danger"
                size="small"
                text
                @click="removeMember(unitIndex, memberIndex)"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </div>

            <el-form-item label="姓名">
              <el-input v-model="member.name" placeholder="请输入姓名" />
            </el-form-item>

            <el-form-item label="职务">
              <el-input v-model="member.position" placeholder="请输入职务" />
            </el-form-item>
            <!-- 新增车牌号输入 -->
            <el-form-item label="车牌号">
              <el-input
                v-model="member.plateNumber"
                placeholder="请输入车牌号（如：粤A12345）"
                maxlength="8"
                show-word-limit
              />
            </el-form-item>
          </el-card>
        </div>

        <el-button type="primary" plain @click="addMember(unitIndex)" class="add-member-btn">
          <el-icon><Plus /></el-icon>添加人员
        </el-button>
      </el-card>
    </div>

    <!-- 操作按钮区域 -->
    <el-form-item>
      <div class="action-buttons">
        <!-- 创建会议/提交修改按钮 -->
        <el-button type="success" size="large" round @click="handleSubmit" style="width: 200px">
          {{ isCreatePage ? '创建会议' : '提交修改' }}
        </el-button>

        <!-- 管理员专属按钮 -->
        <el-button
          v-if="isAdmin && !isCreatePage"
          type="primary"
          size="large"
          round
          @click="handleConfirmAndGenerate"
          style="width: 200px; margin-left: 20px"
        >
          确认并生成手册
        </el-button>

        <!-- 接待员专属按钮 -->
        <!-- <el-button
          v-if="isReceptionist && !isCreatePage" 
          type="warning"
          size="large"
          round
          @click="handleConfirmInfo"
          style="width: 200px; margin-left: 20px"
        >
          确认人员信息
        </el-button> -->
      </div>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, computed, ref, watch } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import MeetingAPI from '@/api/meeting' // 引入获取会议地点的API
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      location: '', // 新增location字段
      agenda: '1.参观研究院展厅、观看宣传片\n2.数据空间研究院建设情况介绍\n3.座谈交流\n',
      meetingDate: '',
      meetingTime: '',
      units: [],
      individuals: [],
    }),
  },
  isCreatePage: {
    type: Boolean,
    default: false,
  },
})
//-===========================-data--=====================================
// const form = reactive({
//   title: props.initialData.title,
//   location: props.initialData.location, // 初始化location
//   agenda: props.initialData.agenda,
//   meetingDate: props.initialData.meetingDate,
//   meetingTime: props.initialData.meetingTime,
//   units: props.initialData.units || [],
//   individuals: props.initialData.individuals || [],
// })
// 1. 使用watch响应initialData变化
const form = reactive({ ...props.initialData })

watch(
  () => props.initialData,
  (newVal) => {
    Object.keys(newVal).forEach((key) => {
      form[key] = newVal[key]
    })
  },
  { deep: true },
)
// 使用ref定义会议地点数据
const meetingLocations = ref<Array<{ value: string; label: string }>>([])
const locationsLoading = ref(false)
// 计算属性
const isVisitor = computed(() => props.user.role === 'visitor')
const isAdmin = computed(() => props.user.role === 'admin')
const isReceptionist = computed(() => props.user.role === 'receptionist')
// ======================================组件挂载=========================================
// 在组件挂载时获取会议地点数据
onMounted(() => {
  fetchMeetingLocations()
})
// 来访人员操作方法
const addUnit = () => {
  form.units.push({
    name: '',
    members: [{ name: '', position: '' }],
  })
}

const addMember = (unitIndex: number) => {
  form.units[unitIndex].members.push({
    name: '',
    position: '',
    plateNumber: '', // 新增车牌号字段
  })
}

const removeUnit = (index: number) => {
  form.units.splice(index, 1)
}

const removeMember = (unitIndex: number, memberIndex: number) => {
  form.units[unitIndex].members.splice(memberIndex, 1)
}

// 事件发射
const emit = defineEmits(['submit', 'confirm-and-generate', 'confirm-info'])
// 2. 确保日期处理正确
const handleSubmit = () => {
  const submitData = {
    ...form,
    meetingTime: combineDateTime(form.meetingDate, form.meetingTime),
  }
  emit('submit', submitData)
}
// 管理员确认并生成模板
const handleConfirmAndGenerate = () => {
  const submitData = {
    ...form,
    meetingTime: combineDateTime(form.meetingDate, form.meetingTime),
  }
  emit('confirm-and-generate', submitData)
}

// 接待员确认信息
const handleConfirmInfo = () => {
  emit('confirm-info', form)
}
// 合并日期和时间
const combineDateTime = (date: string, time: string) => {
  if (!date || !time) return ''
  const dateObj = new Date(date)
  const timeObj = new Date(time)
  dateObj.setHours(timeObj.getHours())
  dateObj.setMinutes(timeObj.getMinutes())
  return dateObj.toISOString()
}
// 获取会议地点数据的方法
const fetchMeetingLocations = () => {
  locationsLoading.value = true
  try {
    const res = MeetingAPI.getPlaceList().then((res) => {
      if (res.status === 200) {
        // 将接口数据转换为el-select需要的格式
        meetingLocations.value = res.data.data.map((item) => ({
          value: item.identifier,
          label: item.name,
        }))
      }
    })
  } catch (error) {
    console.error('获取会议地点失败:', error)
    // 可以设置默认值或显示错误信息
    meetingLocations.value = [
      { value: 'conference_room_1', label: '第一会议室' },
      { value: 'conference_room_2', label: '第二会议室' },
    ]
  } finally {
    locationsLoading.value = false
  }
}

// 禁用今天之前的日期
const disabledDate = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return time.getTime() < today.getTime()
}

// 禁用小时（如果需要可以限制特定小时）
const disabledHours = () => {
  return [] // 不禁用任何小时
}

const disabledMinutes = () => {
  const allowedMinutes = [0, 30, 50]
  const disabled = []
  for (let i = 0; i < 60; i++) {
    if (allowedMinutes.indexOf(i) === -1) {
      disabled.push(i) // 禁用非 0、30、50 的分钟
    }
  }
  return disabled
}
</script>

<style scoped lang="scss">
.center-btn {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-top: 20px;
}

.visitor-type-buttons {
  margin-bottom: 20px;
}

.visitor-unit {
  margin-bottom: 20px;

  .unit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
}

.member-item {
  margin-bottom: 20px;

  .member-card {
    margin-top: 10px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;

    .member-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .el-form-item {
      margin-bottom: 15px;

      :deep(.el-form-item__label) {
        font-weight: normal;
      }
    }
  }
}

.add-member-btn {
  width: 100%;
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}
.member-card {
  .el-form-item {
    margin-bottom: 15px;

    // 车牌号特殊样式
    &:last-child {
      margin-bottom: 10px;
    }
  }
}
</style>
