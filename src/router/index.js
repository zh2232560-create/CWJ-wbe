import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/create',
    name: 'MeetingCreate',
    component: () => import('@/views/Create.vue'),
    meta: {
      title: '创建会议',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/edit',
    name: 'MeetingEdit',
    component: () => import('@/views/Edit.vue'),
    props: true,
    meta: {
      title: '编辑会议',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/form',
    name: 'Meetingform',
    component: () => import('@/views/form.vue'),
    props: true,
    meta: {
      title: '会议表单',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/admin',
    name: 'Meetinglist',
    component: () => import('@/views/Meeting_records.vue'),
    props: true,
    meta: {
      title: '会议记录管理',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/adminedit',
    name: 'adminedit',
    component: () => import('@/views/Meeting_url.vue'),
    props: true,
    meta: {
      title: '管理员编辑',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/',
    name: 'usercreate',
    component: () => import('@/views/Meeting_create.vue'),
    props: true,
    meta: {
      title: '会议预约系统',
      favicon: '/favicon.ico',
    },
  },

  /**
   * 蔡文姬页面路由
   */
  {
    path: '/cwj/shipping',
    name: 'shippingpage',
    component: () => import('@/views/cwj/shippingpage.vue'),
    meta: {
      title: '蔡文姬发货平台',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/cwj/admin',
    name: 'adminedit',
    component: () => import('@/views/cwj/adminpage.vue'),
    props: true,
    meta: {
      title: '蔡文姬管理员平台',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/cwj/purchase',
    name: 'purchasepage',
    component: () => import('@/views/cwj/purchasepage.vue'),
    props: true,
    meta: {
      title: '蔡文姬采购平台',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/cwj/receipt',
    name: 'receiptpage',
    component: () => import('@/views/cwj/receiptpage.vue'),
    props: true,
    meta: {
      title: '蔡文姬签收平台',
      favicon: '/favicon.ico',
    },
  },
  /**
   * 足康树文件路由
   */
  {
    path: '/zks',
    name: 'zks',
    component: () => import('@/views/zks/index.vue'),
    meta: {
      title: '足康树检测系统',
      favicon: '/zks_camera.ico', // 足康树主页面专属图标
    },
  },
  {
    path: '/zks/company', //  company
    name: 'company',
    component: () => import('@/views/zks/tongue.vue'),
    props: true,
    meta: {
      title: '足康树 - 照片拍摄', // 这里是你需要的特定标题
      favicon: '/zks-camera.ico', // 拍摄页面专属图标
    },
  },
  {
    path: '/zks/report/detail', //  company
    name: 'report',
    component: () => import('@/views/zks/Report.vue'),
    props: true,
    meta: {
      title: '足康树 - 报告详情', // 这里是你需要的特定标题
      favicon: '/zks-camera.ico', // 拍摄页面专属图标
    },
  },
  {
    path: '/zks/ResultEvaluation',
    name: 'Evaluation',
    component: () => import('@/views/zks/ResultEvaluation.vue'),
    props: true,
    meta: {
      title: '足康树 - 健康评估', // 这里是你需要的特定标题
      favicon: '/zks_camera.ico', // 足康树主页面专属图标
    },
  },
  {
    path: '/wxj/Inspection',
    name: 'Inspection',
    component: () => import('@/views/wxj/Inspection.vue'),
    meta: {
      title: '智能检测页面',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/wxj/bluetooth',
    name: 'Bluetooth',
    component: () => import('@/views/wxj/Bluetooth.vue'),
    meta: {
      title: '蓝牙功能测试',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/wxj/report',
    name: 'Report',
    component: () => import('@/views/wxj/PillowReport.vue'),
    meta: {
      title: '智能枕头报告页面',
      favicon: '/favicon.ico',
    },
  },
  // 404页面路由，需要放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
      favicon: '/favicon.ico',
    },
  },
]

const router = createRouter({
  history: createWebHistory('/meeting/'),
  routes,
})

// 全局导航守卫：动态修改标题和图标
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '会议预约系统'

  // 设置favicon图标
  const setFavicon = (iconPath) => {
    let link = document.querySelector('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = iconPath
  }

  // 使用路由配置中的图标，如果没有则使用默认图标
  setFavicon(to.meta.favicon || '/meeting/favicon.ico')

  // 如果没有匹配到任何路由，则跳转到404页面
  if (to.name === 'NotFound') {
    next()
  } else {
    next()
  }
})

export default router
