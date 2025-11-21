<template>
  <div class="bluetooth-test-container">
    <h1>蓝牙功能测试页面</h1>

    <!-- 基础信息展示区域 -->
    <el-card class="info-card">
      <div slot="header">
        <span>蓝牙状态信息</span>
      </div>
      <div class="status-info">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="status-item">
              <span class="label">蓝牙支持:</span>
              <span :class="['value', bluetoothSupported ? 'success' : 'error']">
                {{ bluetoothSupported ? '支持' : '不支持' }}
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="status-item">
              <span class="label">蓝牙状态:</span>
              <span :class="['value', bluetoothEnabled ? 'success' : 'error']">
                {{ bluetoothEnabled ? '已开启' : '未开启' }}
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="status-item">
              <span class="label">权限状态:</span>
              <span :class="['value', permissionGranted ? 'success' : 'warning']">
                {{ permissionStatus }}
              </span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 控制按钮区域 -->
    <el-card class="control-card">
      <div slot="header">
        <span>控制面板</span>
      </div>
      <div class="control-buttons">
        <el-button type="primary" @click="checkBluetoothSupport" :disabled="!bluetoothSupported">
          检查蓝牙支持
        </el-button>
        <el-button
          type="primary"
          @click="requestPermission"
          :disabled="!bluetoothSupported || !bluetoothEnabled"
        >
          请求蓝牙权限
        </el-button>
        <el-button
          type="primary"
          @click="scanDevices"
          :loading="scanning"
          :disabled="!bluetoothSupported || !bluetoothEnabled || !permissionGranted"
        >
          {{ scanning ? '扫描中...' : '选择设备' }}
        </el-button>
        <el-button type="danger" @click="disconnectDevice" :disabled="!connectedDevice">
          断开连接
        </el-button>
      </div>
    </el-card>

    <!-- 设备列表区域 -->
    <el-card class="devices-card">
      <div slot="header">
        <span>发现的蓝牙设备</span>
      </div>
      <el-table :data="devices" style="width: 100%">
        <el-table-column prop="name" label="设备名称" width="200"></el-table-column>
        <el-table-column prop="id" label="设备ID" width="250"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="connectToDevice(scope.row)"
              :disabled="connecting || scope.row.connected"
              v-if="!scope.row.connected"
            >
              连接
            </el-button>
            <el-button size="small" type="success" disabled v-else> 已连接 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 已连接设备信息 -->
    <el-card class="connected-device-card" v-if="connectedDevice">
      <div slot="header">
        <span>已连接设备</span>
      </div>
      <div class="device-info">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="device-item">
              <span class="label">设备名称:</span>
              <span class="value">{{ connectedDevice.name || 'N/A' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="device-item">
              <span class="label">设备ID:</span>
              <span class="value">{{ connectedDevice.id }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="device-item">
              <span class="label">连接状态:</span>
              <span class="value success">已连接</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="device-item">
              <span class="label">连接时间:</span>
              <span class="value">{{ connectionTime }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 服务和特征浏览 -->
    <el-card class="services-card" v-if="connectedDevice">
      <div slot="header">
        <span>服务和特征</span>
      </div>
      <div class="services-browser">
        <el-collapse v-model="activeServiceNames" accordion>
          <el-collapse-item v-for="service in services" :key="service.uuid" :name="service.uuid">
            <template #title>
              <strong>{{ getServiceName(service.uuid) }}</strong> <i>({{ service.uuid }})</i>
            </template>
            <div class="characteristics-list">
              <div
                v-for="characteristic in service.characteristics"
                :key="characteristic.uuid"
                class="characteristic-item"
              >
                <div class="characteristic-header">
                  <span>{{ getCharacteristicName(characteristic.uuid) }}</span>
                  <span class="uuid">({{ characteristic.uuid }})</span>
                </div>
                <div class="characteristic-properties">
                  <el-tag
                    v-for="property in getProperties(characteristic)"
                    :key="property"
                    size="mini"
                    :type="property === 'notify' || property === 'indicate' ? 'success' : ''"
                  >
                    {{ property }}
                  </el-tag>
                </div>
                <div class="characteristic-actions">
                  <el-button
                    size="mini"
                    @click="readCharacteristic(characteristic)"
                    :loading="reading.has(characteristic.uuid)"
                    v-if="characteristic.properties.read"
                  >
                    读取
                  </el-button>
                  <el-button
                    size="mini"
                    @click="toggleNotifications(characteristic)"
                    :type="notifications.has(characteristic.uuid) ? 'danger' : 'primary'"
                    :loading="toggling.has(characteristic.uuid)"
                    v-if="characteristic.properties.notify || characteristic.properties.indicate"
                  >
                    {{ notifications.has(characteristic.uuid) ? '停止通知' : '启用通知' }}
                  </el-button>
                </div>
                <div
                  class="characteristic-value"
                  v-if="characteristicValues.has(characteristic.uuid)"
                >
                  <strong>值:</strong> {{ characteristicValues.get(characteristic.uuid) }}
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>

    <!-- 数据接收区域 -->
    <el-card class="data-card">
      <div slot="header">
        <span>数据接收日志</span>
      </div>
      <div class="data-controls">
        <el-button type="danger" @click="clearDataLog"> 清空日志 </el-button>
        <el-button type="success" @click="downloadLogs"> 下载日志 </el-button>
      </div>

      <div class="data-display">
        <h4>接收到的数据:</h4>
        <div class="data-log" ref="dataLog">
          <div v-for="(log, index) in dataLogs" :key="index" :class="['log-entry', log.type]">
            <span class="timestamp">[{{ log.timestamp }}]</span>
            <span class="message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 测试结果统计 -->
    <el-card class="statistics-card">
      <div slot="header">
        <span>测试结果统计</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="statistic-item">
            <div class="stat-label">扫描到设备数</div>
            <div class="stat-value">{{ devices.length }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistic-item">
            <div class="stat-label">接收数据包数</div>
            <div class="stat-value">{{ dataPacketCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistic-item">
            <div class="stat-label">活动通知数</div>
            <div class="stat-value">{{ notifications.size }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statistic-item">
            <div class="stat-label">错误次数</div>
            <div class="stat-value">{{ errorCount }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'BluetoothTest',
  data() {
    return {
      bluetoothSupported: false,
      bluetoothEnabled: false,
      permissionGranted: false,
      permissionStatus: '未知',
      scanning: false,
      connecting: false,
      reading: new Set(), // 正在读取的特征
      toggling: new Set(), // 正在切换通知的特征
      devices: [],
      connectedDevice: null,
      connectionTime: '',
      dataLogs: [],
      dataPacketCount: 0,
      errorCount: 0,
      deviceMap: new Map(),
      services: [], // 存储服务和特征信息
      activeServiceNames: [], // 展开的服务
      characteristicValues: new Map(), // 特征值缓存
      notifications: new Set(), // 活动的通知
    }
  },
  mounted() {
    this.checkBluetoothSupport()
    this.checkBluetoothState()
    // 加载之前保存的日志
    this.loadLogsFromStorage()
  },
  beforeUnmount() {
    // 清理连接
    if (this.connectedDevice && this.connectedDevice.device.gatt.connected) {
      this.connectedDevice.device.gatt.disconnect()
    }
  },
  methods: {
    // 检查浏览器是否支持Web Bluetooth API
    checkBluetoothSupport() {
      if ('bluetooth' in navigator) {
        this.bluetoothSupported = true
        this.logMessage('info', '浏览器支持Web Bluetooth API')
      } else {
        this.bluetoothSupported = false
        this.logMessage('error', '浏览器不支持Web Bluetooth API，请使用Chrome、Edge等现代浏览器')
      }
    },

    // 检查蓝牙状态
    async checkBluetoothState() {
      if (!this.bluetoothSupported) return

      try {
        // 尝试获取蓝牙适配器状态
        const available = await navigator.bluetooth.getAvailability()
        this.bluetoothEnabled = available
        if (available) {
          this.logMessage('info', '蓝牙已开启')
        } else {
          this.logMessage('warning', '蓝牙未开启，请先开启设备蓝牙')
        }
      } catch (error) {
        // 在某些浏览器中，getAvailability可能会抛出异常而不是返回false
        // 我们假设如果Web Bluetooth API存在，则蓝牙可能是启用的
        this.bluetoothEnabled = true
        this.logMessage('info', '蓝牙状态检查完成')
      }
    },

    // 请求蓝牙权限
    async requestPermission() {
      if (!this.bluetoothSupported) return

      try {
        this.permissionStatus = '请求中...'
        // 尝试使用requestDevice来请求蓝牙权限
        // 这会弹出浏览器的蓝牙设备选择对话框
        // 添加optionalServices以允许访问所有服务
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            'generic_access',
            'generic_attribute',
            'device_information',
            'battery_service',
          ],
        })

        // 如果成功获取到设备，说明权限已被授予
        this.permissionStatus = '已授权'
        this.permissionGranted = true
        this.logMessage('info', '蓝牙权限已授予')

        // 将设备添加到设备列表中
        const deviceId = device.id
        const deviceName = device.name || 'Unknown Device'

        if (!this.deviceMap.has(deviceId)) {
          const deviceInfo = {
            id: deviceId,
            name: deviceName,
            device: device,
            connected: device.gatt.connected,
          }

          this.deviceMap.set(deviceId, deviceInfo)
          this.devices.push(deviceInfo)
          this.logMessage('info', `发现新设备: ${deviceName} (${deviceId})`)
        }
      } catch (error) {
        if (error.name === 'NotFoundError') {
          // 用户取消了设备选择对话框，这不代表权限被拒绝
          this.permissionStatus = '已授权'
          this.permissionGranted = true
          this.logMessage('info', '蓝牙权限已授予（用户取消了设备选择）')
        } else {
          this.permissionStatus = '请求失败'
          this.permissionGranted = false
          this.logMessage('error', `请求蓝牙权限失败: ${error.message}`)
        }
      }
    },

    // 选择蓝牙设备（替代扫描）
    async scanDevices() {
      if (!this.bluetoothSupported || !this.bluetoothEnabled || !this.permissionGranted) {
        this.logMessage('warning', '请先确保蓝牙已开启并获得权限')
        return
      }

      try {
        // 使用requestDevice方法让用户选择设备
        // 添加optionalServices以允许访问所有服务
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            'generic_access',
            'generic_attribute',
            'device_information',
            'battery_service',
          ],
        })

        // 将设备添加到设备列表中
        const deviceId = device.id
        const deviceName = device.name || 'Unknown Device'

        let deviceInfo
        if (this.deviceMap.has(deviceId)) {
          deviceInfo = this.deviceMap.get(deviceId)
          deviceInfo.device = device
          deviceInfo.connected = device.gatt.connected
          this.logMessage('info', `已选择设备: ${deviceName} (${deviceId})`)
        } else {
          deviceInfo = {
            id: deviceId,
            name: deviceName,
            device: device,
            connected: device.gatt.connected,
          }

          this.deviceMap.set(deviceId, deviceInfo)
          this.devices.push(deviceInfo)
          this.logMessage('info', `发现新设备: ${deviceName} (${deviceId})`)
        }

        // 更新设备列表中的连接状态
        const index = this.devices.findIndex((d) => d.id === deviceId)
        if (index !== -1) {
          this.devices.splice(index, 1, { ...deviceInfo })
        }
      } catch (error) {
        if (error.name === 'NotFoundError') {
          this.logMessage('info', '用户未选择任何设备')
        } else {
          this.logMessage('error', `选择设备失败: ${error.message}`)
          console.error('选择设备错误:', error)
        }
      }
    },

    // 连接到指定设备
    async connectToDevice(deviceInfo) {
      if (!deviceInfo || !deviceInfo.device) {
        this.logMessage('error', '无效的设备信息')
        return
      }

      this.connecting = true
      try {
        this.logMessage('info', `正在连接到设备: ${deviceInfo.name}...`)

        // 如果设备未连接，则连接设备
        if (!deviceInfo.device.gatt.connected) {
          await deviceInfo.device.gatt.connect()
        }

        deviceInfo.connected = true
        this.connectedDevice = deviceInfo
        this.connectionTime = new Date().toLocaleString()

        this.logMessage('success', `成功连接到设备: ${deviceInfo.name}`)

        // 更新设备列表中的连接状态
        const index = this.devices.findIndex((d) => d.id === deviceInfo.id)
        if (index !== -1) {
          this.devices.splice(index, 1, { ...deviceInfo })
        }

        // 探索服务和特征
        await this.discoverServices(deviceInfo.device)
      } catch (error) {
        this.logMessage('error', `连接设备失败: ${error.message}`)
        console.error('连接设备错误:', error)
      } finally {
        this.connecting = false
      }
    },

    // 断开当前连接的设备
    disconnectDevice() {
      if (this.connectedDevice && this.connectedDevice.device.gatt.connected) {
        try {
          // 停止所有通知
          this.notifications.forEach((characteristicUuid) => {
            const characteristic = this.findCharacteristicByUuid(characteristicUuid)
            if (characteristic) {
              this.stopNotifications(characteristic)
            }
          })

          // 断开连接
          this.connectedDevice.device.gatt.disconnect()
          this.logMessage('info', `已断开与设备 "${this.connectedDevice.name}" 的连接`)

          // 更新状态
          this.connectedDevice.connected = false
          const index = this.devices.findIndex((d) => d.id === this.connectedDevice.id)
          if (index !== -1) {
            this.devices.splice(index, 1, { ...this.connectedDevice })
          }

          this.connectedDevice = null
          this.connectionTime = ''
          this.services = []
          this.characteristicValues.clear()
          this.notifications.clear()
        } catch (error) {
          this.logMessage('error', `断开连接失败: ${error.message}`)
        }
      } else {
        this.connectedDevice = null
        this.connectionTime = ''
      }
    },

    // 发现服务和特征
    async discoverServices(device) {
      try {
        this.services = []

        // 获取主服务
        const services = await device.gatt.getPrimaryServices()
        this.logMessage('info', `发现 ${services.length} 个主服务`)

        // 遍历所有服务和特征
        for (const service of services) {
          const serviceInfo = {
            uuid: service.uuid,
            characteristics: [],
          }

          try {
            const characteristics = await service.getCharacteristics()
            this.logMessage('info', `服务 ${service.uuid} 包含 ${characteristics.length} 个特征`)

            for (const characteristic of characteristics) {
              serviceInfo.characteristics.push({
                uuid: characteristic.uuid,
                properties: characteristic.properties,
                characteristic: characteristic, // 保存原始对象引用
              })
            }
          } catch (error) {
            this.logMessage('error', `获取服务 ${service.uuid} 的特征失败: ${error.message}`)
          }

          this.services.push(serviceInfo)
        }
      } catch (error) {
        this.logMessage('error', `发现服务失败: ${error.message}`)
        console.error('发现服务错误:', error)
      }
    },

    // 查找特征通过UUID
    findCharacteristicByUuid(uuid) {
      for (const service of this.services) {
        for (const characteristic of service.characteristics) {
          if (characteristic.uuid === uuid) {
            return characteristic.characteristic
          }
        }
      }
      return null
    },

    // 读取特征值
    async readCharacteristic(characteristicInfo) {
      const characteristic = characteristicInfo.characteristic
      const uuid = characteristic.uuid

      // 防止重复读取
      if (this.reading.has(uuid)) return
      this.reading.add(uuid)

      try {
        const value = await characteristic.readValue()
        const valueStr = this.arrayBufferToHex(value.buffer)
        this.characteristicValues.set(uuid, valueStr)
        this.logMessage('data', `读取特征 ${uuid}: ${valueStr}`)

        // 保存到存储
        this.saveLogToStorage({
          type: 'data',
          message: `读取特征 ${uuid}: ${valueStr}`,
          timestamp: new Date().toLocaleTimeString(),
        })

        this.dataPacketCount++
      } catch (error) {
        this.logMessage('error', `读取特征 ${uuid} 失败: ${error.message}`)
        this.errorCount++
      } finally {
        this.reading.delete(uuid)
      }
    },

    // 切换通知状态
    async toggleNotifications(characteristicInfo) {
      const characteristic = characteristicInfo.characteristic
      const uuid = characteristic.uuid

      // 防止重复操作
      if (this.toggling.has(uuid)) return
      this.toggling.add(uuid)

      try {
        if (this.notifications.has(uuid)) {
          // 停止通知
          await this.stopNotifications(characteristic)
          this.notifications.delete(uuid)
          this.logMessage('info', `已停止特征 ${uuid} 的通知`)
        } else {
          // 启动通知
          await this.startNotifications(characteristic)
          this.notifications.add(uuid)
          this.logMessage('info', `已启动特征 ${uuid} 的通知`)
        }
      } catch (error) {
        this.logMessage('error', `切换特征 ${uuid} 通知状态失败: ${error.message}`)
        this.errorCount++
      } finally {
        this.toggling.delete(uuid)
      }
    },

    // 启动通知
    async startNotifications(characteristic) {
      // 添加事件监听器
      characteristic.addEventListener('characteristicvaluechanged', this.onCharacteristicChanged)

      // 启动通知
      await characteristic.startNotifications()
    },

    // 停止通知
    async stopNotifications(characteristic) {
      // 移除事件监听器
      characteristic.removeEventListener('characteristicvaluechanged', this.onCharacteristicChanged)

      // 停止通知
      await characteristic.stopNotifications()
    },

    // 特征值变化回调
    onCharacteristicChanged(event) {
      const characteristic = event.target
      const uuid = characteristic.uuid
      const value = characteristic.value

      const valueStr = this.arrayBufferToHex(value.buffer)
      this.characteristicValues.set(uuid, valueStr)

      const logMessage = `通知 - 特征 ${uuid}: ${valueStr}`
      this.logMessage('data', logMessage)

      // 保存到存储
      this.saveLogToStorage({
        type: 'data',
        message: logMessage,
        timestamp: new Date().toLocaleTimeString(),
      })

      this.dataPacketCount++

      // 触发Vue更新
      this.$forceUpdate()
    },

    // ArrayBuffer转十六进制字符串
    arrayBufferToHex(buffer) {
      const bytes = new Uint8Array(buffer)
      return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' ')
    },

    // 获取特征属性列表
    getProperties(characteristicInfo) {
      const props = []
      const properties = characteristicInfo.properties
      if (properties.broadcast) props.push('broadcast')
      if (properties.read) props.push('read')
      if (properties.writeWithoutResponse) props.push('writeWithoutResponse')
      if (properties.write) props.push('write')
      if (properties.notify) props.push('notify')
      if (properties.indicate) props.push('indicate')
      if (properties.authenticatedSignedWrites) props.push('authenticatedSignedWrites')
      if (properties.reliableWrite) props.push('reliableWrite')
      if (properties.writableAuxiliaries) props.push('writableAuxiliaries')
      return props
    },

    // 获取服务名称
    getServiceName(uuid) {
      // 常见服务UUID映射
      const serviceNames = {
        '00001800-0000-1000-8000-00805f9b34fb': 'Generic Access',
        '00001801-0000-1000-8000-00805f9b34fb': 'Generic Attribute',
        '0000180a-0000-1000-8000-00805f9b34fb': 'Device Information',
        '0000180f-0000-1000-8000-00805f9b34fb': 'Battery Service',
      }

      return serviceNames[uuid.toLowerCase()] || `服务 ${uuid.substring(0, 8)}`
    },

    // 获取特征名称
    getCharacteristicName(uuid) {
      // 常见特征UUID映射
      const characteristicNames = {
        '00002a00-0000-1000-8000-00805f9b34fb': 'Device Name',
        '00002a01-0000-1000-8000-00805f9b34fb': 'Appearance',
        '00002a04-0000-1000-8000-00805f9b34fb': 'Peripheral Preferred Connection Parameters',
        '00002a29-0000-1000-8000-00805f9b34fb': 'Manufacturer Name String',
        '00002a24-0000-1000-8000-00805f9b34fb': 'Model Number String',
        '00002a25-0000-1000-8000-00805f9b34fb': 'Serial Number String',
        '00002a27-0000-1000-8000-00805f9b34fb': 'Hardware Revision String',
        '00002a26-0000-1000-8000-00805f9b34fb': 'Firmware Revision String',
        '00002a28-0000-1000-8000-00805f9b34fb': 'Software Revision String',
        '00002a23-0000-1000-8000-00805f9b34fb': 'System ID',
        '00002a19-0000-1000-8000-00805f9b34fb': 'Battery Level',
      }

      return characteristicNames[uuid.toLowerCase()] || `特征 ${uuid.substring(0, 8)}`
    },

    // 记录日志消息
    logMessage(type, message) {
      const timestamp = new Date().toLocaleTimeString()
      this.dataLogs.push({
        type,
        message,
        timestamp,
      })

      // 异步保存到localStorage实现持久化，避免阻塞UI
      setTimeout(() => {
        this.saveLogToStorage({ type, message, timestamp })
      }, 0)

      // 自动滚动到底部
      this.$nextTick(() => {
        const logContainer = this.$refs.dataLog
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight
        }
      })

      // 同时输出到浏览器控制台
      switch (type) {
        case 'error':
          console.error(`[${timestamp}] ${message}`)
          break
        case 'warning':
          console.warn(`[${timestamp}] ${message}`)
          break
        default:
          console.log(`[${timestamp}] ${message}`)
      }
    },

    // 保存日志到localStorage
    saveLogToStorage(logEntry) {
      try {
        // 获取现有的日志数量
        let logCount = parseInt(localStorage.getItem('bluetoothTestLogsCount') || '0')

        // 添加新日志，使用单独的键存储每条日志
        localStorage.setItem(`bluetoothTestLog_${logCount}`, JSON.stringify(logEntry))
        logCount++

        // 更新日志总数
        localStorage.setItem('bluetoothTestLogsCount', logCount.toString())

        // 如果日志数量超过1000条，删除最旧的日志
        if (logCount > 1000) {
          const oldestIndex = logCount - 1001
          if (oldestIndex >= 0) {
            localStorage.removeItem(`bluetoothTestLog_${oldestIndex}`)
          }
        }
      } catch (e) {
        console.error('保存日志到localStorage失败:', e)
      }
    },

    // 从localStorage加载日志
    loadLogsFromStorage() {
      try {
        const logs = []
        const logCount = parseInt(localStorage.getItem('bluetoothTestLogsCount') || '0')

        // 计算需要加载的日志起始索引
        const startIndex = Math.max(0, logCount - 1000)

        // 加载最新的1000条日志
        for (let i = startIndex; i < logCount; i++) {
          const logStr = localStorage.getItem(`bluetoothTestLog_${i}`)
          if (logStr) {
            logs.push(JSON.parse(logStr))
          }
        }

        this.dataLogs = logs
      } catch (e) {
        console.error('从localStorage加载日志失败:', e)
      }
    },

    // 清空存储的日志
    clearStoredLogs() {
      try {
        const logCount = parseInt(localStorage.getItem('bluetoothTestLogsCount') || '0')

        // 删除所有日志条目
        for (let i = 0; i < logCount; i++) {
          localStorage.removeItem(`bluetoothTestLog_${i}`)
        }

        // 重置计数器
        localStorage.setItem('bluetoothTestLogsCount', '0')
      } catch (e) {
        console.error('清空存储的日志失败:', e)
      }
    },

    // 清空数据日志
    clearDataLog() {
      this.dataLogs = []
      this.clearStoredLogs() // 同时清空存储的日志
      this.logMessage('info', '日志已清空')
    },

    // 下载日志文件
    downloadLogs() {
      try {
        const logs = []
        const logCount = parseInt(localStorage.getItem('bluetoothTestLogsCount') || '0')
        const startIndex = Math.max(0, logCount - 1000)

        // 收集最新的1000条日志
        for (let i = startIndex; i < logCount; i++) {
          const logStr = localStorage.getItem(`bluetoothTestLog_${i}`)
          if (logStr) {
            logs.push(JSON.parse(logStr))
          }
        }

        const logText = logs
          .map((log) => `[${log.timestamp}] ${log.type}: ${log.message}`)
          .join('\n')
        const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bluetooth_test_logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        this.logMessage('error', `下载日志文件失败: ${e.message}`)
      }
    },
  },
}
</script>

<style scoped>
.bluetooth-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.info-card,
.control-card,
.devices-card,
.connected-device-card,
.services-card,
.data-card,
.statistics-card {
  margin-bottom: 20px;
}

.status-info {
  padding: 10px 0;
}

.status-item,
.device-item {
  display: flex;
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 80px;
}

.value {
  flex: 1;
}

.success {
  color: #67c23a;
}

.warning {
  color: #e6a23c;
}

.error {
  color: #f56c6c;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.data-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.data-display {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.data-log {
  height: 300px;
  overflow-y: auto;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.log-entry {
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 3px;
}

.log-entry.info {
  background-color: #ecf5ff;
  border-left: 4px solid #409eff;
}

.log-entry.success {
  background-color: #f0f9eb;
  border-left: 4px solid #67c23a;
}

.log-entry.warning {
  background-color: #fdf6ec;
  border-left: 4px solid #e6a23c;
}

.log-entry.error {
  background-color: #fef0f0;
  border-left: 4px solid #f56c6c;
}

.log-entry.data {
  background-color: #f4f4f5;
  border-left: 4px solid #909399;
}

.timestamp {
  color: #909399;
  margin-right: 10px;
}

.statistic-item {
  text-align: center;
  padding: 20px 0;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.characteristics-list {
  padding: 10px 0;
}

.characteristic-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.characteristic-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.characteristic-header .uuid {
  color: #909399;
  font-size: 12px;
}

.characteristic-properties {
  margin: 5px 0;
}

.characteristic-actions {
  margin: 10px 0;
}

.characteristic-value {
  margin-top: 5px;
  padding: 5px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
}
</style>
