<template>
  <div class="shipping-page body">
    <el-card class="shipping-card">
      <template #header>
        <div class="card-header">
          <span>发货平台</span>
        </div>
      </template>

      <el-form
        ref="shippingFormRef"
        :model="shippingForm"
        :rules="shippingRules"
        label-width="120px"
        class="shipping-form"
      >
        <!-- 收货方信息 -->
        <el-row>
          <el-col :span="24">
            <h3>收货方信息</h3>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="门店" prop="store">
              <el-select
                v-model="shippingForm.store"
                placeholder="请选择门店"
                @change="handleStoreChange"
                style="width: 100%"
              >
                <el-option
                  v-for="store in storeOptions"
                  :key="store.id"
                  :label="store.name"
                  :value="store.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="地址" prop="address">
              <el-input v-model="shippingForm.address" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="负责人" prop="manager">
              <el-input v-model="shippingForm.manager" readonly />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="负责人电话" prop="managerPhone">
              <el-input v-model="shippingForm.managerPhone" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 发货信息 -->
        <el-row>
          <el-col :span="24">
            <h3>发货信息</h3>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="发货时间" prop="shipTime">
              <el-date-picker
                v-model="shippingForm.shipTime"
                type="datetime"
                placeholder="请选择发货时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="快递单号" prop="trackingNumber">
              <el-input v-model="shippingForm.trackingNumber" placeholder="请输入快递单号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="批次" prop="batch">
              <el-input v-model="shippingForm.batch" placeholder="例如：20251120-001" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 发货方信息 -->
        <el-row>
          <el-col :span="24">
            <h3>发货方信息</h3>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="厂家信息" prop="manufacturer">
              <el-select
                v-model="shippingForm.manufacturer"
                placeholder="请选择厂家"
                @change="handleManufacturerChange"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="manufacturer in manufacturerOptions"
                  :key="manufacturer.id"
                  :label="manufacturer.name"
                  :value="manufacturer.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="厂商联系人" prop="manufacturerContact">
              <el-input v-model="shippingForm.manufacturerContact" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="联系电话" prop="manufacturerPhone">
              <el-input v-model="shippingForm.manufacturerPhone" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 设备信息 -->
        <el-row>
          <el-col :span="24">
            <h3>设备信息</h3>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-table :data="shippingForm.devices" style="width: 100%" border>
              <el-table-column prop="productType" label="产品类型" :width="mobile ? 120 : 200">
                <template #default="scope">
                  <el-select
                    v-model="scope.row.productType"
                    placeholder="请选择产品类型"
                    @change="(selectedProduct) => handleProductChange(scope.row, selectedProduct)"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="device in getAvailableDevicesForSelect(scope.row)"
                      :key="device.id"
                      :label="getDeviceDisplayLabel(device)"
                      :value="device.id"
                    />
                  </el-select>
                </template>
              </el-table-column>

              <el-table-column prop="serialNumber" label="厂商SN">
                <template #default="scope">
                  <el-input
                    v-model="scope.row.serialNumber"
                    placeholder="请输入厂商SN"
                    @blur="validateSerialNumber(scope.row)"
                  />
                </template>
              </el-table-column>

              <el-table-column label="操作" :width="mobile ? 80 : 100">
                <template #default="scope">
                  <el-button type="danger" size="small" @click="removeDeviceRow(scope.$index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-button
              type="primary"
              plain
              @click="addDeviceRow"
              style="margin-top: 10px"
              :disabled="!canAddMoreDevices"
            >
              添加设备
            </el-button>

            <div
              v-if="deviceSelectionTips.length > 0"
              class="selection-tips"
              style="margin-top: 10px; color: #666; font-size: 12px"
            >
              <div v-for="tip in deviceSelectionTips" :key="tip.type">
                {{ tip.type }}: 已选 {{ tip.selected }} / 总共 {{ tip.total }}
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row style="margin-top: 30px">
          <el-col :span="24" class="button-group">
            <el-button type="primary" @click="submitForm(shippingFormRef)"> 提交 </el-button>
            <el-button @click="resetForm(shippingFormRef)">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import cwjAPI from '@/api/cwj'

// 表单引用
const shippingFormRef = ref()

// 移动端检测
const mobile = ref(false)

// 检测是否为移动端
const checkMobile = () => {
  mobile.value = window.innerWidth < 768
}

// 监听窗口大小变化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// 表单数据
const shippingForm = reactive({
  store: '', // 门店
  address: '', // 地址
  manager: '', // 负责人
  managerPhone: '', // 负责人电话
  shipTime: '', // 发货时间
  trackingNumber: '', // 快递单号
  batch: '', // 批次
  manufacturer: '', // 厂家信息
  manufacturerContact: '', // 厂商联系人
  manufacturerPhone: '', // 联系电话
  devices: [
    // 设备信息
    {
      deviceId: '',
      productType: '',
      serialNumber: '',
    },
  ],
})

// 表单验证规则
const shippingRules = {
  store: [{ required: true, message: '请选择门店', trigger: 'change' }],
  shipTime: [{ required: true, message: '请选择发货时间', trigger: 'change' }],
  trackingNumber: [{ required: true, message: '请输入快递单号', trigger: 'blur' }],
  'devices.productType': [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  'devices.serialNumber': [{ required: true, message: '请输入厂商SN', trigger: 'blur' }],
}

// 门店选项（从API获取）
const storeOptions = ref([])

// 厂家选项（从API获取）
const manufacturerOptions = ref([])

// 设备选项（从API获取）
const deviceOptions = ref([])

// 设备类型统计
const deviceTypeStats = computed(() => {
  const stats = {}
  deviceOptions.value.forEach((device) => {
    if (!stats[device.product_type]) {
      stats[device.product_type] = {
        total: 0,
        selected: 0,
        available: 0,
        devices: [],
      }
    }
    stats[device.product_type].total++
    stats[device.product_type].devices.push(device)
  })

  // 计算已选择的数量
  shippingForm.devices.forEach((deviceRow) => {
    if (deviceRow.deviceId) {
      const device = deviceOptions.value.find((d) => d.id === deviceRow.deviceId)
      if (device && stats[device.product_type]) {
        stats[device.product_type].selected++
      }
    }
  })

  // 计算可用数量
  Object.keys(stats).forEach((type) => {
    stats[type].available = stats[type].total - stats[type].selected
  })

  return stats
})

// 设备选择提示
const deviceSelectionTips = computed(() => {
  const tips = []
  Object.keys(deviceTypeStats.value).forEach((type) => {
    const stat = deviceTypeStats.value[type]
    tips.push({
      type,
      selected: stat.selected,
      total: stat.total,
      available: stat.available,
    })
  })
  return tips
})

// 是否可以添加更多设备
const canAddMoreDevices = computed(() => {
  // 检查是否还有可用设备
  const totalSelected = shippingForm.devices.filter((d) => d.deviceId).length
  return totalSelected < deviceOptions.value.length
})

// 获取设备显示标签
const getDeviceDisplayLabel = (device) => {
  // 检查该设备是否已被选择
  const isSelected = shippingForm.devices.some((row) => row.deviceId === device.id)
  const selectedText = isSelected ? '(已选择)' : ''
  return `${device.product_type} (ID: ${device.id}) ${selectedText}`
}

// 初始化数据
const initializeData = async () => {
  try {
    await getStoreList()
    await getDeviceList() // 使用默认的-1作为门店ID
    // 获取厂家列表
    const manufacturerResponse = await cwjAPI.getmanufacturerlist({ limit: 50 })
    if (manufacturerResponse.status === 200) {
      manufacturerOptions.value = manufacturerResponse.data.list.map((manufacturer) => ({
        id: manufacturer.id,
        name: manufacturer.manufacturer_name,
        contact: manufacturer.contact_person,
        phone: manufacturer.contact_phone,
      }))
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('数据加载失败')
  }
}

// 获取门店列表
const getStoreList = async () => {
  try {
    const storeResponse = await cwjAPI.getpendingstores({ days: 50, status: '待发货' })
    if (storeResponse.status === 200) {
      storeOptions.value = storeResponse.data.map((store) => ({
        id: store.store_id,
        name: store.store_name,
        address: store.address,
        manager: store.manager,
        managerPhone: store.manager_phone,
      }))
    }
  } catch (error) {
    console.error('获取门店列表失败:', error)
    ElMessage.error('门店数据加载失败')
  }
}

// 获取设备列表
const getDeviceList = async (storeId = -1) => {
  try {
    const deviceResponse = await cwjAPI.getdevicelist({
      store_id: storeId,
      product_status: 1,
      limit: 50,
    })
    if (deviceResponse.status === 200) {
      deviceOptions.value = deviceResponse.data.list.map((device) => ({
        id: device.id,
        product_type: device.product_type,
      }))
      // 重置设备选择
      resetDeviceSelections()
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    ElMessage.error('设备数据加载失败')
  }
}

// 重置设备选择
const resetDeviceSelections = () => {
  shippingForm.devices = [
    {
      deviceId: '',
      productType: '',
      serialNumber: '',
    },
  ]
}

// 处理门店选择变更
const handleStoreChange = (storeId) => {
  const selectedStore = storeOptions.value.find((store) => store.id === storeId)
  if (selectedStore) {
    shippingForm.address = selectedStore.address
    shippingForm.manager = selectedStore.manager
    shippingForm.managerPhone = selectedStore.managerPhone
  } else {
    shippingForm.address = ''
    shippingForm.manager = ''
    shippingForm.managerPhone = ''
  }

  // 根据选择的门店ID获取设备列表
  getDeviceList(storeId)
}

// 获取当前行可用的设备选项
const getAvailableDevicesForSelect = (currentRow) => {
  // 获取所有已选择的设备ID（排除当前行自己的选择）
  const selectedDeviceIds = new Set()
  shippingForm.devices.forEach((row, index) => {
    if (row !== currentRow && row.deviceId) {
      selectedDeviceIds.add(row.deviceId)
    }
  })

  // 过滤出可用的设备
  return deviceOptions.value.filter((device) => {
    // 如果设备已被其他行选择，则不可用
    if (selectedDeviceIds.has(device.id)) {
      return false
    }
    return true
  })
}

// 处理产品选择变更
const handleProductChange = (row, selectedDeviceId) => {
  // 清空原来的选择
  row.deviceId = ''
  row.productType = ''

  // 如果选择了设备
  if (selectedDeviceId) {
    const selectedDevice = deviceOptions.value.find((device) => device.id === selectedDeviceId)
    if (selectedDevice) {
      row.deviceId = selectedDevice.id
      row.productType = selectedDevice.product_type
    }
  }
}

// 处理厂家选择变更
const handleManufacturerChange = (manufacturerId) => {
  if (!manufacturerId) {
    shippingForm.manufacturerContact = ''
    shippingForm.manufacturerPhone = ''
    return
  }

  const selectedManufacturer = manufacturerOptions.value.find(
    (manufacturer) => manufacturer.id === manufacturerId,
  )
  if (selectedManufacturer) {
    shippingForm.manufacturerContact = selectedManufacturer.contact
    shippingForm.manufacturerPhone = selectedManufacturer.phone
  } else {
    shippingForm.manufacturerContact = ''
    shippingForm.manufacturerPhone = ''
  }
}

// 验证序列号唯一性（模拟）
const validateSerialNumber = async (device) => {
  // 这里应该调用后端API验证序列号唯一性
  // 暂时用模拟逻辑
  if (device.serialNumber && device.serialNumber.length < 5) {
    ElMessage.warning('厂商SN长度不能少于5位')
    return false
  }
  return true
}

// 添加设备行
const addDeviceRow = () => {
  // 检查是否还有可用设备
  if (!canAddMoreDevices.value) {
    ElMessage.warning('所有设备都已被选择，无法添加新行')
    return
  }

  shippingForm.devices.push({
    deviceId: '',
    productType: '',
    serialNumber: '',
  })
}

// 删除设备行
const removeDeviceRow = (index) => {
  if (shippingForm.devices.length <= 1) {
    ElMessage.warning('至少保留一行设备信息')
    return
  }
  shippingForm.devices.splice(index, 1)
}

// 提交表单
const submitForm = async (formEl) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      // 检查是否有重复选择的设备
      const deviceIds = shippingForm.devices.map((device) => device.deviceId).filter((id) => id)
      const uniqueDeviceIds = new Set(deviceIds)
      if (deviceIds.length !== uniqueDeviceIds.size) {
        ElMessage.error('有重复选择的设备，请检查设备选择')
        return
      }

      // 验证所有序列号
      const validations = shippingForm.devices.map((device) => validateSerialNumber(device))

      Promise.all(validations)
        .then((results) => {
          // 检查是否所有验证都通过
          if (results.every((result) => result)) {
            // 提交数据到服务器
            submitShippingData()
          }
        })
        .catch(() => {
          ElMessage.error('存在无效的序列号，请检查后重新提交')
        })
    } else {
      ElMessage.error('请填写必填项')
    }
  })
}

// 提交发货数据
const submitShippingData = async () => {
  try {
    // 构造提交数据
    const submitData = {
      store_id: shippingForm.store,
      sender_type: 'manufacturer',
      sender_id: shippingForm.manufacturer,
      ship_time: shippingForm.shipTime,
      tracking_number: shippingForm.trackingNumber,
      logistics_batch: shippingForm.batch,
      logistics_company: '',
      ship_status: 'shipped',
      actual_arrival_time: '',
      receiver: '',
      receive_time: '',
      remark: '',
      items: shippingForm.devices
        .filter((device) => device.deviceId)
        .map((device) => ({
          order_item_id: device.deviceId,
          manufacturer_sn: device.serialNumber,
        })),
    }

    // 检查是否有未选择设备的行
    const emptyDevices = shippingForm.devices.filter((device) => !device.deviceId)
    if (emptyDevices.length > 0) {
      ElMessage.error('请为所有设备行选择具体的设备')
      return
    }

    // 打印提交数据
    console.log('提交数据:', submitData)

    const result = await cwjAPI.addlogisticsinfo(submitData)

    if (result.status === 200) {
      ElMessage.success('发货信息提交成功！')
      // 重置表单
      resetForm(shippingFormRef.value)
    } else {
      ElMessage.error(result.msg || '发货失败')
    }
  } catch (error) {
    console.error('提交发货数据失败:', error)
    ElMessage.error('发货信息提交失败，请重试')
  }
}

// 重置表单
const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  resetDeviceSelections()

  // 重新初始化数据
  initializeData()
}

// 组件挂载时设置默认发货时间为当前时间并加载数据
onMounted(() => {
  try {
    const now = new Date()
    shippingForm.shipTime = formatDate(now)

    // 初始化数据
    initializeData().catch((error) => {
      console.error('初始化数据失败:', error)
      // 不中断页面显示
    })

    // 移除事件监听器
    window.removeEventListener('resize', checkMobile)
  } catch (error) {
    console.error('onMounted 执行出错:', error)
  }
})

// 格式化日期时间
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
</script>

<style scoped>
.shipping-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

@media screen and (max-width: 768px) {
  .shipping-page {
    padding: 10px;
  }

  .shipping-card {
    max-width: 100%;
  }

  .shipping-form {
    margin-top: 10px;
  }

  h3 {
    font-size: 16px;
    margin-top: 15px;
    margin-bottom: 10px;
  }

  .el-row {
    margin-bottom: 10px;
  }

  .el-form-item {
    margin-bottom: 15px;
  }

  .el-form-item__label {
    font-size: 14px;
  }

  .el-input__inner,
  .el-select__wrapper {
    font-size: 14px;
  }

  .button-group {
    gap: 10px;
  }

  .button-group .el-button {
    padding: 10px 20px;
    font-size: 14px;
  }

  .selection-tips {
    font-size: 11px;
  }
}

.shipping-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.shipping-form {
  margin-top: 20px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

h3 {
  margin-top: 20px;
  margin-bottom: 15px;
  color: #333;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.selection-tips {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}
</style>
