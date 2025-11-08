import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import Setting from '@/setting'
import { getToken } from '@/utils/auth' // 假设存在获取token的工具函数

// 创建axios实例
const service = axios.create({
  baseURL: Setting.apiBaseURL,
  timeout: 10000,
})

// 加载实例（用于全局加载状态）
let loadingInstance = null

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 显示加载状态
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.1)',
    })

    // 添加token（如果存在）
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // 错误处理
    if (loadingInstance) loadingInstance.close()
    ElMessage.error('请求参数错误')
    return Promise.reject(error)
  },
)

// 响应拦截器 - 只返回数据中的data字段
service.interceptors.response.use(
  (response) => {
    // 关闭加载状态
    if (loadingInstance) loadingInstance.close()

    // 假设后端返回格式为 { status: 200, data: {}, message: '' }
    const { status, data, message } = response.data

    // 处理业务成功状态
    if (status === 200 || status === 0) {
      // console.log('业务成功：', response)
      return response.data // 只返回data字段
    }

    // 处理业务错误状态
    ElMessage.error(message || '操作失败')
    return Promise.reject(new Error(message || '接口返回异常'))
  },
  (error) => {
    // 关闭加载状态
    if (loadingInstance) loadingInstance.close()

    // 处理网络错误
    let errorMsg = '网络请求失败，请稍后重试'
    if (error.response) {
      const { status, data } = error.response
      // 根据状态码定制错误信息
      if (status === 401) {
        errorMsg = '登录已过期，请重新登录'
        // 可以在这里添加跳转到登录页的逻辑
        // router.push('/login')
      } else if (status === 403) {
        errorMsg = '没有权限执行该操作'
      } else if (status === 404) {
        errorMsg = '请求的资源不存在'
      } else if (status >= 500) {
        errorMsg = '服务器内部错误'
      } else {
        errorMsg = data?.message || errorMsg
      }
    }

    ElMessage.error(errorMsg)
    return Promise.reject(error)
  },
)

export default service
