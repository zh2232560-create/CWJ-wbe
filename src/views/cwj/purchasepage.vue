<template>
  <div class="body">
    <!-- 粒子背景 -->
    <div class="particles">
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="particle"
        :style="particleStyle(particle)"
      ></div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar" :class="{ active: isSubmitting }">
      <div class="progress-fill"></div>
    </div>

    <div class="container">
      <!-- 头部 -->
      <div class="header">
        <h1>蔡文姬采购平台</h1>
        <p>Cai Wenji Procurement Platform</p>
      </div>

      <!-- 表单容器 -->
      <div class="form-container">
        <form @submit.prevent="submitForm">
          <!-- 门店信息 -->
          <div class="form-section">
            <h2 class="section-title">门店信息</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="storeName" class="required">门店名称</label>
                <input
                  type="text"
                  id="storeName"
                  v-model="formData.storeName"
                  required
                  placeholder="请输入门店名称"
                  @blur="validateField('storeName')"
                  :class="{ valid: fieldValidity.storeName, invalid: fieldErrors.storeName }"
                />
                <span class="error-message" v-if="fieldErrors.storeName">请输入门店名称</span>
              </div>
              <div class="form-group">
                <label for="storeAddress" class="required">门店地址</label>
                <input
                  type="text"
                  id="storeAddress"
                  v-model="formData.storeAddress"
                  required
                  placeholder="请输入详细地址"
                  @blur="validateField('storeAddress')"
                  :class="{ valid: fieldValidity.storeAddress, invalid: fieldErrors.storeAddress }"
                />
                <span class="error-message" v-if="fieldErrors.storeAddress">请输入门店地址</span>
              </div>
              <div class="form-group">
                <label for="contactName" class="required">联系人</label>
                <input
                  type="text"
                  id="contactName"
                  v-model="formData.contactName"
                  required
                  placeholder="请输入联系人姓名"
                  @blur="validateField('contactName')"
                  :class="{ valid: fieldValidity.contactName, invalid: fieldErrors.contactName }"
                />
                <span class="error-message" v-if="fieldErrors.contactName">请输入联系人姓名</span>
              </div>
              <div class="form-group">
                <label for="contactPhone" class="required">手机号</label>
                <input
                  type="tel"
                  id="contactPhone"
                  v-model="formData.contactPhone"
                  required
                  pattern="^1[3-9]\d{9}$"
                  placeholder="请输入手机号"
                  @blur="validateField('contactPhone')"
                  :class="{ valid: fieldValidity.contactPhone, invalid: fieldErrors.contactPhone }"
                />
                <span class="error-message" v-if="fieldErrors.contactPhone"
                  >请输入正确的手机号</span
                >
              </div>
            </div>
          </div>

          <!-- 设备需求 -->
          <div class="form-section">
            <h2 class="section-title">设备需求</h2>
            <div class="form-grid">
              <div class="form-group device-select">
                <label for="deviceType" class="required">机器名称</label>
                <select id="deviceType" v-model="selectedDeviceType">
                  <option value="">请选择设备型号</option>
                  <option v-for="device in deviceOptions" :key="device.value" :value="device.value">
                    {{ device.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="quantity">数量</label>
                <div class="quantity-selector">
                  <button type="button" class="quantity-btn" @click="decreaseQuantity">−</button>
                  <input
                    type="number"
                    id="quantity"
                    class="quantity-input"
                    v-model.number="quantity"
                    min="1"
                    max="99"
                  />
                  <button type="button" class="quantity-btn" @click="increaseQuantity">+</button>
                </div>
              </div>
              <div class="form-group">
                <label>&nbsp;</label>
                <button type="button" class="btn btn-primary" @click="addDevice">添加设备</button>
              </div>
            </div>

            <!-- 已选设备列表 -->
            <div class="device-list">
              <div v-for="(device, index) in selectedDevices" :key="index" class="device-item">
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-specs">{{ device.specs }}</div>
                </div>
                <div class="device-quantity">x {{ device.quantity }}</div>
                <button class="device-remove" @click="removeDevice(index)">移除</button>
              </div>
            </div>
          </div>

          <!-- 时间计划 -->
          <div class="form-section">
            <h2 class="section-title">时间计划</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="openingDate" class="required">开业时间</label>
                <input
                  type="date"
                  id="openingDate"
                  v-model="formData.openingDate"
                  required
                  @blur="validateField('openingDate')"
                  :class="{ valid: fieldValidity.openingDate, invalid: fieldErrors.openingDate }"
                />
                <span class="error-message" v-if="fieldErrors.openingDate">请选择开业时间</span>
              </div>
              <div class="form-group">
                <label for="expectedDate" class="required">预期到店时间</label>
                <input
                  type="date"
                  id="expectedDate"
                  v-model="formData.expectedDate"
                  required
                  @blur="validateField('expectedDate')"
                  :class="{ valid: fieldValidity.expectedDate, invalid: fieldErrors.expectedDate }"
                />
                <span class="error-message" v-if="fieldErrors.expectedDate"
                  >请选择预期到店时间</span
                >
              </div>
            </div>
          </div>

          <!-- 企业信息 -->
          <div class="form-section">
            <h2 class="section-title">企业信息</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="companyName" class="required">公司名称</label>
                <input
                  type="text"
                  id="companyName"
                  v-model="formData.companyName"
                  required
                  placeholder="请输入公司全称"
                  @blur="validateField('companyName')"
                  :class="{ valid: fieldValidity.companyName, invalid: fieldErrors.companyName }"
                />
                <span class="error-message" v-if="fieldErrors.companyName">请输入公司名称</span>
              </div>
              <div class="form-group">
                <label for="taxNumber" class="required">纳税人识别号</label>
                <input
                  type="text"
                  id="taxNumber"
                  v-model="formData.taxNumber"
                  required
                  pattern="^[A-Z0-9]{15,20}$"
                  placeholder="请输入纳税人识别号"
                  @blur="validateField('taxNumber')"
                  :class="{ valid: fieldValidity.taxNumber, invalid: fieldErrors.taxNumber }"
                />
                <span class="error-message" v-if="fieldErrors.taxNumber"
                  >请输入正确的纳税人识别号</span
                >
              </div>
            </div>
          </div>

          <!-- 备注信息 -->
          <div class="form-section">
            <h2 class="section-title">备注信息</h2>
            <div class="form-group">
              <label for="remarks">特殊要求或说明</label>
              <textarea
                id="remarks"
                v-model="formData.remarks"
                rows="4"
                placeholder="请输入特殊要求或其他需要说明的信息"
              ></textarea>
            </div>
          </div>

          <!-- 按钮组 -->
          <div class="btn-group">
            <button type="button" class="btn btn-secondary" @click="saveDraft">保存草稿</button>
            <button
              type="submit"
              class="btn btn-primary"
              :class="{ loading: isSubmitting }"
              :disabled="isSubmitting"
            >
              提交采购需求
              <span class="spinner"></span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 成功提示模态框 -->
    <div class="success-modal" :class="{ show: showSuccessModal }">
      <div class="success-icon"></div>
      <h2 class="success-title">提交成功！</h2>
      <p class="success-message">采购需求已提交，订单号：{{ orderNumber }}</p>
      <p class="success-message">我们将在24小时内处理您的需求</p>
      <button class="modal-btn" @click="closeModal">确定</button>
    </div>

    <!-- 通知组件 -->
    <div v-if="notification.show" :class="`notification ${notification.type}`">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import cwjAPI from '@/api/cwj'

export default {
  name: 'CaiWenjiProcurementPlatform',
  data() {
    return {
      // 粒子背景数据
      particles: [],

      // 表单数据
      formData: {
        storeName: '',
        storeAddress: '',
        contactName: '',
        contactPhone: '',
        openingDate: '',
        expectedDate: '',
        companyName: '',
        taxNumber: '',
        remarks: '',
      },

      // 设备相关数据
      selectedDeviceType: '',
      quantity: 1,
      selectedDevices: [],

      // 设备选项
      deviceOptions: [],

      // 设备规格映射
      deviceSpecs: {},

      // 表单验证状态
      fieldValidity: {},
      fieldErrors: {},

      // 提交状态
      isSubmitting: false,
      showSuccessModal: false,
      orderNumber: 'PO202401160001',

      // 通知状态
      notification: {
        show: false,
        message: '',
        type: 'success',
      },
    }
  },

  methods: {
    // 创建粒子背景
    createParticles() {
      const particleCount = 50
      const particlesArray = []

      for (let i = 0; i < particleCount; i++) {
        particlesArray.push({
          left: Math.random() * 100,
          delay: Math.random() * 20,
          duration: 15 + Math.random() * 10,
        })
      }

      this.particles = particlesArray
    },

    // 粒子样式计算
    particleStyle(particle) {
      return {
        left: `${particle.left}%`,
        animationDelay: `${particle.delay}s`,
        animationDuration: `${particle.duration}s`,
      }
    },

    // 数量控制
    increaseQuantity() {
      if (this.quantity < 999) {
        this.quantity++
      }
    },

    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },

    // 添加设备
    addDevice() {
      if (!this.selectedDeviceType) {
        this.showNotification('请选择设备型号', 'error')
        return
      }

      const deviceOption = this.deviceOptions.find(
        (device) => device.value == this.selectedDeviceType, // 使用 == 以处理字符串和数字比较
      )

      if (!deviceOption) return

      const existingDeviceIndex = this.selectedDevices.findIndex(
        (device) => device.productId == this.selectedDeviceType, // 使用 productId 进行匹配
      )

      if (existingDeviceIndex !== -1) {
        // 如果设备已存在，增加数量
        this.selectedDevices[existingDeviceIndex].quantity += this.quantity
      } else {
        // 添加新设备
        this.selectedDevices.push({
          productId: this.selectedDeviceType, // 存储产品ID用于提交
          name: deviceOption.label,
          specs: this.deviceSpecs[this.selectedDeviceType],
          quantity: this.quantity,
        })
      }

      // 重置选择
      this.selectedDeviceType = ''
      this.quantity = 1

      this.showNotification('设备添加成功', 'success')
    },

    // 移除设备
    removeDevice(index) {
      this.selectedDevices.splice(index, 1)
      this.showNotification('设备已移除', 'success')
    },

    // 验证单个字段
    validateField(fieldName) {
      const value = this.formData[fieldName]
      let isValid = false

      switch (fieldName) {
        case 'storeName':
        case 'storeAddress':
        case 'contactName':
        case 'companyName':
          isValid = value && value.trim() !== ''
          break
        case 'contactPhone':
          isValid = /^1[3-9]\d{9}$/.test(value)
          break
        case 'taxNumber':
          isValid = /^[A-Z0-9]{15,20}$/.test(value)
          break
        case 'openingDate':
        case 'expectedDate':
          isValid = value && value.trim() !== ''
          break
        default:
          isValid = true
      }

      this.fieldValidity[fieldName] = isValid
      this.fieldErrors[fieldName] = !isValid

      return isValid
    },

    // 验证整个表单
    validateForm() {
      const requiredFields = [
        'storeName',
        'storeAddress',
        'contactName',
        'contactPhone',
        'openingDate',
        'expectedDate',
        'companyName',
        'taxNumber',
      ]

      let isValid = true

      requiredFields.forEach((field) => {
        if (!this.validateField(field)) {
          isValid = false
        }
      })

      // 验证日期逻辑
      const openingDate = new Date(this.formData.openingDate)
      const expectedDate = new Date(this.formData.expectedDate)

      if (expectedDate > openingDate) {
        this.showNotification('预期到店时间不能晚于开业时间', 'error')
        isValid = false
      }

      return isValid
    },

    // 保存草稿
    saveDraft() {
      const draftData = {
        formData: this.formData,
        selectedDevices: this.selectedDevices,
        savedAt: new Date().toISOString(),
      }

      localStorage.setItem('procurementDraft', JSON.stringify(draftData))
      this.showNotification('草稿已保存', 'success')
    },

    // 提交表单
    async submitForm() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        // 收集表单数据，按照指定格式组织
        const submissionData = {
          store_name: this.formData.storeName,
          store_address: this.formData.storeAddress,
          store_manager: this.formData.contactName,
          store_phone: this.formData.contactPhone,
          company_name: this.formData.companyName,
          tax_identification_number: this.formData.taxNumber,
          opening_time: new Date(this.formData.openingDate).getTime() / 1000, // 转换为Unix时间戳
          expected_arrival_time: new Date(this.formData.expectedDate).getTime() / 1000, // 转换为Unix时间戳
          remark: this.formData.remarks,
          items: this.selectedDevices.map((device) => ({
            product_id: device.productId,
            quantity: device.quantity,
          })),
          delivery_address: '', // 根据需要可以添加配送地址字段
        }
        console.log('提交数据:', submissionData)

        // 调用真实API提交采购需求
        const response = await cwjAPI.submitpurchaserequest(submissionData)

        if (response.status === 200) {
          // 使用实际返回的订单号
          this.orderNumber = response.data.order_no || 'PO' + new Date().getTime()

          // 显示成功模态框
          this.showSuccessModal = true

          // 通知采购处理
          this.notifyProcurement(submissionData)
        } else {
          throw new Error(response.message || '提交失败')
        }
      } catch (error) {
        console.error('提交失败:', error)
        this.showNotification('提交失败，请重试: ' + (error.message || ''), 'error')
      } finally {
        this.isSubmitting = false
      }
    },

    // 通知采购处理
    notifyProcurement(data) {
      // 模拟发送通知
      console.log('通知已发送至有方智能采购部门', data)
    },

    // 关闭模态框
    closeModal() {
      this.showSuccessModal = false

      // 重置表单
      setTimeout(() => {
        this.formData = {
          storeName: '',
          storeAddress: '',
          contactName: '',
          contactPhone: '',
          openingDate: '',
          expectedDate: '',
          companyName: '',
          taxNumber: '',
          remarks: '',
        }
        this.selectedDevices = []
        this.selectedDeviceType = ''
        this.quantity = 1

        // 清除验证状态
        Object.keys(this.fieldValidity).forEach((key) => {
          this.fieldValidity[key] = false
          this.fieldErrors[key] = false
        })
      }, 500)
    },

    // 显示通知
    showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message,
        type,
      }

      setTimeout(() => {
        this.notification.show = false
      }, 3000)
    },

    // 设置日期最小值为今天
    setMinDates() {
      const today = new Date().toISOString().split('T')[0]
      if (!this.formData.openingDate) {
        this.formData.openingDate = today
      }
      if (!this.formData.expectedDate) {
        this.formData.expectedDate = today
      }
    },

    // 加载草稿
    loadDraft() {
      const draft = localStorage.getItem('procurementDraft')
      if (draft) {
        try {
          const draftData = JSON.parse(draft)
          this.formData = { ...this.formData, ...draftData.formData }
          this.selectedDevices = draftData.selectedDevices || []
          this.showNotification('草稿已加载', 'success')
        } catch (error) {
          console.error('加载草稿失败:', error)
        }
      }
    },

    // 初始化设备选项数据
    async initializeDeviceOptions() {
      try {
        // 获取产品列表
        const response = await cwjAPI.getproductlist({ page: 1, limit: 100 })
        if (response && response.status === 200) {
          // 根据实际返回的数据结构构建设备选项
          this.deviceOptions = response.data.list.map((product) => ({
            value: product.id,
            label: product.product_name,
          }))

          // 根据实际返回的数据结构构建设备规格映射
          response.data.list.forEach((product) => {
            // 使用产品型号和功能描述构建规格信息
            const model = product.product_model || '未知型号'
            const effectivate = product.specs?.effectivate || '暂无功能描述'
            this.deviceSpecs[product.id] = `型号: ${model} | 功能: ${effectivate}`
          })
        } else {
          console.warn('获取产品列表返回异常状态:', response)
          this.showNotification('产品列表加载失败，请稍后重试', 'error')
        }
      } catch (error) {
        console.error('获取产品列表失败:', error)
        // 不中断页面加载，只显示通知
        this.showNotification('无法加载产品列表，请检查网络连接', 'error')
        // 设置默认空选项
        this.deviceOptions = []
      }
    },
  },

  async mounted() {
    try {
      this.createParticles()
      this.setMinDates()
      this.loadDraft()

      // 初始化设备选项
      await this.initializeDeviceOptions()
    } catch (error) {
      console.error('页面初始化失败:', error)
      this.showNotification('页面加载部分失败，但您仍可继续操作', 'error')
    }
  },
}
</script>

<style scoped>
/* 这里放置所有CSS样式，与之前提供的CSS代码相同 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  min-height: 100vh;
  color: #e0e6ed;
  overflow-x: hidden;
  position: relative;
}

/* 动态粒子背景 */
.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(0, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  animation: float 20s infinite linear;
}

@keyframes float {
  from {
    transform: translateY(100vh) translateX(0);
  }
  to {
    transform: translateY(-10vh) translateX(100px);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 1;
}

/* 头部标题 */
.header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  background: linear-gradient(120deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s ease infinite;
  text-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
  margin-bottom: 10px;
}

.header p {
  color: #8b92a9;
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 主表单容器 */
.form-container {
  background: rgba(25, 30, 50, 0.95);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  animation: scan 8s linear infinite;
}

@keyframes scan {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 表单分组 */
.form-section {
  margin-bottom: 35px;
  padding: 25px;
  background: rgba(15, 20, 35, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  position: relative;
  animation: fadeInUp 0.6s ease-out;
}

.form-section::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  /* background: linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.3), transparent); */
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}

.form-section:hover::after {
  opacity: 1;
  animation: borderGlow 2s linear infinite;
}

@keyframes borderGlow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  color: #667eea;
  font-size: 1.3rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  letter-spacing: 1px;
}

.section-title::before {
  content: '';
  width: 5px;
  height: 25px;
  background: linear-gradient(180deg, #667eea, #f093fb);
  border-radius: 3px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 表单网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* 表单组 */
.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #a0a8c5;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: color 0.3s;
}

.form-group label.required::after {
  content: ' *';
  color: #f093fb;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  background: rgba(15, 20, 35, 0.8);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  color: #e0e6ed;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #667eea;
  background: rgba(15, 20, 35, 1);
  box-shadow:
    0 0 20px rgba(102, 126, 234, 0.3),
    inset 0 0 5px rgba(102, 126, 234, 0.1);
}

.form-group input:focus + label,
.form-group select:focus + label {
  color: #667eea;
}

/* 输入框验证状态 */
.form-group input.valid {
  border-color: #00ff88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
}

.form-group input.invalid {
  border-color: #ff4444;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.2);
  animation: shake 0.5s;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.error-message {
  color: #ff4444;
  font-size: 0.85rem;
  margin-top: 5px;
  display: none;
  animation: slideDown 0.3s;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group input.invalid + .error-message {
  display: block;
}

/* 设备选择特殊样式 */
.device-select {
  position: relative;
}

.device-select::after {
  content: '▼';
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  pointer-events: none;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-50%);
  }
  50% {
    transform: translateY(-30%);
  }
}

/* 数量选择器 */
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-btn {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.quantity-btn:active {
  transform: scale(0.95);
}

.quantity-input {
  width: 80px;
  text-align: center;
  font-weight: bold;
}

/* 设备列表 */
.device-list {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.device-list::-webkit-scrollbar {
  width: 8px;
}

.device-list::-webkit-scrollbar-track {
  background: rgba(15, 20, 35, 0.5);
  border-radius: 4px;
}

.device-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea, #f093fb);
  border-radius: 4px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  margin-bottom: 10px;
  animation: slideInLeft 0.5s;
  transition: all 0.3s;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.device-item:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateX(5px);
}

.device-info {
  flex: 1;
}

.device-name {
  color: #e0e6ed;
  font-weight: 500;
  margin-bottom: 5px;
}

.device-specs {
  color: #8b92a9;
  font-size: 0.85rem;
}

.device-quantity {
  color: #f093fb;
  font-weight: bold;
  font-size: 1.1rem;
}

.device-remove {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  border: none;
  border-radius: 6px;
  color: white;
  padding: 8px 15px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.85rem;
}

.device-remove:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 68, 68, 0.4);
}

/* 按钮样式 */
.btn-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;
}

.btn {
  padding: 15px 40px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: transparent;
  color: #8b92a9;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.btn-secondary:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  color: #e0e6ed;
}

/* 进度条 */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(15, 20, 35, 0.5);
  z-index: 9999;
  display: none;
}

.progress-bar.active {
  display: block;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #f093fb);
  width: 0;
  animation: progress 2s ease-in-out;
}

@keyframes progress {
  0% {
    width: 0;
  }
  50% {
    width: 80%;
  }
  100% {
    width: 100%;
  }
}

/* 成功提示 */
.success-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  background: linear-gradient(135deg, rgba(25, 30, 50, 0.98), rgba(15, 20, 35, 0.98));
  border: 2px solid #00ff88;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  z-index: 10000;
  box-shadow: 0 20px 60px rgba(0, 255, 136, 0.3);
  transition: transform 0.5s;
}

.success-modal.show {
  transform: translate(-50%, -50%) scale(1);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border: 3px solid #00ff88;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: successPulse 1s;
}

@keyframes successPulse {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.success-icon::after {
  content: '✓';
  color: #00ff88;
  font-size: 2.5rem;
}

.success-title {
  color: #00ff88;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.success-message {
  color: #a0a8c5;
  margin-bottom: 20px;
}

.modal-btn {
  padding: 10px 30px;
  background: linear-gradient(135deg, #00ff88, #00cc66);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .form-container {
    padding: 20px;
  }

  .form-section {
    padding: 15px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .btn-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

/* Loading spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: none;
  margin-left: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn.loading .spinner {
  display: inline-block;
}

/* 通知样式 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  color: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  animation:
    slideInRight 0.3s ease-out,
    fadeOut 0.3s ease-out 2.7s;
  font-weight: 500;
}

.notification.success {
  background: linear-gradient(135deg, #00ff88, #00cc66);
}

.notification.error {
  background: linear-gradient(135deg, #ff4444, #cc0000);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
