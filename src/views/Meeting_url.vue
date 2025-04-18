<template>
  <div class="create-container">
    <h2 class="title">会议编辑</h2>
    <div class="result-box">
      <el-alert title="会议已创建成功" type="success" show-icon>
        <p>请将以下链接发送给相关人员：</p>

        <div class="link-group">
          <h4>管理员编辑链接：</h4>
          <el-input v-model="adminLink" readonly>
            <template #append>
              <el-button @click="copyLink(adminLink)">复制</el-button>
              <el-button type="primary" @click="visitLink(adminLink)">访问</el-button>
            </template>
          </el-input>
        </div>

        <div class="link-group">
          <h4>接待员编辑链接：</h4>
          <el-input v-model="receptionistLink" readonly>
            <template #append>
              <el-button @click="copyLink(receptionistLink)">复制</el-button>
              <el-button type="primary" @click="visitLink(receptionistLink)">访问</el-button>
            </template>
          </el-input>
        </div>

        <div class="link-group">
          <h4>访客编辑链接：</h4>
          <el-input v-model="visitorLink" readonly>
            <template #append>
              <el-button @click="copyLink(visitorLink)">复制</el-button>
              <el-button type="primary" @click="visitLink(visitorLink)">访问</el-button>
            </template>
          </el-input>
        </div>

        <!-- 新增Word文档链接区域 -->
        <div class="link-group" v-if="showWordLink">
          <h4>会议文档：</h4>
          <el-input v-model="wordLink" readonly>
            <template #append>
              <el-button @click="copyLink(wordLink)">复制</el-button>
              <el-button type="primary" @click="visitLink(wordLink)">访问</el-button>
            </template>
          </el-input>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import MeetingApi from '@/api/meeting'
import { ElMessage } from 'element-plus'
import { deobfuscateId } from '@/components/common/dbota'
import { BASE_URL } from '@/setting'
const route = useRoute()

// 数据
const meetingId = ref(route.query.id || '')
const baseUrl = window.location.origin
const meetingDetail = ref({})
const adminLink = ref('')
const receptionistLink = ref('')
const visitorLink = ref('')
const wordLink = ref('')

// 计算属性，判断是否显示Word链接
const showWordLink = computed(() => {
  return (
    meetingDetail.value.status &&
    meetingDetail.value.status !== 'draft' &&
    meetingDetail.value.word_url
  )
})

onMounted(() => {
  console.log('meetingId', meetingId)
  getMeetingInfo(meetingId.value)
})
/**
 * 获取会议信息
 * @param {*} meetid
 */
const getMeetingInfo = (meetid) => {
  const Meet_id = deobfuscateId(meetid)
  console.log('Meet_id', Meet_id)
  MeetingApi.getDetail(Meet_id)
    .then((res) => {
      if (res.status === 200) {
        meetingDetail.value = res.data.meeting

        // 生成各角色链接
        adminLink.value = `${baseUrl}/meeting/edit/?id=${meetid}&user=admin`
        receptionistLink.value = `${baseUrl}/meeting/edit/?id=${meetid}&user=receptionist`
        visitorLink.value = `${baseUrl}/meeting/edit/?id=${meetid}&user=visitor`

        // 设置Word文档链接
        if (meetingDetail.value.word_url) {
          wordLink.value = `${import.meta.env.VITE_API_BASE_URL}${meetingDetail.value.word_url}`
        }
      } else {
        ElMessage.error('获取会议详情失败')
        // console.error('获取会议详情失败:', error)
      }
    })
    .catch((error) => {
      console.error('获取会议详情失败:', error)
      ElMessage.error('获取会议详情失败')
    })
}
const openInGoogleViewer = () => {
  window.open(
    `https://docs.google.com/viewer?url=https://www.pkahealth.com/uploads/downword/20250417/6800ce4859947.docx`,
    '_blank',
  )
}
// 访问链接方法
const visitLink = (link) => {
  window.open(link, '_blank')
}

// 复制链接
const copyLink = (link) => {
  navigator.clipboard.writeText(link)
  ElMessage.success('链接已复制')
}
</script>

<style scoped lang="scss">
.create-container {
  background-color: #fff;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.result-box {
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
