import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'

const routes = [
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/admin',
    name: 'cwjAdmin',
    component: () => import('@/views/cwj/adminpage.vue'),
    props: true,
    meta: {
      title: '蔡文姬部署监控管理平台',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/cwj/dashboard.vue'),
    meta: {
      title: '蔡文姬监控大屏',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: () => import('@/views/cwj/analysis.vue'),
    meta: {
      title: '蔡文姬智能服务分析报告',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/aichat',
    name: 'aichat',
    component: () => import('@/views/cwj/aichat.vue'),
    meta: {
      title: '蔡文姬 AI 运营助手',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/purchase',
    name: 'purchasepage',
    component: () => import('@/views/cwj/purchasepage.vue'),
    props: true,
    meta: {
      title: '蔡文姬采购平台',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/shipping',
    name: 'shippingpage',
    component: () => import('@/views/cwj/shippingpage.vue'),
    meta: {
      title: '蔡文姬发货平台',
      favicon: '/favicon.ico',
    },
  },
  {
    path: '/receipt',
    name: 'receiptpage',
    component: () => import('@/views/cwj/receiptpage.vue'),
    props: true,
    meta: {
      title: '蔡文姬签收管理平台',
      favicon: '/favicon.ico',
    },
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      displayName: 'NotFound',
      render: () => h('div', { style: 'text-align: center; padding: 50px;' }, h('h1', '404 - 页面未找到'))
    },
  },
]

const router = createRouter({
  history: createWebHistory('/cwjgl/'),
  routes,
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '蔡文姬智能管理系统'
  next()
})

export default router
