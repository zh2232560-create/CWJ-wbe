<template>
  <div class="app-container">
    <!-- 头部 -->
    <el-header class="header">
      <h1>脚部图像采集系统</h1>
    </el-header>

    <!-- 主体内容 -->
    <el-main class="main-content">
      <el-row :gutter="20">
        <!-- 左脚区域 -->
        <el-col :xs="24" :sm="12">
          <div class="foot-section">
            <h2>左脚</h2>
            <el-row :gutter="15">
              <el-col v-for="(item, index) in leftFootParts" :key="index" :xs="12" :sm="8" :md="6">
                <div class="part-card">
                  <div class="image-container" @click="openCamera(item)">
                    <img v-if="item.image" :src="item.image" :alt="item.name" class="part-image" />
                    <img v-else :src="item.iconUrl" :alt="item.name" class="placeholder-icon" />
                    <div class="hover-overlay">
                      <span>点击拍摄</span>
                    </div>
                  </div>
                  <div class="part-info">
                    <div class="part-name">{{ item.name }}</div>
                    <div class="part-description">{{ item.description }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>

        <!-- 右脚区域 -->
        <el-col :xs="24" :sm="12">
          <div class="foot-section">
            <h2>右脚</h2>
            <el-row :gutter="15">
              <el-col v-for="(item, index) in rightFootParts" :key="index" :xs="12" :sm="8" :md="6">
                <div class="part-card">
                  <div class="image-container" @click="openCamera(item)">
                    <img v-if="item.image" :src="item.image" :alt="item.name" class="part-image" />
                    <img v-else :src="item.iconUrl" :alt="item.name" class="placeholder-icon" />
                    <div class="hover-overlay">
                      <span>点击拍摄</span>
                    </div>
                  </div>
                  <div class="part-info">
                    <div class="part-name">{{ item.name }}</div>
                    <div class="part-description">{{ item.description }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>

      <!-- 提交按钮 -->
      <div class="submit-btn-container">
        <el-button
          type="primary"
          size="large"
          :disabled="!isAllPhotosCompleted"
          @click="handleSubmit"
        >
          提交图片
        </el-button>
      </div>
    </el-main>

    <!-- 拍摄对话框 -->
    <el-dialog
      :title="'拍摄预览 - ' + (currentPart ? currentPart.name : '')"
      width="50%"
      v-model="dialogVisible"
    >
      <div class="camera-dialog">
        <p>正在拍摄: {{ currentPart ? currentPart.name : '' }}</p>
        <div class="camera-preview">
          <i class="el-icon-camera"></i>
        </div>
        <div class="dialog-actions">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="captureImage">拍摄</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FootImageCollection',
  data() {
    return {
      leftFootParts: [
        {
          id: 1,
          name: '脚面',
          description: '左脚脚面部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/33ba784e3ab0597bd31dfd2911016fce.jpg',
        },
        {
          id: 2,
          name: '脚掌',
          description: '左脚脚掌部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/aa6208ff5a319a25ce5859995eacc247.jpg',
        },
        {
          id: 3,
          name: '脚跟',
          description: '左脚脚跟部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/48e0af24162bd2ea8fab90e7f678b846.jpg',
        },
        {
          id: 4,
          name: '左侧',
          description: '左脚左侧部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/9fc877bf242db8b8dd0316cab6aa4928.jpg',
        },
        {
          id: 5,
          name: '右侧',
          description: '左脚右侧部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/f2b7d2f3bf4f202f7b87838d61cb5115.jpg',
        },
        {
          id: 6,
          name: '脚趾缝',
          description: '左脚脚趾缝部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/287ca9fc968dd3d40e3a9be9c67fb014.jpg',
        },
      ],
      rightFootParts: [
        {
          id: 7,
          name: '脚面',
          description: '右脚脚面部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/35b3eedad414aef5f344183e223b73f9.jpg',
        },
        {
          id: 8,
          name: '脚掌',
          description: '右脚脚掌部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/52bb9f98cc99a377d8064a7556bc1182.jpg',
        },
        {
          id: 9,
          name: '脚跟',
          description: '右脚脚跟部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/e5eaaa266563e94bf8903977dc53efd6.jpg',
        },
        {
          id: 10,
          name: '左侧',
          description: '右脚左侧部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/5566bdce2acab02e43c53e24efab59fc.jpg',
        },
        {
          id: 11,
          name: '右侧',
          description: '右脚右侧部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/08d59f4d85ca55706f75968716ac7357.jpg',
        },
        {
          id: 12,
          name: '脚趾缝',
          description: '右脚脚趾缝部位',
          image: null,
          iconUrl: 'https://ai-public.mastergo.com/ai/img_res/ca5d83c0eaa395731f37fda50e6acfd9.jpg',
        },
      ],
      dialogVisible: false,
      currentPart: null,
    }
  },
  computed: {
    isAllPhotosCompleted() {
      const allParts = [...this.leftFootParts, ...this.rightFootParts]
      return allParts.every((part) => part.image !== null)
    },
  },
  methods: {
    openCamera(part) {
      console.log('openCamera', part)
      this.currentPart = part
      this.dialogVisible = true
      //   console.log(this.dialogVisible)
    },
    handleClose() {
      this.dialogVisible = false
      this.currentPart = null
    },
    /**
     * 拍照并更新对应脚部部位的图片
     *
     * 该函数模拟拍照功能，将指定部位的图片更新为模拟图片。
     * 实际项目中需要替换为真实的相机集成功能。
     *
     * @returns {void}
     */
    captureImage() {
      if (!this.currentPart) return
      console.log('1122', this.currentPart)

      // 模拟拍照，实际项目中需要集成真实的相机功能
      const mockImage =
        'https://ai-public.mastergo.com/ai/img_res/d84c8043e975b327bedd1c64c96079ba.jpg'

      // 根据当前部位ID判断属于左脚还是右脚，并更新对应部位的图片
      if (this.currentPart.id <= 6) {
        const index = this.leftFootParts.findIndex((part) => part.id === this.currentPart.id)
        console.log('1111', index)
        if (index !== -1) {
          // 使用 splice 方法更新数组元素
          console.log('即将更新左脚图片，索引:', index)
          this.leftFootParts.splice(index, 1, {
            ...this.leftFootParts[index],
            image: mockImage,
          })
          console.log('左脚图片已更新:', this.leftFootParts)
        }
      } else {
        const index = this.rightFootParts.findIndex((part) => part.id === this.currentPart.id)
        if (index !== -1) {
          // 使用 splice 方法更新数组元素
          console.log('即将更新右脚图片，索引:', index)
          this.rightFootParts.splice(index, 1, {
            ...this.rightFootParts[index],
            image: mockImage,
          })
          console.log('右脚图片已更新:', this.rightFootParts)
        }
      }
      console.log('captureImage', mockImage)

      this.handleClose()
    },
    handleSubmit() {
      // 实际项目中这里处理图片提交逻辑
      this.$message.success('图片提交成功！')
    },
  },
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 15px 0;
  text-align: center;
}

.header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.main-content {
  padding: 20px;
}

.foot-section {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.foot-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #606266;
}

.part-card {
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.part-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  height: 150px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.placeholder-icon {
  width: 60px;
  height: 60px;
  opacity: 0.5;
}

.part-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-container:hover .hover-overlay {
  opacity: 1;
}

.part-info {
  padding: 15px;
  text-align: center;
}

.part-name {
  font-weight: 500;
  color: #303133;
}

.part-description {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.submit-btn-container {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 30px;
}

.camera-dialog {
  text-align: center;
}

.camera-dialog p {
  margin-bottom: 20px;
}

.camera-preview {
  background-color: #f5f7fa;
  height: 300px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.camera-preview .el-icon-camera {
  font-size: 50px;
  color: #909399;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-container {
    height: 120px;
  }

  .placeholder-icon {
    width: 50px;
    height: 50px;
  }

  .camera-preview {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }

  .foot-section {
    padding: 15px;
  }

  .image-container {
    height: 100px;
  }

  .part-info {
    padding: 10px;
  }
}
</style>
