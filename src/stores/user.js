import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const role = ref('')
  
  const isAuthenticated = computed(() => !!token.value)
  
  // 登录
  async function login(credentials) {
    const res = await api.login(credentials)
    token.value = res.token
    localStorage.setItem('token', res.token)
    await fetchUserInfo()
  }
  
  // 获取用户信息
  async function fetchUserInfo() {
    userInfo.value = await api.getUserInfo()
    role.value = userInfo.value.role
  }
  
  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }
  
  return { token, userInfo, role, isAuthenticated, login, logout, fetchUserInfo }
})