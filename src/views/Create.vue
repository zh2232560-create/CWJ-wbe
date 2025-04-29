<!-- create.vue -->
<template>
  <div class="create-container">
    <div class="header">
      <el-icon @click="router.go(-1)"><ArrowLeft /></el-icon>
      <h2 class="title">{{ showResult ? '创建会议成功' : '创建会议预约' }}</h2>
    </div>
    <FormBuilder
      :user="currentUser"
      @submit="handleSubmit"
      :is-create-page="true"
      v-if="!showResult"
    />
    <div class="result-box" v-if="showResult">
      <el-alert title="" type="success" show-icon>
        <p style="margin-top: 25px">如需要对会议信息进一步修改，可以点击或者转发以下链接。</p>
        <div class="link-group">
          <h4>编辑链接：</h4>
          <el-input v-model="receptionistLink" readonly>
            <template #append>
              <el-button @click="copyLink(receptionistLink)">复制</el-button>
              <el-button type="primary" @click="visitLink(receptionistLink)">访问</el-button>
            </template>
          </el-input>
        </div>
        <p>
          管理员可通过以下链接进入会议管理页面
          <span style="color: red">（首次进入需登录）</span>
        </p>
        <div class="link-group">
          <!-- <h4>管理员链接：</h4> -->
          <el-input v-model="adminLink" readonly>
            <template #append>
              <el-button @click="copyLink(adminLink)">复制</el-button>
              <el-button type="primary" @click="gopage">访问</el-button>
            </template>
          </el-input>
        </div>

        <!-- <div class="link-group">
          <h4>访客链接：</h4>
          <el-input v-model="visitorLink" readonly>
            <template #append>
              <el-button @click="copyLink(visitorLink)">复制</el-button>
              <el-button type="primary" @click="visitLink(visitorLink)">访问</el-button>
            </template>
          </el-input>
        </div> -->
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FormBuilder from '@/components/form/FormBuilder.vue'
import MeetingApi from '@/api/meeting'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 数据
const user = ref(route.query.user || '')
const currentUser = ref({
  role: user.value || 'receptionist', // 默认为接待员
})
const showResult = ref(false)
const adminLink = ref('')
const receptionistLink = ref('')
const visitorLink = ref('')

onMounted(() => {
  MeetingApi.getMeetingList().then((res) => {
    console.log(res)
  })
  console.log('currentUser', currentUser.value.role)
})

// 简单的Base64编码（不是真正的加密）
function obfuscateId(id) {
  return btoa(id.toString())
}
// 添加访问链接方法
const visitLink = (link) => {
  // 在新标签页打开链接
  window.open(link, '_blank')
}
const gopage = () => {
  // 使用replace方法替换当前历史记录
  router.replace('/admin').then(() => {
    // 手动添加首页到历史记录
    window.history.pushState(null, '', '/')
  })
}
// 处理表单提交
const handleSubmit = async (submitData) => {
  try {
    console.log('submitData', submitData)
    const res = await MeetingApi.create(submitData)

    if (res.status !== 200) {
      ElMessage.error('创建失败,请检查信息后重试')
      return
    }

    const meetingId = obfuscateId(res.data.meeting_id)
    const baseUrl = window.location.origin

    // 生成三个角色的链接
    adminLink.value = `${baseUrl}/meeting/admin/`
    //跳转到admin页面
    // router.push({ path: '/meeting/admin', query: { id: meetingId, user: 'admin' } })
    receptionistLink.value = `${baseUrl}/meeting/edit/?id=${meetingId}&user=receptionist`
    visitorLink.value = `${baseUrl}/meeting/edit/?id=${meetingId}&user=visitor`

    showResult.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('创建会议时出错')
  }
}

// 复制链接
const copyLink = async (link) => {
  try {
    await navigator.clipboard.writeText(link)
    ElMessage.success('链接已复制')
    return true // 复制成功
  } catch (error) {
    console.error('复制失败:', error)

    // 根据不同错误类型给出提示
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        ElMessage.error('复制失败：未获得剪贴板权限')
      } else {
        ElMessage.error('复制失败：' + error.message)
      }
    } else {
      ElMessage.error('复制失败，请手动复制')
    }

    // 提供备选方案（兼容旧浏览器）
    fallbackCopy(link)
    return false // 复制失败
  }
}

// 兼容旧浏览器的复制方案
const fallbackCopy = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed' // 防止页面滚动
  document.body.appendChild(textarea)
  textarea.select()

  try {
    const successful = document.execCommand('copy')
    if (successful) {
      ElMessage.success('链接已复制（兼容模式）')
    } else {
      throw new Error('复制命令执行失败')
    }
  } catch (err) {
    ElMessage.error('复制失败，请手动选择文本后按Ctrl+C复制')
    // 自动选中文本方便用户手动复制
    textarea.focus()
    textarea.select()
  } finally {
    document.body.removeChild(textarea)
  }
}
</script>

<style scoped lang="scss">
.create-container {
  background-color: #fff;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  display: flex;
  align-items: center;
  justify-content: left;
}
.title {
  flex: 1;
  text-align: center;
  margin-bottom: 20px;
}

.result-box {
  // width: 600px;
  margin-top: 20px;

  .link-group {
    margin: 15px 0;

    h4 {
      margin-bottom: 8px;
      color: #606266;
    }

    .el-input {
      margin-bottom: 10px;

      /* 调整按钮组样式 */
      :deep(.el-input-group__append) {
        padding: 0;
        width: 142px;
        display: flex;

        .el-button {
          flex: 1;
          border-radius: 0;
          & + .el-button {
            margin-left: -1px;
          }
          &:first-child {
            border-bottom-left-radius: 4px;
            border-top-left-radius: 4px;
          }
          &:last-child {
            border-bottom-right-radius: 4px;
            border-top-right-radius: 4px;
          }
        }
      }
    }
  }
}
</style>
