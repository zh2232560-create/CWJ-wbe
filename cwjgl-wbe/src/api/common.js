import request from '@/utils/request'

export default {
  /**
   * 通用GET请求
   * @param {string} url - 请求地址
   * @param {Object} params - 请求参数
   * @returns {Promise}
   */
  get(url, params) {
    return request.get(url, { params })
  },

  /**
   * 通用POST请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @returns {Promise}
   */
  post(url, data) {
    return request.post(url, data)
  },

  /**
   * 通用PUT请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @returns {Promise}
   */
  put(url, data) {
    return request.put(url, data)
  },

  /**
   * 通用DELETE请求
   * @param {string} url - 请求地址
   * @returns {Promise}
   */
  delete(url) {
    return request.delete(url)
  }
}