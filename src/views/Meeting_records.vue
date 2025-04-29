<!-- meeting_records.vue -->
<template>
  <div v-if="!isLoggedIn" class="login-container">
    <h2>登录</h2>
    <el-form
      :model="loginForm"
      :rules="rules"
      ref="loginFormRef"
      @submit.native.prevent="handleLogin"
    >
      <el-form-item label="账号" prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入账号"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="loginForm.password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-button type="primary" native-type="submit">登录</el-button>
    </el-form>
  </div>
  <div v-else>
    <div class="meeting-container">
      <!-- 顶部标题和创建按钮 -->
      <div class="header">
        <h2>会议记录</h2>
        <el-button type="primary" @click="handleCreate">创建新会议</el-button>
      </div>

      <!-- 会议列表 -->
      <div class="meeting-list">
        <div
          v-for="(item, index) in meetingList"
          :key="item.id"
          class="meeting-item-wrapper"
          @touchstart="handleTouchStart(index, $event)"
          @touchmove="handleTouchMove(index, $event)"
          @touchend="handleTouchEnd(index)"
        >
          <div
            class="meeting-item"
            :style="{ transform: `translateX(${item.offsetX}px)` }"
            @click.stop="handleadminEdit(item)"
          >
            <div class="meeting-content">
              <div class="meeting-image">
                <img src="@/assets/static/meet.png" alt="会议图片" fit="cover" />
              </div>
              <div class="meeting-info">
                <h3>{{ item.title || '未命名会议' }}</h3>
                <el-tag :type="getStatusTagType(item.status)" size="small" effect="light">
                  {{ getStatusText(item.status) }}
                </el-tag>
                <div class="meta-info">
                  <span
                    ><el-icon><Clock style="color: aqua" /></el-icon> 会议时间:
                    {{ formatTime(item.meeting_time) }}</span
                  >
                  <span
                    ><el-icon><Location style="color: blue" /></el-icon> 会议地点:
                    {{ item.location.name }}</span
                  >
                </div>
              </div>
            </div>
            <div class="meeting-actions">
              <el-button size="small" @click.stop="handleEdit(item)" class="edit-btn"
                >查看链接</el-button
              >
              <el-button
                size="small"
                @click.stop="createWord(item)"
                class="down-btn"
                v-if="item.status === 'draft'"
              >
                生成手册
              </el-button>
              <el-button size="small" @click.stop="downWord(item.word_url)" class="down-btn" v-else>
                下载手册
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click.stop="handleDelete(item.id, index)"
                class="delete-btn"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="loading" class="loading-more">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      <div v-if="noMore" class="no-more">没有更多数据了</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import MeetAPI from '@/api/meeting'
import { obfuscateId } from '@/components/common/dbota'
// 数据
const meetingList = ref([])
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const limit = ref(10)
const router = useRouter()
const touchStartX = ref(0)
const currentSlide = ref(null)
// 数据
const isLoggedIn = ref(false)
const loginForm = ref({
  username: '',
  password: '',
})
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}
const loginFormRef = ref(null)

// 模拟用户数据
const mockUser = {
  username: 'admin',
  password: '123456',
}

// Token 处理
const TOKEN_KEY = 'auth_token'
const TOKEN_EXPIRATION = 3 * 24 * 60 * 60 * 1000 // 三天
// 初始化数据时添加滑动相关属性
const initMeetingList = (data) => {
  return data.map((item) => ({
    ...item,
    offsetX: 0,
    startX: 0,
  }))
}
// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    draft: 'warning', // 草稿 - 橙色
    confirmed: 'success', // 已确认 - 绿色
    completed: 'info', // 已完成 - 蓝色
  }
  return statusMap[status] || ''
}

// 获取状态显示文本
const getStatusText = (status) => {
  const textMap = {
    draft: '待生成手册',
    confirmed: '已生成手册',
    completed: '会议已结束',
  }
  return textMap[status] || status
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '未设置时间'
  const date = new Date(timeStr)
  return date
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/\//g, '-')
}

// 获取会议列表
const getMeetingList = async () => {
  if (loading.value || noMore.value) return

  loading.value = true
  try {
    const res = await MeetAPI.getMeetingList({
      page: page.value,
      limit: limit.value,
    })

    if (res.data && res.data.length > 0) {
      const newList = initMeetingList(res.data)
      meetingList.value = [...meetingList.value, ...newList]
      page.value++
    } else {
      noMore.value = true
    }
  } catch (error) {
    ElMessage.error('获取会议列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 触摸开始
const handleTouchStart = (index, e) => {
  if (currentSlide.value !== null && currentSlide.value !== index) {
    // 重置其他滑动的卡片
    meetingList.value[currentSlide.value].offsetX = 0
  }
  currentSlide.value = index
  touchStartX.value = e.touches[0].clientX
  meetingList.value[index].startX = meetingList.value[index].offsetX
}

// 触摸移动
const handleTouchMove = (index, e) => {
  const touchX = e.touches[0].clientX
  const diffX = touchX - touchStartX.value
  const newOffsetX = meetingList.value[index].startX + diffX

  // 限制向右滑动最大距离（显示操作按钮）
  if (newOffsetX > -150 && newOffsetX <= 0) {
    meetingList.value[index].offsetX = newOffsetX
  }
}

// 触摸结束
const handleTouchEnd = (index) => {
  // 如果滑动超过一定距离，保持打开状态
  if (meetingList.value[index].offsetX < -50) {
    meetingList.value[index].offsetX = -290 // 操作按钮宽度
  } else {
    meetingList.value[index].offsetX = 0
  }
}

// 创建会议
const handleCreate = () => {
  router.push('/create?user=admin')
}

// 编辑会议
const handleEdit = (item) => {
  // 先复位卡片
  item.offsetX = 0
  const itemId = obfuscateId(item.id)
  router.push(`/adminedit?id=${itemId}`)
}

//生成手册
const createWord = async (item) => {
  try {
    // 先复位卡片
    item.offsetX = 0
    console.log(item.id)
    const downloadRes = await MeetAPI.downloadWord(item.id)
    if (downloadRes.status === 200 && downloadRes.data.word_url) {
      const data = {
        id: item.id,
        word_url: downloadRes.data.word_url.url,
        status: 'confirmed',
      }
      await MeetAPI.updateeword_url(data)
      item.status = 'confirmed'
      const generatedDocUrl =
        import.meta.env.VITE_API_BASE_URL + '/' + downloadRes.data.word_url.url
      // 自动尝试下载
      setTimeout(() => {
        downloadDocument(generatedDocUrl)
      }, 500)
      //复制会议手册链接
      navigator.clipboard.writeText(generatedDocUrl).then(() => {
        ElNotification.success({
          title: '文档生成成功',
          message: '会议手册链接已复制到剪贴板，若未自动下载请到浏览器访问',
          duration: 6000,
        })
      })
    } else {
      ElMessage.error('生成手册失败')
    }
  } catch (e) {
    ElMessage.error('生成手册失败')
  }
}
const downWord = (url) => {
  try {
    console.log('下载链接', url)
    const generatedDocUrl = import.meta.env.VITE_API_BASE_URL + '/' + url
    console.log('下载链接', generatedDocUrl)
    // 自动尝试下载
    setTimeout(() => {
      downloadDocument(generatedDocUrl)
    }, 500)
    //复制会议手册链接
    navigator.clipboard.writeText(generatedDocUrl).then(() => {
      ElNotification.success({
        title: '',
        message: '会议手册链接已复制到剪贴板，若未下载请到浏览器访问',
        duration: 6000,
      })
    })
  } catch (e) {
    ElMessage.error('下载失败')
  }
}
/**
 * 下载文档
 * @param {*} generatedDocUrl
 */
const downloadDocument = (generatedDocUrl) => {
  try {
    // 针对iOS设备的特殊处理
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const link = document.createElement('a')
      link.href = generatedDocUrl
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      window.open(generatedDocUrl, '_blank')
    }
  } catch (error) {
    ElMessage.warning('自动下载失败，请手动复制链接')
  }
}
/**
 * 提交修改会议
 * @param {*} item
 */
const handleadminEdit = (item) => {
  item.offsetX = 0
  const itemId = obfuscateId(item.id)
  router.push(`edit/?id=${itemId}&user=admin`)
}
// 删除会议
const handleDelete = async (id, index) => {
  try {
    await ElMessageBox.confirm('确定要删除此会议吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await MeetAPI.deleteMeeting(id)
    meetingList.value.splice(index, 1)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 滚动加载
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const windowHeight = document.documentElement.clientHeight || document.body.clientHeight
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight

  if (scrollTop + windowHeight >= scrollHeight - 100) {
    getMeetingList()
  }
}

// 检查 Token 是否有效
const checkTokenValidity = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    const { expiration } = JSON.parse(token)
    if (Date.now() < expiration) {
      return true
    }
  }
  return false
}

// 登录逻辑
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()

    // 模拟登录验证
    if (
      loginForm.value.username === mockUser.username &&
      loginForm.value.password === mockUser.password
    ) {
      // 生成 Token 并保存
      const tokenData = {
        value: 'your-generated-token',
        expiration: Date.now() + TOKEN_EXPIRATION,
      }
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData))
      isLoggedIn.value = true
      ElMessage.success('登录成功')
    } else {
      ElMessage.error('账号或密码错误')
    }
  } catch (error) {
    ElMessage.error('请填写完整信息')
  }
}

// 生命周期钩子
onMounted(() => {
  getMeetingList()
  window.addEventListener('scroll', handleScroll)
  if (checkTokenValidity()) {
    isLoggedIn.value = true
  } else {
    isLoggedIn.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.meeting-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.meeting-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meeting-item-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.meeting-item {
  display: flex;
  width: 100%;
  transition: transform 0.3s ease;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.meeting-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px;
  min-height: 80px;
  flex-shrink: 0;
}

.meeting-image {
  width: 90px;
  height: 90px;
  margin-right: 15px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
}

.meeting-info {
  flex: 1;
  min-width: 0;

  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;
  color: #606266;

  span {
    display: flex;
    align-items: center;

    i {
      margin-right: 5px;
      font-size: 14px;
    }
  }
}

.meeting-actions {
  display: flex;
  align-items: center;
  padding: 0 15px;
  background: #bbdcff;

  .edit-btn {
    margin-right: 10px;
    background-color: #409eff;
    border-color: #409eff;
    color: white;
  }

  .down-btn {
    margin-right: 10px;
    background-color: #2cbf69;
    border-color: #2cbf69;
    color: white;
  }

  .delete-btn {
    background-color: #f56c6c;
    border-color: #f56c6c;
    color: white;
  }
}

.loading-more,
.no-more {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .meeting-content {
    padding: 12px;
  }

  .meeting-image {
    width: 90px;
    height: 90px;
    margin-right: 10px;
  }
}
</style>
