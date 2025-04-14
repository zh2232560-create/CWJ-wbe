<template>
    <el-card class="meeting-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ meeting.title }}</span>
          <el-tag :type="statusTagType">{{ meetingStatus }}</el-tag>
        </div>
      </template>
      
      <div class="card-content">
        <p><strong>议程:</strong> {{ meeting.agenda }}</p>
        <p><strong>时间:</strong> {{ formatDate(meeting.meeting_time) }}</p>
        
        <div v-if="meeting.visitor_info" class="visitor-info">
          <p><strong>来访人员:</strong> {{ meeting.visitor_info }}</p>
          <p v-if="meeting.visitor_vehicle"><strong>车牌号:</strong> {{ meeting.visitor_vehicle }}</p>
        </div>
      </div>
      
      <template #footer>
        <el-button type="primary" size="small" @click="handleDetail">查看详情</el-button>
      </template>
    </el-card>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { formatDate } from '@/utils/date'
  
  const props = defineProps({
    meeting: {
      type: Object,
      required: true
    }
  })
  
  const router = useRouter()
  
  const meetingStatus = computed(() => {
    const statusMap = {
      draft: '草稿',
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成'
    }
    return statusMap[props.meeting.status] || props.meeting.status
  })
  
  const statusTagType = computed(() => {
    const typeMap = {
      draft: '',
      pending: 'warning',
      confirmed: 'success',
      completed: 'info'
    }
    return typeMap[props.meeting.status]
  })
  
  const handleDetail = () => {
    router.push(`/meetings/${props.meeting.id}`)
  }
  </script>
  
  <style scoped lang="scss">
  .meeting-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-content {
      p {
        margin: 8px 0;
      }
    }
  }
  </style>