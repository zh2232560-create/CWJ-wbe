<template>
  <div class="body">
    <!-- 背景动画网格 -->
    <div class="bg-grid"></div>

    <div class="container">
      <!-- 头部 -->
      <div class="header">
        <h1>蔡文姬部署监控管理平台</h1>
      </div>

      <!-- 状态统计 -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-label">待发货</div>
          <div class="stat-number">{{ stats.pending }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">运输中</div>
          <div class="stat-number">{{ stats.shipping }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">已部署</div>
          <div class="stat-number">{{ stats.deployed }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">异常设备</div>
          <div class="stat-number">{{ stats.error }}</div>
        </div>
      </div>

      <!-- 筛选条件 -->
      <div class="card">
        <div class="section-title">筛选条件</div>
        <div class="filter-section">
          <div class="filter-group">
            <label>门店</label>
            <select v-model="filters.store">
              <option value="">全部门店</option>
              <option v-for="store in storeOptions" :key="store.value" :value="store.value">
                {{ store.label }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>产品类型</label>
            <select v-model="filters.productType">
              <option value="">全部类型</option>
              <option v-for="type in productTypeOptions" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>状态</label>
            <select v-model="filters.status">
              <option value="">全部状态</option>
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          <button class="btn btn-primary" @click="applyFilters">应用筛选</button>
          <button class="btn btn-danger" @click="resetFilters">重置筛选</button>
        </div>
      </div>

      <!-- 部署状态看板 -->
      <div class="card">
        <div class="section-title">部署状态看板</div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>有方SN</th>
                <th>厂商SN</th>
                <th>产品类型</th>
                <th>目标门店</th>
                <th>发货状态</th>
                <th>签收状态</th>
                <th>部署时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="device in filteredDevices" :key="device.id">
                <td>{{ device.yfSn }}</td>
                <td>{{ device.manufacturerSn }}</td>
                <td>{{ device.productType }}</td>
                <td>{{ device.targetStore }}</td>
                <td>
                  <span :class="getStatusClass(device.shippingStatus)">
                    {{ getStatusText(device.shippingStatus) }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusClass(device.receivingStatus)">
                    {{ getStatusText(device.receivingStatus) }}
                  </span>
                </td>
                <td>{{ device.deploymentTime || '-' }}</td>
                <td>
                  <div class="btn-group">
                    <button
                      v-if="device.productStatus == 0"
                      class="btn btn-primary btn-sm"
                      @click="processShipment(device)"
                    >
                      发货
                    </button>
                    <button v-else class="btn btn-success btn-sm" @click="editDevice(device)">
                      编辑
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 异常处理区 -->
      <div class="card" style="display: none">
        <div class="section-title">异常处理区</div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>设备SN</th>
                <th>异常类型</th>
                <th>异常描述</th>
                <th>发生时间</th>
                <th>处理状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="issue in exceptionIssues" :key="issue.id">
                <td>{{ issue.deviceSn }}</td>
                <td>
                  <span class="status-badge status-error">{{ issue.exceptionType }}</span>
                </td>
                <td>{{ issue.description }}</td>
                <td>{{ issue.occurrenceTime }}</td>
                <td>{{ issue.status }}</td>
                <td>
                  <div class="btn-group">
                    <button
                      v-for="action in issue.actions"
                      :key="action.type"
                      :class="`btn btn-${action.class} btn-sm`"
                      @click="handleExceptionAction(issue, action.type)"
                    >
                      {{ action.text }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 部署关系管理 -->
      <div class="card" style="display: none">
        <div class="section-title">部署关系管理</div>
        <div class="btn-group" style="margin-bottom: 15px">
          <button class="btn btn-primary" @click="showTransfer">设备调拨</button>
          <button class="btn btn-success" @click="showRecycle">设备回收</button>
          <button class="btn btn-primary" @click="showCorrection">部署信息修正</button>
        </div>
        <div id="deployment-content" style="padding: 10px 0">
          <div v-if="deploymentAction === 'transfer'" class="deployment-form">
            <h3>设备调拨</h3>
            <div class="form-grid">
              <select v-model="transferData.deviceId">
                <option value="">选择设备</option>
                <option v-for="device in availableDevices" :key="device.id" :value="device.id">
                  {{ device.yfSn }} - {{ device.targetStore }}
                </option>
              </select>
              <select v-model="transferData.targetStore">
                <option value="">目标门店</option>
                <option v-for="store in storeOptions" :key="store.value" :value="store.value">
                  {{ store.label }}
                </option>
              </select>
              <button class="btn btn-primary" @click="confirmTransfer">确认调拨</button>
            </div>
          </div>

          <div v-else-if="deploymentAction === 'recycle'" class="deployment-form">
            <h3>设备回收</h3>
            <div class="form-grid">
              <select v-model="recycleData.deviceId">
                <option value="">选择待回收设备</option>
                <option v-for="device in recyclableDevices" :key="device.id" :value="device.id">
                  {{ device.yfSn }} - {{ device.exceptionType || '正常设备' }}
                </option>
              </select>
              <input type="text" v-model="recycleData.reason" placeholder="回收原因" />
              <button class="btn btn-danger" @click="confirmRecycle">确认回收</button>
            </div>
          </div>

          <div v-else-if="deploymentAction === 'correction'" class="deployment-form">
            <h3>部署信息修正</h3>
            <div class="form-grid">
              <input type="text" v-model="correctionData.deviceSn" placeholder="设备SN" />
              <input type="text" v-model="correctionData.correctionInfo" placeholder="修正信息" />
              <button class="btn btn-success" @click="confirmCorrection">提交修正</button>
            </div>
          </div>

          <div v-else>
            <p style="color: #8b92a9">请选择相应的操作进行部署关系管理</p>
          </div>
        </div>
      </div>

      <!-- 报表功能 -->
      <div class="card" style="display: none">
        <div class="section-title">报表导出</div>
        <div class="btn-group">
          <button
            class="btn btn-primary"
            @click="exportReport('deployment')"
            :disabled="exportLoading.deployment"
          >
            <span v-if="exportLoading.deployment" class="loading"></span>
            {{ exportLoading.deployment ? '导出中...' : '导出部署统计报表' }}
          </button>
          <button
            class="btn btn-danger"
            @click="exportReport('exception')"
            :disabled="exportLoading.exception"
          >
            <span v-if="exportLoading.exception" class="loading"></span>
            {{ exportLoading.exception ? '导出中...' : '导出异常情况报告' }}
          </button>
          <button
            class="btn btn-success"
            @click="exportReport('all')"
            :disabled="exportLoading.all"
          >
            <span v-if="exportLoading.all" class="loading"></span>
            {{ exportLoading.all ? '导出中...' : '导出完整报告' }}
          </button>
        </div>
      </div>
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
  name: 'DeviceDeploymentSystem',
  data() {
    return {
      // 统计数据
      stats: {
        pending: 0,
        shipping: 0,
        deployed: 0,
        error: 0,
      },

      // 筛选条件
      filters: {
        store: '',
        productType: '',
        status: '',
      },

      // 设备数据
      devices: [],

      // 异常问题数据
      exceptionIssues: [],

      // 部署管理相关数据
      deploymentAction: '',
      transferData: {
        deviceId: '',
        targetStore: '',
      },
      recycleData: {
        deviceId: '',
        reason: '',
      },
      correctionData: {
        deviceSn: '',
        correctionInfo: '',
      },

      // 导出状态
      exportLoading: {
        deployment: false,
        exception: false,
        all: false,
      },

      // 通知
      notification: {
        show: false,
        message: '',
        type: 'success',
      },

      // 选项数据
      storeOptions: [],
      productTypeOptions: [],
      statusOptions: [
        { value: '0', label: '待处理' },
        { value: '1', label: '待发货' },
        { value: '2', label: '已发货' },
        { value: '5', label: '已部署' },
        { value: '6', label: '异常' },
      ],
    }
  },

  computed: {
    // 筛选后的设备列表
    filteredDevices() {
      let filtered = this.devices

      if (this.filters.store) {
        filtered = filtered.filter(
          (device) =>
            device.targetStore ===
            this.storeOptions.find((s) => s.value == this.filters.store)?.label,
        )
      }

      if (this.filters.productType) {
        filtered = filtered.filter((device) => device.productType === this.filters.productType)
      }

      if (this.filters.status) {
        // 将前端状态映射回后端状态
        const backendStatus = this.filters.status
        filtered = filtered.filter((device) => device.productStatus == backendStatus)
      }

      return filtered
    },

    // 可用设备列表（用于调拨）
    availableDevices() {
      return this.devices.filter(
        (device) => device.productStatus == 5, // 已部署的设备
      )
    },

    // 可回收设备列表
    recyclableDevices() {
      return this.devices.filter(
        (device) => device.productStatus == 6, // 异常的设备
      )
    },
  },

  methods: {
    // 初始化数据（真实API调用）
    async initData() {
      try {
        // 并行获取所有需要的数据
        const [deviceResponse, storeResponse, productResponse] = await Promise.all([
          cwjAPI.getdevicelist({ limit: 100 }),
          cwjAPI.getstorelist({ limit: 100 }),
          cwjAPI.getproductlist({ limit: 100 }),
        ])

        // 处理设备数据
        if (deviceResponse.status === 200) {
          this.devices = deviceResponse.data.list.map((device) => ({
            id: device.id,
            yfSn: device.youfang_sn,
            manufacturerSn: device.manufacturer_sn,
            productType: device.product_type,
            targetStore: device.target_store,
            shippingStatus: this.mapStatusToDeviceStatus(device.product_status),
            receivingStatus: this.mapStatusToDeviceStatus(device.product_status),
            deploymentTime: device.deploy_time || '-',
            productStatus: device.product_status,
            productStatusText: device.product_status_text,
          }))

          // 更新统计信息
          this.stats.pending = deviceResponse.data.statistics.pending_shipment_count
          this.stats.shipping = deviceResponse.data.statistics.shipped_not_received_count
          this.stats.deployed = deviceResponse.data.statistics.deployed_count
          this.stats.error = deviceResponse.data.statistics.exception_count
        }

        // 处理门店数据
        if (storeResponse.status === 200) {
          this.storeOptions = storeResponse.data.list.map((store) => ({
            value: store.id,
            label: store.store_name,
          }))
        }

        // 处理产品类型数据
        if (productResponse.status === 200) {
          // 使用Set去重，只保留唯一的product_type
          const uniqueProductTypes = [
            ...new Set(productResponse.data.list.map((product) => product.product_type)),
          ]
          this.productTypeOptions = uniqueProductTypes.map((type) => ({
            value: type,
            label: type,
          }))
        }

        this.showNotification('数据加载成功', 'success')
      } catch (error) {
        this.showNotification('数据加载失败: ' + error.message, 'error')
        console.error('数据加载错误:', error)
      }
    },

    // 将设备状态映射到前端使用的状态
    mapStatusToDeviceStatus(productStatus) {
      const statusMap = {
        0: 'pending', // 待处理
        1: 'processing', // 待发货
        2: 'shipping', // 已发货
        5: 'deployed', // 已部署
        6: 'error', // 异常
      }
      return statusMap[productStatus] || 'pending'
    },

    // 应用筛选
    async applyFilters() {
      try {
        const params = {
          limit: 100,
        }

        // 添加筛选条件
        if (this.filters.store) {
          params.store_id = this.filters.store
        }

        if (this.filters.productType) {
          params.product_type = this.filters.productType
        }

        if (this.filters.status) {
          // 将前端状态映射回后端状态
          params.product_status = this.filters.status
        }

        const response = await cwjAPI.getdevicelist(params)

        if (response.status === 200) {
          this.devices = response.data.list.map((device) => ({
            id: device.id,
            yfSn: device.youfang_sn,
            manufacturerSn: device.manufacturer_sn,
            productType: device.product_type,
            targetStore: device.target_store,
            shippingStatus: this.mapStatusToDeviceStatus(device.product_status),
            receivingStatus: this.mapStatusToDeviceStatus(device.product_status),
            deploymentTime: device.deploy_time || '-',
            productStatus: device.product_status,
            productStatusText: device.product_status_text,
          }))

          this.showNotification('筛选完成', 'success')
        }
      } catch (error) {
        this.showNotification('筛选失败: ' + error.message, 'error')
        console.error('筛选错误:', error)
      }
    },

    // 重置筛选
    async resetFilters() {
      this.filters = {
        store: '',
        productType: '',
        status: '',
      }

      // 重新加载所有数据
      await this.initData()
      this.showNotification('筛选条件已重置', 'success')
    },

    // 获取状态样式类
    getStatusClass(status) {
      return `status-badge status-${status}`
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        pending: '待处理',
        processing: '待发货',
        shipping: '运输中',
        deployed: '已部署',
        error: '异常',
      }
      return statusMap[status] || status
    },

    // 获取操作按钮文本
    getActionText(device) {
      if (device.productStatus == 0) return '发货'
      if (device.shippingStatus === 'shipping') return '追踪'
      if (device.shippingStatus === 'error') return '处理'
      return '查看'
    },

    // 查看设备详情
    viewDevice(device) {
      this.showNotification(`查看设备 ${device.yfSn}`, 'success')
    },

    // 编辑设备
    editDevice(device) {
      this.showNotification(`编辑设备 ${device.yfSn}`, 'success')
    },

    // 处理发货
    async processShipment(device) {
      try {
        const response = await cwjAPI.updateorderdetail({
          item_id: device.id,
          product_status: 1,
        })

        if (response.status === 200) {
          // 更新本地设备状态
          device.productStatus = 1
          device.shippingStatus = 'processing'
          device.receivingStatus = 'processing'

          this.showNotification('发货成功', 'success')
        } else {
          throw new Error(response.msg || '发货失败')
        }
      } catch (error) {
        this.showNotification('发货失败: ' + error.message, 'error')
        console.error('发货失败:', error)
      }
    },

    // 处理异常操作
    handleExceptionAction(issue, actionType) {
      this.showNotification(`处理异常 ${issue.deviceSn}: ${actionType}`, 'success')
    },

    // 部署管理功能
    showTransfer() {
      this.deploymentAction = 'transfer'
    },

    showRecycle() {
      this.deploymentAction = 'recycle'
    },

    showCorrection() {
      this.deploymentAction = 'correction'
    },

    // 确认调拨
    confirmTransfer() {
      if (!this.transferData.deviceId || !this.transferData.targetStore) {
        this.showNotification('请选择设备和目标门店', 'error')
        return
      }

      const device = this.devices.find((d) => d.id === this.transferData.deviceId)
      const store = this.storeOptions.find((s) => s.value === this.transferData.targetStore)

      this.showNotification(`设备 ${device.yfSn} 已调拨到 ${store.label}`, 'success')

      // 重置表单
      this.transferData = {
        deviceId: '',
        targetStore: '',
      }
      this.deploymentAction = ''
    },

    // 确认回收
    confirmRecycle() {
      if (!this.recycleData.deviceId || !this.recycleData.reason) {
        this.showNotification('请选择设备和填写回收原因', 'error')
        return
      }

      const device = this.devices.find((d) => d.id === this.recycleData.deviceId)

      this.showNotification(
        `设备 ${device.yfSn} 已回收，原因: ${this.recycleData.reason}`,
        'success',
      )

      // 重置表单
      this.recycleData = {
        deviceId: '',
        reason: '',
      }
      this.deploymentAction = ''
    },

    // 确认修正
    confirmCorrection() {
      if (!this.correctionData.deviceSn || !this.correctionData.correctionInfo) {
        this.showNotification('请填写设备SN和修正信息', 'error')
        return
      }

      this.showNotification(`设备 ${this.correctionData.deviceSn} 信息已修正`, 'success')

      // 重置表单
      this.correctionData = {
        deviceSn: '',
        correctionInfo: '',
      }
      this.deploymentAction = ''
    },

    // 导出报表
    async exportReport(type) {
      this.exportLoading[type] = true

      try {
        // 这里应该调用真实的导出API
        // 暂时显示成功消息
        const reportNames = {
          deployment: '部署统计',
          exception: '异常情况',
          all: '完整',
        }

        this.showNotification(`${reportNames[type]}报表导出成功`, 'success')
      } catch (error) {
        this.showNotification('报表导出失败: ' + error.message, 'error')
      } finally {
        this.exportLoading[type] = false
      }
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

    // 模拟延迟
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    // 模拟实时数据更新
    updateStats() {
      setInterval(() => {
        // 随机更新统计数据
        Object.keys(this.stats).forEach((stat) => {
          const change = Math.floor(Math.random() * 5) - 2
          this.stats[stat] = Math.max(0, this.stats[stat] + change)
        })
      }, 5000)
    },
  },

  mounted() {
    // 初始化数据
    this.initData()

    // 移除模拟的实时数据更新，因为我们现在使用真实数据
    // this.updateStats()
  },
}
</script>

<style scoped>
/* 原有的所有CSS样式保持不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #0a0e27 0%, #151932 100%);
  min-height: 100vh;
  color: #e0e6ed;
  overflow-x: hidden;
}

.bg-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  z-index: 0;
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  background: linear-gradient(120deg, #00ffff, #0080ff, #00ffff);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s ease infinite;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
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

.card {
  background: rgba(25, 30, 50, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

.card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00ffff, transparent, #0080ff);
  border-radius: 12px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s;
}

.card:hover::before {
  opacity: 0.3;
  animation: borderRotate 3s linear infinite;
}

@keyframes borderRotate {
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

.filter-section {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  color: #00ffff;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

select,
input {
  background: rgba(0, 20, 40, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #e0e6ed;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  min-width: 150px;
}

select:hover,
input:hover,
select:focus,
input:focus {
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  outline: none;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 128, 255, 0.1));
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #00ffff;
  margin: 10px 0;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.stat-label {
  font-size: 0.9rem;
  color: #8b92a9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(15, 20, 35, 0.9);
}

thead {
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1), rgba(0, 128, 255, 0.1));
  position: sticky;
  top: 0;
  z-index: 10;
}

th {
  padding: 15px;
  text-align: left;
  color: #00ffff;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

tbody tr {
  transition: all 0.3s;
}

tbody tr:hover {
  background: rgba(0, 255, 255, 0.05);
  transform: translateX(5px);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.status-pending {
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  color: #fff;
  box-shadow: 0 2px 10px rgba(255, 165, 0, 0.4);
}

.status-processing {
  background: linear-gradient(135deg, #8a2be2, #4b0082);
  color: #fff;
  box-shadow: 0 2px 10px rgba(138, 43, 226, 0.4);
}

.status-shipping {
  background: linear-gradient(135deg, #00bfff, #0080ff);
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 191, 255, 0.4);
}

.status-deployed {
  background: linear-gradient(135deg, #00ff00, #00cc00);
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 255, 0, 0.4);
}

.status-error {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: #fff;
  box-shadow: 0 2px 10px rgba(255, 68, 68, 0.4);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  background: rgba(255, 255, 255, 0.3);
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
  background: linear-gradient(135deg, #00ffff, #0080ff);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: #fff;
  box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #00ff00, #00cc00);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 255, 0, 0.3);
}

.btn-group {
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.section-title {
  color: #00ffff;
  font-size: 1.2rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title::before {
  content: '▶';
  animation: arrowPulse 1.5s infinite;
}

@keyframes arrowPulse {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}

.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 255, 255, 0.3);
  border-top-color: #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 部署表单样式 */
.deployment-form h3 {
  color: #00ffff;
  margin-bottom: 15px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: end;
}

.form-grid select,
.form-grid input {
  width: 100%;
}

/* 通知样式 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  animation:
    slideInRight 0.3s ease-out,
    fadeOut 0.3s ease-out 2.7s;
}

.notification.success {
  background: linear-gradient(135deg, #00ff00, #00cc00);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .stats-container {
    grid-template-columns: 1fr 1fr;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  select,
  input {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
