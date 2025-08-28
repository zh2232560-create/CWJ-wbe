/**
 * 缓存工具函数
 * 提供对localStorage和sessionStorage的封装，支持设置过期时间
 */

/**
 * 存储数据到缓存
 * @param {string} key - 缓存键名
 * @param {any} value - 要存储的值（支持任意可序列化类型）
 * @param {number} [expireTime=0] - 过期时间（秒），0表示永不过期
 * @param {boolean} [isSession=false] - 是否使用sessionStorage，默认false使用localStorage
 */
export const setCache = (key, value, expireTime = 0, isSession = false) => {
  try {
    const storage = isSession ? sessionStorage : localStorage

    // 构建要存储的数据结构
    const data = {
      value: value,
      expire: expireTime > 0 ? Date.now() + expireTime * 1000 : 0, // 过期时间戳（毫秒），0表示永不过期
    }

    // 序列化数据并存储
    storage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`设置缓存[${key}]失败:`, error)
    return false
  }
}

/**
 * 从缓存获取数据
 * @param {string} key - 缓存键名
 * @param {boolean} [isSession=false] - 是否使用sessionStorage，默认false使用localStorage
 * @returns {any|null} 返回存储的值，过期或不存在则返回null
 */
export const getCache = (key, isSession = false) => {
  try {
    const storage = isSession ? sessionStorage : localStorage
    const dataStr = storage.getItem(key)

    if (!dataStr) {
      return null
    }

    const data = JSON.parse(dataStr)
    const now = Date.now()

    // 检查是否过期
    if (data.expire > 0 && now > data.expire) {
      // 过期则删除缓存
      removeCache(key, isSession)
      return null
    }

    return data.value
  } catch (error) {
    console.error(`获取缓存[${key}]失败:`, error)
    return null
  }
}

/**
 * 从缓存删除数据
 * @param {string} key - 缓存键名
 * @param {boolean} [isSession=false] - 是否使用sessionStorage，默认false使用localStorage
 * @returns {boolean} 删除成功返回true，失败返回false
 */
export const removeCache = (key, isSession = false) => {
  try {
    const storage = isSession ? sessionStorage : localStorage
    storage.removeItem(key)
    return true
  } catch (error) {
    console.error(`删除缓存[${key}]失败:`, error)
    return false
  }
}

/**
 * 清空所有缓存
 * @param {boolean} [isSession=false] - 是否清空sessionStorage，默认false清空localStorage
 * @returns {boolean} 清空成功返回true，失败返回false
 */
export const clearCache = (isSession = false) => {
  try {
    const storage = isSession ? sessionStorage : localStorage
    storage.clear()
    return true
  } catch (error) {
    console.error(`清空缓存失败:`, error)
    return false
  }
}

/**
 * 检查缓存是否存在且未过期
 * @param {string} key - 缓存键名
 * @param {boolean} [isSession=false] - 是否使用sessionStorage，默认false使用localStorage
 * @returns {boolean} 存在且未过期返回true，否则返回false
 */
export const hasCache = (key, isSession = false) => {
  return getCache(key, isSession) !== null
}
