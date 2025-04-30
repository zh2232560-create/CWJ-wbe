<!-- FormBuilder.vue -->
<template>
  <el-form :model="form" label-width="auto" style="max-width: 800px" :rules="rules" ref="formRef">
    <!-- 会议基本信息 -->
    <el-form-item prop="title">
      <el-col :span="24">
        <h3><span style="color: red">*</span> 会议主题</h3>
      </el-col>
      <el-col :span="24">
        <el-input v-model="form.title" placeholder="请输入会议主题" :disabled="isVisitor" />
      </el-col>
    </el-form-item>
    <!-- 新增会议地点选择 -->
    <el-form-item prop="locationGroup">
      <el-col :span="24">
        <h3><span style="color: red">*</span>会议地点</h3>
      </el-col>
      <el-col :span="11">
        <el-select
          v-model="form.firstlocation"
          placeholder="请选择会议地点"
          style="width: 100%"
          :disabled="true"
          loading-text="加载中..."
          :loading="locationsLoading"
        >
          <el-option
            v-for="location in meetingLocations"
            :key="location.value"
            :label="location.label"
            :value="location.value"
          />
        </el-select> </el-col
      ><span style="margin: 0 2px">-</span>
      <el-col :span="12">
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
      </el-col>
    </el-form-item>

    <el-form-item prop="agenda">
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
    <el-form-item prop="meetingDateTime">
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
    <!-- 新增研究院人员信息 -->
    <el-divider />
    <h3>研究院参会人员</h3>
    <div class="research-member-add">
      <span class="institute-name">数据空间研究院</span>
      <el-button
        type="success"
        size="small"
        circle
        @click="toggleMemberSelection"
        class="add-research-btn"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <!-- 研究院人员选择面板 -->
    <el-card
      v-if="showMemberSelection || form.researchMembers.length > 0"
      shadow="hover"
      class="member-selection-panel"
    >
      <el-checkbox-group v-model="selectedResearchMemberNames" @change="handleResearchMemberChange">
        <el-row :gutter="20">
          <el-col :span="8" v-for="(member, index) in researchMemberOptions" :key="index">
            <el-checkbox :label="member.name">{{ member.name }}</el-checkbox>
          </el-col>
        </el-row>
      </el-checkbox-group>
    </el-card>

    <!-- 已添加的研究院人员列表 -->
    <div class="research-member-list">
      <el-card
        shadow="hover"
        v-for="(member, index) in form.researchMembers"
        :key="'research-member-' + index"
        class="member-item"
      >
        <div class="member-header">
          <span>人员 {{ index + 1 }}</span>
          <el-button type="danger" size="small" text @click="removeResearchMember(index)">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </div>
        <el-form-item label="姓名">
          <el-input v-model="member.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="职务">
          <el-input v-model="member.position" placeholder="请输入职务" />
        </el-form-item>
      </el-card>
    </div>

    <!-- 添加研究院人员按钮 -->
    <el-button
      v-if="showMemberSelection || form.researchMembers.length > 0"
      type="primary"
      plain
      @click="addEmptyResearchMember"
      class="add-research-member-btn"
      style="margin-bottom: 20px"
    >
      <el-icon><Plus /></el-icon>添加研究院人员
    </el-button>
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
      firstlocation: '数据空间研究院（工投高新智谷B8座）',
      location: '', // 新增location字段
      agenda: '1.参观研究院展厅、观看宣传片;\n2.数据空间研究院建设情况介绍;\n3.座谈交流。\n',
      meetingDate: '',
      meetingTime: '',
      units: [],
      individuals: [],
      researchMembers: [], // 添加研究院成员字段
    }),
  },
  isCreatePage: {
    type: Boolean,
    default: false,
  },
})
//-===========================data=====================================
const form = reactive({
  ...props.initialData,
  researchMembers: props.initialData.researchMembers || [], // 确保初始化为数组
})
//====================================yanjiuyuan==========================
// 使用传入的研究院成员数据初始化
const showMemberSelection = ref(false)
const selectedResearchMemberNames = ref<string[]>([])
// 研究院人员数据
const researchMemberOptions = ref([
  { name: '王佐成', position: '执行院长' },
  { name: '廖勇', position: '副院长' },
  { name: '洪日昌', position: '副院长' },
  { name: '何向南', position: '副院长' },
  { name: '胡家武', position: '院务会成员、首席专家' },
  { name: '林传文', position: '院务会成员、院长助理' },
  { name: '马韵洁', position: '院务会成员、副总工程师' },
  { name: '王建', position: '院务会成员、副总工程师' },
  { name: '范联伟', position: '院务会成员、副总工程师' },
])

// 切换成员选择面板
const toggleMemberSelection = () => {
  showMemberSelection.value = !showMemberSelection.value
  if (showMemberSelection.value) {
    selectedResearchMemberNames.value = form.researchMembers
      .filter((member) => researchMemberOptions.value.some((opt) => opt.name === member.name))
      .map((member) => member.name)
  }
}

// 处理成员选择变化
const handleResearchMemberChange = (selectedNames: string[]) => {
  const manualMembers = form.researchMembers.filter(
    (member) => !researchMemberOptions.value.some((opt) => opt.name === member.name),
  )
  const selectedMembers = selectedNames.map((name) => {
    const option = researchMemberOptions.value.find((opt) => opt.name === name)
    return { ...option! }
  })
  form.researchMembers = [...manualMembers, ...selectedMembers]
}

// 添加空白研究院成员
const addEmptyResearchMember = () => {
  form.researchMembers.push({
    name: '',
    position: '',
  })
  // console.log('添加空白研究院成员', form.researchMembers)
}

// 删除研究院成员
const removeResearchMember = (index: number) => {
  const removedMember = form.researchMembers[index]
  form.researchMembers.splice(index, 1)
  if (researchMemberOptions.value.some((opt) => opt.name === removedMember.name)) {
    selectedResearchMemberNames.value = selectedResearchMemberNames.value.filter(
      (name) => name !== removedMember.name,
    )
  }
}

// 修改 mergeResearchMembersToUnits 方法
const mergeResearchMembersToUnits = () => {
  // 确保过滤有效成员
  const validMembers = form.researchMembers.filter(
    (member) => member && member.name && member.name.trim() !== '',
  )

  // 查找或创建研究院单位
  let researchUnit = form.units.find((unit) => unit.name === '数据空间研究院')

  if (!researchUnit && validMembers.length > 0) {
    researchUnit = {
      name: '数据空间研究院',
      members: [...validMembers],
    }
    form.units.push(researchUnit)
  } else if (researchUnit) {
    researchUnit.members = [...validMembers]
  }

  return {
    ...form,
    researchMembers: validMembers,
  }
}

const updateSelectedResearchMembers = () => {
  selectedResearchMemberNames.value = (form.researchMembers || [])
    .filter(
      (member) =>
        member?.name && researchMemberOptions.value.some((opt) => opt.name === member.name),
    )
    .map((member) => member.name)
}
//================================================================================
watch(
  () => props.initialData,
  (newVal) => {
    Object.assign(form, {
      ...newVal,
      researchMembers: newVal.researchMembers || [],
    })
    updateSelectedResearchMembers()
  },
  { deep: true, immediate: true },
)
// 使用ref定义会议地点数据
const meetingLocations = ref<Array<{ value: string; label: string }>>([])
const locationsLoading = ref(false)
// 计算属性
const isVisitor = computed(() => props.user.role === 'visitor')
const isAdmin = computed(() => props.user.role === 'admin')
const isReceptionist = computed(() => props.user.role === 'receptionist')
const formRef = ref() // 表单引用
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
const validateLocationGroup = (rule: any, value: any, callback: any) => {
  if (!form.firstlocation) {
    callback(new Error('请选择第一会议地点'))
  } else if (!form.location) {
    callback(new Error('请选择第二会议地点'))
  } else {
    callback()
  }
}
// 表单验证规则
const rules = reactive({
  title: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
  locationGroup: [{ validator: validateLocationGroup, trigger: 'change' }],
  agenda: [{ required: true, message: '请输入会议议程', trigger: 'blur' }],
  meetingDate: [{ required: true, message: '请选择会议日期', trigger: 'change' }],
  meetingTime: [{ required: true, message: '请选择会议时间', trigger: 'change' }],
  firstlocation: [{ required: true, message: '请选择第一会议地点', trigger: 'change' }],
  location: [{ required: true, message: '请选择第二会议地点', trigger: 'change' }],
})

// 2. 确保日期处理正确
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (!form.title || !form.location || !form.agenda || !form.meetingDate || !form.meetingTime) {
        ElMessage.error('请填写所有必填信息！')
        return
      }
      // 合并研究院成员到单位列表
      const mergedData = mergeResearchMembersToUnits()
      const submitData = {
        ...mergedData,
        meetingTime: combineDateTime(form.meetingDate, form.meetingTime),
      }
      emit('submit', submitData)
    } else {
      ElMessage.error('请填写完整信息！')
    }
  })
}
// 管理员确认并生成模板
const handleConfirmAndGenerate = () => {
  // 合并研究院成员到单位列表
  handleSubmit()
  const mergedData = mergeResearchMembersToUnits()
  const submitData = {
    ...mergedData,
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
    // console.error('获取会议地点失败:', error)
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

// ======================================组件挂载=========================================
// 在组件挂载时获取会议地点数据
onMounted(() => {
  fetchMeetingLocations()

  // // 从初始数据中提取研究院成员
  // if (props.initialData.researchMembers && props.initialData.researchMembers.length > 0) {
  //   form.researchMembers = [...props.initialData.researchMembers]
  // } else if (props.initialData.units) {
  //   const researchUnit = props.initialData.units.find((unit) => unit.name === '数据空间研究院')
  //   if (researchUnit) {
  //     form.researchMembers = [...researchUnit.members]
  //   }
  // }
  // 初始化选中状态
  updateSelectedResearchMembers()
})
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

/* 新增研究院人员样式 */
.research-member-list {
  margin-bottom: 20px;

  .member-item {
    margin-bottom: 15px;
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
    }
  }
}
.research-member-add {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  .institute-name {
    flex: 1;
    padding: 0 25px;
    font-size: 16px;
    font-weight: 500;
  }

  .add-research-btn {
    margin-right: 25px;
    background-color: #67c23a;
    color: white;
    border: none;

    &:hover {
      background-color: #5daf34;
    }
  }
}

.member-selection-panel {
  margin-bottom: 20px;
  padding: 15px;

  .el-checkbox-group {
    width: 100%;
  }

  .el-col {
    margin-bottom: 10px;
  }
}

.add-research-member-btn {
  width: 100%;
  margin-bottom: 20px;
}
</style>
