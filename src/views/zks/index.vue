<template>
  <div class="simple-photo-capture">
    <!-- 新增：使用加载组件 -->
    <loading-mask :visible="isSubmitting" text="正在提交，请等待..." />
    <!-- 顶部标题栏 -->
    <div class="header-section">
      <h2>足康树检测系统</h2>
    </div>

    <!-- 部位信息和进度 -->
    <div class="progress-section">
      <div class="progress-info">
        <h3>{{ currentPhotoName }}</h3>
        <p>已完成 {{ completedCount }} / {{ totalPhotos }} 张照片</p>
        <!-- 进度条 -->
        <div class="progress-bar-container">
          <el-progress
            :percentage="progressPercentage"
            :color="progressColors"
            :show-text="false"
            class="custom-progress-bar"
          />
        </div>
      </div>
    </div>

    <!-- 主拍摄区域 -->
    <div class="camera-main">
      <div class="camera-container">
        <!-- 相机预览 -->
        <div class="camera-preview">
          <div v-if="!isCameraActive" class="camera-placeholder">
            <el-icon size="64px" color="#909399"><Camera /></el-icon>
            <p>请开启摄像头并拍照</p>
          </div>
          <div v-show="isCameraActive" class="camera-active-container">
            <video ref="videoElement" autoplay playsinline class="camera-feed"></video>
            <el-image
              :src="currentMaskImage"
              :style="maskImageStyle"
              alt="蒙版层"
              class="camera-overlay"
              v-show="isCameraActive && !isTakingExtraPhoto && showMask"
            />
          </div>

          <canvas ref="canvasElement" style="display: none"></canvas>
        </div>
      </div>
    </div>

    <!-- 底部拍摄按钮 -->
    <div class="capture-actions">
      <div class="button-container">
        <div
          class="wave-button"
          @click="handleCameraAction"
          :class="{ capturing: isCapturing, active: isCameraActive }"
        >
          <div class="wave"></div>
          <div class="wave wave-2"></div>
          <div class="wave wave-3"></div>
          <el-icon v-if="!isCameraActive" class="button-icon">
            <VideoCamera />
          </el-icon>
          <el-icon v-else class="button-icon">
            <Camera />
          </el-icon>
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
      :show-close="false"
    >
      <div class="completion-dialog">
        <el-icon color="#67c23a" size="48px"><SuccessFilled /></el-icon>
        <h3>恭喜！所有照片拍摄完成</h3>
        <p>共 {{ totalPhotos }} 张照片已全部上传</p>
        <!-- 额外拍摄提示 -->
        <p v-if="extraPhotosCount > 0 && extraPhotosCount < 2" class="extra-photo-hint">
          已额外拍摄 {{ extraPhotosCount }} 张，还可再拍 {{ 2 - extraPhotosCount }} 张
        </p>
        <p v-if="extraPhotosCount >= 2" class="extra-photo-hint">已完成额外2张照片的拍摄</p>

        <!-- 用户基础信息填写 - 移到此处 -->
        <div class="user-info-form">
          <div class="form-item">
            <span style="color: red">*</span><label class="form-label">年龄：</label>
            <!-- 将输入框改为下拉选择框 -->
            <el-select
              v-model="UserInfo.age"
              placeholder="请选择年龄范围"
              style="width: 120px"
              @change="handleAgeRangeChange"
            >
              <el-option label="0-20岁" value="15" />
              <el-option label="20-30岁" value="25" />
              <el-option label="30-40岁" value="35" />
              <el-option label="40-50岁" value="45" />
              <el-option label="50岁以上" value="55" />
            </el-select>
          </div>

          <div class="form-item">
            <span style="color: red">*</span><label class="form-label">性别：</label>
            <el-radio-group v-model="UserInfo.sex" @change="radio_change($event)">
              <el-radio value="1">男</el-radio>
              <el-radio value="0">女</el-radio>
            </el-radio-group>
          </div>
          <div class="form-item">
            <span style="color: red">*</span><label class="form-label">拍摄者脚部状态：</label>
            <el-radio-group v-model="UserInfo.is_abnormal" @change="radio_change($event)">
              <el-radio value="0">正常</el-radio>
              <el-radio value="1">异常</el-radio>
            </el-radio-group>
          </div>
        </div>

        <!-- 新增：是否异常选择框 -->
        <!-- <div class="abnormal-selection">
          <span class="abnormal-label">拍摄者脚部状态：</span>
          <el-radio-group
            v-model="UserInfo.is_abnormal"
            class="abnormal-radio"
            @change="radio_change($event)"
          >
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">异常</el-radio>
          </el-radio-group>
        </div> -->
        <div class="completion-actions">
          <el-button @click="takeExtraPhoto" :disabled="extraPhotosCount >= 2">
            再拍一张
          </el-button>
          <el-button type="primary" @click="handleSubmit">全部提交</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Camera, VideoCamera, Check, Refresh, SuccessFilled, User } from '@element-plus/icons-vue'
import zksAPI from '@/api/zks'
import { setCache } from '@/utils/cache'
import LoadingMask from '@/components/common/loading.vue'
import router from '@/router'

// 模拟上传函数
const mockUploadPhoto = async (file, photoName) => {
  try {
    const res = await zksAPI.upload(file)
    return res.data
  } catch (err) {
    console.error('上传失败:', err.response?.data || err.message)
    throw err
  }
}

// 拍摄配置
const photoList = ref([
  {
    id: 1,
    key: 'LFD',
    name: '左脚脚面',
    image_mask: new URL('@/assets/zksstatic/zks_LFH.png', import.meta.url).href,
    phone_mask: new URL('@/assets/zksstatic/zks_LFD_mobile.png', import.meta.url).href,
    is_zhuan: {
      horizontal: true,
      vertical: true,
    },
  },
  {
    id: 2,
    key: 'LFP',
    name: '左脚脚掌',
    image_mask: new URL('@/assets/zksstatic/zks_LFP.png', import.meta.url).href,
    phone_mask: new URL('@/assets/zksstatic/zks_LFP_mobile.png', import.meta.url).href,
    is_zhuan: {
      horizontal: false,
      vertical: false,
    },
  },
  {
    id: 7,
    key: 'RFD',
    name: '右脚脚面',
    image_mask: new URL('@/assets/zksstatic/zks_RFD.png', import.meta.url).href,
    phone_mask: new URL('@/assets/zksstatic/zks_RFD_mobile.png', import.meta.url).href,
    is_zhuan: {
      horizontal: true,
      vertical: true,
    },
  },
  {
    id: 8,
    key: 'RFP',
    name: '右脚脚掌',
    image_mask: new URL('@/assets/zksstatic/zks_RFP.png', import.meta.url).href,
    phone_mask: new URL('@/assets/zksstatic/zks_RFP_mobile.png', import.meta.url).href,
    is_zhuan: {
      horizontal: false,
      vertical: false,
    },
  },
])

// 用户信息
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
  extraPhotos1: '',
  extraPhotos2: '',
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
const windowWidth = ref(window.innerWidth)
// 媒体流和元素引用
const mediaStream = ref(null)
const videoElement = ref(null)
const canvasElement = ref(null)

// 存储上传成功的图片链接
const uploadedPhotoUrls = ref([])
// 默认隐藏，提交时设为true
const isSubmitting = ref(false)

// 新增：跟踪额外拍摄的照片数量
const extraPhotosCount = ref(0)
// 新增：标记是否正在进行额外拍摄
const isTakingExtraPhoto = ref(false)

const showMask = ref(true)

const toggleMask = () => {
  if (isCameraActive.value) {
    showMask.value = !showMask.value
  }
}

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

const handleCameraAction = () => {
  if (!isCameraActive.value) {
    startCamera()
  } else {
    capturePhoto()
  }
}
const startCamera = async () => {
  // 移除年龄和性别的验证，允许直接启动相机
  isLoading.value = true
  // 重置之前可能的错误状态
  isCameraActive.value = false

  try {
    // 尝试获取媒体流
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment',
      },
      audio: false,
    })

    // 验证媒体流是否有效
    const videoTracks = mediaStream.value.getVideoTracks()
    if (videoTracks.length === 0) {
      throw new Error('未检测到可用的视频轨道')
    }

    if (!videoTracks[0].enabled) {
      throw new Error('视频轨道已被禁用')
    }

    if (videoElement.value) {
      // 清除之前的事件监听
      videoElement.value.removeEventListener('loadedmetadata', onVideoLoaded)
      videoElement.value.removeEventListener('error', onVideoError)

      // 设置新的媒体流
      videoElement.value.srcObject = mediaStream.value

      // 监听视频加载完成事件
      videoElement.value.addEventListener('loadedmetadata', onVideoLoaded)
      // 监听视频元素错误
      videoElement.value.addEventListener('error', onVideoError)
    } else {
      throw new Error('视频元素未找到')
    }
  } catch (error) {
    console.error('相机启动失败:', error)
    // 根据错误类型显示不同提示
    const errorMessages = {
      NotAllowedError: '相机权限被拒绝，请在浏览器设置中允许相机访问',
      NotFoundError: '未检测到可用相机设备',
      NotReadableError: '相机被其他应用占用，请关闭占用相机的应用后重试',
      OverconstrainedError: '无法满足相机参数要求，请尝试使用其他设备',
      TypeError: '相机访问参数错误',
    }

    // 显示具体错误信息，没有匹配的错误类型则显示通用信息
    const errorMsg = errorMessages[error.name] || `无法访问相机: ${error.message || '未知错误'}`
    ElMessage.error(errorMsg)
    isLoading.value = false
  }
}

// 视频加载完成处理函数
const onVideoLoaded = () => {
  if (videoElement.value) {
    // 验证视频尺寸是否有效
    if (videoElement.value.videoWidth === 0 || videoElement.value.videoHeight === 0) {
      ElMessage.error('相机输出无效，请尝试重新启动相机')
      stopCamera()
      isLoading.value = false
      return
    }

    // 视频准备就绪，允许拍摄
    isCameraActive.value = true
    isLoading.value = false
    showMask.value = true // 显示蒙版
    ElMessage.success('相机启动成功，可以开始拍摄')
  }
}

// 视频元素错误处理函数
const onVideoError = (event) => {
  console.error('视频元素错误:', event)
  const error = event.target.error
  let errorMsg = '视频加载失败，请重试'

  if (error) {
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        errorMsg = '视频加载被中止'
        break
      case error.MEDIA_ERR_NETWORK:
        errorMsg = '网络错误导致视频加载失败'
        break
      case error.MEDIA_ERR_DECODE:
        errorMsg = '视频解码失败，可能是相机硬件问题'
        break
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMsg = '不支持当前相机输出格式'
        break
    }
  }

  ElMessage.error(errorMsg)
  stopCamera()
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
  // 检查视频元素状态
  if (!videoElement.value || videoElement.value.paused || videoElement.value.ended) {
    ElMessage.error('视频流未准备好，请确保相机正常工作')
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
}

// 确认照片并上传
const confirmPhoto = async () => {
  isUploading.value = true
  try {
    // 从blob URL获取blob对象
    const response = await fetch(previewImageUrl.value)
    const blob = await response.blob()
    // 判断是否是额外拍摄
    if (isTakingExtraPhoto.value) {
      // 额外拍摄的文件命名（区分是第几张额外照片）
      const fileName = `额外_${extraPhotosCount.value + 1}_${Date.now()}.jpg`
      const file = new File([blob], fileName, { type: 'image/jpeg' })

      // 上传额外拍摄的照片
      const imageUrl = await mockUploadPhoto(file, `额外照片${extraPhotosCount.value + 1}`)

      // 存储上传记录
      uploadedPhotoUrls.value.push({
        name: `额外照片${extraPhotosCount.value + 1}`,
        url: imageUrl,
        index: `extra_${extraPhotosCount.value}`,
      })

      // 根据计数存储到对应的字段（LFLS/LFRS）
      if (extraPhotosCount.value === 0) {
        UserInfo.value.extraPhotos1 = imageUrl.image // 第一张额外照片存到LFLS
      } else {
        UserInfo.value.extraPhotos2 = imageUrl.image // 第二张额外照片存到LFRS
      }

      // 增加额外拍摄计数
      extraPhotosCount.value++

      // 提示成功信息
      ElMessage.success(`额外照片${extraPhotosCount.value}上传成功！`)

      // 释放资源并关闭预览
      URL.revokeObjectURL(previewImageUrl.value)
      previewImageUrl.value = ''
      showPreviewDialog.value = false

      // 停止相机并返回完成对话框
      stopCamera()
      isTakingExtraPhoto.value = false // 重置额外拍摄状态
      showCompletionDialog.value = true // 重新显示完成对话框
    } else {
      // 将Blob转换为File对象
      const fileName = `${currentPhotoName.value}_${Date.now()}.jpg`
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      // 上传照片
      const imageUrl = await mockUploadPhoto(file, currentPhotoName.value)

      // 存储上传成功的链接
      uploadedPhotoUrls.value.push({
        name: currentPhotoName.value,
        url: imageUrl,
        index: currentIndex.value,
      })
      // 获取当前照片的 key（如 LFD、LFP 等）
      const currentPhotoKey = photoList.value[currentIndex.value].key
      // 将 imageUrl 赋值给 UserInfo 中对应 key 的字段
      UserInfo.value[currentPhotoKey] = imageUrl.image

      ElMessage.success('照片上传成功！')

      // 释放blob URL
      URL.revokeObjectURL(previewImageUrl.value)
      previewImageUrl.value = ''
      showPreviewDialog.value = false

      // 移动到下一张或完成
      if (currentIndex.value < totalPhotos.value - 1) {
        currentIndex.value++
      } else {
        // 暂时关闭摄像头
        isCameraActive.value = false
        showCompletionDialog.value = true
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }
  isUploading.value = false
}

// 新增：处理额外拍摄功能
const takeExtraPhoto = async () => {
  if (extraPhotosCount.value >= 2) {
    ElMessage.warning('最多只能额外拍摄2张照片')
    return
  }

  // 关闭完成对话框
  showCompletionDialog.value = false
  // 标记为正在进行额外拍摄
  isTakingExtraPhoto.value = true

  // 启动相机
  await startCamera()

  // 如果相机启动成功，自动打开拍摄状态
  if (isCameraActive.value) {
    // 可以在这里添加提示，说明正在拍摄的是第几张额外照片
    ElMessage.info(`正在拍摄第 ${extraPhotosCount.value + 1} 张额外照片`)
  } else {
    isTakingExtraPhoto.value = false
  }
}
// 处理年龄范围选择变化
const handleAgeRangeChange = (value) => {
  // console.log('选择的年龄范围：', value)
  // console.log('选择的年龄范围：', UserInfo.value)
}
/**
 * 表单验证 - 现在在提交前验证
 */
const validateUserInfo = () => {
  if (!UserInfo.value.age) {
    // 验证是否选择了年龄范围
    ElMessage.warning('请选择年龄范围')
    return false
  }

  if (!UserInfo.value.sex) {
    ElMessage.warning('请选择性别')
    return false
  }

  if (!UserInfo.value.is_abnormal) {
    ElMessage.warning('请选择是否异常')
    return false
  }

  return true
}

const radio_change = (val) => {
  // 处理单选框变化
}

/**
 * 表单提交
 */
const handleSubmit = async () => {
  // 现在在提交前验证所有信息
  if (!validateUserInfo()) {
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

    const add_id = await zksAPI.addUserInfo(UserInfo.value)
    if (add_id.status == 200) {
      console.log('add_id', add_id)
      setTimeout(() => {
        showCompletionDialog.value = false
        isSubmitting.value = false
        ElMessage.success('提交成功！')
        router.push('/zks/ResultEvaluation?id=' + add_id.data.id)
        // 刷新
        // location.reload()
      }, 2000)
    } else {
      throw new Error('提交未返回预期结果,请检查API')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
    // 提交失败后恢复之前的状态
    isCameraActive.value = previousCameraState
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
/* 原有样式保持不变，只调整用户信息表单在对话框中的样式 */
.simple-photo-capture {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.header-section {
  background: #409eff;
  color: white;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-section h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.progress-section {
  background: white;
  padding: 12px 20px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 10;
}

.progress-info h3 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 18px;
}

.progress-info p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.progress-bar-container {
  width: 100%;
  padding: 0 10px;
}

.custom-progress-bar {
  width: 100%;
}

.camera-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  overflow: hidden;
}

.camera-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.camera-preview {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.camera-placeholder p {
  margin-top: 15px;
  color: #909399;
  font-size: 16px;
}

.camera-active-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 1;
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
  /* opacity: 0.8; */
}

.capture-actions {
  display: flex;
  justify-content: center;
  padding: 25px 15px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.button-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wave-button {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.wave-button::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: #409eff;
  clip-path: polygon(0 33%, 100% 33%, 100% 100%, 0 100%);
  z-index: 1;
}

.wave-button.active::before {
  background: #67c23a;
}

.wave-button.capturing::before {
  background: #e6a23c;
}

.wave {
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 30%;
  animation: wave 4s linear infinite;
  z-index: 2;
}

.wave-2 {
  animation-delay: 1s;
  opacity: 0.7;
}

.wave-3 {
  animation-delay: 2s;
  opacity: 0.4;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.wave-button .button-icon {
  color: white;
  font-size: 36px;
  position: relative;
  z-index: 3;
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

/* 用户基础信息表单 - 调整在对话框中的样式 */
.user-info-form {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 15px 20px;
  background: #f3f3f3;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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

/* 异常选择框样式 */
.abnormal-selection {
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.abnormal-label {
  font-weight: 500;
  margin-right: 12px;
}

.abnormal-radio {
  display: flex;
  gap: 24px;
}

/* 额外拍摄提示样式 */
.extra-photo-hint {
  color: #606266;
  margin: 10px 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .camera-main {
    align-items: stretch;
    padding: 5px;
  }

  .capture-actions {
    padding: 20px 10px;
  }

  .camera-container {
    border-radius: 0;
  }

  .camera-active-container {
    height: 100%;
  }

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

  .progress-section {
    padding: 8px 15px;
  }

  .progress-info h3 {
    font-size: 16px;
  }

  .progress-info p {
    font-size: 12px;
  }

  .wave-button {
    width: 80px;
    height: 80px;
  }

  .wave-button .button-icon {
    font-size: 28px;
  }

  .header-section {
    padding: 12px 15px;
  }

  .header-section h2 {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .camera-main {
    align-items: stretch;
    padding: 5px;
  }

  .capture-actions {
    padding: 15px 10px;
  }

  .camera-container {
    border-radius: 0;
  }

  .user-info-form {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
    padding: 12px 30px;
  }

  .form-item {
    width: 100%;
    align-items: center;
    gap: 5px;
  }

  .progress-section {
    padding: 8px 15px;
  }

  .progress-info h3 {
    font-size: 16px;
  }

  .progress-info p {
    font-size: 12px;
  }

  .wave-button {
    width: 70px;
    height: 70px;
  }

  .wave-button .button-icon {
    font-size: 24px;
  }

  .header-section {
    padding: 10px 12px;
  }

  .header-section h2 {
    font-size: 16px;
  }
}
</style>
