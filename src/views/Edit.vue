<!-- edit.vue -->
<template>
  <div v-if="!showResult">
    <FormBuilder
      :user="currentUser"
      :initial-data="meetingData"
      @submit="handleSubmit"
      @confirm-and-generate="handleGenerateDoc"
      @confirm-info="handleConfirmInfo"
    />
  </div>

  <div v-else class="result-container">
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <el-icon class="success-icon"><CircleCheck /></el-icon>
          <span class="result-title">会议手册生成成功</span>
        </div>
      </template>

      <div class="result-content">
        <div class="help-tip">
          <el-icon class="tip-icon"><InfoFilled /></el-icon>
          <span class="tip-text">如果下载未自动开始，请复制下方链接到浏览器地址栏访问</span>
        </div>
        <div class="document-section">
          <h4 class="section-title">会议手册下载</h4>
          <div class="url-display">
            <el-input v-model="generatedDocUrl" readonly size="large" class="url-input">
              <template #append>
                <el-button-group class="action-buttons">
                  <el-button
                    type="primary"
                    @click="copyDocumentUrl"
                    title="复制链接"
                    class="icon-btn"
                  >
                    <el-icon color="#ffffff"><DocumentCopy /></el-icon>
                  </el-button>
                  <el-button
                    type="success"
                    @click="downloadDocument"
                    title="下载手册"
                    class="icon-btn"
                  >
                    <el-icon color="#ffffff"><Download /></el-icon>
                  </el-button>
                </el-button-group>
              </template>
            </el-input>
          </div>
        </div>
        <div class="document-section">
          <h4 class="section-title">来访人员车牌复制</h4>
          <div class="url-display">
            <el-input v-model="licensePlate" readonly size="large" class="url-input">
              <template #append>
                <el-button-group class="action-buttons">
                  <el-button
                    type="primary"
                    @click="copyplateNumber"
                    title="复制车牌"
                    class="icon-btn"
                  >
                    <el-icon color="#ffffff"><DocumentCopy /></el-icon>
                  </el-button>
                </el-button-group>
              </template>
            </el-input>
          </div>
        </div>

        <div class="action-section">
          <el-button plain size="large" @click="showResult = false" class="action-btn">
            <el-icon><Back /></el-icon>
            返回编辑
          </el-button>
          <el-button type="primary" size="large" @click="closePage" class="action-btn">
            <el-icon><Check /></el-icon>
            完成并退出
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FormBuilder from '@/components/form/FormBuilder.vue'
import MeetAPI from '@/api/meeting'
import { BASE_URL } from '@/setting'
// =======================================data==================================
const route = useRoute()
const router = useRouter()
// 从 URL 中获取 user 参数
const url_id = ref(route.query.id || '') // 默认为空字符串
const url_user = ref(route.query.user || '')

const pagename = ref('')
const currentUser = ref({
  role: '', // 可以是 'admin', 'receptionist' 或 'visitor'
})
//车牌数据
const licensePlate = ref('')
// 新增的状态
const showResult = ref(false)
const generatedDocUrl = ref('')
// 1. 清空默认数据
const meetingData = ref({
  title: '',
  firstlocation: '数据空间研究院（工投高新智谷B8座）',
  location: '',
  agenda: '',
  meetingDate: null,
  meetingTime: null,
  units: [],
  individuals: [],
  researchMembers: [], // 添加研究院成员字段
})
//---==================================onMounted================================
onMounted(() => {
  // 确保正确设置用户角色
  currentUser.value.role = url_user.value || 'visitor' // 使用.value修改ref
  // 设置页面标题
  pagename.value =
    currentUser.value.role === 'admin'
      ? '管理员'
      : currentUser.value.role === 'receptionist'
        ? '接待员'
        : '访客'
  if (url_id.value) {
    // 如果url_id存在，则调用API获取数据
    url_id.value = deobfuscateId(url_id.value)
    // console.log('url_id', url_id.value)
    getMeetDetail(url_id.value)
  }
})

//---========================-methods-===========================----
// 解码
function deobfuscateId(encoded) {
  try {
    return encoded ? parseInt(atob(encoded)) : null
  } catch (e) {
    console.error('ID解码失败:', e)
    return null
  }
}
const handleSubmit = (submitData) => {
  try {
    // 为submitData加上id
    submitData.id = url_id.value
    // console.log('submitData', submitData)
    MeetAPI.update(submitData).then((res) => {
      if (res.status === 200) {
        ElMessage.success('修改成功')
        // console.log('res', res)
      } else {
        ElMessage.error('修改失败')
      }
    })
  } catch (error) {
    console.error(error)
  }
}
// 复制文档链接
const handleGenerateDoc = async (submitData) => {
  try {
    const meetingId = url_id.value
    // console.log('meetingId', meetingId)
    ElMessage.info('正在提交数据，请稍候...')
    const downloadRes = await MeetAPI.downloadWord(meetingId)
    if (downloadRes.status === 200 && downloadRes.data.word_url) {
      const data = {
        id: meetingId,
        word_url: downloadRes.data.word_url.url,
        status: 'confirmed',
      }

      await MeetAPI.updateeword_url(data)
      generatedDocUrl.value =
        import.meta.env.VITE_API_BASE_URL + '/' + downloadRes.data.word_url.url
      // await selectNumber()
      // licensePlate.value = meetingData.value.units
      //   .map((unit) => unit.members.map((member) => member.plateNumber))
      //   .join(', ')
      //   .replace(/\s+/g, '')
      // 更严格的版本
      licensePlate.value = meetingData.value.units
        .flatMap(
          (unit) =>
            unit.members
              .map((member) => member.plateNumber?.trim()) // 去除每个车牌号的前后空格
              .filter((plate) => plate), // 过滤掉空值
        )
        .join(',') // 直接用逗号连接
        .replace(/\s*,\s*/g, ',') // 确保逗号前后没有空格
      // 显示结果页面
      showResult.value = true

      // 自动尝试下载
      setTimeout(() => {
        downloadDocument()
      }, 500)

      ElNotification.success({
        title: '文档生成成功',
        message: '会议文档已生成，请下载或复制链接',
        duration: 5000,
      })
    } else {
      ElMessage.error('文档生成失败')
    }
  } catch (error) {
    // console.error('生成文档出错:', error)
    ElMessage.error('文档生成出错')
  }
}
// 下载文档
const downloadDocument = () => {
  try {
    // 针对iOS设备的特殊处理
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const link = document.createElement('a')
      link.href = generatedDocUrl.value
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      window.open(generatedDocUrl.value, '_blank')
    }
  } catch (error) {
    // console.error('下载失败:', error)
    ElMessage.warning('自动下载失败，请手动复制链接')
  }
}
const selectNumber = () => {
  //将meetingData.units中的所有members的plateNumber车牌提取出来，用,分隔
  licensePlate.value = meetingData.value.units
    .map((unit) => unit.members.map((member) => member.plateNumber))
    .join(', ')
    .replace(/\s+/g, '')
}
const copyplateNumber = () => {
  //复制车牌链接
  navigator.clipboard
    .writeText(licensePlate.value)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      // 兼容不支持clipboard API的浏览器
      const input = document.createElement('input')
      input.value = licensePlate.value
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      ElMessage.success('链接已复制')
    })
}

// 复制文档链接
const copyDocumentUrl = () => {
  navigator.clipboard
    .writeText(generatedDocUrl.value)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      // 兼容不支持clipboard API的浏览器
      const input = document.createElement('input')
      input.value = generatedDocUrl.value
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      ElMessage.success('链接已复制')
    })
}

// 关闭页面函数
const closePage = async () => {
  try {
    //关闭所有窗口并跳转到/admin
    // const windows = window.open('', '_self')
    router.push('/admin')
  } catch (error) {
    // console.error('关闭页面出错:', error)
    router.push('/admin')
  }
}

const handleConfirmInfo = (data) => {
  // console.log('确认信息:', data)
}
// 2. 修改获取数据方法
const getMeetDetail = async (meeting_id) => {
  try {
    const res = await MeetAPI.getDetail(meeting_id)
    if (res.status === 200) {
      const formattedData = formatMeetingData(res.data.meeting)
      // 3. 确保日期对象正确创建
      const meetingTime = new Date(formattedData.meetingTime)
      // 分离研究院数据
      const researchUnitIndex = formattedData.units.findIndex(
        (unit) => unit.name === '合肥综合性国家科学中心数据空间研究院',
      )
      let researchMembers = []

      if (researchUnitIndex !== -1) {
        // 提取研究院成员
        researchMembers = [...formattedData.units[researchUnitIndex].members]
        // 从单位列表中移除研究院
        formattedData.units.splice(researchUnitIndex, 1)
      }
      // 确保直接赋值整个对象以触发响应式更新
      meetingData.value = {
        ...formattedData,
        firstlocation: '数据空间研究院（工投高新智谷B8座）',
        meetingDate: meetingTime,
        meetingTime: meetingTime,
        researchMembers: researchMembers, // 确保这里赋值
      }
    }
  } catch (error) {
    console.error('获取会议详情失败:', error)
  }
}
// 4. 添加watch确保数据变化时更新
watch(
  meetingData,
  (newVal) => {
    // console.log('meetingData变化:', newVal)
  },
  { deep: true },
)
// 格式化API数据为前端需要的结构
function formatMeetingData(apiData) {
  const meetingTime = new Date(apiData.meeting_time)
  return {
    title: apiData.title,
    location: apiData.location, // 根据你的location_id转换
    agenda: apiData.agenda,
    meetingDate: meetingTime,
    meetingTime: meetingTime,
    units: apiData.units.map((unit) => ({
      id: unit.id, // 保留单位ID用于更新
      name: unit.name,
      members: unit.members.map((member) => ({
        id: member.id, // 保留成员ID用于更新
        name: member.name,
        position: member.position,
        plateNumber: member.plate_number, // 新增车牌号字段
      })),
    })),
    individuals: apiData.individuals.map((individual) => ({
      id: individual.id, // 保留个人来访者ID用于更新
      name: individual.name,
      plateNumber: individual.plate_number, // 注意字段名转换
    })),
    researchMembers: [], // 初始化为空数组，由调用方处理
  }
}
</script>
<style scoped lang="scss">
.create-container {
  width: 100%;
  height: 100%;
}
.create-btn {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.title {
  width: 100vw;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.result-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.result-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  :deep(.el-card__header) {
    padding: 20px;
    background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
    border-bottom: 1px solid #ebeef5;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: 24px;
  color: #67c23a;
  margin-right: 10px;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.result-content {
  padding: 20px;
}

.document-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 15px;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background: #409eff;
    margin-right: 8px;
    border-radius: 2px;
  }
}

.url-display {
  margin-bottom: 15px;
}

.url-input {
  :deep(.el-input-group__append) {
    padding: 0;
    border: none;
    background: transparent;

    .action-buttons {
      display: flex;
      // height: 100%;
      justify-content: center;
      width: 100px;

      .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        padding: 0;

        .el-icon {
          font-size: 18px;
        }

        &:first-child {
          background-color: #409eff;
          border-color: #409eff;
        }

        &:last-child {
          background-color: #67c23a;
          border-color: #67c23a;
        }
      }
    }
  }
}

.help-tip {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
  font-size: 14px;
}

.tip-icon {
  color: #909399;
  margin-right: 8px;
  font-size: 16px;
}

.tip-text {
  color: #606266;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.action-btn {
  width: 180px;

  .el-icon {
    margin-right: 6px;
  }
}
</style>
