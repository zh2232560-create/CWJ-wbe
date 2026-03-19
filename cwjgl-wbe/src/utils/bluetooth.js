// utils/bluetooth.js

// 服务UUID和特征值UUID
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'

class BluetoothService {
  constructor() {
    this.device = null
    this.characteristic = null
    this.pollingInterval = null
    this.dataCallbacks = []
    this.isConnected = false
  }

  // 添加数据回调
  addDataCallback(callback) {
    this.dataCallbacks.push(callback)
  }

  // 移除数据回调
  removeDataCallback(callback) {
    this.dataCallbacks = this.dataCallbacks.filter((cb) => cb !== callback)
  }

  // 解析睡眠数据
  parseSleepData(dataBytes) {
    try {
      const decoder = new TextDecoder('utf-8')
      const jsonString = decoder.decode(dataBytes)
      const sleepData = JSON.parse(jsonString)

      // 调用所有注册的回调函数
      this.dataCallbacks.forEach((callback) => {
        callback(sleepData)
      })

      return sleepData
    } catch (error) {
      console.error('数据解析错误:', error)
      return null
    }
  }

  // 读取特征值数据
  async readCharacteristic() {
    if (!this.characteristic) {
      console.log('特征值未初始化')
      return
    }

    try {
      const value = await this.characteristic.readValue()
      return this.parseSleepData(value)
    } catch (error) {
      console.error('读取数据失败:', error)
      return null
    }
  }

  // 连接设备
  async connectDevice() {
    try {
      console.log('正在请求蓝牙设备...')

      // 请求蓝牙设备
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'MyESP32' }],
        optionalServices: [SERVICE_UUID],
      })

      console.log(`找到设备: ${this.device.name}`)

      // 连接GATT服务器
      console.log('正在连接GATT服务器...')
      const server = await this.device.gatt.connect()

      // 获取服务
      console.log('正在获取服务...')
      const service = await server.getPrimaryService(SERVICE_UUID)

      // 获取特征值
      console.log('正在获取特征值...')
      this.characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)

      this.isConnected = true
      console.log('连接成功')

      // 监听断开连接事件
      this.device.addEventListener('gattserverdisconnected', () => {
        this.onDisconnected()
      })

      return true
    } catch (error) {
      console.error('连接失败:', error)
      this.isConnected = false
      return false
    }
  }

  // 开始轮询
  startPolling(interval = 1000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    this.pollingInterval = setInterval(() => {
      this.readCharacteristic()
    }, interval)

    console.log('开始轮询数据')
  }

  // 停止轮询
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      console.log('停止轮询数据')
    }
  }

  // 断开连接
  disconnect() {
    this.stopPolling()

    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect()
    }

    this.onDisconnected()
  }

  // 断开连接处理
  onDisconnected() {
    console.log('设备已断开连接')
    this.isConnected = false
    this.device = null
    this.characteristic = null
  }

  // 获取连接状态
  getConnectionStatus() {
    return this.isConnected
  }
}

// 创建单例实例
const bluetoothService = new BluetoothService()

export default bluetoothService
