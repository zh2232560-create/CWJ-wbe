<!-- edit.vue -->
<template>
  <!-- <div class="create-container">
    <el-row>
      <el-col :span="18">
        <h3>欢迎{{ pagename }}</h3>
      </el-col>
      <el-col :span="6" v-if="currentUser.role == 'admin' || currentUser.role == 'receptionist'">
        <div class="create-btn">
          <el-button type="primary" @click="handleCreate">创建新会议</el-button>
        </div>
      </el-col>
    </el-row>
  </div> -->
  <FormBuilder
    :user="currentUser"
    :initial-data="meetingData"
    @submit="handleSubmit"
    @confirm-and-generate="handleGenerateDoc"
    @confirm-info="handleConfirmInfo"
  />
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FormBuilder from '@/components/form/FormBuilder.vue'
import MeetAPI from '@/api/meeting'
import { BASE_URL } from '@/setting'
// =======================================data==================================
const route = useRoute()
// 从 URL 中获取 user 参数
const url_id = ref(route.query.id || '') // 默认为空字符串
const url_user = ref(route.query.user || '')
const data = ref('2023-12-15T16:14:00')
const date = ref(new Date(data.value))
const pagename = ref('')
const currentUser = ref({
  role: 'visitor', // 可以是 'admin', 'receptionist' 或 'visitor'
})
// 1. 清空默认数据
const meetingData = ref({
  title: '',
  location: '',
  agenda: '',
  meetingDate: null,
  meetingTime: null,
  units: [],
  individuals: [],
})
// const meetingData = ref({})
//---=============================-onMounted---========================--
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

  console.log('当前用户角色:', currentUser.value.role) // 确认角色值
  if (url_id.value) {
    // 如果url_id存在，则调用API获取数据
    url_id.value = deobfuscateId(url_id.value)
    console.log('url_id', url_id.value)
    getMeetDetail(url_id.value)
    console.log('meetingData', meetingData)
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
  console.log('提交修改的数据:', submitData)

  try {
    // 为submitData加上id
    submitData.id = url_id.value
    console.log('submitData', submitData)
    MeetAPI.update(submitData).then((res) => {
      console.log('update', res)
      if (res.status === 200) {
        ElMessage.success('修改成功')
      } else {
        ElMessage.error('修改失败')
      }
    })
  } catch (error) {
    console.error(error)
  }
}
const handleGenerateDoc = async (submitData) => {
  try {
    if (!submitData) {
      ElMessage.warning('暂无会议信息')
      return
    }
    const meetingId = url_id.value
    submitData.id = url_id.value
    ElMessage.info('正在提交数据，请稍候...')
    // 等待数据更新完成
    const updateRes = await MeetAPI.update(submitData)
    console.log('update', updateRes)
    if (updateRes.status === 200) {
      ElMessage.success('修改成功')
      ElMessage.info('正在生成文档，请稍候...')
      // 等待文档下载信息获取完成
      const downloadRes = await MeetAPI.downloadWord(meetingId)
      console.log('downloadWord', downloadRes)
      if (downloadRes.status === 200 && downloadRes.data.word_url) {
        const data = {
          id: meetingId,
          word_url: downloadRes.data.word_url.url,
          status: 'confirmed',
        }
        // 等待更新 word_url 信息完成
        const url = await MeetAPI.updateeword_url(data)
        const baseurl = import.meta.env.VITE_API_BASE_URL + '/' + downloadRes.data.word_url.url
        console.log('baseurl', baseurl)
        // 方法1：直接打开新窗口下载
        window.open(baseurl, '_blank')
        ElMessage.success('文档生成成功')
      } else {
        ElMessage.error('文档生成失败')
      }
    } else {
      ElMessage.error('修改失败')
    }
  } catch (error) {
    console.error('生成文档出错:', error)
    ElMessage.error('文档生成出错')
  }
}

const handleConfirmInfo = (data) => {
  console.log('确认信息:', data)
  // 调用确认API
}
// 2. 修改获取数据方法
const getMeetDetail = async (meeting_id) => {
  try {
    const res = await MeetAPI.getDetail(meeting_id)
    if (res.status === 200) {
      const formattedData = formatMeetingData(res.data.meeting)
      // 3. 确保日期对象正确创建
      const meetingTime = new Date(formattedData.meetingTime)

      meetingData.value = {
        ...formattedData,
        meetingDate: meetingTime,
        meetingTime: meetingTime,
      }
      console.log('meetingData.value', meetingData.value)
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
</style>
