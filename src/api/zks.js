import request from '@/utils/request'
export default {
  // 上传图片 - 修复为正确的 FormData 格式
  upload(file) {
    // 直接接收 file 对象，更清晰
    const formData = new FormData()
    // 注意：后端可能期望的字段名是 'image' 或 'file'，需要和后端保持一致
    formData.append('image', file)
    return request.post('/zks/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 必须设置此类型
      },
    })
  },
  /**
   * 添加用户信息
   */
  addUserInfo(data) {
    return request.post('/zks/addUsers', data)
  },

  /**
   * 获取病症分类
   */
  getCategoryList(type) {
    const data = {
      type,
    }
    return request.get('/zks/disease_classification', { params: data })
  },
  /**
   * 获取初始诊断分类
   */
  getDiagnosisCategory(data) {
    return request.post('/zks/diagnosis_init_result', data)
  },

  /**
   * 诊断报告数据
   */
  getReportDetail(id) {
    const data = {
      id,
    }
    return request.get(`/zks/report_detail`, { params: data })
  },
}
