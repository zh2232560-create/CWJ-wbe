/**
 * 认证相关工具函数
 * 用于处理token的存储、获取和删除
 */

// Token存储的键名
const TOKEN_KEY = 'app_token'

/**
 * 获取本地存储的token
 * @returns {string|null} 返回token字符串或null
 */
export const getToken = () => {
  try {
    // 从localStorage获取token
    const token = localStorage.getItem(TOKEN_KEY)
    return token || null
  } catch (error) {
    console.error('获取token失败:', error)
    return null
  }
}

/**
 * 存储token到本地
 * @param {string} token - 要存储的token字符串
 * @returns {boolean} 存储成功返回true，失败返回false
 */
export const setToken = (token) => {
  try {
    if (typeof token !== 'string') {
      console.error('token必须是字符串类型')
      return false
    }
    localStorage.setItem(TOKEN_KEY, token)
    return true
  } catch (error) {
    console.error('存储token失败:', error)
    return false
  }
}

/**
 * 清除本地存储的token
 * @returns {boolean} 清除成功返回true，失败返回false
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    return true
  } catch (error) {
    console.error('清除token失败:', error)
    return false
  }
}

/**
 * 检查是否存在有效的token
 * @returns {boolean} 存在token返回true，否则返回false
 */
export const hasToken = () => {
  const token = getToken()
  return !!token
}
