// route/index.js
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  // {
  //   path: '/',
  //   name: 'MeetingList',
  //   component: () => import('@/views/List.vue'),
  // },
  {
    path: '/create',
    name: 'MeetingCreate',
    component: () => import('@/views/Create.vue'),
  },
  {
    path: '/edit',
    name: 'MeetingEdit',
    component: () => import('@/views/Edit.vue'),
    props: true,
  },
  {
    path: '/form',
    name: 'Meetingform',
    component: () => import('@/views/form.vue'),
    props: true,
  },
  {
    path: '/',
    name: 'Meetinglist',
    component: () => import('@/views/Meeting_records.vue'),
    props: true,
  },
  // 添加 /admin 重定向到 / 的规则
  {
    path: '/admin',
    redirect: '/',
  },
  {
    path: '/adminedit',
    name: 'adminedit',
    component: () => import('@/views/Meeting_url.vue'),
    props: true,
  },
  {
    path: '/user/create',
    name: 'usercreate',
    component: () => import('@/views/Meeting_create.vue'),
    props: true,
  },
  // {
  //   path: '/meetings/:id',
  //   name: 'MeetingDetail',
  //   component: () => import('@/views/Detail.vue'),
  //   props: true,
  // },
]

const router = createRouter({
  history: createWebHistory('/meeting/'), // 自动适配base URL
  routes,
})

export default router
