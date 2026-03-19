import request from '@/utils/request'

export default {
  /**
   *
   * @param {*} data
   * @returns
   * 获取产品列表
   */
  getproductlist(data) {
    const params = {
      page: data.page || 1,
      limit: data.limit || 10,
      keyword: data.keyword || '',
    }
    return request.get('/cwj/getProductList', { params })
  },
  /**
   * 获取门店列表
   * @param {*} data
   * @returns
   */
  getstorelist(data) {
    const params = {
      page: data.page || 1,
      limit: data.limit || 10,
      keyword: data.keyword || '',
    }
    return request.get('/cwj/getStoreList', { params })
  },
  /**
   * 获取厂商列表
   * @param {*} data
   * @returns
   */
  getmanufacturerlist(data) {
    const params = {
      page: data.page || 1,
      limit: data.limit || 10,
      keyword: data.keyword || '',
    }
    return request.get('/cwj/getManufacturerList', { params })
  },
  /**
   * 获取所有设备信息列表
   * @param {*} data
   * @returns
   */
  getdevicelist(data) {
    const params = {
      page: data.page || 1,
      limit: data.limit || 10,
      store_name: data.store_name || '',
      product_name: data.product_name || '',
      product_status: data.product_status || '',
      store_id: data.store_id || '',
    }
    return request.get('/cwj/device/statistics-list', { params })
  },
  /**
   * 待发货店铺查询
   * @param {*} data
   */
  getpendingstores(data) {
    const params = {
      days: data.days || 5,
      status: data.status || '待发货',
    }
    return request.get('/cwj/order/stores-by-arrival-days', { params })
  },

  /**
   * 通过其他信息获取门店详情
   */
  getstoredetailbyinfo(data) {
    const params = {
      product_status: data.product_status || -1,
      youfang_sn: data.youfang_sn || '',
      start_time: data.start_time || '',
      end_time: data.end_time || '',
      page: data.page || 1,
      limit: data.limit || 10,
    }
    return request.get('/cwj/order/stores-by-item-status', { params })
  },
  /**
   * 添加厂商信息
   */
  addmanufacturer(data) {
    return request.post('/cwj/addManufacturer', data)
  },
  /**
   * 添加门店信息
   */
  addstore(data) {
    return request.post('/cwj/addStore', data)
  },
  /**
   * 添加产品信息
   */
  addproduct(data) {
    return request.post('/cwj/addProduct', data)
  },
  /**
   * 提交采购需求
   * @param {*} data
   *
   * {
  "store_name": "北京王府井旗舰店",
  "store_address": "北京市东城区王府井大街255号",
  "store_phone": "张经理",
  "store_manager": "13812345678",
  "company_name": "北京智慧零售科技有限公司",
  "tax_identification_number": "91110108MA01ABCD12",
  "opening_time": "1741154400",
  "expected_arrival_time": "1740794400",
  "remark": "希望设备在到店前进行详细的功能测试，并提供现场安装调试服务。",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "delivery_address": ""
}
   */
  submitpurchaserequest(data) {
    return request.post('/cwj/addOrderDemand', data)
  },

  /**
   *更新订单明细
   * @param {*} data
   */
  updateorderdetail(data) {
    return request.post('/cwj/updateOrderItemStatus', data)
  },
  /**
   * 添加物流信息
   * {
  "items": [{
    "order_item_id":21,
    "manufacturer_sn":"deyi223654"
  }],
  "store_id": 6,
  "sender_type": "manufacturer",
  "sender_id": 6,
  "ship_time": "2025/12/05 10:48",
  "tracking_number": "youfang1234567",
  "logistics_batch": 1,
  "logistics_company": "",
  "ship_status": "shipped",
  "actual_arrival_time": "",
  "receiver": "",
  "receive_time": "",
  "remark": "无备注"
}
   */
  addlogisticsinfo(data) {
    return request.post('/cwj/addLogisticsInfo', data)
  },
  /**
   * {
    "store_id":6,
    "items":[22,23],
    "receiver_time":"2025/12/08 18:32",
    "receiver_name":"张三",
    "receiver_phone":13899658765,
    "operator":"张海港",
    "accessory_status":1,
    "missing_reason":"",
    "function_status":0,
    "function_issue_desc":"不能开机"
}
   * 签收信息接口
   * @param {*} data
   */
  signinfo(data) {
    return request.post('/cwj/device/sign', data)
  },
}
