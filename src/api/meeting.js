import request from '@/utils/request'

export default {
  // 创建会议（无需认证）
  create(data) {
    return request.post('/meeting/addMeetings', data)
  },

  // 获取会议列表（无需认证）
  getList(params) {
    return request.get('/meetings', { params })
  },

  /**
   * 获取会议详情（无需认证）
   * @returns
   */
  //
  getDetail(id) {
    const data = {
      id,
    }
    return request.get(`/meeting/detail`, { params: data })
  },
  getMeetingList(params) {
    return request.get('/meeting/getMeetingsList', { params })
  },
  testapi(data) {
    return request.post('/meeting/addMeetings', data)
  },
  /**
   * 获取会议地点列表
   * @returns
   */
  getPlaceList() {
    return request.get('/meeting/location')
  },
  /**
   * 更新会议数据
   */
  update(data) {
    return request.put('/meeting/updateMeetings', data)
  },
  /**
   * 下载word
   */
  downloadWord(id) {
    const data = {
      id: id,
    }
    return request.post(`/meeting/downloadWord`, data)
  },

  updateeword_url(data) {
    return request.put('/meeting/updateMeetingsWordUrl', data)
  },
}
