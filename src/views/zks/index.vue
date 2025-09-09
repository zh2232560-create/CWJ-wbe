<template>
  <div class="simple-photo-capture">
    <!-- 新增：使用加载组件 -->
    <loading-mask :visible="isSubmitting" text="正在提交，请等待..." />
    <!-- 顶部进度指示 -->
    <div class="progress-header">
      <div class="progress-info">
        <h2>照片拍摄进度</h2>
        <p>已完成 {{ completedCount }} / {{ totalPhotos }} 张照片</p>
      </div>
      <el-progress :percentage="progressPercentage" :color="progressColors" :show-text="false" />
    </div>

    <!-- 主拍摄区域 -->
    <div class="camera-main">
      <div class="camera-container">
        <!-- 用户基础信息填写 -->
        <div class="user-info-form">
          <div class="form-item">
            <label class="form-label">年龄：</label>
            <el-input
              v-model="UserInfo.age"
              placeholder="请输入年龄"
              type="number"
              min="1"
              max="120"
              style="width: 120px"
            />
          </div>

          <div class="form-item">
            <label class="form-label">性别：</label>
            <el-radio-group v-model="UserInfo.sex" @change="radio_change($event)">
              <el-radio value="1">男</el-radio>
              <el-radio value="0">女</el-radio>
            </el-radio-group>
          </div>
        </div>
        <!-- 相机预览 -->
        <div class="camera-preview">
          <div v-if="!isCameraActive" class="camera-placeholder">
            <el-icon size="64px" color="#909399"><Camera /></el-icon>
            <p>点击启动相机开始拍摄</p>
          </div>
          <div v-show="isCameraActive" class="camera-active-container">
            <video ref="videoElement" autoplay playsinline class="camera-feed"></video>
            <!-- <img
              v-show="isCameraActive"
              :src="currentMaskImage"
              alt="蒙版层"
              class="camera-overlay"
              style="height: auto;"
            /> -->
            <el-image
              :src="currentMaskImage"
              :style="maskImageStyle"
              fit="fill"
              alt="蒙版层"
              class="camera-overlay"
              v-show="isCameraActive"
            />
            <!-- <image
              v-show="isCameraActive"
              :src="currentMaskImage"
              mode="scaleToFill"
              class="camera-overlay"
              alt="蒙版层"
              fit="cover"
            /> -->
          </div>

          <!-- <p>{{ photoList[currentIndex].image_mask }}</p> -->

          <canvas ref="canvasElement" style="display: none"></canvas>
        </div>

        <!-- 当前拍摄信息 -->
        <div class="capture-info">
          <h3>{{ currentPhotoName }}<span class="photo-direction">(客人方向)</span></h3>
          <p>第 {{ currentIndex + 1 }} 张 / 共 {{ totalPhotos }} 张</p>
        </div>

        <!-- 拍摄按钮 -->
        <div class="capture-actions">
          <el-button
            v-if="!isCameraActive"
            type="primary"
            size="large"
            @click="startCamera"
            :loading="isLoading"
          >
            <el-icon><VideoCamera /></el-icon>
            启动相机
          </el-button>

          <el-button
            v-else
            type="primary"
            size="large"
            @click="capturePhoto"
            :disabled="isCapturing"
            :loading="isCapturing"
          >
            <el-icon><Camera /></el-icon>
            {{ isCapturing ? '拍摄中...' : '拍摄照片' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 照片预览弹窗 -->
    <el-dialog
      v-model="showPreviewDialog"
      :title="`预览 - ${currentPhotoName}`"
      class="preview-width"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="preview-dialog">
        <div class="preview-image">
          <img :src="previewImageUrl" :alt="currentPhotoName" />
        </div>

        <div class="preview-actions">
          <el-button type="warning" size="large" @click="retakePhoto">
            <el-icon><Refresh /></el-icon>
            重新拍摄
          </el-button>

          <el-button type="primary" size="large" @click="confirmPhoto" :loading="isUploading">
            <el-icon><Check /></el-icon>
            {{ isUploading ? '上传中...' : '确认并下一张' }}
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 完成提示 -->
    <el-dialog
      v-model="showCompletionDialog"
      title="拍摄完成"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="completion-dialog">
        <el-icon color="#67c23a" size="48px"><SuccessFilled /></el-icon>
        <h3>恭喜！所有照片拍摄完成</h3>
        <p>共 {{ totalPhotos }} 张照片已全部上传</p>
        <!-- 新增：是否异常选择框 -->
        <div class="abnormal-selection">
          <span class="abnormal-label">拍摄者脚部状态：</span>
          <el-radio-group
            v-model="UserInfo.is_abnormal"
            class="abnormal-radio"
            @change="radio_change($event)"
          >
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">异常</el-radio>
          </el-radio-group>
        </div>
        <div class="completion-actions">
          <el-button @click="restartCapture">重新拍摄</el-button>
          <el-button type="primary" @click="handleSubmit">全部提交</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, VideoCamera, Check, Refresh, SuccessFilled, User } from '@element-plus/icons-vue'
import zksAPI from '@/api/zks'
import { setCache } from '@/utils/cache'
import LoadingMask from '@/components/common/loading.vue'
// 模拟上传函数
/**
 * 上传图片函数
 * @param {} file
 * @param {*} photoName
 */
const mockUploadPhoto = async (file, photoName) => {
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     const mockUrl = `https://example.com/uploads/${Date.now()}-${photoName}.jpg`
  //     resolve(mockUrl)
  //   }, 1000)
  // })
  // 直接返回接口请求的 Promise，外部可根据需要处理成功和失败
  try {
    // 2. 直接传递 file 对象给 API
    const res = await zksAPI.upload(file)
    //console.log('上传成功:', res.data)
    return res.data // 返回后端返回的结果（通常包含图片URL）
  } catch (err) {
    console.error('上传失败:', err.response?.data || err.message)
    throw err // 抛出错误让调用方处理
  }
}
/**
 *  ['LFD', ''],//左脚脚面
  ['LFP', ''],//左脚脚掌
  ['LFLS', ''],//左脚左侧
  ['LFRS', ''],//左脚右侧
  ['LFH', ''],//左脚脚跟
  ['LF_TWS', ''],//左脚脚趾缝
  ['RFD', ''],//右脚脚面
  ['RFP', ''],//右脚脚掌
  ['RFLS', ''],//右脚左侧
  ['RFRS', ''],//右脚右侧
  ['RFH', ''],//右脚脚跟
  ['RF_TWS', ''],//右脚脚趾缝
 */
// 拍摄配置
const photoList = ref([
  {
    id: 1,
    key: 'LFD',
    name: '左脚脚面',
    image_mask: new URL('@/assets/zksstatic/zks_LFH.png', import.meta.url).href,
    phone_mask: new URL('@/assets/zksstatic/zks_LFD_mobile.png', import.meta.url).href,
    is_zhuan: {
      horizontal: true, // 水平翻转
      vertical: true, // 垂直翻转
    },
  },
  {
    id: 2,
    key: 'LFP',
    name: '左脚脚掌',
    image_mask: new URL('@/assets/zksstatic/zks_LFP.png', import.meta.url).href,
    phone_mask: new URL('@/assets/zksstatic/zks_LFP_mobile.png', import.meta.url).href,
    is_zhuan: {
      horizontal: false, // 水平翻转
      vertical: false, // 垂直翻转
    },
  },
  {
    id: 7,
    key: 'RFD',
    name: '右脚脚面',
    image_mask: new URL('@/assets/zksstatic/zks_RFD.png', import.meta.url).href,
    phone_mask: new URL('@/assets/zksstatic/zks_RFD_mobile.png', import.meta.url).href,
    is_zhuan: {
      horizontal: true, // 水平翻转
      vertical: true, // 垂直翻转
    },
  },
  {
    id: 8,
    key: 'RFP',
    name: '右脚脚掌',
    image_mask: new URL('@/assets/zksstatic/zks_RFP.png', import.meta.url).href,
    phone_mask: new URL('@/assets/zksstatic/zks_RFP_mobile.png', import.meta.url).href,
    is_zhuan: {
      horizontal: false, // 水平翻转
      vertical: false, // 垂直翻转
    },
  },
])

/**
 * ['name', '默认用户'],
  ['sex', ''],
  ['age', ''],
  ['LFD', ''],//左脚脚面
  ['LFP', ''],//左脚脚掌
  ['LFLS', ''],//左脚左侧
  ['LFRS', ''],//左脚右侧
  ['LFH', ''],//左脚脚跟
  ['LF_TWS', ''],//左脚脚趾缝
  ['RFD', ''],//右脚脚面
  ['RFP', ''],//右脚脚掌
  ['RFLS', ''],//右脚左侧
  ['RFRS', ''],//右脚右侧
  ['RFH', ''],//右脚脚跟
  ['RF_TWS', ''],//右脚脚趾缝
  ['image13', ''],//预留图
  ['image14', ''],//预留图
  ['image15', ''],//预留图
 */
const UserInfo = ref({
  name: '默认用户',
  age: '',
  sex: '',
  LFD: '',
  LFP: '',
  LFLS: 'exit',
  LFRS: 'exit',
  LFH: 'exit',
  LF_TWS: 'exit',
  RFD: '',
  RFP: '',
  RFLS: 'exit',
  RFRS: 'exit',
  RFH: 'exit',
  RF_TWS: 'exit',
  is_abnormal: '',
  image14: '',
  image15: '',
})

// 状态管理
const currentIndex = ref(0)
const isCameraActive = ref(false)
const isCapturing = ref(false)
const isUploading = ref(false)
const isLoading = ref(false)
const showPreviewDialog = ref(false)
const showCompletionDialog = ref(false)
const previewImageUrl = ref('')
const windowWidth = ref(window.innerWidth) // 添加窗口宽度响应式变量
// 媒体流和元素引用
const mediaStream = ref(null)
const videoElement = ref(null)
const canvasElement = ref(null)

// 存储上传成功的图片链接
const uploadedPhotoUrls = ref([])
// 默认隐藏，提交时设为true
const isSubmitting = ref(false)
// 计算属性
const totalPhotos = computed(() => photoList.value.length)
const currentPhotoName = computed(() => photoList.value[currentIndex.value]?.name || '')
const completedCount = computed(() => uploadedPhotoUrls.value.length)
const progressPercentage = computed(() => (completedCount.value / totalPhotos.value) * 100)
// 响应式计算当前蒙版图片
const currentMaskImage = computed(() => {
  const currentPhoto = photoList.value[currentIndex.value]
  if (!currentPhoto) return ''

  // 根据窗口宽度选择不同的蒙版
  return windowWidth.value < 768 ? currentPhoto.phone_mask : currentPhoto.image_mask
})

// 对应的计算属性
const maskImageStyle = computed(() => {
  const baseStyle = {
    width: '100%',
    height: '100%',
  }

  const currentPhoto = photoList.value[currentIndex.value]
  if (currentPhoto && currentPhoto.is_zhuan) {
    const flipConfig = currentPhoto.is_zhuan
    let scaleX = flipConfig.horizontal ? -1 : 1
    let scaleY = flipConfig.vertical ? -1 : 1

    return {
      ...baseStyle,
      transform: `scale(${scaleX}, ${scaleY})`,
      '-webkit-transform': `scale(${scaleX}, ${scaleY})`,
      '-moz-transform': `scale(${scaleX}, ${scaleY})`,
      '-o-transform': `scale(${scaleX}, ${scaleY})`,
      '-ms-transform': `scale(${scaleX}, ${scaleY})`,
    }
  }

  return baseStyle
})

// 进度颜色配置
const progressColors = ref([
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
])

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}
// 启动相机
const startCamera = async () => {
  if (!validateUserInfo()) {
    return
  }
  isLoading.value = true
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment',
      },
      audio: false,
    })

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream.value
      isCameraActive.value = true
    }
  } catch (error) {
    console.error('无法访问相机:', error)
    ElMessage.error('无法访问相机，请检查权限设置')
  }
  isLoading.value = false
}

// 停止相机
const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop())
    mediaStream.value = null
  }
  isCameraActive.value = false
}

// 拍摄照片
const capturePhoto = async () => {
  if (!isCameraActive.value) {
    ElMessage.warning('请先启动相机')
    return
  }

  isCapturing.value = true
  try {
    const video = videoElement.value
    const canvas = canvasElement.value
    const context = canvas.getContext('2d')

    // 设置canvas尺寸与视频相同
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 绘制当前视频帧到canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // 转换为Blob并显示预览
    canvas.toBlob(
      (blob) => {
        previewImageUrl.value = URL.createObjectURL(blob)
        showPreviewDialog.value = true
        isCapturing.value = false
      },
      'image/jpeg',
      0.9,
    )
  } catch (error) {
    console.error('拍摄失败:', error)
    ElMessage.error('拍摄失败，请重试')
    isCapturing.value = false
  }
}

// 重新拍摄
const retakePhoto = () => {
  //提示是否确认重新拍照
  ElMessageBox.confirm('是否确认重新拍照？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 释放之前的blob URL
    if (previewImageUrl.value) {
      URL.revokeObjectURL(previewImageUrl.value)
    }
    showPreviewDialog.value = false
  })
  // // 释放之前的blob URL
  // if (previewImageUrl.value) {
  //   URL.revokeObjectURL(previewImageUrl.value)
  // }
  // showPreviewDialog.value = false
}

// 确认照片并上传
const confirmPhoto = async () => {
  isUploading.value = true
  try {
    // 从blob URL获取blob对象
    const response = await fetch(previewImageUrl.value)
    const blob = await response.blob()
    // //console.log('blob', blob)
    // 将Blob转换为File对象
    const fileName = `${currentPhotoName.value}_${Date.now()}.jpg`
    const file = new File([blob], fileName, { type: 'image/jpeg' })
    // //console.log('file', file)

    // 上传照片
    const imageUrl = await mockUploadPhoto(file, currentPhotoName.value)
    // //console.log('imageUrl', imageUrl.image)

    // 存储上传成功的链接
    uploadedPhotoUrls.value.push({
      name: currentPhotoName.value,
      url: imageUrl,
      index: currentIndex.value,
    })
    // 1. 获取当前照片的 key（如 LFD、LFP 等）
    const currentPhotoKey = photoList.value[currentIndex.value].key
    // 2. 将 imageUrl 赋值给 UserInfo 中对应 key 的字段
    UserInfo.value[currentPhotoKey] = imageUrl.image

    ElMessage.success('照片上传成功！')

    // 释放blob URL
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
    showPreviewDialog.value = false

    // 移动到下一张或完成
    if (currentIndex.value < totalPhotos.value - 1) {
      currentIndex.value++
      // //console.log('uploadedPhotoUrls-weiwacheng:', uploadedPhotoUrls.value)
    } else {
      // 所有照片完成
      //console.log('所有照片完成')
      // 暂时关闭摄像头
      isCameraActive.value = false
      showCompletionDialog.value = true
      // //console.log('UserInfo:', UserInfo.value)
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }

  isUploading.value = false
}

// 重新开始拍摄
const restartCapture = () => {
  //提示是否确认重新开始
  ElMessageBox.confirm('是否确认重新开始拍摄？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 停止相机
      stopCamera()
      // 重置拍摄状态
      currentIndex.value = 0
      uploadedPhotoUrls.value = []
      showCompletionDialog.value = false
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消操作',
      })
    })
}

/**
 * 表单验证
 */
// 可以添加表单验证
const validateUserInfo = () => {
  if (!UserInfo.value.age || UserInfo.value.age <= 0 || UserInfo.value.age > 120) {
    ElMessage.warning('请输入有效的年龄（1-120岁）')
    return false
  }

  if (!UserInfo.value.sex) {
    ElMessage.warning('请选择性别')
    return false
  }

  return true
}
const radio_change = (val) => {
  //console.log('radio_change', val)
  // console.log('UserInfo', UserInfo.value)
}

/**
 * 表单提交
 */
const handleSubmit = async () => {
  if (!UserInfo.value.is_abnormal) {
    ElMessage.warning('请选择是否异常')
    return
  }
  // 保存当前状态以便恢复
  const previousCameraState = isCameraActive.value
  const previousListener = removeBeforeUnloadListener

  try {
    // 临时移除页面离开确认监听器，避免提交过程中刷新页面出现提示
    if (removeBeforeUnloadListener) {
      removeBeforeUnloadListener()
      removeBeforeUnloadListener = null
    }

    // 1. 提交开始：显示加载蒙版
    isSubmitting.value = true

    setCache('UserInfo', UserInfo.value)

    // 测试转到catch
    const add_id = await zksAPI.addUserInfo(UserInfo.value)
    if (add_id.status == 200) {
      setTimeout(() => {
        showCompletionDialog.value = false
        isSubmitting.value = false
        console.log('add_id', add_id)
        ElMessage.success('提交成功！一秒后自动刷新页面')
        // showCompletionDialog.value = false
        // 延迟刷新以确保消息显示
        // console.log(' UserInfo.value', UserInfo.value)
        setTimeout(() => {
          location.reload()
          // isSubmitting.value = false
        }, 1000)
      }, 1500)
    } else {
      // 提交返回了结果但可能不是成功状态
      throw new Error('提交未返回预期结果,请检查API')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
    // 提交失败后恢复之前的状态
    // 恢复摄像头状态
    isCameraActive.value = previousCameraState
    // 恢复页面离开确认监听器（如果之前存在）
    if (previousListener && !removeBeforeUnloadListener) {
      removeBeforeUnloadListener = previousListener
    }
    isSubmitting.value = false

    return
  }
}
// 页面离开确认
const enablePageLeaveConfirm = () => {
  const handleBeforeUnload = (e) => {
    if (isCameraActive.value) {
      e.preventDefault()
      e.returnValue = '您有未保存的拍摄数据，确定要离开吗？'
      return '您有未保存的拍摄数据，确定要离开吗？'
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}

// 组件挂载时启用离开确认
let removeBeforeUnloadListener = null
onMounted(() => {
  removeBeforeUnloadListener = enablePageLeaveConfirm()
  window.addEventListener('resize', handleResize)
})
// 组件销毁时释放资源
onBeforeUnmount(() => {
  if (removeBeforeUnloadListener) {
    removeBeforeUnloadListener()
  }
  window.removeEventListener('resize', handleResize)
  stopCamera()
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
  }
})
</script>

<style scoped>
.simple-photo-capture {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  flex-direction: column;
}

.progress-header {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.progress-info h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.progress-info p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.camera-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.camera-container {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 1200px;
  max-height: 1200px;
  height: 80%;
  width: 100%;
}

/* 用户基础信息表单 */
.user-info-form {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 15px 20px;
  background: #f0f2f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.camera-preview {
  width: 100%;
  height: 80%;
  background: #f8f9fa;
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  /* display: flex;
  align-items: center;
  justify-content: center; */
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
}
.camera-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 500px;
}

.camera-active-container {
  position: relative;
  width: 100%;
  /* height: 600px; */
  display: flex;
  justify-content: center;
  align-items: center;
}
.camera-mask {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 500px;
  z-index: 1000;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* transform: scaleX(-1); */
}
.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 10;
}

.capture-info {
  margin-bottom: 20px;
}

.capture-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
}

.capture-info p {
  margin: 0;
  color: #909399;
  font-size: 16px;
}
.photo-direction {
  padding-left: 10px;
  font-size: 10px;
  color: brown;
}

.capture-actions {
  margin-top: 20px;
}

.preview-dialog {
  text-align: center;
}

.preview-image {
  margin-bottom: 30px;
}

.preview-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.completion-dialog {
  text-align: center;
}

.completion-dialog h3 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.completion-dialog p {
  margin: 0 0 24px 0;
  color: #606266;
}

.completion-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
/* 新增：是否异常选择框样式 */
.abnormal-selection {
  margin: 16px 0; /* 上下间距，避免与其他元素拥挤 */
  display: flex;
  align-items: center;
  justify-content: center; /* 水平居中 */
  color: #606266; /* 与提示文字颜色一致 */
}

.abnormal-label {
  font-weight: 500; /* 标签加粗，突出引导 */
  margin-right: 12px; /* 与选择框间距 */
}

.abnormal-radio {
  display: flex;
  gap: 24px; /* 两个选项之间的间距 */
}
/* 响应式设计 */
@media (max-width: 768px) {
  .camera-main {
    /* flex-direction: column; */
    align-items: start;
  }

  .capture-actions {
    bottom: 0px;
    position: fixed;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    padding: 0 20px;
    z-index: 100; /* 确保在其他内容上方 */
    margin-top: 0; /* 移除原有的margin-top */
    background-color: #fff;
    height: 80px;
  }

  .camera-container {
    padding-bottom: 80px;
    margin: 10px;
  }
  .camera-active-container {
    height: 500px;
  }
  .user-info-form {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  .form-item {
    width: 100%;
  }

  .form-label {
    min-width: 60px;
  }

  /* .camera-preview {
    height: 300px;
  } */

  .preview-width {
    width: 100%;
  }

  .preview-actions {
    flex-direction: column;
    gap: 12px;
  }

  .preview-actions .el-button {
    width: 100%;
    margin-left: 0px;
  }
}

@media (max-width: 480px) {
  .camera-main {
    /* flex-direction: column; */
    align-items: start;
  }

  .capture-actions {
    bottom: 0px;
  }

  .camera-container {
    padding-bottom: 60px;
  }

  .user-info-form {
    padding: 12px 15px;
    gap: 12px;
  }

  .form-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .progress-header {
    padding: 15px;
  }

  /* .camera-preview {
    height: 200px;
  } */

  .capture-info h3 {
    font-size: 18px;
  }

  .capture-info p {
    font-size: 14px;
  }
}
</style>
