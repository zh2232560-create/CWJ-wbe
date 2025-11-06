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
   * 足康树文件路由
   */
  {
    path: '/zks',
    name: 'zks',
    component: () => import('@/views/zks/index.vue'),
    meta: {
      title: '足康树采集系统',
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
    path: '/zks/report', //  company
    name: 'report',
    component: () => import('@/views/zks/Report.vue'),
    props: true,
    meta: {
      title: '足康树 - 照片拍摄', // 这里是你需要的特定标题
      favicon: '/zks-camera.ico', // 拍摄页面专属图标
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

  next()
})

export default router
