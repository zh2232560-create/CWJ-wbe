<template>
  <div class="sign-management-platform body root">
    <!-- 顶部导航 -->
    <header class="header">
      <h1>
        <i class="ri-checkbox-circle-line"></i>
        蔡文姬签收管理平台
      </h1>
      <div class="user-info">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="头像" />
        <span id="currentUser">张海港（仓库管理员）</span>
      </div>
    </header>

    <div class="container">
      <!-- 左侧：签收表单 -->
      <div class="card">
        <div class="card-header">
          <i class="ri-file-list-3-line"></i>
          <h2>设备签收单</h2>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmit">
            <!-- 签收基础信息 -->
            <div class="form-section">
              <div class="section-title">
                <i class="ri-store-2-line"></i>
                签收基础信息
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label"> 门店选择 <span class="required">*</span> </label>
                  <select
                    class="form-select"
                    v-model="formData.store"
                    @change="loadSNList"
                    required
                  >
                    <option value="">请选择门店</option>
                    <option v-for="store in stores" :key="store.id" :value="store.id">
                      {{ store.name }} ({{ store.code }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label"> 收货时间 <span class="required">*</span> </label>
                  <input
                    type="datetime-local"
                    class="form-input"
                    v-model="formData.receiveTime"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label"> 操作员 <span class="required">*</span> </label>
                  <input type="text" class="form-input" v-model="formData.operator" disabled />
                </div>
              </div>
            </div>

            <!-- 质检信息 -->
            <div class="form-section">
              <div class="section-title">
                <i class="ri-shield-check-line"></i>
                质检信息
              </div>
              <div class="form-grid cols-1">
                <div class="form-group">
                  <label class="form-label"> 配件完整 <span class="required">*</span> </label>
                  <div class="radio-group">
                    <label class="radio-item">
                      <input type="radio" v-model="formData.accessoryComplete" value="yes" />
                      <span class="radio-custom"></span>
                      <span class="radio-label">是，配件齐全</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" v-model="formData.accessoryComplete" value="no" />
                      <span class="radio-custom"></span>
                      <span class="radio-label">否，存在缺失</span>
                    </label>
                  </div>
                  <div class="conditional-input" v-show="formData.accessoryComplete === 'no'">
                    <textarea
                      class="form-textarea"
                      placeholder="请详细说明缺失的配件名称及数量..."
                      v-model="formData.accessoryIssueText"
                    ></textarea>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label"> 功能正常 <span class="required">*</span> </label>
                  <div class="radio-group">
                    <label class="radio-item">
                      <input type="radio" v-model="formData.functionNormal" value="yes" />
                      <span class="radio-custom"></span>
                      <span class="radio-label">是，功能正常</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" v-model="formData.functionNormal" value="no" />
                      <span class="radio-custom"></span>
                      <span class="radio-label">否，存在故障</span>
                    </label>
                  </div>
                  <div class="conditional-input" v-show="formData.functionNormal === 'no'">
                    <textarea
                      class="form-textarea"
                      placeholder="请详细描述故障现象..."
                      v-model="formData.functionIssueText"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- 责任人信息 -->
            <div class="form-section">
              <div class="section-title">
                <i class="ri-user-star-line"></i>
                责任人信息
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label"> 机器负责人 <span class="required">*</span> </label>
                  <input
                    type="text"
                    class="form-input"
                    v-model="formData.responsiblePerson"
                    placeholder="请输入负责人姓名"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label"> 负责人联系方式 <span class="required">*</span> </label>
                  <input
                    type="tel"
                    class="form-input"
                    v-model="formData.responsiblePhone"
                    placeholder="请输入手机号码"
                    pattern="^1[3-9]\d{9}$"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- 按钮组 -->
            <div class="btn-group">
              <button type="button" class="btn btn-secondary" @click="resetForm">
                <i class="ri-refresh-line"></i>
                重置表单
              </button>
              <button type="submit" class="btn btn-primary" style="flex: 1">
                <i class="ri-checkbox-circle-line"></i>
                提交签收
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 右侧：SN列表 -->
      <div class="card">
        <div class="card-header">
          <i class="ri-barcode-box-line"></i>
          <h2>待签收设备 (SN)</h2>
        </div>
        <div class="card-body">
          <div class="alert alert-info">
            <i class="ri-information-line"></i>
            <span>请先选择门店，系统将自动加载该门店的待签收设备列表</span>
          </div>

          <div id="snListContainer">
            <div class="loading" v-if="loading">
              <div class="loading-spinner"></div>
            </div>
            <div class="empty-state" v-else-if="!formData.store || snList.length === 0">
              <i class="ri-inbox-2-line"></i>
              <p>{{ !formData.store ? '请先在左侧选择门店' : '该门店暂无待签收设备' }}</p>
              <p>{{ !formData.store ? '' : '所有设备已签收完毕' }}</p>
            </div>
            <div v-else>
              <div class="selected-count">
                <i class="ri-checkbox-multiple-line"></i>
                已选择 <strong>{{ selectedSNs.length }}</strong> / {{ snList.length }} 台设备
              </div>
              <div class="sn-list">
                <div
                  class="sn-item"
                  v-for="(item, index) in snList"
                  :key="item.sn"
                  :class="{ selected: isSNSelected(item.sn) }"
                  @click="toggleSN(item.sn)"
                >
                  <div class="sn-header">
                    <span class="sn-code">{{ item.sn }}</span>
                    <span class="sn-status shipped">已发货</span>
                  </div>
                  <div class="sn-details">
                    <div class="sn-detail-item">
                      <i class="ri-robot-line"></i>
                      <span>{{ item.model }}</span>
                    </div>
                    <div class="sn-detail-item">
                      <i class="ri-calendar-line"></i>
                      <span>发货: {{ item.shipDate }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功弹窗 -->
    <div class="modal-overlay" v-show="showSuccessModal">
      <div class="modal">
        <div class="modal-icon">
          <i class="ri-check-line"></i>
        </div>
        <h3>签收成功！</h3>
        <p>设备已成功入库，系统已自动生成有方SN</p>
        <div class="generated-sn">{{ generatedSN }}</div>
        <p style="font-size: 13px; color: #666">
          厂商SN与有方SN已建立绑定关系<br />
          设备状态已更新为"已部署"
        </p>
        <button class="btn btn-primary" @click="closeModal">
          <i class="ri-check-double-line"></i>
          确认完成
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// 模拟API接口
const api = {
  // 获取门店列表
  getStores: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'SH001', name: '上海旗舰店', code: 'SH001' },
          { id: 'BJ002', name: '北京朝阳店', code: 'BJ002' },
          { id: 'GZ003', name: '广州天河店', code: 'GZ003' },
          { id: 'SZ004', name: '深圳南山店', code: 'SZ004' },
          { id: 'HZ005', name: '杭州西湖店', code: 'HZ005' },
        ])
      }, 300)
    })
  },

  // 根据门店ID获取待签收设备列表
  getSNListByStore: (storeId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const snDataByStore = {
          SH001: [
            { sn: 'MFR-2025-A00128', model: 'XR-9000 Pro', shipDate: '2025-01-08', quantity: 1 },
            {
              sn: 'MFR-2025-A00129',
              model: 'SR-7 手术机器人',
              shipDate: '2025-01-08',
              quantity: 1,
            },
            {
              sn: 'MFR-2025-A00130',
              model: 'CR-1600 协作机器人',
              shipDate: '2025-01-09',
              quantity: 1,
            },
          ],
          BJ002: [
            {
              sn: 'MFR-2025-B00045',
              model: 'AMR-500 导航机器人',
              shipDate: '2025-01-07',
              quantity: 1,
            },
            { sn: 'MFR-2025-B00046', model: 'XR-9000 标准版', shipDate: '2025-01-07', quantity: 1 },
          ],
          GZ003: [
            {
              sn: 'MFR-2025-C00012',
              model: 'HeavyBot-500 重载型',
              shipDate: '2025-01-06',
              quantity: 1,
            },
          ],
          SZ004: [
            {
              sn: 'MFR-2025-D00088',
              model: 'NanoBot 纳米装配型',
              shipDate: '2025-01-09',
              quantity: 1,
            },
            {
              sn: 'MFR-2025-D00089',
              model: 'NanoBot 纳米装配型',
              shipDate: '2025-01-09',
              quantity: 1,
            },
            {
              sn: 'MFR-2025-D00090',
              model: 'XR-9000 Pro Max',
              shipDate: '2025-01-10',
              quantity: 1,
            },
            {
              sn: 'MFR-2025-D00091',
              model: 'SR-7 手术机器人',
              shipDate: '2025-01-10',
              quantity: 1,
            },
          ],
          HZ005: [],
        }

        resolve(snDataByStore[storeId] || [])
      }, 500)
    })
  },

  // 提交签收信息
  submitSignForm: (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟后端处理
        console.log('提交签收数据:', formData)
        resolve({
          success: true,
          message: '签收成功',
          generatedSN: `YF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`,
        })
      }, 800)
    })
  },
}

export default {
  name: 'receiptPlatform',
  data() {
    return {
      // 表单数据
      formData: {
        store: '',
        receiveTime: '',
        operator: '张海港',
        accessoryComplete: 'yes',
        accessoryIssueText: '',
        functionNormal: 'yes',
        functionIssueText: '',
        responsiblePerson: '',
        responsiblePhone: '',
      },
      // 选中的SN列表
      selectedSNs: [],
      // 门店列表
      stores: [],
      // 当前门店的SN列表
      snList: [],
      // 加载状态
      loading: false,
      // 成功弹窗显示状态
      showSuccessModal: false,
      // 生成的有方SN
      generatedSN: '',
    }
  },
  async mounted() {
    // 初始化数据
    await this.initializeData()
  },
  methods: {
    // 初始化数据
    async initializeData() {
      try {
        // 获取门店列表
        this.stores = await api.getStores()

        // 设置当前时间
        const now = new Date()
        const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
        this.formData.receiveTime = localISOTime
      } catch (error) {
        console.error('初始化数据失败:', error)
      }
    },

    // 加载SN列表
    async loadSNList() {
      if (!this.formData.store) {
        this.snList = []
        return
      }

      this.loading = true
      try {
        this.snList = await api.getSNListByStore(this.formData.store)
        this.selectedSNs = [] // 清空已选SN
      } catch (error) {
        console.error('加载SN列表失败:', error)
        this.snList = []
      } finally {
        this.loading = false
      }
    },

    // 切换SN选择
    toggleSN(sn) {
      const index = this.selectedSNs.indexOf(sn)
      if (index > -1) {
        this.selectedSNs.splice(index, 1)
      } else {
        this.selectedSNs.push(sn)
      }
    },

    // 检查SN是否被选中
    isSNSelected(sn) {
      return this.selectedSNs.includes(sn)
    },

    // 表单提交处理
    async handleSubmit() {
      // 验证是否选择了SN
      if (this.selectedSNs.length === 0) {
        alert('请至少选择一台设备进行签收！')
        return
      }

      // 验证手机号
      if (!/^1[3-9]\d{9}$/.test(this.formData.responsiblePhone)) {
        alert('请输入正确的手机号码！')
        return
      }

      // 检查质检状态
      const accessoryOk = this.formData.accessoryComplete === 'yes'
      const functionOk = this.formData.functionNormal === 'yes'

      if (!accessoryOk || !functionOk) {
        // 质检不通过
        const confirm = window.confirm(
          '质检不通过，设备将标记为异常并记录至维修记录表。是否确认提交？',
        )
        if (!confirm) return

        alert('已记录异常信息，设备已标记待维修。')
        this.resetForm()
        return
      }

      // 质检通过 - 提交签收
      try {
        const submitData = {
          ...this.formData,
          selectedSNs: this.selectedSNs,
        }

        const result = await api.submitSignForm(submitData)

        if (result.success) {
          this.generatedSN = result.generatedSN
          this.showSuccessModal = true
        } else {
          alert('签收失败，请重试')
        }
      } catch (error) {
        console.error('提交签收失败:', error)
        alert('网络错误，请重试')
      }
    },

    // 关闭弹窗
    closeModal() {
      this.showSuccessModal = false
      this.resetForm()
    },

    // 重置表单
    resetForm() {
      this.formData = {
        store: '',
        receiveTime: '',
        operator: '张海港',
        accessoryComplete: 'yes',
        accessoryIssueText: '',
        functionNormal: 'yes',
        functionIssueText: '',
        responsiblePerson: '',
        responsiblePhone: '',
      }

      // 重置时间
      const now = new Date()
      const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      this.formData.receiveTime = localISOTime

      // 清空SN列表和选择
      this.snList = []
      this.selectedSNs = []
    },
  },
}
</script>

<style scoped>
/* 这里保留了原有的所有CSS样式，只是添加了scoped属性 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.body {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--text);
}

/* 顶部导航 */
.header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
}

.header h1 {
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header h1 i {
  font-size: 28px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.15);
  padding: 10px 20px;
  border-radius: 50px;
}

.user-info img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid white;
}

/* 主容器 */
.container {
  max-width: 1400px;
  margin: 30px auto;
  padding: 0 30px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 30px;
}

/* 卡片样式 */
.card {
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 20px 28px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header i {
  font-size: 24px;
  color: var(--primary);
}

.card-header h2 {
  font-size: 18px;
  font-weight: 600;
}

.card-body {
  padding: 28px;
}

/* 表单区块 */
.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  font-size: 20px;
}

/* 表单网格 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-grid.cols-1 {
  grid-template-columns: 1fr;
}

/* 表单组 */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-label .required {
  color: var(--danger);
}

/* 输入框样式 */
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.form-input:disabled {
  background: #f1f5f9;
  color: var(--text-light);
  cursor: not-allowed;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-item input[type='radio'] {
  display: none;
}

.radio-custom {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.radio-custom::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  transform: scale(0);
  transition: transform 0.2s ease;
}

.radio-item input:checked + .radio-custom {
  border-color: var(--primary);
}

.radio-item input:checked + .radio-custom::after {
  transform: scale(1);
}

.radio-label {
  font-size: 14px;
}

/* 条件输入框（默认隐藏） */
.conditional-input {
  margin-top: 12px;
  animation: slideDown 0.3s ease;
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

/* SN列表 */
.sn-list {
  max-height: 500px;
  overflow-y: auto;
}

.sn-item {
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.sn-item:hover {
  border-color: var(--primary-light);
  background: #fafaff;
}

.sn-item.selected {
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(129, 140, 248, 0.05) 100%);
}

.sn-item.selected::after {
  content: '\eb7b';
  font-family: 'remixicon';
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: var(--success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.sn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sn-code {
  font-weight: 600;
  font-size: 15px;
  color: var(--primary);
  font-family: 'Courier New', monospace;
}

.sn-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.sn-status.shipped {
  background: #dbeafe;
  color: #1d4ed8;
}

.sn-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 13px;
  color: var(--text-light);
}

.sn-detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sn-detail-item i {
  color: var(--primary-light);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}

/* 按钮 */
.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(79, 70, 229, 0.5);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--bg);
  color: var(--text);
  border: 2px solid var(--border);
}

.btn-secondary:hover {
  background: var(--border);
}

.btn-block {
  width: 100%;
}

.btn-group {
  display: flex;
  gap: 16px;
  margin-top: 30px;
}

/* 提示框 */
.alert {
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.alert-info {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.alert i {
  font-size: 20px;
}

/* 选中计数 */
.selected-count {
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

/* 成功弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 450px;
  animation: modalIn 0.4s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  color: white;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.modal h3 {
  font-size: 24px;
  margin-bottom: 12px;
}

.modal p {
  color: var(--text-light);
  margin-bottom: 8px;
  font-size: 14px;
}

.modal .generated-sn {
  background: #f0fdf4;
  border: 2px solid var(--success);
  border-radius: 10px;
  padding: 16px;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 600;
  color: #059669;
}

.modal .btn {
  margin-top: 16px;
}

/* 加载动画 */
.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }

  .header h1 {
    font-size: 20px;
  }

  .container {
    padding: 0 15px;
    margin: 15px auto;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .btn-group {
    flex-direction: column;
  }
}
</style>
