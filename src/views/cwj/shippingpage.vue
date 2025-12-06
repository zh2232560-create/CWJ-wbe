<template>
  <div class="shipping-page body">
    <el-card class="shipping-card">
      <template #header>
        <div class="card-header">
          <span>发货页面</span>
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
                  <el-select v-model="scope.row.productType" placeholder="请选择产品类型">
                    <el-option label="艾灸机器人" value="艾灸机器人" />
                    <el-option label="理疗机器人" value="理疗机器人" />
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

            <el-button type="primary" plain @click="addDeviceRow" style="margin-top: 10px">
              添加设备
            </el-button>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟API接口
const api = {
  // 获取门店列表
  getStores: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: '北京旗舰店',
            address: '北京市朝阳区xxx路xxx号',
            manager: '张三',
            managerPhone: '13800000001',
          },
          {
            id: 2,
            name: '上海体验店',
            address: '上海市浦东新区xxx路xxx号',
            manager: '李四',
            managerPhone: '13800000002',
          },
          {
            id: 3,
            name: '广州服务中心',
            address: '广州市天河区xxx路xxx号',
            manager: '王五',
            managerPhone: '13800000003',
          },
        ])
      }, 300)
    })
  },

  // 获取厂家列表
  getManufacturers: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: '艾灸科技有限公司', contact: '赵六', phone: '13900000001' },
          { id: 2, name: '理疗设备厂', contact: '孙七', phone: '13900000002' },
        ])
      }, 300)
    })
  },

  // 提交发货信息
  submitShippingForm: (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟后端处理
        console.log('提交发货数据:', formData)
        resolve({
          success: true,
          message: '发货信息提交成功',
        })
      }, 800)
    })
  },
}

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

// 初始化数据
const initializeData = async () => {
  try {
    // 获取门店列表
    storeOptions.value = await api.getStores()

    // 获取厂家列表
    manufacturerOptions.value = await api.getManufacturers()
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('数据加载失败')
  }
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
  shippingForm.devices.push({
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
    const result = await api.submitShippingForm(shippingForm)

    if (result.success) {
      ElMessage.success('发货信息提交成功！')
      // 重置表单
      resetForm(shippingFormRef.value)
    } else {
      ElMessage.error(result.message || '发货失败')
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
  shippingForm.devices = [
    {
      productType: '',
      serialNumber: '',
    },
  ]

  // 重新初始化数据
  initializeData()
}

// 组件挂载时设置默认发货时间为当前时间并加载数据
onMounted(() => {
  const now = new Date()
  shippingForm.shipTime = formatDate(now)

  // 初始化数据
  initializeData()

  // 移除事件监听器
  window.removeEventListener('resize', checkMobile)
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
</style>
