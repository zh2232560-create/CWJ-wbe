import axios from 'axios'
import { ElMessage } from 'element-plus'
import Setting from '@/setting'
const service = axios.create({
  baseURL: Setting.apiBaseURL,
  timeout: 10000
})

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => {
    ElMessage.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service